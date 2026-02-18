/**
 * Views - All UI rendering functions
 */
const Views = {

  // ============================================================
  // DASHBOARD
  // ============================================================
  dashboard(project) {
    if (!project) {
      return this._noCertificationDashboard();
    }
    const stats = Store.getProjectStats(project.id);
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    const daysLeft = App.daysUntil(project.targetDate);

    return `
    <div class="p-6 space-y-6">
      <!-- Page Title -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p class="text-slate-500">${project.clientName} - ${cert?.name || ''}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="App.navigate('reports')" class="btn-secondary">
            <i data-lucide="bar-chart-2" class="w-4 h-4"></i> Report
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${this._statCard('Conformita', stats?.compliancePercent + '%', 'Requisiti implementati', 'check-circle', 'emerald')}
        ${this._statCard('Progresso', stats?.progressPercent + '%', 'Avanzamento complessivo', 'trending-up', 'blue')}
        ${this._statCard('Criticita', stats?.notImplemented || 0, 'Requisiti non conformi', 'alert-triangle', 'red')}
        ${this._statCard('Scadenza', daysLeft !== null ? (daysLeft > 0 ? daysLeft + ' giorni' : 'Scaduto') : '-', project.targetDate ? 'Target: ' + App.formatDate(project.targetDate) : 'Non impostata', 'clock', daysLeft !== null && daysLeft < 30 ? 'amber' : 'slate')}
      </div>

      <!-- Progress Chart + Critical Items -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Clause Progress -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Progresso per Clausola</h3>
          <div class="space-y-3" id="clause-progress-bars">
            ${cert?.clauses.map(cl => {
              const cs = stats?.byClauses[cl.number];
              const applicable = cs ? cs.total - cs.notApplicable : 1;
              const progress = cs && applicable > 0 ? Math.round(((cs.implemented + cs.partial * 0.5) / applicable) * 100) : 0;
              return `
              <div>
                <div class="flex items-center justify-between mb-1">
                  <a href="#" data-view="clause" data-clause="${cl.number}" class="text-sm text-slate-700 hover:text-blue-600 transition-colors">
                    <span class="font-medium">${cl.number}.</span> ${cl.title}
                  </a>
                  <span class="text-xs font-medium ${progress === 100 ? 'text-emerald-600' : 'text-slate-500'}">${progress}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-500' : progress > 0 ? 'bg-amber-500' : 'bg-slate-200'}"
                       style="width: ${progress}%"></div>
                </div>
              </div>`;
            }).join('') || ''}
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Distribuzione Stato Requisiti</h3>
          <div class="space-y-3">
            ${this._statusBar('Implementati', stats?.implemented || 0, stats?.total || 1, 'bg-emerald-500')}
            ${this._statusBar('Parziali', stats?.partial || 0, stats?.total || 1, 'bg-amber-500')}
            ${this._statusBar('Non implementati', stats?.notImplemented || 0, stats?.total || 1, 'bg-red-500')}
            ${this._statusBar('Non applicabili', stats?.notApplicable || 0, stats?.total || 1, 'bg-slate-400')}
            ${this._statusBar('Non valutati', stats?.notEvaluated || 0, stats?.total || 1, 'bg-slate-200')}
          </div>

          <!-- Radar Chart Canvas -->
          <div class="mt-6">
            <canvas id="radar-chart" width="300" height="300" class="mx-auto"></canvas>
          </div>
        </div>
      </div>

      <!-- Critical Items & Upcoming Deadlines -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Critical Non-Conformities -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Requisiti Critici Non Conformi</h3>
          <div class="space-y-2" id="critical-items">
            ${this._criticalItems(project)}
          </div>
        </div>

        <!-- Upcoming Milestones -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4">Prossime Scadenze</h3>
          <div class="space-y-2" id="upcoming-deadlines">
            ${this._upcomingMilestones(project)}
          </div>
        </div>
      </div>
    </div>`;
  },

  _noCertificationDashboard() {
    return `
    <div class="p-6 space-y-6">
      <div>
        <div class="flex items-center gap-3">
          <img src="/img/logo.png" alt="Trust ISO" class="w-10 h-10 object-contain">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Trust ISO Tracking System</h1>
            <p class="text-slate-500 mt-1">Sistema di gestione certificazioni ISO per consulenti</p>
          </div>
        </div>
      </div>

      <!-- Certification Cards -->
      <div>
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Certificazioni Disponibili</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${CERTIFICATIONS.map(cert => `
          <div class="bg-white rounded-xl border border-slate-200 p-5 ${cert.comingSoon ? 'opacity-60' : 'hover:border-blue-300 hover:shadow-md cursor-pointer'} transition-all cert-card"
               data-cert-id="${cert.id}" ${cert.comingSoon ? '' : ''}>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background-color: ${cert.color}15">
              <i data-lucide="${cert.icon === 'shield-check' ? 'shield-check' : cert.icon === 'leaf' ? 'leaf' : cert.icon === 'hard-hat' ? 'hard-hat' : 'lock'}"
                 class="w-6 h-6" style="color: ${cert.color}"></i>
            </div>
            <h3 class="font-bold text-slate-800">${cert.name}</h3>
            <p class="text-sm text-slate-500 mt-1">${cert.fullName}</p>
            ${cert.comingSoon ?
              '<span class="inline-block mt-3 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded">Prossimamente</span>' :
              `<span class="inline-block mt-3 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">${countRequirements(cert.clauses)} requisiti</span>`
            }
          </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Projects -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-700">Progetti Recenti</h2>
          <button onclick="App.navigate('new-project')" class="btn-primary">
            <i data-lucide="plus" class="w-4 h-4"></i> Nuovo Progetto
          </button>
        </div>
        ${this._recentProjects()}
      </div>
    </div>`;
  },

  _recentProjects() {
    const projects = Store.getProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    if (!projects.length) {
      return '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Nessun progetto. Crea il tuo primo progetto per iniziare.</div>';
    }
    return `<div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
      ${projects.map(p => {
        const stats = Store.getProjectStats(p.id);
        return `
        <a href="#" class="project-row flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors" data-project-id="${p.id}">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-slate-800 truncate">${p.clientName || 'Senza nome'}</div>
            <div class="text-sm text-slate-500">${CERTIFICATIONS.find(c => c.id === p.certificationId)?.name || ''} - ${App.phaseLabel(p.phase)}</div>
          </div>
          <div class="hidden sm:block w-32">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-slate-100 rounded-full h-1.5">
                <div class="h-1.5 rounded-full bg-blue-500" style="width:${stats?.progressPercent || 0}%"></div>
              </div>
              <span class="text-xs text-slate-500">${stats?.progressPercent || 0}%</span>
            </div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
        </a>`;
      }).join('')}
    </div>`;
  },

  _statCard(title, value, subtitle, icon, color) {
    const colors = {
      emerald: 'bg-emerald-50 text-emerald-600',
      blue: 'bg-blue-50 text-blue-600',
      red: 'bg-red-50 text-red-600',
      amber: 'bg-amber-50 text-amber-600',
      slate: 'bg-slate-50 text-slate-600'
    };
    return `
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-slate-500">${title}</span>
        <div class="w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center">
          <i data-lucide="${icon}" class="w-4 h-4"></i>
        </div>
      </div>
      <div class="text-2xl font-bold text-slate-800">${value}</div>
      <div class="text-xs text-slate-500 mt-1">${subtitle}</div>
    </div>`;
  },

  _statusBar(label, count, total, colorClass) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
    <div class="flex items-center gap-3">
      <span class="text-sm text-slate-600 w-36">${label}</span>
      <div class="flex-1 bg-slate-100 rounded-full h-2.5">
        <div class="${colorClass} h-2.5 rounded-full transition-all" style="width:${pct}%"></div>
      </div>
      <span class="text-sm font-medium text-slate-700 w-12 text-right">${count}</span>
    </div>`;
  },

  _criticalItems(project) {
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return '<p class="text-sm text-slate-500">Nessun dato</p>';

    const allReqs = flattenRequirements(cert.clauses);
    const critical = allReqs.filter(r => {
      const ev = project.evaluations[r.id];
      return ev && ev.status === 'not_implemented' && ev.priority === 'high';
    }).slice(0, 5);

    if (!critical.length) {
      return '<p class="text-sm text-slate-500 py-4 text-center">Nessuna criticita ad alta priorita rilevata</p>';
    }

    return critical.map(r => `
      <a href="#" data-req="${r.id}" class="critical-item block p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
        <div class="flex items-center gap-2">
          <span class="text-red-600 font-medium text-sm">${r.id}</span>
          <span class="text-sm text-slate-700">${App.truncate(r.title, 40)}</span>
        </div>
        ${project.evaluations[r.id]?.deadline ? `<div class="text-xs text-red-500 mt-1">Scadenza: ${App.formatDate(project.evaluations[r.id].deadline)}</div>` : ''}
      </a>
    `).join('');
  },

  _upcomingMilestones(project) {
    const now = new Date();
    const upcoming = (project.milestones || [])
      .filter(m => !m.completed && new Date(m.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    if (!upcoming.length) {
      return '<p class="text-sm text-slate-500 py-4 text-center">Nessuna scadenza imminente</p>';
    }

    return upcoming.map(m => {
      const days = App.daysUntil(m.date);
      return `
      <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
          <i data-lucide="calendar" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-slate-800">${m.title}</div>
          <div class="text-xs text-slate-500">${App.formatDate(m.date)}</div>
        </div>
        <span class="text-xs font-medium ${days < 14 ? 'text-amber-600' : 'text-slate-500'}">${days}g</span>
      </div>`;
    }).join('');
  },

  bindDashboard() {
    // Cert cards click -> new project with that cert
    document.querySelectorAll('.cert-card').forEach(el => {
      el.addEventListener('click', () => {
        const certId = el.dataset.certId;
        const cert = CERTIFICATIONS.find(c => c.id === certId);
        if (cert && !cert.comingSoon) {
          App.navigate('new-project');
        }
      });
    });

    // Project row click
    document.querySelectorAll('.project-row').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        await Store.setActiveProject(el.dataset.projectId);
        App.navigate('dashboard');
      });
    });

    // Critical items
    document.querySelectorAll('.critical-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigate('requirement', { currentRequirement: el.dataset.req });
      });
    });

    // Clause progress links
    document.querySelectorAll('[data-view="clause"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigate('clause', { currentClause: el.dataset.clause });
      });
    });

    // Draw radar chart
    this._drawRadarChart();
  },

  _drawRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;
    const project = Store.getActiveProject();
    if (!project) return;
    const stats = Store.getProjectStats(project.id);
    if (!stats) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const r = Math.min(cx, cy) - 40;

    const clauses = Object.entries(stats.byClauses);
    const n = clauses.length;
    if (n === 0) return;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    for (let level = 1; level <= 4; level++) {
      ctx.beginPath();
      const lr = (r * level) / 4;
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + lr * Math.cos(angle);
        const y = cy + lr * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
    }

    // Draw data
    ctx.beginPath();
    clauses.forEach(([num, cs], i) => {
      const applicable = cs.total - cs.notApplicable;
      const val = applicable > 0 ? (cs.implemented + cs.partial * 0.5) / applicable : 0;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points and labels
    clauses.forEach(([num, cs], i) => {
      const applicable = cs.total - cs.notApplicable;
      const val = applicable > 0 ? (cs.implemented + cs.partial * 0.5) / applicable : 0;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();

      // Label
      const lx = cx + (r + 20) * Math.cos(angle);
      const ly = cy + (r + 20) * Math.sin(angle);
      ctx.fillStyle = '#475569';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Cl. ' + num, lx, ly);
    });
  },

  // ============================================================
  // PROJECT LIST
  // ============================================================
  projectList() {
    const projects = Store.getProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Progetti</h1>
          <p class="text-slate-500">${projects.length} progett${projects.length === 1 ? 'o' : 'i'} di certificazione</p>
        </div>
        <button onclick="App.navigate('new-project')" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nuovo Progetto
        </button>
      </div>

      ${projects.length === 0 ? `
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="folder-plus" class="w-8 h-8 text-blue-500"></i>
        </div>
        <h3 class="font-semibold text-slate-800 mb-2">Nessun progetto</h3>
        <p class="text-slate-500 mb-4">Crea il tuo primo progetto di certificazione per iniziare</p>
        <button onclick="App.navigate('new-project')" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Crea Progetto
        </button>
      </div>
      ` : `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${projects.map(p => {
          const stats = Store.getProjectStats(p.id);
          const cert = CERTIFICATIONS.find(c => c.id === p.certificationId);
          const isActive = Store.getActiveProjectId() === p.id;
          return `
          <div class="bg-white rounded-xl border ${isActive ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'} p-5 hover:shadow-md transition-all project-card" data-project-id="${p.id}">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color:${cert?.color || '#2563eb'}15">
                <i data-lucide="shield-check" class="w-5 h-5" style="color:${cert?.color || '#2563eb'}"></i>
              </div>
              <div class="flex items-center gap-1">
                ${isActive ? '<span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Attivo</span>' : ''}
                <button class="project-menu p-1 rounded hover:bg-slate-100 text-slate-400" data-id="${p.id}">
                  <i data-lucide="more-vertical" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
            <h3 class="font-semibold text-slate-800 mb-1">${p.clientName || 'Senza nome'}</h3>
            <p class="text-sm text-slate-500 mb-3">${cert?.name || ''}</p>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs px-2 py-0.5 rounded-full ${App.phaseColor(p.phase)}">${App.phaseLabel(p.phase)}</span>
              ${p.targetDate ? `<span class="text-xs text-slate-500">Target: ${App.formatDate(p.targetDate)}</span>` : ''}
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-slate-100 rounded-full h-2">
                <div class="h-2 rounded-full bg-blue-500 transition-all" style="width:${stats?.progressPercent || 0}%"></div>
              </div>
              <span class="text-xs font-medium text-slate-600">${stats?.progressPercent || 0}%</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      `}
    </div>`;
  },

  bindProjectList() {
    document.querySelectorAll('.project-card').forEach(el => {
      el.addEventListener('click', async (e) => {
        if (e.target.closest('.project-menu')) return;
        await Store.setActiveProject(el.dataset.projectId);
        App.navigate('dashboard');
      });
    });
    document.querySelectorAll('.project-menu').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id;
        App.showModal('Azioni Progetto', '', `
          <button onclick="(async()=>{await Store.setActiveProject('${id}'); App.closeModal(); App.navigate('dashboard');})()" class="btn-primary w-full mb-2">Apri Progetto</button>
          <button onclick="(async()=>{await Store.setActiveProject('${id}'); App.closeModal(); App.navigate('edit-project');})()" class="btn-secondary w-full mb-2">Modifica</button>
          <button onclick="(async()=>{if(confirm('Eliminare questo progetto?')){await Store.deleteProject('${id}'); App.closeModal(); App.navigate('projects');}})()" class="btn-danger w-full">Elimina</button>
        `);
      });
    });
  },

  // ============================================================
  // PROJECT FORM (Create/Edit)
  // ============================================================
  projectForm(project = null) {
    const isEdit = !!project;
    return `
    <div class="p-6 max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">${isEdit ? 'Modifica Progetto' : 'Nuovo Progetto'}</h1>
        <p class="text-slate-500">${isEdit ? 'Aggiorna i dati del progetto' : 'Inserisci i dati del cliente e del progetto'}</p>
      </div>

      <form id="project-form" class="space-y-6">
        <!-- Client Info -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i data-lucide="building-2" class="w-5 h-5 text-slate-400"></i> Dati Cliente
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="form-label">Ragione Sociale *</label>
              <input type="text" name="clientName" value="${project?.clientName || ''}" required class="form-input" placeholder="Es. Acme S.r.l.">
            </div>
            <div>
              <label class="form-label">Settore</label>
              <input type="text" name="sector" value="${project?.sector || ''}" class="form-input" placeholder="Es. Manifatturiero">
            </div>
            <div>
              <label class="form-label">Codice ATECO</label>
              <input type="text" name="ateco" value="${project?.ateco || ''}" class="form-input" placeholder="Es. 25.11.00">
            </div>
            <div>
              <label class="form-label">N. Dipendenti</label>
              <input type="text" name="employees" value="${project?.employees || ''}" class="form-input" placeholder="Es. 50">
            </div>
            <div>
              <label class="form-label">Sede Legale</label>
              <input type="text" name="legalAddress" value="${project?.legalAddress || ''}" class="form-input">
            </div>
            <div class="md:col-span-2">
              <label class="form-label">Sedi Operative</label>
              <input type="text" name="operationalSites" value="${project?.operationalSites || ''}" class="form-input" placeholder="Separare con virgola">
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i data-lucide="user" class="w-5 h-5 text-slate-400"></i> Referente Aziendale
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Nome e Cognome</label>
              <input type="text" name="contactName" value="${project?.contactName || ''}" class="form-input">
            </div>
            <div>
              <label class="form-label">Ruolo</label>
              <input type="text" name="contactRole" value="${project?.contactRole || ''}" class="form-input" placeholder="Es. Responsabile Qualita">
            </div>
            <div>
              <label class="form-label">Email</label>
              <input type="email" name="contactEmail" value="${project?.contactEmail || ''}" class="form-input">
            </div>
            <div>
              <label class="form-label">Telefono</label>
              <input type="tel" name="contactPhone" value="${project?.contactPhone || ''}" class="form-input">
            </div>
          </div>
        </div>

        <!-- Project Info -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i data-lucide="clipboard" class="w-5 h-5 text-slate-400"></i> Info Progetto
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Normativa</label>
              <select name="certificationId" class="form-input" ${isEdit ? 'disabled' : ''}>
                ${CERTIFICATIONS.filter(c => !c.comingSoon).map(c =>
                  `<option value="${c.id}" ${project?.certificationId === c.id ? 'selected' : ''}>${c.name}</option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">Fase Attuale</label>
              <select name="phase" class="form-input">
                <option value="gap_analysis" ${project?.phase === 'gap_analysis' ? 'selected' : ''}>Gap Analysis</option>
                <option value="implementation" ${project?.phase === 'implementation' ? 'selected' : ''}>Implementazione</option>
                <option value="pre_audit" ${project?.phase === 'pre_audit' ? 'selected' : ''}>Pre-Audit</option>
                <option value="audit" ${project?.phase === 'audit' ? 'selected' : ''}>Audit</option>
                <option value="certified" ${project?.phase === 'certified' ? 'selected' : ''}>Certificato</option>
              </select>
            </div>
            <div>
              <label class="form-label">Data Inizio Consulenza</label>
              <input type="date" name="startDate" value="${project?.startDate || new Date().toISOString().split('T')[0]}" class="form-input">
            </div>
            <div>
              <label class="form-label">Target Certificazione</label>
              <input type="date" name="targetDate" value="${project?.targetDate || ''}" class="form-input">
            </div>
            <div class="md:col-span-2">
              <label class="form-label">Ente Certificatore</label>
              <input type="text" name="certBody" value="${project?.certBody || ''}" class="form-input" placeholder="Es. DNV, Bureau Veritas, TUV...">
            </div>
            <div class="md:col-span-2">
              <label class="form-label">Note</label>
              <textarea name="notes" rows="3" class="form-input">${project?.notes || ''}</textarea>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button type="submit" class="btn-primary">
            <i data-lucide="save" class="w-4 h-4"></i> ${isEdit ? 'Salva Modifiche' : 'Crea Progetto'}
          </button>
          <button type="button" onclick="App.navigate('${isEdit ? 'project-detail' : 'projects'}')" class="btn-secondary">Annulla</button>
        </div>
      </form>
    </div>`;
  },

  bindProjectForm(project = null) {
    document.getElementById('project-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());

      try {
        if (project) {
          await Store.updateProject(project.id, data);
          App.showToast('Progetto aggiornato', 'success');
          App.navigate('project-detail');
        } else {
          const newProject = await Store.createProject(data);
          await Store.setActiveProject(newProject.id);
          App.showToast('Progetto creato con successo', 'success');
          App.navigate('dashboard');
        }
      } catch (err) {
        App.showToast('Errore: ' + err.message, 'error');
      }
    });
  },

  // ============================================================
  // PROJECT DETAIL
  // ============================================================
  projectDetail(project) {
    if (!project) return '<div class="p-6"><p class="text-slate-500">Nessun progetto selezionato</p></div>';
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    return `
    <div class="p-6 max-w-4xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">${project.clientName}</h1>
          <p class="text-slate-500">${cert?.name || ''} - ${App.phaseLabel(project.phase)}</p>
        </div>
        <button onclick="App.navigate('edit-project')" class="btn-secondary">
          <i data-lucide="edit" class="w-4 h-4"></i> Modifica
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Client Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <i data-lucide="building-2" class="w-4 h-4 text-slate-400"></i> Dati Cliente
          </h3>
          <dl class="space-y-2 text-sm">
            ${this._dlRow('Ragione Sociale', project.clientName)}
            ${this._dlRow('Settore', project.sector)}
            ${this._dlRow('ATECO', project.ateco)}
            ${this._dlRow('Dipendenti', project.employees)}
            ${this._dlRow('Sede Legale', project.legalAddress)}
            ${this._dlRow('Sedi Operative', project.operationalSites)}
          </dl>
        </div>

        <!-- Contact Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <i data-lucide="user" class="w-4 h-4 text-slate-400"></i> Referente
          </h3>
          <dl class="space-y-2 text-sm">
            ${this._dlRow('Nome', project.contactName)}
            ${this._dlRow('Ruolo', project.contactRole)}
            ${this._dlRow('Email', project.contactEmail)}
            ${this._dlRow('Telefono', project.contactPhone)}
          </dl>
        </div>

        <!-- Project Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 md:col-span-2">
          <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <i data-lucide="clipboard" class="w-4 h-4 text-slate-400"></i> Info Progetto
          </h3>
          <dl class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            ${this._dlRow('Data Inizio', App.formatDate(project.startDate))}
            ${this._dlRow('Target Certificazione', App.formatDate(project.targetDate))}
            ${this._dlRow('Ente Certificatore', project.certBody || '-')}
            ${this._dlRow('Fase', App.phaseLabel(project.phase))}
            ${this._dlRow('Creato il', App.formatDate(project.createdAt))}
            ${this._dlRow('Ultimo aggiornamento', App.formatDate(project.updatedAt))}
          </dl>
          ${project.notes ? `<div class="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600"><strong>Note:</strong> ${project.notes}</div>` : ''}
        </div>
      </div>
    </div>`;
  },

  _dlRow(label, value) {
    return `<div><dt class="text-slate-500">${label}</dt><dd class="font-medium text-slate-800">${value || '-'}</dd></div>`;
  },

  bindProjectDetail() {},

  // ============================================================
  // CLAUSE VIEW (Gap Analysis per clause)
  // ============================================================
  clauseView(project, clauseNumber) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    const clause = cert?.clauses.find(c => c.number === clauseNumber);
    if (!clause) return '<div class="p-6">Clausola non trovata</div>';

    const allReqs = this._flattenClauseRequirements(clause);

    return `
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <a href="#" onclick="App.navigate('dashboard'); return false;" class="hover:text-blue-600">Dashboard</a>
            <span>/</span>
            <span>Clausola ${clause.number}</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Clausola ${clause.number}: ${clause.title}</h1>
        </div>
      </div>

      <!-- Requirements List -->
      <div class="space-y-3">
        ${allReqs.map(req => {
          const ev = project.evaluations[req.id] || { status: 'not_evaluated' };
          return `
          <div class="bg-white rounded-xl border ${App.statusColor(ev.status)} p-4 hover:shadow-sm transition-all cursor-pointer requirement-row"
               data-req="${req.id}">
            <div class="flex items-center gap-3">
              ${App.statusIcon(ev.status)}
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-800">${req.id}</span>
                  <span class="text-slate-700">${req.title}</span>
                </div>
                ${ev.notes ? `<p class="text-sm text-slate-500 mt-1 truncate">${App.truncate(ev.notes, 80)}</p>` : ''}
              </div>
              <div class="flex items-center gap-2">
                ${ev.priority && ev.status === 'not_implemented' ? `<span class="text-xs px-2 py-0.5 rounded ${App.priorityColor(ev.priority)}">${App.priorityLabel(ev.priority)}</span>` : ''}
                ${ev.deadline ? `<span class="text-xs text-slate-500">${App.formatDate(ev.deadline)}</span>` : ''}
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  _flattenClauseRequirements(clause) {
    const result = [];
    function walk(items) {
      if (!items) return;
      for (const item of items) {
        result.push(item);
        if (item.subRequirements) walk(item.subRequirements);
      }
    }
    walk(clause.requirements);
    return result;
  },

  bindClauseView(project, clauseNumber) {
    document.querySelectorAll('.requirement-row').forEach(el => {
      el.addEventListener('click', () => {
        App.navigate('requirement', { currentRequirement: el.dataset.req });
      });
    });
  },

  // ============================================================
  // REQUIREMENT DETAIL (Full evaluation form)
  // ============================================================
  requirementDetail(project, reqId) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return '<div class="p-6">Certificazione non trovata</div>';

    // Find requirement
    const allReqs = flattenRequirements(cert.clauses);
    const req = allReqs.find(r => r.id === reqId);
    if (!req) return '<div class="p-6">Requisito non trovato</div>';

    const ev = project.evaluations[reqId] || {
      status: 'not_evaluated', notes: '', priority: 'medium',
      responsible: '', deadline: '', actions: [], evidenceNotes: [], auditNotes: '', history: []
    };

    // Find clause
    const clauseNum = reqId.split('.')[0];

    // Find prev/next requirement
    const idx = allReqs.findIndex(r => r.id === reqId);
    const prevReq = idx > 0 ? allReqs[idx - 1] : null;
    const nextReq = idx < allReqs.length - 1 ? allReqs[idx + 1] : null;

    return `
    <div class="p-6 max-w-4xl space-y-5">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <a href="#" onclick="App.navigate('dashboard'); return false;" class="hover:text-blue-600">Dashboard</a>
        <span>/</span>
        <a href="#" onclick="App.navigate('clause', {currentClause:'${clauseNum}'}); return false;" class="hover:text-blue-600">Clausola ${clauseNum}</a>
        <span>/</span>
        <span class="text-slate-700">${reqId}</span>
      </div>

      <!-- Title -->
      <div>
        <h1 class="text-xl font-bold text-slate-800">
          <span class="text-blue-600">${reqId}</span> ${req.title}
        </h1>
      </div>

      <!-- Requirement Text -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-blue-800 mb-2">Testo del Requisito</h3>
        <p class="text-sm text-blue-900 leading-relaxed">${req.text || 'Testo del requisito non disponibile.'}</p>
      </div>

      <!-- Evaluation Form -->
      <form id="evaluation-form" class="space-y-5">
        <!-- Status Selection -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Stato di Conformita</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${this._statusRadio('implemented', 'Implementato', 'bg-emerald-100 text-emerald-700 border-emerald-300', ev.status)}
            ${this._statusRadio('partial', 'Parziale', 'bg-amber-100 text-amber-700 border-amber-300', ev.status)}
            ${this._statusRadio('not_implemented', 'Non Impl.', 'bg-red-100 text-red-700 border-red-300', ev.status)}
            ${this._statusRadio('not_applicable', 'N/A', 'bg-slate-100 text-slate-600 border-slate-300', ev.status)}
          </div>

          <!-- N/A justification -->
          <div id="na-justification" class="${ev.status === 'not_applicable' ? '' : 'hidden'} mt-3">
            <label class="form-label">Motivazione Non Applicabilita</label>
            <textarea name="naJustification" rows="2" class="form-input" placeholder="Specificare perche il requisito non e applicabile...">${ev.naJustification || ''}</textarea>
          </div>
        </div>

        <!-- Notes & Observations -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Note e Osservazioni</h3>
          <textarea name="notes" rows="3" class="form-input" placeholder="Note interpretative, osservazioni sulla conformita...">${ev.notes || ''}</textarea>
        </div>

        <!-- Evidence & Mandatory Docs -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Evidenze Richieste</h3>
          ${(req.mandatoryDocs && req.mandatoryDocs.length) ? `
            <div class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="text-sm font-semibold text-amber-800 mb-1">Documenti Obbligatori:</div>
              <ul class="list-disc list-inside text-sm text-amber-900">
                ${req.mandatoryDocs.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${(req.evidences && req.evidences.length) ? `
            <div class="space-y-2">
              ${req.evidences.map((e, i) => `
                <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" name="evidence_${i}" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                         ${ev.evidenceNotes?.includes(e) ? 'checked' : ''}>
                  <span class="text-sm text-slate-700">${e}</span>
                </label>
              `).join('')}
            </div>
          ` : '<p class="text-sm text-slate-500">Nessuna evidenza specifica richiesta</p>'}
        </div>

        <!-- Corrective Actions -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Azioni Correttive</h3>
          <div id="actions-list" class="space-y-2 mb-3">
            ${(ev.actions || []).map((a, i) => `
              <div class="flex items-center gap-2 action-item">
                <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600" ${a.done ? 'checked' : ''} data-action-idx="${i}">
                <input type="text" class="form-input flex-1 text-sm" value="${a.text}" data-action-text="${i}">
                <button type="button" class="text-slate-400 hover:text-red-500 remove-action" data-idx="${i}">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              </div>
            `).join('')}
          </div>
          <button type="button" id="add-action" class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <i data-lucide="plus" class="w-4 h-4"></i> Aggiungi azione
          </button>
        </div>

        <!-- Priority, Responsible, Deadline -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Assegnazione</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Priorita</label>
              <select name="priority" class="form-input">
                <option value="high" ${ev.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="medium" ${ev.priority === 'medium' ? 'selected' : ''}>Media</option>
                <option value="low" ${ev.priority === 'low' ? 'selected' : ''}>Bassa</option>
              </select>
            </div>
            <div>
              <label class="form-label">Responsabile</label>
              <input type="text" name="responsible" value="${ev.responsible || ''}" class="form-input" placeholder="Nome responsabile">
            </div>
            <div>
              <label class="form-label">Scadenza</label>
              <input type="date" name="deadline" value="${ev.deadline || ''}" class="form-input">
            </div>
          </div>
        </div>

        <!-- Audit Notes -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Note Audit</h3>
          <textarea name="auditNotes" rows="2" class="form-input" placeholder="Osservazioni dell'ispettore/auditor...">${ev.auditNotes || ''}</textarea>
        </div>

        <!-- History -->
        ${(ev.history && ev.history.length) ? `
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Storico Modifiche</h3>
          <div class="space-y-2">
            ${ev.history.map(h => `
              <div class="flex items-center gap-3 text-sm">
                <span class="text-slate-500">${App.formatDate(h.date)}</span>
                <span>${App.statusLabel(h.fromStatus)}</span>
                <i data-lucide="arrow-right" class="w-3 h-3 text-slate-400"></i>
                <span class="font-medium">${App.statusLabel(h.toStatus)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Save + Nav -->
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button type="submit" class="btn-primary">
              <i data-lucide="save" class="w-4 h-4"></i> Salva Valutazione
            </button>
            <button type="button" onclick="App.navigate('clause', {currentClause:'${clauseNum}'})" class="btn-secondary">Indietro</button>
          </div>
          <div class="flex gap-2">
            ${prevReq ? `<button type="button" onclick="App.navigate('requirement', {currentRequirement:'${prevReq.id}'})" class="btn-secondary text-sm px-3">
              <i data-lucide="chevron-left" class="w-4 h-4"></i> ${prevReq.id}
            </button>` : ''}
            ${nextReq ? `<button type="button" onclick="App.navigate('requirement', {currentRequirement:'${nextReq.id}'})" class="btn-secondary text-sm px-3">
              ${nextReq.id} <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>` : ''}
          </div>
        </div>
      </form>
    </div>`;
  },

  _statusRadio(value, label, colorClass, current) {
    const checked = current === value;
    return `
    <label class="status-radio flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${checked ? colorClass + ' border-current' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}">
      <input type="radio" name="status" value="${value}" ${checked ? 'checked' : ''} class="sr-only">
      <span class="text-sm font-medium">${label}</span>
    </label>`;
  },

  bindRequirementDetail(project, reqId) {
    if (!project || !reqId) return;

    // Status radio styling
    document.querySelectorAll('.status-radio input').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.status-radio').forEach(l => {
          l.className = l.className.replace(/bg-\S+ text-\S+ border-\S+/g, '').trim();
          l.classList.add('bg-white', 'border-slate-200', 'text-slate-600');
        });
        const label = radio.closest('label');
        label.classList.remove('bg-white', 'border-slate-200', 'text-slate-600');
        const colors = {
          'implemented': ['bg-emerald-100', 'text-emerald-700', 'border-emerald-300'],
          'partial': ['bg-amber-100', 'text-amber-700', 'border-amber-300'],
          'not_implemented': ['bg-red-100', 'text-red-700', 'border-red-300'],
          'not_applicable': ['bg-slate-100', 'text-slate-600', 'border-slate-300']
        };
        (colors[radio.value] || []).forEach(c => label.classList.add(c));
        document.getElementById('na-justification')?.classList.toggle('hidden', radio.value !== 'not_applicable');
      });
    });

    // Add action
    document.getElementById('add-action')?.addEventListener('click', () => {
      const list = document.getElementById('actions-list');
      const idx = list.children.length;
      const div = document.createElement('div');
      div.className = 'flex items-center gap-2 action-item';
      div.innerHTML = `
        <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600" data-action-idx="${idx}">
        <input type="text" class="form-input flex-1 text-sm" placeholder="Descrivi l'azione..." data-action-text="${idx}">
        <button type="button" class="text-slate-400 hover:text-red-500 remove-action" data-idx="${idx}">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;
      list.appendChild(div);
      div.querySelector('input[type="text"]').focus();
      if (window.lucide) lucide.createIcons();
    });

    // Remove action (delegated)
    document.getElementById('actions-list')?.addEventListener('click', (e) => {
      if (e.target.closest('.remove-action')) {
        e.target.closest('.action-item').remove();
      }
    });

    // Submit form
    document.getElementById('evaluation-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
      const allReqs = flattenRequirements(cert.clauses);
      const req = allReqs.find(r => r.id === reqId);

      // Gather actions
      const actions = [];
      document.querySelectorAll('.action-item').forEach(item => {
        const text = item.querySelector('input[type="text"]')?.value;
        const done = item.querySelector('input[type="checkbox"]')?.checked;
        if (text) actions.push({ text, done });
      });

      // Gather checked evidences
      const evidenceNotes = [];
      if (req?.evidences) {
        req.evidences.forEach((ev, i) => {
          if (fd.get(`evidence_${i}`) === 'on') evidenceNotes.push(ev);
        });
      }

      const evaluation = {
        status: fd.get('status') || 'not_evaluated',
        notes: fd.get('notes') || '',
        priority: fd.get('priority') || 'medium',
        responsible: fd.get('responsible') || '',
        deadline: fd.get('deadline') || '',
        actions,
        evidenceNotes,
        auditNotes: fd.get('auditNotes') || '',
        naJustification: fd.get('naJustification') || '',
        history: project.evaluations[reqId]?.history || []
      };

      try {
        await Store.saveEvaluation(project.id, reqId, evaluation);
        App.showToast('Valutazione salvata', 'success');
        App.render();
      } catch (err) {
        App.showToast('Errore: ' + err.message, 'error');
      }
    });
  },

  // ============================================================
  // DOCUMENT MANAGER
  // ============================================================
  documentManager(project) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const docs = project.documents || [];

    return `
    <div class="p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Gestione Documenti</h1>
          <p class="text-slate-500">${docs.length} document${docs.length === 1 ? 'o' : 'i'}</p>
        </div>
        <button id="add-doc-btn" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nuovo Documento
        </button>
      </div>

      <!-- Mandatory Docs Checklist -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-3">Documenti Obbligatori ISO 9001:2015</h3>
        <div class="space-y-2" id="mandatory-docs-list">
          ${this._mandatoryDocsChecklist(project)}
        </div>
      </div>

      <!-- Documents Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        ${docs.length === 0 ? `
          <div class="p-8 text-center text-slate-500">
            <i data-lucide="file-text" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
            <p>Nessun documento registrato</p>
          </div>
        ` : `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Codice</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Versione</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Data</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Stato</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Requisiti</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${docs.map(d => `
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800">${d.code || '-'}</td>
                <td class="px-4 py-3 text-slate-700">${d.name}</td>
                <td class="px-4 py-3 text-slate-600">${d.version || '1.0'}</td>
                <td class="px-4 py-3 text-slate-600">${App.formatDate(d.issueDate)}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full ${
                    d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    d.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }">${d.status === 'approved' ? 'Approvato' : d.status === 'draft' ? 'Bozza' : 'Obsoleto'}</span>
                </td>
                <td class="px-4 py-3 text-slate-600 text-xs">${(d.linkedRequirements || []).join(', ') || '-'}</td>
                <td class="px-4 py-3 text-right">
                  <button class="edit-doc text-slate-400 hover:text-blue-600 mr-2" data-doc-id="${d.id}">
                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                  </button>
                  <button class="delete-doc text-slate-400 hover:text-red-600" data-doc-id="${d.id}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `}
      </div>
    </div>`;
  },

  _mandatoryDocsChecklist(project) {
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

    return mandatory.map(m => {
      const exists = docNames.some(dn => dn.includes(m.name.toLowerCase().substring(0, 15)));
      return `
      <div class="flex items-center gap-3 p-2 rounded-lg ${exists ? 'bg-emerald-50' : 'bg-red-50'}">
        <span class="w-5 h-5 flex items-center justify-center rounded-full ${exists ? 'bg-emerald-500 text-white' : 'bg-red-200 text-red-600'} text-xs font-bold">
          ${exists ? '&#10003;' : '!'}
        </span>
        <span class="flex-1 text-sm ${exists ? 'text-emerald-800' : 'text-red-800'}">${m.name}</span>
        <span class="text-xs text-slate-500">Rif. ${m.req}</span>
      </div>`;
    }).join('');
  },

  bindDocumentManager(project) {
    if (!project) return;

    document.getElementById('add-doc-btn')?.addEventListener('click', () => {
      this._showDocModal(project);
    });

    document.querySelectorAll('.edit-doc').forEach(el => {
      el.addEventListener('click', () => {
        const doc = project.documents.find(d => d.id === el.dataset.docId);
        if (doc) this._showDocModal(project, doc);
      });
    });

    document.querySelectorAll('.delete-doc').forEach(el => {
      el.addEventListener('click', async () => {
        if (confirm('Eliminare questo documento?')) {
          try {
            await Store.deleteDocument(project.id, el.dataset.docId);
            App.render();
            App.showToast('Documento eliminato', 'success');
          } catch (err) {
            App.showToast('Errore: ' + err.message, 'error');
          }
        }
      });
    });
  },

  _showDocModal(project, doc = null) {
    const isEdit = !!doc;
    App.showModal(isEdit ? 'Modifica Documento' : 'Nuovo Documento', `
      <form id="doc-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="form-label">Nome Documento *</label>
            <input type="text" name="name" value="${doc?.name || ''}" required class="form-input">
          </div>
          <div>
            <label class="form-label">Codice</label>
            <input type="text" name="code" value="${doc?.code || ''}" class="form-input" placeholder="Es. PQ-001">
          </div>
          <div>
            <label class="form-label">Versione</label>
            <input type="text" name="version" value="${doc?.version || '1.0'}" class="form-input">
          </div>
          <div>
            <label class="form-label">Data Emissione</label>
            <input type="date" name="issueDate" value="${doc?.issueDate || new Date().toISOString().split('T')[0]}" class="form-input">
          </div>
          <div>
            <label class="form-label">Stato</label>
            <select name="status" class="form-input">
              <option value="draft" ${doc?.status === 'draft' ? 'selected' : ''}>Bozza</option>
              <option value="approved" ${doc?.status === 'approved' ? 'selected' : ''}>Approvato</option>
              <option value="obsolete" ${doc?.status === 'obsolete' ? 'selected' : ''}>Obsoleto</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="form-label">Requisiti Collegati</label>
            <input type="text" name="linkedRequirements" value="${(doc?.linkedRequirements || []).join(', ')}" class="form-input" placeholder="Es. 4.3, 5.2, 7.5">
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="App.closeModal()" class="btn-secondary">Annulla</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Salva' : 'Aggiungi'}</button>
        </div>
      </form>
    `);

    document.getElementById('doc-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        name: fd.get('name'),
        code: fd.get('code'),
        version: fd.get('version'),
        issueDate: fd.get('issueDate'),
        status: fd.get('status'),
        linkedRequirements: fd.get('linkedRequirements')?.split(',').map(s => s.trim()).filter(Boolean) || []
      };

      try {
        if (isEdit) {
          await Store.updateDocument(project.id, doc.id, data);
          App.showToast('Documento aggiornato', 'success');
        } else {
          await Store.addDocument(project.id, data);
          App.showToast('Documento aggiunto', 'success');
        }
        App.closeModal();
        App.render();
      } catch (err) {
        App.showToast('Errore salvataggio documento: ' + err.message, 'error');
      }
    });
  },

  // ============================================================
  // TIMELINE
  // ============================================================
  timeline(project) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const milestones = (project.milestones || []).sort((a, b) => new Date(a.date) - new Date(b.date));
    const start = milestones[0]?.date ? new Date(milestones[0].date) : new Date();
    const end = milestones[milestones.length - 1]?.date ? new Date(milestones[milestones.length - 1].date) : new Date();
    const totalDays = Math.max((end - start) / 86400000, 1);
    const now = new Date();
    const nowOffset = Math.max(0, Math.min(100, ((now - start) / 86400000 / totalDays) * 100));

    return `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Timeline Progetto</h1>
          <p class="text-slate-500">${App.formatDate(milestones[0]?.date)} - ${App.formatDate(milestones[milestones.length - 1]?.date)}</p>
        </div>
        <button id="add-milestone-btn" class="btn-secondary">
          <i data-lucide="plus" class="w-4 h-4"></i> Aggiungi Milestone
        </button>
      </div>

      <!-- Visual Timeline -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <!-- Progress bar -->
        <div class="relative mb-8">
          <div class="h-2 bg-slate-100 rounded-full">
            <div class="h-2 bg-blue-500 rounded-full transition-all" style="width:${nowOffset}%"></div>
          </div>
          <div class="absolute top-0 h-2 w-0.5 bg-red-500" style="left:${nowOffset}%">
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-red-600 font-medium whitespace-nowrap">Oggi</div>
          </div>
        </div>

        <!-- Milestones -->
        <div class="space-y-4">
          ${milestones.map((m, i) => {
            const offset = Math.max(0, Math.min(100, ((new Date(m.date) - start) / 86400000 / totalDays) * 100));
            const isPast = new Date(m.date) < now;
            const days = App.daysUntil(m.date);
            return `
            <div class="flex items-center gap-4 milestone-row" data-idx="${i}">
              <div class="w-20 text-right text-xs text-slate-500 flex-shrink-0">${App.formatDate(m.date)}</div>
              <div class="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                <div class="w-4 h-4 rounded-full border-2 ${m.completed ? 'bg-emerald-500 border-emerald-500' : isPast ? 'bg-amber-400 border-amber-400' : 'bg-white border-slate-300'}"></div>
                ${i < milestones.length - 1 ? '<div class="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-200"></div>' : ''}
              </div>
              <div class="flex-1 flex items-center gap-3 p-3 rounded-lg ${m.completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}">
                <div class="flex-1">
                  <div class="font-medium text-sm ${m.completed ? 'text-emerald-800 line-through' : 'text-slate-800'}">${m.title}</div>
                </div>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" class="milestone-check w-4 h-4 rounded border-slate-300 text-emerald-600" data-ms-id="${m.id}" ${m.completed ? 'checked' : ''}>
                  <span class="text-xs text-slate-500">${m.completed ? 'Fatto' : days > 0 ? days + 'g' : 'Scaduto'}</span>
                </label>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  bindTimeline(project) {
    if (!project) return;

    // Toggle milestone
    document.querySelectorAll('.milestone-check').forEach(el => {
      el.addEventListener('change', async () => {
        const milestones = project.milestones || [];
        const ms = milestones.find(m => m.id === el.dataset.msId);
        if (ms) {
          ms.completed = el.checked;
          try {
            await Store.saveMilestones(project.id, milestones);
            App.render();
          } catch (err) {
            App.showToast('Errore aggiornamento milestone: ' + err.message, 'error');
          }
        }
      });
    });

    // Add milestone
    document.getElementById('add-milestone-btn')?.addEventListener('click', () => {
      App.showModal('Nuova Milestone', `
        <form id="milestone-form" class="space-y-4">
          <div>
            <label class="form-label">Titolo *</label>
            <input type="text" name="title" required class="form-input">
          </div>
          <div>
            <label class="form-label">Data *</label>
            <input type="date" name="date" required class="form-input">
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="App.closeModal()" class="btn-secondary">Annulla</button>
            <button type="submit" class="btn-primary">Aggiungi</button>
          </div>
        </form>
      `);

      document.getElementById('milestone-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const milestones = project.milestones || [];
        milestones.push({
          id: 'ms-' + Date.now(),
          title: fd.get('title'),
          date: fd.get('date'),
          type: 'custom',
          completed: false
        });
        try {
          await Store.saveMilestones(project.id, milestones);
          App.closeModal();
          App.showToast('Milestone aggiunta', 'success');
          App.render();
        } catch (err) {
          App.showToast('Errore aggiunta milestone: ' + err.message, 'error');
        }
      });
    });
  },

  // ============================================================
  // REPORTS
  // ============================================================
  reports(project) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const stats = Store.getProjectStats(project.id);
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);

    return `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Report e Esportazione</h1>
        <p class="text-slate-500">${project.clientName} - ${cert?.name}</p>
      </div>

      <!-- Export Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button id="export-gap-pdf" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <i data-lucide="file-text" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Report Gap Analysis</h3>
          <p class="text-sm text-slate-500 mt-1">Esporta il report completo della gap analysis in PDF</p>
        </button>

        <button id="export-plan-pdf" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <i data-lucide="list-checks" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Piano Implementazione</h3>
          <p class="text-sm text-slate-500 mt-1">Genera piano di implementazione con azioni e scadenze</p>
        </button>

        <button id="export-executive-pdf" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <i data-lucide="presentation" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Executive Summary</h3>
          <p class="text-sm text-slate-500 mt-1">Riepilogo per la direzione aziendale</p>
        </button>

        <button id="export-docs-checklist" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <i data-lucide="check-square" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Checklist Documenti</h3>
          <p class="text-sm text-slate-500 mt-1">Lista documenti obbligatori e il loro stato</p>
        </button>

        <button id="export-nc-register" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <i data-lucide="alert-circle" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Registro NC</h3>
          <p class="text-sm text-slate-500 mt-1">Registro non conformita con azioni correttive</p>
        </button>

        <button id="export-json" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all">
          <div class="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center mb-3">
            <i data-lucide="database" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Backup JSON</h3>
          <p class="text-sm text-slate-500 mt-1">Esporta tutti i dati in formato JSON</p>
        </button>
      </div>

      <!-- Quick Summary -->
      ${stats ? `
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-4">Riepilogo Veloce</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-emerald-600">${stats.implemented}</div>
            <div class="text-xs text-slate-500">Conformi</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-amber-600">${stats.partial}</div>
            <div class="text-xs text-slate-500">Parziali</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">${stats.notImplemented}</div>
            <div class="text-xs text-slate-500">Non conformi</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-400">${stats.notApplicable}</div>
            <div class="text-xs text-slate-500">N/A</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-300">${stats.notEvaluated}</div>
            <div class="text-xs text-slate-500">Da valutare</div>
          </div>
        </div>
      </div>
      ` : ''}
    </div>`;
  },

  bindReports(project) {
    if (!project) return;

    document.getElementById('export-gap-pdf')?.addEventListener('click', () => PDFExport.gapAnalysis(project));
    document.getElementById('export-plan-pdf')?.addEventListener('click', () => PDFExport.implementationPlan(project));
    document.getElementById('export-executive-pdf')?.addEventListener('click', () => PDFExport.executiveSummary(project));
    document.getElementById('export-docs-checklist')?.addEventListener('click', () => PDFExport.docsChecklist(project));
    document.getElementById('export-nc-register')?.addEventListener('click', () => PDFExport.ncRegister(project));
    document.getElementById('export-json')?.addEventListener('click', () => App.exportData());
  }
};
