/**
 * Views facade — delegates to individual view modules.
 * Maintains backward compatibility with App.renderMainContent()
 * which calls Views.dashboard(), Views.bindDashboard(), etc.
 */
const Views = {
  // Dashboard
  dashboard: (project) => DashboardView.dashboard(project),
  bindDashboard: () => DashboardView.bindDashboard(),

  // Projects
  projectList: () => ProjectsView.projectList(),
  bindProjectList: () => ProjectsView.bindProjectList(),
  projectForm: (project) => ProjectsView.projectForm(project),
  bindProjectForm: (project) => ProjectsView.bindProjectForm(project),

  // Project Detail
  projectDetail: (project) => ProjectDetailView.projectDetail(project),
  bindProjectDetail: (project) => ProjectDetailView.bindProjectDetail(project),

  // Clause
  clauseView: (project, clause) => ClauseView.clauseView(project, clause),
  bindClauseView: (project, clause) => ClauseView.bindClauseView(project, clause),

  // Requirement
  requirementDetail: (project, reqId) => RequirementView.requirementDetail(project, reqId),
  bindRequirementDetail: (project, reqId) => RequirementView.bindRequirementDetail(project, reqId),

  // Documents
  documentManager: (project) => DocumentsView.documentManager(project),
  bindDocumentManager: (project) => DocumentsView.bindDocumentManager(project),

  // Timeline
  timeline: (project) => TimelineView.timeline(project),
  bindTimeline: (project) => TimelineView.bindTimeline(project),

  // Reports
  reports: (project) => ReportsView.reports(project),
  bindReports: (project) => ReportsView.bindReports(project),

  // Settings
  settings: () => SettingsView.settings(),
  bindSettings: () => SettingsView.bindSettings(),

  // Admin
  adminUsers: (users) => AdminView.adminUsers(users),
  bindAdminUsers: () => AdminView.bindAdminUsers(),

  // Shared helpers
  _flattenClauseRequirements: (clause) => ClauseView._flattenClauseRequirements(clause),

  // Changelog helpers (used by project-detail-view, requirement-view, and others via Views._fieldLabel etc.)
  _fieldLabel(field) {
    const labels = {
      status: 'Stato',
      notes: 'Note',
      priority: 'Priorità',
      responsible: 'Responsabile',
      deadline: 'Scadenza',
      actions: 'Azioni Correttive',
      evidenceNotes: 'Evidenze',
      auditNotes: 'Note Audit',
      naJustification: 'Motivazione N/A'
    };
    return labels[field] || field;
  },

  _formatChangeValue(field, value) {
    if (!value || value === '') return '<span class="text-slate-400 italic">vuoto</span>';
    if (field === 'status') return App.statusLabel(value);
    if (field === 'priority') return App.priorityLabel(value);
    if (field === 'deadline') return App.formatDate(value);
    if (field === 'actions') {
      try { const arr = JSON.parse(value); return arr.length + ' azione/i'; }
      catch (_e) { return value; }
    }
    if (field === 'evidenceNotes') {
      try { const arr = JSON.parse(value); return arr.length + ' evidenza/e'; }
      catch (_e) { return value; }
    }
    return value.length > 80 ? value.substring(0, 80) + '…' : value;
  },

  _renderChangelogEntries(entries) {
    if (!entries || entries.length === 0) {
      return '<div class="text-sm text-slate-400 text-center py-8">Nessuna modifica registrata</div>';
    }

    let currentDate = '';
    let html = '';

    for (const entry of entries) {
      const entryDate = App.formatDate(entry.created_at);
      if (entryDate !== currentDate) {
        currentDate = entryDate;
        html += `<div class="text-xs font-semibold text-slate-500 mt-4 mb-2 first:mt-0">${entryDate}</div>`;
      }
      const time = new Date(entry.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      html += `
        <div class="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium" style="color: var(--primary-text);">${entry.user_name}</span>
            <span class="text-xs text-slate-400">${time}</span>
          </div>
          <div class="text-sm text-slate-700">
            <span class="font-medium">${this._fieldLabel(entry.field)}</span>
          </div>
          <div class="flex items-center gap-2 mt-1 text-xs">
            <span class="text-slate-500">${this._formatChangeValue(entry.field, entry.old_value)}</span>
            <i data-lucide="arrow-right" class="w-3 h-3 text-slate-400 flex-shrink-0"></i>
            <span class="font-medium text-slate-700">${this._formatChangeValue(entry.field, entry.new_value)}</span>
          </div>
        </div>`;
    }
    return html;
  },
};
