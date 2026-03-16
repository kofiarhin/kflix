const User = require("../models/User");

const VALID_CONTENT_TYPES = new Set(["movie", "tv", "both"]);
const VALID_DISCOVERY_STYLES = new Set(["popular", "top_rated", "new"]);

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
  contentType: "both",
  discoveryStyle: "popular",
};

const validationError = (res, field, message) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors: [{ field, message }],
  });
};

const sanitizeFavoriteGenres = (favoriteGenres) => {
  const numericGenres = favoriteGenres
    .map((genreId) => Number(genreId))
    .filter((genreId) => Number.isInteger(genreId) && genreId > 0);

  return [...new Set(numericGenres)];
};

const normalizePreferences = (preferences) => {
  if (!preferences) {
    return DEFAULT_PREFERENCES;
  }

  return {
    favoriteGenres: Array.isArray(preferences.favoriteGenres)
      ? sanitizeFavoriteGenres(preferences.favoriteGenres)
      : [],
    contentType: VALID_CONTENT_TYPES.has(preferences.contentType)
      ? preferences.contentType
      : DEFAULT_PREFERENCES.contentType,
    discoveryStyle: VALID_DISCOVERY_STYLES.has(preferences.discoveryStyle)
      ? preferences.discoveryStyle
      : DEFAULT_PREFERENCES.discoveryStyle,
  };
};

const getPreferences = async (req, res) => {
  const user = await User.findById(req.user._id).select("preferences");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  return res.status(200).json({
    success: true,
    data: normalizePreferences(user.preferences),
    message: "OK",
  });
};

const updatePreferences = async (req, res) => {
  const { favoriteGenres, contentType, discoveryStyle } = req.body;

  if (!Array.isArray(favoriteGenres)) {
    return validationError(
      res,
      "favoriteGenres",
      "favoriteGenres must be an array of numbers",
    );
  }

  if (!VALID_CONTENT_TYPES.has(contentType)) {
    return validationError(
      res,
      "contentType",
      "contentType must be one of movie, tv, or both",
    );
  }

  if (!VALID_DISCOVERY_STYLES.has(discoveryStyle)) {
    return validationError(
      res,
      "discoveryStyle",
      "discoveryStyle must be one of popular, top_rated, or new",
    );
  }

  const sanitizedGenres = sanitizeFavoriteGenres(favoriteGenres);

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  user.preferences = {
    ...(user.preferences || {}),
    favoriteGenres: sanitizedGenres,
    contentType,
    discoveryStyle,
  };

  await user.save();

  return res.status(200).json({
    success: true,
    data: normalizePreferences(user.preferences),
    message: "Preferences updated successfully",
  });
};

module.exports = {
  getPreferences,
  updatePreferences,
};
