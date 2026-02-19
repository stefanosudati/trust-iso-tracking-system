const db = require('../../db');
const { MILESTONE_TEMPLATES } = require('../../constants');

/** Convert DB row (snake_case) -> client object (camelCase) */
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
    milestones: JSON.parse(row.milestones_json || '[]'),
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
    notes: data.notes ?? '',
  };
}

/** Generate default milestones from templates */
function defaultMilestones(startDate, targetDate) {
  const start = startDate ? new Date(startDate) : new Date();
  const target = targetDate ? new Date(targetDate) : new Date(start.getTime() + 365 * 86400000);
  const duration = target.getTime() - start.getTime();

  return MILESTONE_TEMPLATES.map((t) => ({
    id: t.id,
    title: t.title,
    date: new Date(start.getTime() + duration * t.fraction).toISOString().split('T')[0],
    type: t.type,
    completed: false,
  }));
}

/** Get project row — all authenticated users can access any project */
function getProjectRow(projectId, columns = '*') {
  return db.prepare(`SELECT ${columns} FROM projects WHERE id = ?`).get(projectId);
}

module.exports = { serializeProject, toColumns, defaultMilestones, getProjectRow };
