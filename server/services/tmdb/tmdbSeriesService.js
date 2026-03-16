const { tmdbGet } = require('./tmdbClient');

const browseSeries = async (query) => {
  const { page = 1, genre, year, rating, sortBy = 'popularity.desc', search = '' } = query;
  if (search) {
    return tmdbGet('/search/tv', { query: search, language: 'en-US', page });
  }
  return tmdbGet('/discover/tv', {
    language: 'en-US', page, sort_by: sortBy,
    with_genres: genre, first_air_date_year: year, 'vote_average.gte': rating,
  });
};

const getSeriesDetails = async (id) => tmdbGet(`/tv/${id}`, {
  language: 'en-US', append_to_response: 'videos,similar,recommendations,reviews,watch/providers,credits,content_ratings',
});

module.exports = { browseSeries, getSeriesDetails };
