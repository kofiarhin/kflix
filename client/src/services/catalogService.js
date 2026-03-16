import { apiClient } from '../lib/apiClient';

const qp = (params) => new URLSearchParams(Object.entries(params).filter(([,v])=>v!==''&&v!==undefined&&v!==null)).toString();

export const catalogService = {
  getHome: () => apiClient('/api/catalog/home'),
  browseMovies: (params) => apiClient(`/api/catalog/movies?${qp(params)}`),
  browseSeries: (params) => apiClient(`/api/catalog/series?${qp(params)}`),
  movieDetails: (id) => apiClient(`/api/catalog/movies/${id}`),
  seriesDetails: (id) => apiClient(`/api/catalog/series/${id}`),
};
