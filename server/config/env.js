const dotenv = require('dotenv');

dotenv.config();

const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  tmdbBearerToken: process.env.TMDB_BEARER_TOKEN || '',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
};

module.exports = env;
