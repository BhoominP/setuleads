import { apiClient } from './client';

export async function fetchActivities(leadId) {
  return apiClient(`/leads/${leadId}/activities`);
}

export async function createActivity(leadId, { type, description }) {
  return apiClient(`/leads/${leadId}/activities`, {
    method: 'POST',
    body: JSON.stringify({ type, description }),
  });
}
