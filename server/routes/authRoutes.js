const express = require("express");
const {
  register,
  login,
  me,
  logout,
  updateProfile,
  updateProfileImage,
  removeProfileImage,
  handleProfileImageUploadError,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { uploadProfileImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);
router.patch("/profile", protect, updateProfile);
router.patch(
  "/profile-image",
  protect,
  uploadProfileImage,
  handleProfileImageUploadError,
  updateProfileImage,
);
router.delete("/profile-image", protect, removeProfileImage);

module.exports = router;
