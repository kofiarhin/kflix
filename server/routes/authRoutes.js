const express = require('express');
const {
  register,
  login,
  me,
  logout,
  updateProfile,
  updateProfileImage,
  removeProfileImage,
  handleProfileImageUploadError,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { registerBody, loginBody } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validate({ body: registerBody }), register);
router.post('/login', validate({ body: loginBody }), login);
router.get('/me', protect, me);
router.post('/logout', logout);
router.patch('/profile', protect, validate({ body: registerBody }), updateProfile);
router.patch('/profile-image', protect, uploadProfileImage, handleProfileImageUploadError, updateProfileImage);
router.delete('/profile-image', protect, removeProfileImage);

module.exports = router;
