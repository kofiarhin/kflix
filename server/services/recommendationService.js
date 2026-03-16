const { tmdbGet } = require('./tmdb/tmdbClient');
const { normalizePreferences } = require('./preferencesService');

const MOVIE_GENRE_IDS = new Set([28,12,16,35,80,99,18,10751,14,36,27,10402,9648,10749,878,10770,53,10752,37]);
const TV_GENRE_IDS = new Set([10759,16,35,80,99,18,10751,9648,10762,10763,10764,10765,10766,10767,10768]);

const getSortBy = (style, mediaType) => style === 'top_rated' ? 'vote_average.desc' : style === 'new' ? (mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc') : 'popularity.desc';

const getForYouRecommendations = async (preferences) => {
  const normalized = normalizePreferences(preferences);
  const selectedGenres = normalized.favoriteGenres;
  if (!selectedGenres.length) return { items: [], preferencesConfigured: false, preferences: normalized };

  const movieGenres = (normalized.contentType !== 'tv') ? selectedGenres.filter((id)=>MOVIE_GENRE_IDS.has(id)) : [];
  const tvGenres = (normalized.contentType !== 'movie') ? selectedGenres.filter((id)=>TV_GENRE_IDS.has(id)) : [];

  const requests = [
    ...movieGenres.map((genre)=>tmdbGet('/discover/movie',{language:'en-US',include_adult:false,sort_by:getSortBy(normalized.discoveryStyle,'movie'),page:1,with_genres:genre})),
    ...tvGenres.map((genre)=>tmdbGet('/discover/tv',{language:'en-US',include_adult:false,sort_by:getSortBy(normalized.discoveryStyle,'tv'),page:1,with_genres:genre})),
  ];

  const responses = await Promise.all(requests);
  const items = responses.flatMap((r)=>Array.isArray(r.results)?r.results:[]).slice(0,40);
  return { items, preferencesConfigured: true, preferences: normalized };
};

module.exports = { getForYouRecommendations };
