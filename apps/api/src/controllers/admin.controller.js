// admin.controller.js
// Admin controller for order, user, product, and inventory management

const OrderDAO = require('../dao/order.dao');
const UserDAO = require('../dao/user.dao');
const ProductDAO = require('../dao/product.dao');
const InventoryLogDAO = require('../dao/inventorylog.dao');

// ---- ORDER MANAGEMENT ----

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await OrderDAO.getAllOrders();
        res.json({ ok: true, orders });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.filterOrders = async (req, res) => {
    try {
        const { userId, productId, startDate, endDate } = req.query;
        const filters = { userId, productId, startDate, endDate };
        const orders = await OrderDAO.filterOrders(filters);
        res.json({ ok: true, orders });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// Update order status (for approving declined payments, etc.)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await OrderDAO.updateOrderStatus(orderId, status);
        res.json({ ok: true, order });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// ---- USER MANAGEMENT ----

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserDAO.getAllUsers();
        res.json({ ok: true, users });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// Update basic user info (firstname, lastname, email)
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        const user = await UserDAO.updateProfile(userId, updateData);
        const sanitized = user.toObject();
        delete sanitized.passwordHash;

        res.json({ ok: true, user: sanitized });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// Update user address (shipping or billing)
exports.updateUserAddress = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, address } = req.body;

        if (!['billing', 'shipping'].includes(type)) {
            return res.status(400).json({ ok: false, error: 'Invalid address type' });
        }

        const user = await UserDAO.setAddress(userId, type, address);
        const sanitized = user.toObject();
        delete sanitized.passwordHash;

        res.json({ ok: true, user: sanitized });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// Add payment method to user
exports.addUserPaymentMethod = async (req, res) => {
    try {
        const { userId } = req.params;
        const paymentData = req.body || {};

        // Normalize card number and derive last4
        if (paymentData.cardNumber) {
            const digits = String(paymentData.cardNumber).replace(/\s+/g, '');
            paymentData.cardNumber = digits;
            paymentData.last4 = digits.slice(-4);
        }

        const user = await UserDAO.addPaymentMethod(userId, paymentData);
        const sanitized = user.toObject();
        delete sanitized.passwordHash;

        res.json({ ok: true, user: sanitized });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// Remove payment method from user
exports.removeUserPaymentMethod = async (req, res) => {
    try {
        const { userId, paymentId } = req.params;

        const user = await UserDAO.removePaymentMethod(userId, paymentId);
        const sanitized = user.toObject();
        delete sanitized.passwordHash;

        res.json({ ok: true, user: sanitized });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// Get orders for a specific user (purchase history in admin view)
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await OrderDAO.getOrdersByUser(userId);
        res.json({ ok: true, orders });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// ---- PRODUCT MANAGEMENT ----

exports.getAllProducts = async (req, res) => {
    try {
        const products = await ProductDAO.getAllProducts();
        res.json({ ok: true, products });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const body = req.body || {};

        // Files from multer (if using file uploads)
        const thumbnailFile = req.files?.thumbnail?.[0];
        const galleryFiles = req.files?.gallery || [];

        // Parse specs if sent as JSON string
        let specs = undefined;
        if (body.specsJson) {
            try {
                const parsed = JSON.parse(body.specsJson);
                specs = Object.fromEntries(
                    Object.entries(parsed).map(([k, v]) => [k, String(v)])
                );
            } catch (e) {
                return res.status(400).json({ ok: false, error: 'Invalid specsJson' });
            }
        }

        // Build thumbnail URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const thumbnailImg = thumbnailFile
            ? `${baseUrl}/uploads/products/${thumbnailFile.filename}`
            : body.thumbnailImg;

        const imageGallery = galleryFiles.map(f => ({
            url: `${baseUrl}/uploads/products/${f.filename}`,
            type: 'image'
        }));

        // Build product data
        const productData = {
            name: body.name,
            slug: body.slug,
            description: body.description,
            category: body.category,
            brand: body.brand,
            price: Number(body.price),
            stockQuantity: Number(body.stockQuantity),
            thumbnailImg,
            imageGallery,
            specs,
            isActive: body.isActive !== undefined ? String(body.isActive) === 'true' : true
        };

        const product = await ProductDAO.createProduct(productData);
        res.json({ ok: true, product });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const product = await ProductDAO.updateProduct(productId, updateData);
        res.json({ ok: true, product });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.deactivateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductDAO.deactivateProduct(productId);
        res.json({ ok: true, product });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// ---- INVENTORY MANAGEMENT ----

exports.updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, adminId, actionType, reason } = req.body;

        // Fetch current stock first
        const before = await ProductDAO.getProductById(productId);
        if (!before) {
            return res.status(404).json({ ok: false, error: 'Product not found' });
        }

        // Update stock quantity
        const updated = await ProductDAO.updateQuantity(productId, quantity);

        // Log the change (delta = new - old)
        const quantityChange = Number(quantity) - Number(before.stockQuantity);
        await InventoryLogDAO.createLog(
            productId,
            adminId,
            actionType || 'CORRECTION',
            quantityChange,
            reason
        );

        res.json({ ok: true, product: updated });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.createInventoryLog = async (req, res) => {
    try {
        const { productId, adminId, actionType, quantityChange, reason } = req.body;

        const log = await InventoryLogDAO.createLog(
            productId,
            adminId,
            actionType,
            quantityChange,
            reason
        );

        res.json({ ok: true, log });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.getAllInventoryLogs = async (req, res) => {
    try {
        const logs = await InventoryLogDAO.getAllLogs();
        res.json({ ok: true, logs });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.getProductInventoryLogs = async (req, res) => {
    try {
        const { productId } = req.params;
        const logs = await InventoryLogDAO.getLogsByProduct(productId);
        res.json({ ok: true, logs });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

module.exports = exports;