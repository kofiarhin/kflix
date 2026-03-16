const { getHomeFeed } = require('./tmdb/tmdbDiscoverService');
const { browseMovies, getMovieDetails } = require('./tmdb/tmdbMoviesService');
const { browseSeries, getSeriesDetails } = require('./tmdb/tmdbSeriesService');

module.exports = { getHomeFeed, browseMovies, browseSeries, getMovieDetails, getSeriesDetails };
