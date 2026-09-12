import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import type { Lead, LeadStage } from '@/types/lead';

export interface ExportFilterOptions {
  stage?: LeadStage | 'all';
  searchQuery?: string;
  sourceFilter?: string;
}

export async function exportLeadsToExcel(
  leads: Lead[],
  filters: ExportFilterOptions = {}
): Promise<{ fileName: string; count: number }> {
  if (!leads || leads.length === 0) {
    throw new Error('No leads available to export.');
  }

  // Map lead fields to clean human-readable Excel column headers
  const exportData = leads.map((lead) => ({
    ID: lead.id,
    'Business Name': lead.business_name,
    'Contact Person': lead.contact_name || '—',
    Email: lead.email || '—',
    Phone: lead.phone || '—',
    Website: lead.website_url || 'No Website',
    'Website Score': lead.website_score !== null && lead.website_score !== undefined ? lead.website_score : 'Unchecked',
    'Audit Issues / Notes': lead.website_notes || (lead.website_check_details?.issues ? lead.website_check_details.issues.join(' | ') : '—'),
    Source: lead.source ? lead.source.replace('_', ' ').toUpperCase() : 'MANUAL',
    'Source Query': lead.source_query || '—',
    Location: lead.location || '—',
    Stage: lead.stage ? lead.stage.toUpperCase() : 'NEW',
    'Est. Value (INR)': lead.estimated_value ? lead.estimated_value : 0,
    'General Notes': lead.general_notes || '—',
    'Created Date': lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—',
    'Last Contacted': lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : '—',
  }));

  // Create sheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for clean presentation
  const colWidths = [
    { wch: 36 }, // ID
    { wch: 28 }, // Business Name
    { wch: 20 }, // Contact Person
    { wch: 24 }, // Email
    { wch: 18 }, // Phone
    { wch: 30 }, // Website
    { wch: 14 }, // Website Score
    { wch: 45 }, // Audit Issues / Notes
    { wch: 16 }, // Source
    { wch: 20 }, // Source Query
    { wch: 22 }, // Location
    { wch: 14 }, // Stage
    { wch: 16 }, // Est Value
    { wch: 30 }, // General Notes
    { wch: 14 }, // Created Date
    { wch: 14 }, // Last Contacted
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Export');

  // Format timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `SetuLeads_Export_${timestamp}.xlsx`;

  // Write and trigger browser file download
  XLSX.writeFile(workbook, fileName);

  // Log export in Supabase export_logs table
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('export_logs').insert({
      exported_by: userData?.user?.id || null,
      filter_criteria: filters,
      record_count: leads.length,
    });
  } catch (err) {
    console.warn('Could not record export_log entry:', err);
  }

  return { fileName, count: leads.length };
}
