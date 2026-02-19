const router = require('express').Router();
const db = require('../../db');
const { validateProjectInput } = require('../../middleware/validate');
const { serializeProject, toColumns, defaultMilestones, getProjectRow } = require('./helpers');

// GET /api/projects
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
  res.json(rows.map(serializeProject));
});

// POST /api/projects
router.post('/', (req, res) => {
  const data = req.body;

  const errors = validateProjectInput(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

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
      milestones_json: milestones,
    });

    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(serializeProject(row));
  } catch (err) {
    console.error('Errore creazione progetto:', err);
    res.status(500).json({ error: 'Errore nella creazione del progetto' });
  }
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const row = getProjectRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });
  res.json(serializeProject(row));
});

// PUT /api/projects/:id
router.put('/:id', (req, res) => {
  const row = getProjectRow(req.params.id);
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  const data = req.body;

  const errors = validateProjectInput(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

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
    WHERE id = @id
  `).run({
    ...cols, evaluations_json: evaluationsJson,
    documents_json: documentsJson, milestones_json: milestonesJson,
    id: req.params.id,
  });

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(serializeProject(updated));
});

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  const row = getProjectRow(req.params.id, 'id');
  if (!row) return res.status(404).json({ error: 'Progetto non trovato' });

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
