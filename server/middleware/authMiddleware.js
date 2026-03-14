const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "token";

const protect = async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }
};

module.exports = {
  protect,
};
