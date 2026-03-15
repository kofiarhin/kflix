const express = require("express");
const {
  getForYouRecommendations,
} = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/for-you", protect, getForYouRecommendations);

module.exports = router;
