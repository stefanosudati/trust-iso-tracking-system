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

let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
} catch (err) {
  if (err.code === 'SQLITE_IOERR_SHORT_READ' || err.code === 'SQLITE_CORRUPT' || err.code === 'SQLITE_NOTADB') {
    console.error(`Database corrotto (${err.code}): ${DB_PATH} — ricreo il file.`);
    try { fs.unlinkSync(DB_PATH); } catch (_) {}
    try { fs.unlinkSync(DB_PATH + '-wal'); } catch (_) {}
    try { fs.unlinkSync(DB_PATH + '-shm'); } catch (_) {}
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  } else {
    throw err;
  }
}

// Performance: WAL mode for better concurrency
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

  CREATE TABLE IF NOT EXISTS clients (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name      TEXT NOT NULL DEFAULT '',
    sector            TEXT DEFAULT '',
    ateco             TEXT DEFAULT '',
    employees         TEXT DEFAULT '',
    legal_address     TEXT DEFAULT '',
    operational_sites TEXT DEFAULT '',
    contact_name      TEXT DEFAULT '',
    contact_role      TEXT DEFAULT '',
    contact_email     TEXT DEFAULT '',
    contact_phone     TEXT DEFAULT '',
    created_at        TEXT DEFAULT (datetime('now')),
    updated_at        TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_clients_user
    ON clients(user_id);

  CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'API Key',
    is_active INTEGER DEFAULT 1,
    expires_at TEXT,
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_api_keys_user
    ON api_keys(user_id);

  CREATE INDEX IF NOT EXISTS idx_api_keys_hash
    ON api_keys(key_hash);
`);

// Migrations
const migrations = [
  `ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'default'`,
  `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN is_approved INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN password_change_required INTEGER DEFAULT 0`,
  `ALTER TABLE projects ADD COLUMN client_id INTEGER REFERENCES clients(id)`,
  // Certification renewal tracking
  `ALTER TABLE projects ADD COLUMN certification_date TEXT DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN certification_expiry TEXT DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN next_audit_date TEXT DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN audit_cycle TEXT DEFAULT 'annual'`,
  `ALTER TABLE projects ADD COLUMN certification_status TEXT DEFAULT 'in_progress'`,
  // First-login tutorial tracking
  `ALTER TABLE users ADD COLUMN has_seen_tutorial INTEGER DEFAULT 0`,
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch (e) {
    if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
      console.error('Migration error:', e.message);
    }
  }
}

console.log(`Database SQLite inizializzato: ${DB_PATH}`);

module.exports = db;
