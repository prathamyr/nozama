// src/middleware/asyncHandler.js
// Wrapper for async route handlers to catch errors automatically

module.exports = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};