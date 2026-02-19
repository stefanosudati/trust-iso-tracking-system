const router = require('express').Router();
const db = require('../../db');
const { getProjectRow } = require('./helpers');

// POST /api/projects/:id/documents
router.post('/:id/documents', (req, res) => {
  const row = getProjectRow(req.params.id, 'id, documents_json');
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const documents = JSON.parse(row.documents_json || '[]');
  const doc = {
    ...req.body,
    id: 'doc-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  documents.push(doc);

  db.prepare(
    `UPDATE projects SET documents_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(documents), req.params.id);

  res.status(201).json(doc);
});

// PUT /api/projects/:id/documents/:docId
router.put('/:id/documents/:docId', (req, res) => {
  const row = getProjectRow(req.params.id, 'id, documents_json');
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const documents = JSON.parse(row.documents_json || '[]');
  const idx = documents.findIndex(d => d.id === req.params.docId);
  if (idx === -1) return res.status(404).json({ error: 'Documento non trovato' });

  documents[idx] = { ...documents[idx], ...req.body };

  db.prepare(
    `UPDATE projects SET documents_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(documents), req.params.id);

  res.json(documents[idx]);
});

// DELETE /api/projects/:id/documents/:docId
router.delete('/:id/documents/:docId', (req, res) => {
  const row = getProjectRow(req.params.id, 'id, documents_json');
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  let documents = JSON.parse(row.documents_json || '[]');
  documents = documents.filter(d => d.id !== req.params.docId);

  db.prepare(
    `UPDATE projects SET documents_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(documents), req.params.id);

  res.json({ success: true });
});

module.exports = router;
