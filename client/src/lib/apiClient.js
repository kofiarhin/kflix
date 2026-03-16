const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiClient(endpoint, options = {}) {
  const isFormDataBody = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed');
    error.code = payload.code;
    error.errors = payload.errors;
    throw error;
  }

  return payload;
}

export const getApiBaseUrl = () => API_URL;
