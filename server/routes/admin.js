const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// Generate a cryptographically secure random password (12 chars)
// Guarantees at least 1 uppercase letter, 1 number, 1 symbol
function generateRandomPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=';
  const allChars = uppercase + lowercase + numbers + symbols;

  // Guarantee at least one of each required category
  const password = [
    uppercase[crypto.randomInt(uppercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  // Fill remaining characters from the full set
  for (let i = password.length; i < 12; i++) {
    password.push(allChars[crypto.randomInt(allChars.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

// POST /api/admin/users — Create a new user (admin-only)
router.post('/users', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!name) {
    return res.status(400).json({ error: 'Il nome è obbligatorio' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email non valida' });
  }

  // Check for duplicate email
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Questa email è già registrata' });
  }

  // Generate random password and hash it
  const generatedPassword = generateRandomPassword();
  const hashedPassword = bcrypt.hashSync(generatedPassword, 12);

  const result = db.prepare(
    'INSERT INTO users (email, name, password_hash, role, is_approved, password_change_required) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(email, name, hashedPassword, 'user', 1, 1);

  const newUser = db.prepare(
    'SELECT id, email, name, role, is_approved, created_at FROM users WHERE id = ?'
  ).get(result.lastInsertRowid);

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role || 'user',
      isApproved: !!newUser.is_approved,
      createdAt: newUser.created_at
    },
    generatedPassword
  });
});

// GET /api/admin/users — List all users
router.get('/users', (req, res) => {
  const users = db.prepare(
    'SELECT id, email, name, role, is_approved, created_at FROM users ORDER BY created_at DESC'
  ).all();

  res.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'user',
      isApproved: !!u.is_approved,
      createdAt: u.created_at
    }))
  });
});

// PUT /api/admin/users/:id/approve — Approve user
router.put('/users/:id/approve', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  db.prepare('UPDATE users SET is_approved = 1 WHERE id = ?').run(userId);
  res.json({ message: 'Utente approvato con successo' });
});

// PUT /api/admin/users/:id/role — Change user role
router.put('/users/:id/role', (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  if (!role || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Ruolo non valido. Usa "admin" o "user"' });
  }

  if (userId === req.userId) {
    return res.status(400).json({ error: 'Non puoi modificare il tuo stesso ruolo' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  res.json({ message: role === 'admin' ? 'Utente promosso ad amministratore' : 'Utente retrocesso a utente standard' });
});

// DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  // Cannot delete yourself
  if (userId === req.userId) {
    return res.status(400).json({ error: 'Non puoi eliminare il tuo stesso account' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ message: 'Utente eliminato con successo' });
});

// POST /api/admin/send-changelog-summary — Manually trigger changelog summary email
router.post('/send-changelog-summary', async (req, res) => {
  try {
    const { runChangelogSummary } = require('../scheduler');
    const result = await runChangelogSummary();
    res.json({
      message: result.changeCount > 0
        ? `Riepilogo inviato: ${result.changeCount} modifiche a ${result.recipientCount} amministratori`
        : 'Nessuna modifica recente da inviare',
      changeCount: result.changeCount,
      recipientCount: result.recipientCount,
      since: result.since,
    });
  } catch (err) {
    console.error('Errore invio riepilogo manuale:', err.message);
    res.status(500).json({ error: 'Errore durante l\'invio del riepilogo: ' + err.message });
  }
});

// GET /api/admin/api-keys — List ALL api keys across all users (admin oversight)
router.get('/api-keys', (req, res) => {
  const keys = db.prepare(`
    SELECT ak.id, ak.user_id, ak.key_prefix, ak.name, ak.is_active,
           ak.expires_at, ak.last_used_at, ak.created_at,
           u.name AS user_name, u.email AS user_email
    FROM api_keys ak
    JOIN users u ON u.id = ak.user_id
    ORDER BY ak.created_at DESC
  `).all();

  res.json({
    apiKeys: keys.map(k => ({
      id: k.id,
      userId: k.user_id,
      userName: k.user_name,
      userEmail: k.user_email,
      keyPrefix: k.key_prefix,
      name: k.name,
      isActive: !!k.is_active,
      expiresAt: k.expires_at,
      lastUsedAt: k.last_used_at,
      createdAt: k.created_at
    }))
  });
});

// PUT /api/admin/api-keys/:id/toggle — Admin can enable/disable any key
router.put('/api-keys/:id/toggle', (req, res) => {
  const keyId = parseInt(req.params.id);
  const existing = db.prepare('SELECT id, is_active FROM api_keys WHERE id = ?').get(keyId);

  if (!existing) {
    return res.status(404).json({ error: 'Chiave API non trovata' });
  }

  const isActive = typeof req.body.isActive === 'boolean' ? req.body.isActive : !existing.is_active;
  db.prepare('UPDATE api_keys SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, keyId);

  const updated = db.prepare(`
    SELECT ak.id, ak.user_id, ak.key_prefix, ak.name, ak.is_active,
           ak.expires_at, ak.last_used_at, ak.created_at,
           u.name AS user_name, u.email AS user_email
    FROM api_keys ak
    JOIN users u ON u.id = ak.user_id
    WHERE ak.id = ?
  `).get(keyId);

  res.json({
    apiKey: {
      id: updated.id,
      userId: updated.user_id,
      userName: updated.user_name,
      userEmail: updated.user_email,
      keyPrefix: updated.key_prefix,
      name: updated.name,
      isActive: !!updated.is_active,
      expiresAt: updated.expires_at,
      lastUsedAt: updated.last_used_at,
      createdAt: updated.created_at
    }
  });
});

module.exports = router;
