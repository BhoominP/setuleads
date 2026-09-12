export interface WebsiteAuditMetrics {
  load_time_ms: number | null;
  is_https: boolean;
  has_mobile_viewport: boolean;
  platform: string;
  has_meta_description: boolean;
  has_favicon: boolean;
  uses_legacy_jquery: boolean;
}

export interface WebsiteCheckDetails {
  score: number;
  metrics: WebsiteAuditMetrics;
  issues: string[];
  audited_at: string;
}

export interface AuditResult {
  score: number;
  details: WebsiteCheckDetails;
  issues: string[];
}
