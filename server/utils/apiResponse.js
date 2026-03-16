const successResponse = (res, { statusCode = 200, message = 'OK', data = null, meta } = {}) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, { statusCode = 500, message = 'Request failed', code = 'INTERNAL_SERVER_ERROR', errors = [] } = {}) => {
  return res.status(statusCode).json({ success: false, message, code, errors });
};

module.exports = { successResponse, errorResponse };
