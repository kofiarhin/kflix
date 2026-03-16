const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const catalogService = require('../services/catalogService');

const homeFeed = asyncHandler(async (req, res) => successResponse(res, { data: await catalogService.getHomeFeed() }));
const browseMovies = asyncHandler(async (req, res) => successResponse(res, { data: await catalogService.browseMovies(req.query) }));
const browseSeries = asyncHandler(async (req, res) => successResponse(res, { data: await catalogService.browseSeries(req.query) }));
const movieDetails = asyncHandler(async (req, res) => successResponse(res, { data: await catalogService.getMovieDetails(req.params.id) }));
const seriesDetails = asyncHandler(async (req, res) => successResponse(res, { data: await catalogService.getSeriesDetails(req.params.id) }));

module.exports = { homeFeed, browseMovies, browseSeries, movieDetails, seriesDetails };
