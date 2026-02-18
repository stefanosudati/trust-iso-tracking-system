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
        ['% Conformita', stats.compliancePercent + '%'],
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
  },

  // ===========================================================
  // IMPLEMENTATION PLAN
  // ===========================================================
  implementationPlan(project) {
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
      doc.text('Priorita', 185, y);
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
  },

  // ===========================================================
  // EXECUTIVE SUMMARY
  // ===========================================================
  executiveSummary(project) {
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
      doc.text('Conformita complessiva', 35, y);
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
  },

  // ===========================================================
  // DOCUMENTS CHECKLIST
  // ===========================================================
  docsChecklist(project) {
    const doc = this._initDoc('Checklist Documenti');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    let y = this._header(doc, 'Checklist Documenti Obbligatori', cert.name, project);

    const mandatory = [
      { name: 'Campo di applicazione del SGQ', req: '4.3' },
      { name: 'Politica per la qualita', req: '5.2' },
      { name: 'Obiettivi per la qualita', req: '6.2' },
      { name: 'Evidenze di competenza', req: '7.2' },
      { name: 'Procedura gestione informazioni documentate', req: '7.5' },
      { name: 'Procedura audit interni', req: '9.2' },
      { name: 'Registrazioni riesame di direzione', req: '9.3' },
      { name: 'Registrazioni non conformita e azioni correttive', req: '10.2' }
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
  },

  // ===========================================================
  // NC REGISTER
  // ===========================================================
  ncRegister(project) {
    const doc = this._initDoc('Registro NC');
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    let y = this._header(doc, 'Registro Non Conformita', cert.name, project);

    const allReqs = flattenRequirements(cert.clauses);
    const ncReqs = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && ev.status === 'not_implemented';
    });

    if (ncReqs.length === 0) {
      doc.setFontSize(10);
      doc.text('Nessuna non conformita registrata.', 15, y);
    } else {
      doc.setFontSize(9);
      doc.text(`Totale non conformita: ${ncReqs.length}`, 15, y);
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
        doc.text('Priorita: ' + App.priorityLabel(ev.priority), 17, y);
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
  }
};
