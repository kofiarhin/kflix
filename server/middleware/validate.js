const AppError = require('../utils/appError');

const validate = (schema) => (req, res, next) => {
  const errors = [];

  if (schema.body) {
    const result = schema.body(req.body);
    if (result?.length) errors.push(...result);
  }

  if (schema.params) {
    const result = schema.params(req.params);
    if (result?.length) errors.push(...result);
  }

  if (schema.query) {
    const result = schema.query(req.query);
    if (result?.length) errors.push(...result);
  }

  if (errors.length) {
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
  }

  return next();
};

module.exports = validate;
