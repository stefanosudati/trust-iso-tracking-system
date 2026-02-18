const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const requireAuth = require('../middleware/auth');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password e nome sono obbligatori' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  try {
    const hash = bcrypt.hashSync(password, 12);
    const stmt = db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(email.toLowerCase().trim(), name.trim(), hash);

    const token = signToken(result.lastInsertRowid);
    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, email: email.toLowerCase().trim(), name: name.trim(), theme: 'default' }
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Questa email e gia registrata' });
    }
    console.error('Errore registrazione:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, theme: user.theme || 'default' }
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, theme, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  res.json({ user });
});

// PUT /api/auth/theme
router.put('/theme', requireAuth, (req, res) => {
  const { theme } = req.body;
  const validThemes = ['default', 'trust-corporate', 'ocean', 'forest', 'slate'];
  if (!theme || !validThemes.includes(theme)) {
    return res.status(400).json({ error: 'Tema non valido' });
  }
  db.prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, req.userId);
  res.json({ theme });
});

module.exports = router;
