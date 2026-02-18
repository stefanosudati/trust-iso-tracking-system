const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(__dirname, '../data');
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'db.sqlite');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Performance: WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id                TEXT PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name       TEXT NOT NULL DEFAULT '',
    sector            TEXT DEFAULT '',
    ateco             TEXT DEFAULT '',
    employees         TEXT DEFAULT '',
    legal_address     TEXT DEFAULT '',
    operational_sites TEXT DEFAULT '',
    contact_name      TEXT DEFAULT '',
    contact_role      TEXT DEFAULT '',
    contact_email     TEXT DEFAULT '',
    contact_phone     TEXT DEFAULT '',
    certification_id  TEXT DEFAULT 'iso-9001-2015',
    start_date        TEXT DEFAULT '',
    target_date       TEXT DEFAULT '',
    cert_body         TEXT DEFAULT '',
    phase             TEXT DEFAULT 'gap_analysis',
    notes             TEXT DEFAULT '',
    evaluations_json  TEXT DEFAULT '{}',
    documents_json    TEXT DEFAULT '[]',
    milestones_json   TEXT DEFAULT '[]',
    created_at        TEXT DEFAULT (datetime('now')),
    updated_at        TEXT DEFAULT (datetime('now'))
  );
`);

console.log(`Database SQLite inizializzato: ${DB_PATH}`);

module.exports = db;
