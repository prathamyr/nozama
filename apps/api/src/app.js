// This defines the express instance to run at port 3000 for example
const express = require("express");
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config');

const app = express();

// Core middleware
app.use(express.json());
app.use(morgan('dev'));

// CORS setup (to connect with front end)
const corsOptions = {
  origin: config.corsOrigin === '*' ? '*' : [config.corsOrigin],
  credentials: true, // allow cookies/auth headers if needed
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Routes
app.use('/api', routes);

// 404 + error handling (keep these last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;


