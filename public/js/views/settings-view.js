/**
 * SettingsView - Settings views and bindings (theme, password, API keys, guides).
 * Extracted from views.js: settings, _themePreview, bindSettings
 */
const SettingsView = {

  settings() {
    const themes = ThemeManager.getAll();
    const currentTheme = ThemeManager.current();

    return `
    <div class="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Impostazioni</h1>
        <p class="text-slate-500">Personalizza l'aspetto dell'applicazione</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-4">Tema Colore</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${themes.map(t => {
            const def = ThemeDefinitions[t.id];
            const isActive = t.id === currentTheme;
            return this._themePreview(t.id, t.name, def, isActive);
          }).join('')}
        </div>
      </div>

      <!-- Cambio Password -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-4">Cambia Password</h3>
        <form id="change-password-form" class="space-y-4 max-w-sm">
          <div>
            <label class="form-label">Password attuale</label>
            <div class="relative">
              <input type="password" name="oldPassword" required class="form-input pr-10" placeholder="La tua password attuale">
              <button type="button" class="pw-toggle" onclick="togglePw(this)"><i data-lucide="eye" class="w-4 h-4"></i></button>
            </div>
          </div>
          <div>
            <label class="form-label">Nuova password (min. 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo)</label>
            <div class="relative">
              <input type="password" name="newPassword" required minlength="8" class="form-input pr-10" placeholder="Scegli una nuova password">
              <button type="button" class="pw-toggle" onclick="togglePw(this)"><i data-lucide="eye" class="w-4 h-4"></i></button>
            </div>
          </div>
          <div>
            <label class="form-label">Conferma nuova password</label>
            <div class="relative">
              <input type="password" name="confirmPassword" required class="form-input pr-10" placeholder="Ripeti la nuova password">
              <button type="button" class="pw-toggle" onclick="togglePw(this)"><i data-lucide="eye" class="w-4 h-4"></i></button>
            </div>
          </div>
          <div id="password-error" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg"></div>
          <div id="password-success" class="hidden text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg"></div>
          <button type="submit" class="btn-primary">
            <i data-lucide="lock" class="w-4 h-4"></i> Aggiorna Password
          </button>
        </form>
      </div>

      <!-- API Keys -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-slate-800">Chiavi API</h3>
            <p class="text-sm text-slate-500">Gestisci le chiavi per l'accesso programmatico</p>
          </div>
          <button id="btn-new-api-key" class="btn-primary text-sm">
            <i data-lucide="plus" class="w-4 h-4"></i> Genera nuova chiave
          </button>
        </div>

        <!-- New API Key form (hidden by default) -->
        <div id="api-key-form-container" class="hidden mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <form id="create-api-key-form" class="space-y-3">
            <div>
              <label class="form-label">Nome chiave</label>
              <input type="text" name="keyName" required class="form-input" placeholder="Es. Integrazione CI/CD" maxlength="100">
            </div>
            <div>
              <label class="form-label">Scadenza (giorni, vuoto = nessuna scadenza)</label>
              <input type="number" name="expiresInDays" class="form-input" placeholder="Es. 90" min="1" max="3650">
            </div>
            <div class="flex gap-2">
              <button type="submit" class="btn-primary text-sm">
                <i data-lucide="key" class="w-4 h-4"></i> Genera
              </button>
              <button type="button" id="btn-cancel-api-key" class="btn-secondary text-sm">
                Annulla
              </button>
            </div>
          </form>
        </div>

        <!-- Generated key display (hidden by default) -->
        <div id="api-key-generated" class="hidden mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div class="flex items-start gap-2 mb-2">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"></i>
            <div>
              <p class="text-sm font-semibold text-amber-800">Chiave generata - copiala ora!</p>
              <p class="text-xs text-amber-600">Questa chiave non potra essere visualizzata di nuovo.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <code id="api-key-value" class="flex-1 text-sm bg-white p-2 rounded border border-amber-300 font-mono select-all break-all"></code>
            <button id="btn-copy-api-key" class="btn-secondary text-sm flex-shrink-0">
              <i data-lucide="copy" class="w-4 h-4"></i> Copia
            </button>
          </div>
        </div>

        <!-- API Keys list -->
        <div id="api-keys-list">
          <div class="text-sm text-slate-400 text-center py-4">
            <i data-lucide="loader" class="w-4 h-4 animate-spin inline-block"></i> Caricamento chiavi...
          </div>
        </div>
      </div>

      <!-- Guide e Documentazione -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-2">Guide e Documentazione</h3>
        <p class="text-sm text-slate-500 mb-4">Scarica le guide in formato Markdown.</p>
        <div class="flex flex-wrap gap-3">
          <button id="btn-user-guide" class="btn-secondary">
            <i data-lucide="book-open" class="w-4 h-4"></i> Guida Utente
          </button>
          ${ApiClient.getUser()?.role === 'admin' ? `
          <button id="btn-admin-guide" class="btn-secondary">
            <i data-lucide="shield" class="w-4 h-4"></i> Guida Amministratore
          </button>` : ''}
        </div>
      </div>
    </div>`;
  },

  _themePreview(themeId, name, def, isActive) {
    const colors = def.colors;
    return `
    <button class="theme-card rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${isActive ? '' : 'border-slate-200'}"
            data-theme-id="${themeId}"
            style="${isActive ? `border-color: ${colors['--primary']}; box-shadow: 0 0 0 2px ${colors['--focus-ring']};` : ''}">
      <!-- Preview bars -->
      <div class="flex gap-2 mb-3 h-16 rounded-lg overflow-hidden border border-slate-100">
        <!-- Sidebar preview -->
        <div class="w-12 flex-shrink-0" style="background-color: ${colors['--sidebar-bg'] || '#fff'};"></div>
        <!-- Main area preview -->
        <div class="flex-1 flex flex-col p-2 gap-1.5" style="background-color: ${colors['--body-bg'] || '#f8fafc'};">
          <div class="h-2 rounded-full w-3/4" style="background-color: ${colors['--primary']};"></div>
          <div class="h-1.5 rounded-full w-1/2 bg-slate-200"></div>
          <div class="flex-1 flex gap-1 mt-auto">
            <div class="flex-1 rounded h-3" style="background-color: ${colors['--primary-light']};"></div>
            <div class="flex-1 rounded h-3 bg-slate-100"></div>
          </div>
        </div>
      </div>
      <!-- Name -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-800">${name}</span>
        ${isActive ? `<span class="text-xs font-medium px-2 py-0.5 rounded-full" style="background-color: ${colors['--badge-bg']}; color: ${colors['--badge-text']};">Attivo</span>` : ''}
      </div>
    </button>`;
  },

  /**
   * Render the API keys list into #api-keys-list container.
   */
  _renderApiKeysList(keys) {
    const container = document.getElementById('api-keys-list');
    if (!container) return;

    if (!keys || keys.length === 0) {
      container.innerHTML = `
        <div class="text-sm text-slate-400 text-center py-4">
          Nessuna chiave API configurata.
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="divide-y divide-slate-100">
        ${keys.map(k => {
          const isExpired = k.expiresAt && new Date(k.expiresAt) < new Date();
          const statusColor = !k.isActive ? 'bg-red-100 text-red-700' :
            isExpired ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
          const statusText = !k.isActive ? 'Disattivata' :
            isExpired ? 'Scaduta' : 'Attiva';
          const expiresText = k.expiresAt
            ? new Date(k.expiresAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'Mai';
          const lastUsedText = k.lastUsedAt
            ? new Date(k.lastUsedAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Mai';
          const createdText = new Date(k.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

          return `
          <div class="py-3 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-sm text-slate-800 truncate">${this._escapeHtml(k.name)}</span>
                <span class="text-xs px-1.5 py-0.5 rounded-full ${statusColor}">${statusText}</span>
              </div>
              <div class="text-xs text-slate-400 font-mono">${this._escapeHtml(k.keyPrefix)}</div>
              <div class="text-xs text-slate-400 mt-1">
                Creata: ${createdText} | Scadenza: ${expiresText} | Ultimo uso: ${lastUsedText}
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button class="api-key-toggle p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      data-key-id="${k.id}" data-active="${k.isActive}" title="${k.isActive ? 'Disattiva' : 'Attiva'}">
                <i data-lucide="${k.isActive ? 'toggle-right' : 'toggle-left'}"
                   class="w-5 h-5 ${k.isActive ? 'text-emerald-600' : 'text-slate-400'}"></i>
              </button>
              <button class="api-key-delete p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      data-key-id="${k.id}" data-key-name="${this._escapeHtml(k.name)}" title="Elimina">
                <i data-lucide="trash-2" class="w-4 h-4 text-red-500"></i>
              </button>
            </div>
          </div>`;
        }).join('')}
      </div>`;

    if (window.lucide) lucide.createIcons();
    this._bindApiKeyActions();
  },

  /**
   * Escape HTML entities for safe rendering.
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Bind click handlers for toggle and delete buttons in the API keys list.
   */
  _bindApiKeyActions() {
    // Toggle active/inactive
    document.querySelectorAll('.api-key-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const keyId = btn.dataset.keyId;
        const isActive = btn.dataset.active === 'true';
        try {
          await ApiClient.updateApiKey(keyId, { isActive: !isActive });
          await this._loadAndRenderApiKeys();
        } catch (err) {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(err.message, 'error');
          }
        }
      });
    });

    // Delete key
    document.querySelectorAll('.api-key-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const keyId = btn.dataset.keyId;
        const keyName = btn.dataset.keyName;
        if (!confirm('Eliminare la chiave API "' + keyName + '"? Questa azione e irreversibile.')) return;
        try {
          await ApiClient.deleteApiKey(keyId);
          await this._loadAndRenderApiKeys();
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Chiave API eliminata', 'success');
          }
        } catch (err) {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(err.message, 'error');
          }
        }
      });
    });
  },

  /**
   * Load API keys from server and render them.
   */
  async _loadAndRenderApiKeys() {
    try {
      const keys = await ApiClient.getApiKeys();
      this._renderApiKeysList(keys);
    } catch (err) {
      const container = document.getElementById('api-keys-list');
      if (container) {
        container.innerHTML = `
          <div class="text-sm text-red-500 text-center py-4">
            Errore nel caricamento delle chiavi API: ${err.message}
          </div>`;
      }
    }
  },

  bindSettings() {
    document.querySelectorAll('.theme-card').forEach(el => {
      el.addEventListener('click', () => {
        const themeId = el.dataset.themeId;
        ThemeManager.apply(themeId);
        ThemeManager.saveToServer(themeId);
        App.render();
      });
    });

    // Password change form
    document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const errorEl = document.getElementById('password-error');
      const successEl = document.getElementById('password-success');
      const btn = e.target.querySelector('button[type="submit"]');

      errorEl.classList.add('hidden');
      successEl.classList.add('hidden');

      const oldPw = fd.get('oldPassword');
      const newPw = fd.get('newPassword');
      const confirmPw = fd.get('confirmPassword');

      if (newPw !== confirmPw) {
        errorEl.textContent = 'Le password non corrispondono';
        errorEl.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Aggiornamento...';

      try {
        await ApiClient.changePassword(oldPw, newPw);
        successEl.textContent = 'Password aggiornata con successo';
        successEl.classList.remove('hidden');
        e.target.reset();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      }

      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Aggiorna Password';
      if (window.lucide) lucide.createIcons();
    });

    // API Keys: Show/hide form
    const btnNewKey = document.getElementById('btn-new-api-key');
    const formContainer = document.getElementById('api-key-form-container');
    const btnCancel = document.getElementById('btn-cancel-api-key');

    btnNewKey?.addEventListener('click', () => {
      formContainer?.classList.remove('hidden');
      document.getElementById('api-key-generated')?.classList.add('hidden');
      btnNewKey.classList.add('hidden');
    });

    btnCancel?.addEventListener('click', () => {
      formContainer?.classList.add('hidden');
      btnNewKey?.classList.remove('hidden');
    });

    // API Keys: Create form submission
    document.getElementById('create-api-key-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = fd.get('keyName')?.trim() || 'API Key';
      const expiresStr = fd.get('expiresInDays')?.trim();
      const expiresInDays = expiresStr ? parseInt(expiresStr, 10) : null;

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Generazione...';

      try {
        const result = await ApiClient.createApiKey(name, expiresInDays);

        // Show the generated key
        const generatedEl = document.getElementById('api-key-generated');
        const keyValueEl = document.getElementById('api-key-value');
        if (generatedEl && keyValueEl) {
          keyValueEl.textContent = result.rawKey;
          generatedEl.classList.remove('hidden');
        }

        // Hide the form
        formContainer?.classList.add('hidden');
        btnNewKey?.classList.remove('hidden');
        e.target.reset();

        // Reload list
        await this._loadAndRenderApiKeys();

        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Chiave API generata con successo', 'success');
        }
      } catch (err) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(err.message, 'error');
        }
      }

      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="key" class="w-4 h-4"></i> Genera';
      if (window.lucide) lucide.createIcons();
    });

    // API Keys: Copy button
    document.getElementById('btn-copy-api-key')?.addEventListener('click', () => {
      const keyValue = document.getElementById('api-key-value')?.textContent;
      if (keyValue) {
        navigator.clipboard.writeText(keyValue).then(() => {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Chiave copiata negli appunti', 'success');
          }
        }).catch(() => {
          // Fallback: select text
          const el = document.getElementById('api-key-value');
          if (el) {
            const range = document.createRange();
            range.selectNodeContents(el);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
          }
        });
      }
    });

    // Load API keys list
    this._loadAndRenderApiKeys();

    // Guide Markdown buttons
    document.getElementById('btn-user-guide')?.addEventListener('click', () => GuideExport.userGuide());
    document.getElementById('btn-admin-guide')?.addEventListener('click', () => GuideExport.adminGuide());
  }
};
