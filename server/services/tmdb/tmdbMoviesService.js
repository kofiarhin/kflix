const { tmdbGet } = require('./tmdbClient');

const browseMovies = async (query) => {
  const { page = 1, genre, year, rating, sortBy = 'popularity.desc', search = '' } = query;
  if (search) {
    return tmdbGet('/search/movie', { query: search, language: 'en-US', page });
  }
  return tmdbGet('/discover/movie', {
    language: 'en-US', page, sort_by: sortBy,
    with_genres: genre, primary_release_year: year, 'vote_average.gte': rating,
  });
};

const getMovieDetails = async (id) => tmdbGet(`/movie/${id}`, {
  language: 'en-US', append_to_response: 'videos,similar,recommendations,reviews,watch/providers',
});

module.exports = { browseMovies, getMovieDetails };
