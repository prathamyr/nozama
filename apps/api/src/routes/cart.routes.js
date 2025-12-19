const express = require('express');
const router = express.Router();
const { 
    getCart, 
    createCart, 
    addOrUpdateItem, 
    removeItem, 
    clearCart 
} = require('../controllers/cart.controller');

// Get active cart (user or guest)
router.get('/:userId', getCart);

// Create new cart
router.post('/', createCart);

// Add or update item in cart
router.put('/:cartId/items', addOrUpdateItem);

// Remove item from cart
router.delete('/:cartId/items/:productId', removeItem);

// Clear entire cart
router.delete('/:cartId', clearCart);

module.exports = router;