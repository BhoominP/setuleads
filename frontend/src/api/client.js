let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');

if (!rawBaseUrl.endsWith('/api/v1')) {
  rawBaseUrl = `${rawBaseUrl}/api/v1`;
}

const API_BASE_URL = rawBaseUrl;

export async function apiClient(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 60000);

  const config = {
    ...options,
    headers,
    signal: options.signal || controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || 'An error occurred' };
      }
      const error = new Error(errorData.message || 'API Request failed');
      error.status = response.status;
      error.errorData = errorData;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.blob();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('API Request timed out after 60 seconds');
    }
    throw err;
  }
}
