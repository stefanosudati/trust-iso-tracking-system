# Trust ISO Tracking System

Sistema web per la gestione e il monitoraggio di percorsi di certificazione ISO 9001:2015, progettato per consulenti qualita e aziende.

## Funzionalita

### Gestione Progetti e Clienti
- **Anagrafica clienti** — Database centralizzato dei clienti (ragione sociale, ATECO, sedi, referenti). Selezionabili da dropdown quando si crea un nuovo progetto, evitando di reinserire i dati ogni volta.
- **Progetti di certificazione** — Ogni progetto e associato a un cliente e traccia l'intero percorso dalla gap analysis alla certificazione.
- **Fasi del progetto** — Gap Analysis, Implementazione, Pre-Audit, Audit, Certificato.

### Gap Analysis Interattiva
- **Valutazione requisito per requisito** — Stato (implementato, parziale, non implementato, non applicabile, non valutato), note, priorita, responsabile, scadenza.
- **Azioni correttive** — Lista azioni per ogni requisito con stato e scadenza.
- **Evidenze e note audit** — Campi dedicati per documentare evidenze raccolte e osservazioni da audit.
- **Changelog automatico** — Ogni modifica a una valutazione viene registrata con utente, data e vecchio/nuovo valore.

### Dashboard e Report
- **Panoramica generale** — Vista con tutti i progetti, certificazioni disponibili e accessi rapidi.
- **Dashboard progetto** — Conformita %, progresso, criticita, scadenze, grafico radar per clausola, distribuzione stati.
- **Report dettagliati** — Statistiche per clausola, export dati.

### Gestione Documentale
- **Documenti SGQ** — Tracciamento di manuali, procedure, registrazioni, report con stato (bozza, approvato, obsoleto), revisione e riferimento al requisito.

### Timeline e Milestones
- **11 milestones predefinite** — Dall'avvio progetto alla certificazione, con date calcolate automaticamente.
- **Milestones personalizzabili** — Modifica date e stato di completamento.

### Certificazioni Ricorsive
- **Tracciamento rinnovi** — Data certificazione, scadenza, prossimo audit di sorveglianza.
- **Ciclo audit** — Annuale o semestrale.
- **Stato certificazione** — In corso, certificato, scaduto, sospeso.

### Amministrazione
- **Gestione utenti** — Admin puo creare utenti (password auto-generata), approvare registrazioni, promuovere/retrocedere ruoli, eliminare utenti.
- **Primo login** — L'utente creato dall'admin deve cambiare la password al primo accesso.
- **Tutorial primo login** — Wizard di onboarding in 7 step per i nuovi utenti.

### API e Integrazioni
- **API Keys** — Generazione chiavi API con prefisso `tiso_`, hash SHA-256 nel DB. Supporto scadenza a tempo e attivazione/disattivazione.
- **Doppia autenticazione API** — JWT (browser) e API Key (integrazioni) sugli stessi endpoint.
- **Email riepilogo** — Scheduler per invio periodico del riepilogo changelog via SMTP (opzionale).

### Sicurezza
- **HTTPS** — Tutto il traffico e crittografato (TLS gestito da reverse proxy).
- **JWT** — Token con scadenza 7 giorni, inviato via header `Authorization: Bearer`.
- **Password** — Hash bcrypt a 12 round, mai salvate in chiaro.
- **API Keys** — Solo l'hash SHA-256 e salvato nel DB, la chiave raw e visibile una sola volta alla creazione.
- **Primo utente = admin** — Il primo utente registrato diventa automaticamente admin approvato. I successivi richiedono approvazione.

### Personalizzazione
- **5 temi colore** — Default (blu), Trust Corporate, Ocean, Forest, Slate.
- **Responsive** — Ottimizzato per desktop e mobile (iPhone safe area, touch target 44px, no zoom su focus input).

## Tech Stack

| Componente | Tecnologia |
|---|---|
| Frontend | Vanilla JS (SPA, no build tools), Tailwind CSS (CDN), Lucide Icons |
| Backend | Node.js 20 + Express 4 |
| Database | SQLite (better-sqlite3), WAL mode, auto-recovery da corruzione |
| Autenticazione | JWT (jsonwebtoken) + bcryptjs + API Keys (SHA-256) |
| Email | Nodemailer (SMTP opzionale) |
| Test | Vitest + Supertest (85 test) |
| Lint | ESLint |
| Deploy | Docker multi-stage (Alpine), Coolify PaaS |

## Setup Locale

### Prerequisiti

- Node.js 20+
- npm

### Installazione

```bash
git clone https://github.com/stefanosudati/trust-iso-tracking-system.git
cd trust-iso-tracking-system
npm install
cp .env.example .env
# Modifica .env: imposta JWT_SECRET
npm run dev
```

L'app e disponibile su `http://localhost:3002`.

Il primo utente che si registra diventa automaticamente **admin**.

### Comandi

```bash
npm run dev          # Server con auto-reload (node --watch)
npm start            # Server produzione
npm run lint         # Controllo ESLint
npm run lint:fix     # Fix automatico ESLint
npm test             # Esegui tutti i test (85 test)
npm run test:watch   # Test in watch mode
```

## Deploy con Docker

### Build e run

```bash
docker build -t trust-iso .
docker run -d \
  -p 3002:3002 \
  -e JWT_SECRET=$(openssl rand -base64 48) \
  -v trust_data:/data \
  --name trust-iso \
  trust-iso
```

### Con Docker Compose (sviluppo locale)

```bash
cp .env.example .env
# Modifica .env con un JWT_SECRET sicuro
docker compose up -d
```

> **Nota:** Il `docker-compose.yml` usa un volume con nome basato su `COMPOSE_PROJECT_NAME` per evitare conflitti tra istanze multiple. Per il deploy in produzione su Coolify, usa lo Storage persistente di Coolify (vedi sotto).

### Variabili d'Ambiente

| Variabile | Descrizione | Default | Obbligatoria |
|---|---|---|---|
| `JWT_SECRET` | Segreto per firma JWT | — | Si |
| `PORT` | Porta del server | `3002` | No |
| `DB_PATH` | Percorso database SQLite | `/data/db.sqlite` | No |
| `SMTP_HOST` | Host server SMTP | — | No |
| `SMTP_PORT` | Porta server SMTP | `587` | No |
| `SMTP_USER` | Username SMTP | — | No |
| `SMTP_PASS` | Password SMTP | — | No |
| `SMTP_FROM` | Indirizzo mittente email | `SMTP_USER` | No |
| `CHANGELOG_EMAIL_INTERVAL` | Frequenza riepilogo changelog (`daily`/`weekly`) | `daily` | No |

> **IMPORTANTE (Coolify/Docker):** `DB_PATH` deve essere un path assoluto `/data/db.sqlite`, NON relativo `./data/db.sqlite`. Il volume Docker e montato su `/data`.

## Deploy su Coolify

1. **Crea una nuova app** di tipo "Dockerfile"
2. **Collega il repository** GitHub e seleziona il branch (`main` per prod, `refactor_*` per preprod)
3. **Variabili d'ambiente** — Imposta almeno `JWT_SECRET`
4. **Storage persistente** — Vai nella tab **Storage** e aggiungi un volume:
   - **Name**: `trust-prod-data` (per prod) o `trust-preprod-data` (per preprod)
   - **Destination Path**: `/data`
5. **Dominio** — Configura l'FQDN (es. `https://trust.4piemai.it`)
6. **Deploy** — Coolify fara build e deploy automaticamente. L'healthcheck (`GET /health`) e configurato nel Dockerfile.

> **IMPORTANTE:** Ogni istanza Coolify (prod e preprod) deve avere un volume con nome DIVERSO. Se condividono lo stesso volume, due container che accedono simultaneamente allo stesso file SQLite causeranno corruzione del database.

### Popolare con dati demo

Dopo il primo deploy, registra un utente (diventa admin), poi dal terminale del container:

```bash
node scripts/seed-clients-db.js    # Inserisce 8 clienti
node scripts/seed-projects-db.js   # Inserisce 8 progetti con valutazioni, documenti, milestones
```

### Verifica persistenza DB

Dopo il deploy, verifica che il DB usi il volume persistente:

```bash
# Trova il container
docker ps --format "table {{.Names}}\t{{.Status}}"

# Verifica DB_PATH
docker exec <container> env | grep DB_PATH
# Deve mostrare: DB_PATH=/data/db.sqlite

# Verifica volume montato
docker inspect <container> --format '{{json .Mounts}}'
# Deve mostrare Destination: "/data"
```

## Struttura Progetto

```
trust-iso-tracker/
├── server/
│   ├── index.js                    # Express entry point, route mounting
│   ├── db.js                       # SQLite schema, migrazioni, auto-recovery
│   ├── constants.js                # Costanti condivise (fasi, stati, limiti)
│   ├── email.js                    # Wrapper Nodemailer (SMTP opzionale)
│   ├── scheduler.js                # Scheduler email riepilogo changelog
│   ├── middleware/
│   │   ├── auth.js                 # requireAuth (JWT + API Key), requireAdmin
│   │   ├── validate.js             # Validazione input progetti/valutazioni
│   │   └── error-handler.js        # asyncHandler, errorHandler centralizzato
│   └── routes/
│       ├── auth.js                 # Register, login, /me, theme, password, tutorial
│       ├── admin.js                # Gestione utenti, creazione utenti, riepilogo changelog
│       ├── clients.js              # CRUD anagrafica clienti
│       ├── api-keys.js             # CRUD chiavi API
│       ├── health.js               # Healthcheck
│       └── projects/
│           ├── index.js            # Router aggregatore
│           ├── crud.js             # CRUD progetti
│           ├── evaluations.js      # Valutazioni requisiti
│           ├── documents.js        # Documenti SGQ
│           ├── milestones.js       # Milestones timeline
│           ├── changelog.js        # Storico modifiche
│           └── helpers.js          # serializeProject, toColumns, defaultMilestones
├── public/
│   ├── index.html                  # SPA shell + Tailwind CDN + Lucide
│   ├── manifest.json               # PWA manifest
│   ├── img/                        # Logo, favicon, icone
│   ├── data/
│   │   └── iso9001.js              # Struttura ISO 9001:2015 (clausole 4-10, 82 requisiti)
│   └── js/
│       ├── constants.js            # Costanti frontend
│       ├── api-client.js           # REST client con cache locale (Store = ApiClient)
│       ├── themes.js               # Sistema temi con CSS variables
│       ├── auth.js                 # UI login/registrazione
│       ├── tutorial.js             # Wizard onboarding primo login (7 step)
│       ├── md-export.js            # Export guide Markdown
│       ├── views.js                # Facade delegante ai moduli vista
│       ├── app.js                  # Controller SPA, navigazione, utility
│       └── views/
│           ├── dashboard-view.js   # Panoramica + dashboard progetto
│           ├── projects-view.js    # Lista progetti + form creazione/modifica
│           ├── project-detail-view.js  # Dettaglio progetto
│           ├── clause-view.js      # Vista clausola con requisiti
│           ├── requirement-view.js # Dettaglio requisito + valutazione
│           ├── documents-view.js   # Gestione documenti SGQ
│           ├── timeline-view.js    # Timeline milestones
│           ├── reports-view.js     # Report e statistiche
│           ├── settings-view.js    # Impostazioni, temi, password, API keys
│           └── admin-view.js       # Gestione utenti (admin)
├── scripts/
│   ├── seed-clients-db.js          # Seed clienti diretto nel DB (8 aziende italiane)
│   ├── seed-projects-db.js         # Seed progetti diretto nel DB (8 progetti con dati completi)
│   ├── seed-demo.mjs              # Seed via API (5 progetti demo, richiede credenziali)
│   ├── seed-preprod.js             # Seed via API (popola valutazioni/documenti/milestones)
│   ├── seed-credentials.json       # (gitignored) Credenziali admin per seed API
│   └── seed-credentials-example.json
├── tests/
│   ├── health.test.js
│   ├── api/
│   │   ├── auth.test.js            # 30 test autenticazione
│   │   ├── projects.test.js        # 28 test CRUD progetti
│   │   └── admin.test.js           # 9 test gestione utenti
│   └── unit/
│       ├── validation.test.js      # 9 test validazione input
│       └── helpers.test.js         # 8 test helpers
├── Dockerfile                      # Multi-stage build (Alpine)
├── docker-compose.yml              # Compose con volume persistente (dev locale)
├── .env.example
├── .eslintrc.json
├── .gitignore
├── vitest.config.js
└── package.json
```

## API Endpoints

Tutti gli endpoint (tranne auth e health) richiedono autenticazione JWT o API Key.

### Autenticazione

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `POST` | `/api/auth/register` | Registrazione (primo utente = admin) |
| `POST` | `/api/auth/login` | Login, ritorna JWT token |
| `GET` | `/api/auth/me` | Info utente corrente |
| `PUT` | `/api/auth/theme` | Aggiorna tema utente |
| `PUT` | `/api/auth/password` | Cambio password |
| `PUT` | `/api/auth/tutorial-complete` | Segna tutorial come completato |

### Progetti

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/projects` | Lista tutti i progetti |
| `POST` | `/api/projects` | Crea progetto (con `clientId` opzionale) |
| `GET` | `/api/projects/:id` | Dettaglio progetto |
| `PUT` | `/api/projects/:id` | Aggiorna progetto |
| `DELETE` | `/api/projects/:id` | Elimina progetto |
| `PUT` | `/api/projects/:id/evaluations/:reqId` | Salva valutazione requisito |
| `POST` | `/api/projects/:id/documents` | Aggiungi documento |
| `PUT` | `/api/projects/:id/documents/:docId` | Aggiorna documento |
| `DELETE` | `/api/projects/:id/documents/:docId` | Elimina documento |
| `PUT` | `/api/projects/:id/milestones` | Aggiorna milestones |
| `GET` | `/api/projects/:id/changelog` | Storico modifiche (con `?limit=&offset=`) |
| `GET` | `/api/projects/:id/changelog/:reqId` | Changelog singolo requisito |

### Clienti

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/clients` | Lista clienti (admin: tutti, user: propri) |
| `POST` | `/api/clients` | Crea cliente |
| `GET` | `/api/clients/:id` | Dettaglio cliente |
| `PUT` | `/api/clients/:id` | Aggiorna cliente |
| `DELETE` | `/api/clients/:id` | Elimina cliente (solo se senza progetti) |

### API Keys

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/api-keys` | Lista proprie API keys |
| `POST` | `/api/api-keys` | Genera nuova API key |
| `PUT` | `/api/api-keys/:id` | Aggiorna nome/stato |
| `DELETE` | `/api/api-keys/:id` | Elimina API key |

### Amministrazione (solo admin)

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/admin/users` | Lista utenti |
| `POST` | `/api/admin/users` | Crea utente (password auto-generata) |
| `PUT` | `/api/admin/users/:id/approve` | Approva utente |
| `PUT` | `/api/admin/users/:id/role` | Cambia ruolo (admin/user) |
| `DELETE` | `/api/admin/users/:id` | Elimina utente |
| `POST` | `/api/admin/send-changelog-summary` | Invia email riepilogo changelog |

### Health

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/health` | Healthcheck (no auth) |

## Autenticazione API

### JWT (browser)

```
Authorization: Bearer <jwt-token>
```

### API Key (integrazioni)

```
X-API-Key: tiso_<key>
```

oppure:

```
Authorization: Bearer tiso_<key>
```

Le API key si generano da **Impostazioni > Chiavi API**. La chiave raw e visibile una sola volta.

## Script di Seed

### Seed diretto nel DB (consigliato per deploy)

Questi script inseriscono direttamente nel database SQLite senza passare dall'API. Ideali per popolare un'istanza appena deployata.

```bash
# Dal terminale del container Docker
node scripts/seed-clients-db.js    # 8 clienti italiani realistici
node scripts/seed-projects-db.js   # 8 progetti con valutazioni, documenti, milestones
```

Richiedono almeno un utente admin nel DB (registrarsi prima dall'interfaccia web).

### Seed via API (per testing)

```bash
# seed-demo.mjs — Crea 5 progetti demo
cp scripts/seed-credentials-example.json scripts/seed-credentials.json
# Modifica con credenziali admin
node scripts/seed-demo.mjs https://trust.4piemai.it

# seed-preprod.js — Popola progetti esistenti con dati dettagliati
SEED_API_URL=https://trust-preprod.4piemai.it/api SEED_API_KEY=tiso_xxx node scripts/seed-preprod.js
```

## Documentazione

| Documento | Descrizione | Pubblico |
|---|---|---|
| [GUIDA_UTENTE.md](GUIDA_UTENTE.md) | Guida completa per utenti e consulenti | Si |
| [DEVELOPER.md](DEVELOPER.md) | Guida tecnica per sviluppatori | Si |
| [DEPLOY_COOLIFY.md](DEPLOY_COOLIFY.md) | Guida deploy su Coolify passo-passo | Si |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Diagrammi architetturali del sistema | Si |
| [CLAUDE.md](CLAUDE.md) | Istruzioni per Claude Code AI | No |

## Licenza

MIT
