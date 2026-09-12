import { useState } from 'react';
import { exportLeadsToExcel } from '@/lib/exportToExcel';
import type { Lead, LeadStage } from '@/types/lead';

export interface ExportFilterOptions {
  stage?: LeadStage | 'all';
  source?: string;
  searchQuery?: string;
  minScore?: number;
  maxScore?: number;
}

export function useExportLeads() {
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ fileName: string; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function triggerExport(leads: Lead[] = [], filters: ExportFilterOptions = {}) {
    setExporting(true);
    setError(null);
    try {
      if (!leads || leads.length === 0) {
        throw new Error('No leads available to export.');
      }
      const result = await exportLeadsToExcel(leads, filters);
      setLastExport(result);
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Failed to export leads to Excel.';
      setError(msg);
      throw err;
    } finally {
      setExporting(false);
    }
  }

  return { triggerExport, exporting, lastExport, error };
}
