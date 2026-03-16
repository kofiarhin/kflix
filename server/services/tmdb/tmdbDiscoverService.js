const { tmdbGet } = require('./tmdbClient');

const getHomeFeed = async () => {
  const [trending, popularMovies, trendingMovies, popularSeries, trendingSeries] = await Promise.all([
    tmdbGet('/trending/all/week'),
    tmdbGet('/movie/popular', { language: 'en-US', page: 1 }),
    tmdbGet('/trending/movie/week'),
    tmdbGet('/tv/popular', { language: 'en-US', page: 1 }),
    tmdbGet('/trending/tv/week'),
  ]);

  return { trending, popularMovies, trendingMovies, popularSeries, trendingSeries };
};

module.exports = { getHomeFeed };
