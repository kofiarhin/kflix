const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { COOKIE_NAME } = require('../config/constants');
const AppError = require('../utils/appError');
const User = require('../models/User');
const { removeFileIfExists } = require('../utils/fileCleanup');

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  profileImage: user.profileImage || '',
});

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const signToken = (userId) => jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });

const register = async ({ fullName, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_EXISTS');

  const user = await User.create({ fullName: fullName.trim(), email: normalizedEmail, password });
  return { user: safeUser(user), token: signToken(user._id.toString()) };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  return { user: safeUser(user), token: signToken(user._id.toString()) };
};

const updateProfile = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  const normalizedEmail = payload.email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
  if (existing) throw new AppError('Email is already in use', 409, 'EMAIL_ALREADY_EXISTS');
  user.fullName = payload.fullName.trim();
  user.email = normalizedEmail;
  await user.save();
  return safeUser(user);
};

const updateProfileImage = async (userId, file) => {
  if (!file) throw new AppError('profileImage file is required', 400, 'VALIDATION_ERROR', [{ field: 'profileImage', message: 'profileImage file is required' }]);
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  const previousImagePath = user.profileImage;
  const newImagePath = `/uploads/profiles/${file.filename}`;
  try {
    user.profileImage = newImagePath;
    await user.save();
    if (previousImagePath) await removeFileIfExists(previousImagePath);
    return safeUser(user);
  } catch (error) {
    await removeFileIfExists(newImagePath);
    throw error;
  }
};

const removeProfileImage = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  if (user.profileImage) await removeFileIfExists(user.profileImage);
  user.profileImage = '';
  await user.save();
  return safeUser(user);
};

module.exports = { register, login, updateProfile, updateProfileImage, removeProfileImage, safeUser, getCookieOptions, COOKIE_NAME };
