/**
 * SettingsView - Settings views and bindings (theme, password, guides).
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

    // Guide Markdown buttons
    document.getElementById('btn-user-guide')?.addEventListener('click', () => GuideExport.userGuide());
    document.getElementById('btn-admin-guide')?.addEventListener('click', () => GuideExport.adminGuide());
  }
};
