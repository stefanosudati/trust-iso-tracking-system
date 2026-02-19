import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createApp } = require('../helpers/create-app');
const db = require('../../server/db');

let app, token;

beforeEach(async () => {
  db.exec('DELETE FROM changelog');
  db.exec('DELETE FROM projects');
  db.exec('DELETE FROM users');

  app = createApp();

  // Register admin user (first user gets admin role + auto-approved)
  const res = await request(app).post('/api/auth/register').send({
    email: 'admin@test.com',
    password: 'Test1234!',
    name: 'Admin',
  });
  token = res.body.token;
});

// ---------------------------------------------------------------------------
// Helper to create a project and return the response
// ---------------------------------------------------------------------------
function createProject(data = {}) {
  return request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ clientName: 'Acme Corp', ...data });
}

// ===========================================================================
// GET /api/projects — list projects
// ===========================================================================
describe('GET /api/projects', () => {
  it('returns an empty array when no projects exist', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all projects after creation', async () => {
    await createProject({ clientName: 'Alpha Ltd' });
    await createProject({ clientName: 'Beta Srl' });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const names = res.body.map((p) => p.clientName);
    expect(names).toContain('Alpha Ltd');
    expect(names).toContain('Beta Srl');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ===========================================================================
// POST /api/projects — create project
// ===========================================================================
describe('POST /api/projects', () => {
  it('creates a project with minimal data (clientName only)', async () => {
    const res = await createProject({ clientName: 'Minimal Corp' });

    expect(res.status).toBe(201);
    expect(res.body.clientName).toBe('Minimal Corp');
    expect(res.body.id).toBeDefined();
    expect(res.body.id).toMatch(/^proj-/);
  });

  it('returns auto-generated id starting with "proj-"', async () => {
    const res = await createProject();

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.id).toMatch(/^proj-/);
  });

  it('auto-generates default milestones', async () => {
    const res = await createProject();

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.milestones)).toBe(true);
    expect(res.body.milestones.length).toBeGreaterThan(0);

    // Verify milestones follow the template structure
    const first = res.body.milestones[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('date');
    expect(first).toHaveProperty('type');
    expect(first).toHaveProperty('completed');
    expect(first.completed).toBe(false);
  });

  it('creates a project with all fields populated', async () => {
    const fullData = {
      clientName: 'Full Corp',
      sector: 'Manufacturing',
      ateco: '25.11',
      employees: '50-100',
      legalAddress: 'Via Roma 1, Milano',
      operationalSites: '2 sites',
      contactName: 'Mario Rossi',
      contactRole: 'Quality Manager',
      contactEmail: 'mario@fullcorp.com',
      contactPhone: '+39 02 1234567',
      certificationId: 'iso-9001-2015',
      startDate: '2026-01-01',
      targetDate: '2026-12-31',
      certBody: 'DNV',
      phase: 'gap_analysis',
      notes: 'Test notes for the project',
    };

    const res = await createProject(fullData);

    expect(res.status).toBe(201);
    expect(res.body.clientName).toBe('Full Corp');
    expect(res.body.sector).toBe('Manufacturing');
    expect(res.body.ateco).toBe('25.11');
    expect(res.body.employees).toBe('50-100');
    expect(res.body.legalAddress).toBe('Via Roma 1, Milano');
    expect(res.body.operationalSites).toBe('2 sites');
    expect(res.body.contactName).toBe('Mario Rossi');
    expect(res.body.contactRole).toBe('Quality Manager');
    expect(res.body.contactEmail).toBe('mario@fullcorp.com');
    expect(res.body.contactPhone).toBe('+39 02 1234567');
    expect(res.body.certificationId).toBe('iso-9001-2015');
    expect(res.body.startDate).toBe('2026-01-01');
    expect(res.body.targetDate).toBe('2026-12-31');
    expect(res.body.certBody).toBe('DNV');
    expect(res.body.phase).toBe('gap_analysis');
    expect(res.body.notes).toBe('Test notes for the project');
  });

  it('sets default phase to gap_analysis when not provided', async () => {
    const res = await createProject({ clientName: 'Defaults Corp' });

    expect(res.status).toBe(201);
    expect(res.body.phase).toBe('gap_analysis');
  });

  it('returns 400 when phase is invalid', async () => {
    const res = await createProject({ clientName: 'Bad Phase', phase: 'invalid_phase' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('phase');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ clientName: 'No Auth Corp' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('initializes evaluations as empty object', async () => {
    const res = await createProject();

    expect(res.status).toBe(201);
    expect(res.body.evaluations).toEqual({});
  });

  it('initializes documents as empty array', async () => {
    const res = await createProject();

    expect(res.status).toBe(201);
    expect(res.body.documents).toEqual([]);
  });

  it('includes createdAt and updatedAt timestamps', async () => {
    const res = await createProject();

    expect(res.status).toBe(201);
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });
});

// ===========================================================================
// GET /api/projects/:id — get single project
// ===========================================================================
describe('GET /api/projects/:id', () => {
  it('returns a project by id', async () => {
    const created = await createProject({ clientName: 'GetMe Corp' });
    const id = created.body.id;

    const res = await request(app)
      .get(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.clientName).toBe('GetMe Corp');
  });

  it('returns the full project shape with all expected fields', async () => {
    const created = await createProject();
    const id = created.body.id;

    const res = await request(app)
      .get(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const expectedKeys = [
      'id', 'createdAt', 'updatedAt', 'clientName', 'sector', 'ateco',
      'employees', 'legalAddress', 'operationalSites', 'contactName',
      'contactRole', 'contactEmail', 'contactPhone', 'certificationId',
      'startDate', 'targetDate', 'certBody', 'phase', 'notes',
      'evaluations', 'documents', 'milestones',
    ];
    for (const key of expectedKeys) {
      expect(res.body).toHaveProperty(key);
    }
  });

  it('returns 404 for non-existent project', async () => {
    const res = await request(app)
      .get('/api/projects/proj-nonexistent-12345')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/projects/proj-any-id');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ===========================================================================
// PUT /api/projects/:id — update project
// ===========================================================================
describe('PUT /api/projects/:id', () => {
  it('updates clientName of an existing project', async () => {
    const created = await createProject({ clientName: 'Original Name' });
    const id = created.body.id;

    const res = await request(app)
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ clientName: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.clientName).toBe('Updated Name');
    expect(res.body.id).toBe(id);
  });

  it('updates phase of an existing project', async () => {
    const created = await createProject({ clientName: 'Phase Corp' });
    const id = created.body.id;

    const res = await request(app)
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ clientName: 'Phase Corp', phase: 'implementation' });

    expect(res.status).toBe(200);
    expect(res.body.phase).toBe('implementation');
  });

  it('updates multiple fields at once', async () => {
    const created = await createProject({ clientName: 'Multi Corp' });
    const id = created.body.id;

    const res = await request(app)
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientName: 'Multi Corp Updated',
        sector: 'Tech',
        certBody: 'Bureau Veritas',
        notes: 'Updated notes',
      });

    expect(res.status).toBe(200);
    expect(res.body.clientName).toBe('Multi Corp Updated');
    expect(res.body.sector).toBe('Tech');
    expect(res.body.certBody).toBe('Bureau Veritas');
    expect(res.body.notes).toBe('Updated notes');
  });

  it('preserves milestones when not included in update', async () => {
    const created = await createProject({ clientName: 'Keep Milestones' });
    const id = created.body.id;
    const originalMilestones = created.body.milestones;

    const res = await request(app)
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ clientName: 'Keep Milestones Updated' });

    expect(res.status).toBe(200);
    expect(res.body.milestones).toEqual(originalMilestones);
  });

  it('returns 404 when updating non-existent project', async () => {
    const res = await request(app)
      .put('/api/projects/proj-nonexistent-99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientName: 'Ghost Corp' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when updating with invalid phase', async () => {
    const created = await createProject({ clientName: 'Bad Update' });
    const id = created.body.id;

    const res = await request(app)
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ clientName: 'Bad Update', phase: 'not_a_real_phase' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('phase');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .put('/api/projects/proj-any-id')
      .send({ clientName: 'No Auth' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ===========================================================================
// DELETE /api/projects/:id — delete project
// ===========================================================================
describe('DELETE /api/projects/:id', () => {
  it('deletes an existing project', async () => {
    const created = await createProject({ clientName: 'Delete Me' });
    const id = created.body.id;

    const res = await request(app)
      .delete(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the project is actually gone
    const getRes = await request(app)
      .get(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });

  it('returns 404 when deleting non-existent project', async () => {
    const res = await request(app)
      .delete('/api/projects/proj-nonexistent-12345')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/projects/proj-any-id');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('does not affect other projects when one is deleted', async () => {
    const first = await createProject({ clientName: 'Survivor Corp' });
    const second = await createProject({ clientName: 'Doomed Corp' });

    await request(app)
      .delete(`/api/projects/${second.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    const listRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe(first.body.id);
    expect(listRes.body[0].clientName).toBe('Survivor Corp');
  });
});
