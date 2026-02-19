/**
 * ProjectsView - Project list and project form rendering and binding
 */
const ProjectsView = {

  projectList() {
    const projects = Store.getProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Progetti</h1>
          <p class="text-slate-500">${projects.length} progett${projects.length === 1 ? 'o' : 'i'} di certificazione</p>
        </div>
        <button onclick="App.navigate('new-project')" class="btn-primary flex-shrink-0">
          <i data-lucide="plus" class="w-4 h-4"></i> Nuovo Progetto
        </button>
      </div>

      ${projects.length === 0 ? `
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: var(--primary-lighter);">
          <i data-lucide="folder-plus" class="w-8 h-8" style="color: var(--primary-text-light);"></i>
        </div>
        <h3 class="font-semibold text-slate-800 mb-2">Nessun progetto</h3>
        <p class="text-slate-500 mb-4">Crea il tuo primo progetto di certificazione per iniziare</p>
        <button onclick="App.navigate('new-project')" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Crea Progetto
        </button>
      </div>
      ` : `
      <!-- Search bar -->
      <div class="relative">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
        <input type="text" id="projects-search" placeholder="Cerca progetto per cliente, settore, fase..."
               class="form-input pl-9 pr-3" />
      </div>

      <!-- Results counter -->
      <div id="projects-counter" class="text-sm text-slate-500"></div>

      <div id="projects-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${projects.map(p => {
          const stats = Store.getProjectStats(p.id);
          const cert = CERTIFICATIONS.find(c => c.id === p.certificationId);
          const isActive = Store.getActiveProjectId() === p.id;
          const searchText = [p.clientName, p.sector, App.phaseLabel(p.phase), cert?.name].filter(Boolean).join(' ').toLowerCase();
          return `
          <div class="bg-white rounded-xl border ${isActive ? '' : 'border-slate-200'} p-5 hover:shadow-md transition-all project-card" data-project-id="${p.id}" data-search-text="${searchText}"
               ${isActive ? `style="border-color: var(--primary-light); box-shadow: 0 0 0 2px var(--focus-ring);"` : ''}>
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color:${cert?.color || '#2563eb'}15">
                <i data-lucide="shield-check" class="w-5 h-5" style="color:${cert?.color || '#2563eb'}"></i>
              </div>
              <div class="flex items-center gap-1">
                ${isActive ? `<span class="text-xs px-2 py-0.5 rounded font-medium" style="background-color: var(--badge-bg); color: var(--badge-text);">Attivo</span>` : ''}
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
                <div class="h-2 rounded-full transition-all" style="background-color: var(--progress-bar); width:${stats?.progressPercent || 0}%"></div>
              </div>
              <span class="text-xs font-medium text-slate-600">${stats?.progressPercent || 0}%</span>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div id="projects-empty-search" class="hidden bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-100">
          <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
        </div>
        <h3 class="font-semibold text-slate-800 mb-2">Nessun progetto trovato</h3>
        <p class="text-slate-500">Prova con un termine di ricerca diverso</p>
      </div>
      `}
    </div>`;
  },

  bindProjectList() {
    // Search filter
    const searchInput = document.getElementById('projects-search');
    const grid = document.getElementById('projects-grid');
    const counter = document.getElementById('projects-counter');
    const emptySearch = document.getElementById('projects-empty-search');
    const allCards = grid ? Array.from(grid.querySelectorAll('.project-card')) : [];
    const totalCount = allCards.length;

    if (counter && totalCount > 0) {
      counter.textContent = `${totalCount} di ${totalCount} progetti`;
    }

    if (searchInput) {
      searchInput.addEventListener('keyup', () => {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        for (const card of allCards) {
          const text = card.dataset.searchText || '';
          const match = !query || text.includes(query);
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        }

        if (counter) {
          counter.textContent = query
            ? `${visibleCount} di ${totalCount} progetti`
            : `${totalCount} di ${totalCount} progetti`;
        }

        if (emptySearch && grid) {
          if (visibleCount === 0 && query) {
            grid.classList.add('hidden');
            emptySearch.classList.remove('hidden');
          } else {
            grid.classList.remove('hidden');
            emptySearch.classList.add('hidden');
          }
        }
      });
    }

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

  projectForm(project = null) {
    const isEdit = !!project;
    return `
    <div class="p-6 max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">${isEdit ? 'Modifica Progetto' : 'Nuovo Progetto'}</h1>
        <p class="text-slate-500">${isEdit ? 'Aggiorna i dati del progetto' : 'Inserisci i dati del cliente e del progetto'}</p>
      </div>

      <form id="project-form" class="space-y-6">
        <!-- Client Selector -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i data-lucide="building-2" class="w-5 h-5 text-slate-400"></i> Cliente
          </h3>
          <div class="mb-4">
            <label class="form-label">Seleziona Cliente *</label>
            <select id="client-selector" name="clientId" class="form-input">
              <option value="">-- Nuovo cliente --</option>
              ${Store.getClients().map(c =>
                `<option value="${c.id}" ${project?.clientId === c.id ? 'selected' : ''}>${c.companyName}${c.sector ? ' (' + c.sector + ')' : ''}</option>`
              ).join('')}
            </select>
          </div>

          <!-- Inline client fields (shown when "Nuovo cliente" or no client selected) -->
          <div id="inline-client-fields" class="${project?.clientId ? 'hidden' : ''}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="form-label">Ragione Sociale *</label>
                <input type="text" id="inline-companyName" name="clientName" value="${project?.clientName || ''}" class="form-input" placeholder="Es. Acme S.r.l.">
              </div>
              <div>
                <label class="form-label">Settore</label>
                <input type="text" id="inline-sector" name="sector" value="${project?.sector || ''}" class="form-input" placeholder="Es. Manifatturiero">
              </div>
              <div>
                <label class="form-label">Codice ATECO</label>
                <input type="text" id="inline-ateco" name="ateco" value="${project?.ateco || ''}" class="form-input" placeholder="Es. 25.11.00">
              </div>
              <div>
                <label class="form-label">N. Dipendenti</label>
                <input type="text" id="inline-employees" name="employees" value="${project?.employees || ''}" class="form-input" placeholder="Es. 50">
              </div>
              <div>
                <label class="form-label">Sede Legale</label>
                <input type="text" id="inline-legalAddress" name="legalAddress" value="${project?.legalAddress || ''}" class="form-input">
              </div>
              <div class="md:col-span-2">
                <label class="form-label">Sedi Operative</label>
                <input type="text" id="inline-operationalSites" name="operationalSites" value="${project?.operationalSites || ''}" class="form-input" placeholder="Separare con virgola">
              </div>
            </div>

            <h4 class="font-medium text-slate-700 mt-4 mb-3 flex items-center gap-2">
              <i data-lucide="user" class="w-4 h-4 text-slate-400"></i> Referente Aziendale
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nome e Cognome</label>
                <input type="text" id="inline-contactName" name="contactName" value="${project?.contactName || ''}" class="form-input">
              </div>
              <div>
                <label class="form-label">Ruolo</label>
                <input type="text" id="inline-contactRole" name="contactRole" value="${project?.contactRole || ''}" class="form-input" placeholder="Es. Responsabile Qualita">
              </div>
              <div>
                <label class="form-label">Email</label>
                <input type="email" id="inline-contactEmail" name="contactEmail" value="${project?.contactEmail || ''}" class="form-input">
              </div>
              <div>
                <label class="form-label">Telefono</label>
                <input type="tel" id="inline-contactPhone" name="contactPhone" value="${project?.contactPhone || ''}" class="form-input">
              </div>
            </div>
          </div>

          <!-- Client summary (shown when an existing client is selected) -->
          <div id="selected-client-summary" class="${project?.clientId ? '' : 'hidden'}">
            <div class="bg-slate-50 rounded-lg p-4 text-sm">
              <div id="client-summary-content" class="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
              </div>
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

        <!-- Certificazione e Rinnovo -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-slate-400"></i> Certificazione e Rinnovo
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Stato Certificazione</label>
              <select name="certificationStatus" class="form-input">
                <option value="in_progress" ${project?.certificationStatus === 'in_progress' || !project?.certificationStatus ? 'selected' : ''}>In corso</option>
                <option value="certified" ${project?.certificationStatus === 'certified' ? 'selected' : ''}>Certificato</option>
                <option value="expired" ${project?.certificationStatus === 'expired' ? 'selected' : ''}>Scaduto</option>
                <option value="suspended" ${project?.certificationStatus === 'suspended' ? 'selected' : ''}>Sospeso</option>
              </select>
            </div>
            <div>
              <label class="form-label">Ciclo Audit</label>
              <select name="auditCycle" class="form-input">
                <option value="annual" ${project?.auditCycle === 'annual' || !project?.auditCycle ? 'selected' : ''}>Annuale</option>
                <option value="semi-annual" ${project?.auditCycle === 'semi-annual' ? 'selected' : ''}>Semestrale</option>
              </select>
            </div>
            <div>
              <label class="form-label">Data Certificazione</label>
              <input type="date" name="certificationDate" value="${project?.certificationDate || ''}" class="form-input">
            </div>
            <div>
              <label class="form-label">Scadenza Certificazione</label>
              <input type="date" name="certificationExpiry" value="${project?.certificationExpiry || ''}" class="form-input">
            </div>
            <div>
              <label class="form-label">Prossimo Audit di Sorveglianza</label>
              <input type="date" name="nextAuditDate" value="${project?.nextAuditDate || ''}" class="form-input">
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

  _renderClientSummary(client) {
    if (!client) return '';
    const rows = [
      ['Ragione Sociale', client.companyName],
      ['Settore', client.sector],
      ['ATECO', client.ateco],
      ['Dipendenti', client.employees],
      ['Sede Legale', client.legalAddress],
      ['Sedi Operative', client.operationalSites],
      ['Referente', client.contactName],
      ['Ruolo', client.contactRole],
      ['Email', client.contactEmail],
      ['Telefono', client.contactPhone],
    ];
    return rows
      .filter(([, v]) => v)
      .map(([label, value]) => `<div><span class="text-slate-500">${label}:</span> <span class="font-medium text-slate-700">${value}</span></div>`)
      .join('');
  },

  bindProjectForm(project = null) {
    // Client selector toggle logic
    const selector = document.getElementById('client-selector');
    const inlineFields = document.getElementById('inline-client-fields');
    const summaryPanel = document.getElementById('selected-client-summary');
    const summaryContent = document.getElementById('client-summary-content');

    const updateClientView = () => {
      const selectedId = selector ? parseInt(selector.value) : null;
      if (selectedId) {
        const client = Store.getClient(selectedId);
        if (client) {
          inlineFields.classList.add('hidden');
          summaryPanel.classList.remove('hidden');
          summaryContent.innerHTML = this._renderClientSummary(client);
        }
      } else {
        inlineFields.classList.remove('hidden');
        summaryPanel.classList.add('hidden');
      }
      if (window.lucide) lucide.createIcons();
    };

    if (selector) {
      selector.addEventListener('change', updateClientView);
      // If editing a project with a linked client, show summary immediately
      if (project?.clientId) {
        updateClientView();
      }
    }

    document.getElementById('project-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());
      const selectedClientId = selector ? selector.value : '';

      try {
        if (selectedClientId) {
          // Existing client selected - send clientId, populate clientName from client record
          data.clientId = parseInt(selectedClientId);
          const linkedClient = Store.getClient(data.clientId);
          data.clientName = linkedClient ? linkedClient.companyName : '';

          delete data.sector;
          delete data.ateco;
          delete data.employees;
          delete data.legalAddress;
          delete data.operationalSites;
          delete data.contactName;
          delete data.contactRole;
          delete data.contactEmail;
          delete data.contactPhone;
        } else {
          // New client: create client first, then link to project
          const companyName = (data.clientName || '').trim();
          if (!companyName) {
            App.showToast('Ragione Sociale è obbligatoria', 'error');
            return;
          }
          const newClient = await Store.createClient({
            companyName: data.clientName,
            sector: data.sector,
            ateco: data.ateco,
            employees: data.employees,
            legalAddress: data.legalAddress,
            operationalSites: data.operationalSites,
            contactName: data.contactName,
            contactRole: data.contactRole,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
          });
          data.clientId = newClient.id;
        }

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
  }
};
