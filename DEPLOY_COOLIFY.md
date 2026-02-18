# Deploy su Coolify — trust.4piemai.it

Guida passo-passo per deployare Trust ISO Tracking System su Coolify con il dominio `trust.4piemai.it`.

---

## Prerequisiti

- Coolify installato e funzionante sulla tua VPS
- Accesso al pannello Coolify (es. `https://coolify.4piemai.it` o l'IP della VPS)
- Accesso alla gestione DNS del dominio `4piemai.it`
- Repository GitHub: `https://github.com/stefanosudati/trust-iso-tracking-system`

---

## Step 1: Configurare il DNS

Prima di tutto, crea il record DNS per il sottodominio `trust.4piemai.it`.

1. Vai nel pannello di gestione DNS del tuo provider (Cloudflare, Namecheap, OVH, ecc.)
2. Aggiungi un **record A** (o CNAME):

   | Tipo | Nome | Valore | TTL |
   |------|------|--------|-----|
   | **A** | `trust` | `IP_DELLA_TUA_VPS` | Auto |

   > Se usi **Cloudflare**, puoi anche usare il proxy (nuvola arancione), ma in quel caso Coolify potrebbe avere problemi con il certificato SSL. In caso di problemi, disabilita il proxy Cloudflare (nuvola grigià= DNS only) e lascia che Coolify gestisca SSL con Let's Encrypt.

3. Attendi la propagazione DNS (di solito pochi minuti, al massimo 24 ore)
4. Verifica che il DNS punti alla VPS:
   ```bash
   dig trust.4piemai.it +short
   # Deve restituire l'IP della tua VPS
   ```

---

## Step 2: Collegare GitHub a Coolify (se non giàfatto)

1. Apri il pannello Coolify
2. Vai su **Sources** (o **Git Sources**) nel menu laterale
3. Se non hai giàcollegato GitHub:
   - Clicca **+ Add** → **GitHub App**
   - Segui la procedura per autorizzare Coolify ad accedere ai tuoi repository
   - Seleziona il repository `trust-iso-tracking-system` (o dai accesso a tutti i repo)

---

## Step 3: Creare la risorsa su Coolify

1. Vai nella **Dashboard** di Coolify
2. Clicca **+ New Resource** (o **+ Add New Resource**)
3. Seleziona **Public Repository** (oppure **Private Repository with GitHub App** se hai configurato lo Step 2)
4. Inserisci l'URL del repository:
   ```
   https://github.com/stefanosudati/trust-iso-tracking-system
   ```
5. Seleziona il **server** su cui vuoi deployare (il tuo VPS)
6. Seleziona un **Environment** (es. Production)
7. Clicca **Continue**

---

## Step 4: Configurare il Build

Coolify dovrebbe rilevare automaticamente il `Dockerfile` nella root del progetto. Verifica che:

1. **Build Pack**: seleziona **Dockerfile** (dovrebbe essere auto-rilevato)
2. **Dockerfile Location**: lascia `/Dockerfile` (default)
3. **Branch**: `main`

---

## Step 5: Configurare le Variabili d'Ambiente

Questa è la parte più importante. Vai nella tab **Environment Variables** e aggiungi:

### Variabili obbligatorie

| Chiave | Valore | Note |
|--------|--------|------|
| `JWT_SECRET` | *(stringa lunga e casuale)* | **Obbligatorio.** Genera con: `openssl rand -base64 48` |
| `PORT` | `3002` | Porta interna del container |
| `DB_PATH` | `/data/db.sqlite` | Percorso del database dentro il container |

### Come generare JWT_SECRET

Esegui questo comando sul tuo computer o sulla VPS:

```bash
openssl rand -base64 48
```

Copia il risultato (es. `a4Bf8kL2mN9pQ3rS5tU7vW1xY3zA6bC8dE0fG2hI4jK6l`) e incollalo come valore di `JWT_SECRET`.

> **IMPORTANTE**: Non usare mai il secret di sviluppo in produzione. Usa sempre una stringa casuale di almeno 32 caratteri.

---

## Step 6: Configurare il Volume Persistente (Storage)

Il database SQLite deve persistere tra i deploy. Senza un volume, perderai tutti i dati ad ogni riavvio.

1. Vai nella tab **Storages** (o **Persistent Storage**)
2. Clicca **+ Add** per aggiungere un nuovo volume
3. Configura:

   | Campo | Valore |
   |-------|--------|
   | **Name** | `trust-iso-data` (o come preferisci) |
   | **Destination Path** | `/data` |

4. Salva

> Questo monta un volume Docker persistente nella directory `/data` del container, dove risiede il file `db.sqlite`.

---

## Step 7: Configurare il Dominio

1. Vai nella tab **General** (o la sezione principale della risorsa)
2. Cerca il campo **Domains** (o **FQDN**)
3. Inserisci:
   ```
   https://trust.4piemai.it
   ```
4. **Port Exposes**: assicurati che sia impostato su `3002`
   - Questo dice a Coolify che il container ascolta sulla porta 3002
   - Coolify configurera il reverse proxy (Traefik) per inoltrare il traffico HTTPS alla porta 3002 del container

> Coolify genera automaticamente il certificato SSL tramite Let's Encrypt per il dominio configurato.

---

## Step 8: Verificare Healthcheck

Coolify dovrebbe rilevare automaticamente l'healthcheck dal Dockerfile. Verifica nella tab **Health Check** che sia configurato:

| Campo | Valore |
|-------|--------|
| **Path** | `/health` |
| **Port** | `3002` |
| **Interval** | `30s` |

Se non e auto-configurato, impostalo manualmente.

---

## Step 9: Deploy

1. Torna alla pagina principale della risorsa
2. Clicca **Deploy** (o **Start**)
3. Attendi il completamento del build (2-3 minuti circa)
4. Controlla i **Build Logs** per eventuali errori
5. Una volta completato, lo status diventa **Running** (verde)

---

## Step 10: Verifica

### Healthcheck

```bash
curl https://trust.4piemai.it/health
```

Risposta attesa:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

### Apertura nel browser

1. Apri `https://trust.4piemai.it`
2. Dovresti vedere la pagina di **Login/Registrazione**
3. Crea il primo account (Registrati)
4. Verrai reindirizzato alla dashboard

---

## Risoluzione Problemi

### Il build fallisce

- **Errore `npm ci`**: verifica che `package-lock.json` sia nel repository
- **Errore `better-sqlite3`**: il Dockerfile giàinclude le build dependencies (`python3 make g++`), non dovrebbe succedere

### Il container si avvia ma il sito non risponde

1. Controlla i **Runtime Logs** su Coolify
2. Verifica che `JWT_SECRET` sia impostato e abbia almeno 16 caratteri
3. Verifica che la porta esposta sia `3002`

### Errore SSL / Certificato

1. Assicurati che il DNS punti alla VPS (non al proxy Cloudflare)
2. Aspetta qualche minuto — Let's Encrypt puo impiegare fino a 5 minuti
3. Controlla i log di Traefik su Coolify

### Persi i dati dopo un redeploy

- Verifica che il volume persistente `/data` sia configurato correttamente (Step 6)
- Controlla nella tab **Storages** che il volume esista e sia montato

### Errore "JWT_SECRET non configurato"

- Vai nelle **Environment Variables** e verifica che `JWT_SECRET` sia presente e non vuoto
- Il secret deve avere almeno 16 caratteri

---

## Aggiornamenti Futuri

Quando fai push di nuove modifiche su GitHub:

### Aggiornamento manuale
1. Vai sulla risorsa in Coolify
2. Clicca **Redeploy** (o **Rebuild**)

### Auto-deploy (opzionale)
1. Nella configurazione della risorsa, cerca **Webhooks** o **Auto Deploy**
2. Abilita **Auto Deploy on Push**
3. Coolify ribuildera e riavviera automaticamente ad ogni push su `main`

---

## Backup

### Backup manuale del database

Puoi copiare il file SQLite dal volume Docker:

```bash
# Sulla VPS, trova il container
docker ps | grep trust

# Copia il database
docker cp <CONTAINER_ID>:/data/db.sqlite ./backup-trust-iso-$(date +%Y%m%d).sqlite
```

### Backup via app

Dall'interfaccia web, usa il pulsante **Esporta** (icona download nell'header) per scaricare un backup JSON di tutti i progetti.

---

## Riepilogo Configurazione

| Parametro | Valore |
|-----------|--------|
| **Repository** | `https://github.com/stefanosudati/trust-iso-tracking-system` |
| **Branch** | `main` |
| **Build Pack** | Dockerfile |
| **Dominio** | `https://trust.4piemai.it` |
| **Porta** | `3002` |
| **Volume** | `/data` (per SQLite) |
| **JWT_SECRET** | *(generato con `openssl rand -base64 48`)* |
| **DB_PATH** | `/data/db.sqlite` |
| **Healthcheck** | `GET /health` sulla porta `3002` |
