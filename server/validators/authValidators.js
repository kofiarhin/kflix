const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerBody = (body) => {
  const errors = [];
  if (!body.fullName?.trim()) errors.push({ field: 'fullName', message: 'fullName is required' });
  if (!body.email?.trim()) errors.push({ field: 'email', message: 'email is required' });
  else if (!emailRegex.test(body.email)) errors.push({ field: 'email', message: 'email is invalid' });
  if (!body.password) errors.push({ field: 'password', message: 'password is required' });
  return errors;
};

const loginBody = (body) => {
  const errors = [];
  if (!body.email?.trim()) errors.push({ field: 'email', message: 'email is required' });
  if (!body.password) errors.push({ field: 'password', message: 'password is required' });
  return errors;
};

module.exports = { registerBody, loginBody };
