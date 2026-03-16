import { apiClient } from '../lib/apiClient';

export const watchlistService = {
  getWatchlist: () => apiClient('/api/watchlist'),
  addToWatchlist: (payload) => apiClient('/api/watchlist', { method: 'POST', body: JSON.stringify(payload) }),
  removeFromWatchlist: (tmdbId, mediaType) => apiClient(`/api/watchlist/${mediaType}/${tmdbId}`, { method: 'DELETE' }),
};
