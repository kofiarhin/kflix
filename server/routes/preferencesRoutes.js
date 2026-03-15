const express = require("express");
const {
  getPreferences,
  updatePreferences,
} = require("../controllers/preferencesController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPreferences);
router.put("/", protect, updatePreferences);

module.exports = router;
