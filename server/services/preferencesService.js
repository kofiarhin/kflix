const User = require('../models/User');
const AppError = require('../utils/appError');

const DEFAULT_PREFERENCES = { favoriteGenres: [], contentType: 'both', discoveryStyle: 'popular' };

const sanitizeFavoriteGenres = (favoriteGenres = []) => {
  const numericGenres = favoriteGenres.map(Number).filter((genreId) => Number.isInteger(genreId) && genreId > 0);
  return [...new Set(numericGenres)];
};

const normalizePreferences = (preferences) => ({
  favoriteGenres: sanitizeFavoriteGenres(preferences?.favoriteGenres),
  contentType: preferences?.contentType || DEFAULT_PREFERENCES.contentType,
  discoveryStyle: preferences?.discoveryStyle || DEFAULT_PREFERENCES.discoveryStyle,
});

const getPreferences = async (userId) => {
  const user = await User.findById(userId).select('preferences');
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  return normalizePreferences(user.preferences);
};

const updatePreferences = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  user.preferences = {
    ...(user.preferences || {}),
    ...payload,
    favoriteGenres: sanitizeFavoriteGenres(payload.favoriteGenres),
  };
  await user.save();
  return normalizePreferences(user.preferences);
};

module.exports = { getPreferences, updatePreferences, normalizePreferences };
