/**
 * ClientsView - Client list with search, inline create/edit form, and delete.
 */
const ClientsView = {

  _editingClientId: null,

  clientsList() {
    const clients = ApiClient.getClients();
    this._editingClientId = null;

    return `
    <div class="p-6 space-y-6 max-w-5xl">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Clienti</h1>
          <p class="text-slate-500">${clients.length} client${clients.length === 1 ? 'e' : 'i'} registrat${clients.length === 1 ? 'o' : 'i'}</p>
        </div>
        <button id="btn-toggle-client-form" class="btn-primary flex-shrink-0">
          <i data-lucide="plus" class="w-4 h-4"></i> Nuovo Cliente
        </button>
      </div>

      <!-- Search bar -->
      <div class="relative">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
        <input type="text" id="clients-search" placeholder="Cerca cliente per nome, settore, ATECO o referente..."
               class="form-input pl-9 pr-3" />
      </div>

      <!-- Inline form (hidden by default) -->
      <div id="client-form-section" class="hidden">
        <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 id="client-form-title" class="text-lg font-semibold text-slate-800">Nuovo Cliente</h2>
          <form id="client-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="form-label">Ragione Sociale *</label>
                <input type="text" id="cf-companyName" class="form-input" placeholder="Es. Acme S.r.l." required>
              </div>
              <div>
                <label class="form-label">Settore</label>
                <input type="text" id="cf-sector" class="form-input" placeholder="Es. Manifatturiero">
              </div>
              <div>
                <label class="form-label">Codice ATECO</label>
                <input type="text" id="cf-ateco" class="form-input" placeholder="Es. 25.11.00">
              </div>
              <div>
                <label class="form-label">N. Dipendenti</label>
                <input type="text" id="cf-employees" class="form-input" placeholder="Es. 50">
              </div>
              <div>
                <label class="form-label">Sede Legale</label>
                <input type="text" id="cf-legalAddress" class="form-input">
              </div>
              <div class="md:col-span-2">
                <label class="form-label">Sedi Operative</label>
                <input type="text" id="cf-operationalSites" class="form-input" placeholder="Separare con virgola">
              </div>
            </div>

            <h4 class="font-medium text-slate-700 flex items-center gap-2">
              <i data-lucide="user" class="w-4 h-4 text-slate-400"></i> Referente Aziendale
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nome e Cognome</label>
                <input type="text" id="cf-contactName" class="form-input">
              </div>
              <div>
                <label class="form-label">Ruolo</label>
                <input type="text" id="cf-contactRole" class="form-input" placeholder="Es. Responsabile Qualita">
              </div>
              <div>
                <label class="form-label">Email</label>
                <input type="email" id="cf-contactEmail" class="form-input">
              </div>
              <div>
                <label class="form-label">Telefono</label>
                <input type="tel" id="cf-contactPhone" class="form-input">
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="form-label">Note</label>
              <textarea id="cf-notes" rows="2" class="form-input"></textarea>
            </div>

            <div class="flex items-center gap-3">
              <button type="submit" class="btn-primary">
                <i data-lucide="save" class="w-4 h-4"></i> <span id="client-form-submit-label">Crea Cliente</span>
              </button>
              <button type="button" id="btn-cancel-client-form" class="btn-secondary">Annulla</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Results counter -->
      <div id="clients-counter" class="text-sm text-slate-500"></div>

      <!-- Client cards grid -->
      ${clients.length === 0 ? `
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: var(--primary-lighter);">
          <i data-lucide="building-2" class="w-8 h-8" style="color: var(--primary-text-light);"></i>
        </div>
        <h3 class="font-semibold text-slate-800 mb-2">Nessun cliente</h3>
        <p class="text-slate-500 mb-4">Aggiungi il tuo primo cliente per iniziare</p>
      </div>
      ` : `
      <div id="clients-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${clients.map(c => this._renderClientCard(c)).join('')}
      </div>
      <div id="clients-empty-search" class="hidden bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-100">
          <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
        </div>
        <h3 class="font-semibold text-slate-800 mb-2">Nessun cliente trovato</h3>
        <p class="text-slate-500">Prova con un termine di ricerca diverso</p>
      </div>
      `}
    </div>`;
  },

  _renderClientCard(c) {
    return `
      <div class="client-card bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
           data-client-id="${c.id}"
           data-search-text="${(c.companyName || '').toLowerCase()} ${(c.sector || '').toLowerCase()} ${(c.ateco || '').toLowerCase()} ${(c.contactName || '').toLowerCase()}">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: var(--primary-lighter);">
            <i data-lucide="building-2" class="w-5 h-5" style="color: var(--primary-text-light);"></i>
          </div>
          <div class="flex items-center gap-1">
            <button class="client-edit p-1.5 rounded hover:bg-slate-100 text-slate-400" data-id="${c.id}" title="Modifica">
              <i data-lucide="pencil" class="w-4 h-4"></i>
            </button>
            <button class="client-delete p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600" data-id="${c.id}" title="Elimina">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <h3 class="font-semibold text-slate-800 mb-1">${c.companyName || 'Senza nome'}</h3>
        ${c.sector ? `<p class="text-sm text-slate-500 mb-1">${c.sector}</p>` : ''}
        ${c.ateco ? `<p class="text-xs text-slate-400 mb-2">ATECO: ${c.ateco}</p>` : '<div class="mb-2"></div>'}
        ${c.contactName ? `
        <div class="flex items-center gap-1.5 text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100">
          <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
          <span>${c.contactName}${c.contactRole ? ' — ' + c.contactRole : ''}</span>
        </div>` : ''}
        ${c.contactEmail ? `
        <div class="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
          <i data-lucide="mail" class="w-3.5 h-3.5 text-slate-400"></i>
          <span>${c.contactEmail}</span>
        </div>` : ''}
      </div>`;
  },

  bindClientsList() {
    const searchInput = document.getElementById('clients-search');
    const grid = document.getElementById('clients-grid');
    const counter = document.getElementById('clients-counter');
    const emptySearch = document.getElementById('clients-empty-search');
    const allCards = grid ? Array.from(grid.querySelectorAll('.client-card')) : [];
    const totalCount = allCards.length;

    // Update counter initially
    if (counter && totalCount > 0) {
      counter.textContent = `${totalCount} di ${totalCount} clienti`;
    }

    // Search filter
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
            ? `${visibleCount} di ${totalCount} clienti`
            : `${totalCount} di ${totalCount} clienti`;
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

    // Toggle form
    const toggleBtn = document.getElementById('btn-toggle-client-form');
    const formSection = document.getElementById('client-form-section');
    if (toggleBtn && formSection) {
      toggleBtn.addEventListener('click', () => {
        this._editingClientId = null;
        this._resetForm();
        document.getElementById('client-form-title').textContent = 'Nuovo Cliente';
        document.getElementById('client-form-submit-label').textContent = 'Crea Cliente';
        formSection.classList.toggle('hidden');
        if (window.lucide) lucide.createIcons();
      });
    }

    // Cancel form
    const cancelBtn = document.getElementById('btn-cancel-client-form');
    if (cancelBtn && formSection) {
      cancelBtn.addEventListener('click', () => {
        formSection.classList.add('hidden');
        this._editingClientId = null;
        this._resetForm();
      });
    }

    // Submit form (create or update)
    const form = document.getElementById('client-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = this._getFormData();

        if (!data.companyName.trim()) {
          App.showToast('Ragione Sociale è obbligatoria', 'error');
          return;
        }

        try {
          if (this._editingClientId) {
            await ApiClient.updateClient(this._editingClientId, data);
            App.showToast('Cliente aggiornato', 'success');
          } else {
            await ApiClient.createClient(data);
            App.showToast('Cliente creato', 'success');
          }
          this._editingClientId = null;
          this._refreshView();
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        }
      });
    }

    // Edit buttons
    document.querySelectorAll('.client-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const client = ApiClient.getClient(id);
        if (!client) return;

        this._editingClientId = id;
        this._populateForm(client);
        document.getElementById('client-form-title').textContent = 'Modifica Cliente';
        document.getElementById('client-form-submit-label').textContent = 'Salva Modifiche';
        formSection.classList.remove('hidden');
        formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (window.lucide) lucide.createIcons();
      });
    });

    // Delete buttons
    document.querySelectorAll('.client-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
        try {
          await ApiClient.deleteClient(id);
          App.showToast('Cliente eliminato', 'success');
          this._refreshView();
        } catch (err) {
          if (err.message.includes('progetti associati')) {
            App.showToast('Impossibile eliminare: il cliente ha dei progetti associati', 'error');
          } else {
            App.showToast('Errore: ' + err.message, 'error');
          }
        }
      });
    });
  },

  _getFormData() {
    return {
      companyName: document.getElementById('cf-companyName').value,
      sector: document.getElementById('cf-sector').value,
      ateco: document.getElementById('cf-ateco').value,
      employees: document.getElementById('cf-employees').value,
      legalAddress: document.getElementById('cf-legalAddress').value,
      operationalSites: document.getElementById('cf-operationalSites').value,
      contactName: document.getElementById('cf-contactName').value,
      contactRole: document.getElementById('cf-contactRole').value,
      contactEmail: document.getElementById('cf-contactEmail').value,
      contactPhone: document.getElementById('cf-contactPhone').value,
    };
  },

  _populateForm(client) {
    document.getElementById('cf-companyName').value = client.companyName || '';
    document.getElementById('cf-sector').value = client.sector || '';
    document.getElementById('cf-ateco').value = client.ateco || '';
    document.getElementById('cf-employees').value = client.employees || '';
    document.getElementById('cf-legalAddress').value = client.legalAddress || '';
    document.getElementById('cf-operationalSites').value = client.operationalSites || '';
    document.getElementById('cf-contactName').value = client.contactName || '';
    document.getElementById('cf-contactRole').value = client.contactRole || '';
    document.getElementById('cf-contactEmail').value = client.contactEmail || '';
    document.getElementById('cf-contactPhone').value = client.contactPhone || '';
  },

  _resetForm() {
    const form = document.getElementById('client-form');
    if (form) form.reset();
  },

  _refreshView() {
    const main = document.getElementById('main-content');
    main.innerHTML = ClientsView.clientsList();
    ClientsView.bindClientsList();
    if (window.lucide) lucide.createIcons();
  },
};
