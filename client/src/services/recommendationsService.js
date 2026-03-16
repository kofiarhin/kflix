import { apiClient } from '../lib/apiClient';

export const recommendationsService = {
  getForYou: () => apiClient('/api/recommendations/for-you'),
};
