const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const signToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
};

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
});

const validationError = (res, field, message) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors: [{ field, message }],
  });
};

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return validationError(res, "fullName", "fullName is required");
  }

  if (!email) {
    return validationError(res, "email", "email is required");
  }

  if (!password) {
    return validationError(res, "password", "password is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email is already registered",
      code: "EMAIL_ALREADY_EXISTS",
    });
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
  });

  const token = signToken(user._id.toString());

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return res.status(201).json({
    success: true,
    data: safeUser(user),
    message: "Registered successfully",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return validationError(res, "email", "email is required");
  }

  if (!password) {
    return validationError(res, "password", "password is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      code: "INVALID_CREDENTIALS",
    });
  }

  const token = signToken(user._id.toString());

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return res.status(200).json({
    success: true,
    data: safeUser(user),
    message: "Logged in successfully",
  });
};

const me = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: safeUser(req.user),
    message: "OK",
  });
};

const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    data: null,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  me,
  logout,
};
