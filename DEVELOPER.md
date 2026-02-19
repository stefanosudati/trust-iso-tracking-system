# Trust ISO Tracking System - Guida Developer

## Indice
1. [Architettura](#architettura)
2. [Struttura del progetto](#struttura-del-progetto)
3. [Stack tecnologico](#stack-tecnologico)
4. [Setup locale](#setup-locale)
5. [Database](#database)
6. [API REST](#api-rest)
7. [Autenticazione](#autenticazione)
8. [Frontend](#frontend)
9. [Docker e Deployment](#docker-e-deployment)
10. [Deployment su Coolify](#deployment-su-coolify)
11. [Seed e dati demo](#seed-e-dati-demo)
12. [Troubleshooting](#troubleshooting)

---

## Architettura

L'applicazione segue un pattern **SPA + REST API**:

```
Browser (SPA vanilla JS)
    │
    ├── index.html (shell)
    ├── js/app.js (routing, init)
    ├── js/views.js (rendering UI)
    ├── js/api-client.js (HTTP client + cache)
    ├── js/auth.js (login/register UI)
    ├── js/themes.js (gestione temi)
    ├── js/pdf-export.js (generazione PDF)
    └── data/iso9001.js (dati normativi)
         │
         │  HTTP REST (JSON) + JWT Bearer token
         ▼
Express.js Server (Node.js)
    │
    ├── index.js (entry point, middleware, routing)
    ├── middleware/auth.js (JWT verify + admin check)
    ├── routes/auth.js (login, register, password)
    ├── routes/projects.js (CRUD progetti + evaluations)
    ├── routes/admin.js (gestione utenti)
    └── routes/health.js (healthcheck)
         │
         ▼
SQLite Database (better-sqlite3)
    └── db.sqlite (WAL mode)
```

**Flusso richiesta tipica:**
1. Il frontend chiama `ApiClient._fetch('/projects')` con JWT nell'header
2. Express riceve la richiesta su `/api/projects`
3. Il middleware `requireAuth` verifica il JWT e setta `req.userId`
4. La route legge/scrive nel DB SQLite filtrando per `user_id`
5. La response JSON torna al frontend che aggiorna la cache locale

---

## Struttura del progetto

```
trust-iso-tracker/
├── server/                    # Backend Express.js
│   ├── index.js               # Entry point, express setup, route mounting
│   ├── db.js                  # Schema SQLite, migrazioni, connessione
│   ├── middleware/
│   │   └── auth.js            # requireAuth (JWT), requireAdmin (role check)
│   └── routes/
│       ├── health.js          # GET /health
│       ├── auth.js            # POST /api/auth/login, /register, PUT /password
│       ├── projects.js        # CRUD /api/projects, evaluations, documents, milestones, changelog
│       └── admin.js           # /api/admin/users (list, approve, role, delete)
│
├── public/                    # Frontend SPA (servito come static)
│   ├── index.html             # Shell HTML con Tailwind, Lucide, jsPDF
│   ├── js/
│   │   ├── app.js             # Controller principale, routing SPA, eventi globali
│   │   ├── api-client.js      # HTTP client REST con cache locale (= Store)
│   │   ├── auth.js            # UI login/registrazione/cambio password forzato
│   │   ├── views.js           # Tutti i componenti UI (~2000 righe)
│   │   ├── themes.js          # Gestione temi colore (CSS variables)
│   │   └── pdf-export.js      # Generazione PDF (gap analysis, report, guide)
│   ├── data/
│   │   └── iso9001.js         # Dati ISO 9001:2015 (clausole, requisiti)
│   ├── img/                   # Logo, favicon, icone PWA
│   └── manifest.json          # PWA manifest
│
├── scripts/
│   ├── seed-demo.mjs          # Script per creare 5 progetti demo con dati
│   ├── seed-credentials.json  # Credenziali admin (gitignored)
│   └── seed-credentials-example.json
│
├── data/                      # Directory database locale (dev)
│   └── db.sqlite
│
├── Dockerfile                 # Multi-stage build (Node 20 Alpine)
├── docker-compose.yml         # Compose con volume persistente
├── .env                       # Variabili ambiente locale (gitignored)
├── .env.example               # Template variabili ambiente
├── package.json               # Dipendenze: express, better-sqlite3, jwt, bcrypt
└── todo.md                    # Lista attivita progetto
```

---

## Stack tecnologico

| Componente | Tecnologia | Note |
|-----------|-----------|------|
| Runtime | Node.js 20 | Alpine in Docker |
| Server | Express 4 | REST API + static file server |
| Database | SQLite 3 | Via better-sqlite3 (sincrono) |
| Auth | JWT + bcryptjs | Token 7 giorni, hash bcrypt 12 round |
| Frontend | Vanilla JS | No framework, SPA con routing client-side |
| CSS | Tailwind CSS | CDN, CSS variables per temi |
| Icone | Lucide | CDN, create dinamicamente |
| PDF | jsPDF | CDN, generazione client-side |
| Container | Docker | Multi-stage, Alpine, healthcheck |

---

## Setup locale

### Prerequisiti
- Node.js >= 18
- npm

### Installazione

```bash
git clone <repo-url>
cd trust-iso-tracker
npm install
```

### Configurazione

Copia `.env.example` in `.env`:

```bash
cp .env.example .env
```

Variabili richieste:

| Variabile | Descrizione | Default |
|----------|-------------|---------|
| `JWT_SECRET` | **Obbligatoria.** Chiave segreta per firma JWT | - |
| `DB_PATH` | Percorso file database SQLite | `./data/db.sqlite` |
| `PORT` | Porta del server | `3000` |

### Avvio

```bash
# Produzione
npm start

# Sviluppo (auto-restart su modifiche)
npm run dev
```

Il server parte su `http://localhost:3000` (o la porta configurata).

**Primo utente**: il primo utente che si registra diventa automaticamente **admin** con accesso immediato. Tutti gli utenti successivi richiedono approvazione admin.

---

## Database

### Motore
SQLite 3 tramite `better-sqlite3` (API sincrona, nessuna callback/promise per le query).

### Modalita WAL
Il DB usa `journal_mode = WAL` per supportare letture concorrenti durante le scritture. Questo genera i file ausiliari:
- `db.sqlite-shm` (shared memory)
- `db.sqlite-wal` (write-ahead log)

**Importante**: per eliminare completamente il DB, cancellare tutti e tre i file.

### Schema

**Tabella `users`**:
```sql
CREATE TABLE users (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  email                    TEXT UNIQUE NOT NULL,
  name                     TEXT NOT NULL,
  password_hash            TEXT NOT NULL,
  theme                    TEXT DEFAULT 'default',
  role                     TEXT DEFAULT 'user',       -- 'admin' | 'user'
  is_approved              INTEGER DEFAULT 0,         -- 0 | 1
  password_change_required INTEGER DEFAULT 0,         -- 0 | 1
  created_at               TEXT DEFAULT (datetime('now'))
);
```

**Tabella `projects`**:
```sql
CREATE TABLE projects (
  id                TEXT PRIMARY KEY,            -- UUID generato dal client
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_name       TEXT NOT NULL DEFAULT '',
  sector            TEXT DEFAULT '',
  ateco             TEXT DEFAULT '',
  employees         TEXT DEFAULT '',
  -- ... altri campi anagrafica ...
  certification_id  TEXT DEFAULT 'iso-9001-2015',
  phase             TEXT DEFAULT 'gap_analysis', -- gap_analysis|implementation|pre_audit|audit|certified
  evaluations_json  TEXT DEFAULT '{}',           -- JSON: { "4.1": { status, notes, ... } }
  documents_json    TEXT DEFAULT '[]',           -- JSON array
  milestones_json   TEXT DEFAULT '[]',           -- JSON array
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);
```

**Tabella `changelog`**:
```sql
CREATE TABLE changelog (
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
```

### Migrazioni
Le migrazioni sono definite come array di `ALTER TABLE` in `server/db.js` (righe 77-86). Ogni migrazione viene eseguita in un `try/catch` che ignora l'errore se la colonna esiste gia. Questo pattern permette aggiornamenti incrementali senza migration framework.

---

## API REST

Base URL: `/api`

### Auth

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|------|-------------|
| POST | `/auth/register` | No | Registra nuovo utente. Primo utente = admin |
| POST | `/auth/login` | No | Login, ritorna JWT + user |
| PUT | `/auth/password` | JWT | Cambia password |

### Projects

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|------|-------------|
| GET | `/projects` | JWT | Lista progetti dell'utente |
| POST | `/projects` | JWT | Crea nuovo progetto |
| GET | `/projects/:id` | JWT | Dettaglio progetto |
| PUT | `/projects/:id` | JWT | Aggiorna progetto |
| DELETE | `/projects/:id` | JWT | Elimina progetto |
| PUT | `/projects/:id/evaluations/:reqId` | JWT | Salva valutazione requisito |
| POST | `/projects/:id/documents` | JWT | Aggiungi documento |
| PUT | `/projects/:id/documents/:docId` | JWT | Aggiorna documento |
| DELETE | `/projects/:id/documents/:docId` | JWT | Elimina documento |
| PUT | `/projects/:id/milestones` | JWT | Aggiorna milestone |
| GET | `/projects/:id/changelog` | JWT | Storico modifiche |
| GET | `/projects/:id/changelog/:reqId` | JWT | Storico requisito specifico |

### Admin

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|------|-------------|
| GET | `/admin/users` | Admin | Lista tutti gli utenti |
| PUT | `/admin/users/:id/approve` | Admin | Approva utente |
| PUT | `/admin/users/:id/role` | Admin | Cambia ruolo (admin/user) |
| DELETE | `/admin/users/:id` | Admin | Elimina utente |

### Health

| Metodo | Endpoint | Auth | Descrizione |
|--------|---------|------|-------------|
| GET | `/health` | No | Healthcheck (200 OK) |

---

## Autenticazione

### Flusso
1. **Registrazione**: POST `/api/auth/register` con `{ email, password, name }`
   - Password: minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo
   - Se primo utente: `role=admin`, `is_approved=1`
   - Se successivo: `role=user`, `is_approved=0` (richiede approvazione admin)
2. **Login**: POST `/api/auth/login` con `{ email, password }`
   - Verifica bcrypt, controlla `is_approved`
   - Ritorna JWT con `{ userId }` e scadenza 7 giorni
3. **Richieste autenticate**: Header `Authorization: Bearer <token>`
4. **Token scaduto**: Il frontend riceve 401/403, fa auto-logout

### Middleware
- `requireAuth`: verifica JWT, setta `req.userId`
- `requireAdmin`: dopo `requireAuth`, verifica `role === 'admin'`

---

## Frontend

### Architettura SPA
Il frontend e una Single Page Application senza framework. Il routing e gestito da `App.navigate(view, params)` che chiama `Views.<view>()` per il rendering e `Views.bind<View>()` per gli eventi.

### Pattern principale
```javascript
// Rendering: genera HTML come stringa
Views.dashboard(project) → "<div>...</div>"

// Binding: attacca eventi dopo il rendering
Views.bindDashboard() → addEventListener(...)

// Navigazione
App.navigate('clause', { currentClause: '4' })
  → App.render()
    → renderMainContent(project)
      → main.innerHTML = Views.clauseView(...)
      → Views.bindClauseView(...)
```

### ApiClient (api-client.js)
Il client API usa un pattern **cache locale + fetch asincrono**:
- Le operazioni di lettura sono sincrone (dalla cache)
- Le operazioni di scrittura sono asincrone (fetch al server)
- `const Store = ApiClient` per backward compatibility

### Temi (themes.js)
I temi sono gestiti via CSS custom properties su `:root`. L'utente sceglie un tema, che viene salvato nel DB (campo `users.theme`) e in `localStorage` per anti-FOUC.

### PDF (pdf-export.js)
I PDF sono generati client-side con jsPDF. Ogni report ha:
- Header colorato con il tema attivo
- Footer con numero pagina
- Page break automatici
- Le guide (utente/admin) hanno cover page con logo

---

## Docker e Deployment

### Dockerfile
Multi-stage build:
1. **Builder stage**: installa dipendenze native per `better-sqlite3` (python3, make, g++)
2. **Production stage**: copia solo `node_modules`, `server/`, `public/`

### Build e run

```bash
# Build
docker build -t trust-iso .

# Run
docker run -d \
  -p 3002:3002 \
  -e JWT_SECRET=your-secret-key \
  -e DB_PATH=/data/db.sqlite \
  -e PORT=3002 \
  -v trust-iso-data:/data \
  trust-iso
```

### Docker Compose

```bash
# Copia e configura .env
cp .env.example .env
# Imposta JWT_SECRET nel .env

# Avvia
docker compose up -d

# Log
docker compose logs -f

# Riavvio
docker compose restart

# Stop
docker compose down
```

Il volume `db_data` persiste il database tra i riavvii.

---

## Deployment su Coolify

### Setup iniziale
1. Su Coolify, crea un nuovo servizio di tipo **Docker Compose**
2. Connetti il repository Git
3. Imposta le variabili d'ambiente:
   - `JWT_SECRET`: genera una stringa casuale sicura
4. Il `DB_PATH` e `PORT` sono gia configurati nel docker-compose.yml

### Volume dati
Coolify gestisce automaticamente il volume `db_data`. Il database SQLite viene salvato in `/data/db.sqlite` dentro il container.

### Aggiornamenti
1. Pusha le modifiche sul branch configurato
2. Coolify rileva il push e fa auto-deploy (se configurato)
3. Oppure fai deploy manuale dalla dashboard Coolify

### Reset database
Se serve resettare il DB:
1. Vai al terminal del container in Coolify
2. Esegui:
   ```bash
   rm -f /data/db.sqlite /data/db.sqlite-shm /data/db.sqlite-wal
   ```
3. Riavvia il deploy da Coolify
4. Il primo utente che si registra diventera admin

### Troubleshooting Coolify
- **Container non si avvia**: controlla i log per errori su JWT_SECRET mancante
- **DB corrotto**: elimina i 3 file DB e riavvia
- **Errore build better-sqlite3**: il Dockerfile include le dipendenze native necessarie
- **Health check fallisce**: verifica che PORT sia 3002 nel compose

---

## Seed e dati demo

Lo script `scripts/seed-demo.mjs` crea 5 progetti demo con dati di gap analysis popolati.

### Configurazione

```bash
# Copia il file credenziali
cp scripts/seed-credentials-example.json scripts/seed-credentials.json

# Modifica con le credenziali admin reali
# { "email": "admin@example.com", "password": "..." }
```

### Esecuzione

```bash
# Contro server locale
node scripts/seed-demo.mjs

# Contro server remoto
SERVER_URL=https://trust.example.com node scripts/seed-demo.mjs
```

Lo script:
1. Fa login con le credenziali admin
2. Crea 5 progetti con clienti italiani fittizi
3. Popola la gap analysis di ciascun progetto con valutazioni realistiche
4. Ogni progetto ha un profilo di maturita diverso (early/mid/advanced/almost/mixed)

---

## Troubleshooting

### Il server non parte
- Verifica che `JWT_SECRET` sia impostato (variabile d'ambiente o `.env`)
- Controlla che la porta non sia gia in uso

### Errore "SQLITE_CANTOPEN"
- La directory `data/` non esiste → viene creata automaticamente da `db.js`
- In Docker, assicurati che il volume `/data` sia montato

### Token scaduto
- I token JWT durano 7 giorni
- Il frontend fa auto-logout e mostra la pagina di login

### better-sqlite3 non si compila
- Su macOS: `xcode-select --install`
- Su Linux: `apt install python3 make g++`
- In Docker: il Dockerfile include gia le dipendenze

### Password dimenticata
Non c'e un flusso di reset password via email. Per resettare la password di un utente:

```javascript
// Da console Node.js con accesso al DB
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('./data/db.sqlite');
const hash = bcrypt.hashSync('NuovaPassword1!', 12);
db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, 'utente@email.com');
```

### Database bloccato
Se il DB risulta bloccato (SQLITE_BUSY):
- Assicurati che non ci siano altri processi che accedono al file
- Il WAL mode gestisce la concorrenza, ma un singolo processo alla volta puo scrivere
- Riavvia il server se il problema persiste
