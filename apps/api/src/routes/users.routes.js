const express = require('express');
const router = express.Router();
const { getUsers, loginUser, signupUser, updateAddress } = require('../controllers/users.controller');

router.post('/', getUsers);

router.post('/login', loginUser);

router.post('/signup', signupUser);

router.post('/updateAddress', updateAddress)

module.exports = router;