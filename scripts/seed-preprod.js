#!/usr/bin/env node
/**
 * Seed script for preprod — populates all 5 projects with realistic data:
 * evaluations, documents, milestones, and changelog entries via API.
 */

const BASE = process.env.SEED_API_URL;
const API_KEY = process.env.SEED_API_KEY;

if (!BASE || !API_KEY) {
  console.error('Error: SEED_API_URL and SEED_API_KEY are required.\n');
  console.error('Options:');
  console.error('  1. Copy scripts/.env.example → scripts/.env, fill values, then:');
  console.error('     node --env-file=scripts/.env scripts/seed-preprod.js\n');
  console.error('  2. Pass directly:');
  console.error('     SEED_API_URL=https://example.com/api SEED_API_KEY=tiso_xxx node scripts/seed-preprod.js');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

async function api(method, path, body) {
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── All requirement IDs from ISO 9001:2015 ──────────────────────────
const ALL_REQ_IDS = [
  '4.1', '4.2', '4.3', '4.4', '4.4.1', '4.4.2',
  '5.1', '5.1.1', '5.1.2', '5.2', '5.2.1', '5.2.2', '5.3',
  '6.1', '6.1.1', '6.1.2', '6.2', '6.2.1', '6.2.2', '6.3',
  '7.1', '7.1.1', '7.1.2', '7.1.3', '7.1.4', '7.1.5', '7.1.5.1', '7.1.5.2', '7.1.6',
  '7.2', '7.3', '7.4', '7.5', '7.5.1', '7.5.2', '7.5.3',
  '8.1', '8.2', '8.2.1', '8.2.2', '8.2.3', '8.2.3.1', '8.2.3.2', '8.2.4',
  '8.3', '8.3.1', '8.3.2', '8.3.3', '8.3.4', '8.3.5', '8.3.6',
  '8.4', '8.4.1', '8.4.2', '8.4.3',
  '8.5', '8.5.1', '8.5.2', '8.5.3', '8.5.4', '8.5.5', '8.5.6',
  '8.6', '8.7', '8.7.1', '8.7.2',
  '9.1', '9.1.1', '9.1.2', '9.1.3', '9.2', '9.2.1', '9.2.2', '9.3', '9.3.1', '9.3.2', '9.3.3',
  '10.1', '10.2', '10.2.1', '10.2.2', '10.3',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pastDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split('T')[0];
}
function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

// ─── Evaluation profiles per project ─────────────────────────────────
// Each profile determines the probability distribution of statuses

const PROFILES = {
  // Meccanica Rossi: certified, mostly implemented
  certified_mature: {
    implemented: 0.75, partial: 0.12, not_implemented: 0.03, not_applicable: 0.07, not_evaluated: 0.03,
  },
  // Pastificio Bianchi: implementation phase, mixed
  implementation: {
    implemented: 0.30, partial: 0.30, not_implemented: 0.20, not_applicable: 0.05, not_evaluated: 0.15,
  },
  // Studio Verdi: gap_analysis, mostly not evaluated
  gap_analysis: {
    implemented: 0.05, partial: 0.10, not_implemented: 0.25, not_applicable: 0.10, not_evaluated: 0.50,
  },
  // Digital Solutions: pre_audit, almost ready
  pre_audit: {
    implemented: 0.60, partial: 0.20, not_implemented: 0.08, not_applicable: 0.07, not_evaluated: 0.05,
  },
  // Cooperativa Aurora: certified but expired, some degraded
  certified_expired: {
    implemented: 0.55, partial: 0.20, not_implemented: 0.10, not_applicable: 0.08, not_evaluated: 0.07,
  },
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

// ─── Realistic notes per requirement ─────────────────────────────────
const NOTES_BY_STATUS = {
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
    'Parzialmente implementato. Necessaria formazione aggiuntiva al personale.',
    'Documentazione approvata ma implementazione incompleta in reparto produzione.',
    'Processo definito ma non ancora sistematicamente applicato in tutti i siti.',
    'In fase di adeguamento. Previsto completamento entro fine mese.',
    'Alcune evidenze mancanti. Azione correttiva AC-2024-015 in corso.',
  ],
  not_implemented: [
    'Da implementare. Pianificato nel prossimo trimestre.',
    'Non ancora affrontato. Necessaria analisi preliminare.',
    'Processo assente. Richiesta risorsa dedicata per sviluppo.',
    'In attesa di definizione responsabilità. Da discutere in riesame direzione.',
    'Non implementato. Priorità bassa, nessun impatto diretto sulla qualità del prodotto.',
  ],
  not_applicable: [
    'Non applicabile — l\'organizzazione non effettua progettazione.',
    'Escluso dal campo di applicazione. Giustificazione nel manuale SGQ.',
    'Non pertinente per il tipo di servizio erogato.',
    'Non applicabile — nessuna proprietà del cliente gestita.',
  ],
  not_evaluated: [
    'Da valutare nella prossima sessione di gap analysis.',
    'In attesa di raccolta evidenze.',
    '',
  ],
};

const PRIORITIES = ['high', 'medium', 'low'];
const RESPONSIBLES = [
  'Marco Rossi', 'Laura Bianchi', 'Andrea Verdi', 'Giulia Ferretti', 'Francesca Neri',
  'Paolo Conti', 'Sara Moretti', 'Luca Ricci', 'Elena Galli', 'Davide Barbieri',
];
const AUDIT_NOTES = [
  'Verificato durante audit interno del 15/01/2026. Conforme.',
  'Osservazione minore: migliorare tracciabilità registrazioni.',
  'NC minore rilevata in audit Stage 1. AC in corso.',
  'Punto di forza rilevato dall\'ente certificatore.',
  'Raccomandazione: integrare con indicatori di processo.',
  'Audit interno: evidenze sufficienti ma migliorabili.',
  '',
];
const EVIDENCE_NOTES_POOL = [
  'Analisi SWOT aggiornata Q4 2025',
  'Verbale riesame direzione 12/2025',
  'Registro rischi rev. 3',
  'Piano formazione 2026 approvato',
  'Matrice competenze aggiornata',
  'Report audit interno AI-2025-003',
  'Certificati taratura strumenti',
  'Questionario soddisfazione clienti 2025',
  'Registro NC e AC aggiornato',
  'Politica qualità rev. 5',
  'Organigramma aggiornato 01/2026',
  'Piano obiettivi qualità 2026',
  'Procedura gestione documenti PG-01 rev. 4',
  'Checklist controllo processo produttivo',
  'Report KPI Q3 2025',
  'Elenco fornitori qualificati',
  'Piano di manutenzione preventiva',
];

function generateEvaluation(reqId, profile) {
  const status = pickStatus(profile);
  if (status === 'not_evaluated') {
    return { status, notes: pick(NOTES_BY_STATUS.not_evaluated) };
  }

  const eval_ = {
    status,
    notes: pick(NOTES_BY_STATUS[status]),
    priority: status === 'not_implemented' ? pick(['high', 'medium']) : pick(PRIORITIES),
    responsible: pick(RESPONSIBLES),
  };

  if (status === 'not_implemented' || status === 'partial') {
    eval_.deadline = futureDate(rand(15, 120));
  }

  if (status === 'implemented' || status === 'partial') {
    eval_.auditNotes = pick(AUDIT_NOTES);
    const numEvidence = rand(1, 3);
    eval_.evidenceNotes = [];
    for (let i = 0; i < numEvidence; i++) {
      const note = pick(EVIDENCE_NOTES_POOL);
      if (!eval_.evidenceNotes.includes(note)) eval_.evidenceNotes.push(note);
    }
  }

  if (status === 'not_applicable') {
    eval_.naJustification = pick(NOTES_BY_STATUS.not_applicable);
  }

  // Actions for partial/not_implemented
  if (status === 'partial' || status === 'not_implemented') {
    const numActions = rand(1, 3);
    eval_.actions = [];
    const actionTexts = [
      'Completare documentazione procedura',
      'Formare il personale di reparto',
      'Acquisire strumentazione di misura',
      'Definire KPI di processo',
      'Aggiornare registro rischi',
      'Condurre gap analysis specifica',
      'Verificare conformità legislativa',
      'Redigere istruzione operativa',
      'Pianificare audit interno supplementare',
      'Nominare responsabile di processo',
    ];
    for (let i = 0; i < numActions; i++) {
      eval_.actions.push({
        id: `act-${reqId}-${i + 1}`,
        text: pick(actionTexts),
        completed: Math.random() > 0.6,
        dueDate: futureDate(rand(10, 90)),
      });
    }
  }

  return eval_;
}

// ─── Documents per project ───────────────────────────────────────────
const DOC_TEMPLATES = [
  { name: 'Manuale del Sistema di Gestione Qualità', type: 'manual', reqRef: '4.4' },
  { name: 'Politica per la Qualità', type: 'policy', reqRef: '5.2' },
  { name: 'Obiettivi per la Qualità 2026', type: 'plan', reqRef: '6.2' },
  { name: 'Procedura Gestione Documenti e Registrazioni', type: 'procedure', reqRef: '7.5' },
  { name: 'Procedura Audit Interni', type: 'procedure', reqRef: '9.2' },
  { name: 'Procedura Gestione Non Conformità e Azioni Correttive', type: 'procedure', reqRef: '10.2' },
  { name: 'Registro Rischi e Opportunità', type: 'register', reqRef: '6.1' },
  { name: 'Matrice delle Competenze', type: 'matrix', reqRef: '7.2' },
  { name: 'Piano di Formazione Annuale', type: 'plan', reqRef: '7.2' },
  { name: 'Procedura Gestione Fornitori', type: 'procedure', reqRef: '8.4' },
  { name: 'Procedura Riesame Contratti', type: 'procedure', reqRef: '8.2.3' },
  { name: 'Piano di Taratura Strumenti', type: 'plan', reqRef: '7.1.5' },
  { name: 'Procedura Progettazione e Sviluppo', type: 'procedure', reqRef: '8.3' },
  { name: 'Report Riesame di Direzione Q4 2025', type: 'report', reqRef: '9.3' },
  { name: 'Report Audit Interno AI-2025-003', type: 'report', reqRef: '9.2' },
  { name: 'Analisi Soddisfazione Clienti 2025', type: 'report', reqRef: '9.1.2' },
  { name: 'Organigramma e Responsabilità', type: 'chart', reqRef: '5.3' },
  { name: 'Mappa dei Processi', type: 'chart', reqRef: '4.4' },
  { name: 'Procedura Controllo Produzione', type: 'procedure', reqRef: '8.5.1' },
  { name: 'Registro Non Conformità', type: 'register', reqRef: '10.2' },
];

const DOC_STATUSES_BY_PHASE = {
  certified_mature: { approved: 0.85, draft: 0.10, obsolete: 0.05 },
  implementation: { approved: 0.40, draft: 0.55, obsolete: 0.05 },
  gap_analysis: { approved: 0.10, draft: 0.50, obsolete: 0.40 },
  pre_audit: { approved: 0.70, draft: 0.25, obsolete: 0.05 },
  certified_expired: { approved: 0.60, draft: 0.15, obsolete: 0.25 },
};

function pickDocStatus(profile) {
  const r = Math.random();
  let cumulative = 0;
  for (const [status, prob] of Object.entries(profile)) {
    cumulative += prob;
    if (r <= cumulative) return status;
  }
  return 'draft';
}

function generateDocuments(profileKey, numDocs) {
  const docs = [];
  const shuffled = [...DOC_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, numDocs);
  for (const template of shuffled) {
    docs.push({
      name: template.name,
      type: template.type,
      requirementRef: template.reqRef,
      status: pickDocStatus(DOC_STATUSES_BY_PHASE[profileKey]),
      revision: `Rev. ${rand(1, 5)}`,
      lastUpdated: pastDate(rand(5, 180)),
      notes: Math.random() > 0.5 ? pick([
        'In revisione per aggiornamento annuale',
        'Approvato dal Responsabile Qualità',
        'Da sottoporre a riesame direzione',
        'Aggiornato post audit interno',
        'Versione iniziale in bozza',
        'Richiede firma del Direttore Generale',
      ]) : '',
    });
  }
  return docs;
}

// ─── Milestone completion patterns ───────────────────────────────────
const MILESTONE_COMPLETION = {
  certified_mature: [true, true, true, true, true, true, true, true, true, true, true],
  implementation: [true, true, true, false, false, false, false, false, false, false, false],
  gap_analysis: [true, false, false, false, false, false, false, false, false, false, false],
  pre_audit: [true, true, true, true, true, true, true, true, false, false, false],
  certified_expired: [true, true, true, true, true, true, true, true, true, true, true],
};

// ─── Main seed function ──────────────────────────────────────────────
async function seed() {
  console.log('Fetching existing projects...');
  const projects = await api('GET', '/projects');
  console.log(`Found ${projects.length} projects\n`);

  if (projects.length === 0) {
    console.error('No projects found! Create projects first.');
    process.exit(1);
  }

  // Map projects to profiles by phase/name
  const projectProfiles = projects.map(p => {
    if (p.clientName.includes('Meccanica Rossi')) return { project: p, profileKey: 'certified_mature' };
    if (p.clientName.includes('Pastificio Bianchi')) return { project: p, profileKey: 'implementation' };
    if (p.clientName.includes('Studio Tecnico Verdi')) return { project: p, profileKey: 'gap_analysis' };
    if (p.clientName.includes('Digital Solutions')) return { project: p, profileKey: 'pre_audit' };
    if (p.clientName.includes('Cooperativa')) return { project: p, profileKey: 'certified_expired' };
    return { project: p, profileKey: 'implementation' }; // default
  });

  for (const { project, profileKey } of projectProfiles) {
    const profile = PROFILES[profileKey];
    console.log(`\n━━━ ${project.clientName} (${profileKey}) ━━━`);

    // 1. Populate evaluations for all requirements
    console.log('  Populating evaluations...');
    let evalCount = 0;
    for (const reqId of ALL_REQ_IDS) {
      const evaluation = generateEvaluation(reqId, profile);
      try {
        await api('PUT', `/projects/${project.id}/evaluations/${reqId}`, evaluation);
        evalCount++;
      } catch (err) {
        console.error(`    Error on ${reqId}: ${err.message}`);
      }
    }
    console.log(`  ✓ ${evalCount} evaluations saved`);

    // 2. Add documents
    const numDocs = profileKey === 'gap_analysis' ? rand(5, 8) : profileKey === 'certified_mature' ? rand(16, 20) : rand(10, 15);
    const docs = generateDocuments(profileKey, numDocs);
    console.log(`  Adding ${docs.length} documents...`);
    for (const doc of docs) {
      try {
        await api('POST', `/projects/${project.id}/documents`, doc);
      } catch (err) {
        console.error(`    Error adding doc: ${err.message}`);
      }
    }
    console.log(`  ✓ ${docs.length} documents added`);

    // 3. Update milestones with completion status
    const completionPattern = MILESTONE_COMPLETION[profileKey];
    const updatedMilestones = project.milestones.map((ms, i) => ({
      ...ms,
      completed: completionPattern[i] || false,
    }));
    console.log('  Updating milestones...');
    try {
      await api('PUT', `/projects/${project.id}/milestones`, updatedMilestones);
      const completed = updatedMilestones.filter(m => m.completed).length;
      console.log(`  ✓ ${completed}/${updatedMilestones.length} milestones marked complete`);
    } catch (err) {
      console.error(`  Error updating milestones: ${err.message}`);
    }

    // Small delay between projects to avoid overwhelming the server
    await new Promise(r => setTimeout(r, 500));
  }

  // Final summary
  console.log('\n━━━ SEED COMPLETE ━━━');
  const final = await api('GET', '/projects');
  for (const p of final) {
    const evals = Object.keys(p.evaluations || {}).length;
    const docs = (p.documents || []).length;
    const milestonesCompleted = (p.milestones || []).filter(m => m.completed).length;
    const milestoneTotal = (p.milestones || []).length;
    console.log(`  ${p.clientName.padEnd(40)} evals: ${evals}, docs: ${docs}, milestones: ${milestonesCompleted}/${milestoneTotal}`);
  }
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
