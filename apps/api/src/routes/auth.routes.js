const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/auth.controller');

// IMPORT MIDDLEWARE
const { validateSignup, validateLogin } = require('../middleware/validate');

// ADDING IT TO THE ROUTES !!!
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);    
router.post('/logout', logout);

module.exports = router;