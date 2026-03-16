import { apiClient } from '../lib/apiClient';

export const preferencesService = {
  getPreferences: () => apiClient('/api/preferences'),
  updatePreferences: (payload) => apiClient('/api/preferences', { method: 'PUT', body: JSON.stringify(payload) }),
};
