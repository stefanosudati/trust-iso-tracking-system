import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { serializeProject, toColumns, defaultMilestones } = require('../../server/routes/projects/helpers');

// ---------------------------------------------------------------------------
// serializeProject
// ---------------------------------------------------------------------------
describe('serializeProject', () => {
  it('converts snake_case DB row to camelCase client object', () => {
    const row = {
      id: 1,
      client_name: 'Acme Corp',
      phase: 'gap_analysis',
      start_date: '2026-01-01',
      target_date: '2026-12-31',
      cert_body: 'TUV',
      legal_address: '123 Main St',
      operational_sites: 'Site A, Site B',
      contact_name: 'John Doe',
      contact_role: 'Manager',
      contact_email: 'john@acme.com',
      contact_phone: '+1234567890',
      certification_id: 'iso-9001-2015',
      notes: 'Some notes',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
      evaluations_json: '[]',
      documents_json: '[]',
      milestones_json: '[]',
    };

    const result = serializeProject(row);

    expect(result.clientName).toBe('Acme Corp');
    expect(result.startDate).toBe('2026-01-01');
    expect(result.targetDate).toBe('2026-12-31');
    expect(result.certBody).toBe('TUV');
    expect(result.legalAddress).toBe('123 Main St');
    expect(result.operationalSites).toBe('Site A, Site B');
    expect(result.contactName).toBe('John Doe');
    expect(result.contactRole).toBe('Manager');
    expect(result.contactEmail).toBe('john@acme.com');
    expect(result.contactPhone).toBe('+1234567890');
    expect(result.certificationId).toBe('iso-9001-2015');
    expect(result.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2026-01-15T00:00:00Z');
  });

  it('parses JSON string fields into arrays/objects', () => {
    const evaluations = [{ id: 1, status: 'implemented' }];
    const documents = [{ id: 1, name: 'doc.pdf' }];
    const milestones = [{ id: 1, title: 'Kickoff' }];

    const row = {
      id: 1,
      client_name: 'Test',
      phase: 'audit',
      start_date: '2026-01-01',
      target_date: '2026-06-01',
      cert_body: '',
      legal_address: '',
      operational_sites: '',
      contact_name: '',
      contact_role: '',
      contact_email: '',
      contact_phone: '',
      certification_id: 'iso-9001-2015',
      notes: '',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      evaluations_json: JSON.stringify(evaluations),
      documents_json: JSON.stringify(documents),
      milestones_json: JSON.stringify(milestones),
    };

    const result = serializeProject(row);

    expect(result.evaluations).toEqual(evaluations);
    expect(result.documents).toEqual(documents);
    expect(result.milestones).toEqual(milestones);
  });

  it('handles empty or null JSON fields gracefully', () => {
    const row = {
      id: 2,
      client_name: 'Empty JSON',
      phase: 'implementation',
      start_date: '2026-02-01',
      target_date: '2026-08-01',
      cert_body: '',
      legal_address: '',
      operational_sites: '',
      contact_name: '',
      contact_role: '',
      contact_email: '',
      contact_phone: '',
      certification_id: 'iso-9001-2015',
      notes: '',
      created_at: '2026-02-01T00:00:00Z',
      updated_at: '2026-02-01T00:00:00Z',
      evaluations_json: null,
      documents_json: '',
      milestones_json: undefined,
    };

    const result = serializeProject(row);

    // evaluations parses to object {}, documents and milestones to arrays
    expect(typeof result.evaluations).toBe('object');
    expect(Array.isArray(result.documents)).toBe(true);
    expect(Array.isArray(result.milestones)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// toColumns
// ---------------------------------------------------------------------------
describe('toColumns', () => {
  it('converts camelCase client data to snake_case DB columns', () => {
    const data = {
      clientName: 'Acme Corp',
      startDate: '2026-01-01',
      targetDate: '2026-12-31',
      certBody: 'TUV',
      legalAddress: '123 Main St',
      operationalSites: 'Site A',
      contactName: 'Jane',
      contactRole: 'CTO',
      contactEmail: 'jane@acme.com',
      contactPhone: '+9876543210',
      certificationId: 'iso-27001-2022',
      phase: 'implementation',
      notes: 'Important notes',
    };

    const cols = toColumns(data);

    expect(cols.client_name).toBe('Acme Corp');
    expect(cols.start_date).toBe('2026-01-01');
    expect(cols.target_date).toBe('2026-12-31');
    expect(cols.cert_body).toBe('TUV');
    expect(cols.legal_address).toBe('123 Main St');
    expect(cols.operational_sites).toBe('Site A');
    expect(cols.contact_name).toBe('Jane');
    expect(cols.contact_role).toBe('CTO');
    expect(cols.contact_email).toBe('jane@acme.com');
    expect(cols.contact_phone).toBe('+9876543210');
    expect(cols.certification_id).toBe('iso-27001-2022');
    expect(cols.phase).toBe('implementation');
    expect(cols.notes).toBe('Important notes');
  });

  it('uses default values for missing fields', () => {
    const cols = toColumns({});

    expect(cols.client_name).toBe('');
    expect(cols.certification_id).toBe('iso-9001-2015');
    expect(cols.phase).toBe('gap_analysis');
  });
});

// ---------------------------------------------------------------------------
// defaultMilestones
// ---------------------------------------------------------------------------
describe('defaultMilestones', () => {
  const startDate = '2026-01-01';
  const targetDate = '2026-12-31';

  it('returns exactly 11 milestones', () => {
    const milestones = defaultMilestones(startDate, targetDate);
    expect(milestones).toHaveLength(11);
  });

  it('each milestone has the required fields: id, title, date, type, completed', () => {
    const milestones = defaultMilestones(startDate, targetDate);

    for (const m of milestones) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('title');
      expect(m).toHaveProperty('date');
      expect(m).toHaveProperty('type');
      expect(m).toHaveProperty('completed');
    }
  });

  it('all milestone dates fall between startDate and targetDate (inclusive)', () => {
    const milestones = defaultMilestones(startDate, targetDate);
    const start = new Date(startDate).getTime();
    const target = new Date(targetDate).getTime();

    for (const m of milestones) {
      const milestoneTime = new Date(m.date).getTime();
      expect(milestoneTime).toBeGreaterThanOrEqual(start);
      expect(milestoneTime).toBeLessThanOrEqual(target);
    }
  });
});
