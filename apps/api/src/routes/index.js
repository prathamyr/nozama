// src/routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ok: true, message: 'API root', routes: ['/api/health'] });
});

router.use('/health', require('./health.routes'));

module.exports = router;
