const router = require('express').Router();
const db = require('../../db');
const { MAX_CHANGELOG_LIMIT } = require('../../constants');
const { getProjectRow } = require('./helpers');

// GET /api/projects/:id/changelog
router.get('/:id/changelog', (req, res) => {
  const project = getProjectRow(req.params.id, 'id');
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  const limit = Math.min(parseInt(req.query.limit) || 100, MAX_CHANGELOG_LIMIT);
  const offset = parseInt(req.query.offset) || 0;

  const rows = db.prepare(`
    SELECT * FROM changelog
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.params.id, limit, offset);

  const total = db.prepare(
    'SELECT COUNT(*) as count FROM changelog WHERE project_id = ?'
  ).get(req.params.id);

  res.json({ entries: rows, total: total.count });
});

// GET /api/projects/:id/changelog/:reqId
router.get('/:id/changelog/:reqId', (req, res) => {
  const project = getProjectRow(req.params.id, 'id');
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  const rows = db.prepare(`
    SELECT * FROM changelog
    WHERE project_id = ? AND requirement_id = ?
    ORDER BY created_at DESC
  `).all(req.params.id, req.params.reqId);

  res.json({ entries: rows });
});

module.exports = router;
