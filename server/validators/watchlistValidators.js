const watchlistBody = (body) => {
  const errors = [];
  if (Number.isNaN(Number(body.tmdbId))) errors.push({ field: 'tmdbId', message: 'tmdbId must be a number' });
  if (!['movie','tv'].includes(body.mediaType)) errors.push({ field: 'mediaType', message: 'mediaType must be movie or tv' });
  if (!body.title?.trim()) errors.push({ field: 'title', message: 'title is required' });
  return errors;
};

const watchlistParams = (params) => {
  const errors = [];
  if (!['movie','tv'].includes(params.mediaType)) errors.push({ field: 'mediaType', message: 'mediaType must be movie or tv' });
  if (Number.isNaN(Number(params.tmdbId))) errors.push({ field: 'tmdbId', message: 'tmdbId must be a number' });
  return errors;
};

module.exports = { watchlistBody, watchlistParams };
