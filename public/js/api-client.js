/**
 * ApiClient - Replaces Store.js with REST API calls + local cache.
 *
 * Design: all READ operations are synchronous (from cache).
 * All WRITE operations are async (fetch to server).
 * At the end, `const Store = ApiClient` provides backward compatibility
 * so views.js code calling Store.getProjects() etc. still works.
 */
const ApiClient = {
  _token: localStorage.getItem('trust_iso_token') || null,
  _user: JSON.parse(localStorage.getItem('trust_iso_user') || 'null'),
  _projects: [],
  _activeProjectId: localStorage.getItem('trust_iso_active_project') || null,
  _activeProject: null,

  // ─── Auth Helpers ─────────────────────────────────────────

  getToken() { return this._token; },
  getUser() { return this._user; },
  isAuthenticated() { return !!this._token; },

  setAuth(token, user) {
    this._token = token;
    this._user = user;
    localStorage.setItem('trust_iso_token', token);
    localStorage.setItem('trust_iso_user', JSON.stringify(user));
    if (user?.theme) {
      ThemeManager.syncFromUser(user.theme);
    }
  },

  clearAuth() {
    this._token = null;
    this._user = null;
    this._projects = [];
    this._activeProject = null;
    this._activeProjectId = null;
    localStorage.removeItem('trust_iso_token');
    localStorage.removeItem('trust_iso_user');
    localStorage.removeItem('trust_iso_active_project');
  },

  // ─── HTTP Helper ──────────────────────────────────────────

  async _fetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this._token) headers['Authorization'] = 'Bearer ' + this._token;

    const res = await fetch('/api' + path, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    // Auto-logout on auth errors
    if (res.status === 401 || res.status === 403) {
      this.clearAuth();
      window.location.reload();
      throw new Error('Sessione scaduta');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore del server');
    return data;
  },

  // ─── Auth API ─────────────────────────────────────────────

  async register(email, password, name) {
    // Usa fetch diretto (non _fetch) per evitare auto-logout su 401/403
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore del server');
    if (data.token) this.setAuth(data.token, data.user);
    return data;
  },

  async login(email, password) {
    // Usa fetch diretto (non _fetch) per evitare auto-logout su 401/403
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore del server');
    this.setAuth(data.token, data.user);
    return data;
  },

  logout() {
    this.clearAuth();
    window.location.reload();
  },

  // ─── Projects ─────────────────────────────────────────────

  async loadProjects() {
    this._projects = await this._fetch('/projects');
    return this._projects;
  },

  // Synchronous reads from cache (backward compatible with old Store)
  getProjects() {
    return this._projects;
  },

  getProject(id) {
    return this._projects.find(p => p.id === id) || this._activeProject || null;
  },

  async createProject(data) {
    const project = await this._fetch('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this._projects.unshift(project);
    return project;
  },

  async updateProject(id, updates) {
    const current = this.getProject(id) || {};
    const merged = { ...current, ...updates };
    const updated = await this._fetch('/projects/' + id, {
      method: 'PUT',
      body: JSON.stringify(merged)
    });
    const idx = this._projects.findIndex(p => p.id === id);
    if (idx !== -1) this._projects[idx] = updated;
    if (this._activeProjectId === id) this._activeProject = updated;
    return updated;
  },

  async deleteProject(id) {
    await this._fetch('/projects/' + id, { method: 'DELETE' });
    this._projects = this._projects.filter(p => p.id !== id);
    if (this._activeProjectId === id) {
      this._activeProjectId = null;
      this._activeProject = null;
      localStorage.removeItem('trust_iso_active_project');
    }
  },

  // ─── Active Project ───────────────────────────────────────

  getActiveProjectId() {
    return this._activeProjectId;
  },

  async setActiveProject(id) {
    this._activeProjectId = id;
    if (id) {
      localStorage.setItem('trust_iso_active_project', id);
      const cached = this._projects.find(p => p.id === id);
      if (cached) {
        this._activeProject = cached;
      } else {
        try {
          this._activeProject = await this._fetch('/projects/' + id);
        } catch {
          this._activeProject = null;
        }
      }
    } else {
      this._activeProject = null;
      localStorage.removeItem('trust_iso_active_project');
    }
  },

  getActiveProject() {
    return this._activeProject;
  },

  // ─── Evaluations ──────────────────────────────────────────

  getEvaluation(projectId, requirementId) {
    const project = this.getProject(projectId) || this._activeProject;
    if (!project) return null;
    return project.evaluations[requirementId] || { ...DEFAULT_EVALUATION };
  },

  async saveEvaluation(projectId, requirementId, evaluation) {
    const updated = await this._fetch(
      '/projects/' + projectId + '/evaluations/' + requirementId,
      { method: 'PUT', body: JSON.stringify(evaluation) }
    );
    // Update local cache
    const project = this.getProject(projectId) || this._activeProject;
    if (project) project.evaluations[requirementId] = updated;
    return updated;
  },

  // ─── Documents ────────────────────────────────────────────

  async addDocument(projectId, doc) {
    const newDoc = await this._fetch('/projects/' + projectId + '/documents', {
      method: 'POST',
      body: JSON.stringify(doc)
    });
    const project = this.getProject(projectId) || this._activeProject;
    if (project) project.documents.push(newDoc);
    return newDoc;
  },

  async updateDocument(projectId, docId, updates) {
    const updated = await this._fetch(
      '/projects/' + projectId + '/documents/' + docId,
      { method: 'PUT', body: JSON.stringify(updates) }
    );
    const project = this.getProject(projectId) || this._activeProject;
    if (project) {
      const idx = project.documents.findIndex(d => d.id === docId);
      if (idx !== -1) project.documents[idx] = updated;
    }
    return updated;
  },

  async deleteDocument(projectId, docId) {
    await this._fetch('/projects/' + projectId + '/documents/' + docId, {
      method: 'DELETE'
    });
    const project = this.getProject(projectId) || this._activeProject;
    if (project) project.documents = project.documents.filter(d => d.id !== docId);
  },

  // ─── Milestones ───────────────────────────────────────────

  async saveMilestones(projectId, milestones) {
    const updated = await this._fetch('/projects/' + projectId + '/milestones', {
      method: 'PUT',
      body: JSON.stringify(milestones)
    });
    const project = this.getProject(projectId) || this._activeProject;
    if (project) project.milestones = updated;
    return updated;
  },

  // ─── Statistics (computed client-side, same as old Store) ──

  getProjectStats(projectId) {
    const project = this.getProject(projectId) || this._activeProject;
    if (!project) return null;

    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert || !cert.clauses.length) return null;

    const allReqs = flattenRequirements(cert.clauses);
    const stats = {
      total: allReqs.length,
      implemented: 0, partial: 0, notImplemented: 0,
      notApplicable: 0, notEvaluated: 0,
      byClauses: {}
    };

    for (const clause of cert.clauses) {
      stats.byClauses[clause.number] = {
        title: clause.title, total: 0, implemented: 0, partial: 0,
        notImplemented: 0, notApplicable: 0, notEvaluated: 0
      };
    }

    for (const req of allReqs) {
      const ev = project.evaluations[req.id];
      const status = ev ? ev.status : 'not_evaluated';
      const cn = req.clauseNumber;
      if (stats.byClauses[cn]) stats.byClauses[cn].total++;

      switch (status) {
        case 'implemented':
          stats.implemented++;
          if (stats.byClauses[cn]) stats.byClauses[cn].implemented++;
          break;
        case 'partial':
          stats.partial++;
          if (stats.byClauses[cn]) stats.byClauses[cn].partial++;
          break;
        case 'not_implemented':
          stats.notImplemented++;
          if (stats.byClauses[cn]) stats.byClauses[cn].notImplemented++;
          break;
        case 'not_applicable':
          stats.notApplicable++;
          if (stats.byClauses[cn]) stats.byClauses[cn].notApplicable++;
          break;
        default:
          stats.notEvaluated++;
          if (stats.byClauses[cn]) stats.byClauses[cn].notEvaluated++;
      }
    }

    const applicable = stats.total - stats.notApplicable;
    stats.compliancePercent = applicable > 0
      ? Math.round((stats.implemented / applicable) * 100) : 0;
    stats.progressPercent = applicable > 0
      ? Math.round(((stats.implemented + stats.partial * 0.5) / applicable) * 100) : 0;

    return stats;
  },

  // ─── Certification Status ────────────────────────────────────

  async getCertificationStatus(projectId) {
    return await this._fetch('/projects/' + projectId + '/certification-status');
  },

  // ─── Changelog ──────────────────────────────────────────────

  async getProjectChangelog(projectId, limit = 100, offset = 0) {
    return await this._fetch(
      '/projects/' + projectId + '/changelog?limit=' + limit + '&offset=' + offset
    );
  },

  async getRequirementChangelog(projectId, reqId) {
    return await this._fetch(
      '/projects/' + projectId + '/changelog/' + reqId
    );
  },

  // ─── Export / Import ──────────────────────────────────────

  exportAllData() {
    return {
      version: '2.0',
      exportDate: new Date().toISOString(),
      projects: this._projects
    };
  },

  async importData(data) {
    for (const project of (data.projects || [])) {
      try {
        await this._fetch('/projects', {
          method: 'POST',
          body: JSON.stringify(project)
        });
      } catch (err) {
        console.warn('Errore importazione progetto:', project.clientName, err.message);
      }
    }
    await this.loadProjects();
  },

  // ─── Tutorial ───────────────────────────────────────────

  async completeTutorial() {
    const data = await this._fetch('/auth/tutorial-complete', {
      method: 'PUT'
    });
    // Update local user cache
    if (this._user) {
      this._user.hasSeenTutorial = true;
      localStorage.setItem('trust_iso_user', JSON.stringify(this._user));
    }
    return data;
  },

  // ─── Password Change ─────────────────────────────────────

  async changePassword(oldPassword, newPassword) {
    return await this._fetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  // ─── Admin: User Management ─────────────────────────────

  async getUsers() {
    const data = await this._fetch('/admin/users');
    return data.users;
  },

  async approveUser(userId) {
    return await this._fetch('/admin/users/' + userId + '/approve', {
      method: 'PUT'
    });
  },

  async deleteUser(userId) {
    return await this._fetch('/admin/users/' + userId, {
      method: 'DELETE'
    });
  },

  async changeUserRole(userId, role) {
    return await this._fetch('/admin/users/' + userId + '/role', {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  async createUser(name, email) {
    return await this._fetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
  },

  // ─── Admin: Changelog Summary ──────────────────────────────

  async sendChangelogSummary() {
    return await this._fetch('/admin/send-changelog-summary', {
      method: 'POST'
    });
  },

  // ─── API Keys ──────────────────────────────────────────────

  async getApiKeys() {
    const data = await this._fetch('/api-keys');
    return data.apiKeys;
  },

  async createApiKey(name, expiresInDays) {
    const body = { name };
    if (expiresInDays) body.expiresIn = expiresInDays;
    return await this._fetch('/api-keys', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async updateApiKey(id, updates) {
    const data = await this._fetch('/api-keys/' + id, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.apiKey;
  },

  async deleteApiKey(id) {
    return await this._fetch('/api-keys/' + id, {
      method: 'DELETE'
    });
  },

  // ─── Admin: API Keys ─────────────────────────────────────

  async getAdminApiKeys() {
    const data = await this._fetch('/admin/api-keys');
    return data.apiKeys;
  },

  async adminToggleApiKey(id, isActive) {
    const data = await this._fetch('/admin/api-keys/' + id + '/toggle', {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    });
    return data.apiKey;
  },

  // ─── Clients ─────────────────────────────────────────────

  _clients: [],

  async loadClients() {
    this._clients = await this._fetch('/clients');
    return this._clients;
  },

  getClients() {
    return this._clients;
  },

  getClient(id) {
    return this._clients.find(c => c.id === id) || null;
  },

  async createClient(data) {
    const client = await this._fetch('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this._clients.push(client);
    // Sort by company name
    this._clients.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    return client;
  },

  async updateClient(id, updates) {
    const updated = await this._fetch('/clients/' + id, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    const idx = this._clients.findIndex(c => c.id === id);
    if (idx !== -1) this._clients[idx] = updated;
    return updated;
  },

  async deleteClient(id) {
    await this._fetch('/clients/' + id, { method: 'DELETE' });
    this._clients = this._clients.filter(c => c.id !== id);
  },

  // ─── Stub for backward compatibility ──────────────────────
  init() {
    // No-op: replaced by async App.init() flow
  }
};

// Backward-compatible alias — deprecated, migrate callers to ApiClient directly
const Store = ApiClient;
