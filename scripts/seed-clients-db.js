#!/usr/bin/env node
/**
 * Seed clients directly into SQLite DB (no API needed).
 *
 * Usage (in Docker container):
 *   DB_PATH=/data/db.sqlite node scripts/seed-clients-db.js
 *
 * Usage (local dev):
 *   node scripts/seed-clients-db.js
 */

const db = require('../server/db');

// Find admin user (first user)
const admin = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
if (!admin) {
  console.error('Nessun utente admin trovato. Registra un utente prima di eseguire il seed.');
  process.exit(1);
}

const userId = admin.id;
console.log(`Utente admin trovato (id: ${userId})\n`);

const CLIENTS = [
  {
    company_name: 'MotorTech Italia S.p.A.',
    sector: 'Automotive - Componenti e Fornitori',
    ateco: '29.31.00',
    employees: '450',
    legal_address: 'Via dell\'Industria 15 - 10089 Settimo Torinese (TO)',
    operational_sites: 'Stabilimento principale (TO), Magazzino distribuzione (AL)',
    contact_name: 'Marco Rossini',
    contact_role: 'Responsabile Qualità',
    contact_email: 'm.rossini@motortech.it',
    contact_phone: '+39 011 123 4567',
  },
  {
    company_name: 'PrecisionMech S.r.l.',
    sector: 'Meccanica di Precisione',
    ateco: '25.29.00',
    employees: '85',
    legal_address: 'Strada Provinciale 35 - 24035 Brignano Gera d\'Adda (BG)',
    operational_sites: 'Unica sede produttiva',
    contact_name: 'Giulia Fermi',
    contact_role: 'Direttore Generale',
    contact_email: 'g.fermi@precisionmech.it',
    contact_phone: '+39 0363 456 789',
  },
  {
    company_name: 'Delizie Toscane S.p.A.',
    sector: 'Produzione Alimenti e Bevande',
    ateco: '10.39.00',
    employees: '120',
    legal_address: 'Via dei Vigneti 42 - 53100 Siena (SI)',
    operational_sites: 'Stabilimento produttivo (SI), Uffici commerciali (FI)',
    contact_name: 'Andrea Bianchi',
    contact_role: 'Responsabile Impianti',
    contact_email: 'a.bianchi@delizie-toscane.it',
    contact_phone: '+39 0577 234 567',
  },
  {
    company_name: 'CloudSoft Consulting S.r.l.',
    sector: 'Servizi IT e Consulenza Digitale',
    ateco: '62.01.00',
    employees: '35',
    legal_address: 'Via Montenapoleone 8 - 20121 Milano (MI)',
    operational_sites: 'Sede principale Milano, Filiale Roma',
    contact_name: 'Federica Rossi',
    contact_role: 'Responsabile Qualità e Processi',
    contact_email: 'f.rossi@cloudsoft.it',
    contact_phone: '+39 02 5555 1234',
  },
  {
    company_name: 'ChemiTech Solutions S.p.A.',
    sector: 'Produzione Sostanze Chimiche',
    ateco: '20.13.00',
    employees: '250',
    legal_address: 'Strada Statale 231 km 12 - 28100 Novara (NO)',
    operational_sites: 'Stabilimento principale Novara, Deposito logistico Vercelli',
    contact_name: 'Roberto Gallo',
    contact_role: 'Direttore Qualità e Sicurezza',
    contact_email: 'r.gallo@chemitech.it',
    contact_phone: '+39 0321 789 012',
  },
  {
    company_name: 'Edilizia Verde S.r.l.',
    sector: 'Costruzioni e Bioedilizia',
    ateco: '41.20.00',
    employees: '65',
    legal_address: 'Via Roma 112 - 50123 Firenze (FI)',
    operational_sites: 'Sede legale Firenze, Cantieri attivi Toscana e Umbria',
    contact_name: 'Simona Ricci',
    contact_role: 'Responsabile SGQ',
    contact_email: 's.ricci@ediliziaverde.it',
    contact_phone: '+39 055 678 9012',
  },
  {
    company_name: 'Logistica Adriatica S.p.A.',
    sector: 'Trasporto e Logistica',
    ateco: '52.29.10',
    employees: '310',
    legal_address: 'Porto Industriale, Banchina 7 - 60121 Ancona (AN)',
    operational_sites: 'Hub Ancona, Depositi Pescara e Bari',
    contact_name: 'Paolo Moretti',
    contact_role: 'Direttore Operativo',
    contact_email: 'p.moretti@logisticaadriatica.it',
    contact_phone: '+39 071 345 6789',
  },
  {
    company_name: 'Studio Ingegneria Conti & Associati',
    sector: 'Servizi di Ingegneria e Consulenza Tecnica',
    ateco: '71.12.10',
    employees: '18',
    legal_address: 'Corso Vittorio Emanuele II 34 - 00186 Roma (RM)',
    operational_sites: 'Unica sede',
    contact_name: 'Laura Conti',
    contact_role: 'Titolare',
    contact_email: 'l.conti@studioconti.it',
    contact_phone: '+39 06 9876 5432',
  },
];

const insert = db.prepare(`
  INSERT INTO clients (user_id, company_name, sector, ateco, employees, legal_address,
    operational_sites, contact_name, contact_role, contact_email, contact_phone)
  VALUES (@user_id, @company_name, @sector, @ateco, @employees, @legal_address,
    @operational_sites, @contact_name, @contact_role, @contact_email, @contact_phone)
`);

const insertAll = db.transaction((clients) => {
  for (const client of clients) {
    const result = insert.run({ user_id: userId, ...client });
    console.log(`  + [id:${result.lastInsertRowid}] ${client.company_name}`);
  }
});

// Check for existing clients
const existing = db.prepare('SELECT COUNT(*) as count FROM clients').get();
if (existing.count > 0) {
  console.log(`Attenzione: ci sono già ${existing.count} clienti nel DB.`);
  console.log('Aggiungo comunque i nuovi clienti...\n');
}

console.log('Inserimento clienti:');
insertAll(CLIENTS);
console.log(`\nFatto! ${CLIENTS.length} clienti inseriti.`);
