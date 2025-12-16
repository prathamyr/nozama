const express = require('express');
const router = express.Router();

// API root
router.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'E-Store API', 
    routes: ['/api/health', '/api/auth', '/api/users', '/api/products', '/api/cart', '/api/orders', '/api/admin'] 
  });
});

// Health check
router.use('/health', require('./health.routes'));

// Authentication
router.use('/auth', require('./auth.routes'));

// User routes
router.use('/users', require('./users.routes'));

// Product routes
router.use('/products', require('./products.routes'));

// Cart routes
router.use('/cart', require('./cart.routes'));

// Order routes
router.use('/orders', require('./orders.routes'));

// Admin routes
router.use('/admin', require('./admin.routes'));

module.exports = router;