const multer = require('multer');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const authService = require('../services/authService');
const AppError = require('../utils/appError');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.cookie(authService.COOKIE_NAME, token, authService.getCookieOptions());
  return successResponse(res, { statusCode: 201, message: 'Registered successfully', data: user });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.cookie(authService.COOKIE_NAME, token, authService.getCookieOptions());
  return successResponse(res, { message: 'Logged in successfully', data: user });
});

const me = asyncHandler(async (req, res) => successResponse(res, { data: authService.safeUser(req.user) }));

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(authService.COOKIE_NAME, authService.getCookieOptions());
  return successResponse(res, { message: 'Logged out successfully', data: null });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return successResponse(res, { message: 'Profile updated successfully', data: user });
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const user = await authService.updateProfileImage(req.user._id, req.file);
  return successResponse(res, { message: 'Profile image updated successfully', data: user });
});

const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await authService.removeProfileImage(req.user._id);
  return successResponse(res, { message: 'Profile image removed successfully', data: user });
});

const handleProfileImageUploadError = (error, req, res, next) => {
  if (!error) return next();
  if (error instanceof multer.MulterError) {
    return next(new AppError(error.message, 400, 'PROFILE_IMAGE_UPLOAD_FAILED'));
  }
  return next(new AppError(error.message || 'Failed to upload profile image', 400, 'PROFILE_IMAGE_UPLOAD_FAILED'));
};

module.exports = { register, login, me, logout, updateProfile, updateProfileImage, removeProfileImage, handleProfileImageUploadError };
