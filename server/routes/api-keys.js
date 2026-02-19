const router = require('express').Router();
const crypto = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// All api-key routes require authentication
router.use(requireAuth);

/**
 * Hash an API key with SHA-256 for storage/lookup.
 */
function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Generate a new API key: tiso_ prefix + 32 random hex chars.
 * Returns { rawKey, keyHash, keyPrefix }.
 */
function generateApiKey() {
  const randomHex = crypto.randomBytes(32).toString('hex').slice(0, 32);
  const rawKey = 'tiso_' + randomHex;
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 12) + '...';
  return { rawKey, keyHash, keyPrefix };
}

// GET /api/api-keys — List current user's API keys (never return hash/full key)
router.get('/', (req, res) => {
  const keys = db.prepare(
    'SELECT id, key_prefix, name, is_active, expires_at, last_used_at, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId);

  res.json({
    apiKeys: keys.map(k => ({
      id: k.id,
      keyPrefix: k.key_prefix,
      name: k.name,
      isActive: !!k.is_active,
      expiresAt: k.expires_at,
      lastUsedAt: k.last_used_at,
      createdAt: k.created_at
    }))
  });
});

// POST /api/api-keys — Create new API key
router.post('/', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : 'API Key';
  const expiresIn = typeof req.body.expiresIn === 'number' ? req.body.expiresIn : null;

  if (!name) {
    return res.status(400).json({ error: 'Il nome della chiave è obbligatorio' });
  }

  if (name.length > 100) {
    return res.status(400).json({ error: 'Il nome della chiave non può superare 100 caratteri' });
  }

  // Generate the key
  const { rawKey, keyHash, keyPrefix } = generateApiKey();

  // Calculate expiration date if expiresIn (days) is provided
  let expiresAt = null;
  if (expiresIn && expiresIn > 0) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expiresIn);
    expiresAt = expDate.toISOString().replace('T', ' ').slice(0, 19);
  }

  const result = db.prepare(
    'INSERT INTO api_keys (user_id, key_hash, key_prefix, name, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId, keyHash, keyPrefix, name, expiresAt);

  const created = db.prepare(
    'SELECT id, key_prefix, name, is_active, expires_at, last_used_at, created_at FROM api_keys WHERE id = ?'
  ).get(result.lastInsertRowid);

  // Return the raw key ONCE — it cannot be retrieved again
  res.status(201).json({
    apiKey: {
      id: created.id,
      keyPrefix: created.key_prefix,
      name: created.name,
      isActive: !!created.is_active,
      expiresAt: created.expires_at,
      lastUsedAt: created.last_used_at,
      createdAt: created.created_at
    },
    rawKey
  });
});

// PUT /api/api-keys/:id — Update name or toggle is_active
router.put('/:id', (req, res) => {
  const keyId = parseInt(req.params.id);
  const existing = db.prepare(
    'SELECT id, user_id FROM api_keys WHERE id = ?'
  ).get(keyId);

  if (!existing) {
    return res.status(404).json({ error: 'Chiave API non trovata' });
  }

  if (existing.user_id !== req.userId) {
    return res.status(403).json({ error: 'Non autorizzato a modificare questa chiave' });
  }

  const updates = {};
  if (typeof req.body.name === 'string') {
    const name = req.body.name.trim();
    if (!name) {
      return res.status(400).json({ error: 'Il nome della chiave è obbligatorio' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Il nome della chiave non può superare 100 caratteri' });
    }
    updates.name = name;
  }
  if (typeof req.body.isActive === 'boolean') {
    updates.is_active = req.body.isActive ? 1 : 0;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nessun campo da aggiornare' });
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(keyId);

  db.prepare(`UPDATE api_keys SET ${setClauses} WHERE id = ?`).run(...values);

  const updated = db.prepare(
    'SELECT id, key_prefix, name, is_active, expires_at, last_used_at, created_at FROM api_keys WHERE id = ?'
  ).get(keyId);

  res.json({
    apiKey: {
      id: updated.id,
      keyPrefix: updated.key_prefix,
      name: updated.name,
      isActive: !!updated.is_active,
      expiresAt: updated.expires_at,
      lastUsedAt: updated.last_used_at,
      createdAt: updated.created_at
    }
  });
});

// DELETE /api/api-keys/:id — Revoke/delete key
router.delete('/:id', (req, res) => {
  const keyId = parseInt(req.params.id);
  const existing = db.prepare(
    'SELECT id, user_id FROM api_keys WHERE id = ?'
  ).get(keyId);

  if (!existing) {
    return res.status(404).json({ error: 'Chiave API non trovata' });
  }

  if (existing.user_id !== req.userId) {
    return res.status(403).json({ error: 'Non autorizzato a eliminare questa chiave' });
  }

  db.prepare('DELETE FROM api_keys WHERE id = ?').run(keyId);
  res.json({ message: 'Chiave API eliminata con successo' });
});

module.exports = router;
