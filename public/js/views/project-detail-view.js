/**
 * ProjectDetailView - Project detail rendering and binding
 */
const ProjectDetailView = {

  projectDetail(project) {
    if (!project) return '<div class="p-6"><p class="text-slate-500">Nessun progetto selezionato</p></div>';
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    // Prefer linked client data when available, fall back to project fields
    const client = project.clientId ? Store.getClient(project.clientId) : null;
    const clientName = client ? client.companyName : project.clientName;
    const sector = client ? client.sector : project.sector;
    const ateco = client ? client.ateco : project.ateco;
    const employees = client ? client.employees : project.employees;
    const legalAddress = client ? client.legalAddress : project.legalAddress;
    const operationalSites = client ? client.operationalSites : project.operationalSites;
    const contactName = client ? client.contactName : project.contactName;
    const contactRole = client ? client.contactRole : project.contactRole;
    const contactEmail = client ? client.contactEmail : project.contactEmail;
    const contactPhone = client ? client.contactPhone : project.contactPhone;
    return `
    <div class="p-6 max-w-4xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl font-bold text-slate-800 truncate">${clientName}</h1>
          <p class="text-slate-500">${cert?.name || ''} - ${App.phaseLabel(project.phase)}</p>
        </div>
        <button onclick="App.navigate('edit-project')" class="btn-secondary flex-shrink-0 self-start">
          <i data-lucide="edit" class="w-4 h-4"></i> Modifica
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Client Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <i data-lucide="building-2" class="w-4 h-4 text-slate-400"></i> Dati Cliente
            ${client ? '<span class="text-xs font-normal text-slate-400">(da anagrafica)</span>' : ''}
          </h3>
          <dl class="space-y-2 text-sm">
            ${this._dlRow('Ragione Sociale', clientName)}
            ${this._dlRow('Settore', sector)}
            ${this._dlRow('ATECO', ateco)}
            ${this._dlRow('Dipendenti', employees)}
            ${this._dlRow('Sede Legale', legalAddress)}
            ${this._dlRow('Sedi Operative', operationalSites)}
          </dl>
        </div>

        <!-- Contact Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <i data-lucide="user" class="w-4 h-4 text-slate-400"></i> Referente
          </h3>
          <dl class="space-y-2 text-sm">
            ${this._dlRow('Nome', contactName)}
            ${this._dlRow('Ruolo', contactRole)}
            ${this._dlRow('Email', contactEmail)}
            ${this._dlRow('Telefono', contactPhone)}
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

      <!-- Stato Certificazione Section -->
      <div class="bg-white rounded-xl border border-slate-200 p-5" id="certification-status-section">
        <h3 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <i data-lucide="award" class="w-4 h-4 text-slate-400"></i> Stato Certificazione
        </h3>
        <div id="certification-status-content">
          <div class="text-sm text-slate-400 text-center py-4">Caricamento stato certificazione...</div>
        </div>
      </div>

      <!-- Full Changelog Section -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
        <div id="project-changelog-list" class="overflow-x-auto">
          <div class="text-sm text-slate-400 text-center py-4">Caricamento change log...</div>
        </div>
      </div>
    </div>`;
  },

  _dlRow(label, value) {
    return `<div><dt class="text-slate-500">${label}</dt><dd class="font-medium text-slate-800">${value || '-'}</dd></div>`;
  },

  _certStatusLabel(status) {
    const labels = {
      'in_progress': 'In corso',
      'certified': 'Certificato',
      'expired': 'Scaduto',
      'suspended': 'Sospeso'
    };
    return labels[status] || status || 'Non impostato';
  },

  _certStatusBadge(status) {
    const styles = {
      'in_progress': 'bg-blue-100 text-blue-700',
      'certified': 'bg-emerald-100 text-emerald-700',
      'expired': 'bg-red-100 text-red-700',
      'suspended': 'bg-amber-100 text-amber-700'
    };
    const cls = styles[status] || 'bg-slate-100 text-slate-600';
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}">${this._certStatusLabel(status)}</span>`;
  },

  _auditCycleLabel(cycle) {
    const labels = { 'annual': 'Annuale', 'semi-annual': 'Semestrale' };
    return labels[cycle] || cycle || 'Non impostato';
  },

  _daysRemainingBadge(days) {
    if (days === null || days === undefined) return '<span class="text-sm text-slate-400">Non impostato</span>';
    let colorClass;
    if (days < 0) {
      colorClass = 'text-red-600 bg-red-50';
    } else if (days < 30) {
      colorClass = 'text-red-600 bg-red-50';
    } else if (days <= 90) {
      colorClass = 'text-amber-600 bg-amber-50';
    } else {
      colorClass = 'text-emerald-600 bg-emerald-50';
    }
    const label = days < 0 ? `Scaduto da ${Math.abs(days)} giorni` : `${days} giorni rimanenti`;
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}">${label}</span>`;
  },

  _renderCertificationStatus(certStatus, project) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 w-40">Stato:</span>
            ${this._certStatusBadge(certStatus.status)}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 w-40">Ciclo Audit:</span>
            <span class="text-sm font-medium text-slate-800">${this._auditCycleLabel(certStatus.auditCycle)}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 w-40">Data Certificazione:</span>
            <span class="text-sm font-medium text-slate-800">${certStatus.certificationDate ? App.formatDate(certStatus.certificationDate) : 'Non impostato'}</span>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 w-40">Scadenza:</span>
            <span class="text-sm font-medium text-slate-800">${certStatus.certificationExpiry ? App.formatDate(certStatus.certificationExpiry) : 'Non impostato'}</span>
            ${certStatus.daysUntilExpiry !== null ? this._daysRemainingBadge(certStatus.daysUntilExpiry) : ''}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 w-40">Prossimo Audit:</span>
            <span class="text-sm font-medium text-slate-800">${certStatus.nextAuditDate ? App.formatDate(certStatus.nextAuditDate) : 'Non impostato'}</span>
            ${certStatus.daysUntilAudit !== null ? this._daysRemainingBadge(certStatus.daysUntilAudit) : ''}
          </div>
        </div>
      </div>`;
  },

  async _loadCertificationStatus(project) {
    const container = document.getElementById('certification-status-content');
    if (!container) return;
    try {
      const certStatus = await ApiClient.getCertificationStatus(project.id);
      container.innerHTML = this._renderCertificationStatus(certStatus, project);
    } catch (err) {
      container.innerHTML = '<div class="text-sm text-red-500 text-center py-4">Errore nel caricamento dello stato certificazione</div>';
    }
  },

  bindProjectDetail(project) {
    if (!project) return;

    // Load certification status asynchronously
    this._loadCertificationStatus(project);

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
