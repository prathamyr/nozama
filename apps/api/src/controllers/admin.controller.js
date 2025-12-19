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

//DEBUGGING:
exports.getAllProducts = async (req, res) => {
  try {
    const products = await ProductDAO.getAllProducts();
    res.json({ ok: true, products });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.filterOrders = async (req, res) => {
    try {
        const { userId, productId, startDate, endDate } = req.query;
        
        const filters = {
            userId,
            productId,
            startDate,
            endDate
        };
        
        const orders = await OrderDAO.filterOrders(filters);
        res.json({ ok: true, orders });
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

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        
        const user = await UserDAO.updateProfile(userId, updateData);
        res.json({ ok: true, user });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

// ---- PRODUCT MANAGEMENT ----

exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
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

    // fetch current first
    const before = await ProductDAO.getProductById(productId);
    if (!before) return res.status(404).json({ ok: false, error: 'Product not found' });

    // update
    const updated = await ProductDAO.updateQuantity(productId, quantity);

    // log delta correctly
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