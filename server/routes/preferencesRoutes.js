const express = require('express');
const { getPreferences, updatePreferences } = require('../controllers/preferencesController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { preferencesBody } = require('../validators/preferencesValidators');

const router = express.Router();

router.get('/', protect, getPreferences);
router.put('/', protect, validate({ body: preferencesBody }), updatePreferences);

module.exports = router;
