/**
 * Markdown Export Module
 * Generates downloadable Markdown guide files.
 */
const GuideExport = {

  _download(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  userGuide() {
    const md = `# Trust ISO Tracking System — Guida Utente

> Versione beta | ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}

---

## Indice

1. [Introduzione](#1-introduzione)
2. [Accesso al sistema](#2-accesso-al-sistema)
3. [Dashboard](#3-dashboard)
4. [Gestione Progetti](#4-gestione-progetti)
5. [Gap Analysis](#5-gap-analysis)
6. [Valutazione Requisiti](#6-valutazione-requisiti)
7. [Gestione Documenti](#7-gestione-documenti)
8. [Timeline e Milestone](#8-timeline-e-milestone)
9. [Report e PDF](#9-report-e-pdf)
10. [Impostazioni](#10-impostazioni)
11. [Ricerca rapida](#11-ricerca-rapida)
12. [Import / Export dati](#12-import--export-dati)

---

## 1. Introduzione

Trust ISO Tracking System è un'applicazione web progettata per supportare consulenti e aziende nella gestione del percorso di certificazione ISO 9001:2015. Il sistema permette di monitorare lo stato di conformità di ogni requisito, gestire la documentazione e generare report professionali.

L'applicazione è accessibile da qualsiasi browser moderno (Chrome, Firefox, Safari, Edge) sia da desktop che da dispositivo mobile.

---

## 2. Accesso al sistema

### Registrazione

Per creare un nuovo account, clicca sulla tab **"Registrati"** nella pagina di login. Inserisci:

- **Nome**: il tuo nome completo
- **Email**: il tuo indirizzo email (sarà il tuo username)
- **Password**: minimo 8 caratteri, almeno 1 maiuscola, 1 numero e 1 simbolo

Dopo la registrazione, il tuo account dovrà essere approvato da un amministratore prima di poter accedere.

> **Nota**: il primo utente che si registra nel sistema diventa automaticamente amministratore con accesso immediato.

### Login

Inserisci email e password nella pagina di accesso. Se il login ha successo, verrai reindirizzato alla Dashboard principale. Usa l'**icona occhio** per visualizzare la password durante la digitazione.

### Cambio password

Puoi cambiare la tua password in qualsiasi momento dalla sezione **Impostazioni**. Se il tuo account è stato creato dall'amministratore con password temporanea, ti verrà chiesto di cambiarla al primo accesso.

---

## 3. Dashboard

La Dashboard mostra una panoramica completa dello stato del progetto attivo:

- **Percentuale di conformità**: requisiti completamente implementati rispetto al totale applicabile
- **Percentuale di progresso**: include anche i requisiti parzialmente implementati (contati al 50%)
- **Numero di criticità**: requisiti marcati come "non implementati"
- **Giorni alla scadenza**: countdown verso la data target di certificazione
- **Grafico progresso per clausola**: barre di avanzamento per ciascuna clausola ISO (4-10)
- **Distribuzione stato requisiti**: riepilogo visuale con conteggi per stato
- **Grafico radar**: rappresentazione grafica della conformità per clausola
- **Requisiti critici**: elenco delle non conformità ad alta priorità
- **Prossime scadenze**: milestone imminenti del progetto

Dalla Dashboard puoi cliccare su qualsiasi clausola per navigare direttamente alla Gap Analysis di quella sezione.

---

## 4. Gestione Progetti

Dalla sezione **"Progetti"** nella sidebar puoi visualizzare tutti i progetti di certificazione e crearne di nuovi.

### Creare un progetto

1. Clicca **"Nuovo Progetto"** nella lista progetti
2. Compila i dati del cliente:
   - Nome cliente (obbligatorio)
   - Settore, codice ATECO, numero dipendenti
   - Sede legale e sedi operative
   - Contatto di riferimento (nome, ruolo, email, telefono)
3. Seleziona la certificazione: **ISO 9001:2015**
4. Imposta la fase corrente:
   - Gap Analysis
   - Implementazione
   - Pre-Audit
   - Audit
   - Certificato
5. Opzionale: imposta data di inizio e data target per la certificazione
6. Opzionale: indica l'ente di certificazione

### Selezionare un progetto

Clicca sulla card di un progetto nella lista per attivarlo. Il progetto attivo viene mostrato nell'header e determina il contenuto della sidebar (clausole ISO) e della Dashboard.

### Dati Progetto

La sezione **"Dati Progetto"** mostra tutti i dettagli del progetto attivo con possibilità di modifica. Include anche la sezione **Change Log Completo** con lo storico di tutte le modifiche ai requisiti, filtrabile per requisito.

---

## 5. Gap Analysis

La Gap Analysis è il cuore del sistema. Nella sidebar trovi l'elenco delle **clausole ISO** (da 4 a 10) con la percentuale di completamento per ciascuna:

| Clausola | Titolo |
|----------|--------|
| 4 | Contesto dell'organizzazione |
| 5 | Leadership |
| 6 | Pianificazione |
| 7 | Supporto |
| 8 | Attività operative |
| 9 | Valutazione delle prestazioni |
| 10 | Miglioramento |

Clicca su una clausola per vedere tutti i requisiti contenuti. Per ciascun requisito viene mostrato:
- Icona colorata dello stato attuale
- Codice identificativo (es. 4.1, 5.2.1)
- Titolo del requisito
- Eventuali note e azioni correttive in anteprima

---

## 6. Valutazione Requisiti

Clicca su un requisito dalla vista clausola per aprire la **scheda di valutazione dettagliata**. In questa scheda puoi gestire:

### Stato del requisito
Seleziona tra:
- **Implementato**: il requisito è pienamente soddisfatto
- **Parzialmente implementato**: conformità parziale
- **Non implementato**: non conforme
- **Non applicabile**: il requisito non si applica (con giustificazione)
- **Non valutato**: da valutare

### Priorità
Imposta **Alta**, **Media** o **Bassa** per definire l'urgenza dell'adeguamento.

### Responsabile
Indica chi è incaricato della conformità per questo requisito.

### Scadenza
Imposta una data entro cui completare l'adeguamento.

### Note
Aggiungi osservazioni, descrizioni della situazione attuale, o commenti.

### Azioni correttive
Aggiungi una checklist di azioni da completare. Ogni azione può essere marcata come completata.

### Evidenze
Aggiungi note sulle evidenze documentali raccolte a supporto della conformità.

### Note audit
Osservazioni specifiche per gli auditor interni o esterni.

### Testo normativo
Il testo completo del requisito ISO 9001:2015 è sempre visibile come riferimento.

### Change Log
Il pulsante **"Change Log"** apre un pannello laterale che mostra lo storico completo delle modifiche per quel requisito, con utente, data e dettaglio di ogni campo modificato.

> **Salvataggio**: clicca **"Salva valutazione"** per salvare le modifiche. Ogni modifica viene tracciata automaticamente nel changelog.

---

## 7. Gestione Documenti

La sezione **Documenti** permette di registrare e tracciare la documentazione del Sistema di Gestione Qualità. Per ogni documento puoi specificare:

- **Codice identificativo** (es. PQ-001, PR-002)
- **Nome del documento**
- **Versione corrente** (es. 1.0, 2.1)
- **Data di emissione**
- **Stato**: Bozza, Approvato, Obsoleto

Puoi aggiungere, modificare ed eliminare documenti. La sezione include anche una **checklist dei documenti obbligatori** richiesti dalla norma ISO 9001:2015.

---

## 8. Timeline e Milestone

La **Timeline** mostra le milestone del progetto in ordine cronologico. All'atto della creazione del progetto vengono generate automaticamente 11 milestone tipiche di un percorso di certificazione:

1. Avvio progetto
2. Completamento Gap Analysis
3. Documentazione SGQ completata
4. Implementazione processi
5. Formazione personale
6. Audit interno
7. Riesame di direzione
8. Azioni correttive pre-audit
9. Audit Stage 1
10. Audit Stage 2
11. Certificazione

Puoi:
- **Aggiungere** nuove milestone con titolo e data
- **Completare** milestone esistenti (checkbox)
- **Eliminare** milestone non più necessarie

---

## 9. Report e PDF

La sezione **Report** offre la generazione di documenti PDF professionali:

| Report | Contenuto |
|--------|-----------|
| **Gap Analysis** | Report completo di tutti i requisiti con stato, note e azioni correttive |
| **Piano di Implementazione** | Azioni correttive pianificate con responsabili, scadenze e priorità |
| **Executive Summary** | Riepilogo per la direzione con percentuali e grafici per clausola |
| **Checklist Documenti** | Stato dei documenti obbligatori ISO 9001 vs documenti registrati |
| **Registro NC** | Elenco dettagliato delle non conformità con descrizioni e azioni |

Ogni PDF include intestazione colorata con il tema attivo, piè di pagina con numerazione e formattazione professionale.

È disponibile anche l'**export completo dei dati** in formato JSON per backup.

---

## 10. Impostazioni

Dalla sezione **Impostazioni** puoi:

### Tema colore
Scegli tra 5 temi disponibili:
- **Default** (blu)
- **Trust Corporate** (teal/borgogna)
- **Ocean** (cyan/navy)
- **Forest** (verde)
- **Slate** (grigio)

Il tema viene salvato nel tuo profilo e applicato automaticamente ad ogni accesso.

### Cambio password
Inserisci la password attuale e scegline una nuova (minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo).

### Guide
Scarica le guide in formato Markdown.

---

## 11. Ricerca Rapida

Il campo di ricerca nell'header permette di trovare rapidamente qualsiasi requisito per:
- **Codice** (es. "4.1", "7.5")
- **Titolo** (es. "competenza", "audit")
- **Testo normativo**

I risultati appaiono in tempo reale sotto il campo di ricerca. Con un click puoi aprire direttamente la scheda del requisito.

---

## 12. Import / Export Dati

Dall'header dell'applicazione puoi:

- **Esportare** tutti i dati in formato JSON come backup (pulsante download)
- **Importare** un backup JSON precedente (pulsante upload)

L'export include tutti i progetti con valutazioni, documenti, milestone e metadati. L'import aggiunge i progetti dal file al database esistente.

---

*Trust ISO Tracking System — Versione beta*
`;

    this._download('Guida-Utente-Trust-ISO.md', md);
    App.showToast('Guida utente scaricata', 'success');
  },

  adminGuide() {
    const md = `# Trust ISO Tracking System — Guida Amministratore

> Versione beta | ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}

---

## Indice

1. [Panoramica ruolo amministratore](#1-panoramica-ruolo-amministratore)
2. [Primo accesso e configurazione](#2-primo-accesso-e-configurazione)
3. [Gestione utenti](#3-gestione-utenti)
4. [Approvazione nuovi utenti](#4-approvazione-nuovi-utenti)
5. [Promozione e retrocessione ruoli](#5-promozione-e-retrocessione-ruoli)
6. [Eliminazione utenti](#6-eliminazione-utenti)
7. [Gestione progetti](#7-gestione-progetti)
8. [Backup e ripristino dati](#8-backup-e-ripristino-dati)
9. [Sicurezza e best practice](#9-sicurezza-e-best-practice)
10. [Deployment e manutenzione](#10-deployment-e-manutenzione)

---

## 1. Panoramica ruolo amministratore

L'amministratore ha accesso completo a tutte le funzionalità del sistema, inclusa la gestione degli utenti. Oltre alle funzioni standard (progetti, gap analysis, report), l'admin può:

- Approvare o rifiutare nuove registrazioni
- Promuovere utenti standard ad amministratori
- Retrocedere amministratori a utenti standard
- Eliminare account utente
- Visualizzare l'elenco completo degli utenti registrati

La voce **"Gestione Utenti"** nella sidebar è visibile solo agli amministratori.

---

## 2. Primo accesso e configurazione

Il **primo utente** che si registra nel sistema diventa automaticamente amministratore con accesso immediato (senza necessità di approvazione). Tutti gli utenti successivi saranno registrati come "utente standard" in stato "In attesa di approvazione".

### Dopo il primo accesso si consiglia di:

1. Cambiare la password dalla sezione **Impostazioni**
2. Creare il primo progetto di certificazione
3. Configurare il tema colore preferito

---

## 3. Gestione utenti

La sezione **"Gestione Utenti"** è accessibile dalla sidebar ed è visibile solo agli amministratori. Mostra una tabella con tutti gli utenti registrati, con le seguenti informazioni per ciascuno:

| Campo | Descrizione |
|-------|-------------|
| **Nome** | Nome completo dell'utente |
| **Email** | Indirizzo email (username) |
| **Ruolo** | Admin o Utente |
| **Stato** | Approvato o In attesa |
| **Data registrazione** | Quando si è registrato |
| **Azioni** | Pulsanti per approva, promuovi/retrocedi, elimina |

---

## 4. Approvazione nuovi utenti

Quando un nuovo utente si registra, il suo account viene creato in stato **"In attesa di approvazione"**. L'utente vedrà un messaggio che lo informa dell'attesa.

### Per approvare un utente:

1. Vai in **"Gestione Utenti"** dalla sidebar
2. Individua l'utente con badge **"In attesa"**
3. Clicca il pulsante verde **"Approva"**

Dopo l'approvazione, l'utente potrà accedere al sistema con le proprie credenziali e visualizzare tutti i progetti.

---

## 5. Promozione e retrocessione ruoli

Un amministratore può promuovere un utente standard ad amministratore o retrocedere un altro amministratore a utente standard.

### Promuovere ad admin

1. Nella tabella utenti, individua l'utente da promuovere
2. Clicca il pulsante viola **"Promuovi Admin"**
3. Conferma l'operazione nella finestra di dialogo

### Retrocedere a utente standard

1. Nella tabella utenti, individua l'amministratore da retrocedere
2. Clicca il pulsante grigio **"Retrocedi"**
3. Conferma l'operazione nella finestra di dialogo

> **Nota**: non è possibile modificare il proprio ruolo. Un admin non può retrocedere sé stesso per motivi di sicurezza.

---

## 6. Eliminazione utenti

Per eliminare un utente:

1. Clicca il pulsante rosso **"Elimina"** nella riga corrispondente
2. Conferma l'operazione

> **Attenzione**: l'eliminazione è irreversibile. Non è possibile eliminare il proprio account né eliminare altri amministratori (devono prima essere retrocessi a utente standard).

---

## 7. Gestione progetti

Tutti i progetti sono visibili e modificabili da tutti gli utenti autenticati. Non esiste separazione dei dati tra utenti: ogni utente approvato può vedere, creare, modificare e eliminare qualsiasi progetto nel sistema.

L'amministratore gestisce i progetti come qualsiasi altro utente.

---

## 8. Backup e ripristino dati

Il sistema utilizza un database SQLite salvato come singolo file sul server.

### Opzioni di backup:

| Metodo | Descrizione |
|--------|-------------|
| **Export JSON** | Usa il pulsante di esportazione nell'header per scaricare i tuoi progetti in formato JSON |
| **Backup database** | Copia il file \`db.sqlite\` dal volume Docker per un backup completo di tutti i dati |
| **Import JSON** | Usa il pulsante di importazione per caricare un backup JSON precedente |

### Backup del database via Docker:

\`\`\`bash
# Dal server host
docker cp <container_id>:/data/db.sqlite ./backup-db.sqlite
\`\`\`

---

## 9. Sicurezza e best practice

- Usa password complesse (almeno 8 caratteri, maiuscola, numero, simbolo)
- Approva solo utenti che conosci e che hanno necessità di accesso
- Limita il numero di amministratori al minimo necessario
- Esegui backup regolari del database
- Mantieni aggiornato il \`JWT_SECRET\` nel file di configurazione
- Utilizza **HTTPS** per l'accesso al sistema in produzione
- Non condividere le credenziali di accesso

---

## 10. Deployment e manutenzione

Il sistema è distribuito come container Docker. La configurazione avviene tramite variabili d'ambiente:

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| \`JWT_SECRET\` | **Obbligatoria.** Chiave segreta per i token di autenticazione | — |
| \`DB_PATH\` | Percorso del file database SQLite | \`/data/db.sqlite\` |
| \`PORT\` | Porta del server | \`3002\` |

### Operazioni comuni:

**Riavviare il servizio:**
\`\`\`bash
docker compose restart
\`\`\`

**Visualizzare i log:**
\`\`\`bash
docker compose logs -f
\`\`\`

**Reset database (ATTENZIONE: cancella tutti i dati!):**
\`\`\`bash
# Dal terminal del container
rm -f /data/db.sqlite /data/db.sqlite-shm /data/db.sqlite-wal
# Poi riavviare il deploy
\`\`\`

Il database viene creato automaticamente al primo avvio se non esiste. Il primo utente che si registra dopo un reset diventerà automaticamente admin.

---

*Trust ISO Tracking System — Versione beta*
`;

    this._download('Guida-Amministratore-Trust-ISO.md', md);
    App.showToast('Guida amministratore scaricata', 'success');
  }
};
