/**
 * Trust ISO Tracking System - Main Application Controller
 */
const App = {
  currentView: 'dashboard',
  currentClause: null,
  currentRequirement: null,
  sidebarOpen: true,

  async init() {
    // Apply saved theme immediately (before any rendering)
    ThemeManager.loadFromStorage();

    // Auth gate: show login screen if not authenticated
    if (!ApiClient.isAuthenticated()) {
      AuthUI.render();
      return;
    }

    try {
      // Load all projects from server into cache
      await ApiClient.loadProjects();

      // Restore active project
      const savedId = ApiClient.getActiveProjectId();
      if (savedId) {
        await ApiClient.setActiveProject(savedId);
      }
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    }

    // Show user info in header + sync theme from server
    const user = ApiClient.getUser();
    if (user) {
      const nameEl = document.getElementById('user-name-display');
      const menuEl = document.getElementById('user-menu');
      if (nameEl) nameEl.textContent = user.name || user.email;
      if (menuEl) { menuEl.classList.remove('hidden'); menuEl.classList.add('flex'); }
      if (user.theme) ThemeManager.syncFromUser(user.theme);
    }

    this.bindGlobalEvents();
    this.render();
    this.autoSaveInterval = setInterval(() => this.autoSaveIndicator(), AUTOSAVE_INTERVAL);
  },

  // --- Navigation ---
  navigate(view, params = {}) {
    this.currentView = view;
    Object.assign(this, params);
    this.render();
    // Scroll to top
    document.getElementById('main-content')?.scrollTo(0, 0);
  },

  render() {
    const activeProject = Store.getActiveProject();
    this.renderHeader(activeProject);
    this.renderSidebar(activeProject);
    this.renderMainContent(activeProject);
    this.updateActiveNav();
  },

  // --- Header ---
  renderHeader(project) {
    const headerProject = document.getElementById('header-project-name');
    const headerPhase = document.getElementById('header-phase');
    if (project) {
      headerProject.textContent = project.clientName || 'Progetto senza nome';
      headerPhase.textContent = this.phaseLabel(project.phase);
      headerPhase.className = 'px-3 py-1 rounded-full text-xs font-medium ' + this.phaseColor(project.phase);
      document.getElementById('header-project-info').classList.remove('hidden');
    } else {
      document.getElementById('header-project-info').classList.add('hidden');
    }
  },

  // --- Sidebar ---
  renderSidebar(project) {
    const sidebar = document.getElementById('sidebar');
    const nav = document.getElementById('sidebar-nav');

    // Build navigation items
    let html = '';

    // Dashboard
    html += this.sidebarItem('dashboard', 'Dashboard', 'home', !project);

    // Projects
    html += this.sidebarItem('projects', 'Progetti', 'folder');

    if (project) {
      const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
      if (cert && cert.clauses.length) {
        // Project info
        html += this.sidebarItem('project-detail', 'Dati Progetto', 'clipboard');

        // Divider
        html += '<div class="my-3" style="border-top: 1px solid var(--sidebar-border);"></div>';
        html += '<div class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style="color: var(--sidebar-section);">Gap Analysis</div>';

        // Clauses with progress
        const stats = Store.getProjectStats(project.id);
        for (const clause of cert.clauses) {
          const clauseStats = stats?.byClauses[clause.number];
          const progress = clauseStats ?
            Math.round(((clauseStats.implemented + clauseStats.partial * 0.5) / Math.max(clauseStats.total - clauseStats.notApplicable, 1)) * 100) : 0;

          const clauseActive = this.currentView === 'clause' && this.currentClause === clause.number;
          html += `
            <a href="#" data-view="clause" data-clause="${clause.number}"
               class="sidebar-link group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${clauseActive ? 'font-medium' : ''}"
               style="${clauseActive
                 ? 'background-color: var(--sidebar-active-bg); color: var(--sidebar-active-text);'
                 : 'color: var(--sidebar-text);'}"
               onmouseenter="if(!this.classList.contains('font-medium'))this.style.backgroundColor='var(--sidebar-hover-bg)'"
               onmouseleave="if(!this.classList.contains('font-medium'))this.style.backgroundColor=''">
              <span class="flex-1">
                <span class="font-medium">${clause.number}.</span> ${this.truncate(clause.title, 22)}
              </span>
              <span class="text-xs px-1.5 py-0.5 rounded ${progress === 100 ? 'bg-emerald-100 text-emerald-700' : progress > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}">${progress}%</span>
            </a>`;
        }

        // Divider
        html += '<div class="my-3" style="border-top: 1px solid var(--sidebar-border);"></div>';

        // Documents, Timeline, Reports
        html += this.sidebarItem('documents', 'Documenti', 'file-text');
        html += this.sidebarItem('timeline', 'Timeline', 'calendar');
        html += this.sidebarItem('reports', 'Report', 'bar-chart-2');
      }
    }

    // Admin + Settings (always visible)
    html += '<div class="my-3" style="border-top: 1px solid var(--sidebar-border);"></div>';
    if (ApiClient.getUser()?.role === 'admin') {
      html += this.sidebarItem('admin-users', 'Gestione Utenti', 'users');
    }
    html += this.sidebarItem('settings', 'Impostazioni', 'settings');

    nav.innerHTML = html;

    // Bind sidebar navigation
    nav.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.dataset.view;
        const params = {};
        if (el.dataset.clause) params.currentClause = el.dataset.clause;
        this.navigate(view, params);
      });
    });
  },

  sidebarItem(view, label, icon, badge = false) {
    const active = this.currentView === view;
    return `
      <a href="#" data-view="${view}"
         class="sidebar-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'font-medium' : ''}"
         style="${active
           ? 'background-color: var(--sidebar-active-bg); color: var(--sidebar-active-text);'
           : 'color: var(--sidebar-text);'}"
         onmouseenter="if(!this.classList.contains('font-medium'))this.style.backgroundColor='var(--sidebar-hover-bg)'"
         onmouseleave="if(!this.classList.contains('font-medium'))this.style.backgroundColor=''">
        <i data-lucide="${icon}" class="w-4 h-4" style="color: ${active ? 'var(--sidebar-active-icon)' : 'inherit'};"></i>
        <span class="flex-1">${label}</span>
        ${badge ? '<span class="w-2 h-2 rounded-full" style="background-color: var(--primary);"></span>' : ''}
      </a>`;
  },

  updateActiveNav() {
    // Re-init Lucide icons
    if (window.lucide) lucide.createIcons();
  },

  // --- Main Content Router ---
  renderMainContent(project) {
    const main = document.getElementById('main-content');
    switch (this.currentView) {
      case 'dashboard':
        main.innerHTML = Views.dashboard(project);
        Views.bindDashboard();
        break;
      case 'projects':
        main.innerHTML = Views.projectList();
        Views.bindProjectList();
        break;
      case 'new-project':
        main.innerHTML = Views.projectForm();
        Views.bindProjectForm();
        break;
      case 'edit-project':
        main.innerHTML = Views.projectForm(project);
        Views.bindProjectForm(project);
        break;
      case 'project-detail':
        main.innerHTML = Views.projectDetail(project);
        Views.bindProjectDetail(project);
        break;
      case 'clause':
        main.innerHTML = Views.clauseView(project, this.currentClause);
        Views.bindClauseView(project, this.currentClause);
        break;
      case 'requirement':
        main.innerHTML = Views.requirementDetail(project, this.currentRequirement);
        Views.bindRequirementDetail(project, this.currentRequirement);
        break;
      case 'documents':
        main.innerHTML = Views.documentManager(project);
        Views.bindDocumentManager(project);
        break;
      case 'timeline':
        main.innerHTML = Views.timeline(project);
        Views.bindTimeline(project);
        break;
      case 'reports':
        main.innerHTML = Views.reports(project);
        Views.bindReports(project);
        break;
      case 'settings':
        main.innerHTML = Views.settings();
        Views.bindSettings();
        break;
      case 'admin-users':
        (async () => {
          main.innerHTML = '<div class="p-6 text-slate-400">Caricamento utenti...</div>';
          try {
            const users = await ApiClient.getUsers();
            main.innerHTML = Views.adminUsers(users);
            Views.bindAdminUsers();
            if (window.lucide) lucide.createIcons();
          } catch (err) {
            main.innerHTML = '<div class="p-6 text-red-500">Errore: ' + err.message + '</div>';
          }
        })();
        break;
      default:
        main.innerHTML = Views.dashboard(project);
        Views.bindDashboard();
    }
    if (window.lucide) lucide.createIcons();
  },

  // --- Global Events ---
  bindGlobalEvents() {
    // Toggle sidebar
    document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
      this.sidebarOpen = !this.sidebarOpen;
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar.classList.toggle('-translate-x-full', !this.sidebarOpen);
      sidebar.classList.toggle('translate-x-0', this.sidebarOpen);
      overlay.classList.toggle('hidden', !this.sidebarOpen);
    });

    // Mobile sidebar overlay
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      this.sidebarOpen = false;
      document.getElementById('sidebar').classList.add('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.add('hidden');
    });

    // Quick search
    document.getElementById('quick-search')?.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Export/Import
    document.getElementById('btn-export')?.addEventListener('click', () => this.exportData());
    document.getElementById('btn-import')?.addEventListener('click', () => this.importData());

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('Vuoi uscire dall\'applicazione?')) {
        ApiClient.logout();
      }
    });
  },

  handleSearch(query) {
    if (!query || query.length < 2) {
      document.getElementById('search-results')?.classList.add('hidden');
      return;
    }
    const project = Store.getActiveProject();
    if (!project) return;

    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return;

    const allReqs = flattenRequirements(cert.clauses);
    const results = allReqs.filter(r =>
      r.id.includes(query) ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      (r.text && r.text.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 8);

    const container = document.getElementById('search-results');
    if (!container) return;

    if (results.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = results.map(r => `
      <a href="#" data-req="${r.id}" class="search-result block px-4 py-2 transition-colors border-b border-slate-100 last:border-0"
         style="cursor:pointer" onmouseenter="this.style.backgroundColor='var(--primary-lighter)'" onmouseleave="this.style.backgroundColor=''">
        <span class="font-medium" style="color: var(--primary-text-light);">${r.id}</span>
        <span class="text-sm text-slate-600 ml-2">${this.truncate(r.title, 50)}</span>
      </a>
    `).join('');

    container.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.add('hidden');
        document.getElementById('quick-search').value = '';
        this.navigate('requirement', { currentRequirement: el.dataset.req });
      });
    });
  },

  exportData() {
    const data = Store.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trust-iso-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Dati esportati con successo', 'success');
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.version && data.projects) {
            await ApiClient.importData(data);
            this.showToast('Dati importati con successo', 'success');
            this.render();
          } else {
            this.showToast('File non valido', 'error');
          }
        } catch (err) {
          this.showToast('Errore: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  // --- Helpers ---
  phaseLabel(phase) {
    const labels = {
      'gap_analysis': 'Gap Analysis',
      'implementation': 'Implementazione',
      'pre_audit': 'Pre-Audit',
      'audit': 'Audit',
      'certified': 'Certificato'
    };
    return labels[phase] || phase;
  },

  phaseColor(phase) {
    const colors = {
      'gap_analysis': 'bg-purple-100 text-purple-700',
      'implementation': 'bg-blue-100 text-blue-700',
      'pre_audit': 'bg-amber-100 text-amber-700',
      'audit': 'bg-orange-100 text-orange-700',
      'certified': 'bg-emerald-100 text-emerald-700'
    };
    return colors[phase] || 'bg-slate-100 text-slate-700';
  },

  statusLabel(status) {
    const labels = {
      'implemented': 'Implementato',
      'partial': 'Parzialmente implementato',
      'not_implemented': 'Non implementato',
      'not_applicable': 'Non applicabile',
      'not_evaluated': 'Non valutato'
    };
    return labels[status] || status;
  },

  statusIcon(status) {
    const icons = {
      'implemented': '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">&#10003;</span>',
      'partial': '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-sm font-bold">&#9888;</span>',
      'not_implemented': '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-bold">&#10007;</span>',
      'not_applicable': '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-sm font-bold">&mdash;</span>',
      'not_evaluated': '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-300 text-sm font-bold">?</span>'
    };
    return icons[status] || icons['not_evaluated'];
  },

  statusColor(status) {
    const colors = {
      'implemented': 'border-emerald-200 bg-emerald-50',
      'partial': 'border-amber-200 bg-amber-50',
      'not_implemented': 'border-red-200 bg-red-50',
      'not_applicable': 'border-slate-200 bg-slate-50',
      'not_evaluated': 'border-slate-100 bg-white'
    };
    return colors[status] || colors['not_evaluated'];
  },

  priorityLabel(p) {
    return { high: 'Alta', medium: 'Media', low: 'Bassa' }[p] || p;
  },

  priorityColor(p) {
    return { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' }[p] || 'bg-slate-100 text-slate-700';
  },

  truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  daysUntil(dateStr) {
    if (!dateStr) return null;
    const now = new Date();
    const target = new Date(dateStr);
    return Math.ceil((target - now) / 86400000);
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = {
      success: 'bg-emerald-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500'
    };
    const toast = document.createElement('div');
    const bgClass = colors[type] || '';
    toast.className = `${bgClass} text-white px-4 py-3 rounded-lg shadow-lg mb-2 transform transition-all duration-300 translate-x-full`;
    if (type === 'info' || !bgClass) toast.style.backgroundColor = 'var(--primary)';
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), TOAST_FADE_MS);
    }, TOAST_DURATION);
  },

  autoSaveIndicator() {
    const el = document.getElementById('autosave-indicator');
    if (el) {
      el.textContent = 'Salvato';
      el.classList.remove('opacity-0');
      setTimeout(() => el.classList.add('opacity-0'), 2000);
    }
  },

  showModal(title, content, actions = '') {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-actions').innerHTML = actions;
    modal.classList.remove('hidden');
    modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal());
  },

  closeModal() {
    document.getElementById('modal').classList.add('hidden');
  }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
