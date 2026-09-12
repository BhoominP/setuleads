import { useState } from 'react';
import { searchBusinesses } from '@/api/discoveryApi';
import type { LeadSourceProviderId, UnifiedSearchResult } from '@/types/leadSource';
import type { DeduplicationReport } from '@/lib/deduplicationEngine';

export interface SearchCoverageStats {
  queriesCount: number;
  expandedQueries: string[];
  cellsCount: number;
  geoapifyRequestsCount: number;
  osmScansCount: number;
  overtureQueriesCount: number;
}

export interface EngineDiagnostics {
  geoapifyRequests: number;
  geoapifyRaw: number;
  geoapifyCandidatesParsed: number;
  osmPasses: number;
  osmElementsRaw: number;
  osmCandidatesParsed: number;
  overtureQueries: number;
  overtureRaw: number;
  deduplicationBefore: number;
  deduplicationAfter: number;
}

export interface DiscoveryEngineState {
  isSearching: boolean;
  stepMessage: string;
  report: DeduplicationReport | null;
  coverage: SearchCoverageStats | null;
  diagnostics: EngineDiagnostics | null;
  providerStatus: {
    geoapify: 'idle' | 'searching' | 'completed' | 'failed';
    osm: 'idle' | 'searching' | 'completed' | 'failed';
    overture: 'idle' | 'searching' | 'completed' | 'failed' | 'disabled';
    geoapifyMessage?: string;
    osmMessage?: string;
    overtureMessage?: string;
  };
}

export function useMultiSourceSearch() {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [rejectedResults, setRejectedResults] = useState<UnifiedSearchResult[]>([]);
  const [engineState, setEngineState] = useState<DiscoveryEngineState>({
    isSearching: false,
    stepMessage: '',
    report: null,
    coverage: null,
    diagnostics: null,
    providerStatus: { geoapify: 'idle', osm: 'idle', overture: 'disabled' },
  });
  const [error, setError] = useState<string | null>(null);

  async function search(
    category: string,
    location: string,
    providers: LeadSourceProviderId[] = ['geoapify', 'osm', 'social_xray']
  ) {
    if (!category.trim() || !location.trim()) return;

    setResults([]);
    setRejectedResults([]);
    setError(null);

    setEngineState({
      isSearching: true,
      stepMessage: `Searching Spring Boot Discovery Engine for "${category}" in ${location}...`,
      report: null,
      coverage: null,
      diagnostics: null,
      providerStatus: {
        geoapify: providers.includes('geoapify') || providers.includes('google_places') ? 'searching' : 'idle',
        osm: providers.includes('osm') ? 'searching' : 'idle',
        overture: providers.includes('overture') ? 'searching' : 'disabled',
      },
    });

    try {
      const sources: string[] = [];
      if (providers.includes('geoapify') || providers.includes('google_places')) sources.push('GEOAPIFY');
      if (providers.includes('osm')) sources.push('OPENSTREETMAP');
      if (providers.includes('overture')) sources.push('OVERTURE');
      if (providers.includes('social_xray')) sources.push('SOCIAL_XRAY');

      const response: any = await searchBusinesses({
        query: category,
        location,
        sources,
      });

      const candidates = response.candidates || [];
      const metrics = response.metrics || {};

      const mappedAll: UnifiedSearchResult[] = candidates.map((c: any) => {
        const provLower = (c.provider || '').toLowerCase();
        let mappedSource: LeadSourceProviderId = 'geoapify';
        if (provLower.includes('social')) mappedSource = 'social_xray';
        else if (provLower.includes('osm') || provLower.includes('openstreet')) mappedSource = 'osm';
        else if (provLower.includes('overture')) mappedSource = 'overture';
        else if (provLower.includes('geo')) mappedSource = 'geoapify';

        return {
          external_id: c.id,
          geoapify_place_id: c.geoapifyPlaceId,
          google_place_id: c.googlePlaceId,
          osm_type: c.osmType,
          osm_id: c.osmId,
          overture_id: c.overtureId,
          business_name: c.businessName,
          address: c.address || '',
          phone: c.phone || '',
          email: c.email || null,
          website_url: c.websiteUrl || null,
          latitude: c.latitude,
          longitude: c.longitude,
          source: mappedSource,
          has_website: Boolean(c.websiteUrl),
          category: c.categories ? c.categories.join(', ') : `Matched: ${category}`,
          source_query: c.sourceQuery || category,
          discovery_area: c.areaName || location,
          relevance_score: c.relevanceScore != null ? c.relevanceScore : 1.0,
          relevance_status: c.relevanceStatus || 'RELEVANT',
          relevance_reasons: c.relevanceReasons || [],
          rejection_reasons: c.rejectionReasons || [],
          entity_type: c.entityType || 'BUSINESS',
          qualification_level: c.qualificationLevel || 'HIGH',
          website_status: c.websiteStatus || (c.websiteUrl ? 'FOUND' : 'NOT_FOUND'),
          business_fit_score: c.businessFitScore != null ? c.businessFitScore : 85,
          contactability_score: c.contactabilityScore != null ? c.contactabilityScore : 50,
          website_opportunity_score: c.websiteOpportunityScore != null ? c.websiteOpportunityScore : 70,
          lead_opportunity_score: c.leadOpportunityScore != null ? c.leadOpportunityScore : 80,
          match_reason: c.matchReason || null,
          website_opportunity_reason: c.websiteOpportunityReason || null,
          decision_maker_name: c.decisionMakerName || null,
          decision_maker_title: c.decisionMakerTitle || null,
          website_issues: c.websiteIssues || [],
          positive_evidence: c.positiveEvidence || [],
          negative_evidence: c.negativeEvidence || [],
          identity_confidence: c.identityConfidence ? Math.round(c.identityConfidence * 100) : 90,
          evidence_confidence: c.evidenceConfidence ? Math.round(c.evidenceConfidence * 100) : 85,
          source_evidence: c.sourceEvidence || null,
          social_handle: c.socialHandle || null,
          whatsapp: c.whatsapp || null,
          ai_reasoning: c.aiReasoning || null,
          ai_pitch_angles: c.aiPitchAngles || [],
          ai_website_strengths: c.aiWebsiteStrengths || [],
          ai_website_issues: c.aiWebsiteIssues || [],
          is_ai_verified: Boolean(c.isAiVerified),
        };
      });

      const relevantList = mappedAll.filter((r) => r.relevance_status === 'RELEVANT');
      const rejectedList = mappedAll.filter((r) => r.relevance_status === 'REJECTED');

      const report: DeduplicationReport = {
        rawCount: metrics.rawCandidates || 0,
        geoapifyCount: metrics.geoapifyCandidates || metrics.googleCandidates || 0,
        googleCount: 0,
        osmCount: metrics.osmCandidates || 0,
        overtureCount: metrics.overtureCandidates || 0,
        socialXrayCount: metrics.socialXrayCandidates || 0,
        uniqueCount: metrics.uniqueBusinesses || mappedAll.length,
        relevantCount: metrics.relevantCandidates || relevantList.length,
        rejectedCount: metrics.rejectedCandidates || rejectedList.length,
        crossSourceMatchesCount: metrics.crossSourceMatches || 0,
        noWebsiteCount: relevantList.filter((r) => !r.has_website).length,
        withWebsiteCount: relevantList.filter((r) => r.has_website).length,
      };

      const coverageStats: SearchCoverageStats = {
        queriesCount: metrics.queriesExecuted || 1,
        expandedQueries: metrics.expandedTerms || [category],
        cellsCount: metrics.subAreas || 1,
        geoapifyRequestsCount: metrics.geoapifyRequests || 0,
        osmScansCount: metrics.osmPasses || 0,
        overtureQueriesCount: metrics.overtureQueries || 0,
      };

      const diagnostics: EngineDiagnostics = {
        geoapifyRequests: metrics.geoapifyRequests || 0,
        geoapifyRaw: metrics.geoapifyCandidates || 0,
        geoapifyCandidatesParsed: metrics.geoapifyCandidates || 0,
        osmPasses: metrics.osmPasses || 0,
        osmElementsRaw: metrics.osmCandidates || 0,
        osmCandidatesParsed: metrics.osmCandidates || 0,
        overtureQueries: metrics.overtureQueries || 0,
        overtureRaw: metrics.overtureCandidates || 0,
        deduplicationBefore: metrics.rawCandidates || 0,
        deduplicationAfter: metrics.uniqueBusinesses || 0,
      };

      const geoapifyStatus = metrics.geoapifyStatus && (metrics.geoapifyStatus.startsWith('HTTP_ERROR') || metrics.geoapifyStatus.startsWith('ERROR')) ? 'failed' : 'completed';
      const osmStatus = metrics.osmStatus && (metrics.osmStatus.startsWith('HTTP_ERROR') || metrics.osmStatus.startsWith('ERROR') || metrics.osmStatus.startsWith('OVERPASS')) ? 'failed' : 'completed';
      const overtureStatus = metrics.overtureStatus || 'disabled';

      setResults(relevantList);
      setRejectedResults(rejectedList);

      setEngineState({
        isSearching: false,
        stepMessage: `Discovery completed. Discovered ${report.relevantCount} relevant businesses (${report.rawCount} raw, ${report.uniqueCount} unique, ${report.rejectedCount} rejected).`,
        report,
        coverage: coverageStats,
        diagnostics,
        providerStatus: {
          geoapify: geoapifyStatus,
          osm: osmStatus,
          overture: overtureStatus as any,
          geoapifyMessage: metrics.geoapifyStatus,
          osmMessage: metrics.osmStatus,
          overtureMessage: metrics.overtureStatus,
        },
      });

      if (relevantList.length === 0 && (metrics.geoapifyStatus?.startsWith('HTTP_ERROR') || metrics.osmStatus?.startsWith('HTTP_ERROR'))) {
        setError(`Discovery warning: Geoapify: ${metrics.geoapifyStatus}, OSM: ${metrics.osmStatus}`);
      }

    } catch (err: any) {
      console.error('Spring Boot discovery error:', err);
      setError(err?.message || 'Failed to connect to Spring Boot backend');
      setEngineState({
        isSearching: false,
        stepMessage: 'Discovery failed: ' + (err?.message || 'Spring Boot API error'),
        report: null,
        coverage: null,
        diagnostics: null,
        providerStatus: { geoapify: 'failed', osm: 'failed', overture: 'disabled', geoapifyMessage: err?.message, osmMessage: err?.message },
      });
    }
  }

  return {
    results,
    rejectedResults,
    loading: engineState.isSearching,
    engineState,
    error,
    search,
  };
}
