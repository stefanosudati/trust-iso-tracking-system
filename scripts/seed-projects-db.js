#!/usr/bin/env node
/**
 * Seed projects directly into SQLite DB (no API needed).
 * Requires clients to exist (run seed-clients-db.js first).
 *
 * Usage (in Docker container):
 *   DB_PATH=/data/db.sqlite node scripts/seed-projects-db.js
 *
 * Usage (local dev):
 *   node scripts/seed-projects-db.js
 */

const db = require('../server/db');
const { MILESTONE_TEMPLATES } = require('../server/constants');
const crypto = require('crypto');

// Find admin user
const admin = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
if (!admin) {
  console.error('Nessun utente admin trovato. Registra un utente prima di eseguire il seed.');
  process.exit(1);
}
const userId = admin.id;

// Find clients
const clients = db.prepare('SELECT id, company_name FROM clients WHERE user_id = ?').all(userId);
if (clients.length === 0) {
  console.error('Nessun cliente trovato. Esegui prima: node scripts/seed-clients-db.js');
  process.exit(1);
}
console.log(`Utente admin (id: ${userId}), ${clients.length} clienti trovati\n`);

// ─── Helpers ─────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pastDate(daysBack) {
  const d = new Date(); d.setDate(d.getDate() - daysBack);
  return d.toISOString().split('T')[0];
}
function futureDate(daysAhead) {
  const d = new Date(); d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

// ─── ISO 9001:2015 requirement IDs ──────────────────────────
const ALL_REQ_IDS = [
  '4.1','4.2','4.3','4.4','4.4.1','4.4.2',
  '5.1','5.1.1','5.1.2','5.2','5.2.1','5.2.2','5.3',
  '6.1','6.1.1','6.1.2','6.2','6.2.1','6.2.2','6.3',
  '7.1','7.1.1','7.1.2','7.1.3','7.1.4','7.1.5','7.1.5.1','7.1.5.2','7.1.6',
  '7.2','7.3','7.4','7.5','7.5.1','7.5.2','7.5.3',
  '8.1','8.2','8.2.1','8.2.2','8.2.3','8.2.3.1','8.2.3.2','8.2.4',
  '8.3','8.3.1','8.3.2','8.3.3','8.3.4','8.3.5','8.3.6',
  '8.4','8.4.1','8.4.2','8.4.3',
  '8.5','8.5.1','8.5.2','8.5.3','8.5.4','8.5.5','8.5.6',
  '8.6','8.7','8.7.1','8.7.2',
  '9.1','9.1.1','9.1.2','9.1.3','9.2','9.2.1','9.2.2','9.3','9.3.1','9.3.2','9.3.3',
  '10.1','10.2','10.2.1','10.2.2','10.3',
];

// ─── Evaluation generation ──────────────────────────────────
const NOTES = {
  implemented: [
    'Processo documentato e operativo. Ultima verifica positiva.',
    'Conforme. Evidenze disponibili nel SGQ documentale.',
    'Implementato secondo procedura approvata. Nessuna NC aperta.',
    'Requisito soddisfatto. Personale formato e consapevole.',
    'Completo. Registrazioni aggiornate e accessibili.',
    'Verificato durante audit interno. Nessuna osservazione.',
    'Processo maturo, KPI monitorati mensilmente.',
  ],
  partial: [
    'Procedura in fase di completamento. Mancano alcune registrazioni.',
    'Parzialmente implementato. Necessaria formazione aggiuntiva.',
    'Documentazione approvata ma implementazione incompleta.',
    'Processo definito ma non ancora sistematicamente applicato.',
    'In fase di adeguamento. Completamento previsto entro fine mese.',
    'Alcune evidenze mancanti. Azione correttiva in corso.',
  ],
  not_implemented: [
    'Da implementare. Pianificato nel prossimo trimestre.',
    'Non ancora affrontato. Necessaria analisi preliminare.',
    'Processo assente. Richiesta risorsa dedicata.',
    'In attesa di definizione responsabilità.',
    'Non implementato. Priorità bassa.',
  ],
  not_applicable: [
    'Non applicabile — l\'organizzazione non effettua progettazione.',
    'Escluso dal campo di applicazione. Giustificazione nel manuale SGQ.',
    'Non pertinente per il tipo di servizio erogato.',
  ],
};

const RESPONSIBLES = [
  'Marco Rossini', 'Giulia Fermi', 'Andrea Bianchi', 'Federica Rossi',
  'Roberto Gallo', 'Laura Conti', 'Paolo Moretti', 'Simona Ricci',
];

const EVIDENCE_POOL = [
  'Analisi SWOT aggiornata Q4 2025', 'Verbale riesame direzione 12/2025',
  'Registro rischi rev. 3', 'Piano formazione 2026 approvato',
  'Matrice competenze aggiornata', 'Report audit interno AI-2025-003',
  'Certificati taratura strumenti', 'Questionario soddisfazione clienti 2025',
  'Registro NC e AC aggiornato', 'Politica qualità rev. 5',
  'Organigramma aggiornato 01/2026', 'Piano obiettivi qualità 2026',
  'Checklist controllo processo produttivo', 'Report KPI Q3 2025',
];

const ACTION_TEXTS = [
  'Completare documentazione procedura', 'Formare il personale di reparto',
  'Definire KPI di processo', 'Aggiornare registro rischi',
  'Condurre gap analysis specifica', 'Redigere istruzione operativa',
  'Pianificare audit interno supplementare', 'Nominare responsabile di processo',
];

const PROFILES = {
  early:    { implemented: 0.10, partial: 0.20, not_implemented: 0.50, not_applicable: 0.05, not_evaluated: 0.15 },
  mid:      { implemented: 0.35, partial: 0.30, not_implemented: 0.15, not_applicable: 0.05, not_evaluated: 0.15 },
  advanced: { implemented: 0.60, partial: 0.20, not_implemented: 0.05, not_applicable: 0.05, not_evaluated: 0.10 },
  almost:   { implemented: 0.75, partial: 0.15, not_implemented: 0.02, not_applicable: 0.05, not_evaluated: 0.03 },
  mixed:    { implemented: 0.25, partial: 0.25, not_implemented: 0.25, not_applicable: 0.05, not_evaluated: 0.20 },
};

function pickStatus(profile) {
  const r = Math.random();
  let cumulative = 0;
  for (const [status, prob] of Object.entries(profile)) {
    cumulative += prob;
    if (r <= cumulative) return status;
  }
  return 'not_evaluated';
}

function generateEvaluations(profileKey) {
  const profile = PROFILES[profileKey];
  const evals = {};
  for (const reqId of ALL_REQ_IDS) {
    const status = pickStatus(profile);
    if (status === 'not_evaluated') continue;

    const ev = { status, notes: pick(NOTES[status]) };

    if (status === 'not_applicable') {
      ev.naJustification = pick(NOTES.not_applicable);
    }

    if (status === 'not_implemented') ev.priority = pick(['high', 'medium']);
    else if (status === 'partial') ev.priority = pick(['high', 'medium', 'low']);

    if (status === 'partial' || status === 'not_implemented') {
      ev.responsible = pick(RESPONSIBLES);
      ev.deadline = futureDate(rand(15, 120));
      ev.actions = Array.from({ length: rand(1, 3) }, (_, i) => ({
        id: `act-${reqId}-${i + 1}`,
        text: pick(ACTION_TEXTS),
        completed: status === 'partial' && Math.random() > 0.5,
        dueDate: futureDate(rand(10, 90)),
      }));
    }

    if (status === 'implemented' || status === 'partial') {
      ev.evidenceNotes = Array.from({ length: rand(1, 3) }, () => pick(EVIDENCE_POOL));
    }

    evals[reqId] = ev;
  }
  return evals;
}

// ─── Document generation ────────────────────────────────────
const DOC_TEMPLATES = [
  { name: 'Manuale del Sistema di Gestione Qualità', type: 'manual', reqRef: '4.4' },
  { name: 'Politica per la Qualità', type: 'policy', reqRef: '5.2' },
  { name: 'Obiettivi per la Qualità 2026', type: 'plan', reqRef: '6.2' },
  { name: 'Procedura Gestione Documenti e Registrazioni', type: 'procedure', reqRef: '7.5' },
  { name: 'Procedura Audit Interni', type: 'procedure', reqRef: '9.2' },
  { name: 'Procedura Gestione Non Conformità', type: 'procedure', reqRef: '10.2' },
  { name: 'Registro Rischi e Opportunità', type: 'register', reqRef: '6.1' },
  { name: 'Matrice delle Competenze', type: 'matrix', reqRef: '7.2' },
  { name: 'Piano di Formazione Annuale', type: 'plan', reqRef: '7.2' },
  { name: 'Procedura Gestione Fornitori', type: 'procedure', reqRef: '8.4' },
  { name: 'Piano di Taratura Strumenti', type: 'plan', reqRef: '7.1.5' },
  { name: 'Report Riesame di Direzione Q4 2025', type: 'report', reqRef: '9.3' },
  { name: 'Report Audit Interno AI-2025-003', type: 'report', reqRef: '9.2' },
  { name: 'Analisi Soddisfazione Clienti 2025', type: 'report', reqRef: '9.1.2' },
  { name: 'Organigramma e Responsabilità', type: 'chart', reqRef: '5.3' },
  { name: 'Mappa dei Processi', type: 'chart', reqRef: '4.4' },
  { name: 'Procedura Controllo Produzione', type: 'procedure', reqRef: '8.5.1' },
  { name: 'Registro Non Conformità', type: 'register', reqRef: '10.2' },
];

function generateDocuments(profileKey) {
  const numDocs = profileKey === 'early' ? rand(4, 7) : profileKey === 'almost' ? rand(14, 18) : rand(8, 13);
  const statusWeights = {
    early:    { draft: 0.60, approved: 0.10, obsolete: 0.30 },
    mid:      { draft: 0.50, approved: 0.40, obsolete: 0.10 },
    advanced: { draft: 0.20, approved: 0.70, obsolete: 0.10 },
    almost:   { draft: 0.10, approved: 0.85, obsolete: 0.05 },
    mixed:    { draft: 0.40, approved: 0.35, obsolete: 0.25 },
  };
  const w = statusWeights[profileKey];
  return [...DOC_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, numDocs).map(t => ({
    name: t.name, type: t.type, requirementRef: t.reqRef,
    status: (() => { const r = Math.random(); return r < w.draft ? 'draft' : r < w.draft + w.approved ? 'approved' : 'obsolete'; })(),
    revision: `Rev. ${rand(1, 5)}`,
    lastUpdated: pastDate(rand(5, 180)),
    notes: Math.random() > 0.5 ? pick([
      'In revisione per aggiornamento annuale',
      'Approvato dal Responsabile Qualità',
      'Da sottoporre a riesame direzione',
      'Aggiornato post audit interno',
    ]) : '',
  }));
}

// ─── Milestone generation ───────────────────────────────────
const MILESTONE_COMPLETION = {
  early:    [true, false, false, false, false, false, false, false, false, false, false],
  mid:      [true, true, true, false, false, false, false, false, false, false, false],
  advanced: [true, true, true, true, true, true, true, true, false, false, false],
  almost:   [true, true, true, true, true, true, true, true, true, true, false],
  mixed:    [true, true, false, false, false, false, false, false, false, false, false],
};

function generateMilestones(profileKey, startDate, targetDate) {
  const completion = MILESTONE_COMPLETION[profileKey];
  const start = new Date(startDate).getTime();
  const end = new Date(targetDate).getTime();
  return MILESTONE_TEMPLATES.map((t, i) => ({
    id: t.id, title: t.title, type: t.type,
    date: new Date(start + (end - start) * t.fraction).toISOString().split('T')[0],
    completed: completion[i] || false,
  }));
}

// ─── Project definitions ────────────────────────────────────
// Map clients by name prefix to link them
function findClient(namePrefix) {
  return clients.find(c => c.company_name.includes(namePrefix));
}

const PROJECTS = [
  {
    clientMatch: 'MotorTech',
    phase: 'gap_analysis', evalProfile: 'early',
    startDate: '2025-01-15', targetDate: '2025-10-30',
    certBody: 'RINA Services S.p.A.',
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Primo approccio alla certificazione ISO 9001 per accedere alla supply chain dei principali OEM europei.',
  },
  {
    clientMatch: 'PrecisionMech',
    phase: 'implementation', evalProfile: 'mid',
    startDate: '2025-02-01', targetDate: '2025-11-15',
    certBody: 'Bureau Veritas Italia',
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Gap analysis completata con esito positivo, avviata la fase di implementazione dei processi.',
  },
  {
    clientMatch: 'Delizie Toscane',
    phase: 'pre_audit', evalProfile: 'advanced',
    startDate: '2024-09-10', targetDate: '2025-06-20',
    certBody: 'DNV Business Assurance Italia',
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Audit interno completato con successo, risolte 3 NC minori. In preparazione per audit Stage 1.',
  },
  {
    clientMatch: 'CloudSoft',
    phase: 'gap_analysis', evalProfile: 'mixed',
    startDate: '2025-03-20', targetDate: '2025-12-10',
    certBody: 'TÜV SÜD Italia',
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Certificazione ISO 9001 richiesta da clienti enterprise per partecipazione a gare pubbliche.',
  },
  {
    clientMatch: 'ChemiTech',
    phase: 'audit', evalProfile: 'almost',
    startDate: '2024-06-15', targetDate: '2025-05-01',
    certBody: "Lloyd's Register EMEA",
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Audit Stage 1 superato, Stage 2 pianificato per aprile 2025. Zero NC maggiori.',
  },
  {
    clientMatch: 'Edilizia Verde',
    phase: 'implementation', evalProfile: 'mid',
    startDate: '2025-04-01', targetDate: '2026-01-31',
    certBody: 'Certiquality S.r.l.',
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Progetto avviato per requisiti bandi pubblici PNRR. Documentazione SGQ in fase di redazione.',
  },
  {
    clientMatch: 'Logistica Adriatica',
    phase: 'certified', evalProfile: 'almost',
    startDate: '2024-01-10', targetDate: '2024-11-30',
    certBody: 'SGS Italia S.p.A.',
    certStatus: 'certified', auditCycle: 'annual',
    certificationDate: '2024-12-05', certificationExpiry: '2027-12-04',
    nextAuditDate: '2025-12-01',
    notes: 'Certificazione ottenuta a dicembre 2024. Primo audit di sorveglianza previsto a dicembre 2025.',
  },
  {
    clientMatch: 'Studio Ingegneria',
    phase: 'gap_analysis', evalProfile: 'early',
    startDate: '2025-06-01', targetDate: '2026-03-15',
    certBody: 'Accredia / IMQ',
    certStatus: 'in_progress', auditCycle: 'annual',
    notes: 'Studio professionale che punta alla ISO 9001 per differenziarsi nel mercato della consulenza ingegneristica.',
  },
];

// ─── Insert into DB ─────────────────────────────────────────
const insertProject = db.prepare(`
  INSERT INTO projects (
    id, user_id, client_id, client_name, sector, ateco, employees,
    legal_address, operational_sites, contact_name, contact_role,
    contact_email, contact_phone, certification_id, start_date, target_date,
    cert_body, phase, notes, evaluations_json, documents_json, milestones_json,
    certification_date, certification_expiry, next_audit_date,
    audit_cycle, certification_status
  ) VALUES (
    @id, @user_id, @client_id, @client_name, @sector, @ateco, @employees,
    @legal_address, @operational_sites, @contact_name, @contact_role,
    @contact_email, @contact_phone, @certification_id, @start_date, @target_date,
    @cert_body, @phase, @notes, @evaluations_json, @documents_json, @milestones_json,
    @certification_date, @certification_expiry, @next_audit_date,
    @audit_cycle, @certification_status
  )
`);

const insertAll = db.transaction(() => {
  for (const proj of PROJECTS) {
    const client = findClient(proj.clientMatch);
    if (!client) {
      console.error(`  ! Cliente non trovato: ${proj.clientMatch} — skip`);
      continue;
    }

    // Get full client data for denormalized fields
    const clientData = db.prepare('SELECT * FROM clients WHERE id = ?').get(client.id);

    const evals = generateEvaluations(proj.evalProfile);
    const docs = generateDocuments(proj.evalProfile);
    const milestones = generateMilestones(proj.evalProfile, proj.startDate, proj.targetDate);
    const projId = `proj-${crypto.randomUUID().slice(0, 8)}`;

    const evalCount = Object.keys(evals).length;
    const implCount = Object.values(evals).filter(e => e.status === 'implemented').length;

    insertProject.run({
      id: projId,
      user_id: userId,
      client_id: client.id,
      client_name: clientData.company_name,
      sector: clientData.sector,
      ateco: clientData.ateco,
      employees: clientData.employees,
      legal_address: clientData.legal_address,
      operational_sites: clientData.operational_sites,
      contact_name: clientData.contact_name,
      contact_role: clientData.contact_role,
      contact_email: clientData.contact_email,
      contact_phone: clientData.contact_phone,
      certification_id: 'iso-9001-2015',
      start_date: proj.startDate,
      target_date: proj.targetDate,
      cert_body: proj.certBody,
      phase: proj.phase,
      notes: proj.notes,
      evaluations_json: JSON.stringify(evals),
      documents_json: JSON.stringify(docs),
      milestones_json: JSON.stringify(milestones),
      certification_date: proj.certificationDate || '',
      certification_expiry: proj.certificationExpiry || '',
      next_audit_date: proj.nextAuditDate || '',
      audit_cycle: proj.auditCycle,
      certification_status: proj.certStatus,
    });

    console.log(`  + [${projId}] ${clientData.company_name} — ${proj.phase} (${evalCount} eval, ${implCount} impl, ${docs.length} docs)`);
  }
});

const existing = db.prepare('SELECT COUNT(*) as count FROM projects').get();
if (existing.count > 0) {
  console.log(`Attenzione: ci sono già ${existing.count} progetti nel DB.`);
  console.log('Aggiungo comunque i nuovi progetti...\n');
}

console.log('Inserimento progetti:');
insertAll();

const total = db.prepare('SELECT COUNT(*) as count FROM projects').get();
console.log(`\nFatto! ${total.count} progetti totali nel DB.`);
