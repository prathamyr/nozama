// src/db/connect.js
const mongoose = require('mongoose');
const { mongoUri } = require('../config');

let hasTried = false;

async function connectDB() {
  if (!mongoUri) return null; // allow boot without DB for early FE work
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (hasTried) return mongoose.connection;
  hasTried = true;

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

function dbHealth() {
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const state = mongoose.connection.readyState;
  const map = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return { state, status: map[state] || 'unknown' };
}

module.exports = { connectDB, dbHealth };
