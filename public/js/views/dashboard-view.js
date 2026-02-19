/**
 * DashboardView - Dashboard rendering and binding
 */
const DashboardView = {

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
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
        ${this._statCard('Conformit\u00e0', stats?.compliancePercent + '%', 'Requisiti implementati', 'check-circle', 'emerald')}
        ${this._statCard('Progresso', stats?.progressPercent + '%', 'Avanzamento complessivo', 'trending-up', 'blue')}
        ${this._statCard('Criticit\u00e0', stats?.notImplemented || 0, 'Requisiti non conformi', 'alert-triangle', 'red')}
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
                  <a href="#" data-view="clause" data-clause="${cl.number}" class="text-sm text-slate-700 transition-colors"
                     onmouseenter="this.style.color='var(--primary-text-light)'" onmouseleave="this.style.color=''">
                    <span class="font-medium">${cl.number}.</span> ${cl.title}
                  </a>
                  <span class="text-xs font-medium ${progress === 100 ? 'text-emerald-600' : 'text-slate-500'}">${progress}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : progress > 0 && progress <= 50 ? 'bg-amber-500' : progress === 0 ? 'bg-slate-200' : ''}"
                       style="width: ${progress}%;${progress > 50 && progress < 100 ? ' background-color: var(--progress-bar);' : ''}"></div>
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
          <img src="/img/logo.png" alt="Trust ISO" class="w-20 h-20 object-contain">
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
          <div class="bg-white rounded-xl border border-slate-200 p-5 ${cert.comingSoon ? 'opacity-60' : 'cursor-pointer'} transition-all cert-card"
               data-cert-id="${cert.id}"
               ${cert.comingSoon ? '' : `onmouseenter="this.style.borderColor='var(--primary-light)';this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,.1)'" onmouseleave="this.style.borderColor='';this.style.boxShadow=''"`}>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background-color: ${cert.color}15">
              <i data-lucide="${cert.icon === 'shield-check' ? 'shield-check' : cert.icon === 'leaf' ? 'leaf' : cert.icon === 'hard-hat' ? 'hard-hat' : 'lock'}"
                 class="w-6 h-6" style="color: ${cert.color}"></i>
            </div>
            <h3 class="font-bold text-slate-800">${cert.name}</h3>
            <p class="text-sm text-slate-500 mt-1">${cert.fullName}</p>
            ${cert.comingSoon ?
              '<span class="inline-block mt-3 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded">Prossimamente</span>' :
              `<span class="inline-block mt-3 text-xs font-medium px-2 py-1 rounded" style="background-color: var(--badge-bg); color: var(--badge-text);">${countRequirements(cert.clauses)} requisiti</span>`
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
                <div class="h-1.5 rounded-full" style="background-color: var(--progress-bar); width:${stats?.progressPercent || 0}%"></div>
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
      red: 'bg-red-50 text-red-600',
      amber: 'bg-amber-50 text-amber-600',
      slate: 'bg-slate-50 text-slate-600'
    };
    const isThemed = color === 'blue';
    return `
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-slate-500">${title}</span>
        <div class="w-8 h-8 rounded-lg ${isThemed ? '' : colors[color] || ''} flex items-center justify-center"
             ${isThemed ? `style="background-color: var(--primary-lighter); color: var(--primary-text-light);"` : ''}>
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
      return '<p class="text-sm text-slate-500 py-4 text-center">Nessuna criticit\u00e0 ad alta priorit\u00e0 rilevata</p>';
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
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: var(--primary-light); color: var(--primary-text-light);">
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
    clauses.forEach(([_num, cs], i) => {
      const applicable = cs.total - cs.notApplicable;
      const val = applicable > 0 ? (cs.implemented + cs.partial * 0.5) / applicable : 0;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    const chartFill = getComputedStyle(document.documentElement).getPropertyValue('--chart-fill').trim() || 'rgba(37, 99, 235, 0.15)';
    const chartStroke = getComputedStyle(document.documentElement).getPropertyValue('--chart-stroke').trim() || '#2563eb';
    ctx.fillStyle = chartFill;
    ctx.fill();
    ctx.strokeStyle = chartStroke;
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
      ctx.fillStyle = chartStroke;
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
  }
};
