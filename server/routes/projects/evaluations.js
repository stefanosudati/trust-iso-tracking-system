const router = require('express').Router();
const db = require('../../db');
const { TRACKED_FIELDS } = require('../../constants');
const { validateEvaluationInput } = require('../../middleware/validate');
const { getProjectRow } = require('./helpers');

// PUT /api/projects/:id/evaluations/:reqId
router.put('/:id/evaluations/:reqId', (req, res) => {
  const row = getProjectRow(req.params.id, 'id, evaluations_json');
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const evaluation = req.body;

  const errors = validateEvaluationInput(evaluation);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  const evaluations = JSON.parse(row.evaluations_json || '{}');
  const prev = evaluations[req.params.reqId];

  // History tracking
  if (prev && prev.status !== evaluation.status) {
    if (!evaluation.history) evaluation.history = prev.history || [];
    evaluation.history.push({
      date: new Date().toISOString(),
      fromStatus: prev.status,
      toStatus: evaluation.status,
    });
  }

  // Changelog diff
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId);
  const userName = user ? user.name : 'Utente sconosciuto';

  const insertChangelog = db.prepare(`
    INSERT INTO changelog (project_id, requirement_id, user_id, user_name, field, old_value, new_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const changes = [];

  if (prev) {
    for (const field of TRACKED_FIELDS) {
      const oldVal = prev[field] ?? '';
      const newVal = evaluation[field] ?? '';
      if (String(oldVal) !== String(newVal)) {
        changes.push({ field, oldValue: String(oldVal), newValue: String(newVal) });
      }
    }
    const oldActions = JSON.stringify(prev.actions || []);
    const newActions = JSON.stringify(evaluation.actions || []);
    if (oldActions !== newActions) {
      changes.push({ field: 'actions', oldValue: oldActions, newValue: newActions });
    }
    const oldEvidence = JSON.stringify((prev.evidenceNotes || []).sort());
    const newEvidence = JSON.stringify((evaluation.evidenceNotes || []).sort());
    if (oldEvidence !== newEvidence) {
      changes.push({ field: 'evidenceNotes', oldValue: oldEvidence, newValue: newEvidence });
    }
  } else {
    if (evaluation.status && evaluation.status !== 'not_evaluated') {
      changes.push({ field: 'status', oldValue: 'not_evaluated', newValue: evaluation.status });
    }
  }

  if (changes.length > 0) {
    const insertMany = db.transaction((items) => {
      for (const c of items) {
        insertChangelog.run(req.params.id, req.params.reqId, req.userId, userName, c.field, c.oldValue, c.newValue);
      }
    });
    insertMany(changes);
  }

  evaluations[req.params.reqId] = evaluation;

  db.prepare(
    `UPDATE projects SET evaluations_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(evaluations), req.params.id);

  res.json(evaluation);
});

module.exports = router;
