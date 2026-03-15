const User = require("../models/User");

const validationError = (res, field, message) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors: [{ field, message }],
  });
};

const sortWatchlist = (items) => {
  return [...items].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
};

const getWatchlist = async (req, res) => {
  const user = await User.findById(req.user._id).select("watchlist");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  return res.status(200).json({
    success: true,
    data: sortWatchlist(user.watchlist || []),
    message: "OK",
  });
};

const addToWatchlist = async (req, res) => {
  const { tmdbId, mediaType, title } = req.body;

  if (tmdbId === undefined || tmdbId === null || Number.isNaN(Number(tmdbId))) {
    return validationError(res, "tmdbId", "tmdbId is required and must be a number");
  }

  if (!mediaType) {
    return validationError(res, "mediaType", "mediaType is required");
  }

  if (!["movie", "tv"].includes(mediaType)) {
    return validationError(res, "mediaType", "mediaType must be movie or tv");
  }

  if (!title || !String(title).trim()) {
    return validationError(res, "title", "title is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  const normalizedTmdbId = Number(tmdbId);
  const exists = user.watchlist.some(
    (item) => item.tmdbId === normalizedTmdbId && item.mediaType === mediaType,
  );

  if (exists) {
    return res.status(409).json({
      success: false,
      message: "Item already exists in watchlist",
      code: "WATCHLIST_ITEM_EXISTS",
    });
  }

  const watchlistItem = {
    tmdbId: normalizedTmdbId,
    mediaType,
    title: String(title).trim(),
    posterPath: req.body.posterPath ? String(req.body.posterPath) : "",
    backdropPath: req.body.backdropPath ? String(req.body.backdropPath) : "",
    overview: req.body.overview ? String(req.body.overview) : "",
    releaseDate: req.body.releaseDate ? String(req.body.releaseDate) : "",
    voteAverage: Number(req.body.voteAverage) || 0,
    savedAt: new Date(),
  };

  user.watchlist.push(watchlistItem);
  await user.save();

  return res.status(201).json({
    success: true,
    data: {
      item: watchlistItem,
      watchlist: sortWatchlist(user.watchlist),
    },
    message: "Added to watchlist",
  });
};

const removeFromWatchlist = async (req, res) => {
  const { mediaType, tmdbId } = req.params;

  if (!mediaType) {
    return validationError(res, "mediaType", "mediaType is required");
  }

  if (!["movie", "tv"].includes(mediaType)) {
    return validationError(res, "mediaType", "mediaType must be movie or tv");
  }

  if (tmdbId === undefined || tmdbId === null || Number.isNaN(Number(tmdbId))) {
    return validationError(res, "tmdbId", "tmdbId is required and must be a number");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  const normalizedTmdbId = Number(tmdbId);
  const previousLength = user.watchlist.length;

  user.watchlist = user.watchlist.filter(
    (item) => !(item.tmdbId === normalizedTmdbId && item.mediaType === mediaType),
  );

  if (user.watchlist.length === previousLength) {
    return res.status(404).json({
      success: false,
      message: "Watchlist item not found",
      code: "WATCHLIST_ITEM_NOT_FOUND",
    });
  }

  await user.save();

  return res.status(200).json({
    success: true,
    data: sortWatchlist(user.watchlist),
    message: "Removed from watchlist",
  });
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
