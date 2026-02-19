# Prompt per ricreare Trust ISO Tracking System

> Questo prompt è progettato per essere riutilizzato con un modello AI per ricostruire questa applicazione da zero, oppure per estrarne singoli moduli e applicarli ad altri progetti. Ogni sezione è indipendente e può essere usata singolarmente.

---

## Obiettivo dell'applicazione

Creare un'applicazione web per la gestione del percorso di certificazione ISO 9001:2015. L'app deve permettere a consulenti e aziende di:
- Tracciare lo stato di conformità di ogni requisito della norma
- Gestire la documentazione del Sistema di Gestione Qualità
- Pianificare azioni correttive con responsabili e scadenze
- Generare report PDF professionali
- Collaborare tra più utenti con ruoli differenti (admin/utente)

L'interfaccia deve essere moderna, responsive, in lingua italiana, con supporto temi colore personalizzabili.

---

## Stack tecnologico

### Scelte fatte e motivazioni

| Componente | Tecnologia | Perché |
|-----------|-----------|--------|
| **Runtime server** | Node.js | JavaScript sia frontend che backend, ecosistema npm ricco, facile containerizzazione |
| **Framework server** | Express.js | Minimalista, flessibile, standard de facto per API REST in Node |
| **Database** | SQLite (via better-sqlite3) | File singolo, zero configurazione, nessun server DB separato, ideale per deploy semplificati. API sincrona = codice più lineare |
| **Autenticazione** | JWT + bcryptjs | Stateless (nessuna sessione server), scalabile, il token contiene l'identità utente |
| **Frontend** | Vanilla JavaScript (no framework) | Zero build step, nessun bundler, caricamento istantaneo, nessuna dipendenza da aggiornare. Per app di questa complessità un framework non aggiunge valore sufficiente |
| **CSS** | Tailwind CSS (CDN) | Utility-first, prototipazione rapida, design system coerente senza scrivere CSS custom |
| **Icone** | Lucide (CDN) | Set completo, leggere, aggiornabili dinamicamente via JS |
| **PDF** | jsPDF (CDN) | Generazione client-side, nessun carico server, personalizzazione completa |
| **Container** | Docker (Alpine) | Deployment riproducibile, portabile su qualsiasi piattaforma |
| **Font** | Inter (Google Fonts) | Leggibilità eccellente, moderno, gratuito |

### Per chi deve decidere (spiegazione non tecnica)

- **Il database** è un singolo file dentro l'applicazione (come un file Excel ma molto più potente). Non serve installare niente di separato. Lo svantaggio è che non scala a migliaia di utenti simultanei, ma per decine di utenti è più che sufficiente.
- **Il frontend senza framework** significa che il codice è JavaScript puro, senza dipendenze da librerie come React o Vue. Questo rende l'app più leggera e veloce, ma il codice UI è più verboso. Per app più grandi (>50 viste) un framework sarebbe consigliato.
- **JWT per autenticazione** significa che il server non deve ricordare chi è loggato — l'informazione è contenuta nel token stesso che il browser manda ad ogni richiesta. Scade dopo 7 giorni.
- **Docker** permette di installare l'app su qualsiasi server con un solo comando, senza preoccuparsi di versioni di Node o dipendenze.

### Alternative da considerare per altri progetti

| Se serve... | Considera... |
|-------------|-------------|
| Multi-utenza pesante (>100 utenti) | PostgreSQL al posto di SQLite |
| UI complessa con molte viste interattive | React, Vue o Svelte al posto di vanilla JS |
| Ricerca full-text avanzata | Meilisearch o Elasticsearch |
| Notifiche real-time | WebSocket (socket.io) |
| File upload | Multer + S3/MinIO |
| Email (reset password, notifiche) | Nodemailer + SMTP |

---

## Architettura

```
Browser (SPA vanilla JS)
    │
    ├── index.html (shell HTML con CDN)
    ├── js/app.js (routing, controller)
    ├── js/views.js (rendering UI)
    ├── js/api-client.js (HTTP client + cache)
    ├── js/auth.js (login/register UI)
    ├── js/themes.js (temi colore)
    ├── js/pdf-export.js (generazione PDF + guide Markdown)
    └── data/iso9001.js (dati normativi)
         │
         │  HTTP REST (JSON) + JWT Bearer token
         ▼
Express.js Server
    │
    ├── index.js (entry point)
    ├── middleware/auth.js (JWT + admin check)
    ├── routes/auth.js (login, register, password)
    ├── routes/projects.js (CRUD + evaluations + docs + milestones + changelog)
    ├── routes/admin.js (gestione utenti)
    └── routes/health.js (healthcheck)
         │
         ▼
SQLite Database (WAL mode, file singolo)
```

### Pattern fondamentale del frontend SPA

Il frontend usa un pattern **render + bind**:
1. Una funzione `Views.xxx()` genera HTML come stringa
2. L'HTML viene iniettato via `innerHTML`
3. Una funzione `Views.bindXxx()` attacca gli event listener
4. La navigazione avviene via `App.navigate(view, params)` che chiama `App.render()`

Questo pattern è semplice, prevedibile e non richiede virtual DOM o librerie di stato. Lo svantaggio è che l'intera vista viene ri-renderizzata ad ogni cambio — accettabile per questa scala.

### Pattern del client API

`ApiClient` usa un pattern **cache locale + fetch asincrono**:
- Le operazioni di LETTURA sono sincrone (dalla cache in memoria)
- Le operazioni di SCRITTURA sono asincrone (fetch al server, poi aggiornamento cache)
- `const Store = ApiClient` — alias per backward compatibility

---

## Feature in dettaglio

### F1 — Autenticazione e gestione utenti

**Registrazione:**
- Campi: nome, email, password
- Validazione password: minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo
- Il primo utente registrato diventa automaticamente admin con accesso immediato
- Tutti gli utenti successivi sono in stato "In attesa di approvazione"
- Email normalizzata a lowercase e trimmed

**Login:**
- Email + password
- Verifica bcrypt (12 round)
- Controllo stato approvazione (utenti non approvati vedono messaggio di attesa)
- Token JWT con scadenza 7 giorni
- Auto-logout su errore 401/403

**Cambio password:**
- Dalla sezione Impostazioni
- Richiede password attuale + nuova + conferma
- Stesse regole di validazione della registrazione
- Supporto cambio password forzato al primo login

**Toggle visibilità password:**
- Icona occhio su tutti i campi password (7 totali)
- Click alterna tipo input tra password/text
- Icona cambia tra eye e eye-off

**Gestione utenti (solo admin):**
- Tabella con tutti gli utenti registrati
- Pulsante "Approva" per utenti in attesa
- Pulsante "Promuovi Admin" / "Retrocedi" per cambiare ruolo
- Pulsante "Elimina" (con conferma) per rimuovere utenti
- Protezione: non puoi modificare il tuo stesso ruolo, non puoi eliminare admin

### F2 — Gestione progetti

**Creazione progetto:**
- Campi anagrafica cliente: nome, settore, ATECO, dipendenti, sedi, contatto
- Selezione certificazione (ISO 9001:2015)
- Fase progetto: Gap Analysis / Implementazione / Pre-Audit / Audit / Certificato
- Date: inizio e target certificazione
- Ente di certificazione
- Generazione automatica di 11 milestone tipiche

**Lista progetti:**
- Card con nome cliente, fase, percentuale conformità, data target
- Click per attivare il progetto
- Tutti i progetti sono visibili e modificabili da tutti gli utenti autenticati

**Dettaglio progetto:**
- Tutti i campi anagrafica modificabili
- Sezione Change Log completo (storico di tutte le modifiche ai requisiti)

### F3 — Gap Analysis e valutazione requisiti

**Vista clausola:**
- 7 clausole ISO (4-10) mostrate nella sidebar con percentuale completamento
- Per ogni clausola: lista requisiti con icona stato e titolo
- Requisiti con sotto-requisiti (es. 4.4 → 4.4.1, 4.4.2)

**Scheda valutazione singolo requisito:**
- Stato: Implementato / Parziale / Non implementato / Non applicabile / Non valutato
- Priorità: Alta / Media / Bassa
- Responsabile (testo libero)
- Scadenza (date picker)
- Note (textarea)
- Azioni correttive (checklist dinamica con aggiunta/rimozione/completamento)
- Note evidenze (lista di stringhe)
- Note audit (textarea)
- Testo normativo ISO come riferimento
- Documenti obbligatori ed evidenze suggerite dalla norma
- Giustificazione per "Non applicabile"
- Pulsante Change Log per storico modifiche del requisito

**Changelog:**
- Tabella dedicata nel DB
- Traccia ogni modifica campo per campo: stato, note, priorità, responsabile, scadenza, azioni, evidenze, note audit
- Registra utente e timestamp
- Pannello slide-in da destra nella vista requisito
- Vista completa in Dati Progetto con filtro per requisito e paginazione

### F4 — Dashboard

- 4 card statistiche: conformità %, progresso %, criticità, giorni a scadenza
- Barre di progresso per clausola (cliccabili per navigare)
- Distribuzione stato requisiti (5 barre con conteggi)
- Grafico radar Canvas per conformità per clausola
- Lista requisiti critici non conformi
- Lista prossime milestone

### F5 — Gestione documenti

- CRUD documenti con: codice, nome, versione, data emissione, stato
- Stati: Bozza / Approvato / Obsoleto
- Checklist documenti obbligatori ISO 9001:2015
- Modale per aggiunta/modifica documenti

### F6 — Timeline e milestone

- Visualizzazione cronologica delle milestone
- 11 milestone generate automaticamente alla creazione progetto
- CRUD: aggiunta, completamento (checkbox), eliminazione
- Visualizzazione in Dashboard e nei report PDF

### F7 — Report PDF

5 report professionali generati client-side con jsPDF:
1. **Gap Analysis**: tutti i requisiti con stato, note, azioni
2. **Piano di Implementazione**: azioni correttive con responsabili, scadenze, priorità + milestone
3. **Executive Summary**: riepilogo per la direzione con percentuali e mini-grafici
4. **Checklist Documenti**: documenti obbligatori ISO vs documenti registrati
5. **Registro Non Conformità**: dettaglio NC con descrizioni e azioni correttive

Ogni PDF ha: intestazione colorata con tema attivo, piè di pagina con numerazione, page break automatici, fallback CDN per jsPDF.

### F8 — Guide scaricabili

- Guida Utente (Markdown, 12 capitoli)
- Guida Amministratore (Markdown, 10 capitoli, visibile solo ad admin)
- Scaricabili dalla sezione Impostazioni

### F9 — Temi colore

5 temi con CSS custom properties su `:root`:
- Default (blu), Trust Corporate (teal/borgogna), Ocean (cyan/navy), Forest (verde), Slate (grigio)
- Ogni tema definisce: primary, sidebar, header, badge, progress bar, focus ring, etc.
- Salvato nel profilo utente (DB) e in localStorage per anti-FOUC
- Preview visuale nella pagina Impostazioni

### F10 — Import/Export dati

- Export JSON completo di tutti i progetti (pulsante nell'header)
- Import JSON per ripristino backup
- Include valutazioni, documenti, milestone, metadati

### F11 — Ricerca rapida

- Campo di ricerca nell'header
- Ricerca per codice requisito, titolo, testo normativo
- Risultati in tempo reale (dropdown)
- Click per navigare direttamente al requisito

### F12 — PWA

- manifest.json con icone multiple sizes
- Installabile da browser mobile
- Favicon in multiple formati

---

## Schema Database

```sql
CREATE TABLE users (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  email                    TEXT UNIQUE NOT NULL,
  name                     TEXT NOT NULL,
  password_hash            TEXT NOT NULL,
  theme                    TEXT DEFAULT 'default',
  role                     TEXT DEFAULT 'user',       -- 'admin' | 'user'
  is_approved              INTEGER DEFAULT 0,
  password_change_required INTEGER DEFAULT 0,
  created_at               TEXT DEFAULT (datetime('now'))
);

CREATE TABLE projects (
  id                TEXT PRIMARY KEY,            -- UUID generato dal client
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
  evaluations_json  TEXT DEFAULT '{}',   -- JSON map: reqId -> evaluation object
  documents_json    TEXT DEFAULT '[]',   -- JSON array of document objects
  milestones_json   TEXT DEFAULT '[]',   -- JSON array of milestone objects
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE changelog (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      TEXT NOT NULL,
  requirement_id  TEXT NOT NULL,
  user_id         INTEGER NOT NULL,
  user_name       TEXT NOT NULL,
  field           TEXT NOT NULL,        -- es: 'status', 'notes', 'actions'
  old_value       TEXT,
  new_value       TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);
```

**Note importanti:**
- Le valutazioni, documenti e milestone sono salvati come JSON dentro la tabella projects per semplicità. Questo evita join complesse ma non permette query SQL sui singoli requisiti.
- Il changelog è una tabella separata per permettere query efficienti sullo storico.
- Le migrazioni sono semplici `ALTER TABLE ADD COLUMN` in un try/catch (ignora se la colonna esiste già).
- WAL mode per concorrenza lettura/scrittura.

---

## API REST

### Auth (no autenticazione richiesta)
| Metodo | Endpoint | Descrizione |
|--------|---------|-------------|
| POST | `/api/auth/register` | Registra utente. Body: `{email, password, name}` |
| POST | `/api/auth/login` | Login. Body: `{email, password}`. Ritorna JWT + user |

### Auth (JWT richiesto)
| Metodo | Endpoint | Descrizione |
|--------|---------|-------------|
| PUT | `/api/auth/password` | Cambia password. Body: `{oldPassword, newPassword}` |

### Projects (JWT richiesto)
| Metodo | Endpoint | Descrizione |
|--------|---------|-------------|
| GET | `/api/projects` | Tutti i progetti |
| POST | `/api/projects` | Crea progetto |
| GET | `/api/projects/:id` | Dettaglio progetto |
| PUT | `/api/projects/:id` | Aggiorna progetto |
| DELETE | `/api/projects/:id` | Elimina progetto |
| PUT | `/api/projects/:id/evaluations/:reqId` | Salva valutazione requisito |
| POST | `/api/projects/:id/documents` | Aggiungi documento |
| PUT | `/api/projects/:id/documents/:docId` | Aggiorna documento |
| DELETE | `/api/projects/:id/documents/:docId` | Elimina documento |
| PUT | `/api/projects/:id/milestones` | Aggiorna milestone |
| GET | `/api/projects/:id/changelog` | Storico modifiche (con paginazione) |
| GET | `/api/projects/:id/changelog/:reqId` | Storico per requisito specifico |

### Admin (JWT + ruolo admin)
| Metodo | Endpoint | Descrizione |
|--------|---------|-------------|
| GET | `/api/admin/users` | Lista tutti gli utenti |
| PUT | `/api/admin/users/:id/approve` | Approva utente |
| PUT | `/api/admin/users/:id/role` | Cambia ruolo. Body: `{role: 'admin'|'user'}` |
| DELETE | `/api/admin/users/:id` | Elimina utente |

### Health (no autenticazione)
| Metodo | Endpoint | Descrizione |
|--------|---------|-------------|
| GET | `/health` | Healthcheck (200 OK) |

---

## Deployment Docker

### Dockerfile (multi-stage)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libstdc++
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server/ ./server/
COPY public/ ./public/
RUN mkdir -p /data
ENV NODE_ENV=production DB_PATH=/data/db.sqlite PORT=3002
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"
CMD ["node", "server/index.js"]
```

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
volumes:
  db_data:
```

---

## Lesson learned

### Architettura e design

1. **Vanilla JS è praticabile fino a ~2000 righe di views.** Oltre questa soglia il codice diventa difficile da gestire. Per la prossima iterazione considerare un framework leggero (Svelte, Preact).

2. **Il pattern render+bind funziona bene** ma ha lo svantaggio di ri-renderizzare tutto. Per form complesse (come la valutazione requisito) questo può causare perdita di focus. Soluzione: aggiornare solo i nodi DOM necessari oppure usare un framework con virtual DOM.

3. **SQLite in WAL mode è eccellente** per applicazioni single-server. Zero configurazione, backup = copiare un file. Ma quando si cancella il DB bisogna ricordarsi di eliminare anche i file `.shm` e `.wal`.

4. **I dati JSON dentro una colonna SQL** (evaluations_json, documents_json, milestones_json) semplificano enormemente il codice (niente tabelle relazionali per valutazioni) ma rendono impossibile fare query SQL sui singoli requisiti. Per un sistema più grande, normalizzare in tabelle separate.

5. **Il primo utente diventa admin** è un pattern molto più robusto che creare admin da variabili d'ambiente. Elimina un'intera classe di problemi di configurazione al deploy.

### Frontend

6. **CDN per librerie esterne (Tailwind, jsPDF, Lucide)** semplifica il deploy (nessun build step) ma crea dipendenza dalla rete. Aggiungere sempre un fallback CDN alternativo (fatto per jsPDF: cdnjs → unpkg).

7. **Anti-FOUC per i temi**: applicare il tema salvato in localStorage PRIMA del rendering del body con uno script inline in `<head>`. Altrimenti si vede un flash del tema di default.

8. **Il toggle password con icona eye/eye-off** sembra banale ma tocca 7 campi diversi in 3 file. Centralizzare la funzione `togglePw()` come globale nell'HTML anziché duplicarla.

9. **Gli accenti italiani** sono un problema ricorrente. Usare sempre i caratteri corretti fin dall'inizio (à, è, é, ì, ò, ù) e non gli apostrofi.

### Backend e sicurezza

10. **Validazione password server-side**: minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo. La stessa validazione va fatta anche lato client per UX, ma il server è l'autorità finale.

11. **bcrypt con 12 round** è un buon compromesso tra sicurezza e velocità. Non scendere sotto 10 in produzione.

12. **JWT senza refresh token**: semplice ma significa che l'utente deve riloggare ogni 7 giorni. Per UX migliore implementare un refresh token.

13. **Email normalizzata a lowercase + trim**: essenziale per evitare duplicati ("User@Mail.com" vs "user@mail.com").

### Deployment

14. **Multi-stage Docker build**: essenziale per better-sqlite3 che richiede compilazione nativa (python3, make, g++). Il build stage compila, il runtime stage ha solo libstdc++.

15. **Su Coolify**: non usare variabili d'ambiente per credenziali admin iniziali. Il meccanismo "primo utente = admin" è molto più affidabile.

16. **Healthcheck nel Dockerfile**: usare un mini-script Node.js che fa una richiesta HTTP, non curl (che non è presente in Alpine).

17. **Volume Docker per il database**: montare sempre /data come volume persistente. Senza volume, ogni riavvio del container cancella il database.

### Processo di sviluppo

18. **Le credenziali non vanno mai committate**: usare un file separato (es. `seed-credentials.json`) aggiunto al `.gitignore` con un file esempio (`seed-credentials-example.json`) committato.

19. **Lo script seed è utilissimo** per demo e testing. Creare profili di dati diversi (early, mid, advanced) per testare dashboard e report con dati realistici.

20. **Il changelog delle modifiche è fondamentale** in un'app collaborativa. Implementarlo fin dall'inizio è molto più facile che aggiungerlo dopo.

21. **Documentazione nella codebase** (DEVELOPER.md, ARCHITECTURE.md): scriverla durante lo sviluppo, non dopo. Aiuta anche il modello AI a mantenere coerenza nelle sessioni successive.

---

## Come usare questo prompt

### Per ricreare l'app da zero
Fornisci questo intero file al modello AI e chiedi: "Ricrea questa applicazione seguendo le specifiche descritte".

### Per applicare singoli moduli ad altre app
Estrai la sezione desiderata (es. "F1 — Autenticazione") e adattala al contesto del nuovo progetto.

### Per cambiare stack tecnologico
Descrivi al modello quali tecnologie vuoi usare al posto di quelle indicate, mantenendo le stesse feature e lo schema dati come riferimento.

### Per aggiungere feature
Aggiungi una nuova sezione "F13 — [Nome feature]" con la stessa struttura delle feature esistenti e fornisci il prompt aggiornato.
