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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    cb(ok ? null : new Error('Only image uploads are allowed'), ok);
  }
});

// Import all controller functions
const {
  getAllOrders,
  filterOrders,
  getAllUsers,
  updateUser,
  updateUserAddress,
  addUserPaymentMethod,
  removeUserPaymentMethod,
  getUserOrders,
  createProduct,
  updateProduct,
  deactivateProduct,
  updateInventory,
  createInventoryLog,
  getAllInventoryLogs,
  getProductInventoryLogs,
  getAllProducts,
  updateOrderStatus
} = require('../controllers/admin.controller');

// ---- ORDER MANAGEMENT ----
router.get('/orders', getAllOrders);
router.get('/orders/filter', filterOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);

// ---- USER MANAGEMENT ----
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);
router.put('/users/:userId/address', updateUserAddress);
router.post('/users/:userId/payment-methods', addUserPaymentMethod);
router.delete('/users/:userId/payment-methods/:paymentId', removeUserPaymentMethod);
router.get('/users/:userId/orders', getUserOrders);

// ---- PRODUCT MANAGEMENT ----
router.post('/products',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gallery', maxCount: 8 }
  ]),
  createProduct
);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deactivateProduct);
router.get('/products', getAllProducts);

// ---- INVENTORY MANAGEMENT ----
router.put('/inventory/:productId', updateInventory);
router.post('/inventory-logs', createInventoryLog);
router.get('/inventory-logs', getAllInventoryLogs);
router.get('/inventory-logs/product/:productId', getProductInventoryLogs);

module.exports = router;