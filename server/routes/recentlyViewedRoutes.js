const express = require("express");
const {
  getRecentlyViewed,
  recordRecentlyViewed,
} = require("../controllers/recentlyViewedController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getRecentlyViewed);
router.post("/", protect, recordRecentlyViewed);

module.exports = router;
