/**
 * AuthUI - Login and Registration screens.
 * Rendered before the main app when user is not authenticated.
 */
const AuthUI = {

  render() {
    // Replace entire body with auth screen
    document.body.innerHTML = `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-8">
          <img src="/img/logo.png" alt="Trust ISO" class="w-32 h-32 object-contain mx-auto mb-4">
          <h1 class="text-2xl font-bold text-slate-800">Trust ISO Tracking System</h1>
          <p class="text-slate-500 text-sm mt-1">Sistema di Gestione Certificazioni ISO</p>
        </div>

        <!-- Tab switcher -->
        <div class="bg-white rounded-xl border border-slate-200 p-1 flex mb-6">
          <button id="tab-login" class="auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all" style="background-color: var(--primary); color: white;">
            Accedi
          </button>
          <button id="tab-register" class="auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 transition-all">
            Registrati
          </button>
        </div>

        <!-- Login Form -->
        <div id="login-panel" class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-5">Accedi al tuo account</h2>
          <form id="login-form" class="space-y-4">
            <div>
              <label class="form-label">Email</label>
              <input type="email" name="email" required autocomplete="email"
                     class="form-input" placeholder="nome@azienda.it">
            </div>
            <div>
              <label class="form-label">Password</label>
              <input type="password" name="password" required autocomplete="current-password"
                     class="form-input" placeholder="La tua password">
            </div>
            <div id="login-error" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg"></div>
            <button type="submit" id="login-btn" class="btn-primary w-full justify-center">
              <i data-lucide="log-in" class="w-4 h-4"></i> Accedi
            </button>
          </form>
        </div>

        <!-- Register Form -->
        <div id="register-panel" class="hidden bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-5">Crea il tuo account</h2>
          <form id="register-form" class="space-y-4">
            <div>
              <label class="form-label">Nome completo</label>
              <input type="text" name="name" required
                     class="form-input" placeholder="Mario Rossi">
            </div>
            <div>
              <label class="form-label">Email</label>
              <input type="email" name="email" required autocomplete="email"
                     class="form-input" placeholder="nome@azienda.it">
            </div>
            <div>
              <label class="form-label">Password (min. 6 caratteri)</label>
              <input type="password" name="password" required minlength="6" autocomplete="new-password"
                     class="form-input" placeholder="Scegli una password sicura">
            </div>
            <div id="register-error" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg"></div>
            <button type="submit" id="register-btn" class="btn-primary w-full justify-center">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Crea Account
            </button>
          </form>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6">
          Trust ISO Tracking System v2.0
        </p>
      </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
    this._bindEvents();
  },

  _bindEvents() {
    // Tab switching
    document.getElementById('tab-login').addEventListener('click', () => {
      this._showPanel('login');
    });
    document.getElementById('tab-register').addEventListener('click', () => {
      this._showPanel('register');
    });

    // Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const errorEl = document.getElementById('login-error');
      const fd = new FormData(e.target);

      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Accesso...';
      errorEl.classList.add('hidden');

      try {
        const data = await ApiClient.login(fd.get('email'), fd.get('password'));
        if (data.user?.passwordChangeRequired) {
          this._showForcePasswordChange();
        } else {
          window.location.reload();
        }
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="log-in" class="w-4 h-4"></i> Accedi';
        if (window.lucide) lucide.createIcons();
      }
    });

    // Register
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      const errorEl = document.getElementById('register-error');
      const fd = new FormData(e.target);

      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Creazione...';
      errorEl.classList.add('hidden');

      try {
        const data = await ApiClient.register(fd.get('email'), fd.get('password'), fd.get('name'));
        if (data.pendingApproval) {
          this._showPendingApproval();
        } else {
          window.location.reload();
        }
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="user-plus" class="w-4 h-4"></i> Crea Account';
        if (window.lucide) lucide.createIcons();
      }
    });
  },

  _showForcePasswordChange() {
    const container = document.querySelector('.w-full.max-w-md');
    // Hide tabs and form panels
    container.querySelector('.bg-white.rounded-xl.border.border-slate-200.p-1')?.classList.add('hidden');
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('register-panel').classList.add('hidden');

    // Show password change form
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl border border-slate-200 p-6 shadow-sm';
    div.innerHTML = `
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
          <i data-lucide="key" class="w-5 h-5 text-amber-600"></i>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Cambio password obbligatorio</h2>
          <p class="text-sm text-slate-500">Per sicurezza, cambia la password predefinita</p>
        </div>
      </div>
      <form id="force-password-form" class="space-y-4">
        <div>
          <label class="form-label">Nuova password (min. 6 caratteri)</label>
          <input type="password" name="newPassword" required minlength="6" autocomplete="new-password"
                 class="form-input" placeholder="Scegli una password sicura">
        </div>
        <div>
          <label class="form-label">Conferma password</label>
          <input type="password" name="confirmPassword" required minlength="6"
                 class="form-input" placeholder="Ripeti la password">
        </div>
        <div id="force-pw-error" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg"></div>
        <button type="submit" id="force-pw-btn" class="btn-primary w-full justify-center">
          <i data-lucide="check" class="w-4 h-4"></i> Salva e Accedi
        </button>
      </form>`;
    container.appendChild(div);
    if (window.lucide) lucide.createIcons();

    document.getElementById('force-password-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const errorEl = document.getElementById('force-pw-error');
      const btn = document.getElementById('force-pw-btn');

      const newPw = fd.get('newPassword');
      const confirmPw = fd.get('confirmPassword');

      if (newPw !== confirmPw) {
        errorEl.textContent = 'Le password non corrispondono';
        errorEl.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Salvataggio...';
      errorEl.classList.add('hidden');

      try {
        await ApiClient.changePassword(null, newPw);
        window.location.reload();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Salva e Accedi';
        if (window.lucide) lucide.createIcons();
      }
    });
  },

  _showPendingApproval() {
    const container = document.querySelector('.w-full.max-w-md');
    // Hide tabs and form panels
    container.querySelector('.bg-white.rounded-xl.border.border-slate-200.p-1')?.classList.add('hidden');
    document.getElementById('login-panel')?.classList.add('hidden');
    document.getElementById('register-panel')?.classList.add('hidden');

    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center';
    div.innerHTML = `
      <div class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <i data-lucide="clock" class="w-8 h-8 text-amber-500"></i>
      </div>
      <h2 class="text-lg font-semibold text-slate-800 mb-2">Account creato con successo</h2>
      <p class="text-sm text-slate-500 mb-4">Il tuo account è in attesa di approvazione da parte dell'amministratore. Riceverai l'accesso una volta approvato.</p>
      <button onclick="ApiClient.clearAuth(); window.location.reload();" class="btn-secondary">
        <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna al login
      </button>`;
    container.appendChild(div);
    if (window.lucide) lucide.createIcons();

    // Clear token since user can't actually access the app
    ApiClient.clearAuth();
  },

  _showPanel(panel) {
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');

    if (panel === 'login') {
      loginPanel.classList.remove('hidden');
      registerPanel.classList.add('hidden');
      loginTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all';
      loginTab.style.backgroundColor = 'var(--primary)';
      loginTab.style.color = 'white';
      registerTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 transition-all';
      registerTab.style.backgroundColor = '';
      registerTab.style.color = '';
    } else {
      registerPanel.classList.remove('hidden');
      loginPanel.classList.add('hidden');
      registerTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all';
      registerTab.style.backgroundColor = 'var(--primary)';
      registerTab.style.color = 'white';
      loginTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 transition-all';
      loginTab.style.backgroundColor = '';
      loginTab.style.color = '';
    }
  }
};
