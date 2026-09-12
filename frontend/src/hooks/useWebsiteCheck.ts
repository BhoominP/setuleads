import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkWebsite } from '@/api/websiteApi';
import { updateLead } from '@/api/leadsApi';
import { createActivity } from '@/api/activitiesApi';
import type { Lead } from '@/types/lead';

export function useWebsiteCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Lead) => {
      if (!lead.website_url) {
        throw new Error('Lead has no website URL to inspect');
      }

      const res: any = await checkWebsite(lead.website_url);

      const websiteNotes = res.issues && res.issues.length > 0
        ? res.issues.slice(0, 3).join(' | ')
        : 'Audit complete — site meets standard heuristics.';

      const checkDetails = {
        score: res.score,
        issues: res.issues || [],
        audited_at: new Date().toISOString(),
        metrics: {
          load_time_ms: res.responseTimeMs ?? null,
          is_https: res.isHttps ?? res.https ?? false,
          has_mobile_viewport: res.hasMobileViewport ?? res.has_mobile_viewport ?? false,
          has_meta_description: res.hasMetaDescription ?? res.has_meta_description ?? false,
          platform: res.platform || 'Custom Web',
          has_favicon: true,
          uses_legacy_jquery: false,
        },
      };

      let updatedLead: Lead = {
        ...lead,
        website_score: res.score,
        website_notes: websiteNotes,
        website_check_details: checkDetails,
      };

      try {
        await updateLead(lead.id, {
          businessName: lead.business_name,
          contactName: lead.contact_name,
          email: lead.email,
          phone: lead.phone,
          websiteUrl: lead.website_url,
          source: lead.source ? lead.source.toUpperCase() : 'MANUAL',
          sourceQuery: lead.source_query,
          location: lead.location,
          stage: lead.stage ? lead.stage.toUpperCase() : 'NEW',
          websiteScore: res.score,
          websiteNotes: websiteNotes,
          geoapifyPlaceId: lead.geoapify_place_id,
          googlePlaceId: lead.google_place_id,
          osmType: lead.osm_type,
          osmId: lead.osm_id,
          overtureId: lead.overture_id,
          discoveryArea: lead.discovery_area,
        });

        await createActivity(lead.id, {
          type: 'NOTE',
          description: `Ran Spring Boot website audit: scored ${res.score}/100. Issues: ${res.issues?.join(', ') || 'None'}`,
        });
      } catch (err) {
        console.warn('Failed to update lead audit in Spring Boot backend', err);
      }

      return {
        lead: updatedLead,
        auditResult: {
          score: res.score,
          issues: res.issues || [],
          details: checkDetails,
        },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
