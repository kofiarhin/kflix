const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res) => {
  return errorResponse(res, {
    statusCode: 404,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
};

module.exports = notFound;
