// src/controllers/health.controller.js
const os = require('os');
const { dbHealth } = require('../db/connect');
const config = require('../config');

exports.getHealth = (req, res) => {
  const db = dbHealth();
  res.json({
    ok: true,
    service: 'api',
    env: config.env,
    uptime: process.uptime(),
    version: '0.1.0',
    db,
    host: os.hostname(),
    time: new Date().toISOString()
  });
};
