# Trust ISO Tracking System - Architettura

## Diagramma Generale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (SPA)                               │
│                                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ index.   │  │  auth.js  │  │  app.js  │  │   views/         │  │
│  │ html     │  │ Login/    │  │ Router   │  │ 10 view modules  │  │
│  │ (shell)  │  │ Register  │  │ Events   │  │ (dashboard, gap  │  │
│  └──────────┘  └───────────┘  └──────────┘  │  analysis, etc.) │  │
│                                              └──────────────────┘  │
│  ┌──────────────────┐  ┌───────────┐  ┌──────────────────────┐    │
│  │  api-client.js   │  │ themes.js │  │   md-export.js       │    │
│  │ REST Client +    │  │ CSS Vars  │  │ Markdown Export       │    │
│  │ Local Cache      │  │ Manager   │  │                      │    │
│  └────────┬─────────┘  └───────────┘  └──────────────────────┘    │
│           │                                                        │
│  ┌────────┴─────────┐  ┌───────────────────────────────────────┐  │
│  │  constants.js    │  │          data/iso9001.js               │  │
│  │  Frontend consts │  │  Clausole 4-10 · 82 requisiti · Testi │  │
│  └──────────────────┘  └───────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    HTTP REST + JSON
                    Authorization: Bearer <JWT>
                    (oppure X-API-Key: tiso_<key>)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER (Node.js 20)                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     index.js (entry point)                    │  │
│  │  express.json() · express.static(public/) · SPA fallback     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────────────── MIDDLEWARE ──────────────────────────┐    │
│  │                                                            │    │
│  │  auth.js              validate.js        error-handler.js  │    │
│  │  ┌─────────────┐    ┌──────────────┐   ┌──────────────┐  │    │
│  │  │ requireAuth │    │ validateProj │   │ asyncHandler │  │    │
│  │  │ JWT + API   │───▶│ validateEval │   │ errorHandler │  │    │
│  │  │ Key verify  │    └──────────────┘   └──────────────┘  │    │
│  │  └──────┬──────┘                                          │    │
│  │         │                                                  │    │
│  │  ┌──────▼──────┐                                          │    │
│  │  │requireAdmin │                                          │    │
│  │  │ role check  │                                          │    │
│  │  └─────────────┘                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────── ROUTES ─────────────────────────────┐    │
│  │                                                            │    │
│  │  /health         GET    → Healthcheck (no auth)           │    │
│  │                                                            │    │
│  │  /api/auth                                                 │    │
│  │    POST /register        → Crea utente (1° = admin)       │    │
│  │    POST /login           → Email + password → JWT         │    │
│  │    GET  /me              → Info utente corrente [Auth]    │    │
│  │    PUT  /theme           → Aggiorna tema [Auth]           │    │
│  │    PUT  /password        → Cambio password [Auth]         │    │
│  │    PUT  /tutorial-complete → Segna tutorial visto [Auth]  │    │
│  │                                                            │    │
│  │  /api/projects                              [Auth]        │    │
│  │    GET    /              → Lista progetti utente           │    │
│  │    POST   /              → Crea progetto                   │    │
│  │    GET    /:id           → Dettaglio progetto              │    │
│  │    PUT    /:id           → Aggiorna progetto               │    │
│  │    DELETE /:id           → Elimina progetto                │    │
│  │    PUT    /:id/evaluations/:reqId → Salva valutazione     │    │
│  │    POST   /:id/documents         → Aggiungi documento     │    │
│  │    PUT    /:id/documents/:docId  → Aggiorna documento     │    │
│  │    DELETE /:id/documents/:docId  → Elimina documento      │    │
│  │    PUT    /:id/milestones        → Aggiorna milestones    │    │
│  │    GET    /:id/changelog         → Storico modifiche      │    │
│  │    GET    /:id/changelog/:reqId  → Storico requisito      │    │
│  │                                                            │    │
│  │  /api/clients                               [Auth]        │    │
│  │    GET    /              → Lista clienti                   │    │
│  │    POST   /              → Crea cliente                    │    │
│  │    GET    /:id           → Dettaglio cliente               │    │
│  │    PUT    /:id           → Aggiorna cliente                │    │
│  │    DELETE /:id           → Elimina (409 se ha progetti)   │    │
│  │                                                            │    │
│  │  /api/api-keys                              [Auth]        │    │
│  │    GET    /              → Lista chiavi API                │    │
│  │    POST   /              → Genera nuova chiave             │    │
│  │    PUT    /:id           → Aggiorna nome/stato             │    │
│  │    DELETE /:id           → Elimina chiave                  │    │
│  │                                                            │    │
│  │  /api/admin                             [Auth + Admin]    │    │
│  │    GET    /users            → Lista utenti                 │    │
│  │    POST   /users            → Crea utente (password gen.) │    │
│  │    PUT    /users/:id/approve → Approva utente              │    │
│  │    PUT    /users/:id/role    → Cambia ruolo                │    │
│  │    DELETE /users/:id         → Elimina utente              │    │
│  │    POST   /send-changelog-summary → Email riepilogo       │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────── SERVIZI ────────────────────────────┐    │
│  │  email.js          → Nodemailer SMTP (opzionale)          │    │
│  │  scheduler.js      → Scheduler email riepilogo changelog  │    │
│  │  constants.js      → Costanti condivise (fasi, stati...)  │    │
│  └────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                        better-sqlite3
                        (sincrono)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SQLite DATABASE (WAL mode)                     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  users                                                        │  │
│  │  ├── id (PK)              ├── role (admin/user)               │  │
│  │  ├── email (UNIQUE)       ├── is_approved (0/1)               │  │
│  │  ├── name                 ├── password_change_required (0/1)  │  │
│  │  ├── password_hash        ├── has_seen_tutorial (0/1)         │  │
│  │  ├── theme                └── created_at                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  clients                                                      │  │
│  │  ├── id (PK, AUTO)       ├── contact_name                    │  │
│  │  ├── user_id (FK→users)  ├── contact_role                    │  │
│  │  ├── company_name        ├── contact_email                   │  │
│  │  ├── sector              ├── contact_phone                   │  │
│  │  ├── ateco               ├── created_at                      │  │
│  │  ├── employees           └── updated_at                      │  │
│  │  ├── legal_address                                            │  │
│  │  └── operational_sites                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  projects                                                     │  │
│  │  ├── id (PK, TEXT)           ├── phase                        │  │
│  │  ├── user_id (FK→users)     ├── evaluations_json (JSON)      │  │
│  │  ├── client_id (FK→clients) ├── documents_json (JSON)        │  │
│  │  ├── client_name            ├── milestones_json (JSON)       │  │
│  │  ├── certification_id       ├── certification_date            │  │
│  │  ├── start_date             ├── certification_expiry          │  │
│  │  ├── target_date            ├── next_audit_date               │  │
│  │  ├── cert_body              ├── audit_cycle                   │  │
│  │  ├── notes                  ├── certification_status          │  │
│  │  ├── sector, ateco, ...     ├── created_at                   │  │
│  │  └── contact_name, ...      └── updated_at                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  changelog                                                    │  │
│  │  ├── id (PK)          ├── field                               │  │
│  │  ├── project_id       ├── old_value / new_value               │  │
│  │  ├── requirement_id   └── created_at                          │  │
│  │  └── user_id / user_name                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  api_keys                                                     │  │
│  │  ├── id (PK)          ├── is_active (0/1)                    │  │
│  │  ├── user_id (FK)     ├── expires_at                         │  │
│  │  ├── key_hash (SHA256)├── last_used_at                       │  │
│  │  ├── key_prefix       └── created_at                         │  │
│  │  └── name                                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  app_settings                                                 │  │
│  │  ├── key (PK, TEXT)                                           │  │
│  │  └── value (TEXT)                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Flusso Autenticazione

```
                    REGISTRAZIONE                         LOGIN
                    ═══════════                          ═════

 ┌─────────┐    POST /register     ┌──────────┐    POST /login     ┌──────────┐
 │ Browser │ ──────────────────▶  │  Server  │ ◀────────────────  │ Browser  │
 │         │  {email,password,    │          │  {email,password}  │          │
 │         │   name}              │          │                    │          │
 └─────────┘                      └────┬─────┘                    └──────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ COUNT(*) users   │
                              │    = 0 ?         │
                              └────┬────────┬────┘
                                   │        │
                              YES  │        │  NO
                                   ▼        ▼
                            ┌────────┐  ┌────────┐
                            │ admin  │  │  user  │
                            │approved│  │pending │
                            └───┬────┘  └───┬────┘
                                │           │
                                ▼           ▼
                         ┌─────────────────────┐
                         │   bcrypt hash (12)   │
                         │   INSERT INTO users  │
                         │   Sign JWT (7 days)  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                          ┌────────────────────┐
                          │  Response:          │
                          │  { token, user,     │
                          │    pendingApproval } │
                          └────────────────────┘
```

## Flusso Richiesta Autenticata

```
  Browser                    Server                    Database
    │                          │                          │
    │  GET /api/projects       │                          │
    │  Authorization: Bearer   │                          │
    │  <jwt-token>             │                          │
    │ ────────────────────▶   │                          │
    │                          │                          │
    │                   ┌──────┴──────┐                   │
    │                   │ requireAuth │                   │
    │                   │ JWT verify  │                   │
    │                   │ or API Key  │                   │
    │                   └──────┬──────┘                   │
    │                          │                          │
    │                          │  req.userId = X          │
    │                          │                          │
    │                          │  SELECT * FROM projects  │
    │                          │  WHERE user_id = X       │
    │                          │ ────────────────────▶   │
    │                          │                          │
    │                          │  ◀──── rows ──────────  │
    │                          │                          │
    │  ◀──── JSON response     │                          │
    │  200 [{...}, {...}]      │                          │
    │                          │                          │
```

## Struttura Frontend SPA

```
┌─────────────────────────────────────────────────────────┐
│                    App.navigate(view)                     │
│                         │                                │
│              ┌──────────┴──────────┐                     │
│              │    App.render()     │                     │
│              └──────────┬──────────┘                     │
│                         │                                │
│         ┌───────────────┼───────────────┐                │
│         ▼               ▼               ▼                │
│  renderHeader()  renderSidebar()  renderMainContent()    │
│                                        │                 │
│              ┌─────────────────────────┐│                │
│              │   switch(currentView)   ││                │
│              └────────────┬────────────┘│                │
│                           │             │                │
│    ┌──────────┬───────────┼──────────┐  │                │
│    ▼          ▼           ▼          ▼  │                │
│ dashboard  projects    clause    settings│                │
│    │          │           │          │   │                │
│    ▼          ▼           ▼          ▼   │                │
│ Views.       Views.      Views.    Views.│                │
│ dashboard()  projectList() clauseView()  │                │
│    │          │           │      settings()              │
│    ▼          ▼           ▼          │   │                │
│ Views.       Views.      Views.    Views.│                │
│ bindDash..() bindProj..() bindCl..() bindSettings()     │
│                                                          │
│  HTML string ──▶ innerHTML ──▶ addEventListener          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Docker

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Node.js 20 Alpine                      │  │
│  │                                                     │  │
│  │  ┌──────────────┐  ┌───────────────────────────┐   │  │
│  │  │ server/      │  │ public/                    │   │  │
│  │  │ index.js     │  │ index.html + js/ + img/    │   │  │
│  │  │ routes/      │  │                            │   │  │
│  │  │ middleware/  │  │ (served as static files)   │   │  │
│  │  │ db.js        │  │                            │   │  │
│  │  └──────────────┘  └───────────────────────────┘   │  │
│  │                                                     │  │
│  │  ┌──────────────┐                                   │  │
│  │  │ scripts/     │                                   │  │
│  │  │ seed-*.js    │ (seed data tools)                 │  │
│  │  └──────────────┘                                   │  │
│  │                                                     │  │
│  │  ENV: JWT_SECRET, DB_PATH=/data/db.sqlite, PORT     │  │
│  └────────────────────────────┬───────────────────────┘  │
│                               │                          │
│                          PORT 3002                       │
└───────────────────────────────┼──────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │  Persistent Volume    │
                    │  (Coolify Storage)    │
                    │                       │
                    │  /data/db.sqlite      │
                    │  /data/db.sqlite-shm  │
                    │  /data/db.sqlite-wal  │
                    └───────────────────────┘
```

## Deployment Coolify (Prod + Preprod)

```
                    ┌───────────────────────┐
                    │     GitHub Repo       │
                    │  branch: main         │
                    │  branch: refactor_*   │
                    └───────────┬───────────┘
                                │
                     webhook / manual deploy
                                │
                    ┌───────────▼───────────┐
                    │       Coolify         │
                    │   (PaaS on VPS)       │
                    └───────────┬───────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │                             │
    ┌────────────▼────────────┐  ┌─────────────▼───────────┐
    │   PROD Container        │  │   PREPROD Container      │
    │   branch: main          │  │   branch: refactor_*     │
    │   trust.4piemai.it      │  │   trust-preprod.4piemai.it│
    │   port: 3002            │  │   port: 3002             │
    └────────────┬────────────┘  └─────────────┬───────────┘
                 │                              │
    ┌────────────▼────────────┐  ┌─────────────▼───────────┐
    │  Volume:                │  │  Volume:                 │
    │  trust-prod-data        │  │  trust-preprod-data      │
    │  /data/db.sqlite        │  │  /data/db.sqlite         │
    └─────────────────────────┘  └─────────────────────────┘
                                  (volumi SEPARATI!)
```

## Mappa Dipendenze Frontend

```
index.html
  ├── CDN: Tailwind CSS
  ├── CDN: Lucide Icons
  │
  ├── data/iso9001.js        (clausole e requisiti - globale CERTIFICATIONS)
  ├── js/constants.js         (costanti frontend)
  ├── js/themes.js            (ThemeManager, ThemeDefinitions)
  ├── js/api-client.js        (ApiClient = Store)
  ├── js/md-export.js         (GuideExport)
  ├── js/auth.js              (AuthUI)
  ├── js/tutorial.js          (Tutorial)
  ├── js/views.js             (Views - facade)
  ├── js/views/
  │     ├── dashboard-view.js
  │     ├── projects-view.js
  │     ├── project-detail-view.js
  │     ├── clause-view.js
  │     ├── requirement-view.js
  │     ├── documents-view.js
  │     ├── timeline-view.js
  │     ├── reports-view.js
  │     ├── settings-view.js
  │     └── admin-view.js
  └── js/app.js              (App - entry point, DOMContentLoaded)

  Ordine di caricamento:
    iso9001 → constants → themes → api-client → md-export →
    auth → tutorial → views → view modules → app

  Dipendenze globali:
    CERTIFICATIONS, AppConstants, ThemeManager,
    ApiClient/Store, GuideExport, AuthUI,
    Tutorial, Views, App
```
