const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/** Validate password strength: min 8 chars, 1 uppercase, 1 number, 1 symbol */
function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'La password deve avere almeno 8 caratteri';
  if (!/[A-Z]/.test(pw)) return 'La password deve contenere almeno una lettera maiuscola';
  if (!/[0-9]/.test(pw)) return 'La password deve contenere almeno un numero';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'La password deve contenere almeno un simbolo';
  return null;
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password e nome sono obbligatori' });
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  try {
    // First user becomes admin automatically
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const isFirstUser = userCount === 0;
    const role = isFirstUser ? 'admin' : 'user';
    const isApproved = isFirstUser ? 1 : 0;
    console.log(`Registrazione: ${email} — utenti esistenti: ${userCount}, ruolo assegnato: ${role}`);

    const hash = bcrypt.hashSync(password, 12);
    const stmt = db.prepare('INSERT INTO users (email, name, password_hash, role, is_approved, password_change_required) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(email.toLowerCase().trim(), name.trim(), hash, role, isApproved, 0);

    const token = signToken(result.lastInsertRowid);
    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        theme: 'default',
        role,
        isApproved: !!isApproved,
        passwordChangeRequired: false,
        hasSeenTutorial: false
      },
      pendingApproval: !isFirstUser
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Questa email è già registrata' });
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

  // Check approval (admin is always approved)
  if (!user.is_approved && user.role !== 'admin') {
    return res.status(403).json({ error: 'Account in attesa di approvazione da parte dell\'amministratore' });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      theme: user.theme || 'default',
      role: user.role || 'user',
      isApproved: !!user.is_approved,
      passwordChangeRequired: !!user.password_change_required,
      hasSeenTutorial: !!user.has_seen_tutorial
    }
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, theme, role, is_approved, password_change_required, has_seen_tutorial, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      theme: user.theme || 'default',
      role: user.role || 'user',
      isApproved: !!user.is_approved,
      passwordChangeRequired: !!user.password_change_required,
      hasSeenTutorial: !!user.has_seen_tutorial,
      createdAt: user.created_at
    }
  });
});

// PUT /api/auth/theme
router.put('/theme', requireAuth, (req, res) => {
  const { theme } = req.body;
  const { VALID_THEMES } = require('../constants');
  if (!theme || !VALID_THEMES.includes(theme)) {
    return res.status(400).json({ error: 'Tema non valido' });
  }
  db.prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, req.userId);
  res.json({ theme });
});

// PUT /api/auth/password
router.put('/password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const pwError = validatePassword(newPassword);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }

  const user = db.prepare('SELECT password_hash, password_change_required FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  // If password change is forced (first login), skip old password check
  if (!user.password_change_required) {
    if (!oldPassword) {
      return res.status(400).json({ error: 'La password attuale è obbligatoria' });
    }
    if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
      return res.status(401).json({ error: 'La password attuale non è corretta' });
    }
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE users SET password_hash = ?, password_change_required = 0 WHERE id = ?').run(hash, req.userId);
  res.json({ message: 'Password aggiornata con successo' });
});

// PUT /api/auth/tutorial-complete
router.put('/tutorial-complete', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET has_seen_tutorial = 1 WHERE id = ?').run(req.userId);
  res.json({ hasSeenTutorial: true });
});

module.exports = router;
