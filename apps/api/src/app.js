// app.js
const express = require("express");
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); // ← ADD THIS

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config');

const app = express();

// Core middleware
app.use(express.json());
app.use(cookieParser()); // ← ADD THIS (must be before routes)
app.use(morgan('dev'));

// CORS setup (to connect with front end)
const corsOptions = {
  origin: config.corsOrigin,
  credentials: true, // allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'] 
};
app.use(cors(corsOptions));

// Routes
app.use('/api', routes);

// 404 + error handling (keep these last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;