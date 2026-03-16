const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const { removeFileIfExists } = require("../utils/fileCleanup");

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
  profileImage: user.profileImage || "",
});

const validationError = (res, field, message) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors: [{ field, message }],
  });
};

const isEmailValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return validationError(res, "fullName", "fullName is required");
  }

  if (!email) {
    return validationError(res, "email", "email is required");
  }

  if (!isEmailValid(email)) {
    return validationError(res, "email", "email is invalid");
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

  if (!isEmailValid(email)) {
    return validationError(res, "email", "email is invalid");
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

const updateProfile = async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName) {
    return validationError(res, "fullName", "fullName is required");
  }

  if (!email) {
    return validationError(res, "email", "email is required");
  }

  if (!isEmailValid(email)) {
    return validationError(res, "email", "email is invalid");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingEmailUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: user._id },
  });

  if (existingEmailUser) {
    return res.status(409).json({
      success: false,
      message: "Email is already in use",
      code: "EMAIL_ALREADY_EXISTS",
    });
  }

  user.fullName = fullName.trim();
  user.email = normalizedEmail;

  await user.save();

  return res.status(200).json({
    success: true,
    data: safeUser(user),
    message: "Profile updated successfully",
  });
};

const updateProfileImage = async (req, res) => {
  if (!req.file) {
    return validationError(res, "profileImage", "profileImage file is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    await removeFileIfExists(`/uploads/profiles/${req.file.filename}`);
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  const previousImagePath = user.profileImage;
  const newImagePath = `/uploads/profiles/${req.file.filename}`;

  try {
    user.profileImage = newImagePath;
    await user.save();

    if (previousImagePath) {
      await removeFileIfExists(previousImagePath);
    }

    return res.status(200).json({
      success: true,
      data: safeUser(user),
      message: "Profile image updated successfully",
    });
  } catch (error) {
    await removeFileIfExists(newImagePath);
    throw error;
  }
};

const removeProfileImage = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  const previousImagePath = user.profileImage;

  user.profileImage = "";
  await user.save();

  if (previousImagePath) {
    await removeFileIfExists(previousImagePath);
  }

  return res.status(200).json({
    success: true,
    data: safeUser(user),
    message: "Profile image removed successfully",
  });
};

const handleProfileImageUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return validationError(
        res,
        "profileImage",
        "profileImage must be 3MB or smaller",
      );
    }

    return validationError(res, "profileImage", error.message);
  }

  if (error) {
    return validationError(res, "profileImage", error.message);
  }

  return next();
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
  updateProfile,
  updateProfileImage,
  removeProfileImage,
  handleProfileImageUploadError,
};
