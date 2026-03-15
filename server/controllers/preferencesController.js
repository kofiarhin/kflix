const User = require("../models/User");

const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
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
  const { favoriteGenres } = req.body;

  if (!Array.isArray(favoriteGenres)) {
    return validationError(
      res,
      "favoriteGenres",
      "favoriteGenres must be an array of numbers",
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
