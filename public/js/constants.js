/**
 * Frontend shared constants — single source of truth for duplicated values.
 */

/* eslint-disable no-unused-vars */

const DEFAULT_EVALUATION = {
  status: 'not_evaluated',
  notes: '',
  priority: 'medium',
  responsible: '',
  deadline: '',
  actions: [],
  evidenceNotes: [],
  auditNotes: '',
  history: []
};

const MANDATORY_DOCS = [
  { name: 'Campo di applicazione del SGQ', req: '4.3' },
  { name: 'Politica per la qualità', req: '5.2' },
  { name: 'Obiettivi per la qualità', req: '6.2' },
  { name: 'Evidenze di competenza', req: '7.2' },
  { name: 'Procedura gestione informazioni documentate', req: '7.5' },
  { name: 'Procedura audit interni', req: '9.2' },
  { name: 'Registrazioni riesame di direzione', req: '9.3' },
  { name: 'Registrazioni non conformità e azioni correttive', req: '10.2' }
];

const TOAST_DURATION = 3000;
const TOAST_FADE_MS = 300;
const AUTOSAVE_INTERVAL = 30000;
