const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Protect everything under /admin
router.use(requireAuth, requireAdmin);


// uploads/products directory + storage
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    cb(ok ? null : new Error('Only image uploads are allowed'), ok);
  }
});


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

router.put('/users/:userId/address', adminController.updateUserAddress);
router.post('/users/:userId/payment-methods', adminController.addUserPaymentMethod);
router.delete('/users/:userId/payment-methods/:paymentId', adminController.removeUserPaymentMethod);
router.get('/users/:userId/orders', adminController.getUserOrders);

// ---- PRODUCT MANAGEMENT ----
router.post('/products',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gallery', maxCount: 8 }
  ]),
  createProduct);

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