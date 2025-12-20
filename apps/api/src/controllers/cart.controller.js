// cart.controller.js
// Controller for cart operations

const crypto = require('crypto');
const CartDAO = require('../dao/cart.dao');
const ProductDAO = require('../dao/product.dao');
const Cart = require('../models/cart.model');

// Generate secure cart token for guests
const generateCartToken = () => crypto.randomBytes(32).toString('hex');

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cartToken = req.cookies?.cart_token;
        
        let cart;
        
        // Logged-in user: get by userId
        if (userId && userId !== 'guest') {
            cart = await CartDAO.getActiveCart(userId, null);
            if (!cart) {
                cart = await CartDAO.createCart(userId);
            }
        } 
        // Guest user: get by token or create new
        else {
            if (cartToken) {
                cart = await CartDAO.getActiveCart(null, cartToken);
            }
            
            if (!cart) {
                const token = generateCartToken();
                cart = await CartDAO.createCart(null, token);

                // Set secure HTTP-only cookie for guest cart
                res.cookie('cart_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Adjusting based on deployment
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });
            }
        }
        
        res.json({ ok: true, cart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.createCart = async (req, res) => {
    try {
        const { userId } = req.body;

        // Logged-in user cart
        if (userId) {
            const cart = await CartDAO.createCart(userId, null);
            return res.json({ ok: true, cart });
        }

        // Guest cart
        const token = generateCartToken();
        const cart = await CartDAO.createCart(null, token);

        res.cookie('cart_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Adjusting based on deployment
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });

        res.json({ ok: true, cart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.addOrUpdateItem = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, quantity } = req.body;
        
        // // Validate input
        // if (!productId || !quantity) {
        //     return res.status(400).json({ ok: false, error: 'Valid productId and quantity required' });
        // }
        
        // Get product and validate stock
        const product = await ProductDAO.getProductById(productId);
        if (!product) {
            return res.status(404).json({ ok: false, error: 'Product not found' });
        }
        
        if (!product.isActive) {
            return res.status(400).json({ ok: false, error: 'Product is not available' });
        }
        
        // FIX: Check total quantity (existing in cart + new quantity)
        const currentCart = await Cart.findById(cartId).populate('items.productId');
        
        let currentQuantity = 0;
        if (currentCart) {
            const existingItem = currentCart.items.find(item => {
                const itemProductId = item.productId._id?.toString() || item.productId.toString();
                return itemProductId === productId;
            });
            
            if (existingItem) {
                currentQuantity = existingItem.quantity;
            }
        }
        
        const totalQuantity = currentQuantity + Number(quantity);
        
        if (product.stockQuantity < totalQuantity) {
            return res.status(400).json({ 
                ok: false, 
                error: `Insufficient stock. Available: ${product.stockQuantity}, In cart: ${currentQuantity}, Requested: ${quantity}` 
            });
        }
        
        // Update cart
        const updatedCart = await CartDAO.addOrUpdateItem(cartId, productId, quantity);
        
        res.json({ ok: true, cart: updatedCart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        
        const cart = await CartDAO.removeItem(cartId, productId);
        
        res.json({ ok: true, cart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        
        const cart = await CartDAO.clearCart(cartId);
        
        res.json({ ok: true, cart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

module.exports = exports;