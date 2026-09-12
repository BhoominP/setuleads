import { apiClient } from './client';

export async function searchBusinesses({ query, location, sources }) {
  return apiClient('/discovery/search', {
    method: 'POST',
    timeout: 60000,
    body: JSON.stringify({
      query,
      location,
      sources,
    }),
  });
}
