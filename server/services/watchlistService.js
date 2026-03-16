const User = require('../models/User');
const AppError = require('../utils/appError');

const sortWatchlist = (items) => [...items].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

const getWatchlist = async (userId) => {
  const user = await User.findById(userId).select('watchlist');
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  return sortWatchlist(user.watchlist || []);
};

const addToWatchlist = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const exists = user.watchlist.some((item) => item.tmdbId === payload.tmdbId && item.mediaType === payload.mediaType);
  if (exists) throw new AppError('Item already exists in watchlist', 409, 'WATCHLIST_ITEM_EXISTS');

  const watchlistItem = { ...payload, savedAt: new Date() };
  user.watchlist.push(watchlistItem);
  await user.save();
  return { item: watchlistItem, watchlist: sortWatchlist(user.watchlist) };
};

const removeFromWatchlist = async (userId, tmdbId, mediaType) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  const oldLen = user.watchlist.length;
  user.watchlist = user.watchlist.filter((i) => !(i.tmdbId === tmdbId && i.mediaType === mediaType));
  if (user.watchlist.length === oldLen) throw new AppError('Watchlist item not found', 404, 'WATCHLIST_ITEM_NOT_FOUND');
  await user.save();
  return sortWatchlist(user.watchlist);
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
