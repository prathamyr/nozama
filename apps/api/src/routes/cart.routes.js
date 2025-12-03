const express = require('express');
const { getCart, updateCart, createCart } = require('../controllers/cart.controller');
const router = express.Router();

router.get('/', getCart);

router.get('/updateCart', updateCart);

router.post('/createCart', createCart);

module.exports = router;