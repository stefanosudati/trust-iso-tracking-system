# Trust ISO Tracking System -- Guida Utente Completa

**Versione:** 1.0
**Destinatari:** Consulenti qualita, responsabili SGQ, auditor interni
**Ultimo aggiornamento:** Febbraio 2026

---

## Indice

1. [Introduzione](#1-introduzione)
2. [Primo Accesso](#2-primo-accesso)
3. [Panoramica dell'Interfaccia](#3-panoramica-dellinterfaccia)
4. [Gestione Clienti](#4-gestione-clienti)
5. [Gestione Progetti](#5-gestione-progetti)
6. [Dashboard](#6-dashboard)
7. [Gap Analysis](#7-gap-analysis)
8. [Gestione Documentale](#8-gestione-documentale)
9. [Timeline e Milestones](#9-timeline-e-milestones)
10. [Report e Statistiche](#10-report-e-statistiche)
11. [Impostazioni](#11-impostazioni)
12. [Pannello Amministrazione](#12-pannello-amministrazione)
13. [Sicurezza](#13-sicurezza)
14. [Domande Frequenti](#14-domande-frequenti)

---

## 1. Introduzione

### 1.1 Che cos'e Trust ISO Tracking System

Trust ISO Tracking System e un'applicazione web progettata per supportare consulenti della qualita, responsabili del Sistema di Gestione per la Qualita (SGQ) e auditor interni nella gestione completa dei percorsi di certificazione **ISO 9001:2015**.

L'applicazione consente di:

- Gestire l'anagrafica dei clienti che intraprendono un percorso di certificazione
- Creare e monitorare progetti di certificazione ISO 9001:2015
- Eseguire la Gap Analysis requisito per requisito (clausole 4-10 della norma)
- Tracciare la documentazione obbligatoria del SGQ
- Monitorare le milestone e le scadenze del progetto
- Generare report e statistiche sullo stato di conformita
- Gestire utenti e ruoli tramite un pannello di amministrazione

### 1.2 A chi e destinata questa guida

Questa guida e rivolta a chi utilizza l'applicazione per la prima volta e non ha familiarita con i suoi strumenti. Ogni funzione viene spiegata passo dopo passo, con indicazioni dettagliate su dove cliccare e cosa inserire in ciascun campo.

### 1.3 Breve contesto sulla ISO 9001:2015

La **ISO 9001:2015** e lo standard internazionale per i Sistemi di Gestione per la Qualita (SGQ). Definisce i requisiti che un'organizzazione deve soddisfare per dimostrare la capacita di fornire prodotti e servizi conformi alle esigenze del cliente e ai requisiti normativi applicabili.

La norma e strutturata in clausole numerate da 4 a 10:

| Clausola | Titolo |
|----------|--------|
| 4 | Contesto dell'organizzazione |
| 5 | Leadership |
| 6 | Pianificazione |
| 7 | Supporto |
| 8 | Attivita operative |
| 9 | Valutazione delle prestazioni |
| 10 | Miglioramento |

Ogni clausola contiene sotto-clausole e requisiti specifici. Trust ISO Tracking System contiene **82 requisiti** mappati su queste clausole, pronti per essere valutati in ciascun progetto.

---

## 2. Primo Accesso

### 2.1 Registrazione del primo utente (Amministratore)

Il primo utente che si registra nell'applicazione riceve automaticamente il ruolo di **Amministratore** e viene approvato immediatamente, senza necessita di approvazione da parte di terzi.

1. Apri il browser e raggiungi l'indirizzo dell'applicazione (ad esempio `https://tuodominio.it` o `http://localhost:3002` in ambiente locale).
2. Nella schermata di accesso, vedrai due schede: **Accedi** e **Registrati**. Clicca sulla scheda **Registrati**.
3. Compila i campi richiesti:
   - **Nome completo** -- il tuo nome e cognome (verra visualizzato nell'intestazione dell'app)
   - **Email** -- un indirizzo email valido e unico nel sistema
   - **Password** -- deve rispettare i seguenti criteri di sicurezza:
     - Minimo 8 caratteri
     - Almeno 1 lettera maiuscola
     - Almeno 1 numero
     - Almeno 1 simbolo speciale
4. Clicca il pulsante **Crea Account**.
5. Verrai automaticamente autenticato e reindirizzato alla schermata principale dell'applicazione.

> **Nota importante:** Poiche sei il primo utente registrato, il sistema ti assegna automaticamente il ruolo di Amministratore. Questo ruolo ti consente di approvare o creare altri utenti, gestire i ruoli e accedere al pannello di amministrazione.

### 2.2 Registrazione di utenti successivi

Gli utenti che si registrano dopo il primo devono attendere l'approvazione da parte di un amministratore.

1. Apri l'applicazione nel browser.
2. Clicca sulla scheda **Registrati**.
3. Compila i campi Nome completo, Email e Password (stessi requisiti indicati sopra).
4. Clicca **Crea Account**.
5. Comparira un messaggio che informa che l'account e stato creato con successo ed e **in attesa di approvazione** da parte dell'amministratore.
6. Non potrai accedere all'applicazione fino a quando un amministratore non approvera il tuo account dalla sezione Gestione Utenti (vedi la sezione [Pannello Amministrazione](#12-pannello-amministrazione)).

### 2.3 Login

1. Apri l'applicazione nel browser.
2. Assicurati che sia selezionata la scheda **Accedi**.
3. Inserisci la tua **Email** nel primo campo.
4. Inserisci la tua **Password** nel secondo campo.
   - Puoi cliccare l'icona dell'occhio a destra del campo password per rendere visibile il testo digitato.
5. Clicca il pulsante **Accedi**.

> **Nota:** La sessione di accesso viene mantenuta per **7 giorni**. Dopo il logout o la scadenza del token, sara necessario effettuare un nuovo login.

### 2.4 Cambio password obbligatorio al primo accesso (utenti creati dall'amministratore)

Quando un amministratore crea un nuovo utente tramite il pannello di amministrazione, il sistema genera automaticamente una password temporanea. Al primo accesso, l'utente sara obbligato a cambiarla prima di poter utilizzare l'applicazione.

1. Inserisci l'email e la password temporanea ricevuta dall'amministratore nella schermata di login.
2. Clicca **Accedi**.
3. Comparira automaticamente il modulo **Cambio password obbligatorio**.
4. Inserisci una **Nuova password** che rispetti i criteri di sicurezza (minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo).
5. Nel campo **Conferma password**, ripeti esattamente la stessa password.
6. Clicca **Salva e Accedi**.
7. Se le due password corrispondono e rispettano i criteri, verrai automaticamente portato alla schermata principale dell'applicazione.

> **Attenzione:** Se le due password non corrispondono, comparira un messaggio di errore. Riprova assicurandoti di digitare esattamente la stessa password in entrambi i campi.

### 2.5 Tutorial di benvenuto (Onboarding)

Al primo accesso, l'applicazione mostra automaticamente un **tutorial guidato in 7 passaggi** che introduce le funzionalita principali. Questo tutorial viene mostrato una sola volta.

I 7 passaggi del tutorial sono:

| Passaggio | Titolo | Contenuto |
|-----------|--------|-----------|
| 1 | Benvenuto! | Presentazione generale dell'applicazione |
| 2 | Progetti | Come creare e gestire progetti di certificazione |
| 3 | Requisiti ISO | Come valutare lo stato di conformita dei requisiti |
| 4 | Documenti | Come tracciare la documentazione del SGQ |
| 5 | Timeline | Come monitorare milestone e scadenze |
| 6 | Report | Come generare report di conformita |
| 7 | Tutto pronto! | Invito a iniziare a utilizzare l'applicazione |

**Navigazione nel tutorial:**

- Usa il pulsante **Avanti** per passare al passaggio successivo.
- Usa il pulsante **Indietro** per tornare al passaggio precedente.
- Puoi anche usare i tasti freccia della tastiera: **Freccia Destra** (avanti), **Freccia Sinistra** (indietro), **Invio** (avanti).
- Per chiudere il tutorial in qualsiasi momento, clicca **Salta tutorial** in alto a destra, oppure premi il tasto **Esc**, oppure clicca sullo sfondo scuro esterno alla finestra del tutorial.
- All'ultimo passaggio, il pulsante **Avanti** diventa **Inizia!**: cliccandolo si chiude il tutorial.

> **Nota:** Il tutorial viene mostrato una sola volta. Una volta completato o saltato, non comparira piu ai successivi accessi.

---

## 3. Panoramica dell'Interfaccia

### 3.1 Struttura della pagina

L'interfaccia dell'applicazione e composta da tre aree principali:

1. **Barra laterale (Sidebar)** -- a sinistra, contiene il menu di navigazione
2. **Intestazione (Header)** -- in alto, mostra il nome del progetto attivo e le informazioni dell'utente
3. **Area contenuto principale** -- la parte centrale dove vengono visualizzate le pagine e i moduli

### 3.2 Barra laterale (Sidebar)

La barra laterale e il punto di partenza per navigare tra le diverse sezioni dell'applicazione. Le voci del menu cambiano in base al contesto:

**Voci sempre visibili:**

| Voce | Icona | Descrizione |
|------|-------|-------------|
| Panoramica | Casa | Torna alla vista generale con tutti i progetti. Cliccando qui, il progetto attivo viene deselezionato. |
| Clienti | Edificio | Apre la sezione di gestione anagrafica clienti |
| Progetti | Cartella | Mostra l'elenco di tutti i progetti |
| Impostazioni | Ingranaggio | Personalizzazione tema, cambio password, chiavi API |

**Voci visibili solo quando un progetto e attivo:**

| Voce | Descrizione |
|------|-------------|
| Dashboard Progetto | Statistiche e grafici del progetto selezionato |
| Dati Progetto | Scheda informativa del progetto |
| Clausole 4-10 | Elenco delle clausole ISO con percentuale di avanzamento per ciascuna |
| Documenti | Gestione della documentazione SGQ |
| Timeline | Visualizzazione e gestione delle milestone |
| Report | Report statistici ed esportazione dati |

**Voci visibili solo per gli amministratori:**

| Voce | Descrizione |
|------|-------------|
| Gestione Utenti | Pannello di amministrazione utenti |

Ogni voce relativa alle clausole ISO (4, 5, 6, 7, 8, 9, 10) mostra a destra una **percentuale di avanzamento** con un indicatore colorato:
- **Verde**: 100% completato
- **Ambra/giallo**: parzialmente completato
- **Grigio**: 0% o non ancora iniziato

### 3.3 Intestazione (Header)

L'intestazione in alto mostra:

- Il **logo** dell'applicazione (cliccabile per tornare alla Panoramica)
- Il **nome del progetto attivo** e la sua **fase attuale** (se un progetto e selezionato)
- Il **nome dell'utente** collegato
- Il pulsante di **Logout** per uscire dall'applicazione

### 3.4 Il concetto di "Progetto Attivo"

Un concetto fondamentale dell'applicazione e il **progetto attivo**. Quando selezioni un progetto (cliccandoci sopra dalla lista progetti o dalla Panoramica), questo diventa il progetto attivo:

- Il suo nome appare nell'intestazione
- Nella sidebar compaiono le voci specifiche del progetto (Dashboard, clausole, documenti, timeline, report)
- Tutte le operazioni di Gap Analysis, gestione documenti e timeline si riferiscono a questo progetto

Per **deselezionare** il progetto attivo e tornare alla vista d'insieme, clicca su **Panoramica** nella sidebar oppure clicca sul logo dell'applicazione.

### 3.5 Visualizzazione su dispositivi mobili

L'interfaccia e **responsive** e si adatta automaticamente a schermi di dimensioni ridotte (smartphone e tablet):

- Su schermi con larghezza inferiore a 1024 pixel, la barra laterale si nasconde automaticamente e diventa un menu a scomparsa.
- Per aprire il menu su dispositivi mobili, tocca l'icona del menu (tre linee orizzontali, detto "hamburger") nell'intestazione.
- Dopo aver selezionato una voce del menu, la barra laterale si richiude automaticamente.

---

## 4. Gestione Clienti

La sezione **Clienti** consente di gestire l'anagrafica delle aziende che intraprendono un percorso di certificazione. I clienti sono entita indipendenti che possono essere poi associati a uno o piu progetti.

### 4.1 Accedere alla sezione Clienti

1. Nella barra laterale, clicca sulla voce **Clienti** (icona edificio).
2. Si apre la pagina con l'elenco di tutti i clienti registrati, visualizzati come schede (card).
3. In alto viene mostrato il numero totale di clienti registrati.

### 4.2 Cercare un cliente

Sopra l'elenco delle schede clienti e presente una **barra di ricerca** che consente di filtrare i clienti in tempo reale.

1. Clicca sulla barra di ricerca con il testo "Cerca cliente per nome, settore, ATECO o referente...".
2. Inizia a digitare il termine di ricerca.
3. L'elenco si aggiorna automaticamente mostrando solo i clienti che corrispondono al testo inserito.
4. Il contatore sotto la barra di ricerca indica quanti clienti corrispondono alla ricerca rispetto al totale (ad esempio "3 di 15 clienti").
5. Se nessun cliente corrisponde alla ricerca, viene mostrato il messaggio "Nessun cliente trovato".
6. Per rimuovere il filtro, cancella il testo dalla barra di ricerca.

### 4.3 Creare un nuovo cliente

1. Clicca il pulsante **Nuovo Cliente** in alto a destra.
2. Si apre un modulo di inserimento dati con i seguenti campi:

**Dati aziendali:**

| Campo | Descrizione | Obbligatorio |
|-------|-------------|:------------:|
| Ragione Sociale | Denominazione ufficiale dell'azienda (ad esempio "Acme S.r.l.") | Si |
| Settore | Settore merceologico (ad esempio "Manifatturiero", "Servizi") | No |
| Codice ATECO | Codice di classificazione delle attivita economiche (ad esempio "25.11.00") | No |
| N. Dipendenti | Numero totale di dipendenti dell'azienda | No |
| Sede Legale | Indirizzo della sede legale | No |
| Sedi Operative | Elenco delle sedi operative, separate da virgola | No |

**Referente aziendale:**

| Campo | Descrizione | Obbligatorio |
|-------|-------------|:------------:|
| Nome e Cognome | Nome completo del referente aziendale | No |
| Ruolo | Ruolo del referente (ad esempio "Responsabile Qualita") | No |
| Email | Indirizzo email del referente | No |
| Telefono | Numero di telefono del referente | No |

**Note:**

| Campo | Descrizione | Obbligatorio |
|-------|-------------|:------------:|
| Note | Annotazioni libere sul cliente | No |

3. Compila almeno il campo **Ragione Sociale** (obbligatorio).
4. Compila gli altri campi secondo le informazioni disponibili.
5. Clicca il pulsante **Crea Cliente**.
6. Se l'operazione va a buon fine, comparira un messaggio di conferma "Cliente creato" e la lista si aggiornera automaticamente.

### 4.4 Modificare un cliente esistente

1. Nella lista clienti, individua la scheda del cliente che desideri modificare.
2. Clicca l'icona della **matita** (Modifica) in alto a destra nella scheda del cliente.
3. Il modulo di inserimento si apre con i dati attuali del cliente gia precompilati.
4. Il titolo del modulo diventa "Modifica Cliente" e il pulsante cambia in "Salva Modifiche".
5. Modifica i campi desiderati.
6. Clicca **Salva Modifiche**.
7. Comparira il messaggio di conferma "Cliente aggiornato".

### 4.5 Eliminare un cliente

1. Nella lista clienti, individua la scheda del cliente che desideri eliminare.
2. Clicca l'icona del **cestino** (Elimina) in alto a destra nella scheda del cliente.
3. Comparira una finestra di conferma: "Sei sicuro di voler eliminare questo cliente?"
4. Clicca **OK** per confermare l'eliminazione, oppure **Annulla** per annullare.

> **Attenzione -- Conflitto 409:** Se il cliente ha dei **progetti associati**, l'eliminazione non sara possibile. Comparira il messaggio di errore: "Impossibile eliminare: il cliente ha dei progetti associati". Per eliminare il cliente, e necessario prima eliminare o riassegnare tutti i progetti collegati.

---

## 5. Gestione Progetti

I progetti rappresentano i singoli percorsi di certificazione ISO 9001:2015 per ciascun cliente. Ogni progetto contiene le valutazioni dei requisiti (Gap Analysis), i documenti del SGQ, le milestone e i report.

### 5.1 Visualizzare l'elenco dei progetti

1. Nella barra laterale, clicca sulla voce **Progetti** (icona cartella).
2. Si apre la pagina con tutti i progetti, visualizzati come schede in una griglia.
3. Ogni scheda mostra:
   - Il nome del cliente associato
   - Lo standard di certificazione (ISO 9001:2015)
   - La **fase attuale** del progetto (con un badge colorato)
   - La data target (se impostata)
   - Una **barra di avanzamento** con la percentuale di completamento

### 5.2 Creare un nuovo progetto

1. Dalla pagina Progetti, clicca il pulsante **Nuovo Progetto** in alto a destra (oppure dalla Panoramica, clicca sulla card ISO 9001:2015).
2. Si apre il modulo di creazione progetto, suddiviso in tre sezioni.

**Sezione 1 -- Cliente:**

In alto trovi un menu a tendina **Seleziona Cliente**:

- **Selezionare un cliente esistente:** Clicca sul menu a tendina e seleziona il cliente dalla lista. Comparira un riepilogo dei dati del cliente in una sezione grigia. I campi del cliente non saranno modificabili direttamente (per modificarli, vai alla sezione Clienti).
- **Creare un nuovo cliente inline:** Lascia il menu a tendina su "-- Nuovo cliente --". Compariranno i campi per inserire i dati del nuovo cliente direttamente nel modulo del progetto (ragione sociale, settore, ATECO, dipendenti, sedi, referente). Il cliente verra creato automaticamente al salvataggio del progetto.

> **Nota:** Il campo **Ragione Sociale** e obbligatorio quando si crea un nuovo cliente inline. Se non viene compilato, comparira l'errore "Ragione Sociale e obbligatoria".

**Sezione 2 -- Info Progetto:**

| Campo | Descrizione | Valore predefinito |
|-------|-------------|-------------------|
| Normativa | Standard ISO di riferimento (attualmente solo ISO 9001:2015) | ISO 9001:2015 |
| Fase Attuale | Fase corrente del progetto (vedi tabella fasi sotto) | Gap Analysis |
| Data Inizio Consulenza | Data di avvio del progetto | Data odierna |
| Target Certificazione | Data prevista per il conseguimento della certificazione | Vuoto |
| Ente Certificatore | Nome dell'ente che effettuera l'audit (ad esempio DNV, Bureau Veritas, TUV) | Vuoto |
| Note | Annotazioni libere sul progetto | Vuoto |

**Fasi del progetto:**

| Fase | Etichetta | Descrizione |
|------|-----------|-------------|
| `gap_analysis` | Gap Analysis | Fase iniziale di analisi dei divari rispetto alla norma |
| `implementation` | Implementazione | Fase di sviluppo e implementazione del SGQ |
| `pre_audit` | Pre-Audit | Preparazione all'audit di certificazione |
| `audit` | Audit | L'ente certificatore sta svolgendo l'audit |
| `certified` | Certificato | L'organizzazione ha ottenuto la certificazione |

**Sezione 3 -- Certificazione e Rinnovo:**

| Campo | Descrizione |
|-------|-------------|
| Stato Certificazione | In corso / Certificato / Scaduto / Sospeso |
| Ciclo Audit | Annuale / Semestrale |
| Data Certificazione | Data di rilascio della certificazione (compilare dopo il conseguimento) |
| Scadenza Certificazione | Data di scadenza della certificazione |
| Prossimo Audit di Sorveglianza | Data del prossimo audit di sorveglianza programmato |

3. Compila i campi desiderati.
4. Clicca **Crea Progetto**.
5. Il progetto verra creato, impostato come progetto attivo e verrai reindirizzato alla Dashboard del progetto.

> **Nota:** Alla creazione di un nuovo progetto, il sistema genera automaticamente **11 milestone predefinite** nella timeline (vedi la sezione [Timeline e Milestones](#9-timeline-e-milestones)).

### 5.3 Modificare un progetto

1. Seleziona il progetto cliccandoci sopra dalla lista (diventa il progetto attivo).
2. Nella barra laterale, clicca la voce del progetto con i tre puntini oppure naviga a **Progetti**, clicca sull'icona del menu (tre puntini verticali) sulla card del progetto, e seleziona **Modifica**.
3. Il modulo si apre con i dati del progetto precompilati.
4. Modifica i campi desiderati.
5. Clicca **Salva Modifiche**.
6. Comparira il messaggio "Progetto aggiornato".

### 5.4 Eliminare un progetto

1. Nella pagina Progetti, clicca l'icona del **menu** (tre puntini verticali) sulla card del progetto.
2. Nella finestra che si apre, clicca **Elimina**.
3. Comparira una finestra di conferma: "Eliminare questo progetto?"
4. Clicca **OK** per confermare.

> **Attenzione:** L'eliminazione di un progetto e **definitiva e non recuperabile**. Tutti i dati del progetto (valutazioni, documenti, milestone) verranno cancellati permanentemente.

### 5.5 Aprire un progetto

Esistono diversi modi per selezionare e aprire un progetto:

- Dalla **Panoramica**: clicca su una riga nella lista "Progetti Recenti".
- Dalla pagina **Progetti**: clicca su una card del progetto.
- Dal **menu del progetto** (tre puntini): seleziona "Apri Progetto".

Il progetto selezionato diventa il progetto attivo e verrai portato alla Dashboard del progetto.

---

## 6. Dashboard

L'applicazione dispone di due viste dashboard diverse, a seconda che sia selezionato o meno un progetto attivo.

### 6.1 Panoramica generale (nessun progetto attivo)

Quando nessun progetto e attivo (ad esempio dopo aver cliccato su "Panoramica" nella sidebar), la Dashboard mostra:

1. **Certificazioni Disponibili** -- Una griglia di schede che mostra gli standard ISO supportati. Attualmente e disponibile solo ISO 9001:2015 (con 82 requisiti). Gli altri standard (ISO 14001, ISO 45001, ISO 27001) sono segnalati come "Prossimamente".
2. **Progetti Recenti** -- Un elenco degli ultimi 5 progetti aggiornati, con:
   - Nome del cliente
   - Standard e fase attuale
   - Barra di avanzamento e percentuale di completamento
   - Freccia per aprire il progetto

Per creare un nuovo progetto, puoi cliccare:
- Il pulsante **Nuovo Progetto** sopra la lista dei progetti recenti
- La card **ISO 9001:2015** nella sezione certificazioni

### 6.2 Dashboard del progetto (progetto attivo)

Quando un progetto e attivo, la Dashboard mostra una panoramica completa dello stato del progetto, suddivisa in diverse sezioni:

**Schede statistiche (in alto):**

| Scheda | Contenuto |
|--------|-----------|
| Conformita | Percentuale di requisiti implementati |
| Progresso | Percentuale di avanzamento complessivo |
| Criticita | Numero di requisiti non conformi |
| Scadenza | Giorni mancanti alla data target di certificazione |

**Progresso per Clausola:**

Una serie di barre di avanzamento, una per ciascuna clausola ISO (4-10), che mostrano la percentuale di completamento. Cliccando su una clausola si accede direttamente alla vista della Gap Analysis per quella clausola.

**Distribuzione Stato Requisiti:**

Barre orizzontali che mostrano la distribuzione dei requisiti per stato:
- Implementati (verde)
- Parziali (ambra)
- Non implementati (rosso)
- Non applicabili (grigio)
- Non valutati (grigio chiaro)

**Grafico Radar:**

Sotto la distribuzione degli stati, un **grafico radar** (o grafico a ragnatela) mostra visivamente il livello di conformita per ciascuna clausola. Ogni asse del grafico rappresenta una clausola, e il poligono risultante fornisce un colpo d'occhio immediato sulle aree forti e quelle da migliorare.

**Requisiti Critici Non Conformi:**

Un elenco (massimo 5) dei requisiti con stato "non implementato" e priorita "alta". Cliccando su un requisito si accede direttamente alla sua scheda di valutazione.

**Prossime Scadenze:**

Un elenco (massimo 5) delle prossime milestone non ancora completate, con la data e il numero di giorni mancanti. Le scadenze entro 14 giorni sono evidenziate in ambra.

---

## 7. Gap Analysis

La Gap Analysis e il cuore del sistema. Consente di valutare ogni singolo requisito della norma ISO 9001:2015 e di monitorare lo stato di conformita dell'organizzazione.

### 7.1 Navigazione tra le clausole

1. Assicurati di avere un **progetto attivo** (selezionandolo dalla lista progetti o dalla Panoramica).
2. Nella barra laterale, sotto la sezione **Gap Analysis**, vedrai l'elenco delle clausole ISO (da 4 a 10).
3. Ogni clausola mostra a destra la percentuale di avanzamento.
4. Clicca sulla clausola desiderata per visualizzarne i requisiti.

### 7.2 Struttura delle clausole

La struttura segue la gerarchia della norma ISO 9001:2015:

```
Clausola 4 - Contesto dell'organizzazione
  |-- 4.1 Comprendere l'organizzazione e il suo contesto
  |     |-- 4.1.a (requisito specifico)
  |     |-- 4.1.b (requisito specifico)
  |-- 4.2 Comprendere le esigenze e le aspettative delle parti interessate
  |-- ...
```

Cliccando su una clausola nella sidebar, si apre la vista con tutti i requisiti di quella clausola, ciascuno con il proprio stato di conformita.

### 7.3 Valutare un requisito

1. Nella vista di una clausola, clicca sul requisito che desideri valutare.
2. Si apre la **pagina di dettaglio del requisito**, che mostra:
   - Un **breadcrumb** di navigazione (Dashboard > Clausola X > Requisito X.Y)
   - Il **testo completo** del requisito, evidenziato in un riquadro colorato
   - Il modulo di valutazione, suddiviso in diverse sezioni

**Sezione: Stato di Conformita**

Seleziona lo stato del requisito cliccando su uno dei quattro pulsanti:

| Stato | Etichetta | Colore | Descrizione |
|-------|-----------|--------|-------------|
| `implemented` | Implementato | Verde | Il requisito e pienamente soddisfatto |
| `partial` | Parziale | Ambra | Il requisito e parzialmente soddisfatto |
| `not_implemented` | Non Impl. | Rosso | Il requisito non e soddisfatto |
| `not_applicable` | N/A | Grigio | Il requisito non e applicabile all'organizzazione |

> **Nota:** Se non si seleziona alcuno stato, il requisito resta nello stato `not_evaluated` (non valutato).

Se selezioni **N/A** (Non Applicabile), comparira un campo aggiuntivo:
- **Motivazione Non Applicabilita** -- Campo di testo dove e necessario specificare perche il requisito non e applicabile all'organizzazione.

**Sezione: Note e Osservazioni**

Un campo di testo libero dove puoi inserire:
- Note interpretative sul requisito
- Osservazioni sullo stato attuale della conformita
- Considerazioni per il miglioramento

**Sezione: Evidenze Richieste**

Questa sezione mostra:
- **Documenti Obbligatori** (se previsti per il requisito): un elenco di documenti che la norma richiede esplicitamente
- **Checklist di evidenze**: un elenco di evidenze attese con caselle di spunta. Spunta le evidenze che sono state effettivamente riscontrate presso l'organizzazione.

**Sezione: Azioni Correttive**

Consente di definire le azioni correttive o di miglioramento necessarie:

1. Clicca **Aggiungi azione** per inserire una nuova azione.
2. Scrivi la descrizione dell'azione nel campo di testo.
3. Quando l'azione e stata completata, spunta la casella di spunta a sinistra.
4. Per rimuovere un'azione, clicca l'icona **X** a destra dell'azione.
5. Puoi aggiungere quante azioni desideri.

**Sezione: Assegnazione**

| Campo | Descrizione | Valori possibili |
|-------|-------------|-----------------|
| Priorita | Livello di priorita dell'intervento | Alta / Media / Bassa |
| Responsabile | Nome della persona responsabile dell'attuazione | Testo libero |
| Scadenza | Data entro la quale l'intervento deve essere completato | Data |

**Sezione: Note Audit**

Un campo di testo dedicato alle osservazioni dell'ispettore o dell'auditor, da compilare durante o dopo un audit (interno o di certificazione).

3. Dopo aver compilato tutti i campi desiderati, clicca **Salva Valutazione**.
4. Comparira il messaggio "Valutazione salvata" e la pagina si aggiornera.

### 7.4 Navigazione tra i requisiti

Nella parte inferiore della pagina di valutazione, sono presenti pulsanti per navigare al requisito **precedente** e al requisito **successivo**, senza dover tornare alla vista della clausola.

### 7.5 Change Log (Cronologia delle modifiche)

Ogni modifica a una valutazione viene tracciata automaticamente dal sistema.

1. Nella pagina di dettaglio di un requisito, clicca il pulsante **Change Log** in alto a destra.
2. Si apre un pannello laterale scorrevole a destra che mostra la cronologia completa delle modifiche.
3. Per ogni modifica vengono registrati:
   - Il campo modificato (stato, note, priorita, responsabile, scadenza, note audit, motivazione N/A)
   - Il valore precedente e il valore nuovo
   - L'autore della modifica
   - La data e l'ora della modifica
4. Per chiudere il pannello, clicca la **X** in alto a destra del pannello, oppure clicca sullo sfondo scuro.

> **Nota:** Il changelog e uno strumento fondamentale per la tracciabilita delle decisioni e per le revisioni dell'auditor.

---

## 8. Gestione Documentale

La sezione Documenti consente di tracciare tutta la documentazione del Sistema di Gestione per la Qualita (SGQ) richiesta per la certificazione ISO 9001:2015.

### 8.1 Accedere ai documenti

1. Assicurati di avere un progetto attivo.
2. Nella barra laterale, clicca su **Documenti** (icona documento).
3. Si apre la pagina di gestione documenti, che mostra:
   - Il numero totale di documenti registrati
   - Una **checklist dei documenti obbligatori** ISO 9001:2015 (con indicazione di quelli gia presenti)
   - Una **tabella** con l'elenco di tutti i documenti registrati

### 8.2 Checklist dei documenti obbligatori

In alto nella pagina, una sezione mostra l'elenco dei documenti obbligatori richiesti dalla norma ISO 9001:2015. Per ciascun documento obbligatorio:
- Se un documento con nome corrispondente e stato registrato, viene mostrato con sfondo **verde** e una spunta
- Se il documento manca, viene mostrato con sfondo **rosso** e un punto esclamativo
- A destra viene indicato il riferimento al requisito ISO correlato

### 8.3 Aggiungere un nuovo documento

1. Clicca il pulsante **Nuovo Documento** in alto a destra.
2. Si apre una finestra modale con il modulo di inserimento:

| Campo | Descrizione | Obbligatorio |
|-------|-------------|:------------:|
| Nome Documento | Nome completo del documento (ad esempio "Manuale della Qualita") | Si |
| Codice | Codice identificativo del documento (ad esempio "PQ-001", "MQ-001") | No |
| Versione | Numero di revisione del documento (ad esempio "1.0", "2.1") | No (default: 1.0) |
| Data Emissione | Data di emissione o ultima revisione | No (default: data odierna) |
| Stato | Stato attuale del documento | No (default: Bozza) |
| Requisiti Collegati | ID dei requisiti ISO collegati al documento, separati da virgola (ad esempio "4.3, 5.2, 7.5") | No |

**Stati del documento:**

| Stato | Descrizione |
|-------|-------------|
| Bozza (`draft`) | Il documento e in fase di redazione o revisione |
| Approvato (`approved`) | Il documento e stato approvato e ufficializzato |
| Obsoleto (`obsolete`) | Il documento non e piu in vigore |

3. Compila almeno il campo **Nome Documento**.
4. Clicca **Aggiungi**.
5. Il documento viene aggiunto alla tabella e alla checklist dei documenti obbligatori (se il nome corrisponde).

### 8.4 Modificare un documento

1. Nella tabella dei documenti, individua il documento da modificare.
2. Clicca l'icona della **matita** (Modifica) nella colonna di destra.
3. Si apre la finestra modale con i dati del documento precompilati.
4. Modifica i campi desiderati.
5. Clicca **Salva**.

### 8.5 Eliminare un documento

1. Nella tabella dei documenti, individua il documento da eliminare.
2. Clicca l'icona del **cestino** (Elimina) nella colonna di destra.
3. Comparira una finestra di conferma: "Eliminare questo documento?"
4. Clicca **OK** per confermare.

> **Attenzione:** L'eliminazione di un documento e immediata e non recuperabile.

---

## 9. Timeline e Milestones

La sezione Timeline consente di visualizzare e gestire le milestone (tappe fondamentali) del percorso di certificazione.

### 9.1 Accedere alla Timeline

1. Assicurati di avere un progetto attivo.
2. Nella barra laterale, clicca su **Timeline** (icona calendario).
3. Si apre la pagina con la visualizzazione cronologica delle milestone.

### 9.2 Le 11 milestone predefinite

Alla creazione di ogni nuovo progetto, il sistema genera automaticamente le seguenti 11 milestone:

| N. | Milestone | Tipo |
|----|-----------|------|
| 1 | Avvio progetto | Inizio |
| 2 | Completamento Gap Analysis | Gap Analysis |
| 3 | Documentazione SGQ completata | Documentazione |
| 4 | Implementazione processi | Implementazione |
| 5 | Formazione personale | Formazione |
| 6 | Audit interno | Audit interno |
| 7 | Riesame di direzione | Riesame direzione |
| 8 | Azioni correttive pre-audit | Azioni correttive |
| 9 | Audit Stage 1 | Stage 1 |
| 10 | Audit Stage 2 | Stage 2 |
| 11 | Certificazione | Certificazione |

Le date delle milestone vengono distribuite automaticamente tra la data di inizio e la data target del progetto.

### 9.3 Visualizzazione grafica

La pagina Timeline mostra:

- Una **barra di avanzamento** orizzontale che rappresenta l'intero arco temporale del progetto
- Un **indicatore rosso** "Oggi" che mostra la posizione attuale rispetto alla timeline
- L'elenco verticale delle milestone, ciascuna con:
  - La **data** a sinistra
  - Un **indicatore circolare** colorato (verde se completata, ambra se scaduta, bianco se futura)
  - Il **titolo** della milestone
  - Una **casella di spunta** a destra per segnare la milestone come completata
  - Il numero di **giorni mancanti** (o "Scaduto" se la data e passata)

### 9.4 Segnare una milestone come completata

1. Individua la milestone nella timeline.
2. Spunta la **casella di spunta** a destra della milestone.
3. La milestone viene immediatamente segnata come completata:
   - L'indicatore circolare diventa verde
   - Il titolo viene barrato
   - La scritta "Fatto" sostituisce il conteggio dei giorni

Per annullare il completamento, deseleziona la casella di spunta.

### 9.5 Aggiungere una milestone personalizzata

1. Clicca il pulsante **Aggiungi Milestone** in alto a destra.
2. Si apre una finestra modale con due campi:
   - **Titolo** (obbligatorio) -- Descrizione della milestone
   - **Data** (obbligatoria) -- Data prevista
3. Clicca **Aggiungi**.
4. La nuova milestone viene inserita nella timeline nella posizione cronologica corretta.

---

## 10. Report e Statistiche

La sezione Report fornisce un riepilogo statistico dello stato del progetto e consente l'esportazione dei dati.

### 10.1 Accedere ai Report

1. Assicurati di avere un progetto attivo.
2. Nella barra laterale, clicca su **Report** (icona grafico).
3. Si apre la pagina dei report.

### 10.2 Riepilogo veloce

La pagina mostra un **riepilogo veloce** con i conteggi dei requisiti suddivisi per stato:

| Indicatore | Colore | Significato |
|------------|--------|-------------|
| Conformi | Verde | Requisiti implementati |
| Parziali | Ambra | Requisiti parzialmente implementati |
| Non conformi | Rosso | Requisiti non implementati |
| N/A | Grigio | Requisiti non applicabili |
| Da valutare | Grigio chiaro | Requisiti non ancora valutati |

### 10.3 Esportazione dati

Dalla pagina Report e disponibile il pulsante **Backup JSON**:

1. Clicca sulla card **Backup JSON**.
2. Viene generato e scaricato automaticamente un file in formato JSON contenente tutti i dati del progetto.
3. Questo file puo essere utilizzato come backup o per importazioni future.

> **Nota:** Dalla sezione Impostazioni e anche possibile scaricare le guide utente in formato Markdown.

---

## 11. Impostazioni

La sezione Impostazioni consente di personalizzare l'aspetto dell'applicazione, cambiare la password e gestire le chiavi API.

### 11.1 Accedere alle Impostazioni

1. Nella barra laterale, clicca su **Impostazioni** (icona ingranaggio).
2. Si apre la pagina delle impostazioni, suddivisa in diverse sezioni.

### 11.2 Tema Colore

L'applicazione offre **5 temi grafici** tra cui scegliere. Ogni tema modifica i colori dell'interfaccia (barra laterale, pulsanti, grafici, badge).

| Tema | Descrizione |
|------|-------------|
| **Default (Blue)** | Tema predefinito con colori blu su sfondo bianco. Sidebar bianca. |
| **Trust Corporate** | Tema aziendale con sidebar rossa (colore Trust) e toni teal/petrolio per gli elementi principali. |
| **Ocean** | Tema con tonalita oceaniche (ciano/azzurro). Sidebar blu scuro. |
| **Forest** | Tema con tonalita forestali (verde). Sidebar verde scuro. |
| **Slate** | Tema sobrio con tonalita grigie (ardesia). Sidebar grigio scuro. |

Per cambiare tema:

1. Nella sezione **Tema Colore**, vedrai un'anteprima grafica di ciascun tema.
2. Il tema attualmente attivo e evidenziato con un bordo colorato e un badge "Attivo".
3. Clicca sulla card del tema desiderato.
4. Il tema viene applicato immediatamente e salvato sia localmente che sul server.
5. Al prossimo accesso, il tema selezionato verra ripristinato automaticamente.

### 11.3 Cambio Password

Per cambiare la password del proprio account:

1. Nella sezione **Cambia Password**, compila i tre campi:
   - **Password attuale** -- inserisci la password con cui accedi attualmente
   - **Nuova password** -- inserisci la nuova password (deve rispettare i criteri: minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo)
   - **Conferma nuova password** -- ripeti la nuova password
2. Clicca **Aggiorna Password**.
3. Se i dati sono corretti, comparira il messaggio "Password aggiornata con successo".
4. Se le password non corrispondono o la password attuale e errata, comparira un messaggio di errore.

### 11.4 Chiavi API

Le chiavi API consentono l'accesso programmatico all'applicazione (ad esempio per integrazioni con sistemi esterni, automazioni CI/CD, o script).

**Generare una nuova chiave:**

1. Nella sezione **Chiavi API**, clicca il pulsante **Genera nuova chiave**.
2. Si apre il modulo di creazione con i seguenti campi:
   - **Nome chiave** (obbligatorio) -- Un nome descrittivo per identificare la chiave (ad esempio "Integrazione CI/CD")
   - **Scadenza (giorni)** (opzionale) -- Numero di giorni dopo i quali la chiave scade automaticamente. Lasciare vuoto per una chiave senza scadenza.
3. Clicca **Genera**.
4. La chiave viene generata e mostrata in un riquadro giallo con il messaggio "Chiave generata - copiala ora!"

> **Attenzione:** La chiave completa viene mostrata **una sola volta**. Dopo aver chiuso il riquadro, non sara piu possibile visualizzarla. Copiala immediatamente cliccando il pulsante **Copia** e conservala in un luogo sicuro.

**Visualizzare le chiavi esistenti:**

L'elenco delle chiavi mostra per ciascuna:
- Il **nome** della chiave
- Lo **stato**: Attiva (verde), Disattivata (rosso), Scaduta (ambra)
- Il **prefisso** della chiave (i primi caratteri, per identificarla)
- La **data di creazione**, la **data di scadenza** e la **data dell'ultimo utilizzo**

**Attivare o disattivare una chiave:**

1. Nell'elenco delle chiavi, clicca l'icona dell'**interruttore** (toggle) a destra della chiave.
2. La chiave passa dallo stato Attiva a Disattivata o viceversa.
3. Una chiave disattivata non puo essere utilizzata per l'autenticazione.

**Eliminare una chiave:**

1. Clicca l'icona del **cestino** a destra della chiave.
2. Comparira una finestra di conferma.
3. Clicca **OK** per confermare. L'eliminazione e irreversibile.

### 11.5 Guide e Documentazione

In fondo alla pagina Impostazioni, la sezione **Guide e Documentazione** offre pulsanti per scaricare le guide in formato Markdown:

- **Guida Utente** -- Disponibile per tutti gli utenti
- **Guida Amministratore** -- Disponibile solo per gli utenti con ruolo Amministratore

---

## 12. Pannello Amministrazione

Il pannello di amministrazione e accessibile solo agli utenti con ruolo **Amministratore**.

### 12.1 Accedere al pannello

1. Nella barra laterale, clicca su **Gestione Utenti** (icona utenti).
2. Si apre la pagina con l'elenco di tutti gli utenti registrati nel sistema.

> **Nota:** Questa voce di menu e visibile solo se il tuo account ha il ruolo di Amministratore.

### 12.2 Elenco utenti

La tabella degli utenti mostra le seguenti colonne:

| Colonna | Descrizione |
|---------|-------------|
| Nome | Nome completo dell'utente |
| Email | Indirizzo email dell'utente |
| Ruolo | Admin o Utente |
| Stato | Approvato (verde) o In attesa (ambra) |
| Registrazione | Data di registrazione |
| Azioni | Pulsanti per le azioni disponibili |

### 12.3 Creare un nuovo utente

L'amministratore puo creare utenti direttamente, senza che questi debbano registrarsi autonomamente.

1. Clicca il pulsante **Nuovo Utente** in alto a destra.
2. Si apre il modulo di creazione con due campi:
   - **Nome completo** -- Nome e cognome dell'utente
   - **Email** -- Indirizzo email dell'utente
3. Clicca **Crea Utente**.
4. Il sistema genera automaticamente una **password temporanea** e la mostra in un riquadro verde.
5. Il riquadro contiene:
   - L'email dell'utente appena creato
   - La password generata automaticamente

> **Attenzione:** La password generata viene mostrata **una sola volta**. Comunicala all'utente tramite un canale sicuro. L'utente dovra cambiarla obbligatoriamente al primo accesso.

6. L'utente creato dall'amministratore viene automaticamente approvato e puo accedere immediatamente.
7. Clicca **Chiudi** per nascondere il riquadro delle credenziali. La lista utenti si aggiornera automaticamente.

### 12.4 Approvare un utente in attesa

Quando un utente si registra autonomamente (dopo il primo utente), il suo account rimane nello stato "In attesa" fino all'approvazione.

1. Nella tabella utenti, individua l'utente con stato **In attesa** (badge ambra).
2. Nella colonna Azioni, clicca il pulsante **Approva** (verde con icona di spunta).
3. Lo stato dell'utente cambia immediatamente a "Approvato" e l'utente potra accedere all'applicazione.

### 12.5 Cambiare il ruolo di un utente

**Promuovere un utente a Amministratore:**

1. Nella tabella utenti, individua l'utente con ruolo "Utente".
2. Clicca il pulsante **Promuovi Admin** (viola con icona scudo).
3. Comparira una finestra di conferma: "Promuovere questo utente ad amministratore?"
4. Clicca **OK** per confermare.

**Retrocedere un Amministratore a Utente standard:**

1. Nella tabella utenti, individua l'utente con ruolo "Admin".
2. Clicca il pulsante **Retrocedi** (grigio con icona scudo barrato).
3. Comparira una finestra di conferma: "Retrocedere questo utente a utente standard?"
4. Clicca **OK** per confermare.

> **Nota:** Non e possibile retrocedere o eliminare il proprio account. I pulsanti di azione non sono mostrati per l'utente attualmente connesso.

### 12.6 Eliminare un utente

1. Nella tabella utenti, individua l'utente da eliminare.
2. Clicca il pulsante **Elimina** (rosso con icona cestino).
3. Comparira una finestra di conferma: "Sei sicuro di voler eliminare questo utente?"
4. Clicca **OK** per confermare.

> **Attenzione:** L'eliminazione di un utente e irreversibile. Non e possibile eliminare utenti con ruolo Amministratore (e necessario prima retrocederli a utente standard). Non e possibile eliminare il proprio account.

### 12.7 Invio riepilogo changelog via email

Se il server e configurato con un servizio SMTP per l'invio di email, l'amministratore puo inviare un riepilogo delle modifiche recenti (changelog) via email.

1. Clicca il pulsante **Invia riepilogo changelog** (ambra con icona busta) in alto a destra.
2. Il sistema compila e invia un'email con il riepilogo delle modifiche recenti all'indirizzo email configurato come `ADMIN_EMAIL`.
3. Comparira un messaggio di conferma o di errore a seconda dell'esito dell'invio.

> **Nota:** Questa funzione richiede la configurazione delle variabili d'ambiente SMTP sul server (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL). Se non configurata, l'invio fallira silenziosamente.

---

## 13. Sicurezza

L'applicazione implementa diverse misure di sicurezza per proteggere i dati e gli accessi.

### 13.1 Autenticazione con token JWT

L'applicazione utilizza **JSON Web Token (JWT)** per l'autenticazione. Dopo il login, il server rilascia un token che viene memorizzato nel browser e utilizzato per autenticare ogni richiesta successiva.

- Il token ha una **validita di 7 giorni**.
- Alla scadenza del token, l'utente viene automaticamente disconnesso e deve effettuare un nuovo login.
- Il token viene inviato automaticamente nell'intestazione di ogni richiesta al server.

### 13.2 Hashing delle password

Le password degli utenti non vengono mai salvate in chiaro nel database. Vengono crittografate utilizzando l'algoritmo **bcrypt**, uno standard industriale per l'hashing sicuro delle password.

Questo significa che:
- Anche in caso di accesso non autorizzato al database, le password non sono leggibili.
- Non e possibile recuperare una password dimenticata; e necessario reimpostarla.

### 13.3 Scadenza della sessione

- La sessione di accesso ha una durata massima di **7 giorni**.
- Dopo 7 giorni dall'ultimo login, il token scade e l'utente viene reindirizzato alla schermata di accesso.
- In caso di disconnessione volontaria (Logout), il token viene rimosso immediatamente.

### 13.4 Autenticazione via API Key

In alternativa al token JWT, e possibile autenticarsi utilizzando una **chiave API** (vedi la sezione [Chiavi API](#114-chiavi-api)).

Le chiavi API:
- Vengono memorizzate nel database come hash **SHA-256** (non in chiaro)
- Possono essere inviate tramite l'intestazione HTTP `X-API-Key` oppure come token Bearer con prefisso `tiso_`
- Supportano una data di scadenza opzionale
- Possono essere attivate o disattivate senza eliminarle

### 13.5 Separazione dei dati

Ogni utente vede e gestisce solo i propri progetti e clienti. Gli utenti con ruolo Amministratore hanno visibilita su tutti i clienti del sistema.

### 13.6 HTTPS e protezione del trasporto

In ambiente di produzione (ad esempio con deploy Docker dietro un reverse proxy come Traefik), l'applicazione supporta il protocollo **HTTPS/TLS** per cifrare tutte le comunicazioni tra il browser dell'utente e il server.

> **Raccomandazione:** Si consiglia fortemente di utilizzare sempre HTTPS in ambiente di produzione per proteggere le credenziali e i dati trasmessi.

---

## 14. Domande Frequenti

**D: Posso usare il sistema su smartphone o tablet?**

R: Si, l'interfaccia e completamente responsive e si adatta a schermi di qualsiasi dimensione. Su dispositivi mobili, la barra laterale si trasforma in un menu a scomparsa accessibile tramite l'icona hamburger nell'intestazione.

---

**D: I miei dati sono al sicuro?**

R: I dati sono salvati in un database SQLite sul server. Le password sono crittografate con bcrypt e le comunicazioni possono essere protette tramite HTTPS. Si consiglia di eseguire backup regolari del file del database (`/data/db.sqlite`) o di utilizzare la funzione di esportazione JSON.

---

**D: Posso gestire altre certificazioni oltre alla ISO 9001?**

R: Al momento e supportata esclusivamente la **ISO 9001:2015**. Altre certificazioni (ISO 14001 -- Ambiente, ISO 45001 -- Sicurezza sul lavoro, ISO 27001 -- Sicurezza delle informazioni) sono previste per le prossime versioni e sono gia visibili nell'interfaccia come "Prossimamente".

---

**D: Come faccio il backup dei dati?**

R: Esistono due modalita:
1. **Esportazione JSON**: Dalla sezione Report, clicca su "Backup JSON" per scaricare un file con tutti i dati del progetto.
2. **Copia del database**: Copia il file `db.sqlite` dalla cartella `/data` sul server. Questo file contiene tutti i dati dell'applicazione.

---

**D: Ho dimenticato la password. Come posso recuperarla?**

R: L'applicazione non dispone attualmente di una funzione di recupero password automatica. Rivolgiti all'amministratore del sistema, che potra creare un nuovo utente con le stesse credenziali email oppure intervenire direttamente sul database.

---

**D: Perche non riesco ad accedere dopo la registrazione?**

R: Se non sei il primo utente registrato, il tuo account deve essere **approvato da un amministratore** prima di poter accedere. Contatta l'amministratore del sistema e chiedi che approvi il tuo account dalla sezione Gestione Utenti.

---

**D: Cosa succede se elimino un progetto?**

R: L'eliminazione di un progetto e **definitiva e irreversibile**. Tutti i dati associati (valutazioni dei requisiti, documenti, milestone, changelog) verranno cancellati permanentemente. Si consiglia di esportare i dati prima di procedere con l'eliminazione.

---

**D: Posso eliminare un cliente che ha dei progetti associati?**

R: No. Se un cliente ha uno o piu progetti associati, non e possibile eliminarlo. Il sistema restituira l'errore "Impossibile eliminare: il cliente ha dei progetti associati". E necessario prima eliminare o riassegnare tutti i progetti collegati al cliente.

---

**D: Come funziona il sistema di ruoli?**

R: L'applicazione prevede due ruoli:
- **Admin (Amministratore)**: Puo gestire tutti gli utenti (creare, approvare, promuovere, retrocedere, eliminare), visualizzare tutti i clienti e inviare email di riepilogo changelog.
- **User (Utente)**: Puo gestire i propri progetti e clienti, eseguire Gap Analysis, gestire documenti e milestone.

Il primo utente registrato ottiene automaticamente il ruolo Admin.

---

**D: Le chiavi API sono sicure?**

R: Si. Le chiavi API vengono memorizzate nel database come hash SHA-256, quindi non sono mai salvate in chiaro. La chiave completa viene mostrata una sola volta al momento della generazione. Le chiavi possono avere una data di scadenza e possono essere disattivate in qualsiasi momento.

---

**D: Posso cambiare il tema dell'interfaccia?**

R: Si. Dalla sezione Impostazioni puoi scegliere tra 5 temi grafici (Default Blue, Trust Corporate, Ocean, Forest, Slate). Il tema selezionato viene salvato e ripristinato automaticamente ai successivi accessi.

---

**D: Quanti requisiti ISO vengono tracciati?**

R: L'applicazione traccia **82 requisiti** della norma ISO 9001:2015, distribuiti sulle clausole da 4 a 10. Ogni requisito puo essere valutato individualmente con stato, note, priorita, azioni correttive ed evidenze.

---

**D: E possibile aggiungere milestone personalizzate?**

R: Si. Oltre alle 11 milestone predefinite che vengono create automaticamente con ogni nuovo progetto, e possibile aggiungere milestone personalizzate tramite il pulsante "Aggiungi Milestone" nella sezione Timeline.

---

**D: Come posso esportare il report del progetto?**

R: Dalla sezione Report puoi esportare i dati in formato JSON tramite il pulsante "Backup JSON". Dalla sezione Impostazioni puoi inoltre scaricare le guide in formato Markdown.

---

*Trust ISO Tracking System -- Guida Utente*
*Per assistenza tecnica, contattare l'amministratore del sistema.*
