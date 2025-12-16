// src/middleware/validate.js
// Simple validation middleware for common inputs

// Validate email format
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validate signup data
const validateSignup = (req, res, next) => {
  // BUG FIX: sign up was failing due to inconsistent naming
  // accept both camelCase + lowercase 
  // frontend and backend use different conventions
  const firstName = req.body.firstName ?? req.body.firstname;
  const lastName  = req.body.lastName  ?? req.body.lastname;

  const { email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ ok: false, error: 'All fields required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
  }

  req.body.firstname = firstName;
  req.body.lastname = lastName;

  next();
};

// Validate login data
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Email and password required' });
    }
    
    if (!validateEmail(email)) {
        return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }
    
    next();
};

// Validate product data (admin)
const validateProduct = (req, res, next) => {
    const { name, category, brand, price, stockQuantity } = req.body;
    
    if (!name || !category || !brand) {
        return res.status(400).json({ ok: false, error: 'Name, category, and brand required' });
    }
    
    if (price !== undefined && (isNaN(price) || price < 0)) {
        return res.status(400).json({ ok: false, error: 'Invalid price' });
    }
    
    if (stockQuantity !== undefined && (isNaN(stockQuantity) || stockQuantity < 0)) {
        return res.status(400).json({ ok: false, error: 'Invalid stock quantity' });
    }
    
    next();
};

// Validate MongoDB ObjectId format
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const regex = /^[0-9a-fA-F]{24}$/;
        
        if (!id || !regex.test(id)) {
            return res.status(400).json({ ok: false, error: `Invalid ${paramName}` });
        }
        
        next();
    };
};

// Validate address data
const validateAddress = (req, res, next) => {
    const { address } = req.body;
    
    if (!address || !address.fullName || !address.line1 || !address.city || !address.state || !address.postalCode || !address.country) {
        return res.status(400).json({ ok: false, error: 'Complete address required' });
    }
    
    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateProduct,
    validateObjectId,
    validateAddress
};