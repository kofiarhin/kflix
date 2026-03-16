const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const watchlistService = require('../services/watchlistService');

const getWatchlist = asyncHandler(async (req, res) => successResponse(res, { data: await watchlistService.getWatchlist(req.user._id) }));

const addToWatchlist = asyncHandler(async (req, res) => {
  const payload = {
    tmdbId: Number(req.body.tmdbId),
    mediaType: req.body.mediaType,
    title: String(req.body.title).trim(),
    posterPath: req.body.posterPath || '',
    backdropPath: req.body.backdropPath || '',
    overview: req.body.overview || '',
    releaseDate: req.body.releaseDate || '',
    voteAverage: Number(req.body.voteAverage) || 0,
  };
  const data = await watchlistService.addToWatchlist(req.user._id, payload);
  return successResponse(res, { statusCode: 201, message: 'Added to watchlist', data });
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
  const data = await watchlistService.removeFromWatchlist(req.user._id, Number(req.params.tmdbId), req.params.mediaType);
  return successResponse(res, { message: 'Removed from watchlist', data });
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
