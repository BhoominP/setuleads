import type { Activity } from './activity';
import type { WebsiteCheckDetails } from './websiteCheck';
import type { SocialLinks } from './leadSource';

export type LeadSource =
  | 'geoapify'
  | 'osm'
  | 'overture'
  | 'google_places'
  | 'social_xray'
  | 'web_dork'
  | 'manual'
  | 'referral'
  | 'telegram'
  | 'internshala'
  | 'inbound_form'
  | 'other';

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'replied'
  | 'negotiating'
  | 'won'
  | 'lost';

export interface LeadTag {
  id: string;
  name: string;
  color?: string;
}

export interface Lead {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  source: LeadSource;
  source_query: string | null;
  location: string | null;
  stage: LeadStage;
  estimated_value: number | null;
  website_notes: string | null;
  general_notes: string | null;
  website_score: number | null;
  website_check_details?: WebsiteCheckDetails | null;
  created_at: string;
  updated_at: string;
  last_contacted_at: string | null;
  tags?: LeadTag[];
  activities?: Activity[];
  social_links?: SocialLinks | null;
  geoapify_place_id?: string | null;
  google_place_id?: string | null;
  osm_type?: string | null;
  osm_id?: string | null;
  overture_id?: string | null;
  discovery_area?: string | null;
}

export interface CreateLeadPayload {
  business_name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  source?: LeadSource;
  source_query?: string | null;
  location?: string | null;
  stage?: LeadStage;
  estimated_value?: number | null;
  website_notes?: string | null;
  general_notes?: string | null;
  social_links?: SocialLinks | null;
  geoapify_place_id?: string | null;
  google_place_id?: string | null;
  osm_type?: string | null;
  osm_id?: string | null;
  overture_id?: string | null;
  discovery_area?: string | null;
}