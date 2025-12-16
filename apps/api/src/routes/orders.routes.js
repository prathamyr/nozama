const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orders.controller');

// Checkout
router.post('/', requireAuth, createOrder);

// Purchase history MUST come before /:orderId
router.get('/user/:userId', requireAuth, getUserOrders);

// Order lookup
router.get('/:orderId', requireAuth, getOrderById);

// Admin-only
router.put('/:orderId/status', requireAuth, requireAdmin, updateOrderStatus);
router.put('/:orderId/payment', requireAuth, requireAdmin, updatePaymentStatus);

module.exports = router;
