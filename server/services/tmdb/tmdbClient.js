const env = require('../../config/env');
const AppError = require('../../utils/appError');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const buildAuthHeaders = () => {
  if (env.tmdbBearerToken) return { Authorization: `Bearer ${env.tmdbBearerToken}`, accept: 'application/json' };
  if (env.tmdbApiKey) return { accept: 'application/json' };
  throw new AppError('TMDB credentials are not configured', 500, 'TMDB_NOT_CONFIGURED');
};

const tmdbGet = async (endpoint, query = {}) => {
  const params = new URLSearchParams(Object.entries(query).filter(([,v]) => v !== undefined && v !== null && v !== ''));
  if (env.tmdbApiKey && !env.tmdbBearerToken) params.set('api_key', env.tmdbApiKey);

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${params.toString()}`, {
    headers: buildAuthHeaders(),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new AppError('Provider request failed', 502, 'TMDB_REQUEST_FAILED');
  }

  return response.json();
};

module.exports = { tmdbGet };
