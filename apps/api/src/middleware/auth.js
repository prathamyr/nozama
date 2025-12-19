// src/middleware/auth.js
// Verify user is authenticated (simple token/session check)

const UserDAO = require('../dao/user.dao');

// Check if user is authenticated
const requireAuth = async (req, res, next) => {
    try {
        // In production, verify JWT token from headers
        // For now, check userId in body/params/headers
        const userId = req.body.userId || req.params.userId || req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({ ok: false, error: 'Authentication required' });
        }
        
        // Verify user exists
        const user = await UserDAO.getUserById(userId);
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Invalid user' });
        }
        
        // Attach user to request
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ ok: false, error: 'Authentication failed' });
    }
};

// Optional auth (doesn't block if no user)
const optionalAuth = async (req, res, next) => {
    try {
        const userId = req.body.userId || req.params.userId || req.headers['x-user-id'];
        
        if (userId) {
            const user = await UserDAO.getUserById(userId);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (e) {
        next(); // Continue even if auth fails
    }
};

module.exports = { requireAuth, optionalAuth };