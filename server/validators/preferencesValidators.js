const { VALID_CONTENT_TYPES, VALID_DISCOVERY_STYLES } = require('../config/constants');

const preferencesBody = (body) => {
  const errors = [];
  if (!Array.isArray(body.favoriteGenres)) errors.push({ field: 'favoriteGenres', message: 'favoriteGenres must be an array' });
  if (!VALID_CONTENT_TYPES.includes(body.contentType)) errors.push({ field: 'contentType', message: 'invalid contentType' });
  if (!VALID_DISCOVERY_STYLES.includes(body.discoveryStyle)) errors.push({ field: 'discoveryStyle', message: 'invalid discoveryStyle' });
  return errors;
};

module.exports = { preferencesBody };
