const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

// ─── Helpers ───────────────────────────────────────────────

/** Convert DB row (snake_case) -> client object (camelCase, matches old Store shape) */
function serializeProject(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName: row.client_name,
    sector: row.sector,
    ateco: row.ateco,
    employees: row.employees,
    legalAddress: row.legal_address,
    operationalSites: row.operational_sites,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    certificationId: row.certification_id,
    startDate: row.start_date,
    targetDate: row.target_date,
    certBody: row.cert_body,
    phase: row.phase,
    notes: row.notes,
    evaluations: JSON.parse(row.evaluations_json || '{}'),
    documents: JSON.parse(row.documents_json || '[]'),
    milestones: JSON.parse(row.milestones_json || '[]')
  };
}

/** Extract DB columns from client data */
function toColumns(data) {
  return {
    client_name: data.clientName ?? '',
    sector: data.sector ?? '',
    ateco: data.ateco ?? '',
    employees: data.employees ?? '',
    legal_address: data.legalAddress ?? '',
    operational_sites: data.operationalSites ?? '',
    contact_name: data.contactName ?? '',
    contact_role: data.contactRole ?? '',
    contact_email: data.contactEmail ?? '',
    contact_phone: data.contactPhone ?? '',
    certification_id: data.certificationId ?? 'iso-9001-2015',
    start_date: data.startDate ?? '',
    target_date: data.targetDate ?? '',
    cert_body: data.certBody ?? '',
    phase: data.phase ?? 'gap_analysis',
    notes: data.notes ?? ''
  };
}

/** Generate default milestones (mirrors old Store._defaultMilestones) */
function defaultMilestones(startDate, targetDate) {
  const start = startDate ? new Date(startDate) : new Date();
  const target = targetDate ? new Date(targetDate) : new Date(start.getTime() + 365 * 86400000);
  const duration = target.getTime() - start.getTime();

  function addDays(base, fraction) {
    return new Date(base.getTime() + duration * fraction).toISOString().split('T')[0];
  }

  return [
    { id: 'ms-1', title: 'Avvio progetto', date: start.toISOString().split('T')[0], type: 'start', completed: false },
    { id: 'ms-2', title: 'Completamento Gap Analysis', date: addDays(start, 0.15), type: 'gap_analysis', completed: false },
    { id: 'ms-3', title: 'Documentazione SGQ completata', date: addDays(start, 0.40), type: 'documentation', completed: false },
    { id: 'ms-4', title: 'Implementazione processi', date: addDays(start, 0.55), type: 'implementation', completed: false },
    { id: 'ms-5', title: 'Formazione personale', date: addDays(start, 0.60), type: 'training', completed: false },
    { id: 'ms-6', title: 'Audit interno', date: addDays(start, 0.70), type: 'internal_audit', completed: false },
    { id: 'ms-7', title: 'Riesame di direzione', date: addDays(start, 0.75), type: 'management_review', completed: false },
    { id: 'ms-8', title: 'Azioni correttive pre-audit', date: addDays(start, 0.80), type: 'corrective_actions', completed: false },
    { id: 'ms-9', title: 'Audit Stage 1', date: addDays(start, 0.85), type: 'stage1', completed: false },
    { id: 'ms-10', title: 'Audit Stage 2', date: addDays(start, 0.92), type: 'stage2', completed: false },
    { id: 'ms-11', title: 'Certificazione', date: target.toISOString().split('T')[0], type: 'certification', completed: false }
  ];
}

// ─── All routes require authentication ─────────────────────

router.use(requireAuth);

// ─── GET /api/projects ─────────────────────────────────────

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(req.userId);
  res.json(rows.map(serializeProject));
});

// ─── POST /api/projects ────────────────────────────────────

router.post('/', (req, res) => {
  const data = req.body;
  const id = data.id || ('proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5));
  const cols = toColumns(data);
  const milestones = data.milestones
    ? JSON.stringify(data.milestones)
    : JSON.stringify(defaultMilestones(data.startDate, data.targetDate));
  const evaluations = data.evaluations ? JSON.stringify(data.evaluations) : '{}';
  const documents = data.documents ? JSON.stringify(data.documents) : '[]';

  try {
    db.prepare(`
      INSERT INTO projects (
        id, user_id, client_name, sector, ateco, employees, legal_address,
        operational_sites, contact_name, contact_role, contact_email, contact_phone,
        certification_id, start_date, target_date, cert_body, phase, notes,
        evaluations_json, documents_json, milestones_json
      ) VALUES (
        @id, @userId, @client_name, @sector, @ateco, @employees, @legal_address,
        @operational_sites, @contact_name, @contact_role, @contact_email, @contact_phone,
        @certification_id, @start_date, @target_date, @cert_body, @phase, @notes,
        @evaluations_json, @documents_json, @milestones_json
      )
    `).run({
      id, userId: req.userId, ...cols,
      evaluations_json: evaluations,
      documents_json: documents,
      milestones_json: milestones
    });

    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(serializeProject(row));
  } catch (err) {
    console.error('Errore creazione progetto:', err);
    res.status(500).json({ error: 'Errore nella creazione del progetto' });
  }
});

// ─── GET /api/projects/:id ─────────────────────────────────

router.get('/:id', (req, res) => {
  const row = db.prepare(
    'SELECT * FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });
  res.json(serializeProject(row));
});

// ─── PUT /api/projects/:id ─────────────────────────────────

router.put('/:id', (req, res) => {
  const row = db.prepare(
    'SELECT * FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const data = req.body;
  const cols = toColumns(data);

  const evaluationsJson = data.evaluations !== undefined
    ? JSON.stringify(data.evaluations)
    : row.evaluations_json;
  const documentsJson = data.documents !== undefined
    ? JSON.stringify(data.documents)
    : row.documents_json;
  const milestonesJson = data.milestones !== undefined
    ? JSON.stringify(data.milestones)
    : row.milestones_json;

  db.prepare(`
    UPDATE projects SET
      client_name = @client_name, sector = @sector, ateco = @ateco,
      employees = @employees, legal_address = @legal_address,
      operational_sites = @operational_sites, contact_name = @contact_name,
      contact_role = @contact_role, contact_email = @contact_email,
      contact_phone = @contact_phone, certification_id = @certification_id,
      start_date = @start_date, target_date = @target_date,
      cert_body = @cert_body, phase = @phase, notes = @notes,
      evaluations_json = @evaluations_json, documents_json = @documents_json,
      milestones_json = @milestones_json, updated_at = datetime('now')
    WHERE id = @id AND user_id = @userId
  `).run({
    ...cols, evaluations_json: evaluationsJson,
    documents_json: documentsJson, milestones_json: milestonesJson,
    id: req.params.id, userId: req.userId
  });

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(serializeProject(updated));
});

// ─── DELETE /api/projects/:id ──────────────────────────────

router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'DELETE FROM projects WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.userId);

  if (result.changes === 0) return res.status(404).json({ error: 'Progetto non trovato' });
  res.json({ success: true });
});

// ─── PUT /api/projects/:id/evaluations/:reqId ──────────────

router.put('/:id/evaluations/:reqId', (req, res) => {
  const row = db.prepare(
    'SELECT evaluations_json FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const evaluations = JSON.parse(row.evaluations_json || '{}');
  const prev = evaluations[req.params.reqId];
  const evaluation = req.body;

  // History tracking (mirrors old Store.saveEvaluation)
  if (prev && prev.status !== evaluation.status) {
    if (!evaluation.history) evaluation.history = prev.history || [];
    evaluation.history.push({
      date: new Date().toISOString(),
      fromStatus: prev.status,
      toStatus: evaluation.status
    });
  }

  // ── Changelog diff logic ──
  const TRACKED_FIELDS = ['status', 'notes', 'priority', 'responsible', 'deadline', 'auditNotes', 'naJustification'];

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
    // Compare actions (JSON)
    const oldActions = JSON.stringify(prev.actions || []);
    const newActions = JSON.stringify(evaluation.actions || []);
    if (oldActions !== newActions) {
      changes.push({ field: 'actions', oldValue: oldActions, newValue: newActions });
    }
    // Compare evidenceNotes (JSON)
    const oldEvidence = JSON.stringify((prev.evidenceNotes || []).sort());
    const newEvidence = JSON.stringify((evaluation.evidenceNotes || []).sort());
    if (oldEvidence !== newEvidence) {
      changes.push({ field: 'evidenceNotes', oldValue: oldEvidence, newValue: newEvidence });
    }
  } else {
    // First evaluation — log initial status if meaningful
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

// ─── POST /api/projects/:id/documents ──────────────────────

router.post('/:id/documents', (req, res) => {
  const row = db.prepare(
    'SELECT documents_json FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const documents = JSON.parse(row.documents_json || '[]');
  const doc = {
    ...req.body,
    id: 'doc-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  documents.push(doc);

  db.prepare(
    `UPDATE projects SET documents_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(documents), req.params.id);

  res.status(201).json(doc);
});

// ─── PUT /api/projects/:id/documents/:docId ────────────────

router.put('/:id/documents/:docId', (req, res) => {
  const row = db.prepare(
    'SELECT documents_json FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

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

// ─── DELETE /api/projects/:id/documents/:docId ─────────────

router.delete('/:id/documents/:docId', (req, res) => {
  const row = db.prepare(
    'SELECT documents_json FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  let documents = JSON.parse(row.documents_json || '[]');
  documents = documents.filter(d => d.id !== req.params.docId);

  db.prepare(
    `UPDATE projects SET documents_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(documents), req.params.id);

  res.json({ success: true });
});

// ─── PUT /api/projects/:id/milestones ──────────────────────

router.put('/:id/milestones', (req, res) => {
  const row = db.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  db.prepare(
    `UPDATE projects SET milestones_json = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(req.body), req.params.id);

  res.json(req.body);
});

// ─── GET /api/projects/:id/changelog ──────────────────────

router.get('/:id/changelog', (req, res) => {
  const project = db.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
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

// ─── GET /api/projects/:id/changelog/:reqId ───────────────

router.get('/:id/changelog/:reqId', (req, res) => {
  const project = db.prepare(
    'SELECT id FROM projects WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!project) return res.status(404).json({ error: 'Progetto non trovato' });

  const rows = db.prepare(`
    SELECT * FROM changelog
    WHERE project_id = ? AND requirement_id = ?
    ORDER BY created_at DESC
  `).all(req.params.id, req.params.reqId);

  res.json({ entries: rows });
});

module.exports = router;
