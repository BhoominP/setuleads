import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { searchBusinesses } from '@/api/discoveryApi';
import { createLead } from '@/api/leadsApi';
import type { UnifiedSearchResult } from '@/types/leadSource';
import type { HarvestConfig, HarvestStep, HarvestSummary } from '@/types/harvester';

function normalizeString(str: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function useAutoHarvester() {
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [currentStep, setCurrentStep] = useState<HarvestStep>({
    id: 'idle',
    label: 'Ready to start automated harvesting',
    progressPercent: 0,
  });
  const [summary, setSummary] = useState<HarvestSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  async function startHarvest(config: HarvestConfig) {
    setIsHarvesting(true);
    setError(null);
    setSummary(null);

    try {
      setCurrentStep({
        id: 'initializing',
        label: `Initializing search workers for ${config.location}...`,
        progressPercent: 15,
      });
      await new Promise((res) => setTimeout(res, 400));

      setCurrentStep({
        id: 'fetching',
        label: `Querying Geoapify & OSM across ${config.categories.length} categories...`,
        progressPercent: 35,
      });

      const fetchedResults: UnifiedSearchResult[] = [];

      for (const category of config.categories) {
        try {
          const res: any = await searchBusinesses({
            query: category,
            location: config.location,
            sources: ['GEOAPIFY', 'OPENSTREETMAP'],
          });

          if (res.candidates && Array.isArray(res.candidates)) {
            res.candidates.forEach((c: any) => {
              fetchedResults.push({
                external_id: c.id,
                business_name: c.businessName,
                address: c.address || '',
                phone: c.phone || '',
                email: c.email || null,
                website_url: c.websiteUrl || null,
                latitude: c.latitude,
                longitude: c.longitude,
                source: c.provider === 'GEOAPIFY' ? 'geoapify' : 'osm',
                has_website: Boolean(c.websiteUrl),
                category: c.categories ? c.categories.join(', ') : category,
                geoapify_place_id: c.geoapifyPlaceId,
                osm_type: c.osmType,
                osm_id: c.osmId,
              });
            });
          }
        } catch (err) {
          console.warn('Auto harvest category fetch failed', category, err);
        }
      }

      setCurrentStep({
        id: 'filtering',
        label: 'Deduplicating & applying target filters...',
        progressPercent: 60,
      });
      await new Promise((res) => setTimeout(res, 400));

      const dedupeMap = new Map<string, UnifiedSearchResult>();
      for (const item of fetchedResults) {
        const normKey = `${normalizeString(item.business_name)}_${normalizeString(item.address ? item.address.split(',')[0] : '')}`;
        if (!dedupeMap.has(normKey)) {
          dedupeMap.set(normKey, item);
        }
      }

      let candidates = Array.from(dedupeMap.values());

      if (config.onlyNoWebsite) {
        candidates = candidates.filter((c) => !c.has_website);
      }

      const targetLeads = candidates.slice(0, config.targetQuantity);

      if (targetLeads.length === 0) {
        throw new Error('No new leads matched your criteria. Try adjusting target category or filters.');
      }

      setCurrentStep({
        id: 'auditing',
        label: 'Saving target leads to Spring Boot backend...',
        progressPercent: 80,
      });

      let insertedCount = 0;
      for (const item of targetLeads) {
        try {
          await createLead({
            business_name: item.business_name,
            phone: item.phone,
            email: item.email,
            website_url: item.website_url,
            location: config.location,
            source: item.source as any,
            source_query: config.categories.join(', '),
            stage: 'new',
            website_notes: item.has_website
              ? `Auto-harvested via ${item.source === 'geoapify' ? 'Geoapify' : 'OpenStreetMap'}.`
              : 'No website found — Prime outreach prospect.',
            geoapify_place_id: item.geoapify_place_id,
            osm_type: item.osm_type,
            osm_id: item.osm_id,
          });
          insertedCount++;
        } catch (e) {
          console.warn('Failed to save harvested lead', item.business_name, e);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['leads'] });

      setCurrentStep({
        id: 'complete',
        label: 'Automated harvesting complete!',
        progressPercent: 100,
      });

      setSummary({
        totalDiscovered: fetchedResults.length,
        totalImported: insertedCount,
        noWebsiteCount: targetLeads.filter((l) => !l.has_website).length,
        auditedCount: 0,
        averageScore: null,
      });
    } catch (err: any) {
      setError(err?.message || 'Automated harvesting failed.');
      setCurrentStep({
        id: 'error',
        label: 'Harvesting failed.',
        progressPercent: 0,
      });
    } finally {
      setIsHarvesting(false);
    }
  }

  return { startHarvest, isHarvesting, currentStep, summary, error };
}
