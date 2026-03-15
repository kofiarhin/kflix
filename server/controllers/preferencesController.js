const User = require("../models/User");

const ALLOWED_CONTENT_TYPES = ["movie", "tv", "both"];
const ALLOWED_DISCOVERY_STYLES = ["popular", "top_rated", "new"];

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
      ? preferences.favoriteGenres
      : [],
    contentType: preferences.contentType || "both",
    discoveryStyle: preferences.discoveryStyle || "popular",
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

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return validationError(
      res,
      "contentType",
      "contentType must be one of movie, tv, or both",
    );
  }

  if (!ALLOWED_DISCOVERY_STYLES.includes(discoveryStyle)) {
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
