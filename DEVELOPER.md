# Trust ISO Tracking System - Guida Completa per Sviluppatori

> Versione: 0.1.0-beta | Ultimo aggiornamento: febbraio 2026

Questa guida e pensata per sviluppatori che conoscono le basi di JavaScript ma si avvicinano per la prima volta a questo progetto. Ogni sezione spiega non solo il "come" ma anche il "perche" delle scelte progettuali.

---

## Indice

1. [Architettura](#1-architettura)
2. [Struttura del progetto](#2-struttura-del-progetto)
3. [Stack tecnologico](#3-stack-tecnologico)
4. [Setup locale](#4-setup-locale)
5. [Database](#5-database)
6. [API REST](#6-api-rest)
7. [Autenticazione](#7-autenticazione)
8. [Frontend](#8-frontend)
9. [Testing](#9-testing)
10. [Docker e Deployment](#10-docker-e-deployment)
11. [Deploy su Coolify](#11-deploy-su-coolify)
12. [Seed e dati demo](#12-seed-e-dati-demo)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Architettura

### Panoramica

L'applicazione e un **sistema di tracciamento delle certificazioni ISO 9001:2015** pensato per consulenti qualita. L'architettura segue il pattern classico **SPA + REST API + Database embedded**:

```
+------------------------------------------------------+
|                   BROWSER (Client)                    |
|                                                       |
|   index.html (shell unica)                            |
|      |                                                |
|      +-- js/app.js        (controller SPA, routing)   |
|      +-- js/api-client.js (HTTP client + cache)       |
|      +-- js/auth.js       (UI login/registrazione)    |
|      +-- js/views.js      (facade moduli vista)       |
|      +-- js/views/*.js    (11 moduli vista)           |
|      +-- js/themes.js     (temi CSS dinamici)         |
|      +-- js/tutorial.js   (wizard primo accesso)      |
|      +-- js/md-export.js  (export Markdown)           |
|      +-- js/constants.js  (costanti condivise)        |
|      +-- data/iso9001.js  (dati normativi)            |
|                                                       |
+----------------------------+--------------------------+
                             |
                  HTTP REST (JSON)
              + Header Authorization:
                Bearer <JWT> oppure
                X-API-Key: tiso_xxx
                             |
+----------------------------+--------------------------+
|               EXPRESS.JS SERVER (Node.js)             |
|                                                       |
|   index.js (entry point, middleware, routing)          |
|      |                                                |
|      +-- middleware/auth.js          (JWT + API Key)   |
|      +-- middleware/validate.js      (validazione)     |
|      +-- middleware/error-handler.js (errori)          |
|      |                                                |
|      +-- routes/auth.js      (registrazione, login)   |
|      +-- routes/projects/    (CRUD + sotto-risorse)   |
|      +-- routes/clients.js   (anagrafica clienti)     |
|      +-- routes/api-keys.js  (gestione chiavi API)    |
|      +-- routes/admin.js     (pannello admin)         |
|      +-- routes/health.js    (healthcheck)            |
|      |                                                |
|      +-- db.js         (connessione + schema SQLite)  |
|      +-- constants.js  (costanti condivise backend)   |
|      +-- email.js      (invio email SMTP)             |
|      +-- scheduler.js  (email periodiche changelog)   |
|                                                       |
+----------------------------+--------------------------+
                             |
                  Query SQL sincrone
              (better-sqlite3, WAL mode)
                             |
+----------------------------+--------------------------+
|                  SQLite Database                      |
|                                                       |
|   db.sqlite     (file principale)                     |
|   db.sqlite-wal (write-ahead log)                     |
|   db.sqlite-shm (shared memory)                       |
|                                                       |
|   Tabelle: users, projects, changelog,                |
|            clients, app_settings, api_keys            |
+------------------------------------------------------+
```

### Flusso di una richiesta tipica

Per capire come funziona l'applicazione, seguiamo una richiesta reale passo dopo passo:

1. L'utente apre la dashboard nel browser. Il frontend chiama `ApiClient._fetch('/projects')`.
2. `ApiClient` aggiunge automaticamente l'header `Authorization: Bearer <jwt-token>` alla richiesta HTTP.
3. Express riceve la richiesta su `/api/projects`.
4. Il middleware `requireAuth` estrae il token dall'header, lo verifica con `jsonwebtoken`, e imposta `req.userId` con l'ID dell'utente.
5. La route `GET /api/projects` esegue una query SQLite sincrona per recuperare tutti i progetti.
6. La response JSON torna al frontend, che aggiorna la cache locale in `ApiClient`.
7. La funzione di rendering (es. `DashboardView.render()`) genera l'HTML e lo inserisce nel DOM.
8. La funzione di binding (es. `DashboardView.bind()`) attacca gli event listener.

### Decisioni architetturali chiave

| Decisione | Motivazione |
|-----------|-------------|
| Vanilla JS (no framework) | Semplicita, zero dipendenze di build, caricamento istantaneo |
| SQLite (no PostgreSQL/MySQL) | Database embedded, zero configurazione, un singolo file da backuppare |
| `better-sqlite3` (sincrono) | API sincrona = codice piu semplice, nessun callback/promise per le query |
| Nessun bundler (no webpack/vite) | I file JS vengono serviti direttamente come static files |
| JWT + API Key doppia autenticazione | JWT per l'interfaccia web, API Key per integrazioni e script |
| JSON nei campi SQLite | Le valutazioni (`evaluations_json`), i documenti (`documents_json`) e le milestone (`milestones_json`) sono salvati come JSON stringificato dentro colonne TEXT. Questo evita di creare decine di tabelle relazionali per strutture dati annidiate e variabili |

---

## 2. Struttura del progetto

Questa e la struttura completa della directory. Ogni file e descritto con la sua funzione.

```
trust-iso-tracker/
|
|-- server/                          # Backend Express.js
|   |-- index.js                     # Entry point: configura Express, monta le route,
|   |                                #   serve file statici, SPA fallback, avvia scheduler
|   |-- db.js                        # Connessione SQLite, schema di tutte le tabelle,
|   |                                #   migrazioni incrementali, auto-recovery da corruzione
|   |-- constants.js                 # Costanti condivise: template milestone, campi tracciati,
|   |                                #   valori enum validi, limiti di input
|   |-- email.js                     # Wrapper Nodemailer per invio email SMTP (opzionale)
|   |-- scheduler.js                 # Scheduler periodico per email riepilogo changelog
|   |
|   |-- middleware/
|   |   |-- auth.js                  # requireAuth (JWT + API Key dual auth)
|   |   |                            # requireAdmin (verifica ruolo admin)
|   |   |-- validate.js              # validateProjectInput(), validateEvaluationInput()
|   |   |-- error-handler.js         # asyncHandler() wrapper, errorHandler() centralizzato
|   |
|   |-- routes/
|       |-- auth.js                  # POST register, POST login, GET /me, PUT theme,
|       |                            #   PUT password, PUT tutorial-complete
|       |-- admin.js                 # GET/POST users, PUT approve/role, DELETE users,
|       |                            #   POST send-changelog-summary, GET/PUT api-keys
|       |-- clients.js               # CRUD completo clienti (admin vede tutti)
|       |-- api-keys.js              # CRUD chiavi API (create, list, update, delete)
|       |-- health.js                # GET /health (nessuna autenticazione)
|       |
|       |-- projects/                # Route progetti suddivise in moduli
|           |-- index.js             # Router principale, monta i sotto-moduli
|           |-- crud.js              # GET lista, POST crea, GET/:id, PUT/:id, DELETE/:id
|           |-- evaluations.js       # PUT /:id/evaluations/:reqId (con changelog)
|           |-- documents.js         # POST/PUT/DELETE /:id/documents/:docId
|           |-- milestones.js        # PUT /:id/milestones
|           |-- changelog.js         # GET /:id/changelog, GET /:id/changelog/:reqId
|           |-- helpers.js           # serializeProject(), toColumns(), defaultMilestones()
|
|-- public/                          # Frontend SPA (servito come static da Express)
|   |-- index.html                   # Shell HTML unica — carica Tailwind CSS, Lucide,
|   |                                #   jsPDF via CDN + tutti i file JS locali
|   |-- manifest.json                # PWA manifest (nome app, icone, colore tema)
|   |
|   |-- img/                         # Risorse grafiche
|   |   |-- logo.png                 # Logo dell'applicazione
|   |   |-- favicon.ico              # Favicon classico
|   |   |-- favicon-16x16.png        # Favicon 16px
|   |   |-- favicon-32x32.png        # Favicon 32px
|   |   |-- apple-touch-icon.png     # Icona per dispositivi Apple
|   |   |-- icon-192x192.png         # Icona PWA 192px
|   |   |-- icon-512x512.png         # Icona PWA 512px
|   |
|   |-- data/
|   |   |-- iso9001.js               # Dati ISO 9001:2015: clausole, requisiti, descrizioni
|   |                                #   Esporta: CERTIFICATIONS, flattenRequirements(),
|   |                                #   countRequirements(). 82 requisiti (clausole 4-10)
|   |
|   |-- js/
|       |-- constants.js             # Costanti frontend: DEFAULT_EVALUATION, MANDATORY_DOCS,
|       |                            #   TOAST_DURATION, TOAST_FADE_MS, AUTOSAVE_INTERVAL
|       |-- api-client.js            # Client REST con cache locale. L'alias Store = ApiClient
|       |                            #   e usato per retrocompatibilita
|       |-- themes.js                # Sistema temi con CSS custom properties (5 temi)
|       |-- auth.js                  # UI login/registrazione + flusso cambio password forzato
|       |-- tutorial.js              # Wizard onboarding in 7 passi (flag has_seen_tutorial)
|       |-- md-export.js             # Export in formato Markdown (GuideExport)
|       |-- views.js                 # Facade sottile: delega ai moduli vista, contiene
|       |                            #   helper per il changelog (_fieldLabel, _formatChangeValue)
|       |-- app.js                   # Controller principale SPA: navigazione, sidebar,
|       |                            #   utility, gestione stato attivo
|       |
|       |-- views/                   # 11 moduli vista (uno per sezione dell'app)
|           |-- dashboard-view.js    # Panoramica progetti + dashboard singolo progetto
|           |-- projects-view.js     # Lista progetti + form crea/modifica con dropdown clienti
|           |-- project-detail-view.js # Dettaglio progetto singolo
|           |-- clause-view.js       # Vista clausola ISO con lista requisiti
|           |-- requirement-view.js  # Valutazione singolo requisito (status, note, azioni)
|           |-- documents-view.js    # Gestione documenti SGQ (manuale, procedure, registri)
|           |-- timeline-view.js     # Timeline milestone (11 predefinite + personalizzabili)
|           |-- reports-view.js      # Report e statistiche
|           |-- settings-view.js     # Impostazioni utente, tema, password, chiavi API
|           |-- admin-view.js        # Pannello admin: lista utenti, crea, approva, ruoli
|           |-- clients-view.js      # Gestione anagrafica clienti
|
|-- scripts/                         # Script di utilita e seeding
|   |-- seed-demo.mjs               # Crea 5 progetti demo via API (richiede credenziali)
|   |-- seed-preprod.js              # Popola progetti via API con API Key (completo)
|   |-- seed-clients-db.js           # Inserisce 8 clienti direttamente nel DB
|   |-- seed-projects-db.js          # Inserisce 8 progetti con dati completi nel DB
|   |-- seed-credentials.json        # Credenziali admin per seed-demo (gitignored)
|   |-- seed-credentials-example.json # Template credenziali
|   |-- .env.example                 # Template variabili per seed-preprod
|
|-- tests/                           # Test automatizzati (Vitest + Supertest)
|   |-- setup.js                     # Setup globale: JWT_SECRET test, DB_PATH=:memory:
|   |-- health.test.js               # 1 test healthcheck
|   |-- helpers/
|   |   |-- create-app.js            # Factory Express app per i test
|   |-- api/
|   |   |-- auth.test.js             # 30 test autenticazione
|   |   |-- projects.test.js         # 28 test CRUD progetti
|   |   |-- admin.test.js            # 9 test funzioni admin
|   |-- unit/
|       |-- validation.test.js       # 9 test validazione input
|       |-- helpers.test.js          # 8 test funzioni helper
|
|-- data/                            # Directory database locale (dev)
|   |-- db.sqlite                    # File database SQLite (gitignored)
|
|-- Dockerfile                       # Build multi-stage (Node 20 Alpine)
|-- docker-compose.yml               # Compose con volume persistente e healthcheck
|-- package.json                     # Dipendenze, script npm, metadati progetto
|-- package-lock.json                # Lockfile dipendenze (versionato)
|-- .env                             # Variabili ambiente locale (gitignored)
|-- .env.example                     # Template variabili ambiente
|-- .eslintrc.json                   # Configurazione ESLint con globali frontend
|-- .gitignore                       # File e directory esclusi da Git
|-- CLAUDE.md                        # Contesto progetto per Claude Code AI
|-- DEVELOPER.md                     # Questa guida
```

---

## 3. Stack tecnologico

| Componente | Tecnologia | Perche questa scelta |
|-----------|-----------|---------------------|
| **Runtime** | Node.js 20 | LTS stabile. Alpine in Docker per immagini leggere (~120 MB) |
| **Server** | Express 4 | Framework web standard per Node.js. Semplice, maturo, enorme ecosistema di middleware |
| **Database** | SQLite 3 via `better-sqlite3` | Database embedded (nessun server separato da gestire). API sincrona = codice semplice senza callback. Un singolo file da backuppare. Perfetto per applicazioni single-tenant |
| **Auth** | `jsonwebtoken` + `bcryptjs` | JWT per autenticazione stateless (nessuna sessione lato server). bcrypt con 12 round per hash password sicuri |
| **Email** | `nodemailer` | Invio email SMTP opzionale per notifiche changelog. Se non configurato, l'applicazione funziona ugualmente |
| **Env** | `dotenv` | Caricamento variabili d'ambiente da file `.env` per sviluppo locale |
| **Frontend** | Vanilla JavaScript | Nessun framework, nessun bundler, nessuna compilazione. I file JS vengono serviti cosi come sono. Caricamento istantaneo, zero complessita di build |
| **CSS** | Tailwind CSS (CDN) | CSS utility-first, caricato da CDN. CSS custom properties (variabili) per i temi |
| **Icone** | Lucide (CDN) | Libreria icone SVG leggera, create dinamicamente via JavaScript |
| **PDF** | jsPDF (CDN) | Generazione PDF lato client, nessun carico sul server |
| **Container** | Docker (Alpine) | Build multi-stage per immagini minime. Healthcheck integrato |
| **Test** | Vitest + Supertest | Vitest e veloce e compatibile con la sintassi Jest. Supertest permette test HTTP senza avviare il server |
| **Lint** | ESLint | Analisi statica del codice con regole personalizzate |

### Dipendenze di produzione

```json
{
  "bcryptjs": "^2.4.3",
  "better-sqlite3": "^11.7.0",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^8.0.1"
}
```

### Dipendenze di sviluppo

```json
{
  "eslint": "^8.57.0",
  "supertest": "^6.3.4",
  "vitest": "^1.6.0"
}
```

---

## 4. Setup locale

### Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js 20** o superiore ([download](https://nodejs.org/)). Puoi verificare con `node --version`.
- **npm** (incluso con Node.js). Verifica con `npm --version`.
- Su **macOS**, avrai bisogno degli strumenti di compilazione per `better-sqlite3`. Se non li hai, esegui:
  ```bash
  xcode-select --install
  ```
- Su **Linux** (Debian/Ubuntu):
  ```bash
  sudo apt install python3 make g++
  ```

### Passo 1: Clona il repository

```bash
git clone <url-del-repository>
cd trust-iso-tracker
```

### Passo 2: Installa le dipendenze

```bash
npm install
```

Questo comando installera tutte le dipendenze elencate in `package.json`, incluso `better-sqlite3` che richiede la compilazione di un modulo nativo C++ (per questo servono gli strumenti di compilazione).

### Passo 3: Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Apri il file `.env` e configura le variabili:

| Variabile | Obbligatoria | Descrizione | Valore di default |
|----------|:------------:|-------------|:-----------------:|
| `JWT_SECRET` | Si | Chiave segreta per la firma dei token JWT. Deve essere una stringa lunga e casuale. Puoi generarla con `openssl rand -base64 48` | Nessuno (il server non si avvia senza) |
| `PORT` | No | Porta su cui il server resta in ascolto | `3002` |
| `DB_PATH` | No | Percorso del file database SQLite. In sviluppo usa il percorso relativo; in Docker deve essere assoluto | `./data/db.sqlite` |
| `SMTP_HOST` | No | Host del server SMTP per l'invio email | Nessuno |
| `SMTP_PORT` | No | Porta del server SMTP | `587` |
| `SMTP_USER` | No | Username per autenticazione SMTP | Nessuno |
| `SMTP_PASS` | No | Password per autenticazione SMTP | Nessuno |
| `SMTP_FROM` | No | Indirizzo email mittente | Uguale a `SMTP_USER` |
| `ADMIN_EMAIL` | No | Email destinatario riepilogo changelog | Nessuno |
| `CHANGELOG_EMAIL_INTERVAL` | No | Frequenza email changelog: `daily` o `weekly` | `daily` |

Esempio minimo di file `.env`:

```bash
JWT_SECRET=la-tua-stringa-segreta-molto-lunga-e-casuale
PORT=3002
DB_PATH=./data/db.sqlite
```

### Passo 4: Avvia il server

```bash
# Modalita sviluppo (auto-restart quando modifichi i file server/)
npm run dev

# Modalita produzione
npm start
```

Il server si avvia su `http://localhost:3002` (o la porta configurata).

La directory `data/` e il file `db.sqlite` vengono creati automaticamente al primo avvio.

### Il primo utente diventa admin

Quando apri l'applicazione per la prima volta, vedrai la schermata di registrazione. Il **primo utente** che si registra diventa automaticamente **admin** con accesso immediato. Tutti gli utenti successivi richiedono l'approvazione da parte di un admin prima di poter accedere.

### Script npm disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm start` | Avvia il server in produzione (`node server/index.js`) |
| `npm run dev` | Avvia in sviluppo con auto-restart (`node --watch server/index.js`) |
| `npm run lint` | Esegue ESLint per analisi statica del codice |
| `npm run lint:fix` | Esegue ESLint con correzione automatica |
| `npm test` | Esegue tutti gli 85 test con Vitest |
| `npm run test:watch` | Esegue i test in modalita watch (riesegue al salvataggio) |

---

## 5. Database

### Motore e modalita operativa

Il database e **SQLite 3**, acceduto tramite la libreria `better-sqlite3`. A differenza di altri driver SQLite per Node.js, `better-sqlite3` ha un'**API completamente sincrona**: non si usano callback, promise o async/await per le query. Questo rende il codice molto piu semplice e leggibile.

```javascript
// Esempio: una query sincrona con better-sqlite3
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');
// 'user' e gia disponibile, nessun await necessario
```

### WAL Mode

Al primo avvio, il database viene configurato in modalita **WAL (Write-Ahead Logging)**:

```javascript
db.pragma('journal_mode = WAL');
```

La modalita WAL permette **letture concorrenti durante le scritture**, migliorando le prestazioni. Genera due file ausiliari accanto al database principale:

- `db.sqlite-wal` -- il log delle scritture in attesa
- `db.sqlite-shm` -- la memoria condivisa per coordinare l'accesso

**Importante**: per eliminare completamente il database, devi cancellare **tutti e tre** i file: `db.sqlite`, `db.sqlite-wal`, `db.sqlite-shm`.

### Auto-recovery dalla corruzione

Il file `server/db.js` gestisce automaticamente il caso in cui il database sia corrotto. All'avvio, se la connessione fallisce con uno di questi errori:

- `SQLITE_IOERR_SHORT_READ` -- il file e troncato o danneggiato
- `SQLITE_CORRUPT` -- struttura del database corrotta
- `SQLITE_NOTADB` -- il file non e un database SQLite valido

...il sistema cancella automaticamente tutti e tre i file del database e ne crea uno nuovo vuoto:

```javascript
// Estratto da server/db.js
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
```

Questo significa che dopo un recovery automatico il database sara vuoto, e il primo utente che si registrera sara di nuovo admin.

### Schema completo

Di seguito lo schema di tutte e **6 le tabelle** del database, incluse le colonne aggiunte tramite migrazioni.

#### Tabella `users`

Contiene gli account utente. Le colonne `theme`, `role`, `is_approved`, `password_change_required` e `has_seen_tutorial` sono state aggiunte tramite migrazioni successive.

```sql
CREATE TABLE users (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  email                    TEXT UNIQUE NOT NULL,
  name                     TEXT NOT NULL,
  password_hash            TEXT NOT NULL,
  theme                    TEXT DEFAULT 'default',           -- migrazione: tema colore UI
  role                     TEXT DEFAULT 'user',              -- migrazione: 'admin' | 'user'
  is_approved              INTEGER DEFAULT 0,                -- migrazione: 0=in attesa, 1=approvato
  password_change_required INTEGER DEFAULT 0,                -- migrazione: 1=cambio password obbligatorio
  has_seen_tutorial        INTEGER DEFAULT 0,                -- migrazione: 1=tutorial completato
  created_at               TEXT DEFAULT (datetime('now'))
);
```

#### Tabella `projects`

Contiene i progetti di certificazione. Ogni progetto appartiene a un utente (`user_id`) e puo essere collegato a un cliente (`client_id`). Le colonne di certificazione (`certification_date`, `certification_expiry`, ecc.) sono state aggiunte tramite migrazioni.

```sql
CREATE TABLE projects (
  id                    TEXT PRIMARY KEY,            -- ID generato: 'proj-' + timestamp + random
  user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id             INTEGER REFERENCES clients(id),  -- migrazione: collegamento a tabella clients
  client_name           TEXT NOT NULL DEFAULT '',
  sector                TEXT DEFAULT '',
  ateco                 TEXT DEFAULT '',
  employees             TEXT DEFAULT '',
  legal_address         TEXT DEFAULT '',
  operational_sites     TEXT DEFAULT '',
  contact_name          TEXT DEFAULT '',
  contact_role          TEXT DEFAULT '',
  contact_email         TEXT DEFAULT '',
  contact_phone         TEXT DEFAULT '',
  certification_id      TEXT DEFAULT 'iso-9001-2015',
  start_date            TEXT DEFAULT '',
  target_date           TEXT DEFAULT '',
  cert_body             TEXT DEFAULT '',
  phase                 TEXT DEFAULT 'gap_analysis',  -- gap_analysis|implementation|pre_audit|audit|certified
  notes                 TEXT DEFAULT '',
  evaluations_json      TEXT DEFAULT '{}',            -- JSON: {"4.1": {status, notes, ...}, ...}
  documents_json        TEXT DEFAULT '[]',            -- JSON: [{id, name, type, status, ...}, ...]
  milestones_json       TEXT DEFAULT '[]',            -- JSON: [{id, title, date, completed}, ...]
  certification_date    TEXT DEFAULT '',              -- migrazione: data ottenimento certificazione
  certification_expiry  TEXT DEFAULT '',              -- migrazione: data scadenza certificazione
  next_audit_date       TEXT DEFAULT '',              -- migrazione: data prossimo audit
  audit_cycle           TEXT DEFAULT 'annual',        -- migrazione: 'annual' | 'semi-annual'
  certification_status  TEXT DEFAULT 'in_progress',   -- migrazione: in_progress|certified|expired|suspended
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now'))
);
```

#### Tabella `changelog`

Registra ogni modifica alle valutazioni dei requisiti. Permette di tracciare chi ha cambiato cosa e quando.

```sql
CREATE TABLE changelog (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      TEXT NOT NULL,
  requirement_id  TEXT NOT NULL,       -- es. '4.1', '7.5.1'
  user_id         INTEGER NOT NULL,
  user_name       TEXT NOT NULL,
  field           TEXT NOT NULL,       -- es. 'status', 'notes', 'priority'
  old_value       TEXT,
  new_value       TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- Indici per query veloci
CREATE INDEX idx_changelog_project ON changelog(project_id, created_at DESC);
CREATE INDEX idx_changelog_req ON changelog(project_id, requirement_id, created_at DESC);
```

I campi tracciati nel changelog sono definiti in `server/constants.js`:

```javascript
TRACKED_FIELDS: ['status', 'notes', 'priority', 'responsible', 'deadline', 'auditNotes', 'naJustification']
```

Oltre a questi, vengono tracciati anche `actions` e `evidenceNotes` (confrontati come JSON stringificato).

#### Tabella `clients`

Anagrafica clienti, separata dai progetti. Un cliente puo essere collegato a piu progetti tramite `client_id`.

```sql
CREATE TABLE clients (
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

CREATE INDEX idx_clients_user ON clients(user_id);
```

#### Tabella `app_settings`

Tabella chiave-valore per impostazioni globali dell'applicazione. Attualmente usata dallo scheduler per memorizzare l'ultimo invio di email.

```sql
CREATE TABLE app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
```

#### Tabella `api_keys`

Chiavi API per autenticazione programmatica. L'hash SHA-256 della chiave viene memorizzato nel database; la chiave in chiaro viene mostrata **una sola volta** al momento della creazione.

```sql
CREATE TABLE api_keys (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash     TEXT NOT NULL,            -- SHA-256 hash della chiave
  key_prefix   TEXT NOT NULL,            -- primi 12 caratteri + '...' (per identificazione)
  name         TEXT NOT NULL DEFAULT 'API Key',
  is_active    INTEGER DEFAULT 1,        -- 0=disattivata, 1=attiva
  expires_at   TEXT,                     -- data scadenza (opzionale)
  last_used_at TEXT,                     -- ultimo utilizzo
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

### Pattern delle migrazioni

Le migrazioni sono gestite con un pattern semplice ma efficace in `server/db.js`. Non viene usato alcun framework di migrazione. Le migrazioni sono un array di istruzioni `ALTER TABLE`:

```javascript
const migrations = [
  `ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'default'`,
  `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN is_approved INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN password_change_required INTEGER DEFAULT 0`,
  `ALTER TABLE projects ADD COLUMN client_id INTEGER REFERENCES clients(id)`,
  `ALTER TABLE projects ADD COLUMN certification_date TEXT DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN certification_expiry TEXT DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN next_audit_date TEXT DEFAULT ''`,
  `ALTER TABLE projects ADD COLUMN audit_cycle TEXT DEFAULT 'annual'`,
  `ALTER TABLE projects ADD COLUMN certification_status TEXT DEFAULT 'in_progress'`,
  `ALTER TABLE users ADD COLUMN has_seen_tutorial INTEGER DEFAULT 0`,
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch (e) {
    // Se la colonna esiste gia, l'errore viene ignorato silenziosamente
    if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
      console.error('Migration error:', e.message);
    }
  }
}
```

**Come funziona**: ad ogni avvio del server, tutte le migrazioni vengono eseguite. Se una colonna esiste gia, SQLite restituisce un errore "duplicate column name" che viene catturato e ignorato. Questo rende le migrazioni **idempotenti**: possono essere eseguite quante volte si vuole senza problemi.

**Per aggiungere una nuova migrazione**: aggiungi semplicemente una nuova riga all'array `migrations` alla fine. Non rimuovere mai le migrazioni esistenti.

---

## 6. API REST

Tutte le API hanno il prefisso `/api` (tranne `/health`). Le risposte sono sempre in formato JSON.

### Convenzioni

- Le risposte di successo hanno status `200` (OK), `201` (Created), o il body JSON direttamente.
- Le risposte di errore hanno il formato: `{ "error": "Messaggio di errore" }`.
- I nomi dei campi nelle risposte JSON usano **camelCase** (es. `clientName`, `createdAt`), anche se nel database sono in **snake_case** (es. `client_name`, `created_at`). La conversione avviene nelle funzioni `serialize*()`.

### Autenticazione -- Legenda

| Sigla | Significato |
|-------|-------------|
| **Nessuna** | Endpoint pubblico, nessuna autenticazione richiesta |
| **JWT** | Richiede header `Authorization: Bearer <token-jwt>` |
| **API Key** | Richiede header `X-API-Key: tiso_xxx` oppure `Authorization: Bearer tiso_xxx` |
| **JWT/API Key** | Accetta entrambi i metodi |
| **Admin** | Richiede JWT/API Key + ruolo `admin` |

### Endpoint Auth (`/api/auth`)

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|:----:|-------------|
| `POST` | `/auth/register` | Nessuna | Registra un nuovo utente. Body: `{email, password, name}`. Il primo utente diventa admin. Ritorna `{token, user, pendingApproval}` |
| `POST` | `/auth/login` | Nessuna | Login. Body: `{email, password}`. Ritorna `{token, user}` |
| `GET` | `/auth/me` | JWT/API Key | Ritorna i dati dell'utente corrente: `{user: {id, email, name, theme, role, ...}}` |
| `PUT` | `/auth/theme` | JWT/API Key | Cambia il tema dell'utente. Body: `{theme}`. Temi validi: `default`, `trust-corporate`, `ocean`, `forest`, `slate` |
| `PUT` | `/auth/password` | JWT/API Key | Cambia la password. Body: `{oldPassword, newPassword}`. Se `password_change_required` e attivo, `oldPassword` non e richiesto |
| `PUT` | `/auth/tutorial-complete` | JWT/API Key | Segna il tutorial come completato per l'utente corrente |

### Endpoint Projects (`/api/projects`)

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|:----:|-------------|
| `GET` | `/projects` | JWT/API Key | Lista tutti i progetti (ordinati per `updated_at DESC`) |
| `POST` | `/projects` | JWT/API Key | Crea un nuovo progetto. Body: dati progetto + opzionali `evaluations`, `documents`, `milestones` |
| `GET` | `/projects/:id` | JWT/API Key | Dettaglio di un singolo progetto con evaluations, documents e milestones parsati |
| `PUT` | `/projects/:id` | JWT/API Key | Aggiorna un progetto. I campi non inviati mantengono il valore precedente |
| `DELETE` | `/projects/:id` | JWT/API Key | Elimina un progetto |
| `PUT` | `/projects/:id/evaluations/:reqId` | JWT/API Key | Salva/aggiorna la valutazione di un requisito specifico (es. `4.1`, `7.5.1`). Genera automaticamente le entry nel changelog |
| `POST` | `/projects/:id/documents` | JWT/API Key | Aggiunge un documento al progetto. Ritorna il documento con `id` generato |
| `PUT` | `/projects/:id/documents/:docId` | JWT/API Key | Aggiorna un documento esistente |
| `DELETE` | `/projects/:id/documents/:docId` | JWT/API Key | Elimina un documento |
| `PUT` | `/projects/:id/milestones` | JWT/API Key | Sostituisce tutte le milestone del progetto con il body inviato |
| `GET` | `/projects/:id/changelog` | JWT/API Key | Storico modifiche del progetto. Query params: `limit` (default 100, max 500), `offset`. Ritorna `{entries, total}` |
| `GET` | `/projects/:id/changelog/:reqId` | JWT/API Key | Storico modifiche di un singolo requisito. Ritorna `{entries}` |

### Endpoint Clients (`/api/clients`)

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|:----:|-------------|
| `GET` | `/clients` | JWT/API Key | Lista clienti. Admin vede tutti, utente normale vede solo i propri |
| `POST` | `/clients` | JWT/API Key | Crea un nuovo cliente. Campo obbligatorio: `companyName` (max 200 caratteri) |
| `GET` | `/clients/:id` | JWT/API Key | Dettaglio singolo cliente |
| `PUT` | `/clients/:id` | JWT/API Key | Aggiorna un cliente |
| `DELETE` | `/clients/:id` | JWT/API Key | Elimina un cliente. Fallisce con `409` se ci sono progetti associati |

### Endpoint API Keys (`/api/api-keys`)

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|:----:|-------------|
| `GET` | `/api-keys` | JWT/API Key | Lista le chiavi API dell'utente corrente (senza hash ne chiave completa) |
| `POST` | `/api-keys` | JWT/API Key | Crea una nuova chiave API. Body: `{name, expiresIn}` (expiresIn in giorni, opzionale). Ritorna `{apiKey, rawKey}` -- la chiave in chiaro viene mostrata **una sola volta** |
| `PUT` | `/api-keys/:id` | JWT/API Key | Aggiorna nome o stato attivo/disattivato di una chiave propria |
| `DELETE` | `/api-keys/:id` | JWT/API Key | Revoca/elimina una chiave propria |

### Endpoint Admin (`/api/admin`)

Tutti gli endpoint admin richiedono autenticazione + ruolo `admin`.

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|:----:|-------------|
| `GET` | `/admin/users` | Admin | Lista tutti gli utenti del sistema |
| `POST` | `/admin/users` | Admin | Crea un nuovo utente con password generata automaticamente. Body: `{name, email}`. L'utente dovra cambiare password al primo accesso. Ritorna `{user, generatedPassword}` |
| `PUT` | `/admin/users/:id/approve` | Admin | Approva un utente in attesa |
| `PUT` | `/admin/users/:id/role` | Admin | Cambia il ruolo di un utente. Body: `{role}` (`admin` o `user`). Non puoi cambiare il tuo stesso ruolo |
| `DELETE` | `/admin/users/:id` | Admin | Elimina un utente (e tutti i suoi dati per cascade). Non puoi eliminare te stesso |
| `POST` | `/admin/send-changelog-summary` | Admin | Invia manualmente l'email di riepilogo changelog a tutti gli admin |
| `GET` | `/admin/api-keys` | Admin | Lista tutte le chiavi API di tutti gli utenti (oversight) |
| `PUT` | `/admin/api-keys/:id/toggle` | Admin | Attiva/disattiva qualsiasi chiave API |

### Endpoint Health (`/health`)

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|:----:|-------------|
| `GET` | `/health` | Nessuna | Healthcheck. Verifica che il database sia raggiungibile. Ritorna `{status: "ok", timestamp, uptime}` oppure `503` se il DB non risponde |

### Esempio di chiamata API

```bash
# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "StrongP@ss1"}'

# Risposta:
# {"token": "eyJhbGciOiJIUzI...", "user": {"id": 1, "email": "admin@example.com", ...}}

# Lista progetti (con JWT)
curl http://localhost:3002/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI..."

# Lista progetti (con API Key)
curl http://localhost:3002/api/projects \
  -H "X-API-Key: tiso_a1b2c3d4e5f6..."
```

---

## 7. Autenticazione

### Panoramica

Il sistema supporta due metodi di autenticazione:

1. **JWT (JSON Web Token)** -- per l'interfaccia web e le sessioni utente
2. **API Key** -- per integrazioni programmatiche e script

Entrambi i metodi sono gestiti dal middleware `requireAuth` in `server/middleware/auth.js`.

### Flusso di registrazione

1. L'utente compila il form di registrazione con email, nome e password.
2. La password deve soddisfare i requisiti:
   - Almeno **8 caratteri**
   - Almeno **1 lettera maiuscola** (A-Z)
   - Almeno **1 numero** (0-9)
   - Almeno **1 simbolo** (qualsiasi carattere non alfanumerico, es. `!@#$%`)
3. Il server verifica la password, genera l'hash con `bcrypt` (12 round), e salva l'utente nel database.
4. Se e il **primo utente** nel database: `role = 'admin'`, `is_approved = 1` (accesso immediato).
5. Se **non** e il primo utente: `role = 'user'`, `is_approved = 0` (deve attendere l'approvazione di un admin).
6. Il server genera un JWT e lo ritorna al frontend.

### Flusso di login

1. L'utente inserisce email e password.
2. Il server cerca l'utente nel database e verifica la password con `bcrypt.compareSync()`.
3. Controlla che `is_approved = 1` (oppure che sia admin).
4. Genera un JWT con payload `{ userId }` e scadenza **7 giorni**.
5. Ritorna il token e i dati dell'utente al frontend.

### Flusso di creazione utente da admin

Un admin puo creare nuovi utenti dalla dashboard admin:

1. L'admin inserisce nome ed email del nuovo utente.
2. Il server genera automaticamente una password casuale sicura di 12 caratteri (garantendo maiuscola, numero e simbolo).
3. L'utente viene creato con `is_approved = 1` e `password_change_required = 1`.
4. La password generata viene mostrata **una sola volta** all'admin, che la comunichera al nuovo utente.
5. Al primo login, l'utente e forzato a cambiare password prima di poter usare l'applicazione.

### JWT: come funziona

Il JWT e un token firmato con il segreto `JWT_SECRET`. Contiene l'ID dell'utente e ha una scadenza di 7 giorni:

```javascript
// Generazione (server/routes/auth.js)
jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Verifica (server/middleware/auth.js)
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.userId = payload.userId;
```

Il frontend invia il token in ogni richiesta nell'header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key: come funziona

Le chiavi API sono stringhe con prefisso `tiso_` seguite da 32 caratteri esadecimali casuali:

```
tiso_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

Quando viene creata una chiave, il server:

1. Genera la chiave in chiaro.
2. Calcola l'hash SHA-256 della chiave.
3. Salva **solo l'hash** nel database (la chiave in chiaro non e mai memorizzata).
4. Ritorna la chiave in chiaro **una sola volta** nella risposta.

Quando viene usata una chiave per autenticarsi:

1. Il middleware estrae la chiave dall'header `X-API-Key` o da `Authorization: Bearer tiso_...`.
2. Calcola l'hash SHA-256 della chiave ricevuta.
3. Cerca l'hash nel database.
4. Verifica che la chiave sia attiva (`is_active = 1`) e non scaduta.
5. Aggiorna `last_used_at` e imposta `req.userId`.

### Catena dei middleware

Per gli endpoint protetti, la catena dei middleware e:

```
Richiesta HTTP
    |
    v
requireAuth         -- Verifica JWT o API Key, imposta req.userId e req.authMethod
    |
    v
[requireAdmin]      -- Solo per endpoint admin: verifica role === 'admin'
    |
    v
Route handler       -- Logica di business
    |
    v
[errorHandler]      -- Cattura errori non gestiti, ritorna JSON
```

### Gestione del token scaduto

Quando un JWT scade (dopo 7 giorni), il server risponde con:
- `403` e messaggio "Token scaduto, effettua nuovamente il login"

Il frontend (`ApiClient._fetch()`) intercetta le risposte `401` e `403` e esegue automaticamente il logout, mostrando la schermata di login.

---

## 8. Frontend

### Architettura SPA senza framework

Il frontend e una **Single Page Application (SPA)** costruita interamente con JavaScript vanilla, senza alcun framework (no React, no Vue, no Angular). Non c'e nessun bundler, nessuna compilazione, nessun step di build. I file `.js` nella cartella `public/` vengono serviti direttamente da Express come file statici.

Questo approccio ha vantaggi e svantaggi:

**Vantaggi**: zero complessita di build, caricamento istantaneo, nessuna dipendenza da strumenti di compilazione, facile da debuggare nel browser.

**Svantaggi**: gestione manuale dello stato, nessun componente reattivo, ordine di caricamento critico.

### Ordine di caricamento

L'ordine in cui i file JS vengono inclusi in `index.html` e **fondamentale** perche non sono moduli ES (sono script normali che registrano oggetti globali su `window`). L'ordine corretto e:

1. **Librerie CDN**: Tailwind CSS, Lucide Icons, jsPDF
2. `data/iso9001.js` -- definisce `CERTIFICATIONS`, `ISO_9001_2015`, `flattenRequirements`, `countRequirements`
3. `js/constants.js` -- definisce `DEFAULT_EVALUATION`, `MANDATORY_DOCS`, `TOAST_DURATION`, ecc.
4. `js/api-client.js` -- definisce `ApiClient` e `Store` (alias)
5. `js/themes.js` -- definisce `ThemeManager` e `ThemeDefinitions`
6. `js/auth.js` -- definisce `AuthUI`
7. `js/tutorial.js` -- definisce `Tutorial`
8. `js/md-export.js` -- definisce `GuideExport`
9. `js/views/*.js` -- tutti gli 11 moduli vista (definiscono `DashboardView`, `ProjectsView`, ecc.)
10. `js/views.js` -- facade `Views` che delega ai moduli vista
11. `js/app.js` -- controller principale `App` (deve essere caricato per ultimo)

### Oggetti globali

Poiche non vengono usati moduli ES, la comunicazione tra file avviene tramite **oggetti globali** assegnati a `window`. Gli oggetti principali sono:

| Oggetto globale | File | Ruolo |
|----------------|------|-------|
| `App` | `app.js` | Controller principale: navigazione, sidebar, stato |
| `ApiClient` / `Store` | `api-client.js` | Client REST con cache locale |
| `Views` | `views.js` | Facade che delega ai moduli vista |
| `AuthUI` | `auth.js` | Gestione UI login/registrazione |
| `ThemeManager` | `themes.js` | Applicazione temi CSS |
| `ThemeDefinitions` | `themes.js` | Definizioni dei 5 temi |
| `Tutorial` | `tutorial.js` | Wizard onboarding |
| `GuideExport` | `md-export.js` | Export Markdown |
| `DashboardView`, `ProjectsView`, ... | `views/*.js` | Moduli vista individuali |
| `CERTIFICATIONS`, `flattenRequirements`, ... | `data/iso9001.js` | Dati normativi ISO |
| `DEFAULT_EVALUATION`, `MANDATORY_DOCS`, ... | `constants.js` | Costanti frontend |

La configurazione ESLint in `.eslintrc.json` dichiara tutti questi oggetti come `globals` nella sezione `overrides` per `public/**/*.js`, cosi ESLint non segnala errori per variabili non definite:

```json
{
  "files": ["public/**/*.js"],
  "globals": {
    "Views": "readonly",
    "Store": "readonly",
    "ApiClient": "readonly",
    "App": "readonly",
    "AuthUI": "readonly",
    "ThemeManager": "readonly",
    "Tutorial": "readonly",
    // ... tutti gli altri
  }
}
```

### Pattern render() + bind()

Ogni modulo vista segue un pattern a due fasi:

1. **`render()`** -- Genera e ritorna una stringa HTML. Non tocca il DOM direttamente.
2. **`bind()`** -- Viene chiamata dopo che l'HTML e stato inserito nel DOM. Attacca gli event listener.

Esempio concettuale:

```javascript
// In un modulo vista (es. dashboard-view.js)
const DashboardView = {
  render(project) {
    // Genera HTML come stringa
    return `
      <div class="dashboard">
        <h1>${project.clientName}</h1>
        <button id="btn-edit">Modifica</button>
      </div>
    `;
  },

  bind() {
    // Attacca eventi dopo che l'HTML e nel DOM
    document.getElementById('btn-edit').addEventListener('click', () => {
      App.navigate('projectEdit', { projectId: App.currentProjectId });
    });
  }
};
```

Il controller `App` coordina il ciclo:

```javascript
// In app.js (semplificazione)
App.navigate('dashboard', { projectId: 'proj-123' })
  // 1. Aggiorna lo stato interno
  // 2. Chiama il render del modulo vista appropriato
  // 3. Inserisce l'HTML nel DOM (main.innerHTML = ...)
  // 4. Chiama il bind del modulo vista
```

### ApiClient e cache locale

`ApiClient` (`js/api-client.js`) e il cuore della comunicazione con il server. Tutte le chiamate API passano attraverso il metodo `ApiClient._fetch()`, che:

1. Aggiunge automaticamente l'header `Authorization: Bearer <token>`.
2. Gestisce le risposte `401`/`403` eseguendo il logout automatico.
3. Mantiene una **cache locale** dei dati ricevuti.

L'alias `Store = ApiClient` esiste per retrocompatibilita con il codice precedente. Le due variabili puntano allo stesso oggetto.

```javascript
// Esempio di utilizzo
const projects = Store.getProjects();    // Lettura dalla cache (sincrona)
await Store.saveProject(projectData);    // Scrittura via API (asincrona)
```

### Temi

Il sistema supporta 5 temi colore, gestiti tramite CSS custom properties (variabili CSS) su `:root`:

| ID tema | Nome |
|---------|------|
| `default` | Tema predefinito |
| `trust-corporate` | Trust Corporate |
| `ocean` | Ocean |
| `forest` | Forest |
| `slate` | Slate |

Quando l'utente seleziona un tema:
1. `ThemeManager` inietta le variabili CSS nel DOM.
2. Il tema viene salvato nel database (campo `users.theme`) tramite `PUT /api/auth/theme`.
3. Il tema viene anche salvato in `localStorage` per evitare il "flash of unstyled content" (FOUC) al caricamento della pagina: il tema viene applicato subito da `localStorage` prima che il server risponda.

---

## 9. Testing

### Panoramica

Il progetto include **85 test** automatizzati, suddivisi in test di integrazione API e test unitari.

### Struttura dei test

```
tests/
|-- setup.js                  # Configurazione globale
|-- health.test.js            # 1 test healthcheck
|-- helpers/
|   |-- create-app.js         # Factory Express app per test
|-- api/
|   |-- auth.test.js          # 30 test (registrazione, login, password, tema, tutorial)
|   |-- projects.test.js      # 28 test (CRUD progetti, evaluations, documents, milestones)
|   |-- admin.test.js         # 9 test (creazione utenti, approvazione, ruoli, eliminazione)
|-- unit/
    |-- validation.test.js    # 9 test (validazione input progetti e valutazioni)
    |-- helpers.test.js       # 8 test (funzioni helper serializzazione e conversione)
```

### Come funzionano

Il file `tests/setup.js` imposta due variabili d'ambiente fondamentali:

```javascript
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-vitest';
process.env.DB_PATH = ':memory:';
```

L'impostazione `DB_PATH=:memory:` fa si che `better-sqlite3` crei un database **in memoria** (RAM) anziche su disco. Questo significa che:

- Ogni esecuzione dei test parte con un database vuoto e pulito.
- I test sono velocissimi (nessun I/O su disco).
- Non c'e rischio di interferenza con il database di sviluppo.

Il file `tests/helpers/create-app.js` crea un'istanza Express configurata con tutte le route, senza avviare il server su una porta. Supertest esegue le richieste HTTP direttamente contro l'app Express in memoria.

I test API usano il pattern **ESM con createRequire**: i file di test usano `import` (ESM), ma i moduli del server usano `require` (CommonJS). Il ponte e:

```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createApp } = require('../helpers/create-app');
```

### Eseguire i test

```bash
# Esegui tutti i test una volta
npm test

# Esegui i test in modalita watch (riesegue al salvataggio)
npm run test:watch

# Esegui solo un file di test specifico
npx vitest run tests/api/auth.test.js

# Esegui con output verbose
npx vitest run --reporter=verbose
```

### Come aggiungere un nuovo test

1. Crea un nuovo file `.test.js` nella directory appropriata (`tests/api/` per test API, `tests/unit/` per test unitari).

2. Segui la struttura standard:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createApp } = require('../helpers/create-app');
const db = require('../../server/db');

const app = createApp();

// Pulisci il database prima di ogni test
beforeEach(() => {
  db.exec('DELETE FROM projects');
  db.exec('DELETE FROM users');
});

describe('La funzionalita che stai testando', () => {
  it('dovrebbe comportarsi cosi', async () => {
    // 1. Setup: crea i dati necessari
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'StrongP@ss1', name: 'Test' });
    const token = regRes.body.token;

    // 2. Azione: esegui l'operazione da testare
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    // 3. Asserzione: verifica il risultato
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
```

3. Il test verra automaticamente individuato da Vitest (che cerca file `*.test.js`).

---

## 10. Docker e Deployment

### Dockerfile: build multi-stage

Il `Dockerfile` usa un pattern **multi-stage build** per produrre un'immagine piccola e sicura. Ecco come funziona, passo per passo:

```dockerfile
# ---- STAGE 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Installa dipendenze di compilazione per better-sqlite3.
# better-sqlite3 contiene codice C++ che deve essere compilato
# in un modulo nativo Node.js. Servono python3, make e g++.
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

# ---- STAGE 2: Production ----
FROM node:20-alpine

WORKDIR /app

# Dipendenza runtime di better-sqlite3 (libreria C++ standard).
# Notiamo che NON installiamo python3/make/g++ qui:
# servivano solo per la compilazione nel builder stage.
RUN apk add --no-cache libstdc++

# Copia solo cio che serve dal builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server/ ./server/
COPY public/ ./public/
COPY scripts/ ./scripts/

# Crea la directory per il database (sara montata come volume)
RUN mkdir -p /data

# Variabili d'ambiente di default
ENV NODE_ENV=production
ENV DB_PATH=/data/db.sqlite
ENV PORT=3002

EXPOSE 3002

# Healthcheck integrato: ogni 30 secondi verifica che /health risponda 200
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3002; require('http').get('http://localhost:'+port+'/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "server/index.js"]
```

**Perche multi-stage?** Lo stage `builder` installa ~200 MB di strumenti di compilazione che servono solo per compilare `better-sqlite3`. Lo stage finale copia solo i `node_modules` compilati, senza gli strumenti di build. Il risultato e un'immagine molto piu piccola.

### docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "${PORT:-3002}:3002"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DB_PATH=/data/db.sqlite
      - PORT=3002
    volumes:
      - db_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3002/health', ...)"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s

volumes:
  db_data:
    name: ${COMPOSE_PROJECT_NAME:-trust-iso}_db_data
```

Punti chiave:

- Il **volume** `db_data` persiste il database tra i riavvii del container. Se il container viene eliminato e ricreato, i dati restano.
- Il **nome del volume** usa la variabile `COMPOSE_PROJECT_NAME` (default: `trust-iso`). Questo permette di avere volumi separati per istanze diverse (es. prod e preprod).
- La **porta** esterna e configurabile via `PORT` nel `.env`, ma internamente il container usa sempre `3002`.
- **`DB_PATH` deve essere assoluto** (`/data/db.sqlite`), NON relativo (`./data/db.sqlite`), perche all'interno del container il volume e montato su `/data`.

### Comandi Docker

```bash
# Build dell'immagine
docker build -t trust-iso .

# Run diretto (senza Compose)
docker run -d \
  --name trust-iso \
  -p 3002:3002 \
  -e JWT_SECRET=la-tua-chiave-segreta \
  -e DB_PATH=/data/db.sqlite \
  -e PORT=3002 \
  -v trust-iso-data:/data \
  trust-iso

# Con Docker Compose
cp .env.example .env
# Modifica .env: imposta JWT_SECRET

docker compose up -d        # Avvia in background
docker compose logs -f       # Visualizza i log in tempo reale
docker compose restart       # Riavvia
docker compose down          # Ferma (il volume DB rimane)
docker compose down -v       # Ferma e ELIMINA il volume (perdi i dati!)
```

---

## 11. Deploy su Coolify

[Coolify](https://coolify.io/) e una piattaforma self-hosted di PaaS (simile a Heroku) che semplifica il deployment di applicazioni Docker.

### Setup: deploy basato su Dockerfile

Su Coolify, il deploy avviene tramite **Dockerfile** (non Docker Compose). La piattaforma costruisce l'immagine direttamente dal repository Git.

1. Su Coolify, crea un nuovo servizio di tipo **Dockerfile** (non Docker Compose).
2. Connetti il repository Git del progetto.
3. Coolify usera automaticamente il `Dockerfile` nella root del repository.

### Variabili d'ambiente

Nella sezione "Environment Variables" di Coolify, configura:

| Variabile | Valore | Note |
|----------|--------|------|
| `JWT_SECRET` | (stringa casuale lunga) | **Obbligatoria.** Genera con `openssl rand -base64 48` |
| `PORT` | `3002` | Deve corrispondere all'`EXPOSE` del Dockerfile |
| `DB_PATH` | `/data/db.sqlite` | Percorso assoluto dentro il container |
| `SMTP_HOST` | (opzionale) | Solo se vuoi abilitare le email |
| `SMTP_USER` | (opzionale) | |
| `SMTP_PASS` | (opzionale) | |

### Storage persistente

Poiche il deploy su Coolify usa il Dockerfile (non Docker Compose), i volumi definiti in `docker-compose.yml` **non vengono utilizzati**. La persistenza dei dati deve essere configurata **dall'interfaccia di Coolify**:

1. Nella sezione "Storage" del servizio, aggiungi un volume persistente.
2. Imposta il **mount path** a `/data`.
3. Scegli un **nome volume** significativo (es. `trust-iso-prod-data`).

Coolify gestira automaticamente la creazione e il montaggio del volume.

### Due istanze (produzione e pre-produzione)

Per avere due ambienti separati (ad esempio `trust.example.com` e `preprod-trust.example.com`):

1. Crea **due servizi separati** su Coolify, entrambi connessi allo stesso repository Git (ma eventualmente su branch diversi).
2. Configura **volumi separati** per ciascun servizio:
   - Produzione: volume con nome `trust-iso-prod-data`
   - Pre-produzione: volume con nome `trust-iso-preprod-data`
3. Configura **`JWT_SECRET` diversi** per ciascun ambiente (cosi i token di un ambiente non funzionano sull'altro).
4. Configura i domini/URL appropriati nell'interfaccia Coolify.

### Aggiornamenti

1. Pusha le modifiche sul branch configurato in Coolify.
2. Coolify rileva il push e avvia l'auto-deploy (se configurato con webhook).
3. Oppure esegui il deploy manuale dalla dashboard Coolify.

### Reset del database su Coolify

Se devi resettare completamente il database:

1. Accedi al terminal del container tramite la dashboard Coolify.
2. Esegui:
   ```bash
   rm -f /data/db.sqlite /data/db.sqlite-shm /data/db.sqlite-wal
   ```
3. Riavvia il servizio da Coolify.
4. Il primo utente che si registrera diventera admin.

---

## 12. Seed e dati demo

Il progetto include 4 script di seeding per popolare il database con dati realistici. Sono utili per test, demo e ambienti di pre-produzione.

### Script 1: `seed-demo.mjs` (via API, credenziali)

**Tipo**: basato su API (richiede server in esecuzione)
**Autenticazione**: login con email/password admin
**Cosa fa**: crea 5 progetti demo con valutazioni gap analysis

Questo script:
1. Fa login come admin usando le credenziali da `seed-credentials.json`.
2. Crea 5 progetti con aziende italiane fittizie.
3. Popola la gap analysis con valutazioni realistiche (5 profili: early, mid, advanced, almost, mixed).

**Configurazione**:

```bash
# Crea il file credenziali (una sola volta)
cp scripts/seed-credentials-example.json scripts/seed-credentials.json
# Modifica con le credenziali admin reali:
# { "email": "admin@example.com", "password": "LaPasswordAdmin1!" }
```

**Utilizzo**:

```bash
# Contro il server locale
node scripts/seed-demo.mjs

# Contro un server specifico
node scripts/seed-demo.mjs https://trust.example.com
```

### Script 2: `seed-preprod.js` (via API, API Key)

**Tipo**: basato su API (richiede server in esecuzione)
**Autenticazione**: API Key (`X-API-Key` header)
**Cosa fa**: popola progetti esistenti con valutazioni complete, documenti e milestone

Questo script e piu completo del precedente. Legge i progetti gia presenti nel database e li arricchisce con:
- Valutazioni per tutti gli 82 requisiti ISO 9001:2015
- Documenti SGQ realistici (5-20 per progetto, a seconda del profilo)
- Stato di completamento delle milestone

**Configurazione**: richiede `SEED_API_URL` e `SEED_API_KEY` come variabili d'ambiente.

```bash
# Opzione 1: file .env nello scripts/
cp scripts/.env.example scripts/.env
# Modifica scripts/.env:
# SEED_API_URL=https://preprod-trust.example.com/api
# SEED_API_KEY=tiso_la-tua-chiave-api

node --env-file=scripts/.env scripts/seed-preprod.js

# Opzione 2: variabili inline
SEED_API_URL=https://preprod-trust.example.com/api \
SEED_API_KEY=tiso_la-tua-chiave-api \
node scripts/seed-preprod.js
```

### Script 3: `seed-clients-db.js` (diretto DB, 8 clienti)

**Tipo**: accesso diretto al database (non richiede server in esecuzione)
**Cosa fa**: inserisce 8 clienti italiani fittizi direttamente nella tabella `clients`

I clienti creati sono: MotorTech Italia S.p.A., PrecisionMech S.r.l., Delizie Toscane S.p.A., CloudSoft Consulting S.r.l., ChemiTech Solutions S.p.A., Edilizia Verde S.r.l., Logistica Adriatica S.p.A., Studio Ingegneria Conti & Associati.

**Prerequisito**: deve esistere almeno un utente admin nel database (lo script assegna i clienti a quell'utente).

**Utilizzo**:

```bash
# In sviluppo locale
node scripts/seed-clients-db.js

# In un container Docker (specificando il percorso DB)
DB_PATH=/data/db.sqlite node scripts/seed-clients-db.js
```

### Script 4: `seed-projects-db.js` (diretto DB, 8 progetti)

**Tipo**: accesso diretto al database (non richiede server in esecuzione)
**Cosa fa**: inserisce 8 progetti completi direttamente nella tabella `projects`, con valutazioni, documenti e milestone

**Prerequisito**: deve esistere almeno un utente admin E i clienti devono essere gia stati creati (esegui prima `seed-clients-db.js`).

Ogni progetto viene collegato al cliente corrispondente e popolato con:
- Valutazioni realistiche (profili: early, mid, advanced, almost, mixed)
- Documenti SGQ con stati coerenti con la fase del progetto
- Milestone con stato di completamento realistico
- Campi certificazione (`certification_date`, `certification_expiry`, ecc.)

**Utilizzo**:

```bash
# In sviluppo locale (esegui in ordine!)
node scripts/seed-clients-db.js     # Prima i clienti
node scripts/seed-projects-db.js    # Poi i progetti

# In un container Docker
DB_PATH=/data/db.sqlite node scripts/seed-clients-db.js
DB_PATH=/data/db.sqlite node scripts/seed-projects-db.js
```

### Riepilogo script

| Script | Metodo | Auth richiesta | Prerequisiti | Cosa crea |
|--------|--------|:--------------:|-------------|-----------|
| `seed-demo.mjs` | API | Email + Password | Server attivo, credenziali admin | 5 progetti con evaluations |
| `seed-preprod.js` | API | API Key | Server attivo, progetti esistenti | Evaluations + docs + milestones |
| `seed-clients-db.js` | DB diretto | Nessuna | Utente admin nel DB | 8 clienti |
| `seed-projects-db.js` | DB diretto | Nessuna | Utente admin + clienti nel DB | 8 progetti completi |

---

## 13. Troubleshooting

### Il server non si avvia

**Sintomo**: il server esce immediatamente con un messaggio di errore.

**Causa piu comune**: `JWT_SECRET` non configurato.

```
ERRORE FATALE: JWT_SECRET non configurato.
Imposta JWT_SECRET come variabile d'ambiente.
```

**Soluzione**: assicurati che il file `.env` esista e contenga `JWT_SECRET=...`, oppure esporta la variabile d'ambiente:

```bash
export JWT_SECRET=la-tua-chiave-segreta
npm start
```

**Altra causa**: la porta e gia in uso da un altro processo.

```bash
# Verifica quale processo usa la porta 3002
lsof -i :3002
# Oppure usa una porta diversa
PORT=3003 npm run dev
```

### Errore SQLITE_CANTOPEN

**Sintomo**: errore all'avvio che indica l'impossibilita di aprire il file database.

**Causa**: la directory del database non esiste o non ha i permessi corretti.

**Soluzione**: normalmente `db.js` crea automaticamente la directory. Se il problema persiste:

```bash
# Crea manualmente la directory
mkdir -p data

# In Docker, verifica che il volume sia montato
docker inspect <container-id> | grep Mounts
```

In Docker, assicurati che `DB_PATH` sia impostato come percorso **assoluto** `/data/db.sqlite` (non relativo `./data/db.sqlite`) e che il volume sia montato su `/data`.

### Errore SQLITE_IOERR_SHORT_READ (auto-recovery)

**Sintomo**: all'avvio appare il messaggio:

```
Database corrotto (SQLITE_IOERR_SHORT_READ): /data/db.sqlite — ricreo il file.
```

**Causa**: il file database e corrotto, tipicamente a causa di un arresto improvviso del container o del server durante una scrittura.

**Cosa succede**: il sistema gestisce questo caso **automaticamente**. Cancella i tre file del database (`db.sqlite`, `db.sqlite-wal`, `db.sqlite-shm`) e ne crea uno nuovo vuoto. Vedrai questo messaggio nel log e poi il server partira normalmente.

**Conseguenze**: tutti i dati precedenti vengono persi. Il primo utente che si registrera diventera admin. Se avevi un backup del database, puoi ripristinarlo fermando il server e copiando il backup al posto del file corrotto.

### Token JWT scaduto

**Sintomo**: l'applicazione ti mostra la schermata di login improvvisamente, oppure le API rispondono con `403 Token scaduto`.

**Causa**: i token JWT hanno una durata di **7 giorni**. Dopo la scadenza, il token non e piu valido.

**Soluzione**: effettua nuovamente il login. Il frontend gestisce automaticamente il logout quando riceve una risposta 401 o 403.

### better-sqlite3 non si compila

**Sintomo**: errore durante `npm install` relativo a `better-sqlite3` e compilazione nativa.

**Soluzione per macOS**:

```bash
xcode-select --install
npm install
```

**Soluzione per Linux (Debian/Ubuntu)**:

```bash
sudo apt install python3 make g++
npm install
```

**In Docker**: il Dockerfile include gia le dipendenze di compilazione nello stage `builder`. Se il problema si verifica in Docker, verifica di usare l'immagine `node:20-alpine` e che `apk add python3 make g++` sia presente.

### Password dimenticata (reset manuale)

Non esiste un flusso di reset password via email nell'applicazione. Per resettare la password di un utente, devi accedere direttamente al database:

```javascript
// Esegui in una console Node.js con accesso al file DB
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('./data/db.sqlite'); // o il percorso del tuo DB
const nuovaPassword = 'NuovaPassword1!';     // deve soddisfare i requisiti
const hash = bcrypt.hashSync(nuovaPassword, 12);

db.prepare('UPDATE users SET password_hash = ?, password_change_required = 1 WHERE email = ?')
  .run(hash, 'utente@email.com');

console.log('Password aggiornata. L\'utente dovra cambiarla al prossimo login.');
```

L'impostazione `password_change_required = 1` forza l'utente a scegliere una nuova password al prossimo accesso.

In alternativa, un admin puo eliminare l'utente e ricrearlo dalla dashboard admin (la ricreazione genera una password temporanea automatica).

### Database bloccato (SQLITE_BUSY)

**Sintomo**: errore `SQLITE_BUSY: database is locked`.

**Causa**: piu processi stanno cercando di accedere allo stesso file database contemporaneamente. Anche con WAL mode, solo un processo alla volta puo scrivere.

**Soluzioni**:

1. Assicurati che non ci siano altri processi che accedono al file (es. un altro server, uno script di seed, un client SQLite aperto).
2. Chiudi eventuali tool di gestione database (DB Browser for SQLite, ecc.).
3. Riavvia il server.

```bash
# Verifica processi che usano il file database
lsof data/db.sqlite
```

### Bug "Senza nome" nel progetto (risolto)

**Sintomo storico**: i progetti apparivano con il nome "Senza nome" nella lista.

**Causa**: un bug precedente nella creazione del progetto non salvava correttamente il campo `client_name`.

**Stato**: il bug e stato **corretto**. Se trovi progetti con "Senza nome" nel database, sono residui del bug. Puoi aggiornarli manualmente:

```sql
UPDATE projects SET client_name = 'Nome Corretto' WHERE id = 'proj-xxx';
```

### Errori comuni durante lo sviluppo

| Errore | Causa | Soluzione |
|--------|-------|----------|
| `ReferenceError: App is not defined` | Ordine di caricamento JS errato | Verifica l'ordine degli script in `index.html` |
| `Cannot find module 'better-sqlite3'` | Dipendenze non installate | Esegui `npm install` |
| `SQLITE_CONSTRAINT_UNIQUE` | Tentativo di inserire un valore duplicato in un campo UNIQUE | Verifica che l'email non sia gia registrata |
| `TypeError: db.prepare is not a function` | Il modulo `db` non e stato importato correttamente | Verifica che il `require` punti a `server/db.js` |
| ESLint segnala variabili globali non definite | Manca la dichiarazione in `.eslintrc.json` | Aggiungi la variabile nella sezione `globals` delle overrides per `public/**/*.js` |
