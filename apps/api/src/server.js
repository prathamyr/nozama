// src/server.js
const http = require('http');
const app = require('./app');
const config = require('./config');
const { connectDB } = require('./db/connect');

const server = http.createServer(app);

async function start() {
  try {
    await connectDB(); // ok if MONGO_URI missing; app still runs
    server.listen(config.port, () => {
      console.log(`[api] listening on http://localhost:${config.port} (${config.env})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
