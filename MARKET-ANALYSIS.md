# Analisi di mercato — Trust ISO Tracking System

---

## 1. Panoramica competitor e prezzi di mercato

### Fascia alta (Enterprise) — €100-200+/utente/mese
| Prodotto | Prezzo | Target |
|----------|--------|--------|
| **Qualio** | ~€199/utente/mese + setup €8k-20k | Life sciences, FDA, ISO 13485 |
| **MasterControl** | Quote-based, ~€150-300/utente/mese | Pharma, medical devices |
| **ComplianceQuest** | Quote-based, enterprise | Grandi aziende, multi-standard |

### Fascia media (SMB) — €30-100/utente/mese
| Prodotto | Prezzo | Target |
|----------|--------|--------|
| **isoTracker** | ~€13-15/utente/mese (moduli singoli), €268-1.107/mese per 20 utenti | PMI, modulare |
| **Effivity** | ~€1/utente/giorno (~€30/utente/mese) | PMI globali, multi-standard |
| **QT9 QMS** | ~€50-120/utente/mese (stimato) | Manifattura, multi-modulo |
| **ISOvA** | £65-240/mese (5 utenti inclusi) | UK, SharePoint-based |

### Fascia bassa (budget/one-time) — <€30/utente/mese o acquisto unico
| Prodotto | Prezzo | Target |
|----------|--------|--------|
| **Edirama Kit** (Italia) | €1.836 una tantum (8 software Excel/Access) | Consulenti IT, PMI Italia |
| **FlinkISO** | Gratuito (open source) | Self-hosted, tech-savvy |
| **ISOFAIDATE** (Italia) | €3.000 pacchetto consulenza + template | Micro imprese Italia |
| **GMT Digital ISO / QSA.net** (Italia) | Non pubblicato, "bassissimo costo iniziale" | PMI Italia, consulenti |

---

## 2. Posizionamento di Trust ISO Tracking System

### Cosa offre Trust ISO rispetto ai competitor

| Feature | Trust ISO | isoTracker | Effivity | Edirama Kit |
|---------|-----------|------------|----------|-------------|
| Gap Analysis con tutti i 81 requisiti ISO 9001 | ✅ Completo | ✅ | ✅ | Parziale |
| Dashboard con statistiche real-time | ✅ Radar + barre | ✅ | ✅ | ❌ |
| Report PDF professionali (5 tipi) | ✅ | ✅ | ✅ | Limitato |
| Changelog per requisito (chi ha modificato cosa) | ✅ | Parziale | ✅ | ❌ |
| Multi-utente con ruoli | ✅ Admin/User | ✅ | ✅ | ❌ (monoutente) |
| Temi colore personalizzabili | ✅ 5 temi | ❌ | ❌ | ❌ |
| Self-hosted (controllo dati) | ✅ Docker | ❌ (solo cloud) | ❌ (solo cloud) | ✅ (desktop) |
| Nessun costo ricorrente per il cliente | ✅ Possibile | ❌ | ❌ | ✅ |
| Gestione documenti SGQ | ✅ Base | ✅ Avanzata | ✅ Avanzata | ✅ |
| Audit management | ❌ | ✅ | ✅ | ✅ |
| CAPA / Non conformità strutturate | Base (registro NC) | ✅ Avanzato | ✅ | ✅ |
| Multi-standard (14001, 45001, etc.) | ❌ (solo 9001) | ✅ | ✅ | ✅ |
| Mobile responsive | ✅ | ✅ | ✅ | ❌ |
| PWA installabile | ✅ | ❌ | ❌ | ❌ |

### Punti di forza unici di Trust ISO
1. **Self-hosted**: il cliente ha il pieno controllo dei propri dati (importante per aziende sensibili alla privacy)
2. **Nessun abbonamento SaaS**: può essere venduto come licenza una tantum o con manutenzione annuale leggera
3. **Completamente in italiano**: interfaccia, report, guide, testi normativi
4. **Testi ISO 9001 integrati**: tutti gli 81 requisiti con testo normativo, documenti obbligatori ed evidenze suggerite già dentro l'app
5. **Deploy semplice**: un container Docker, nessuna dipendenza esterna
6. **Personalizzabile**: temi colore con branding del consulente o del cliente

### Punti deboli (rispetto ai competitor enterprise)
1. Solo ISO 9001:2015 (non multi-standard)
2. Nessun workflow email/notifiche
3. Gestione documenti basica (no versionamento file, solo metadata)
4. Nessun audit management dedicato
5. Nessuna integrazione con strumenti esterni (ERP, SharePoint, etc.)

---

## 3. Modelli di prezzo proposti

### Opzione A — Licenza una tantum + manutenzione
Questo modello è il più differenziante rispetto ai SaaS.

| Voce | Prezzo suggerito |
|------|-----------------|
| **Licenza perpetua** (installazione su server del cliente) | €1.500 - €2.500 |
| **Setup e personalizzazione** (branding, tema, import dati) | €500 - €1.000 |
| **Formazione** (2-3 ore online) | €300 - €500 |
| **Manutenzione annuale** (aggiornamenti + supporto) | €400 - €600/anno |

**Pacchetto completo primo anno: €2.700 - €4.600**
**Dal secondo anno: €400 - €600/anno**

*Confronto: isoTracker per 10 utenti costa ~€3.200-6.400/anno OGNI anno. Trust ISO si ripaga da solo in meno di un anno.*

### Opzione B — SaaS ospitato dal consulente
Il consulente ospita l'app per il cliente su un suo server.

| Voce | Prezzo suggerito |
|------|-----------------|
| **Canone mensile** (hosting incluso) | €99 - €199/mese |
| **Setup iniziale** | €500 (una tantum) |
| **Formazione** | Inclusa nel setup |

**Costo annuale per il cliente: €1.688 - €2.888**
**Margine per il consulente: il costo hosting effettivo è ~€5-15/mese (VPS)**

*Confronto: Effivity costa ~€30/utente/mese → per 5 utenti = €150/mese = €1.800/anno, senza personalizzazione né supporto diretto in italiano.*

### Opzione C — Pacchetto consulenza + software
Integrato nel servizio di consulenza ISO 9001.

| Voce | Prezzo suggerito |
|------|-----------------|
| **Consulenza ISO 9001 completa** (incluso software) | €3.000 - €6.000 |
| Di cui software | Incluso (valore percepito ~€1.500) |
| **Manutenzione software post-certificazione** | €300 - €500/anno |

*Il software diventa un differenziatore competitivo rispetto ad altri consulenti che usano Excel/Word. Il costo del software è assorbito nella consulenza.*

---

## 4. Proposta commerciale per il cliente

### Struttura documento proposta

---

**[NOME CONSULENTE] — Proposta Trust ISO Tracking System**

**Gentile [Cliente],**

Le propongo l'adozione di **Trust ISO Tracking System**, una piattaforma web professionale sviluppata specificamente per la gestione del percorso di certificazione ISO 9001:2015.

### Il problema
La gestione della certificazione ISO con fogli Excel, documenti Word e email porta a:
- Difficoltà nel tracciare lo stato di avanzamento per ogni requisito
- Rischio di perdere informazioni tra riunioni e audit
- Impossibilità di generare report aggiornati in tempo reale
- Mancanza di storico delle modifiche (chi ha fatto cosa e quando)

### La soluzione
Trust ISO Tracking System offre:

**Dashboard in tempo reale**
Percentuali di conformità, criticità e scadenze sempre aggiornate, con grafici per clausola.

**Gap Analysis completa**
Tutti gli 81 requisiti ISO 9001:2015 con testo normativo, stato, responsabili, scadenze e azioni correttive tracciate.

**Storico modifiche automatico**
Ogni modifica è tracciata: chi l'ha fatta, quando, e cosa è cambiato. Fondamentale per la trasparenza verso gli auditor.

**Report PDF professionali**
5 tipi di report generabili con un click: Gap Analysis, Piano di Implementazione, Executive Summary, Checklist Documenti, Registro NC.

**Accesso multi-utente**
Più persone possono lavorare contemporaneamente, con ruoli differenziati (amministratore/utente).

**Dati sotto il vostro controllo**
Il sistema è installato su un server dedicato — i vostri dati non sono in mano a fornitori terzi americani.

**Personalizzabile**
Temi colore adattabili al vostro brand aziendale.

### Investimento

| Voce | Importo |
|------|---------|
| Licenza software perpetua | € [X] |
| Installazione e configurazione | € [X] |
| Formazione team (sessione online 2h) | Inclusa |
| **Totale primo anno** | **€ [X]** |
| Manutenzione annuale (dal 2° anno) | € [X]/anno |

### Confronto con le alternative

| | Trust ISO | SaaS competitor tipico | Excel/Word |
|---|-----------|----------------------|------------|
| Costo primo anno | € [X] | €3.000 - €6.000 | €0 |
| Costo dal 2° anno | € [X]/anno | €3.000 - €6.000/anno | €0 |
| Costo in 5 anni | € [X] | €15.000 - €30.000 | €0 |
| Dashboard real-time | ✅ | ✅ | ❌ |
| Report automatici | ✅ | ✅ | Manuale |
| Storico modifiche | ✅ | ✅ | ❌ |
| Controllo dati | ✅ Server vostro | ❌ Cloud terzi | ✅ |
| In italiano | ✅ | Spesso ❌ | ✅ |

### Prossimi passi
1. Demo live del sistema (30 minuti)
2. Personalizzazione tema con il vostro logo
3. Installazione e configurazione
4. Sessione di formazione per il team
5. Inizio utilizzo operativo

---

## 5. Fonti della ricerca

- [isoTracker — How Much Does QMS Software Cost?](https://www.isotracker.com/blog/how-much-does-qms-software-cost/)
- [isoTracker — User Pricing](https://www.isotracker.com/user-pricing-payment/)
- [Effivity — ISO 9001 Software Pricing](https://www.effivity.com/QMS/iso-9001-software-pricing-classic.htm)
- [Qualio — Pricing](https://www.qualio.com/pricing)
- [ISOvA — Pricing Plans](https://www.isova.co.uk/pricing)
- [GoAudits — ISO Compliance Software](https://goaudits.com/blog/iso-compliance-software/)
- [dcycle — 15 Best ISO 9001 Software Solutions](https://www.dcycle.io/post/best-iso-9001-software)
- [Edirama — Kit Software ISO 9001](https://edirama.org/prodotto/raccolta-software-per-gestire-i-sistemi-di-gestione-iso-9001/)
- [GMT Consulting — Software Digital ISO](https://www.gmtconsulting.net/qualita-sicurezza-ambiente/software-gestione-sistemi-qualita-iso-9001/)
- [Qualitiamo — Costi certificazione ISO 9001](https://www.qualitiamo.com/ISO%209001/costo-certificazione-iso-9001.html)
- [ISOFAIDATE — Consulenza ISO 9001](https://www.isofaidate.com/consulenza-iso-9001)
- [ComplianceQuest — Affordable QMS for SMBs](https://www.compliancequest.com/cq-guide/affordable-qms-software-solutions-for-small-and-medium-businesses/)
