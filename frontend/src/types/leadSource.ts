export type LeadSourceProviderId = 'geoapify' | 'osm' | 'overture' | 'google_places' | 'social_xray';

export interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

export interface RawLeadResult {
  external_id: string;
  business_name: string;
  address: string | null;
  phone: string | null;
  email?: string | null;
  website_url: string | null;
  latitude: number | null;
  longitude: number | null;
  category?: string;
  description?: string;
  social_links?: SocialLinks;
}

export interface SourceSearchParams {
  query: string;
  location: string;
}

export interface UnifiedSearchResult extends RawLeadResult {
  source: LeadSourceProviderId;
  has_website: boolean;
  category?: string;
  description?: string;
  social_links?: SocialLinks;
  geoapify_place_id?: string | null;
  google_place_id?: string | null;
  osm_type?: string | null;
  osm_id?: string | null;
  overture_id?: string | null;
  relevance_score?: number | null;
  relevance_status?: 'RELEVANT' | 'REJECTED' | string | null;
  relevance_reasons?: string[] | null;
  rejection_reasons?: string[] | null;
  entity_type?: 'BUSINESS' | 'PERSON' | 'EVENT' | 'ORGANIZATION' | 'INSTITUTION' | 'PLACE' | 'MEDIA' | 'ARTICLE' | 'PROGRAM' | 'UNKNOWN';
  qualification_level?: 'HOT' | 'HIGH' | 'POTENTIAL' | 'LOW' | 'REJECTED';
  website_status?: 'NOT_FOUND' | 'FOUND' | 'ACCESSIBLE' | 'INACCESSIBLE' | 'TIMEOUT' | 'BLOCKED' | 'UNVERIFIED' | 'AUDITED' | string;
  business_fit_score?: number | null;
  contactability_score?: number | null;
  website_opportunity_score?: number | null;
  lead_opportunity_score?: number | null;
  match_reason?: string | null;
  website_opportunity_reason?: string | null;
  decision_maker_name?: string | null;
  decision_maker_title?: string | null;
  website_issues?: string[] | null;
  positive_evidence?: string[] | null;
  negative_evidence?: string[] | null;
  matched_signals?: string[] | null;
  negative_signals?: string[] | null;
  identity_confidence?: number | null;
  evidence_confidence?: number | null;
  relevance_confidence?: number | null;
  social_handle?: string | null;
  whatsapp?: string | null;
  ai_reasoning?: string | null;
  ai_pitch_angles?: string[] | null;
  ai_website_strengths?: string[] | null;
  ai_website_issues?: string[] | null;
  is_ai_verified?: boolean | null;
  source_evidence?: {
    platform?: string;
    sourceUrl?: string;
    sourceQuery?: string;
    resultTitle?: string;
    snippet?: string;
  } | null;
}

export interface ProviderSearchResponse {
  results: RawLeadResult[];
  source: LeadSourceProviderId;
  is_mock?: boolean;
  error?: string;
}
