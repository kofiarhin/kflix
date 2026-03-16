const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { COOKIE_NAME } = require('../config/constants');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  req.user = user;
  next();
});

module.exports = { protect };
