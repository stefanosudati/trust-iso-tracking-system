# Trust ISO Tracking System - Architettura

## Diagramma Generale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (SPA)                               │
│                                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ index.   │  │  auth.js  │  │  app.js  │  │    views.js      │  │
│  │ html     │  │ Login/    │  │ Router   │  │ Dashboard, Gap   │  │
│  │ (shell)  │  │ Register  │  │ Events   │  │ Analysis, Report │  │
│  └──────────┘  └───────────┘  └──────────┘  │ Settings, Admin  │  │
│                                              └──────────────────┘  │
│  ┌──────────────────┐  ┌───────────┐  ┌──────────────────────┐    │
│  │  api-client.js   │  │ themes.js │  │   pdf-export.js      │    │
│  │ REST Client +    │  │ CSS Vars  │  │ jsPDF Reports +      │    │
│  │ Local Cache      │  │ Manager   │  │ Guide PDF            │    │
│  └────────┬─────────┘  └───────────┘  └──────────────────────┘    │
│           │                                                        │
│  ┌────────┴──────────────────────────────────────────────────┐    │
│  │              data/iso9001.js                               │    │
│  │      Clausole 4-10 · 81 requisiti · Testi normativi       │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    HTTP REST + JSON
                    Authorization: Bearer <JWT>
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER (Node.js)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     index.js (entry point)                    │  │
│  │  express.json() · express.static(public/) · SPA fallback     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────────────── MIDDLEWARE ──────────────────────────┐    │
│  │  middleware/auth.js                                         │    │
│  │  ┌─────────────┐    ┌──────────────┐                      │    │
│  │  │ requireAuth │───▶│ requireAdmin │                      │    │
│  │  │ JWT verify  │    │ role check   │                      │    │
│  │  └─────────────┘    └──────────────┘                      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────── ROUTES ─────────────────────────────┐    │
│  │                                                            │    │
│  │  /health         GET    → Health check (no auth)          │    │
│  │                                                            │    │
│  │  /api/auth                                                 │    │
│  │    POST /login           → Email + password → JWT         │    │
│  │    POST /register        → Crea utente (1° = admin)       │    │
│  │    PUT  /password        → Cambio password [Auth]         │    │
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
│  │    PUT    /:id/milestones        → Aggiorna milestone     │    │
│  │    GET    /:id/changelog         → Storico modifiche      │    │
│  │                                                            │    │
│  │  /api/admin                             [Auth + Admin]    │    │
│  │    GET    /users            → Lista utenti                 │    │
│  │    PUT    /users/:id/approve → Approva utente              │    │
│  │    PUT    /users/:id/role    → Cambia ruolo                │    │
│  │    DELETE /users/:id         → Elimina utente              │    │
│  │                                                            │    │
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
│  │  ├── id (PK)          ├── role (admin/user)                  │  │
│  │  ├── email (UNIQUE)   ├── is_approved (0/1)                  │  │
│  │  ├── name             ├── password_change_required (0/1)     │  │
│  │  ├── password_hash    ├── theme                              │  │
│  │  └── created_at                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  projects                                                     │  │
│  │  ├── id (PK, UUID)            ├── phase                      │  │
│  │  ├── user_id (FK → users)     ├── evaluations_json (JSON)    │  │
│  │  ├── client_name              ├── documents_json (JSON)      │  │
│  │  ├── certification_id         ├── milestones_json (JSON)     │  │
│  │  ├── start_date / target_date └── created_at / updated_at    │  │
│  │  └── ... (anagrafica cliente)                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  changelog                                                    │  │
│  │  ├── id (PK)          ├── field                              │  │
│  │  ├── project_id       ├── old_value / new_value              │  │
│  │  ├── requirement_id   └── created_at                         │  │
│  │  └── user_id / user_name                                      │  │
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
    │                   │ jwt.verify()│                   │
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
│  │  ┌──────────────┐    ┌───────────────────────────┐ │  │
│  │  │ server/      │    │ public/                    │ │  │
│  │  │ index.js     │    │ index.html + js/ + img/    │ │  │
│  │  │ routes/      │    │                            │ │  │
│  │  │ middleware/  │    │ (served as static files)   │ │  │
│  │  │ db.js        │    │                            │ │  │
│  │  └──────────────┘    └───────────────────────────┘ │  │
│  │                                                     │  │
│  │  ENV: JWT_SECRET, DB_PATH=/data/db.sqlite, PORT     │  │
│  └────────────────────────────┬───────────────────────┘  │
│                               │                          │
│                          PORT 3002                       │
└───────────────────────────────┼──────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Volume: db_data     │
                    │   /data/db.sqlite     │
                    │   /data/db.sqlite-shm │
                    │   /data/db.sqlite-wal │
                    └───────────────────────┘
```

## Mappa Dipendenze Frontend

```
index.html
  ├── CDN: Tailwind CSS
  ├── CDN: Lucide Icons
  ├── CDN: jsPDF
  │
  ├── data/iso9001.js      (clausole e requisiti - globale CERTIFICATIONS)
  ├── js/themes.js          (ThemeManager, ThemeDefinitions)
  ├── js/api-client.js      (ApiClient = Store)
  ├── js/pdf-export.js      (PDFExport)
  ├── js/auth.js             (AuthUI)
  ├── js/views.js            (Views)
  └── js/app.js              (App - entry point, DOMContentLoaded)

  Ordine di caricamento: iso9001 → themes → api-client → pdf-export → auth → views → app
  Dipendenze globali: CERTIFICATIONS, ThemeManager, ApiClient/Store, PDFExport, AuthUI, Views, App
```
