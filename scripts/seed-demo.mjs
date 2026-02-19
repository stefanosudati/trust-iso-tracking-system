#!/usr/bin/env node
/**
 * Seed script: login admin e crea 5 progetti demo con gap analysis popolata.
 *
 * Uso:
 *   node scripts/seed-demo.mjs https://trust.4piemai.it
 *   node scripts/seed-demo.mjs http://localhost:3002
 */

const fs = await import('fs');
const path = await import('path');

const BASE = process.argv[2] || 'http://localhost:3002';

// Credenziali da file esterno (non versionato)
const credsPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'seed-credentials.json');
if (!fs.existsSync(credsPath)) {
  console.error(`\n  Errore: manca il file ${credsPath}`);
  console.error('  Crea il file con: { "email": "...", "password": "..." }\n');
  process.exit(1);
}
const ADMIN = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

// ─── Tutti i requisiti ISO 9001:2015 ────────────────────────
const REQUIREMENTS = [
  '4.1','4.2','4.3','4.4','4.4.1','4.4.2',
  '5.1','5.1.1','5.1.2','5.2','5.2.1','5.2.2','5.3',
  '6.1','6.1.1','6.1.2','6.2','6.2.1','6.2.2','6.3',
  '7.1','7.1.1','7.1.2','7.1.3','7.1.4','7.1.5','7.1.5.1','7.1.5.2','7.1.6','7.2','7.3','7.4','7.5','7.5.1','7.5.2','7.5.3',
  '8.1','8.2','8.2.1','8.2.2','8.2.3','8.2.3.1','8.2.3.2','8.2.4','8.3','8.3.1','8.3.2','8.3.3','8.3.4','8.3.5','8.3.6','8.4','8.4.1','8.4.2','8.4.3','8.5','8.5.1','8.5.2','8.5.3','8.5.4','8.5.5','8.5.6','8.6','8.7','8.7.1','8.7.2',
  '9.1','9.1.1','9.1.2','9.1.3','9.2','9.2.1','9.2.2','9.3','9.3.1','9.3.2','9.3.3',
  '10.1','10.2','10.2.1','10.2.2','10.3'
];

// ─── Dati realistici per le note ────────────────────────────
const NOTES_IMPL = [
  'Procedura documentata e operativa. Personale formato.',
  'Sistema conforme, evidenze oggettive disponibili.',
  'Processo implementato e monitorato con indicatori KPI.',
  'Documentazione completa e aggiornata. Nessuna non conformità.',
  'Requisito pienamente soddisfatto. Verificato in audit interno.',
  'Processo standardizzato e integrato nel SGQ aziendale.',
  'Conforme. Ultima revisione documentale effettuata nel Q4 2024.',
  'Implementato secondo le best practice del settore.',
];

const NOTES_PARTIAL = [
  'Procedura esistente ma necessita aggiornamento.',
  'Implementazione in corso, completamento previsto entro 2 mesi.',
  'Documentazione parziale, mancano alcuni registri operativi.',
  'Sistema avviato ma non ancora completamente operativo.',
  'Processo definito ma manca formazione al personale operativo.',
  'Evidenze parziali, necessario completare la raccolta documentale.',
  'In fase di revisione per allineamento alla norma.',
];

const NOTES_NOT_IMPL = [
  'Requisito non ancora affrontato. Pianificato per il prossimo trimestre.',
  'Assenza di procedura documentata. Da sviluppare ex novo.',
  'Nessuna evidenza di conformità. Azione correttiva richiesta.',
  'Area critica: necessario intervento urgente.',
  'Non implementato. In attesa di risorse dedicate.',
];

const NOTES_NA = [
  'Non applicabile: l\'organizzazione non svolge attività di progettazione.',
  'Escluso dal campo di applicazione (giustificazione documentata).',
  'Non pertinente per il settore di attività aziendale.',
  'Requisito non applicabile per la natura dei servizi erogati.',
];

const AUDIT_NOTES = [
  'Verificato durante audit interno del {date}. Conforme.',
  'Auditor: nessuna osservazione. Evidenze adeguate.',
  'Osservazione minore: migliorare la tracciabilità dei documenti.',
  'Punto di forza dell\'organizzazione.',
  'Richiesta documentazione integrativa per completare la verifica.',
  'Non conformità minore rilevata e risolta in fase di audit.',
  'Da riverificare al prossimo audit di sorveglianza.',
  '',
];

const ACTIONS = [
  { text: 'Redigere procedura documentata', done: false },
  { text: 'Formare il personale coinvolto', done: false },
  { text: 'Aggiornare il manuale qualità', done: true },
  { text: 'Predisporre registri di monitoraggio', done: false },
  { text: 'Effettuare riesame della direzione', done: true },
  { text: 'Completare analisi dei rischi e opportunità', done: false },
  { text: 'Definire indicatori di performance (KPI)', done: true },
  { text: 'Verificare conformità fornitori critici', done: false },
  { text: 'Implementare sistema di gestione non conformità', done: false },
  { text: 'Revisionare organigramma e responsabilità', done: true },
  { text: 'Condurre audit interno di verifica', done: true },
  { text: 'Predisporre piano di miglioramento continuo', done: false },
];

const RESPONSIBLES = [
  'Marco Rossini', 'Giulia Fermi', 'Andrea Bianchi', 'Federica Rossi',
  'Roberto Gallo', 'Laura Conti', 'Paolo Moretti', 'Chiara Esposito',
  'Luca Colombo', 'Simona Ricci',
];

const EVIDENCES = [
  'Analisi SWOT', 'Manuale qualità', 'Procedura operativa',
  'Registro formazione', 'Verbale riesame direzione', 'Piano audit',
  'Registro non conformità', 'Scheda processo', 'Organigramma',
  'Politica della qualità', 'Obiettivi qualità', 'Piano di miglioramento',
  'Registro controlli', 'Rapporto audit interno', 'Lista fornitori qualificati',
];

// ─── Helpers ────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, min, max) {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function randomDate(start, months) {
  const d = new Date(start);
  d.setDate(d.getDate() + Math.floor(Math.random() * months * 30));
  return d.toISOString().split('T')[0];
}

/**
 * Genera evaluations per un progetto.
 * @param {string} profile - 'early' | 'mid' | 'advanced' | 'almost' | 'mixed'
 * @param {string} startDate
 */
function generateEvaluations(profile, startDate) {
  const evals = {};

  // Distribuzione status per profilo
  const weights = {
    early:    { implemented: 0.10, partial: 0.20, not_implemented: 0.50, not_applicable: 0.05, not_evaluated: 0.15 },
    mid:      { implemented: 0.35, partial: 0.30, not_implemented: 0.15, not_applicable: 0.05, not_evaluated: 0.15 },
    advanced: { implemented: 0.60, partial: 0.20, not_implemented: 0.05, not_applicable: 0.05, not_evaluated: 0.10 },
    almost:   { implemented: 0.75, partial: 0.15, not_implemented: 0.02, not_applicable: 0.05, not_evaluated: 0.03 },
    mixed:    { implemented: 0.25, partial: 0.25, not_implemented: 0.25, not_applicable: 0.05, not_evaluated: 0.20 },
  };

  const w = weights[profile] || weights.mid;

  for (const reqId of REQUIREMENTS) {
    const r = Math.random();
    let status;
    if (r < w.implemented) status = 'implemented';
    else if (r < w.implemented + w.partial) status = 'partial';
    else if (r < w.implemented + w.partial + w.not_implemented) status = 'not_implemented';
    else if (r < w.implemented + w.partial + w.not_implemented + w.not_applicable) status = 'not_applicable';
    else status = 'not_evaluated';

    // Skip non-evaluated (lascia vuoto)
    if (status === 'not_evaluated') continue;

    const evaluation = { status };

    // Notes
    if (status === 'implemented') evaluation.notes = pick(NOTES_IMPL);
    else if (status === 'partial') evaluation.notes = pick(NOTES_PARTIAL);
    else if (status === 'not_implemented') evaluation.notes = pick(NOTES_NOT_IMPL);
    else if (status === 'not_applicable') {
      evaluation.notes = '';
      evaluation.naJustification = pick(NOTES_NA);
    }

    // Priority (solo per non-implemented e partial)
    if (status === 'not_implemented') evaluation.priority = Math.random() > 0.3 ? 'high' : 'medium';
    else if (status === 'partial') evaluation.priority = pick(['high', 'medium', 'low']);
    else evaluation.priority = '';

    // Responsible & Deadline (per azioni aperte)
    if (status !== 'implemented' && status !== 'not_applicable') {
      evaluation.responsible = pick(RESPONSIBLES);
      evaluation.deadline = randomDate(startDate, 6);
    }

    // Actions (per partial e not_implemented)
    if (status === 'partial' || status === 'not_implemented') {
      evaluation.actions = pickN(ACTIONS, 1, 3).map(a => ({
        text: a.text,
        done: status === 'partial' ? a.done : false
      }));
    }

    // Evidence notes (per implemented e partial)
    if (status === 'implemented' || status === 'partial') {
      evaluation.evidenceNotes = pickN(EVIDENCES, 1, 4);
    }

    // Audit notes (principalmente per advanced/almost)
    if ((profile === 'advanced' || profile === 'almost') && Math.random() > 0.4) {
      const note = pick(AUDIT_NOTES);
      evaluation.auditNotes = note.replace('{date}', randomDate(startDate, 8));
    }

    evals[reqId] = evaluation;
  }

  return evals;
}

// ─── Progetti ───────────────────────────────────────────────
const PROJECTS = [
  {
    clientName: 'MotorTech Italia S.p.A.',
    sector: 'Automotive - Componenti e Fornitori',
    ateco: '29.31.00',
    employees: '450',
    legalAddress: 'Via dell\'Industria 15 - 10089 Settimo Torinese (TO)',
    operationalSites: 'Stabilimento principale (TO), Magazzino distribuzione (AL)',
    contactName: 'Marco Rossini',
    contactRole: 'Responsabile Qualità',
    contactEmail: 'm.rossini@motortech.it',
    contactPhone: '+39 011 123 4567',
    certificationId: 'iso-9001-2015',
    startDate: '2025-01-15',
    targetDate: '2025-10-30',
    certBody: 'RINA Services S.p.A.',
    phase: 'gap_analysis',
    notes: 'Azienda con 50 anni di esperienza nel settore automotive. Primo approccio alla certificazione ISO 9001 per accedere alla supply chain dei principali OEM europei.',
    _evalProfile: 'early',
  },
  {
    clientName: 'PrecisionMech S.r.l.',
    sector: 'Meccanica di Precisione',
    ateco: '25.29.00',
    employees: '85',
    legalAddress: 'Strada Provinciale 35 - 24035 Brignano Gera d\'Adda (BG)',
    operationalSites: 'Unica sede produttiva',
    contactName: 'Giulia Fermi',
    contactRole: 'Direttore Generale',
    contactEmail: 'g.fermi@precisionmech.it',
    contactPhone: '+39 0363 456 789',
    certificationId: 'iso-9001-2015',
    startDate: '2025-02-01',
    targetDate: '2025-11-15',
    certBody: 'Bureau Veritas Italia',
    phase: 'implementation',
    notes: 'PMI innovativa con focus su qualità e lavorazioni CNC ad alta precisione. Gap analysis completata con esito positivo, avviata la fase di implementazione dei processi.',
    _evalProfile: 'mid',
  },
  {
    clientName: 'Delizie Toscane S.p.A.',
    sector: 'Produzione Alimenti e Bevande',
    ateco: '10.39.00',
    employees: '120',
    legalAddress: 'Via dei Vigneti 42 - 53100 Siena (SI)',
    operationalSites: 'Stabilimento produttivo (SI), Uffici commerciali (FI)',
    contactName: 'Andrea Bianchi',
    contactRole: 'Responsabile Impianti',
    contactEmail: 'a.bianchi@delizie-toscane.it',
    contactPhone: '+39 0577 234 567',
    certificationId: 'iso-9001-2015',
    startDate: '2024-09-10',
    targetDate: '2025-06-20',
    certBody: 'DNV Business Assurance Italia',
    phase: 'pre_audit',
    notes: 'Azienda storica nel settore enogastronomico toscano. Audit interno completato con successo, risolte 3 non conformità minori. In preparazione per l\'audit esterno Stage 1.',
    _evalProfile: 'advanced',
  },
  {
    clientName: 'CloudSoft Consulting S.r.l.',
    sector: 'Servizi IT e Consulenza Digitale',
    ateco: '62.01.00',
    employees: '35',
    legalAddress: 'Via Montenapoleone 8 - 20121 Milano (MI)',
    operationalSites: 'Sede principale Milano, Filiale Roma',
    contactName: 'Federica Rossi',
    contactRole: 'Responsabile Qualità e Processi',
    contactEmail: 'f.rossi@cloudsoft.it',
    contactPhone: '+39 02 5555 1234',
    certificationId: 'iso-9001-2015',
    startDate: '2025-03-20',
    targetDate: '2025-12-10',
    certBody: 'TÜV SÜD Italia',
    phase: 'gap_analysis',
    notes: 'Startup innovativa specializzata in soluzioni cloud e DevOps. Certificazione ISO 9001 richiesta da clienti enterprise per partecipazione a gare pubbliche.',
    _evalProfile: 'mixed',
  },
  {
    clientName: 'ChemiTech Solutions S.p.A.',
    sector: 'Produzione Sostanze Chimiche',
    ateco: '20.13.00',
    employees: '250',
    legalAddress: 'Strada Statale 231 km 12 - 28100 Novara (NO)',
    operationalSites: 'Stabilimento principale Novara, Deposito logistico Vercelli',
    contactName: 'Roberto Gallo',
    contactRole: 'Direttore Qualità e Sicurezza',
    contactEmail: 'r.gallo@chemitech.it',
    contactPhone: '+39 0321 789 012',
    certificationId: 'iso-9001-2015',
    startDate: '2024-06-15',
    targetDate: '2025-05-01',
    certBody: "Lloyd's Register EMEA",
    phase: 'audit',
    notes: 'Azienda consolidata nel settore chimico con oltre 30 anni di attività. Audit Stage 1 superato, audit Stage 2 pianificato per aprile 2025. Zero non conformità maggiori rilevate.',
    _evalProfile: 'almost',
  }
];

// ─── API helper ─────────────────────────────────────────────
async function api(path, body, token, method = 'POST') {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data.error || JSON.stringify(data)}`);
  return data;
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  console.log(`\n  Seed demo → ${BASE}\n`);

  // 1. Login admin
  console.log('1. Login admin...');
  const data = await api('/auth/login', { email: ADMIN.email, password: ADMIN.password });
  const token = data.token;
  console.log(`   ✓ ${data.user.role}: ${data.user.email} (${data.user.name})`);

  // 2. Create projects with evaluations
  console.log('\n2. Creazione progetti con gap analysis...\n');
  for (let i = 0; i < PROJECTS.length; i++) {
    const { _evalProfile, ...projectData } = PROJECTS[i];
    const evaluations = generateEvaluations(_evalProfile, projectData.startDate);
    const evalCount = Object.keys(evaluations).length;
    const implCount = Object.values(evaluations).filter(e => e.status === 'implemented').length;
    const partCount = Object.values(evaluations).filter(e => e.status === 'partial').length;

    try {
      await api('/projects', { ...projectData, evaluations }, token);
      console.log(`   ✓ [${i + 1}/5] ${projectData.clientName}`);
      console.log(`          ${_evalProfile} — ${evalCount} valutazioni (${implCount} impl, ${partCount} parz)`);
    } catch (e) {
      console.error(`   ✗ [${i + 1}/5] ${projectData.clientName}: ${e.message}`);
    }
  }

  console.log('\n  Fatto!\n');
}

main().catch(e => { console.error('\nErrore:', e.message); process.exit(1); });
