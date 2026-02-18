# Trust ISO Tracking System — Guida Utente

## Indice

1. [Primo Accesso](#1-primo-accesso)
2. [Dashboard](#2-dashboard)
3. [Gestione Progetti](#3-gestione-progetti)
4. [Gap Analysis](#4-gap-analysis)
5. [Gestione Documentale](#5-gestione-documentale)
6. [Timeline e Milestones](#6-timeline-e-milestones)
7. [Report e Export PDF](#7-report-e-export-pdf)
8. [Import/Export Dati](#8-importexport-dati)
9. [Logout e Sicurezza](#9-logout-e-sicurezza)

---

## 1. Primo Accesso

### Registrazione

1. Apri l'applicazione nel browser
2. Clicca sulla tab **Registrati**
3. Inserisci:
   - **Nome completo** — il tuo nome (apparirà nell'intestazione)
   - **Email** — deve essere unica nel sistema
   - **Password** — minimo 6 caratteri
4. Clicca **Crea Account**
5. Verrai automaticamente reindirizzato alla dashboard

### Login

1. Apri l'applicazione
2. Inserisci email e password
3. Clicca **Accedi**

> I dati di accesso vengono mantenuti per 7 giorni. Dopo il logout o la scadenza del token, dovrai effettuare un nuovo login.

---

## 2. Dashboard

La dashboard mostra una panoramica di tutti i tuoi progetti.

### Cosa trovi nella dashboard

- **Card Certificazione** — Mostra la certificazione disponibile (ISO 9001:2015). Clicca per creare un nuovo progetto.
- **Lista Progetti Recenti** — Tabella con tutti i progetti ordinati per data di aggiornamento
- **Statistiche Rapide** — Per ogni progetto: numero requisiti valutati, percentuale conformità, numero documenti

### Azioni rapide

- Clicca su una riga della tabella per aprire il progetto
- Il progetto selezionato diventa il **progetto attivo** visibile nel menu laterale

---

## 3. Gestione Progetti

### Creare un nuovo progetto

1. Dalla dashboard, clicca sulla card **ISO 9001:2015**
2. Si apre il modulo di creazione progetto
3. Compila i campi:
   - **Dati Cliente**: ragione sociale, settore, codice ATECO, n. dipendenti, sede legale, sedi operative
   - **Referente**: nome, ruolo, email, telefono
   - **Certificazione**: date inizio/target, ente certificatore
   - **Note**: annotazioni libere
4. Clicca **Salva Progetto**

### Modificare un progetto

1. Vai su **Progetti** nel menu laterale
2. Clicca sul progetto da modificare
3. Modifica i campi desiderati
4. Clicca **Salva Progetto**

### Eliminare un progetto

1. Vai su **Progetti**
2. Clicca il pulsante menu (tre punti) sulla card del progetto
3. Seleziona **Elimina**
4. Conferma l'eliminazione

> **Attenzione**: l'eliminazione e definitiva e non recuperabile.

---

## 4. Gap Analysis

La Gap Analysis e il cuore del sistema. Permette di valutare ogni requisito ISO clausola per clausola.

### Navigazione

1. Seleziona un progetto attivo (dalla dashboard o dalla lista progetti)
2. Clicca **Gap Analysis** nel menu laterale
3. Vedrai la struttura ad albero delle clausole ISO 9001:2015 (Clausole 4-10)

### Struttura

- **Clausole principali** (4. Contesto, 5. Leadership, ecc.)
  - **Sotto-clausole** (4.1, 4.2, ecc.)
    - **Requisiti** (4.1.a, 4.1.b, ecc.)

### Valutare un requisito

1. Clicca su un requisito nell'albero
2. Si apre il pannello di valutazione con:
   - **Scala 0-5**:
     - 0 = Non affrontato
     - 1 = Iniziale
     - 2 = Parziale
     - 3 = Definito
     - 4 = Gestito
     - 5 = Ottimizzato
   - **Evidenze** — Testo libero per documentare le evidenze trovate
   - **Note** — Osservazioni aggiuntive
3. Seleziona il punteggio e compila i campi
4. Clicca **Salva Valutazione**

### Indicatori visivi

- I requisiti valutati mostrano un badge colorato:
  - **Rosso** (0-1): critico, richiede intervento
  - **Arancione** (2-3): parziale, migliorabile
  - **Verde** (4-5): conforme o ottimizzato
- Le clausole mostrano la percentuale di avanzamento

---

## 5. Gestione Documentale

### Accedere ai documenti

1. Con un progetto attivo, clicca **Documenti** nel menu laterale
2. Vedrai la lista di tutti i documenti associati al progetto

### Aggiungere un documento

1. Clicca **Nuovo Documento**
2. Compila:
   - **Nome** — Nome del documento (es. "Manuale della Qualità")
   - **Codice** — Codice identificativo (es. "MQ-001")
   - **Versione** — Numero versione (es. "1.0")
   - **Data emissione** — Data del documento
   - **Stato** — Seleziona tra: Bozza, In revisione, Approvato, Obsoleto
   - **Requisiti collegati** — Inserisci gli ID dei requisiti separati da virgola (es. "4.4.a, 7.5.a")
3. Clicca **Aggiungi**

### Modificare un documento

1. Clicca sull'icona di modifica (matita) accanto al documento
2. Aggiorna i campi desiderati
3. Clicca **Salva**

### Eliminare un documento

1. Clicca sull'icona del cestino accanto al documento
2. Il documento viene rimosso immediatamente

### Filtri

- Usa la barra di ricerca per cercare per nome o codice
- Filtra per stato (Bozza, In revisione, Approvato, Obsoleto)

---

## 6. Timeline e Milestones

### Visualizzare la timeline

1. Con un progetto attivo, clicca **Timeline** nel menu laterale
2. Vedrai una vista cronologica delle milestones

### Milestones predefinite

Quando crei un progetto, vengono generate automaticamente 11 milestones standard:
1. Kick-off progetto
2. Completamento gap analysis
3. Definizione politica della qualità
4. Documentazione processi core
5. Formazione personale
6. Implementazione sistema
7. Audit interno
8. Riesame della direzione
9. Azioni correttive completate
10. Pre-audit (Stage 1)
11. Audit di certificazione (Stage 2)

### Completare una milestone

- Spunta la checkbox accanto alla milestone per segnarla come completata
- La milestone completata viene visualizzata con una spunta verde

### Aggiungere una milestone personalizzata

1. Clicca **Nuova Milestone**
2. Inserisci titolo e data
3. Clicca **Aggiungi**

---

## 7. Report e Export PDF

### Visualizzare il report

1. Con un progetto attivo, clicca **Report** nel menu laterale
2. Vedrai:
   - Riepilogo generale con percentuali di conformità
   - Grafico a radar per clausola
   - Dettaglio per clausola con punteggi medi
   - Lista requisiti critici (punteggio 0-1)

### Esportare in PDF

1. Dalla pagina Report, clicca **Esporta PDF**
2. Il PDF viene generato e scaricato automaticamente
3. Il report include:
   - Dati del cliente
   - Riepilogo statistico
   - Tabella dettagliata per clausola
   - Lista documenti
   - Timeline e milestones

---

## 8. Import/Export Dati

### Esportare tutti i dati

1. Clicca l'icona **Esporta** nell'intestazione dell'app (icona download)
2. Viene scaricato un file JSON con tutti i tuoi progetti

### Importare dati

1. Clicca l'icona **Importa** nell'intestazione (icona upload)
2. Seleziona un file JSON precedentemente esportato
3. I dati vengono importati e uniti con quelli esistenti

> **Nota**: l'importazione non sovrascrive i progetti esistenti con lo stesso ID, ma li aggiorna.

---

## 9. Logout e Sicurezza

### Logout

1. Clicca l'icona **Logout** nell'intestazione (a destra del tuo nome)
2. Verrai riportato alla schermata di login

### Sicurezza

- Le password sono crittografate con bcrypt (non vengono mai salvate in chiaro)
- L'autenticazione usa token JWT con scadenza a 7 giorni
- Ogni utente vede solo i propri progetti
- La sessione scade automaticamente dopo 7 giorni di inattività

---

## Domande Frequenti

**D: Posso usare il sistema su smartphone?**
R: Si, l'interfaccia e responsive e si adatta a schermi piccoli. Il menu laterale si trasforma in un menu a scomparsa.

**D: I dati sono al sicuro?**
R: I dati sono salvati in un database SQLite sul server. Si consiglia di eseguire backup regolari della cartella `/data`.

**D: Posso gestire altre certificazioni oltre alla ISO 9001?**
R: Al momento e supportata solo la ISO 9001:2015. Altre certificazioni (ISO 14001, ISO 45001, ISO 27001) saranno disponibili nelle prossime versioni.

**D: Come faccio il backup dei dati?**
R: Puoi usare la funzione Export per scaricare un JSON con tutti i dati, oppure fare una copia del file `db.sqlite` dalla cartella data del server.
