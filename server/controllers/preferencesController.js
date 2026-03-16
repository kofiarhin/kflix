const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const preferencesService = require('../services/preferencesService');

const getPreferences = asyncHandler(async (req, res) => successResponse(res, { data: await preferencesService.getPreferences(req.user._id) }));
const updatePreferences = asyncHandler(async (req, res) => successResponse(res, { message: 'Preferences updated successfully', data: await preferencesService.updatePreferences(req.user._id, req.body) }));

module.exports = { getPreferences, updatePreferences };
