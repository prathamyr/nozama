const bcrypt = require('bcrypt');
const UserDAO = require('../dao/user.dao');

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserDAO.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' });
        }
        
        // Remove sensitive data
        const sanitizedUser = user.toObject();
        delete sanitizedUser.passwordHash;
        
        res.json({ ok: true, user: sanitizedUser });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstname, lastname } = req.body;

    const user = await UserDAO.updateProfile(userId, { firstname, lastname });

    const sanitized = user.toObject();
    delete sanitized.passwordHash;

    res.json({ ok: true, user: sanitized });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.updateAddress = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, address } = req.body; // type: 'billing' or 'shipping'
        
        const user = await UserDAO.setAddress(userId, type, address);
        
        res.json({ ok: true, user });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;
        
        const user = await UserDAO.addToWishlist(userId, productId);
        
        res.json({ ok: true, user });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        
        const user = await UserDAO.removeFromWishlist(userId, productId);
        
        res.json({ ok: true, user });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const { userId } = req.params;
    const paymentData = req.body || {};

    if (paymentData.cardNumber) {
      const digits = String(paymentData.cardNumber).replace(/\s+/g, '');
      paymentData.cardNumber = digits;
      paymentData.last4 = digits.slice(-4);
    }

    const user = await UserDAO.addPaymentMethod(userId, paymentData);
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.removePaymentMethod = async (req, res) => {
    try {
        const { userId, paymentId } = req.params;
        
        const user = await UserDAO.removePaymentMethod(userId, paymentId);
        
        res.json({ ok: true, user });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

module.exports = exports;