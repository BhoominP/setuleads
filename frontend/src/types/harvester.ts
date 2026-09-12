import type { LeadSourceProviderId } from './leadSource';

export interface HarvestCategoryPreset {
  id: string;
  label: string;
  query: string;
}

export interface HarvestConfig {
  location: string;
  categories: string[];
  targetQuantity: number;
  sources: LeadSourceProviderId[];
  onlyNoWebsite: boolean;
  autoAuditWebsites: boolean;
}

export type HarvestStepId =
  | 'idle'
  | 'initializing'
  | 'fetching'
  | 'filtering'
  | 'auditing'
  | 'saving'
  | 'complete'
  | 'error';

export interface HarvestStep {
  id: HarvestStepId;
  label: string;
  progressPercent: number;
}

export interface HarvestSummary {
  totalDiscovered: number;
  totalImported: number;
  noWebsiteCount: number;
  auditedCount: number;
  averageScore: number | null;
}
