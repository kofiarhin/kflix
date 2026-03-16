const User = require("../models/User");

const MAX_RECENTLY_VIEWED_ITEMS = 20;

const validationError = (res, field, message) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors: [{ field, message }],
  });
};

const sortRecentlyViewed = (items) => {
  return [...items].sort(
    (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
  );
};

const normalizeRecentlyViewedPayload = (payload = {}) => {
  return {
    tmdbId: Number(payload.tmdbId),
    mediaType: payload.mediaType,
    title: String(payload.title || "").trim(),
    posterPath: payload.posterPath ? String(payload.posterPath) : "",
    backdropPath: payload.backdropPath ? String(payload.backdropPath) : "",
    overview: payload.overview ? String(payload.overview) : "",
    releaseDate: payload.releaseDate ? String(payload.releaseDate) : "",
    voteAverage: Number(payload.voteAverage) || 0,
    viewedAt: new Date(),
  };
};

const getRecentlyViewed = async (req, res) => {
  const user = await User.findById(req.user._id).select("recentlyViewed");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  return res.status(200).json({
    success: true,
    data: sortRecentlyViewed(user.recentlyViewed || []),
    message: "OK",
  });
};

const recordRecentlyViewed = async (req, res) => {
  const { tmdbId, mediaType, title } = req.body;

  if (tmdbId === undefined || tmdbId === null || Number.isNaN(Number(tmdbId))) {
    return validationError(
      res,
      "tmdbId",
      "tmdbId is required and must be a number",
    );
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

  const normalizedItem = normalizeRecentlyViewedPayload(req.body);

  user.recentlyViewed = (user.recentlyViewed || []).filter(
    (item) =>
      !(
        item.tmdbId === normalizedItem.tmdbId &&
        item.mediaType === normalizedItem.mediaType
      ),
  );

  user.recentlyViewed.unshift(normalizedItem);
  user.recentlyViewed = sortRecentlyViewed(user.recentlyViewed).slice(
    0,
    MAX_RECENTLY_VIEWED_ITEMS,
  );

  await user.save();

  return res.status(200).json({
    success: true,
    data: user.recentlyViewed,
    message: "Recently viewed updated",
  });
};

module.exports = {
  getRecentlyViewed,
  recordRecentlyViewed,
};
