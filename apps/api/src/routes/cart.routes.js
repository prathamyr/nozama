const express = require('express');
const { getCart, updateCart, createCart } = require('../controllers/cart.controller');
const router = express.Router();

router.get('/:userId', getCart);

router.post('/updateCart', updateCart);

router.post('/createCart', createCart);

module.exports = router;