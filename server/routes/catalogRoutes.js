const express = require('express');
const { homeFeed, browseMovies, browseSeries, movieDetails, seriesDetails } = require('../controllers/catalogController');
const validate = require('../middleware/validate');
const { idParam, browseQuery } = require('../validators/catalogValidators');

const router = express.Router();

router.get('/home', homeFeed);
router.get('/movies', validate({ query: browseQuery }), browseMovies);
router.get('/movies/:id', validate({ params: idParam }), movieDetails);
router.get('/series', validate({ query: browseQuery }), browseSeries);
router.get('/series/:id', validate({ params: idParam }), seriesDetails);

module.exports = router;
