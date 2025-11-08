// src/config/index.js
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  corsOrigin: process.env.CORS_ORIGIN || '*' // default open for now
};

if (!config.mongoUri) {
  // We don't throw here so the server can still boot without DB (THIS IS FRONTEND PEOPLE),
  // but health will report db.status = 'disconnected'
  // console.warn('Warning: MONGO_URI is not set. DB connection will be skipped.');
}

module.exports = config;