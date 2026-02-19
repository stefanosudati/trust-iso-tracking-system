module.exports = {
  // Milestone templates for new projects
  MILESTONE_TEMPLATES: [
    { id: 'ms-1', title: 'Avvio progetto', fraction: 0, type: 'start' },
    { id: 'ms-2', title: 'Completamento Gap Analysis', fraction: 0.15, type: 'gap_analysis' },
    { id: 'ms-3', title: 'Documentazione SGQ completata', fraction: 0.40, type: 'documentation' },
    { id: 'ms-4', title: 'Implementazione processi', fraction: 0.55, type: 'implementation' },
    { id: 'ms-5', title: 'Formazione personale', fraction: 0.60, type: 'training' },
    { id: 'ms-6', title: 'Audit interno', fraction: 0.70, type: 'internal_audit' },
    { id: 'ms-7', title: 'Riesame di direzione', fraction: 0.75, type: 'management_review' },
    { id: 'ms-8', title: 'Azioni correttive pre-audit', fraction: 0.80, type: 'corrective_actions' },
    { id: 'ms-9', title: 'Audit Stage 1', fraction: 0.85, type: 'stage1' },
    { id: 'ms-10', title: 'Audit Stage 2', fraction: 0.92, type: 'stage2' },
    { id: 'ms-11', title: 'Certificazione', fraction: 1, type: 'certification' },
  ],

  // Fields tracked in changelog when evaluations change
  TRACKED_FIELDS: ['status', 'notes', 'priority', 'responsible', 'deadline', 'auditNotes', 'naJustification'],

  // Valid enum values
  VALID_STATUSES: ['implemented', 'partial', 'not_implemented', 'not_applicable', 'not_evaluated'],
  VALID_PRIORITIES: ['high', 'medium', 'low'],
  VALID_PHASES: ['gap_analysis', 'implementation', 'pre_audit', 'audit', 'certified'],
  VALID_DOC_STATUSES: ['draft', 'approved', 'obsolete'],
  VALID_THEMES: ['default', 'trust-corporate', 'ocean', 'forest', 'slate'],

  // Input limits
  MAX_CLIENT_NAME_LENGTH: 200,
  MAX_NOTES_LENGTH: 5000,
  MAX_CHANGELOG_LIMIT: 500,
};
