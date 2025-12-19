// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// 🔒 Protect everything under /admin
router.use(requireAuth, requireAdmin);

const {
  getAllOrders,
  filterOrders,
  getAllUsers,
  updateUser,
  createProduct,
  updateProduct,
  deactivateProduct,
  updateInventory,
  createInventoryLog,
  getAllInventoryLogs,
  getProductInventoryLogs,
  getAllProducts
} = require('../controllers/admin.controller');

// ---- ORDER MANAGEMENT ----
// Get all orders
router.get('/orders', getAllOrders);

// Filter orders (by user, product, date)
router.get('/orders/filter', filterOrders);

// ---- USER MANAGEMENT ----
// Get all users
router.get('/users', getAllUsers);

// Update user info
router.put('/users/:userId', updateUser);

// ---- PRODUCT MANAGEMENT ----
// Create new product
router.post('/products', createProduct);

// Update product
router.put('/products/:productId', updateProduct);

// Deactivate product (soft delete)
router.delete('/products/:productId', deactivateProduct);

// ---- INVENTORY MANAGEMENT ----
// Update product inventory
router.put('/inventory/:productId', updateInventory);

// DEBUGGING:Get all products (for inventory management)
router.get('/products', getAllProducts);

// Create inventory log
router.post('/inventory-logs', createInventoryLog);

// Get all inventory logs
router.get('/inventory-logs', getAllInventoryLogs);

// Get logs for specific product
router.get('/inventory-logs/product/:productId', getProductInventoryLogs);

module.exports = router;