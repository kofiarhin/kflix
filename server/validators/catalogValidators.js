const idParam = (params) => {
  const errors = [];
  if (Number.isNaN(Number(params.id))) errors.push({ field: 'id', message: 'id must be a number' });
  return errors;
};

const browseQuery = (query) => {
  const errors = [];
  if (query.page && Number.isNaN(Number(query.page))) errors.push({ field: 'page', message: 'page must be a number' });
  return errors;
};

module.exports = { idParam, browseQuery };
