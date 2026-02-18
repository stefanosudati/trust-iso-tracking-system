/**
 * ISO 9001:2015 - Complete Clause Structure
 * Sistemi di gestione per la qualità - Requisiti
 */
const ISO_9001_2015 = {
  id: "iso-9001-2015",
  name: "ISO 9001:2015",
  fullName: "Sistemi di gestione per la qualità - Requisiti",
  year: 2015,
  icon: "shield-check",
  color: "#2563eb",
  clauses: [
    {
      number: "4",
      title: "Contesto dell'organizzazione",
      requirements: [
        {
          id: "4.1",
          title: "Comprendere l'organizzazione e il suo contesto",
          text: "L'organizzazione deve determinare i fattori esterni e interni rilevanti per le sue finalità e indirizzi strategici e che influenzano la sua capacità di conseguire il/i risultato/i atteso/i del proprio sistema di gestione per la qualità. L'organizzazione deve monitorare e riesaminare le informazioni che riguardano tali fattori esterni e interni.",
          mandatoryDocs: [],
          evidences: [
            "Analisi SWOT o analisi del contesto",
            "Documentazione fattori interni ed esterni",
            "Verbali di riesame del contesto"
          ]
        },
        {
          id: "4.2",
          title: "Comprendere le esigenze e le aspettative delle parti interessate",
          text: "Per la sua influenza, effettiva o potenziale, sulla capacità dell'organizzazione di fornire con regolarità prodotti e servizi che soddisfino i requisiti del cliente e quelli cogenti applicabili, l'organizzazione deve determinare: a) le parti interessate rilevanti per il SGQ; b) i requisiti di tali parti interessate rilevanti per il SGQ. L'organizzazione deve monitorare e riesaminare le informazioni riguardanti tali parti interessate e i loro requisiti rilevanti.",
          mandatoryDocs: [],
          evidences: [
            "Elenco parti interessate",
            "Analisi esigenze e aspettative",
            "Matrice delle parti interessate"
          ]
        },
        {
          id: "4.3",
          title: "Determinare il campo di applicazione del SGQ",
          text: "L'organizzazione deve determinare i confini e l'applicabilita del SGQ per stabilirne il campo di applicazione. Nel determinare tale campo di applicazione, l'organizzazione deve considerare: a) i fattori esterni e interni di cui al punto 4.1; b) i requisiti delle parti interessate rilevanti di cui al punto 4.2; c) i prodotti e i servizi dell'organizzazione. Il campo di applicazione del SGQ dell'organizzazione deve essere disponibile e mantenuto come informazione documentata.",
          mandatoryDocs: ["Campo di applicazione del SGQ (documentato)"],
          evidences: [
            "Documento campo di applicazione",
            "Giustificazione esclusioni",
            "Manuale qualità (se presente)"
          ]
        },
        {
          id: "4.4",
          title: "Sistema di gestione per la qualità e relativi processi",
          text: "L'organizzazione deve stabilire, attuare, mantenere e migliorare in modo continuo un SGQ, compresi i processi necessari e le loro interazioni, in conformità ai requisiti della presente norma internazionale. L'organizzazione deve determinare i processi necessari per il SGQ e la loro applicazione nell'ambito dell'intera organizzazione.",
          mandatoryDocs: [],
          evidences: [
            "Mappa dei processi",
            "Interazioni tra processi",
            "Indicatori di processo",
            "Rischi e opportunita per processo"
          ],
          subRequirements: [
            {
              id: "4.4.1",
              title: "Processi del SGQ",
              text: "L'organizzazione deve determinare: input e output attesi, sequenza e interazione, criteri e metodi, risorse necessarie, responsabilità e autorita, rischi e opportunita, valutare e attuare modifiche necessarie."
            },
            {
              id: "4.4.2",
              title: "Informazioni documentate dei processi",
              text: "Nella misura necessaria, l'organizzazione deve mantenere informazioni documentate per supportare il funzionamento dei propri processi e conservare informazioni documentate per poter confidare nel fatto che i processi sono condotti come pianificato."
            }
          ]
        }
      ]
    },
    {
      number: "5",
      title: "Leadership",
      requirements: [
        {
          id: "5.1",
          title: "Leadership e impegno",
          text: "L'alta direzione deve dimostrare leadership e impegno nei riguardi del SGQ.",
          subRequirements: [
            {
              id: "5.1.1",
              title: "Generalita",
              text: "L'alta direzione deve dimostrare leadership e impegno nei riguardi del SGQ: assumendosi la responsabilità dell'efficacia del SGQ; assicurando che siano stabiliti la politica e gli obiettivi per la qualità e che essi siano compatibili con il contesto e con gli indirizzi strategici dell'organizzazione; assicurando l'integrazione dei requisiti del SGQ nei processi di business dell'organizzazione; promuovendo l'utilizzo dell'approccio per processi e del risk-based thinking; assicurando la disponibilità delle risorse; comunicando l'importanza di una gestione per la qualità efficace; assicurando che il SGQ consegua i risultati attesi; coinvolgendo, dirigendo e sostenendo le persone affinche contribuiscano all'efficacia del SGQ; promuovendo il miglioramento; fornendo sostegno agli altri pertinenti ruoli gestionali.",
              evidences: [
                "Verbali riesame direzione",
                "Comunicazioni della direzione",
                "Evidenze di impegno diretto"
              ]
            },
            {
              id: "5.1.2",
              title: "Focalizzazione sul cliente",
              text: "L'alta direzione deve dimostrare leadership e impegno in merito alla focalizzazione sul cliente, assicurando che: siano determinati, compresi e soddisfatti con regolarità i requisiti del cliente e i requisiti cogenti applicabili; siano determinati e affrontati i rischi e le opportunita che possono influenzare la conformità dei prodotti e dei servizi e la capacità di accrescere la soddisfazione del cliente; sia mantenuta la focalizzazione sull'accrescimento della soddisfazione del cliente.",
              evidences: [
                "Analisi soddisfazione cliente",
                "Gestione reclami",
                "Monitoraggio requisiti cliente"
              ]
            }
          ],
          mandatoryDocs: [],
          evidences: []
        },
        {
          id: "5.2",
          title: "Politica",
          text: "L'alta direzione deve stabilire, attuare e mantenere una politica per la qualità.",
          subRequirements: [
            {
              id: "5.2.1",
              title: "Stabilire la politica per la qualità",
              text: "L'alta direzione deve stabilire, attuare e mantenere una politica per la qualità che: sia appropriata alle finalità e al contesto dell'organizzazione e supporti i suoi indirizzi strategici; costituisca un quadro di riferimento per fissare gli obiettivi per la qualità; comprenda un impegno a soddisfare i requisiti applicabili; comprenda un impegno al miglioramento continuo del SGQ.",
              evidences: [
                "Politica per la qualità documentata",
                "Coerenza con contesto e strategia"
              ]
            },
            {
              id: "5.2.2",
              title: "Comunicare la politica per la qualità",
              text: "La politica per la qualità deve: essere disponibile e mantenuta come informazione documentata; essere comunicata, compresa e applicata all'interno dell'organizzazione; essere disponibile alle parti interessate rilevanti, per quanto appropriato.",
              evidences: [
                "Evidenze di comunicazione",
                "Pubblicazione politica",
                "Comprensione da parte del personale"
              ]
            }
          ],
          mandatoryDocs: ["Politica per la qualità (documentata)"],
          evidences: []
        },
        {
          id: "5.3",
          title: "Ruoli, responsabilità e autorita nell'organizzazione",
          text: "L'alta direzione deve assicurare che le responsabilità e le autorita per i ruoli pertinenti siano assegnate, comunicate e comprese all'interno dell'organizzazione. L'alta direzione deve assegnare la responsabilità e l'autorita per: assicurare che il SGQ sia conforme ai requisiti della presente norma; assicurare che i processi producano gli output attesi; riferire all'alta direzione sulle prestazioni del SGQ e sulle opportunita di miglioramento; assicurare la promozione della focalizzazione sul cliente; assicurare che l'integrità del SGQ sia mantenuta quando sono pianificate e attuate modifiche.",
          mandatoryDocs: [],
          evidences: [
            "Organigramma",
            "Mansionario / Job description",
            "Nomine e deleghe",
            "Matrice RACI"
          ]
        }
      ]
    },
    {
      number: "6",
      title: "Pianificazione",
      requirements: [
        {
          id: "6.1",
          title: "Azioni per affrontare rischi e opportunita",
          text: "Nel pianificare il SGQ, l'organizzazione deve considerare i fattori di cui al punto 4.1 e i requisiti di cui al punto 4.2 e determinare i rischi e le opportunita che e necessario affrontare per: assicurare che il SGQ possa conseguire i risultati attesi; accrescere gli effetti desiderati; prevenire, o ridurre, gli effetti indesiderati; conseguire il miglioramento.",
          mandatoryDocs: [],
          evidences: [
            "Registro rischi e opportunita",
            "Valutazione rischi (matrice probabilita/impatto)",
            "Piano azioni per rischi e opportunita",
            "Monitoraggio efficacia azioni"
          ],
          subRequirements: [
            {
              id: "6.1.1",
              title: "Determinazione rischi e opportunita",
              text: "L'organizzazione deve pianificare: azioni per affrontare tali rischi e opportunita."
            },
            {
              id: "6.1.2",
              title: "Pianificazione azioni",
              text: "L'organizzazione deve pianificare: le azioni per affrontare tali rischi e opportunita; le modalita per integrare e attuare le azioni nei processi del proprio SGQ; valutare l'efficacia di tali azioni."
            }
          ]
        },
        {
          id: "6.2",
          title: "Obiettivi per la qualità e pianificazione per il loro raggiungimento",
          text: "L'organizzazione deve stabilire gli obiettivi per la qualità relativi alle funzioni, ai livelli e ai processi pertinenti, necessari per il SGQ. Gli obiettivi per la qualità devono: essere coerenti con la politica per la qualità; essere misurabili; tenere conto dei requisiti applicabili; essere pertinenti alla conformità dei prodotti e dei servizi e all'accrescimento della soddisfazione del cliente; essere monitorati; essere comunicati; essere aggiornati per quanto appropriato.",
          mandatoryDocs: ["Obiettivi per la qualità (documentati)"],
          evidences: [
            "Piano obiettivi qualità",
            "KPI e indicatori misurabili",
            "Stato avanzamento obiettivi",
            "Risorse allocate per obiettivi"
          ],
          subRequirements: [
            {
              id: "6.2.1",
              title: "Definizione obiettivi",
              text: "Gli obiettivi per la qualità devono essere coerenti con la politica, misurabili, monitorati, comunicati e aggiornati."
            },
            {
              id: "6.2.2",
              title: "Pianificazione raggiungimento",
              text: "Nel pianificare come raggiungere i propri obiettivi per la qualità, l'organizzazione deve determinare: cosa sara fatto; quali risorse saranno necessarie; chi ne sara responsabile; quando sara completato; come saranno valutati i risultati."
            }
          ]
        },
        {
          id: "6.3",
          title: "Pianificazione delle modifiche",
          text: "Quando l'organizzazione determina l'esigenza di modifiche al SGQ, queste devono essere effettuate in modo pianificato. L'organizzazione deve considerare: le finalità delle modifiche e le loro potenziali conseguenze; l'integrità del SGQ; la disponibilità di risorse; l'allocazione o riallocazione delle responsabilità e autorita.",
          mandatoryDocs: [],
          evidences: [
            "Procedura gestione modifiche",
            "Registrazioni modifiche al SGQ",
            "Valutazione impatto modifiche"
          ]
        }
      ]
    },
    {
      number: "7",
      title: "Supporto",
      requirements: [
        {
          id: "7.1",
          title: "Risorse",
          text: "L'organizzazione deve determinare e fornire le risorse necessarie per l'istituzione, l'attuazione, il mantenimento e il miglioramento continuo del SGQ.",
          mandatoryDocs: [],
          evidences: [],
          subRequirements: [
            {
              id: "7.1.1",
              title: "Generalita",
              text: "L'organizzazione deve considerare: le capacità e i vincoli relativi alle risorse interne esistenti; cosa e necessario ottenere dai fornitori esterni.",
              evidences: ["Piano risorse", "Budget qualità"]
            },
            {
              id: "7.1.2",
              title: "Persone",
              text: "L'organizzazione deve determinare e mettere a disposizione le persone necessarie per l'efficace attuazione del proprio SGQ e per il funzionamento e il controllo dei propri processi.",
              evidences: ["Piano del personale", "Analisi fabbisogno risorse umane"]
            },
            {
              id: "7.1.3",
              title: "Infrastruttura",
              text: "L'organizzazione deve determinare, fornire e manutenere l'infrastruttura necessaria per il funzionamento dei propri processi e per conseguire la conformità di prodotti e servizi.",
              evidences: ["Elenco infrastrutture", "Piano manutenzione", "Registrazioni manutenzione"]
            },
            {
              id: "7.1.4",
              title: "Ambiente per il funzionamento dei processi",
              text: "L'organizzazione deve determinare, predisporre e mantenere l'ambiente necessario per il funzionamento dei propri processi e per conseguire la conformità dei prodotti e dei servizi.",
              evidences: ["Valutazione ambiente di lavoro", "Monitoraggio condizioni ambientali"]
            },
            {
              id: "7.1.5",
              title: "Risorse per il monitoraggio e la misurazione",
              text: "L'organizzazione deve determinare e mettere a disposizione le risorse necessarie per assicurare risultati validi e affidabili quando il monitoraggio o la misurazione sono utilizzati per verificare la conformità di prodotti e servizi ai requisiti.",
              evidences: [
                "Elenco strumenti di misura",
                "Piano di taratura/verifica",
                "Certificati di taratura",
                "Registrazioni verifiche"
              ],
              subRequirements: [
                {
                  id: "7.1.5.1",
                  title: "Generalita",
                  text: "Le risorse per il monitoraggio e la misurazione devono essere idonee, mantenute per assicurare la loro continua adeguatezza."
                },
                {
                  id: "7.1.5.2",
                  title: "Riferibilita delle misurazioni",
                  text: "Quando la riferibilita delle misurazioni e un requisito, le apparecchiature di misurazione devono essere tarate o verificate, o entrambe le cose, a intervalli specificati."
                }
              ]
            },
            {
              id: "7.1.6",
              title: "Conoscenza organizzativa",
              text: "L'organizzazione deve determinare le conoscenze necessarie per il funzionamento dei propri processi e per conseguire la conformità dei prodotti e dei servizi. Tali conoscenze devono essere mantenute e rese disponibili nella misura necessaria.",
              evidences: [
                "Gestione knowledge base",
                "Lessons learned",
                "Fonti di conoscenza interne ed esterne"
              ]
            }
          ]
        },
        {
          id: "7.2",
          title: "Competenza",
          text: "L'organizzazione deve: determinare la competenza necessaria delle persone che svolgono attività sotto il suo controllo che influenzano le prestazioni e l'efficacia del SGQ; assicurare che tali persone siano competenti sulla base di istruzione, formazione e addestramento o esperienza appropriati; ove applicabile, intraprendere azioni per acquisire la competenza necessaria e valutare l'efficacia delle azioni intraprese; conservare appropriate informazioni documentate quale evidenza della competenza.",
          mandatoryDocs: ["Evidenze di competenza (documentate)"],
          evidences: [
            "Matrice competenze",
            "Piano formazione",
            "Registrazioni formazione",
            "Valutazione efficacia formazione",
            "CV / qualifiche del personale"
          ]
        },
        {
          id: "7.3",
          title: "Consapevolezza",
          text: "L'organizzazione deve assicurare che le persone che svolgono attività sotto il suo controllo siano consapevoli: della politica per la qualità; dei pertinenti obiettivi per la qualità; del proprio contributo all'efficacia del SGQ, compresi i benefici derivanti dal miglioramento delle prestazioni; delle implicazioni derivanti dal non essere conformi ai requisiti del SGQ.",
          mandatoryDocs: [],
          evidences: [
            "Comunicazioni interne",
            "Programmi di sensibilizzazione",
            "Verifiche di consapevolezza"
          ]
        },
        {
          id: "7.4",
          title: "Comunicazione",
          text: "L'organizzazione deve determinare le comunicazioni interne ed esterne pertinenti al SGQ, comprendendo: cosa comunicare; quando comunicare; con chi comunicare; come comunicare; chi comunica.",
          mandatoryDocs: [],
          evidences: [
            "Piano di comunicazione",
            "Registrazioni comunicazioni",
            "Canali di comunicazione definiti"
          ]
        },
        {
          id: "7.5",
          title: "Informazioni documentate",
          text: "Il SGQ dell'organizzazione deve comprendere le informazioni documentate richieste dalla presente norma internazionale e le informazioni documentate che l'organizzazione ritiene necessarie per l'efficacia del SGQ.",
          mandatoryDocs: ["Procedura gestione informazioni documentate"],
          evidences: [],
          subRequirements: [
            {
              id: "7.5.1",
              title: "Generalita",
              text: "Il SGQ dell'organizzazione deve comprendere le informazioni documentate richieste dalla norma e quelle determinate dall'organizzazione come necessarie per l'efficacia del SGQ.",
              evidences: ["Elenco informazioni documentate", "Struttura documentale"]
            },
            {
              id: "7.5.2",
              title: "Creazione e aggiornamento",
              text: "Nel creare e aggiornare le informazioni documentate, l'organizzazione deve assicurare un'appropriata: identificazione e descrizione; formato e supporto; riesame e approvazione in merito all'idoneita e all'adeguatezza.",
              evidences: ["Template documenti", "Regole di codifica", "Processo di approvazione"]
            },
            {
              id: "7.5.3",
              title: "Controllo delle informazioni documentate",
              text: "Le informazioni documentate richieste dal SGQ e dalla presente norma internazionale devono essere tenute sotto controllo per assicurare che siano disponibili e idonee all'utilizzo, dove e quando necessario, e siano adeguatamente protette.",
              evidences: [
                "Lista distribuzione documenti",
                "Controllo accessi",
                "Gestione documenti obsoleti",
                "Backup e conservazione"
              ]
            }
          ]
        }
      ]
    },
    {
      number: "8",
      title: "Attivita operative",
      requirements: [
        {
          id: "8.1",
          title: "Pianificazione e controllo operativi",
          text: "L'organizzazione deve pianificare, attuare e tenere sotto controllo i processi necessari a soddisfare i requisiti per la fornitura di prodotti e servizi e ad attuare le azioni determinate nella clausola 6.",
          mandatoryDocs: [],
          evidences: [
            "Piani operativi",
            "Criteri per i processi",
            "Controllo modifiche pianificate",
            "Controllo processi affidati all'esterno"
          ]
        },
        {
          id: "8.2",
          title: "Requisiti per i prodotti e i servizi",
          text: "L'organizzazione deve stabilire i processi per comunicare con i clienti e determinare i requisiti relativi ai prodotti e servizi.",
          mandatoryDocs: [],
          evidences: [],
          subRequirements: [
            {
              id: "8.2.1",
              title: "Comunicazione con il cliente",
              text: "Le comunicazioni con i clienti devono comprendere: informazioni relative a prodotti e servizi; gestione richieste, contratti e ordini; feedback del cliente inclusi reclami; trattamento proprieta del cliente; requisiti specifici per azioni di emergenza.",
              evidences: ["Canali comunicazione cliente", "Gestione feedback", "Gestione reclami"]
            },
            {
              id: "8.2.2",
              title: "Determinazione dei requisiti relativi ai prodotti e servizi",
              text: "Nel determinare i requisiti per i prodotti e servizi da offrire ai clienti, l'organizzazione deve assicurare che i requisiti siano definiti, inclusi quelli cogenti e quelli ritenuti necessari dall'organizzazione.",
              evidences: ["Specifiche prodotto/servizio", "Requisiti cogenti applicabili"]
            },
            {
              id: "8.2.3",
              title: "Riesame dei requisiti relativi ai prodotti e servizi",
              text: "L'organizzazione deve assicurare di avere la capacità di soddisfare i requisiti per i prodotti e servizi da offrire ai clienti, conducendo un riesame prima di impegnarsi a fornire prodotti e servizi.",
              evidences: [
                "Riesame contratti/ordini",
                "Registrazioni riesame",
                "Gestione modifiche ai requisiti"
              ],
              subRequirements: [
                {
                  id: "8.2.3.1",
                  title: "Riesame requisiti",
                  text: "Il riesame deve comprendere requisiti specificati dal cliente, requisiti non specificati ma necessari, requisiti dell'organizzazione, requisiti cogenti, requisiti contrattuali diversi da quelli precedenti."
                },
                {
                  id: "8.2.3.2",
                  title: "Conservazione informazioni documentate",
                  text: "L'organizzazione deve conservare informazioni documentate relative ai risultati del riesame e a qualsiasi nuovo requisito per prodotti e servizi."
                }
              ]
            },
            {
              id: "8.2.4",
              title: "Modifiche ai requisiti per i prodotti e servizi",
              text: "L'organizzazione deve assicurare che le pertinenti informazioni documentate siano modificate e che le persone pertinenti siano messe a conoscenza dei requisiti modificati.",
              evidences: ["Gestione modifiche requisiti", "Comunicazione modifiche"]
            }
          ]
        },
        {
          id: "8.3",
          title: "Progettazione e sviluppo di prodotti e servizi",
          text: "L'organizzazione deve stabilire, attuare e mantenere un processo di progettazione e sviluppo appropriato ad assicurare la successiva fornitura di prodotti e servizi.",
          mandatoryDocs: [],
          evidences: [],
          subRequirements: [
            {
              id: "8.3.1",
              title: "Generalita",
              text: "L'organizzazione deve stabilire, attuare e mantenere un processo di progettazione e sviluppo appropriato ad assicurare la successiva fornitura di prodotti e servizi.",
              evidences: ["Procedura progettazione e sviluppo"]
            },
            {
              id: "8.3.2",
              title: "Pianificazione della progettazione e sviluppo",
              text: "Nel determinare le fasi e i controlli per la progettazione e sviluppo, l'organizzazione deve considerare: natura, durata e complessità; fasi del processo; attività di verifica e validazione; responsabilità e autorita; risorse interne ed esterne; interfacce; coinvolgimento clienti e utilizzatori; requisiti successivi; livello di controllo atteso.",
              evidences: ["Piano di progettazione", "Milestones progetto", "Risorse assegnate"]
            },
            {
              id: "8.3.3",
              title: "Input alla progettazione e sviluppo",
              text: "L'organizzazione deve determinare i requisiti essenziali per le specifiche tipologie di prodotti e servizi da progettare e sviluppare.",
              evidences: ["Requisiti funzionali e prestazionali", "Requisiti cogenti", "Norme e codici di pratica"]
            },
            {
              id: "8.3.4",
              title: "Controlli della progettazione e sviluppo",
              text: "L'organizzazione deve applicare controlli al processo di progettazione e sviluppo per assicurare che: siano definiti i risultati da conseguire; siano condotti riesami; siano condotte attività di verifica; siano condotte attività di validazione.",
              evidences: ["Riesami di progettazione", "Verifiche e validazioni", "Registrazioni controlli"]
            },
            {
              id: "8.3.5",
              title: "Output della progettazione e sviluppo",
              text: "L'organizzazione deve assicurare che gli output della progettazione e sviluppo soddisfino i requisiti di input, siano adeguati ai processi successivi, includano requisiti di monitoraggio e misurazione e criteri di accettazione.",
              evidences: ["Documenti di output progettazione", "Specifiche tecniche", "Criteri di accettazione"]
            },
            {
              id: "8.3.6",
              title: "Modifiche della progettazione e sviluppo",
              text: "L'organizzazione deve identificare, riesaminare e tenere sotto controllo le modifiche apportate durante o dopo la progettazione e sviluppo di prodotti e servizi, nella misura necessaria ad assicurare che non vi siano impatti negativi sulla conformità ai requisiti.",
              evidences: ["Registro modifiche progettazione", "Valutazione impatto modifiche", "Approvazioni modifiche"]
            }
          ]
        },
        {
          id: "8.4",
          title: "Controllo dei processi, prodotti e servizi forniti dall'esterno",
          text: "L'organizzazione deve assicurare che i processi, prodotti e servizi forniti dall'esterno siano conformi ai requisiti.",
          mandatoryDocs: [],
          evidences: [],
          subRequirements: [
            {
              id: "8.4.1",
              title: "Generalita",
              text: "L'organizzazione deve determinare i controlli da applicare ai processi, prodotti e servizi forniti dall'esterno quando: sono incorporati nei prodotti e servizi dell'organizzazione; sono forniti direttamente al cliente; un processo e fornito da un fornitore esterno come risultato di una decisione dell'organizzazione.",
              evidences: [
                "Criteri di valutazione fornitori",
                "Albo fornitori qualificati",
                "Registrazioni valutazione e rivalutazione"
              ]
            },
            {
              id: "8.4.2",
              title: "Tipo ed estensione del controllo",
              text: "L'organizzazione deve assicurare che i processi, prodotti e servizi forniti dall'esterno non influenzino negativamente la capacità dell'organizzazione di fornire con regolarità ai propri clienti prodotti e servizi conformi.",
              evidences: ["Livelli di controllo definiti", "Verifiche su forniture", "Impatto sulla conformità"]
            },
            {
              id: "8.4.3",
              title: "Informazioni ai fornitori esterni",
              text: "L'organizzazione deve assicurare l'adeguatezza dei requisiti prima della loro comunicazione al fornitore esterno, comunicando i requisiti per processi, prodotti e servizi, approvazione, competenza delle persone, interazioni, controllo e monitoraggio, attività di verifica.",
              evidences: ["Ordini di acquisto", "Capitolati/specifiche", "Accordi qualità con fornitori"]
            }
          ]
        },
        {
          id: "8.5",
          title: "Produzione ed erogazione dei servizi",
          text: "L'organizzazione deve attuare la produzione e l'erogazione dei servizi in condizioni controllate.",
          mandatoryDocs: [],
          evidences: [],
          subRequirements: [
            {
              id: "8.5.1",
              title: "Controllo della produzione e dell'erogazione dei servizi",
              text: "Le condizioni controllate devono comprendere, per quanto applicabile: disponibilità di informazioni documentate; disponibilità e utilizzo di risorse per monitoraggio e misurazione; attuazione di attività di monitoraggio e misurazione; utilizzo di infrastruttura e ambiente di processo idonei; designazione di persone competenti; validazione e rivalidazione periodica; attuazione di azioni per prevenire l'errore umano; attuazione di attività di rilascio, consegna e post-consegna.",
              evidences: ["Istruzioni operative", "Piani di controllo", "Registrazioni di produzione/erogazione"]
            },
            {
              id: "8.5.2",
              title: "Identificazione e rintracciabilita",
              text: "L'organizzazione deve utilizzare mezzi idonei per identificare gli output quando cio e necessario per assicurare la conformità dei prodotti e dei servizi. L'organizzazione deve identificare lo stato degli output in relazione ai requisiti di monitoraggio e misurazione nel corso della produzione e dell'erogazione dei servizi.",
              evidences: ["Sistema di identificazione", "Sistema di rintracciabilita", "Registrazioni tracciabilita"]
            },
            {
              id: "8.5.3",
              title: "Proprieta che appartengono ai clienti o ai fornitori esterni",
              text: "L'organizzazione deve avere cura della proprieta appartenente ai clienti o ai fornitori esterni, mentre si trova sotto il controllo dell'organizzazione o viene da essa utilizzata.",
              evidences: ["Registro proprieta cliente/fornitore", "Procedure di salvaguardia", "Comunicazioni in caso di deterioramento"]
            },
            {
              id: "8.5.4",
              title: "Preservazione",
              text: "L'organizzazione deve preservare gli output nel corso della produzione e dell'erogazione dei servizi, nella misura necessaria ad assicurare la conformità ai requisiti.",
              evidences: ["Procedure di conservazione", "Condizioni di stoccaggio", "Gestione shelf life"]
            },
            {
              id: "8.5.5",
              title: "Attivita post-consegna",
              text: "L'organizzazione deve soddisfare i requisiti per le attività post-consegna associate ai prodotti e ai servizi.",
              evidences: ["Gestione garanzie", "Assistenza post-vendita", "Gestione resi"]
            },
            {
              id: "8.5.6",
              title: "Controllo delle modifiche",
              text: "L'organizzazione deve riesaminare e tenere sotto controllo le modifiche alla produzione o all'erogazione dei servizi, nella misura necessaria ad assicurare il permanere della conformità ai requisiti.",
              evidences: ["Registro modifiche produzione", "Riesame modifiche", "Autorizzazione modifiche"]
            }
          ]
        },
        {
          id: "8.6",
          title: "Rilascio di prodotti e servizi",
          text: "L'organizzazione deve attuare disposizioni pianificate, nelle fasi appropriate, per verificare che i requisiti dei prodotti e dei servizi siano stati soddisfatti. Il rilascio di prodotti e servizi al cliente non deve avvenire fino a quando le disposizioni pianificate non siano state completate in modo soddisfacente, salvo diversa approvazione da parte dell'autorita pertinente e, ove applicabile, del cliente.",
          mandatoryDocs: [],
          evidences: [
            "Registrazioni di rilascio/collaudo",
            "Criteri di accettazione",
            "Autorita di rilascio",
            "Riferibilita alla persona che autorizza il rilascio"
          ]
        },
        {
          id: "8.7",
          title: "Controllo degli output non conformi",
          text: "L'organizzazione deve assicurare che gli output che non sono conformi ai relativi requisiti siano identificati e tenuti sotto controllo per prevenirne l'utilizzo o la consegna involontaria.",
          mandatoryDocs: [],
          evidences: [
            "Procedura gestione non conformità prodotto",
            "Registrazioni non conformità",
            "Azioni intraprese (correzione, segregazione, concessione, ecc.)"
          ],
          subRequirements: [
            {
              id: "8.7.1",
              title: "Trattamento output non conformi",
              text: "L'organizzazione deve trattare gli output non conformi in uno o piùdei seguenti modi: correzione; segregazione, contenimento, reso o sospensione della fornitura; informazione al cliente; ottenimento dell'autorizzazione per l'accettazione in concessione."
            },
            {
              id: "8.7.2",
              title: "Informazioni documentate NC",
              text: "L'organizzazione deve conservare informazioni documentate che descrivano la non conformità, le azioni intraprese, le concessioni ottenute, l'autorita che ha deciso le azioni in merito alla non conformità."
            }
          ]
        }
      ]
    },
    {
      number: "9",
      title: "Valutazione delle prestazioni",
      requirements: [
        {
          id: "9.1",
          title: "Monitoraggio, misurazione, analisi e valutazione",
          text: "L'organizzazione deve determinare cosa e necessario monitorare e misurare, i metodi, quando effettuare monitoraggio e misurazione, quando analizzare e valutare i risultati.",
          mandatoryDocs: [],
          evidences: [],
          subRequirements: [
            {
              id: "9.1.1",
              title: "Generalita",
              text: "L'organizzazione deve determinare: cosa e necessario monitorare e misurare; i metodi per il monitoraggio, la misurazione, l'analisi e la valutazione necessari per assicurare risultati validi; quando devono essere eseguiti il monitoraggio e la misurazione; quando i risultati del monitoraggio e della misurazione devono essere analizzati e valutati.",
              evidences: [
                "Piano di monitoraggio e misurazione",
                "KPI di processo",
                "Dashboard indicatori",
                "Analisi dati e trend"
              ]
            },
            {
              id: "9.1.2",
              title: "Soddisfazione del cliente",
              text: "L'organizzazione deve monitorare la percezione del cliente riguardo al grado in cui le sue esigenze e aspettative sono state soddisfatte. L'organizzazione deve determinare i metodi per ottenere, monitorare e riesaminare tali informazioni.",
              evidences: [
                "Indagini soddisfazione cliente",
                "Analisi reclami e feedback",
                "Trend soddisfazione",
                "Azioni di miglioramento da feedback"
              ]
            },
            {
              id: "9.1.3",
              title: "Analisi e valutazione",
              text: "L'organizzazione deve analizzare e valutare dati e informazioni appropriati che emergono dal monitoraggio e dalla misurazione. I risultati dell'analisi devono essere utilizzati per valutare: conformità di prodotti e servizi; grado di soddisfazione del cliente; prestazioni e efficacia del SGQ; efficacia della pianificazione; efficacia delle azioni per affrontare rischi e opportunita; prestazioni dei fornitori esterni; necessità di miglioramenti al SGQ.",
              evidences: [
                "Report analisi dati",
                "Statistiche di processo",
                "Analisi tendenze",
                "Input per riesame direzione"
              ]
            }
          ]
        },
        {
          id: "9.2",
          title: "Audit interno",
          text: "L'organizzazione deve condurre audit interni a intervalli pianificati per fornire informazioni utili a stabilire se il SGQ e conforme ai requisiti dell'organizzazione e della presente norma internazionale ed e efficacemente attuato e mantenuto.",
          mandatoryDocs: ["Procedura audit interni (documentata)"],
          evidences: [
            "Programma audit",
            "Piano audit",
            "Checklist audit",
            "Rapporti audit",
            "Qualifica auditor interni",
            "Registro NC da audit",
            "Azioni correttive da audit"
          ],
          subRequirements: [
            {
              id: "9.2.1",
              title: "Pianificazione audit",
              text: "L'organizzazione deve pianificare, stabilire, attuare e mantenere uno o piùprogrammi di audit comprensivi di frequenza, metodi, responsabilità, requisiti di pianificazione e reporting."
            },
            {
              id: "9.2.2",
              title: "Conduzione audit",
              text: "L'organizzazione deve: definire i criteri e il campo di applicazione di ciascun audit; selezionare gli auditor e condurre gli audit assicurando l'obiettivita e l'imparzialita del processo di audit; assicurare che i risultati degli audit siano riportati ai pertinenti livelli direzionali; intraprendere appropriate correzioni e azioni correttive senza indebito ritardo; conservare informazioni documentate quale evidenza dell'attuazione del programma di audit e dei risultati degli audit."
            }
          ]
        },
        {
          id: "9.3",
          title: "Riesame di direzione",
          text: "L'alta direzione deve riesaminare il SGQ dell'organizzazione, a intervalli pianificati, per assicurarne la continua idoneita, adeguatezza, efficacia e allineamento agli indirizzi strategici dell'organizzazione.",
          mandatoryDocs: ["Registrazioni riesame di direzione (documentate)"],
          evidences: [],
          subRequirements: [
            {
              id: "9.3.1",
              title: "Generalita",
              text: "L'alta direzione deve riesaminare il SGQ a intervalli pianificati per assicurarne la continua idoneita, adeguatezza, efficacia e allineamento agli indirizzi strategici.",
              evidences: ["Calendario riesami", "Convocazioni riesame"]
            },
            {
              id: "9.3.2",
              title: "Input al riesame di direzione",
              text: "Il riesame di direzione deve essere pianificato e condotto tenendo conto di: stato delle azioni derivanti da precedenti riesami; modifiche nei fattori esterni e interni; informazioni sulle prestazioni e l'efficacia del SGQ (soddisfazione cliente, obiettivi qualità, prestazioni di processo, non conformità e azioni correttive, risultati monitoraggio e misurazione, risultati audit, prestazioni fornitori esterni); adeguatezza delle risorse; efficacia delle azioni intraprese per affrontare rischi e opportunita; opportunita di miglioramento.",
              evidences: [
                "Dati di input preparati",
                "Report prestazioni SGQ",
                "Analisi KPI"
              ]
            },
            {
              id: "9.3.3",
              title: "Output del riesame di direzione",
              text: "Gli output del riesame di direzione devono comprendere le decisioni e le azioni relative a: opportunita di miglioramento; ogni esigenza di modifica al SGQ; necessità di risorse.",
              evidences: [
                "Verbale riesame direzione",
                "Decisioni e azioni approvate",
                "Piano azioni da riesame"
              ]
            }
          ]
        }
      ]
    },
    {
      number: "10",
      title: "Miglioramento",
      requirements: [
        {
          id: "10.1",
          title: "Generalita",
          text: "L'organizzazione deve determinare e selezionare le opportunita di miglioramento e attuare ogni azione necessaria a soddisfare i requisiti del cliente e ad accrescere la soddisfazione del cliente. Cio deve comprendere: migliorare i prodotti e i servizi per soddisfare i requisiti e per affrontare le esigenze e le aspettative future; correggere, prevenire o ridurre gli effetti indesiderati; migliorare le prestazioni e l'efficacia del SGQ.",
          mandatoryDocs: [],
          evidences: [
            "Programma miglioramento",
            "Progetti di miglioramento",
            "Risultati azioni di miglioramento"
          ]
        },
        {
          id: "10.2",
          title: "Non conformità e azioni correttive",
          text: "Quando si verifica una non conformità, comprese quelle derivanti da reclami, l'organizzazione deve: reagire alla non conformità; valutare l'esigenza di azioni per eliminare le cause; attuare ogni azione necessaria; riesaminare l'efficacia delle azioni correttive intraprese; se necessario, apportare modifiche al SGQ.",
          mandatoryDocs: ["Registrazioni non conformità e azioni correttive (documentate)"],
          evidences: [
            "Registro non conformità",
            "Analisi cause radice",
            "Piano azioni correttive",
            "Verifica efficacia azioni correttive",
            "Trend non conformità"
          ],
          subRequirements: [
            {
              id: "10.2.1",
              title: "Gestione non conformità",
              text: "L'organizzazione deve reagire alla non conformità, intraprendere azioni per tenerla sotto controllo e correggerla, affrontarne le conseguenze."
            },
            {
              id: "10.2.2",
              title: "Informazioni documentate NC",
              text: "L'organizzazione deve conservare informazioni documentate quale evidenza: della natura delle non conformità e di ogni successiva azione intrapresa; dei risultati di qualsiasi azione correttiva."
            }
          ]
        },
        {
          id: "10.3",
          title: "Miglioramento continuo",
          text: "L'organizzazione deve migliorare in modo continuo l'idoneita, l'adeguatezza e l'efficacia del SGQ. L'organizzazione deve considerare i risultati dell'analisi e della valutazione e gli output del riesame di direzione per determinare se vi sono esigenze od opportunita che devono essere affrontate come parte del miglioramento continuo.",
          mandatoryDocs: [],
          evidences: [
            "Evidenze di miglioramento continuo",
            "Trend indicatori in miglioramento",
            "Iniziative di miglioramento documentate",
            "PDCA applicato"
          ]
        }
      ]
    }
  ]
};

// Helper: Flatten all requirements into a single array for iteration
function flattenRequirements(clauses) {
  const result = [];
  function walk(items, parentClause) {
    if (!items) return;
    for (const item of items) {
      result.push({ ...item, clauseNumber: parentClause });
      if (item.subRequirements) {
        walk(item.subRequirements, parentClause);
      }
      if (item.requirements) {
        walk(item.requirements, parentClause);
      }
    }
  }
  for (const clause of clauses) {
    walk(clause.requirements, clause.number);
  }
  return result;
}

// Count all evaluable requirements
function countRequirements(clauses) {
  return flattenRequirements(clauses).length;
}

// Available certifications registry
const CERTIFICATIONS = [
  ISO_9001_2015,
  {
    id: "iso-14001-2015",
    name: "ISO 14001:2015",
    fullName: "Sistemi di gestione ambientale - Requisiti",
    year: 2015,
    icon: "leaf",
    color: "#16a34a",
    clauses: [],
    comingSoon: true
  },
  {
    id: "iso-45001-2018",
    name: "ISO 45001:2018",
    fullName: "Sistemi di gestione per la salute e sicurezza sul lavoro",
    year: 2018,
    icon: "hard-hat",
    color: "#ea580c",
    clauses: [],
    comingSoon: true
  },
  {
    id: "iso-27001-2022",
    name: "ISO 27001:2022",
    fullName: "Sistemi di gestione per la sicurezza delle informazioni",
    year: 2022,
    icon: "lock",
    color: "#7c3aed",
    clauses: [],
    comingSoon: true
  }
];
