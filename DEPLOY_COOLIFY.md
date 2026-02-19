# Guida al Deploy su Coolify — Trust ISO Tracking System

Guida completa e dettagliata per il deploy di Trust ISO Tracking System su Coolify.
Questa guida copre due istanze: **produzione** (`trust.4piemai.it`) e **pre-produzione** (`trust-preprod.4piemai.it`).

Scritta per amministratori con accesso base al server che si affacciano per la prima volta a Docker e Coolify.

---

## Indice

1. [Prerequisiti](#prerequisiti)
2. [Concetti Base](#concetti-base)
3. [Step 1: Configurazione DNS](#step-1-configurazione-dns)
4. [Step 2: Collegare GitHub a Coolify](#step-2-collegare-github-a-coolify)
5. [Step 3: Creare la risorsa Produzione](#step-3-creare-la-risorsa-produzione)
6. [Step 4: Variabili d'ambiente](#step-4-variabili-dambiente)
7. [Step 5: Storage persistente](#step-5-storage-persistente)
8. [Step 6: Dominio e porta](#step-6-dominio-e-porta)
9. [Step 7: Healthcheck](#step-7-healthcheck)
10. [Step 8: Deploy e verifica](#step-8-deploy-e-verifica)
11. [Step 9: Popolare con dati demo](#step-9-popolare-con-dati-demo)
12. [Step 10: Creare l'istanza Pre-Produzione](#step-10-creare-listanza-pre-produzione)
13. [Aggiornamenti e Auto-deploy](#aggiornamenti-e-auto-deploy)
14. [Backup](#backup)
15. [Risoluzione Problemi](#risoluzione-problemi)
16. [Riepilogo Configurazione](#riepilogo-configurazione)

---

## Prerequisiti

Prima di iniziare, assicurati di avere:

| Requisito | Dettaglio |
|-----------|-----------|
| **Coolify installato** | Coolify deve essere gia installato e funzionante sulla tua VPS (es. `https://coolify.4piemai.it`) |
| **Accesso VPS** | Accesso SSH al server dove gira Coolify, necessario per operazioni di backup e debug |
| **Accesso DNS** | Possibilita di creare record DNS per il dominio `4piemai.it` (es. tramite Cloudflare, Namecheap, OVH) |
| **Repository GitHub** | Il codice sorgente deve essere ospitato su GitHub: `https://github.com/stefanosudati/trust-iso-tracking-system` |

---

## Concetti Base

Se e la prima volta che lavori con Docker e Coolify, questa sezione spiega i concetti fondamentali.

### Che cos'e Docker?

Docker e uno strumento che permette di "impacchettare" un'applicazione con tutto cio di cui ha bisogno per funzionare (codice, librerie, configurazioni) in un pacchetto isolato chiamato **container**. Questo garantisce che l'applicazione funzioni allo stesso modo su qualsiasi server, indipendentemente dalla sua configurazione.

### Che cos'e un Container?

Un container e un'istanza in esecuzione di un'applicazione Docker. Puoi pensarlo come una "scatola" isolata che contiene la tua applicazione. Ogni volta che fai un deploy, Coolify crea un nuovo container con la versione aggiornata del codice. Il container precedente viene eliminato.

### Che cos'e un Volume?

Un volume e uno spazio di archiviazione persistente. Quando un container viene eliminato e ricreato (ad esempio durante un aggiornamento), tutto il suo contenuto viene perso. Un volume risolve questo problema: e una cartella sul server che sopravvive alla distruzione del container. Nel nostro caso, il volume contiene il database SQLite dell'applicazione. Senza un volume configurato, **perderesti tutti i dati ad ogni deploy**.

### Che cos'e Coolify?

Coolify e una piattaforma di gestione deploy (PaaS, Platform as a Service) auto-ospitata. In pratica e un pannello di controllo grafico che semplifica enormemente il processo di deploy: costruisce l'immagine Docker, gestisce i container, configura i certificati SSL e si occupa del reverse proxy. Senza Coolify, dovresti fare tutto questo manualmente da linea di comando.

### Che cos'e un Reverse Proxy?

Un reverse proxy e un componente che riceve le richieste degli utenti (ad esempio quando visitano `https://trust.4piemai.it`) e le inoltra al container corretto. Coolify utilizza **Traefik** come reverse proxy. Traefik si occupa anche di generare e rinnovare automaticamente i certificati SSL (HTTPS) tramite Let's Encrypt, senza che tu debba fare nulla.

### Che cos'e un Dockerfile?

Il Dockerfile e un file di istruzioni che dice a Docker come costruire l'immagine della tua applicazione. Contiene i passaggi necessari: quale sistema operativo base usare (Node.js su Alpine Linux), quali file copiare, quali dipendenze installare, e quale comando eseguire per avviare l'applicazione. Il nostro Dockerfile si trova nella root del repository.

---

## Step 1: Configurazione DNS

Per rendere l'applicazione raggiungibile tramite un indirizzo web leggibile (come `trust.4piemai.it`), devi creare dei record DNS che puntino al tuo server.

Devi creare **due record A**, uno per la produzione e uno per la pre-produzione.

### Procedura

1. Accedi al pannello di gestione DNS del tuo provider (Cloudflare, Namecheap, OVH, ecc.)
2. Crea i seguenti record:

| Tipo | Nome | Valore | TTL |
|------|------|--------|-----|
| **A** | `trust` | `IP_DELLA_TUA_VPS` | Auto |
| **A** | `trust-preprod` | `IP_DELLA_TUA_VPS` | Auto |

Sostituisci `IP_DELLA_TUA_VPS` con l'indirizzo IP pubblico del tuo server (es. `123.45.67.89`).

3. Attendi la propagazione DNS. Di solito bastano pochi minuti, ma in rari casi puo richiedere fino a 24 ore.

4. Verifica che i record siano attivi collegandoti in SSH alla VPS ed eseguendo:

```bash
dig trust.4piemai.it +short
# Deve restituire l'IP della tua VPS

dig trust-preprod.4piemai.it +short
# Deve restituire lo stesso IP della tua VPS
```

> **ATTENZIONE — Utenti Cloudflare:** se utilizzi Cloudflare come provider DNS, potresti avere il proxy attivo (icona nuvola arancione). Questo puo causare conflitti con i certificati SSL generati da Coolify tramite Let's Encrypt, perche Cloudflare interpone il proprio certificato. Se riscontri errori SSL, disabilita il proxy Cloudflare per questi record (icona nuvola grigia, modalita "DNS only") e lascia che sia Coolify a gestire HTTPS con Let's Encrypt.

---

## Step 2: Collegare GitHub a Coolify

Coolify ha bisogno di accedere al repository GitHub per scaricare il codice sorgente e costruire l'applicazione. Se hai gia configurato questa connessione in precedenza, puoi saltare questo step.

### Procedura

1. Apri il pannello di Coolify nel browser (es. `https://coolify.4piemai.it`)
2. Nel menu laterale, vai su **Sources** (oppure **Git Sources**)
3. Clicca **+ Add** e seleziona **GitHub App**
4. Segui la procedura guidata per autorizzare Coolify ad accedere al tuo account GitHub
5. Quando richiesto, seleziona il repository `trust-iso-tracking-system` (oppure concedi accesso a tutti i repository)
6. Completa l'autorizzazione e torna al pannello Coolify

Coolify salvera le credenziali e da questo momento potrai selezionare il repository durante la creazione delle risorse.

---

## Step 3: Creare la risorsa Produzione

Ora creiamo la risorsa su Coolify per l'istanza di **produzione**. Una "risorsa" in Coolify rappresenta un'applicazione che verra costruita, deployata e gestita.

### Procedura

1. Vai nella **Dashboard** di Coolify
2. Clicca **+ New Resource** (oppure **+ Add New Resource**)
3. Seleziona **Private Repository with GitHub App** (se hai completato lo Step 2) oppure **Public Repository** se il repo e pubblico
4. Seleziona il repository: `trust-iso-tracking-system`
5. Seleziona il **server** su cui vuoi fare il deploy (la tua VPS)
6. Seleziona come **Environment** il valore **Production**
7. Clicca **Continue**

### Configurazione Build

Nella schermata di configurazione della risorsa:

1. **Build Pack**: seleziona **Dockerfile**. Coolify dovrebbe rilevarlo automaticamente dalla root del repository
2. **Dockerfile Location**: lascia il valore predefinito `/Dockerfile`
3. **Branch**: seleziona **main**

> **Nota:** il Dockerfile del progetto e un build multi-stage ottimizzato. Nella prima fase installa le dipendenze di compilazione necessarie per `better-sqlite3`, nella seconda fase crea un'immagine leggera con solo il necessario per l'esecuzione. Il Dockerfile include anche la directory `scripts/` che contiene gli script per popolare il database con dati di esempio.

---

## Step 4: Variabili d'ambiente

Le variabili d'ambiente sono parametri di configurazione che l'applicazione legge all'avvio. Sono il modo corretto per passare informazioni sensibili (come chiavi segrete) o configurazioni specifiche dell'ambiente.

### Procedura

1. Nella pagina della risorsa appena creata, vai nella tab **Environment Variables**
2. Aggiungi le seguenti variabili:

#### Variabili obbligatorie

| Chiave | Valore | Spiegazione |
|--------|--------|-------------|
| `JWT_SECRET` | *(stringa casuale di almeno 48 caratteri)* | Chiave segreta per firmare i token di autenticazione (JWT). Ogni utente che effettua il login riceve un token firmato con questa chiave. Se cambi il secret, tutti gli utenti dovranno rifare il login. |

> **Nota:** `PORT` e `DB_PATH` sono gia impostati nel Dockerfile con i valori corretti (`PORT=3002`, `DB_PATH=/data/db.sqlite`). Non serve configurarli in Coolify a meno che tu non voglia sovrascriverli. Anche `NODE_ENV=production` e gia impostato nel Dockerfile.

#### Variabili opzionali — Notifiche email

Queste variabili attivano le notifiche email automatiche. L'applicazione invia un riepilogo periodico delle modifiche (changelog) a tutti gli utenti con ruolo amministratore. Se queste variabili non vengono configurate, l'applicazione funziona normalmente ma le email non vengono inviate.

| Chiave | Valore | Default | Spiegazione |
|--------|--------|---------|-------------|
| `SMTP_HOST` | *(indirizzo del server SMTP)* | — | Il server di posta in uscita. Esempio: `smtp.gmail.com`, `smtp.office365.com`, `in-v3.mailjet.com` |
| `SMTP_PORT` | `587` | `587` | La porta del server SMTP. Usa `587` per STARTTLS (consigliato) o `465` per SSL diretto |
| `SMTP_USER` | *(username SMTP)* | — | Il nome utente per l'autenticazione SMTP. Solitamente e un indirizzo email |
| `SMTP_PASS` | *(password SMTP)* | — | La password per l'autenticazione SMTP. Per Gmail, usa una "App Password", non la password dell'account |
| `SMTP_FROM` | *(indirizzo mittente)* | Uguale a `SMTP_USER` | L'indirizzo email che appare come mittente. Se non specificato, viene usato `SMTP_USER` |
| `CHANGELOG_EMAIL_INTERVAL` | `daily` oppure `weekly` | `daily` | Frequenza di invio del riepilogo changelog. `daily` = ogni 24 ore, `weekly` = ogni 7 giorni |

Per attivare le email, e necessario configurare almeno `SMTP_HOST`, `SMTP_USER` e `SMTP_PASS`. Se anche solo una di queste tre manca, lo scheduler non si avvia e nei log vedrai il messaggio: *"SMTP non configurato, scheduler non avviato"*.

I destinatari delle email di riepilogo sono tutti gli utenti con ruolo **admin** registrati nell'applicazione. Non esiste una variabile d'ambiente per specificare i destinatari: sono determinati automaticamente dal database.

#### Riepilogo completo variabili

| Chiave | Obbligatoria | Default (Dockerfile) |
|--------|:------------:|----------------------|
| `JWT_SECRET` | Si | — |
| `PORT` | No | `3002` |
| `DB_PATH` | No | `/data/db.sqlite` |
| `NODE_ENV` | No | `production` |
| `SMTP_HOST` | No | — |
| `SMTP_PORT` | No | `587` |
| `SMTP_USER` | No | — |
| `SMTP_PASS` | No | — |
| `SMTP_FROM` | No | `SMTP_USER` |
| `CHANGELOG_EMAIL_INTERVAL` | No | `daily` |

### Come generare il JWT_SECRET

Esegui questo comando sul tuo computer o sulla VPS tramite SSH:

```bash
openssl rand -base64 48
```

Il comando generera una stringa casuale simile a questa:

```
a4Bf8kL2mN9pQ3rS5tU7vW1xY3zA6bC8dE0fG2hI4jK6lM8n
```

Copia l'intero output e incollalo come valore della variabile `JWT_SECRET` in Coolify.

> **ATTENZIONE:** non utilizzare mai una stringa semplice o prevedibile come secret. Usa sempre il comando `openssl rand` per generare una stringa casuale. Se qualcuno indovina il tuo secret, puo falsificare i token di autenticazione e accedere all'applicazione come qualsiasi utente.

> **ATTENZIONE:** le istanze di produzione e pre-produzione devono avere `JWT_SECRET` **diversi** tra loro. Un token generato per un'istanza non deve funzionare sull'altra.

---

## Step 5: Storage persistente

Questo e lo step piu critico dell'intera configurazione. Senza uno storage persistente, **perderai tutti i dati** (utenti, progetti, clienti, valutazioni) ogni volta che il container viene ricreato, ad esempio durante un aggiornamento o un redeploy.

### Perche e necessario

L'applicazione utilizza SQLite come database. SQLite salva tutti i dati in un singolo file (`db.sqlite`). Questo file risiede all'interno del container, nella directory `/data/`. Quando Coolify esegue un nuovo deploy, distrugge il vecchio container e ne crea uno nuovo. Senza un volume persistente, la directory `/data/` e il suo contenuto vengono eliminati insieme al vecchio container.

Configurando un volume persistente, diciamo a Coolify di collegare una cartella del server fisico alla directory `/data/` del container. In questo modo, il file del database vive sul server e non dentro il container, e sopravvive a qualsiasi numero di redeploy.

### Procedura

1. Nella pagina della risorsa, vai nella tab **Storages** (oppure **Persistent Storage**)
2. Clicca **+ Add** per aggiungere un nuovo volume
3. Compila i campi come segue:

| Campo | Valore | Spiegazione |
|-------|--------|-------------|
| **Name** | `trust-prod-data` | Nome univoco del volume. Questo nome identifica lo spazio di archiviazione sul server. |
| **Destination Path** | `/data` | La directory all'interno del container dove il volume verra montato. Corrisponde alla directory dove l'applicazione salva il database. |

4. Salva la configurazione

> **ATTENZIONE — RISCHIO PERDITA DATI:** se non configuri questo volume, l'applicazione funzionera normalmente, ma tutti i dati verranno persi al primo redeploy. Non ci sono messaggi di errore che ti avvisano di questo problema. Verifica sempre che il volume sia configurato prima di iniziare a usare l'applicazione in produzione.

> **ATTENZIONE — NOMI VOLUME UNIVOCI:** ogni istanza dell'applicazione (produzione, pre-produzione) DEVE avere un nome di volume diverso. Se due istanze condividono lo stesso volume, entrambe scriveranno sullo stesso file SQLite contemporaneamente, causando corruzione del database. Per la produzione usa `trust-prod-data`, per la pre-produzione usa `trust-preprod-data`.

### Nota sul docker-compose.yml

Il repository contiene un file `docker-compose.yml` con una configurazione di volumi che utilizza la variabile `COMPOSE_PROJECT_NAME`. Questo file e pensato **esclusivamente per lo sviluppo locale** e non viene utilizzato da Coolify. Coolify gestisce i volumi tramite la propria interfaccia (tab Storages), quindi la configurazione che conta e quella che imposti nell'interfaccia di Coolify, non quella del docker-compose.

---

## Step 6: Dominio e porta

In questo step configuriamo il dominio pubblico attraverso cui gli utenti accederanno all'applicazione, e la porta interna del container.

### Procedura

1. Nella pagina della risorsa, vai nella tab **General** (la sezione principale)
2. Cerca il campo **Domains** (oppure **FQDN** — Fully Qualified Domain Name)
3. Inserisci:

```
https://trust.4piemai.it
```

4. Cerca il campo **Port Exposes** (oppure **Exposed Port**)
5. Imposta il valore su `3002`

### Cosa significano questi valori

- **FQDN** (`https://trust.4piemai.it`): e l'indirizzo completo che gli utenti digiteranno nel browser. Il prefisso `https://` indica a Coolify di generare automaticamente un certificato SSL tramite Let's Encrypt.
- **Port Exposes** (`3002`): indica a Coolify su quale porta il container ascolta le richieste. Coolify configurera il reverse proxy Traefik per ricevere il traffico sulla porta 443 (HTTPS) e inoltrarlo alla porta 3002 del container.

> **Nota:** gli utenti accederanno sempre tramite `https://trust.4piemai.it` (porta 443, gestita da Traefik). Non devono mai specificare la porta 3002 nell'URL. La porta 3002 e solo un dettaglio interno di comunicazione tra Traefik e il container.

---

## Step 7: Healthcheck

L'healthcheck e un controllo automatico che Coolify (e Docker) eseguono periodicamente per verificare che l'applicazione sia funzionante. Se l'healthcheck fallisce, Coolify segnala il container come "unhealthy" (non sano).

### Configurazione

Il Dockerfile del progetto include gia una configurazione di healthcheck. Coolify dovrebbe rilevarla automaticamente. Verifica nella tab **Health Check** che i valori corrispondano:

| Campo | Valore |
|-------|--------|
| **Path** | `/health` |
| **Port** | `3002` |
| **Interval** | `30s` |

L'endpoint `/health` e un URL dell'applicazione che risponde con lo stato del server, senza richiedere autenticazione.

Se i valori non sono compilati automaticamente, inseriscili manualmente.

---

## Step 8: Deploy e verifica

Tutto e configurato. E il momento di lanciare il primo deploy.

### Procedura di deploy

1. Torna alla pagina principale della risorsa in Coolify
2. Clicca il pulsante **Deploy** (oppure **Start**)
3. Coolify iniziera il processo di build:
   - Scarica il codice dal repository GitHub
   - Esegue il Dockerfile (installa dipendenze, compila `better-sqlite3`, crea l'immagine)
   - Avvia il container
4. Puoi seguire l'avanzamento nei **Build Logs**
5. Il processo richiede circa 2-3 minuti
6. Al termine, lo stato della risorsa passera a **Running** (verde)

### Verifica dell'healthcheck

Dalla VPS o dal tuo computer, esegui:

```bash
curl https://trust.4piemai.it/health
```

La risposta attesa e un JSON simile a:

```json
{
  "status": "ok",
  "timestamp": "2026-02-19T10:30:00.000Z",
  "uptime": 42.5
}
```

Se ricevi questa risposta, l'applicazione e funzionante.

### Registrazione del primo utente

1. Apri il browser e vai su `https://trust.4piemai.it`
2. Vedrai la pagina di Login/Registrazione
3. Clicca su **Registrati** e crea il primo account
4. Il primo utente registrato diventa automaticamente **amministratore** con tutti i permessi
5. Verrai reindirizzato alla dashboard dell'applicazione

> **Nota:** tutti gli utenti successivi al primo dovranno essere approvati dall'amministratore prima di poter accedere.

---

## Step 9: Popolare con dati demo

Il repository include degli script per popolare il database con dati dimostrativi (clienti e progetti di esempio). Questo e utile per testare l'applicazione senza dover inserire manualmente tutti i dati.

### Prerequisito

Devi aver completato lo Step 8 e aver registrato almeno il primo utente (amministratore).

### Procedura

1. In Coolify, vai nella pagina della risorsa
2. Cerca il pulsante **Terminal** (oppure **Execute Command** o **Console**) che permette di aprire una shell all'interno del container in esecuzione
3. Nella finestra del terminale, esegui i seguenti comandi uno alla volta:

```bash
node scripts/seed-clients-db.js
```

Attendi il completamento, poi esegui:

```bash
node scripts/seed-projects-db.js
```

Questi script:
- `seed-clients-db.js` — inserisce nel database un set di clienti dimostrativi
- `seed-projects-db.js` — inserisce nel database progetti di esempio collegati ai clienti

4. Torna all'applicazione nel browser e aggiorna la pagina. Dovresti vedere i dati dimostrativi nella dashboard.

> **Nota:** puoi eseguire questi script anche tramite SSH sulla VPS, identificando il container con `docker ps | grep trust` e poi usando `docker exec -it <CONTAINER_ID> node scripts/seed-clients-db.js`.

---

## Step 10: Creare l'istanza Pre-Produzione

L'istanza di pre-produzione (preprod) serve per testare nuove funzionalita prima di portarle in produzione. Segue un branch di sviluppo diverso e ha un dominio separato.

### Procedura

Ripeti gli Step 3-9 con le seguenti differenze:

| Parametro | Produzione | Pre-Produzione |
|-----------|-----------|----------------|
| **Branch** | `main` | `refactor_*` (il branch di sviluppo attivo) |
| **FQDN** | `https://trust.4piemai.it` | `https://trust-preprod.4piemai.it` |
| **Nome volume** | `trust-prod-data` | `trust-preprod-data` |
| **JWT_SECRET** | *(valore A)* | *(valore B, diverso da A)* |
| **SMTP_HOST** | *(stesso o diverso)* | *(stesso o diverso)* |
| **SMTP_USER** | *(credenziali SMTP)* | *(credenziali SMTP)* |
| **SMTP_PASS** | *(password SMTP)* | *(password SMTP)* |

### Dettaglio degli step per preprod

**Step 3 (Risorsa):** Crea una nuova risorsa su Coolify. Seleziona lo stesso repository ma imposta il branch su quello di sviluppo attivo (es. `refactor_*`). Seleziona come Environment un valore diverso da Production (es. **Staging** o **Development**).

**Step 4 (Variabili):** Configura le stesse variabili d'ambiente, ma genera un `JWT_SECRET` nuovo e diverso da quello di produzione. Le variabili SMTP possono essere le stesse della produzione (stesse credenziali email) oppure diverse se vuoi usare un mittente diverso per la preprod.

**Step 5 (Storage):** Configura il volume con nome `trust-preprod-data` e destination path `/data`.

> **ATTENZIONE — QUESTO E IL PUNTO PIU IMPORTANTE:** il nome del volume per la pre-produzione DEVE essere diverso da quello della produzione. Se entrambe le istanze utilizzano lo stesso nome di volume, condivideranno lo stesso file SQLite. SQLite non supporta accessi concorrenti da processi diversi e il risultato sara la **corruzione del database** per entrambe le istanze. Usa sempre nomi distinti: `trust-prod-data` per la produzione e `trust-preprod-data` per la pre-produzione.

**Step 6 (Dominio):** Inserisci `https://trust-preprod.4piemai.it` come FQDN. La porta resta `3002`.

**Step 7 (Healthcheck):** Identica configurazione della produzione.

**Step 8 (Deploy):** Lancia il deploy e verifica con `curl https://trust-preprod.4piemai.it/health`.

**Step 9 (Dati demo):** Esegui gli script di seed anche sull'istanza preprod se desideri avere dati dimostrativi per il testing.

---

## Aggiornamenti e Auto-deploy

### Aggiornamento manuale

Quando vengono effettuate modifiche al codice e pushate su GitHub:

1. Vai sulla risorsa in Coolify
2. Clicca **Redeploy** (oppure **Rebuild**)
3. Coolify scarichera il codice aggiornato, costruira una nuova immagine e riavviera il container
4. I dati nel volume persistente non vengono toccati

### Auto-deploy

Puoi configurare Coolify per eseguire automaticamente il deploy ad ogni push sul branch configurato:

1. Nella configurazione della risorsa, cerca la sezione **Webhooks** oppure **Auto Deploy**
2. Abilita l'opzione **Auto Deploy on Push**
3. Da questo momento, ogni volta che viene eseguito un push sul branch configurato (es. `main` per la produzione), Coolify avviera automaticamente un nuovo deploy

> **Nota:** l'auto-deploy e consigliato per la pre-produzione, dove si vuole testare rapidamente le modifiche. Per la produzione, e spesso preferibile il deploy manuale per avere maggiore controllo.

---

## Backup

### Backup del database tramite Docker

Il modo piu diretto per fare il backup del database e copiare il file SQLite dal container alla VPS.

Collegati in SSH alla VPS ed esegui:

```bash
# Identifica il container in esecuzione
docker ps | grep trust

# Copia il file del database (sostituisci <CONTAINER_ID> con l'ID effettivo)
docker cp <CONTAINER_ID>:/data/db.sqlite ./backup-trust-prod-$(date +%Y%m%d).sqlite
```

Per la pre-produzione, cerca il container corrispondente e salva con un nome diverso:

```bash
docker cp <CONTAINER_ID>:/data/db.sqlite ./backup-trust-preprod-$(date +%Y%m%d).sqlite
```

### Backup tramite interfaccia web

Dall'applicazione web, e disponibile un pulsante **Esporta** (icona di download nell'header della pagina). Questa funzione genera un file JSON contenente tutti i progetti e i relativi dati. E un metodo complementare al backup del file SQLite.

> **Consiglio:** pianifica backup regolari del database, almeno settimanali. In caso di problemi, avere un backup recente ti permette di ripristinare i dati rapidamente.

---

## Risoluzione Problemi

### Il build fallisce

| Sintomo | Causa probabile | Soluzione |
|---------|----------------|-----------|
| Errore durante `npm ci` | Il file `package-lock.json` manca dal repository | Verifica che `package-lock.json` sia presente nella root del repository e sia committato |
| Errore di compilazione di `better-sqlite3` | Dipendenze di build mancanti | Il Dockerfile include gia `python3`, `make` e `g++`. Se l'errore persiste, verifica che il Dockerfile non sia stato modificato |
| Timeout durante il build | VPS con risorse insufficienti | Controlla che la VPS abbia almeno 1 GB di RAM libera durante il build |

### Il container risulta "unhealthy"

Il container si avvia ma Coolify lo segna come non sano:

1. Controlla i **Runtime Logs** nella pagina della risorsa su Coolify
2. Verifica che la variabile `JWT_SECRET` sia impostata e abbia almeno 16 caratteri
3. Verifica che la porta esposta sia `3002`
4. Attendi almeno 15 secondi dopo l'avvio: il Dockerfile configura uno `start-period` di 15 secondi per dare tempo all'applicazione di inizializzarsi

### Errori SSL / Certificato HTTPS

| Sintomo | Causa probabile | Soluzione |
|---------|----------------|-----------|
| Errore "certificato non valido" nel browser | Certificato non ancora generato | Attendi fino a 5 minuti. Let's Encrypt ha bisogno di tempo per emettere il certificato |
| Errore persistente dopo 5 minuti | Proxy Cloudflare attivo | Disabilita il proxy Cloudflare (nuvola grigia, DNS only) per il record DNS e riprova |
| Errore "too many redirects" | Conflitto tra SSL Cloudflare e SSL Coolify | Disabilita il proxy Cloudflare oppure configura SSL Cloudflare in modalita "Full (strict)" |

Per debug avanzato, controlla i log di Traefik su Coolify.

### Dati persi dopo un redeploy

Se dopo un redeploy l'applicazione si presenta come se fosse appena installata (nessun utente, nessun progetto):

1. Vai nella tab **Storages** della risorsa su Coolify
2. Verifica che il volume esista e sia configurato con Destination Path `/data`
3. Se il volume non e presente, i dati risiedevano solo nel container e sono andati persi con il vecchio container
4. Se hai un backup, puoi ripristinarlo copiando il file nella directory del volume (vedi sezione Backup)

> **ATTENZIONE:** non esiste modo di recuperare i dati se il volume non era configurato e il vecchio container e stato eliminato. Questo e il motivo per cui lo Step 5 e il piu critico dell'intera configurazione.

### Errore SQLITE_IOERR_SHORT_READ o database corrotto

L'applicazione include un meccanismo di **auto-recovery** per il database SQLite. Se all'avvio viene rilevato un database corrotto (errori `SQLITE_IOERR_SHORT_READ`, `SQLITE_CORRUPT` o `SQLITE_NOTADB`), l'applicazione:

1. Elimina automaticamente il file del database corrotto e i file associati (WAL, journal)
2. Ricrea un database vuoto con lo schema completo
3. Si avvia normalmente

In questo scenario, i dati precedenti vanno persi, ma l'applicazione torna operativa senza intervento manuale.

Se desideri forzare manualmente il ripristino:

1. Accedi al terminale del container tramite Coolify
2. Esegui:

```bash
rm -f /data/db.sqlite /data/db.sqlite-wal /data/db.sqlite-shm
```

3. Riavvia il container (Redeploy dalla pagina della risorsa)
4. L'applicazione creera un database nuovo e vuoto
5. Registra nuovamente il primo utente (diventera amministratore)
6. Se necessario, esegui gli script di seed (Step 9)

### Corruzione da volume condiviso

Se entrambe le istanze (produzione e pre-produzione) presentano errori di database contemporaneamente, verifica che non stiano condividendo lo stesso volume:

1. Vai nella tab **Storages** di entrambe le risorse su Coolify
2. Controlla che i nomi dei volumi siano **diversi**:
   - Produzione: `trust-prod-data`
   - Pre-produzione: `trust-preprod-data`
3. Se hanno lo stesso nome, una delle due istanze sta sovrascrivendo i dati dell'altra
4. Correggi il nome del volume su una delle due istanze e rideploya

> Due istanze che condividono lo stesso file SQLite causeranno errori di tipo `SQLITE_BUSY`, `SQLITE_LOCKED` o corruzione silenziosa dei dati. SQLite non e progettato per essere acceduto da processi separati in container diversi.

### Errore "JWT_SECRET non configurato"

- Vai nelle **Environment Variables** della risorsa su Coolify
- Verifica che la variabile `JWT_SECRET` sia presente e non vuota
- Il valore deve avere almeno 16 caratteri
- Dopo aver aggiunto o modificato la variabile, esegui un nuovo deploy

---

## Riepilogo Configurazione

### Istanza Produzione

| Parametro | Valore |
|-----------|--------|
| **Repository** | `https://github.com/stefanosudati/trust-iso-tracking-system` |
| **Branch** | `main` |
| **Build Pack** | Dockerfile |
| **FQDN** | `https://trust.4piemai.it` |
| **Porta** | `3002` |
| **Nome Volume** | `trust-prod-data` |
| **Volume Destination** | `/data` |
| **JWT_SECRET** | *(generato con `openssl rand -base64 48`)* |
| **SMTP_HOST** | *(opzionale — server SMTP)* |
| **SMTP_USER** | *(opzionale — username SMTP)* |
| **SMTP_PASS** | *(opzionale — password SMTP)* |
| **SMTP_FROM** | *(opzionale — mittente email)* |
| **CHANGELOG_EMAIL_INTERVAL** | *(opzionale — `daily` o `weekly`)* |
| **Healthcheck** | `GET /health` sulla porta `3002` |

### Istanza Pre-Produzione

| Parametro | Valore |
|-----------|--------|
| **Repository** | `https://github.com/stefanosudati/trust-iso-tracking-system` |
| **Branch** | `refactor_*` (branch di sviluppo attivo) |
| **Build Pack** | Dockerfile |
| **FQDN** | `https://trust-preprod.4piemai.it` |
| **Porta** | `3002` |
| **Nome Volume** | `trust-preprod-data` |
| **Volume Destination** | `/data` |
| **JWT_SECRET** | *(generato con `openssl rand -base64 48`, diverso dalla produzione)* |
| **SMTP_HOST** | *(opzionale — server SMTP)* |
| **SMTP_USER** | *(opzionale — username SMTP)* |
| **SMTP_PASS** | *(opzionale — password SMTP)* |
| **SMTP_FROM** | *(opzionale — mittente email)* |
| **CHANGELOG_EMAIL_INTERVAL** | *(opzionale — `daily` o `weekly`)* |
| **Healthcheck** | `GET /health` sulla porta `3002` |

> **Nota:** `PORT`, `DB_PATH` e `NODE_ENV` sono gia impostati nel Dockerfile con i valori corretti. Non serve aggiungerli nelle Environment Variables di Coolify.

### Checklist rapida pre-deploy

| Verifica | Produzione | Pre-Produzione |
|----------|:----------:|:--------------:|
| Record DNS A creato | [ ] | [ ] |
| Risorsa Coolify creata | [ ] | [ ] |
| Branch corretto selezionato | [ ] | [ ] |
| JWT_SECRET configurato | [ ] | [ ] |
| Volume persistente con nome univoco | [ ] | [ ] |
| FQDN configurato con https:// | [ ] | [ ] |
| Porta esposta 3002 | [ ] | [ ] |
| Healthcheck verificato | [ ] | [ ] |
| *(Opzionale)* SMTP configurato per email | [ ] | [ ] |
