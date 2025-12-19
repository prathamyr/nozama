const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    searchProducts, 
    filterProducts, 
    sortProducts 
} = require('../controllers/products.controller');

// Get all products (or use query params for filter/sort/search)
router.get('/', getProducts);

// Search products by keyword
router.get('/search', searchProducts);

// Filter products (category, brand, price)
router.get('/filter', filterProducts);

// Sort products (price, name)
router.get('/sort', sortProducts);

// Get single product details
router.get('/:productId', getProductById);

module.exports = router;