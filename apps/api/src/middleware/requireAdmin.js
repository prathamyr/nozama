// src/middleware/requireAdmin.js
// Verify user has admin role

const requireAdmin = (req, res, next) => {
    try {
        // User should be attached by requireAuth middleware first
        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'Authentication required' });
        }
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ ok: false, error: 'Admin access required' });
        }
        
        next();
    } catch (e) {
        res.status(403).json({ ok: false, error: 'Authorization failed' });
    }
};

module.exports = requireAdmin;