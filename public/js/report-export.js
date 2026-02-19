/**
 * ReportExport - Generates 5 downloadable Markdown reports for the active project.
 */
const ReportExport = {

  _download(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  _header(project, title) {
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    return `# ${title}

> **Cliente:** ${project.clientName || 'N/D'}
> **Certificazione:** ${cert?.name || 'N/D'}
> **Fase:** ${App.phaseLabel(project.phase)}
> **Data report:** ${today}

---

`;
  },

  gapAnalysis(project) {
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert || !cert.clauses.length) {
      App.showToast('Nessun dato disponibile', 'error');
      return;
    }
    const stats = Store.getProjectStats(project.id);
    let md = this._header(project, 'Report Gap Analysis');

    md += `## Riepilogo

| Indicatore | Valore |
|------------|--------|
| Conformi | ${stats.implemented} |
| Parziali | ${stats.partial} |
| Non conformi | ${stats.notImplemented} |
| Non applicabili | ${stats.notApplicable} |
| Da valutare | ${stats.notEvaluated} |
| **Progresso** | **${stats.progressPercent}%** |

---

`;

    for (const clause of cert.clauses) {
      const reqs = flattenRequirements([clause]);
      md += `## Clausola ${clause.number} — ${clause.title}\n\n`;
      md += `| Req. | Titolo | Stato | Priorita | Note |\n`;
      md += `|------|--------|-------|----------|------|\n`;

      for (const req of reqs) {
        const ev = project.evaluations[req.id] || { ...DEFAULT_EVALUATION };
        const note = (ev.notes || '').replace(/\n/g, ' ').substring(0, 80);
        md += `| ${req.id} | ${req.title} | ${App.statusLabel(ev.status)} | ${App.priorityLabel(ev.priority)} | ${note}${note.length >= 80 ? '...' : ''} |\n`;
      }

      md += '\n';

      // Detail for requirements with actions
      const withActions = reqs.filter(r => {
        const ev = project.evaluations[r.id];
        return ev && ev.actions && ev.actions.length > 0;
      });

      if (withActions.length > 0) {
        md += `### Azioni correttive\n\n`;
        for (const req of withActions) {
          const ev = project.evaluations[req.id];
          md += `**${req.id} — ${req.title}**\n\n`;
          for (const action of ev.actions) {
            const check = action.done ? 'x' : ' ';
            md += `- [${check}] ${action.text}\n`;
          }
          md += '\n';
        }
      }
    }

    this._download(`Gap-Analysis-${project.clientName || 'report'}.md`, md);
    App.showToast('Report Gap Analysis scaricato', 'success');
  },

  implementationPlan(project) {
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert || !cert.clauses.length) {
      App.showToast('Nessun dato disponibile', 'error');
      return;
    }
    let md = this._header(project, 'Piano di Implementazione');

    const allReqs = flattenRequirements(cert.clauses);
    const ncReqs = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && (ev.status === 'not_implemented' || ev.status === 'partial');
    });

    md += `## Requisiti da implementare (${ncReqs.length})\n\n`;

    if (ncReqs.length === 0) {
      md += `Nessuna non conformita o parziale rilevata.\n\n`;
    } else {
      md += `| Req. | Titolo | Stato | Priorita | Responsabile | Scadenza |\n`;
      md += `|------|--------|-------|----------|--------------|----------|\n`;

      for (const req of ncReqs) {
        const ev = project.evaluations[req.id];
        md += `| ${req.id} | ${req.title} | ${App.statusLabel(ev.status)} | ${App.priorityLabel(ev.priority)} | ${ev.responsible || '-'} | ${ev.deadline ? App.formatDate(ev.deadline) : '-'} |\n`;
      }

      md += '\n### Dettaglio azioni\n\n';

      for (const req of ncReqs) {
        const ev = project.evaluations[req.id];
        md += `#### ${req.id} — ${req.title}\n\n`;
        md += `- **Stato:** ${App.statusLabel(ev.status)}\n`;
        md += `- **Priorita:** ${App.priorityLabel(ev.priority)}\n`;
        if (ev.responsible) md += `- **Responsabile:** ${ev.responsible}\n`;
        if (ev.deadline) md += `- **Scadenza:** ${App.formatDate(ev.deadline)}\n`;
        if (ev.notes) md += `- **Note:** ${ev.notes}\n`;

        if (ev.actions && ev.actions.length > 0) {
          md += '\n**Azioni:**\n\n';
          for (const action of ev.actions) {
            const check = action.done ? 'x' : ' ';
            md += `- [${check}] ${action.text}\n`;
          }
        }
        md += '\n';
      }
    }

    // Milestones
    if (project.milestones && project.milestones.length > 0) {
      md += `---\n\n## Milestone\n\n`;
      md += `| Milestone | Data | Stato |\n`;
      md += `|-----------|------|-------|\n`;
      for (const m of project.milestones) {
        const done = m.completed ? 'Completata' : 'In corso';
        md += `| ${m.title} | ${m.date ? App.formatDate(m.date) : '-'} | ${done} |\n`;
      }
      md += '\n';
    }

    this._download(`Piano-Implementazione-${project.clientName || 'report'}.md`, md);
    App.showToast('Piano di Implementazione scaricato', 'success');
  },

  executiveSummary(project) {
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert || !cert.clauses.length) {
      App.showToast('Nessun dato disponibile', 'error');
      return;
    }
    const stats = Store.getProjectStats(project.id);
    let md = this._header(project, 'Executive Summary');

    const applicable = stats.total - stats.notApplicable;
    md += `## Conformita Complessiva

| Metrica | Valore |
|---------|--------|
| Totale requisiti | ${stats.total} |
| Applicabili | ${applicable} |
| % Conformita | ${stats.compliancePercent}% |
| % Progresso | ${stats.progressPercent}% |
| Criticita (NC) | ${stats.notImplemented} |

---

## Breakdown per Clausola

| Clausola | Titolo | Conformi | Parziali | NC | N/A | Da valutare | % |
|----------|--------|----------|----------|-----|-----|-------------|-----|
`;

    for (const clause of cert.clauses) {
      const cs = stats.byClauses[clause.number];
      if (!cs) continue;
      const clauseApplicable = cs.total - cs.notApplicable;
      const pct = clauseApplicable > 0 ? Math.round((cs.implemented / clauseApplicable) * 100) : 0;
      md += `| ${clause.number} | ${clause.title} | ${cs.implemented} | ${cs.partial} | ${cs.notImplemented} | ${cs.notApplicable} | ${cs.notEvaluated} | ${pct}% |\n`;
    }

    md += '\n---\n\n';

    // High priority NC
    const allReqs = flattenRequirements(cert.clauses);
    const highNC = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && ev.status === 'not_implemented' && ev.priority === 'high';
    });

    if (highNC.length > 0) {
      md += `## Criticita ad Alta Priorita (${highNC.length})\n\n`;
      for (const req of highNC) {
        const ev = project.evaluations[req.id];
        md += `- **${req.id} — ${req.title}**`;
        if (ev.notes) md += `: ${ev.notes.replace(/\n/g, ' ').substring(0, 100)}`;
        md += '\n';
      }
      md += '\n';
    }

    this._download(`Executive-Summary-${project.clientName || 'report'}.md`, md);
    App.showToast('Executive Summary scaricato', 'success');
  },

  documentsChecklist(project) {
    let md = this._header(project, 'Checklist Documenti');

    md += `## Documenti Obbligatori ISO 9001:2015\n\n`;
    md += `| Documento | Req. | Presente |\n`;
    md += `|-----------|------|----------|\n`;

    const projectDocs = project.documents || [];
    const docNames = projectDocs.map(d => (d.name || '').toLowerCase());

    for (const doc of MANDATORY_DOCS) {
      const found = docNames.some(n => n.includes(doc.name.toLowerCase().substring(0, 15)));
      md += `| ${doc.name} | ${doc.req} | ${found ? 'Si' : '**NO**'} |\n`;
    }

    md += `\n---\n\n## Documenti Registrati (${projectDocs.length})\n\n`;

    if (projectDocs.length === 0) {
      md += `Nessun documento registrato nel sistema.\n\n`;
    } else {
      md += `| Codice | Nome | Versione | Stato | Data |\n`;
      md += `|--------|------|----------|-------|------|\n`;
      for (const d of projectDocs) {
        md += `| ${d.code || '-'} | ${d.name || '-'} | ${d.version || '-'} | ${d.status || '-'} | ${d.date ? App.formatDate(d.date) : '-'} |\n`;
      }
      md += '\n';
    }

    this._download(`Checklist-Documenti-${project.clientName || 'report'}.md`, md);
    App.showToast('Checklist Documenti scaricata', 'success');
  },

  ncRegister(project) {
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert || !cert.clauses.length) {
      App.showToast('Nessun dato disponibile', 'error');
      return;
    }
    let md = this._header(project, 'Registro Non Conformita');

    const allReqs = flattenRequirements(cert.clauses);
    const ncReqs = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && ev.status === 'not_implemented';
    });

    md += `## Non Conformita Rilevate: ${ncReqs.length}\n\n`;

    if (ncReqs.length === 0) {
      md += `Nessuna non conformita rilevata.\n\n`;
    } else {
      let idx = 1;
      for (const req of ncReqs) {
        const ev = project.evaluations[req.id];
        md += `### NC-${String(idx).padStart(3, '0')} — ${req.id} ${req.title}\n\n`;
        md += `- **Priorita:** ${App.priorityLabel(ev.priority)}\n`;
        if (ev.responsible) md += `- **Responsabile:** ${ev.responsible}\n`;
        if (ev.deadline) md += `- **Scadenza:** ${App.formatDate(ev.deadline)}\n`;
        if (ev.notes) md += `- **Descrizione:** ${ev.notes}\n`;
        if (ev.auditNotes) md += `- **Note audit:** ${ev.auditNotes}\n`;

        if (ev.actions && ev.actions.length > 0) {
          md += '\n**Azioni correttive:**\n\n';
          for (const action of ev.actions) {
            const check = action.done ? 'x' : ' ';
            md += `- [${check}] ${action.text}\n`;
          }
        }

        if (ev.evidenceNotes && ev.evidenceNotes.length > 0) {
          md += '\n**Evidenze:**\n\n';
          for (const note of ev.evidenceNotes) {
            md += `- ${note}\n`;
          }
        }

        md += '\n---\n\n';
        idx++;
      }
    }

    this._download(`Registro-NC-${project.clientName || 'report'}.md`, md);
    App.showToast('Registro NC scaricato', 'success');
  }
};
