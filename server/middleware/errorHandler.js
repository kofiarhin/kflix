const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  return errorResponse(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    errors: err.errors || [],
  });
};

module.exports = errorHandler;
