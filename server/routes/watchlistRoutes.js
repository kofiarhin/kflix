const express = require('express');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { watchlistBody, watchlistParams } = require('../validators/watchlistValidators');

const router = express.Router();

router.get('/', protect, getWatchlist);
router.post('/', protect, validate({ body: watchlistBody }), addToWatchlist);
router.delete('/:mediaType/:tmdbId', protect, validate({ params: watchlistParams }), removeFromWatchlist);

module.exports = router;
