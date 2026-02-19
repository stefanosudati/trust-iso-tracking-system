/**
 * ProjectDetailView - Project detail rendering and binding
 */
const ProjectDetailView = {

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

      <!-- Full Changelog Section -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2">
            <i data-lucide="history" class="w-4 h-4 text-slate-400"></i> Change Log Completo
          </h3>
          <div class="flex items-center gap-2">
            <select id="changelog-filter-req" class="form-input text-sm py-1 px-2">
              <option value="">Tutti i requisiti</option>
            </select>
            <button id="changelog-load-more" class="btn-secondary text-sm hidden">Carica altri</button>
          </div>
        </div>
        <div id="project-changelog-list">
          <div class="text-sm text-slate-400 text-center py-4">Caricamento change log...</div>
        </div>
      </div>
    </div>`;
  },

  _dlRow(label, value) {
    return `<div><dt class="text-slate-500">${label}</dt><dd class="font-medium text-slate-800">${value || '-'}</dd></div>`;
  },

  bindProjectDetail(project) {
    if (!project) return;

    let currentOffset = 0;
    const pageSize = 50;

    const loadChangelog = async (offset = 0, append = false) => {
      try {
        const data = await ApiClient.getProjectChangelog(project.id, pageSize, offset);
        const container = document.getElementById('project-changelog-list');

        if (data.entries.length === 0 && offset === 0) {
          container.innerHTML = '<div class="text-sm text-slate-400 text-center py-4">Nessuna modifica registrata</div>';
          return;
        }

        let html = '';
        for (const entry of data.entries) {
          const time = new Date(entry.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
          const date = App.formatDate(entry.created_at);
          html += `
            <div class="flex items-center gap-3 py-2 px-2 text-sm border-b border-slate-50 hover:bg-slate-50 rounded">
              <span class="text-xs text-slate-400 w-24 flex-shrink-0">${date} ${time}</span>
              <a href="#" class="changelog-req-link font-medium w-14 flex-shrink-0" style="color: var(--primary-text-light);"
                 data-req="${entry.requirement_id}">${entry.requirement_id}</a>
              <span class="text-slate-600 w-24 flex-shrink-0">${Views._fieldLabel(entry.field)}</span>
              <span class="text-slate-500 flex-1 truncate">${Views._formatChangeValue(entry.field, entry.old_value)} &rarr; ${Views._formatChangeValue(entry.field, entry.new_value)}</span>
              <span class="text-xs text-slate-400 w-28 flex-shrink-0 text-right">${entry.user_name}</span>
            </div>`;
        }

        if (append) {
          container.insertAdjacentHTML('beforeend', html);
        } else {
          container.innerHTML = html;
        }

        const loadMoreBtn = document.getElementById('changelog-load-more');
        if (data.total > offset + pageSize) {
          loadMoreBtn.classList.remove('hidden');
        } else {
          loadMoreBtn.classList.add('hidden');
        }

        // Bind requirement links
        container.querySelectorAll('.changelog-req-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            App.navigate('requirement', { currentRequirement: link.dataset.req });
          });
        });

        if (window.lucide) lucide.createIcons();
      } catch (err) {
        document.getElementById('project-changelog-list').innerHTML =
          '<div class="text-sm text-red-500 text-center py-4">Errore: ' + err.message + '</div>';
      }
    };

    // Initial load
    loadChangelog(0);

    // Load more
    document.getElementById('changelog-load-more')?.addEventListener('click', () => {
      currentOffset += pageSize;
      loadChangelog(currentOffset, true);
    });

    // Filter by requirement
    document.getElementById('changelog-filter-req')?.addEventListener('change', async (e) => {
      const reqId = e.target.value;
      if (reqId) {
        try {
          const data = await ApiClient.getRequirementChangelog(project.id, reqId);
          document.getElementById('project-changelog-list').innerHTML =
            Views._renderChangelogEntries(data.entries);
          document.getElementById('changelog-load-more').classList.add('hidden');
          if (window.lucide) lucide.createIcons();
        } catch (err) {
          document.getElementById('project-changelog-list').innerHTML =
            '<div class="text-sm text-red-500 text-center py-4">Errore</div>';
        }
      } else {
        currentOffset = 0;
        loadChangelog(0);
      }
    });

    // Populate requirement filter dropdown
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (cert) {
      const allReqs = flattenRequirements(cert.clauses);
      const select = document.getElementById('changelog-filter-req');
      allReqs.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.id + ' - ' + App.truncate(r.title, 30);
        select.appendChild(opt);
      });
    }
  }
};
