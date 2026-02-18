const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

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

module.exports = router;
