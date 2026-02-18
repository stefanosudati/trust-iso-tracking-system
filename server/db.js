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

  CREATE TABLE IF NOT EXISTS changelog (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      TEXT NOT NULL,
    requirement_id  TEXT NOT NULL,
    user_id         INTEGER NOT NULL,
    user_name       TEXT NOT NULL,
    field           TEXT NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_changelog_project
    ON changelog(project_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_changelog_req
    ON changelog(project_id, requirement_id, created_at DESC);
`);

// Migrations
const migrations = [
  `ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'default'`,
  `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN is_approved INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN password_change_required INTEGER DEFAULT 0`,
];

for (const sql of migrations) {
  try { db.exec(sql); } catch (e) { /* Column already exists */ }
}

// Seed default admin user if none exists
const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('admin', 12);
  db.prepare(
    "INSERT INTO users (email, name, password_hash, role, is_approved, password_change_required) VALUES (?, ?, ?, 'admin', 1, 1)"
  ).run('admin@trust-iso.local', 'Amministratore', hash);
  console.log('Utente admin creato: admin@trust-iso.local / admin');
}

console.log(`Database SQLite inizializzato: ${DB_PATH}`);

module.exports = db;
