const router = require('express').Router();
const db = require('../../db');
const { getProjectRow } = require('./helpers');

// PUT /api/projects/:id/milestones
router.put('/:id/milestones', (req, res) => {
  const row = getProjectRow(req.params.id, 'id');
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  db.prepare(
    `UPDATE projects SET milestones_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(req.body), req.params.id);

  res.json(req.body);
});

module.exports = router;
