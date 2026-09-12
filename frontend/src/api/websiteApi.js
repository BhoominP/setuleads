import { apiClient } from './client';

export async function checkWebsite(url) {
  return apiClient('/websites/check', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}
