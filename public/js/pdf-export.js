/**
 * PDF Export Module using jsPDF
 */
const PDFExport = {

  _primaryRGB() {
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
    if (rgb) {
      const parts = rgb.split(',').map(s => parseInt(s.trim()));
      if (parts.length === 3 && parts.every(n => !isNaN(n))) return parts;
    }
    return [37, 99, 235];
  },

  _initDoc(title) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('La libreria jsPDF non è disponibile. Ricarica la pagina.');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica');
    return doc;
  },

  _header(doc, title, subtitle, project) {
    // Themed header bar
    doc.setFillColor(...this._primaryRGB());
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(title, 15, 15);

    doc.setFontSize(10);
    doc.text(subtitle, 15, 22);

    doc.setFontSize(8);
    doc.text(`${project.clientName} | ${new Date().toLocaleDateString('it-IT')}`, 15, 29);

    // Reset
    doc.setTextColor(30, 41, 59);
    return 45;
  },

  _footer(doc) {
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Trust ISO Tracking System - Pagina ${i} di ${pages}`, 105, 290, { align: 'center' });
    }
  },

  _checkPageBreak(doc, y, threshold = 260) {
    if (y > threshold) {
      doc.addPage();
      return 20;
    }
    return y;
  },

  // ===========================================================
  // GAP ANALYSIS REPORT
  // ===========================================================
  gapAnalysis(project) {
    try {
    const doc = this._initDoc('Gap Analysis');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    let y = this._header(doc, 'Report Gap Analysis', cert.name + ' - ' + cert.fullName, project);

    // Summary stats
    const stats = Store.getProjectStats(project.id);
    if (stats) {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Riepilogo', 15, y);
      y += 8;

      doc.setFontSize(9);
      const summaryData = [
        ['Requisiti Totali', stats.total],
        ['Conformi', stats.implemented],
        ['Parzialmente conformi', stats.partial],
        ['Non conformi', stats.notImplemented],
        ['Non applicabili', stats.notApplicable],
        ['Non valutati', stats.notEvaluated],
        ['% Conformità', stats.compliancePercent + '%'],
        ['% Progresso', stats.progressPercent + '%']
      ];

      summaryData.forEach(([label, value]) => {
        doc.setTextColor(100, 116, 139);
        doc.text(label + ':', 15, y);
        doc.setTextColor(30, 41, 59);
        doc.text(String(value), 70, y);
        y += 5;
      });

      y += 5;
    }

    // Detail per clause
    for (const clause of cert.clauses) {
      y = this._checkPageBreak(doc, y);

      // Clause header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y - 4, 180, 8, 'F');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`Clausola ${clause.number}: ${clause.title}`, 17, y + 1);
      y += 12;

      const allReqs = Views._flattenClauseRequirements(clause);
      for (const req of allReqs) {
        y = this._checkPageBreak(doc, y);
        const ev = project.evaluations[req.id] || { status: 'not_evaluated' };

        // Status color indicator
        const statusColors = {
          'implemented': [22, 163, 74],
          'partial': [245, 158, 11],
          'not_implemented': [220, 38, 38],
          'not_applicable': [148, 163, 184],
          'not_evaluated': [203, 213, 225]
        };
        const color = statusColors[ev.status] || statusColors['not_evaluated'];
        doc.setFillColor(...color);
        doc.circle(19, y - 1, 2, 'F');

        doc.setFontSize(9);
        doc.setTextColor(...this._primaryRGB());
        doc.text(req.id, 24, y);
        doc.setTextColor(30, 41, 59);
        doc.text(req.title, 38, y);

        // Status text
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        const statusText = App.statusLabel(ev.status);
        doc.text(statusText, 195, y, { align: 'right' });

        y += 5;

        // Notes if any
        if (ev.notes) {
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          const lines = doc.splitTextToSize('Note: ' + ev.notes, 160);
          doc.text(lines, 24, y);
          y += lines.length * 3.5;
        }

        // Actions if any
        if (ev.actions && ev.actions.length) {
          doc.setFontSize(7);
          ev.actions.forEach(a => {
            y = this._checkPageBreak(doc, y);
            doc.setTextColor(100, 116, 139);
            doc.text((a.done ? '[x] ' : '[ ] ') + a.text, 26, y);
            y += 3.5;
          });
        }

        y += 2;
      }
      y += 5;
    }

    this._footer(doc);
    doc.save(`Gap-Analysis-${project.clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    App.showToast('Report Gap Analysis generato', 'success');
    } catch (err) { console.error('Errore Gap Analysis PDF:', err); App.showToast('Errore generazione PDF: ' + err.message, 'error'); }
  },

  // ===========================================================
  // IMPLEMENTATION PLAN
  // ===========================================================
  implementationPlan(project) {
    try {
    const doc = this._initDoc('Piano Implementazione');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    let y = this._header(doc, 'Piano di Implementazione', cert.name, project);

    const allReqs = flattenRequirements(cert.clauses);
    const actionsReqs = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && (ev.status === 'not_implemented' || ev.status === 'partial') && ev.actions?.length;
    });

    if (actionsReqs.length === 0) {
      doc.setFontSize(10);
      doc.text('Nessuna azione correttiva pianificata.', 15, y);
    } else {
      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y - 4, 180, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Requisito', 17, y);
      doc.text('Azione', 45, y);
      doc.text('Responsabile', 130, y);
      doc.text('Scadenza', 160, y);
      doc.text('Priorità', 185, y);
      y += 8;

      for (const req of actionsReqs) {
        const ev = project.evaluations[req.id];
        (ev.actions || []).forEach(action => {
          y = this._checkPageBreak(doc, y);
          doc.setFontSize(8);
          doc.setTextColor(...this._primaryRGB());
          doc.text(req.id, 17, y);
          doc.setTextColor(30, 41, 59);
          const actionLines = doc.splitTextToSize(action.text, 80);
          doc.text(actionLines, 45, y);
          doc.setTextColor(100, 116, 139);
          doc.text(ev.responsible || '-', 130, y);
          doc.text(ev.deadline ? App.formatDate(ev.deadline) : '-', 160, y);
          doc.text(App.priorityLabel(ev.priority), 185, y);
          y += Math.max(actionLines.length * 4, 6);
        });
      }
    }

    // Milestones
    y += 10;
    y = this._checkPageBreak(doc, y);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Timeline Milestone', 15, y);
    y += 8;

    (project.milestones || []).forEach(m => {
      y = this._checkPageBreak(doc, y);
      doc.setFontSize(8);
      doc.setTextColor(m.completed ? 22 : 100, m.completed ? 163 : 116, m.completed ? 74 : 139);
      doc.text((m.completed ? '[x] ' : '[ ] ') + App.formatDate(m.date) + ' - ' + m.title, 17, y);
      y += 5;
    });

    this._footer(doc);
    doc.save(`Piano-Implementazione-${project.clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    App.showToast('Piano di implementazione generato', 'success');
    } catch (err) { console.error('Errore Piano PDF:', err); App.showToast('Errore generazione PDF: ' + err.message, 'error'); }
  },

  // ===========================================================
  // EXECUTIVE SUMMARY
  // ===========================================================
  executiveSummary(project) {
    try {
    const doc = this._initDoc('Executive Summary');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;
    const stats = Store.getProjectStats(project.id);

    let y = this._header(doc, 'Executive Summary', 'Riepilogo per la Direzione', project);

    // Project info
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Cliente: ${project.clientName}`, 15, y); y += 5;
    doc.text(`Normativa: ${cert.name}`, 15, y); y += 5;
    doc.text(`Fase: ${App.phaseLabel(project.phase)}`, 15, y); y += 5;
    doc.text(`Target certificazione: ${App.formatDate(project.targetDate)}`, 15, y); y += 5;
    const daysLeft = App.daysUntil(project.targetDate);
    if (daysLeft !== null) {
      doc.text(`Giorni rimanenti: ${daysLeft > 0 ? daysLeft : 'SCADUTO'}`, 15, y); y += 5;
    }
    y += 5;

    if (stats) {
      // Big numbers
      doc.setFontSize(14);
      doc.setTextColor(...this._primaryRGB());
      doc.text(`${stats.compliancePercent}%`, 15, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Conformità complessiva', 35, y);
      y += 8;

      doc.setFontSize(14);
      doc.setTextColor(...this._primaryRGB());
      doc.text(`${stats.progressPercent}%`, 15, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Progresso complessivo', 35, y);
      y += 12;

      // Per-clause summary
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Stato per Clausola', 15, y);
      y += 8;

      for (const [num, cs] of Object.entries(stats.byClauses)) {
        y = this._checkPageBreak(doc, y);
        const applicable = cs.total - cs.notApplicable;
        const progress = applicable > 0 ? Math.round(((cs.implemented + cs.partial * 0.5) / applicable) * 100) : 0;

        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(`Cl. ${num} - ${cs.title}`, 15, y);

        // Mini progress bar
        doc.setFillColor(226, 232, 240);
        doc.rect(130, y - 3, 40, 4, 'F');
        if (progress > 0) {
          const [pr, pg, pb] = this._primaryRGB();
          doc.setFillColor(progress === 100 ? 22 : pr, progress === 100 ? 163 : pg, progress === 100 ? 74 : pb);
          doc.rect(130, y - 3, 40 * progress / 100, 4, 'F');
        }
        doc.text(`${progress}%`, 175, y);
        y += 7;
      }
    }

    this._footer(doc);
    doc.save(`Executive-Summary-${project.clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    App.showToast('Executive Summary generato', 'success');
    } catch (err) { console.error('Errore Executive Summary PDF:', err); App.showToast('Errore generazione PDF: ' + err.message, 'error'); }
  },

  // ===========================================================
  // DOCUMENTS CHECKLIST
  // ===========================================================
  docsChecklist(project) {
    try {
    const doc = this._initDoc('Checklist Documenti');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    let y = this._header(doc, 'Checklist Documenti Obbligatori', cert.name, project);

    const mandatory = [
      { name: 'Campo di applicazione del SGQ', req: '4.3' },
      { name: 'Politica per la qualità', req: '5.2' },
      { name: 'Obiettivi per la qualità', req: '6.2' },
      { name: 'Evidenze di competenza', req: '7.2' },
      { name: 'Procedura gestione informazioni documentate', req: '7.5' },
      { name: 'Procedura audit interni', req: '9.2' },
      { name: 'Registrazioni riesame di direzione', req: '9.3' },
      { name: 'Registrazioni non conformità e azioni correttive', req: '10.2' }
    ];

    const docNames = (project.documents || []).map(d => d.name.toLowerCase());

    doc.setFontSize(10);
    mandatory.forEach(m => {
      y = this._checkPageBreak(doc, y);
      const exists = docNames.some(dn => dn.includes(m.name.toLowerCase().substring(0, 15)));
      doc.setTextColor(exists ? 22 : 220, exists ? 163 : 38, exists ? 74 : 38);
      doc.text(exists ? '[x]' : '[ ]', 15, y);
      doc.setTextColor(30, 41, 59);
      doc.text(m.name, 25, y);
      doc.setTextColor(100, 116, 139);
      doc.text(`(Rif. ${m.req})`, 170, y);
      y += 7;
    });

    // All project documents
    y += 10;
    y = this._checkPageBreak(doc, y);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Documenti Registrati nel Progetto', 15, y);
    y += 8;

    if (project.documents?.length) {
      project.documents.forEach(d => {
        y = this._checkPageBreak(doc, y);
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`${d.code || '-'} | ${d.name} | v${d.version || '1.0'} | ${App.formatDate(d.issueDate)} | ${d.status === 'approved' ? 'Approvato' : d.status === 'draft' ? 'Bozza' : 'Obsoleto'}`, 15, y);
        y += 5;
      });
    } else {
      doc.setFontSize(9);
      doc.text('Nessun documento registrato.', 15, y);
    }

    this._footer(doc);
    doc.save(`Checklist-Documenti-${project.clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    App.showToast('Checklist documenti generata', 'success');
    } catch (err) { console.error('Errore Checklist PDF:', err); App.showToast('Errore generazione PDF: ' + err.message, 'error'); }
  },

  // ===========================================================
  // NC REGISTER
  // ===========================================================
  ncRegister(project) {
    try {
    const doc = this._initDoc('Registro NC');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    let y = this._header(doc, 'Registro Non Conformità', cert.name, project);

    const allReqs = flattenRequirements(cert.clauses);
    const ncReqs = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && ev.status === 'not_implemented';
    });

    if (ncReqs.length === 0) {
      doc.setFontSize(10);
      doc.text('Nessuna non conformità registrata.', 15, y);
    } else {
      doc.setFontSize(9);
      doc.text(`Totale non conformità: ${ncReqs.length}`, 15, y);
      y += 10;

      ncReqs.forEach((req, idx) => {
        y = this._checkPageBreak(doc, y);
        const ev = project.evaluations[req.id];

        doc.setFillColor(254, 242, 242);
        doc.rect(15, y - 4, 180, 8, 'F');
        doc.setFontSize(10);
        doc.setTextColor(185, 28, 28);
        doc.text(`NC-${String(idx + 1).padStart(3, '0')}: ${req.id} - ${req.title}`, 17, y + 1);
        y += 12;

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        if (ev.notes) {
          doc.text('Descrizione: ' + ev.notes, 17, y);
          y += 5;
        }
        doc.text('Priorità: ' + App.priorityLabel(ev.priority), 17, y);
        doc.text('Responsabile: ' + (ev.responsible || '-'), 80, y);
        doc.text('Scadenza: ' + (ev.deadline ? App.formatDate(ev.deadline) : '-'), 140, y);
        y += 5;

        if (ev.actions?.length) {
          doc.text('Azioni correttive:', 17, y); y += 4;
          ev.actions.forEach(a => {
            y = this._checkPageBreak(doc, y);
            doc.text((a.done ? '[x] ' : '[ ] ') + a.text, 20, y);
            y += 4;
          });
        }
        y += 5;
      });
    }

    this._footer(doc);
    doc.save(`Registro-NC-${project.clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    App.showToast('Registro NC generato', 'success');
    } catch (err) { console.error('Errore Registro NC PDF:', err); App.showToast('Errore generazione PDF: ' + err.message, 'error'); }
  },

  // ===========================================================
  // HELPER: Load logo as base64 for cover pages
  // ===========================================================
  async _loadLogoBase64() {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = '/img/logo.png';
    });
  },

  // Cover page for guides
  async _guideCover(doc, title, subtitle) {
    const logoData = await this._loadLogoBase64();

    // Full-page background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, 'F');

    // Top accent bar
    doc.setFillColor(...this._primaryRGB());
    doc.rect(0, 0, 210, 6, 'F');

    // Logo centered
    if (logoData) {
      doc.addImage(logoData, 'PNG', 75, 50, 60, 60);
    }

    // Title
    doc.setFontSize(28);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 105, 135, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 105, 148, { align: 'center' });

    // App name
    doc.setFontSize(12);
    doc.setTextColor(...this._primaryRGB());
    doc.text('Trust ISO Tracking System', 105, 170, { align: 'center' });

    // Version
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Versione beta', 105, 180, { align: 'center' });

    // Generation date
    doc.text('Generato il ' + new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }), 105, 195, { align: 'center' });

    // Bottom accent bar
    doc.setFillColor(...this._primaryRGB());
    doc.rect(0, 291, 210, 6, 'F');
  },

  // Section title helper for guides
  _guideSection(doc, y, title) {
    y = this._checkPageBreak(doc, y, 240);
    doc.setFillColor(...this._primaryRGB());
    doc.rect(15, y - 4, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(title, 17, y + 1);
    doc.setTextColor(30, 41, 59);
    return y + 14;
  },

  // Subsection title helper
  _guideSubsection(doc, y, title) {
    y = this._checkPageBreak(doc, y);
    doc.setFontSize(11);
    doc.setTextColor(...this._primaryRGB());
    doc.text(title, 15, y);
    doc.setTextColor(30, 41, 59);
    return y + 7;
  },

  // Paragraph helper
  _guideParagraph(doc, y, text, indent = 15) {
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(text, 195 - indent);
    lines.forEach(line => {
      y = this._checkPageBreak(doc, y);
      doc.text(line, indent, y);
      y += 4.5;
    });
    return y + 2;
  },

  // Bullet point helper
  _guideBullet(doc, y, text, indent = 20) {
    y = this._checkPageBreak(doc, y);
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('\u2022', indent - 4, y);
    const lines = doc.splitTextToSize(text, 195 - indent);
    lines.forEach((line, i) => {
      if (i > 0) y = this._checkPageBreak(doc, y);
      doc.text(line, indent, y);
      y += 4.5;
    });
    return y;
  },

  // ===========================================================
  // GUIDA UTENTE
  // ===========================================================
  async userGuide() {
    try {
      const doc = this._initDoc('Guida Utente');

      // Cover page
      await this._guideCover(doc, 'Guida Utente', 'Manuale operativo per l\'utilizzo del sistema');

      // --- Page 2: Table of contents ---
      doc.addPage();
      let y = 25;
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Indice', 15, y);
      y += 12;

      const tocItems = [
        '1. Introduzione',
        '2. Accesso al sistema',
        '3. Dashboard',
        '4. Gestione Progetti',
        '5. Gap Analysis',
        '6. Valutazione Requisiti',
        '7. Gestione Documenti',
        '8. Timeline e Milestone',
        '9. Report e PDF',
        '10. Impostazioni',
        '11. Ricerca rapida',
        '12. Import / Export dati'
      ];

      tocItems.forEach(item => {
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(item, 20, y);
        y += 7;
      });

      // --- Content ---
      doc.addPage();
      y = 20;

      // 1. Introduzione
      y = this._guideSection(doc, y, '1. Introduzione');
      y = this._guideParagraph(doc, y,
        'Trust ISO Tracking System e\u0300 un\u0027applicazione web progettata per supportare consulenti e aziende nella gestione del percorso di certificazione ISO 9001:2015. Il sistema permette di monitorare lo stato di conformita\u0300 di ogni requisito, gestire la documentazione e generare report professionali.');
      y = this._guideParagraph(doc, y,
        'L\u0027applicazione e\u0300 accessibile da qualsiasi browser moderno (Chrome, Firefox, Safari, Edge) sia da desktop che da dispositivo mobile.');

      // 2. Accesso al sistema
      y = this._guideSection(doc, y, '2. Accesso al sistema');
      y = this._guideSubsection(doc, y, 'Registrazione');
      y = this._guideParagraph(doc, y,
        'Per creare un nuovo account, clicca sulla tab "Registrati" nella pagina di login. Inserisci nome, email e una password sicura (minimo 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo). Dopo la registrazione, il tuo account dovra\u0300 essere approvato da un amministratore prima di poter accedere.');
      y = this._guideSubsection(doc, y, 'Login');
      y = this._guideParagraph(doc, y,
        'Inserisci email e password nella pagina di accesso. Se il login ha successo, verrai reindirizzato alla Dashboard principale. Usa l\u0027icona occhio per visualizzare la password durante la digitazione.');
      y = this._guideSubsection(doc, y, 'Cambio password');
      y = this._guideParagraph(doc, y,
        'Puoi cambiare la tua password in qualsiasi momento dalla sezione Impostazioni. Se il tuo account e\u0300 stato creato dall\u0027amministratore con password temporanea, ti verra\u0300 chiesto di cambiarla al primo accesso.');

      // 3. Dashboard
      doc.addPage();
      y = 20;
      y = this._guideSection(doc, y, '3. Dashboard');
      y = this._guideParagraph(doc, y,
        'La Dashboard mostra una panoramica completa dello stato del progetto attivo:');
      y = this._guideBullet(doc, y, 'Percentuale di conformita\u0300: requisiti completamente implementati rispetto al totale applicabile');
      y = this._guideBullet(doc, y, 'Percentuale di progresso: include anche i requisiti parzialmente implementati (contati al 50%)');
      y = this._guideBullet(doc, y, 'Numero di criticita\u0300: requisiti marcati come "non implementati"');
      y = this._guideBullet(doc, y, 'Giorni alla scadenza: countdown verso la data target di certificazione');
      y = this._guideBullet(doc, y, 'Grafico progresso per clausola: barre di avanzamento per ciascuna clausola ISO');
      y = this._guideBullet(doc, y, 'Distribuzione stato requisiti: riepilogo visuale per stato');
      y = this._guideBullet(doc, y, 'Requisiti critici: elenco delle non conformita\u0300 ad alta priorita\u0300');
      y = this._guideBullet(doc, y, 'Prossime scadenze: milestone imminenti');

      // 4. Gestione Progetti
      y += 4;
      y = this._guideSection(doc, y, '4. Gestione Progetti');
      y = this._guideParagraph(doc, y,
        'Dalla sezione "Progetti" puoi visualizzare tutti i tuoi progetti di certificazione e crearne di nuovi.');
      y = this._guideSubsection(doc, y, 'Creare un progetto');
      y = this._guideBullet(doc, y, 'Clicca "Nuovo Progetto" nella lista progetti');
      y = this._guideBullet(doc, y, 'Inserisci il nome del cliente, seleziona la certificazione (ISO 9001:2015)');
      y = this._guideBullet(doc, y, 'Imposta la fase corrente (Gap Analysis, Implementazione, Pre-Audit, Audit, Certificato)');
      y = this._guideBullet(doc, y, 'Opzionale: imposta una data target per la certificazione');
      y = this._guideSubsection(doc, y, 'Passare da un progetto all\u0027altro');
      y = this._guideParagraph(doc, y,
        'Clicca sulla card di un progetto nella lista per attivarlo. Il progetto attivo viene mostrato nell\u0027header e nella sidebar. La Dashboard e la Gap Analysis si riferiscono sempre al progetto attivo.');

      // 5. Gap Analysis
      doc.addPage();
      y = 20;
      y = this._guideSection(doc, y, '5. Gap Analysis');
      y = this._guideParagraph(doc, y,
        'La Gap Analysis e\u0300 il cuore del sistema. Nella sidebar trovi l\u0027elenco delle clausole ISO (da 4 a 10) con la percentuale di completamento. Clicca su una clausola per vedere tutti i requisiti contenuti.');
      y = this._guideParagraph(doc, y,
        'Per ciascun requisito viene mostrato: stato attuale (icona colorata), titolo, testo normativo e, se presenti, note e azioni correttive.');

      // 6. Valutazione Requisiti
      y = this._guideSection(doc, y, '6. Valutazione Requisiti');
      y = this._guideParagraph(doc, y,
        'Clicca su un requisito dalla vista clausola per aprire la scheda di valutazione dettagliata. In questa scheda puoi:');
      y = this._guideBullet(doc, y, 'Stato: seleziona tra Implementato, Parziale, Non implementato, Non applicabile, Non valutato');
      y = this._guideBullet(doc, y, 'Priorita\u0300: imposta Alta, Media o Bassa');
      y = this._guideBullet(doc, y, 'Responsabile: indica chi e\u0300 incaricato della conformita\u0300');
      y = this._guideBullet(doc, y, 'Scadenza: imposta una data entro cui completare l\u0027adeguamento');
      y = this._guideBullet(doc, y, 'Note: aggiungi osservazioni o descrizioni della situazione');
      y = this._guideBullet(doc, y, 'Azioni correttive: aggiungi una checklist di azioni da completare');
      y = this._guideBullet(doc, y, 'Evidenze: aggiungi note sulle evidenze documentali raccolte');
      y = this._guideBullet(doc, y, 'Note audit: osservazioni per gli auditor');
      y = this._guideParagraph(doc, y,
        'Ogni modifica viene salvata automaticamente al click su "Salva valutazione". Lo storico delle modifiche e\u0300 tracciato automaticamente nel changelog.');

      // 7. Documenti
      doc.addPage();
      y = 20;
      y = this._guideSection(doc, y, '7. Gestione Documenti');
      y = this._guideParagraph(doc, y,
        'La sezione Documenti permette di registrare e tracciare la documentazione del Sistema di Gestione Qualita\u0300. Per ogni documento puoi specificare:');
      y = this._guideBullet(doc, y, 'Codice identificativo (es. PQ-001)');
      y = this._guideBullet(doc, y, 'Nome del documento');
      y = this._guideBullet(doc, y, 'Versione corrente');
      y = this._guideBullet(doc, y, 'Data di emissione');
      y = this._guideBullet(doc, y, 'Stato: Bozza, Approvato, Obsoleto');

      // 8. Timeline
      y = this._guideSection(doc, y, '8. Timeline e Milestone');
      y = this._guideParagraph(doc, y,
        'La Timeline mostra le milestone del progetto in ordine cronologico. Puoi aggiungere nuove milestone con titolo e data, marcarle come completate, e rimuoverle. Le milestone sono visibili anche nella Dashboard e nei report PDF.');

      // 9. Report
      y = this._guideSection(doc, y, '9. Report e PDF');
      y = this._guideParagraph(doc, y,
        'La sezione Report offre la generazione di documenti PDF professionali:');
      y = this._guideBullet(doc, y, 'Gap Analysis: report completo di tutti i requisiti con stato, note e azioni');
      y = this._guideBullet(doc, y, 'Piano di Implementazione: azioni correttive pianificate con responsabili e scadenze');
      y = this._guideBullet(doc, y, 'Executive Summary: riepilogo per la direzione con percentuali e grafici');
      y = this._guideBullet(doc, y, 'Checklist Documenti: stato dei documenti obbligatori ISO 9001');
      y = this._guideBullet(doc, y, 'Registro NC: elenco delle non conformita\u0300 con dettagli');

      // 10. Impostazioni
      y += 4;
      y = this._guideSection(doc, y, '10. Impostazioni');
      y = this._guideParagraph(doc, y,
        'Dalla sezione Impostazioni puoi personalizzare il tema colore dell\u0027applicazione scegliendo tra diversi schemi cromatici. Puoi anche cambiare la tua password e scaricare le guide PDF.');

      // 11. Ricerca
      doc.addPage();
      y = 20;
      y = this._guideSection(doc, y, '11. Ricerca Rapida');
      y = this._guideParagraph(doc, y,
        'Il campo di ricerca nell\u0027header permette di trovare rapidamente qualsiasi requisito per codice (es. "4.1"), titolo o testo normativo. I risultati appaiono in tempo reale e con un click puoi aprire la scheda del requisito.');

      // 12. Import/Export
      y = this._guideSection(doc, y, '12. Import / Export Dati');
      y = this._guideParagraph(doc, y,
        'Dall\u0027header puoi esportare tutti i dati in formato JSON come backup, e reimportarli successivamente. Questo e\u0300 utile per trasferire dati tra installazioni o per creare copie di sicurezza.');

      this._footer(doc);
      doc.save('Guida-Utente-Trust-ISO.pdf');
      App.showToast('Guida utente generata', 'success');
    } catch (err) {
      console.error('Errore Guida Utente PDF:', err);
      App.showToast('Errore generazione PDF: ' + err.message, 'error');
    }
  },

  // ===========================================================
  // GUIDA AMMINISTRATORE
  // ===========================================================
  async adminGuide() {
    try {
      const doc = this._initDoc('Guida Amministratore');

      // Cover page
      await this._guideCover(doc, 'Guida Amministratore', 'Manuale per la gestione e amministrazione del sistema');

      // Table of contents
      doc.addPage();
      let y = 25;
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Indice', 15, y);
      y += 12;

      const tocItems = [
        '1. Panoramica ruolo amministratore',
        '2. Primo accesso e configurazione',
        '3. Gestione utenti',
        '4. Approvazione nuovi utenti',
        '5. Promozione e retrocessione ruoli',
        '6. Eliminazione utenti',
        '7. Gestione progetti multi-utente',
        '8. Backup e ripristino dati',
        '9. Sicurezza e best practice',
        '10. Deployment e manutenzione'
      ];

      tocItems.forEach(item => {
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(item, 20, y);
        y += 7;
      });

      // Content
      doc.addPage();
      y = 20;

      // 1. Panoramica
      y = this._guideSection(doc, y, '1. Panoramica ruolo amministratore');
      y = this._guideParagraph(doc, y,
        'L\u0027amministratore ha accesso completo a tutte le funzionalita\u0300 del sistema, inclusa la gestione degli utenti. Oltre alle funzioni standard (progetti, gap analysis, report), l\u0027admin puo\u0300:');
      y = this._guideBullet(doc, y, 'Approvare o rifiutare nuove registrazioni');
      y = this._guideBullet(doc, y, 'Promuovere utenti standard ad amministratori');
      y = this._guideBullet(doc, y, 'Retrocedere amministratori a utenti standard');
      y = this._guideBullet(doc, y, 'Eliminare account utente');
      y = this._guideBullet(doc, y, 'Visualizzare l\u0027elenco completo degli utenti registrati');

      // 2. Primo accesso
      y = this._guideSection(doc, y, '2. Primo accesso e configurazione');
      y = this._guideParagraph(doc, y,
        'Il primo utente che si registra nel sistema diventa automaticamente amministratore con accesso immediato (senza necessita\u0300 di approvazione). Tutti gli utenti successivi saranno registrati come "utente standard" in stato "In attesa di approvazione".');
      y = this._guideParagraph(doc, y,
        'Dopo il primo accesso, si consiglia di:');
      y = this._guideBullet(doc, y, 'Cambiare la password dalla sezione Impostazioni');
      y = this._guideBullet(doc, y, 'Creare il primo progetto di certificazione');
      y = this._guideBullet(doc, y, 'Configurare il tema colore preferito');

      // 3. Gestione utenti
      y = this._guideSection(doc, y, '3. Gestione utenti');
      y = this._guideParagraph(doc, y,
        'La sezione "Gestione Utenti" e\u0300 accessibile dalla sidebar ed e\u0300 visibile solo agli amministratori. Mostra una tabella con tutti gli utenti registrati, con le seguenti informazioni per ciascuno:');
      y = this._guideBullet(doc, y, 'Nome e indirizzo email');
      y = this._guideBullet(doc, y, 'Ruolo: Admin o Utente');
      y = this._guideBullet(doc, y, 'Stato approvazione: Approvato o In attesa');
      y = this._guideBullet(doc, y, 'Data di registrazione');
      y = this._guideBullet(doc, y, 'Azioni disponibili (approva, promuovi/retrocedi, elimina)');

      // 4. Approvazione
      doc.addPage();
      y = 20;
      y = this._guideSection(doc, y, '4. Approvazione nuovi utenti');
      y = this._guideParagraph(doc, y,
        'Quando un nuovo utente si registra, il suo account viene creato in stato "In attesa di approvazione". L\u0027utente vedra\u0300 un messaggio che lo informa dell\u0027attesa. Per approvare un utente:');
      y = this._guideBullet(doc, y, 'Vai in "Gestione Utenti" dalla sidebar');
      y = this._guideBullet(doc, y, 'Individua l\u0027utente con badge "In attesa"');
      y = this._guideBullet(doc, y, 'Clicca il pulsante verde "Approva"');
      y = this._guideParagraph(doc, y,
        'Dopo l\u0027approvazione, l\u0027utente potra\u0300 accedere al sistema con le proprie credenziali.');

      // 5. Promozione/retrocessione
      y = this._guideSection(doc, y, '5. Promozione e retrocessione ruoli');
      y = this._guideParagraph(doc, y,
        'Un amministratore puo\u0300 promuovere un utente standard ad amministratore o retrocedere un altro amministratore a utente standard.');
      y = this._guideSubsection(doc, y, 'Promuovere ad admin');
      y = this._guideBullet(doc, y, 'Nella tabella utenti, clicca il pulsante viola "Promuovi Admin"');
      y = this._guideBullet(doc, y, 'Conferma l\u0027operazione nella finestra di dialogo');
      y = this._guideSubsection(doc, y, 'Retrocedere a utente');
      y = this._guideBullet(doc, y, 'Nella tabella utenti, clicca il pulsante grigio "Retrocedi"');
      y = this._guideBullet(doc, y, 'Conferma l\u0027operazione nella finestra di dialogo');
      y = this._guideParagraph(doc, y,
        'Nota: non e\u0300 possibile modificare il proprio ruolo. Per motivi di sicurezza, un admin non puo\u0300 retrocedere se stesso.');

      // 6. Eliminazione
      y = this._guideSection(doc, y, '6. Eliminazione utenti');
      y = this._guideParagraph(doc, y,
        'Per eliminare un utente, clicca il pulsante rosso "Elimina" nella riga corrispondente e conferma. L\u0027eliminazione e\u0300 irreversibile. Non e\u0300 possibile eliminare il proprio account ne\u0300 eliminare altri amministratori (devono prima essere retrocessi a utente standard).');

      // 7. Multi-utente
      doc.addPage();
      y = 20;
      y = this._guideSection(doc, y, '7. Gestione progetti multi-utente');
      y = this._guideParagraph(doc, y,
        'Ogni utente ha i propri progetti separati. L\u0027amministratore gestisce i propri progetti come qualsiasi altro utente. I progetti non sono condivisi tra utenti, ma i dati sono tutti nello stesso database e accessibili dall\u0027amministratore del server.');

      // 8. Backup
      y = this._guideSection(doc, y, '8. Backup e ripristino dati');
      y = this._guideParagraph(doc, y,
        'Il sistema utilizza un database SQLite salvato come singolo file sul server. Per il backup:');
      y = this._guideBullet(doc, y, 'Export JSON: usa il pulsante di esportazione nell\u0027header per scaricare i tuoi progetti in formato JSON');
      y = this._guideBullet(doc, y, 'Backup database: copia il file db.sqlite dal volume Docker per un backup completo');
      y = this._guideBullet(doc, y, 'Import JSON: usa il pulsante di importazione per caricare un backup JSON precedente');

      // 9. Sicurezza
      y = this._guideSection(doc, y, '9. Sicurezza e best practice');
      y = this._guideBullet(doc, y, 'Usa password complesse (almeno 8 caratteri, maiuscola, numero, simbolo)');
      y = this._guideBullet(doc, y, 'Approva solo utenti che conosci e che hanno necessita\u0300 di accesso');
      y = this._guideBullet(doc, y, 'Limita il numero di amministratori al minimo necessario');
      y = this._guideBullet(doc, y, 'Esegui backup regolari del database');
      y = this._guideBullet(doc, y, 'Mantieni aggiornato il JWT_SECRET nel file di configurazione');
      y = this._guideBullet(doc, y, 'Utilizza HTTPS per l\u0027accesso al sistema in produzione');

      // 10. Deployment
      y = this._guideSection(doc, y, '10. Deployment e manutenzione');
      y = this._guideParagraph(doc, y,
        'Il sistema e\u0300 distribuito come container Docker. La configurazione avviene tramite variabili di ambiente:');
      y = this._guideBullet(doc, y, 'JWT_SECRET: chiave segreta per i token di autenticazione');
      y = this._guideBullet(doc, y, 'DB_PATH: percorso del file database SQLite (default: /data/db.sqlite)');
      y = this._guideBullet(doc, y, 'PORT: porta del server (default: 3002)');
      y = this._guideParagraph(doc, y,
        'Il database viene creato automaticamente al primo avvio se non esiste. Per resettare il sistema, eliminare il file database e riavviare il container.');

      this._footer(doc);
      doc.save('Guida-Amministratore-Trust-ISO.pdf');
      App.showToast('Guida amministratore generata', 'success');
    } catch (err) {
      console.error('Errore Guida Admin PDF:', err);
      App.showToast('Errore generazione PDF: ' + err.message, 'error');
    }
  }
};

// ===========================================================
// GUIDE EXPORT - Markdown format
// ===========================================================
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
- ✅ **Implementato**: il requisito è pienamente soddisfatto
- ⚠️ **Parzialmente implementato**: conformità parziale
- ❌ **Non implementato**: non conforme
- ➖ **Non applicabile**: il requisito non si applica (con giustificazione)
- ❓ **Non valutato**: da valutare

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
