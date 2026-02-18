const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * JWT authentication middleware.
 * Expects: Authorization: Bearer <token>
 * Sets: req.userId
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token di autenticazione richiesto' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token scaduto, effettua nuovamente il login' });
    }
    return res.status(403).json({ error: 'Token non valido' });
  }
}

/**
 * Admin authorization middleware.
 * Must be used after requireAuth.
 */
function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso riservato agli amministratori' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
