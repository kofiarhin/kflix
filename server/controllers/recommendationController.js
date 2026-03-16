const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const recommendationService = require('../services/recommendationService');

const getForYouRecommendations = asyncHandler(async (req, res) => {
  const result = await recommendationService.getForYouRecommendations(req.user.preferences);
  return successResponse(res, {
    data: result.items,
    message: 'OK',
    meta: { preferencesConfigured: result.preferencesConfigured, preferences: result.preferences },
  });
});

module.exports = { getForYouRecommendations };
