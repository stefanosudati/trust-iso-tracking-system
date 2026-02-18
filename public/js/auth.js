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
          <div class="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <i data-lucide="shield-check" class="w-8 h-8 text-white"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Trust ISO</h1>
          <p class="text-slate-500 text-sm mt-1">Sistema di Gestione Certificazioni ISO</p>
        </div>

        <!-- Tab switcher -->
        <div class="bg-white rounded-xl border border-slate-200 p-1 flex mb-6">
          <button id="tab-login" class="auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all">
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
        await ApiClient.login(fd.get('email'), fd.get('password'));
        window.location.reload();
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
        await ApiClient.register(fd.get('email'), fd.get('password'), fd.get('name'));
        window.location.reload();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="user-plus" class="w-4 h-4"></i> Crea Account';
        if (window.lucide) lucide.createIcons();
      }
    });
  },

  _showPanel(panel) {
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');

    if (panel === 'login') {
      loginPanel.classList.remove('hidden');
      registerPanel.classList.add('hidden');
      loginTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all';
      registerTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 transition-all';
    } else {
      registerPanel.classList.remove('hidden');
      loginPanel.classList.add('hidden');
      registerTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all';
      loginTab.className = 'auth-tab flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 transition-all';
    }
  }
};
