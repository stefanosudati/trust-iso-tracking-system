const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { MAX_CLIENT_NAME_LENGTH } = require('../constants');

router.use(requireAuth);

/** Convert DB row (snake_case) -> client object (camelCase) */
function serializeClient(row) {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    sector: row.sector,
    ateco: row.ateco,
    employees: row.employees,
    legalAddress: row.legal_address,
    operationalSites: row.operational_sites,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Check if requesting user is admin */
function isAdmin(userId) {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
  return user && user.role === 'admin';
}

// GET /api/clients — List all clients for current user (admin sees all)
router.get('/', (req, res) => {
  let rows;
  if (isAdmin(req.userId)) {
    rows = db.prepare('SELECT * FROM clients ORDER BY company_name ASC').all();
  } else {
    rows = db.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY company_name ASC').all(req.userId);
  }
  res.json(rows.map(serializeClient));
});

// POST /api/clients — Create a new client
router.post('/', (req, res) => {
  const data = req.body;

  const companyName = typeof data.companyName === 'string' ? data.companyName.trim() : '';
  if (!companyName) {
    return res.status(400).json({ error: 'Ragione Sociale è obbligatoria' });
  }
  if (companyName.length > MAX_CLIENT_NAME_LENGTH) {
    return res.status(400).json({ error: `Ragione Sociale deve avere max ${MAX_CLIENT_NAME_LENGTH} caratteri` });
  }

  try {
    const result = db.prepare(`
      INSERT INTO clients (
        user_id, company_name, sector, ateco, employees, legal_address,
        operational_sites, contact_name, contact_role, contact_email, contact_phone
      ) VALUES (
        @user_id, @company_name, @sector, @ateco, @employees, @legal_address,
        @operational_sites, @contact_name, @contact_role, @contact_email, @contact_phone
      )
    `).run({
      user_id: req.userId,
      company_name: companyName,
      sector: data.sector ?? '',
      ateco: data.ateco ?? '',
      employees: data.employees ?? '',
      legal_address: data.legalAddress ?? '',
      operational_sites: data.operationalSites ?? '',
      contact_name: data.contactName ?? '',
      contact_role: data.contactRole ?? '',
      contact_email: data.contactEmail ?? '',
      contact_phone: data.contactPhone ?? '',
    });

    const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(serializeClient(row));
  } catch (err) {
    console.error('Errore creazione cliente:', err);
    res.status(500).json({ error: 'Errore nella creazione del cliente' });
  }
});

// GET /api/clients/:id — Get single client
router.get('/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  if (!row) return res.status(404).json({ error: 'Cliente non trovato' });

  // Non-admin can only see their own clients
  if (!isAdmin(req.userId) && row.user_id !== req.userId) {
    return res.status(403).json({ error: 'Accesso non autorizzato' });
  }

  res.json(serializeClient(row));
});

// PUT /api/clients/:id — Update client
router.put('/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  if (!row) return res.status(404).json({ error: 'Cliente non trovato' });

  // Non-admin can only update their own clients
  if (!isAdmin(req.userId) && row.user_id !== req.userId) {
    return res.status(403).json({ error: 'Accesso non autorizzato' });
  }

  const data = req.body;

  const companyName = typeof data.companyName === 'string' ? data.companyName.trim() : row.company_name;
  if (!companyName) {
    return res.status(400).json({ error: 'Ragione Sociale è obbligatoria' });
  }
  if (companyName.length > MAX_CLIENT_NAME_LENGTH) {
    return res.status(400).json({ error: `Ragione Sociale deve avere max ${MAX_CLIENT_NAME_LENGTH} caratteri` });
  }

  try {
    db.prepare(`
      UPDATE clients SET
        company_name = @company_name, sector = @sector, ateco = @ateco,
        employees = @employees, legal_address = @legal_address,
        operational_sites = @operational_sites, contact_name = @contact_name,
        contact_role = @contact_role, contact_email = @contact_email,
        contact_phone = @contact_phone, updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: clientId,
      company_name: companyName,
      sector: data.sector ?? row.sector,
      ateco: data.ateco ?? row.ateco,
      employees: data.employees ?? row.employees,
      legal_address: data.legalAddress ?? row.legal_address,
      operational_sites: data.operationalSites ?? row.operational_sites,
      contact_name: data.contactName ?? row.contact_name,
      contact_role: data.contactRole ?? row.contact_role,
      contact_email: data.contactEmail ?? row.contact_email,
      contact_phone: data.contactPhone ?? row.contact_phone,
    });

    const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    res.json(serializeClient(updated));
  } catch (err) {
    console.error('Errore aggiornamento cliente:', err);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del cliente' });
  }
});

// DELETE /api/clients/:id — Delete client (only if no projects linked)
router.delete('/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  if (!row) return res.status(404).json({ error: 'Cliente non trovato' });

  // Non-admin can only delete their own clients
  if (!isAdmin(req.userId) && row.user_id !== req.userId) {
    return res.status(403).json({ error: 'Accesso non autorizzato' });
  }

  // Check if any projects are linked to this client
  const linkedProject = db.prepare('SELECT id FROM projects WHERE client_id = ? LIMIT 1').get(clientId);
  if (linkedProject) {
    return res.status(409).json({ error: 'Impossibile eliminare: il cliente ha dei progetti associati' });
  }

  db.prepare('DELETE FROM clients WHERE id = ?').run(clientId);
  res.json({ success: true });
});

module.exports = router;
