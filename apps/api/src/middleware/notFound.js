// src/middleware/notFound.js
module.exports = (req, res, next) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
};
