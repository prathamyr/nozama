const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserDAO = require('../dao/user.dao');
const CartDAO = require('../dao/cart.dao');

// Generate secure cart token
const generateCartToken = () => crypto.randomBytes(32).toString('hex');

// Merge guest cart into user cart
const mergeCarts = async (userCart, guestCart) => {
    if (!guestCart || !guestCart.items.length) return userCart;
    
    // Combine items: sum quantities for duplicate products
    for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(
            item => item.productId.toString() === guestItem.productId.toString()
        );
        
        if (existingItem) {
            existingItem.quantity += guestItem.quantity;
        } else {
            userCart.items.push(guestItem);
        }
    }
    
    await userCart.save();
    
    // Mark guest cart as converted
    await CartDAO.markAsConverted(guestCart._id);
    
    return userCart;
};

exports.signup = async (req, res) => {
    try {
        // CHANGE 1: Destructure lowercase properties to match Frontend & DB Model
        const { firstname, lastname, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await UserDAO.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ ok: false, error: 'Email already registered' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // CHANGE 2: Pass the lowercase variables to the DAO
        const user = await UserDAO.createUser(firstname, lastname, email, passwordHash);
        
        // Create new cart for user
        let userCart = await CartDAO.createCart(user._id);
        
        // Check if guest cart exists (from cookie)
        const guestCartToken = req.cookies?.cart_token;
        if (guestCartToken) {
            // In production, map token to cart ID securely
            const guestCart = await CartDAO.getActiveCart(null, guestCartToken);
            if (guestCart) {
                userCart = await mergeCarts(userCart, guestCart);
            }
            // Clear guest cart token
            res.clearCookie('cart_token');
        }
        
        // Remove sensitive data
        const sanitizedUser = user.toObject();
        delete sanitizedUser.passwordHash;
        
        res.json({ ok: true, user: sanitizedUser, cart: userCart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await UserDAO.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Invalid email or password' });
        }
        
        // Verify password
        const authenticated = await bcrypt.compare(password, user.passwordHash);
        if (!authenticated) {
            return res.status(401).json({ ok: false, error: 'Invalid email or password' });
        }
        
        // Get or create user cart
        let userCart = await CartDAO.getActiveCart(user._id, null);
        if (!userCart) {
            userCart = await CartDAO.createCart(user._id);
        }
        
        // Check for guest cart and merge
        const guestCartToken = req.cookies?.cart_token;
        if (guestCartToken) {
            const guestCart = await CartDAO.getActiveCart(null, guestCartToken);
            if (guestCart) {
                userCart = await mergeCarts(userCart, guestCart);
            }
            res.clearCookie('cart_token');
        }
        
        // Remove sensitive data
        const sanitizedUser = user.toObject();
        delete sanitizedUser.passwordHash;
        
        res.json({ ok: true, user: sanitizedUser, cart: userCart });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

exports.logout = async (req, res) => {
    try {
        // Clear session/cookies if using session management
        res.clearCookie('cart_token');
        res.json({ ok: true, message: 'Logged out successfully' });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
};

module.exports = exports;