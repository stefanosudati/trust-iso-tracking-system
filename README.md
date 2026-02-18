# Trust ISO Tracking System

Sistema web per la gestione e il monitoraggio di percorsi di certificazione ISO, progettato per consulenti e aziende.

## Funzionalita

- **Autenticazione** — Registrazione e login con JWT
- **Gestione Progetti** — Crea e gestisci progetti di certificazione per clienti diversi
- **Gap Analysis Interattiva** — Valutazione requisito per requisito con punteggi 0-5 e note
- **Dashboard** — Panoramica dello stato di avanzamento con grafici
- **Gestione Documentale** — Tracciamento di manuali, procedure, registrazioni
- **Timeline & Milestones** — Pianificazione con date target e milestones personalizzabili
- **Export PDF** — Report completo esportabile in PDF
- **Certificazioni Supportate** — ISO 9001:2015 (struttura completa clausole 4-10)

## Tech Stack

| Componente | Tecnologia |
|---|---|
| Frontend | Vanilla JS, Tailwind CSS (CDN), Lucide Icons, Chart.js |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Autenticazione | JWT + bcryptjs |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Deploy | Docker (single container) |

## Setup Locale

### Prerequisiti

- Node.js 18+
- npm

### Installazione

```bash
git clone https://github.com/YOUR_USER/trust-iso-tracking-system.git
cd trust-iso-tracking-system
npm install
cp .env.example .env
# Modifica .env con il tuo JWT_SECRET
npm run dev
```

L'app sara disponibile su `http://localhost:3000`

## Deploy con Docker

### Build e run

```bash
docker build -t trust-iso .
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=$(openssl rand -base64 48) \
  -v trust_data:/data \
  --name trust-iso \
  trust-iso
```

### Con Docker Compose

```bash
cp .env.example .env
# Modifica .env con JWT_SECRET sicuro
docker compose up -d
```

## Deploy su Coolify

1. **Crea una nuova app** su Coolify di tipo "Dockerfile"
2. **Collega il repository** GitHub
3. **Imposta le variabili d'ambiente**:
   - `JWT_SECRET` — Stringa lunga e casuale (obbligatoria)
   - `PORT` — 3000 (default)
4. **Configura il volume persistente**:
   - Source: volume Docker o bind mount
   - Destination: `/data`
5. **Healthcheck**: Coolify rileva automaticamente l'healthcheck dal Dockerfile (`GET /health`)
6. **Deploy** — Coolify fara build e deploy automaticamente

### Variabili d'Ambiente

| Variabile | Descrizione | Default |
|---|---|---|
| `JWT_SECRET` | Segreto per firma JWT (obbligatorio) | — |
| `PORT` | Porta del server | `3000` |
| `DB_PATH` | Percorso database SQLite | `/data/db.sqlite` |

## Struttura Progetto

```
trust-iso-tracker/
├── server/
│   ├── index.js              # Express entry point
│   ├── db.js                 # SQLite init + schema
│   ├── middleware/auth.js     # JWT middleware
│   └── routes/
│       ├── auth.js           # Register, Login, Me
│       ├── projects.js       # CRUD + evaluations/docs/milestones
│       └── health.js         # Healthcheck
├── public/                    # Static files (serviti da Express)
│   ├── index.html
│   ├── data/iso9001.js       # Struttura ISO 9001:2015
│   └── js/
│       ├── api-client.js     # API client + cache
│       ├── auth.js           # Login/Register UI
│       ├── app.js            # App controller
│       ├── views.js          # UI views
│       └── pdf-export.js     # PDF generation
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## API Endpoints

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `POST` | `/api/auth/register` | Registrazione utente |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Info utente corrente |
| `GET` | `/api/projects` | Lista progetti |
| `POST` | `/api/projects` | Crea progetto |
| `GET` | `/api/projects/:id` | Dettaglio progetto |
| `PUT` | `/api/projects/:id` | Aggiorna progetto |
| `DELETE` | `/api/projects/:id` | Elimina progetto |
| `PUT` | `/api/projects/:id/evaluations/:reqId` | Salva valutazione |
| `POST` | `/api/projects/:id/documents` | Aggiungi documento |
| `PUT` | `/api/projects/:id/documents/:docId` | Aggiorna documento |
| `DELETE` | `/api/projects/:id/documents/:docId` | Elimina documento |
| `PUT` | `/api/projects/:id/milestones` | Aggiorna milestones |
| `GET` | `/health` | Healthcheck |

## Licenza

MIT
