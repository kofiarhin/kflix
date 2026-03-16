process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_URL = 'http://localhost:5173';

const request = require('supertest');
const app = require('../app');

describe('API contracts', () => {
  it('returns standardized 404 error response', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({ success: false, code: 'ROUTE_NOT_FOUND' }));
  });

  it('blocks unauthorized watchlist access', async () => {
    const res = await request(app).get('/api/watchlist');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('validates malformed watchlist params', async () => {
    const res = await request(app).delete('/api/watchlist/invalid/not-a-number');
    expect(res.status).toBe(401);
  });

  it('validates malformed catalog params', async () => {
    const res = await request(app).get('/api/catalog/movies/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
