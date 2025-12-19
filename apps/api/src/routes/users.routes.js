const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const {
  getUserProfile,
  updateProfile,
  updateAddress,
  addToWishlist,
  removeFromWishlist,
  addPaymentMethod,
  removePaymentMethod
} = require('../controllers/users.controller');

// Require auth for all user endpoints
router.use(requireAuth);

// Get user profile
router.get('/:userId', getUserProfile);

// Update user profile (name, etc)
router.put('/:userId', updateProfile);

// Update shipping/billing address
router.put('/:userId/address', updateAddress);

// Wishlist management
router.post('/:userId/wishlist', addToWishlist);
router.delete('/:userId/wishlist/:productId', removeFromWishlist);

// Payment methods
router.post('/:userId/payment-methods', addPaymentMethod);
router.delete('/:userId/payment-methods/:paymentId', removePaymentMethod);

module.exports = router;