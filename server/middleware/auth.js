const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

/**
 * Hash an API key with SHA-256 for lookup.
 */
function hashApiKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Try to authenticate via API key.
 * Checks X-API-Key header or Authorization: Bearer tiso_... prefix.
 * Returns userId if valid, null otherwise.
 */
function tryApiKeyAuth(req) {
  // Check X-API-Key header first
  let rawKey = req.headers['x-api-key'] || null;

  // Fallback: check Authorization: Bearer tiso_...
  if (!rawKey) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token && token.startsWith('tiso_')) {
      rawKey = token;
    }
  }

  if (!rawKey) return null;

  const keyHash = hashApiKey(rawKey);
  const apiKey = db.prepare(
    'SELECT id, user_id, is_active, expires_at FROM api_keys WHERE key_hash = ?'
  ).get(keyHash);

  if (!apiKey) return null;

  // Check if key is active
  if (!apiKey.is_active) return null;

  // Check if key is expired
  if (apiKey.expires_at) {
    const now = new Date();
    const expiry = new Date(apiKey.expires_at);
    if (now > expiry) return null;
  }

  // Update last_used_at
  db.prepare(
    "UPDATE api_keys SET last_used_at = datetime('now') WHERE id = ?"
  ).run(apiKey.id);

  return apiKey.user_id;
}

/**
 * JWT + API Key authentication middleware.
 * Accepts: Authorization: Bearer <jwt-token>
 *          Authorization: Bearer tiso_<api-key>
 *          X-API-Key: tiso_<api-key>
 * Sets: req.userId
 */
function requireAuth(req, res, next) {
  // Try API key authentication first
  const apiKeyUserId = tryApiKeyAuth(req);
  if (apiKeyUserId) {
    req.userId = apiKeyUserId;
    req.authMethod = 'api_key';
    return next();
  }

  // Fall back to JWT authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token di autenticazione richiesto' });
  }

  // If token looks like an API key but auth failed above, return specific error
  if (token.startsWith('tiso_')) {
    return res.status(401).json({ error: 'Chiave API non valida, disattivata o scaduta' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.authMethod = 'jwt';
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
