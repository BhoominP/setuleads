import { apiClient } from './client';

export async function fetchLeads(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.stage) queryParams.append('stage', params.stage);
  if (params.source) queryParams.append('source', params.source);
  if (params.search) queryParams.append('search', params.search);
  if (params.minScore) queryParams.append('minScore', params.minScore);
  if (params.maxScore) queryParams.append('maxScore', params.maxScore);

  const queryString = queryParams.toString();
  const endpoint = `/leads${queryString ? `?${queryString}` : ''}`;
  return apiClient(endpoint);
}

export async function fetchLeadById(id) {
  return apiClient(`/leads/${id}`);
}

export async function createLead(leadData) {
  return apiClient('/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
}

export async function updateLead(id, leadData) {
  return apiClient(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(leadData),
  });
}

export async function updateLeadStage(id, stage) {
  return apiClient(`/leads/${id}/stage`, {
    method: 'POST',
    body: JSON.stringify({ stage }),
  });
}

export async function deleteLead(id) {
  return apiClient(`/leads/${id}`, {
    method: 'DELETE',
  });
}

export async function harvestPasteLeads(payload) {
  return apiClient('/leads/harvest-paste', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateOutreachEmail(candidateData) {
  return apiClient('/leads/generate-outreach', {
    method: 'POST',
    body: JSON.stringify(candidateData),
  });
}

