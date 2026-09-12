import { apiClient } from './client';

export async function exportLeadsToExcel(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.stage) queryParams.append('stage', params.stage);
  if (params.source) queryParams.append('source', params.source);
  if (params.search) queryParams.append('search', params.search);
  if (params.minScore) queryParams.append('minScore', params.minScore);
  if (params.maxScore) queryParams.append('maxScore', params.maxScore);

  const queryString = queryParams.toString();
  const endpoint = `/leads/export${queryString ? `?${queryString}` : ''}`;
  const blob = await apiClient(endpoint);

  // Trigger browser download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'setuleads_export.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
