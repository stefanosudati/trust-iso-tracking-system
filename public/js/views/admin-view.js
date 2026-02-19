/**
 * AdminView - Admin user management views and bindings.
 * Extracted from views.js: adminUsers, bindAdminUsers
 */
const AdminView = {

  adminUsers(users) {
    return `
    <div class="p-6 space-y-6 max-w-4xl">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Gestione Utenti</h1>
          <p class="text-slate-500">Approva o rimuovi gli utenti del sistema</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button id="btn-send-changelog-summary" class="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors">
            <i data-lucide="mail" class="w-4 h-4 inline-block mr-1.5"></i>Invia riepilogo changelog
          </button>
          <button id="btn-toggle-create-user" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <i data-lucide="user-plus" class="w-4 h-4 inline-block mr-1.5"></i>Nuovo Utente
          </button>
        </div>
      </div>

      <div id="create-user-section" class="hidden">
        <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 class="text-lg font-semibold text-slate-800">Crea nuovo utente</h2>
          <p class="text-sm text-slate-500">Inserisci nome ed email. La password verrà generata automaticamente.</p>
          <form id="create-user-form" class="flex flex-col sm:flex-row gap-3">
            <input type="text" id="new-user-name" placeholder="Nome completo" required
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <input type="email" id="new-user-email" placeholder="Email" required
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap">
              <i data-lucide="plus" class="w-4 h-4 inline-block mr-1"></i>Crea Utente
            </button>
          </form>
        </div>
      </div>

      <div id="create-user-result" class="hidden">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-3">
          <div class="flex items-center gap-2">
            <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600"></i>
            <h3 class="text-lg font-semibold text-emerald-800">Utente creato con successo!</h3>
          </div>
          <p class="text-sm text-emerald-700">Comunica queste credenziali all'utente. La password è visibile solo ora.</p>
          <div class="bg-white rounded-lg p-4 border border-emerald-200 font-mono text-sm space-y-1">
            <div><span class="text-slate-500">Email:</span> <strong id="created-user-email"></strong></div>
            <div><span class="text-slate-500">Password:</span> <strong id="created-user-password"></strong></div>
          </div>
          <p class="text-xs text-emerald-600">L'utente dovrà cambiare la password al primo accesso.</p>
          <button id="btn-dismiss-result" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
            Chiudi
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ruolo</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stato</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Registrazione</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr class="border-b border-slate-100 last:border-0">
                <td class="px-4 py-3 text-sm font-medium text-slate-800">${u.name}</td>
                <td class="px-4 py-3 text-sm text-slate-600">${u.email}</td>
                <td class="px-4 py-3">
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}">${u.role === 'admin' ? 'Admin' : 'Utente'}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full ${u.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${u.isApproved ? 'Approvato' : 'In attesa'}</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-500">${u.createdAt ? App.formatDate(u.createdAt) : '-'}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    ${!u.isApproved && u.role !== 'admin' ? `
                      <button data-approve="${u.id}" class="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                        <i data-lucide="check" class="w-3.5 h-3.5 inline-block mr-1"></i>Approva
                      </button>` : ''}
                    ${u.id !== ApiClient.getUser()?.id ? (u.role !== 'admin' ? `
                      <button data-promote="${u.id}" class="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                        <i data-lucide="shield" class="w-3.5 h-3.5 inline-block mr-1"></i>Promuovi Admin
                      </button>` : `
                      <button data-demote="${u.id}" class="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <i data-lucide="shield-off" class="w-3.5 h-3.5 inline-block mr-1"></i>Retrocedi
                      </button>`) : ''}
                    ${u.id !== ApiClient.getUser()?.id && u.role !== 'admin' ? `
                      <button data-delete="${u.id}" class="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 inline-block mr-1"></i>Elimina
                      </button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        </div>
        ${users.length === 0 ? '<div class="p-8 text-center text-slate-400">Nessun utente registrato</div>' : ''}
      </div>
    </div>`;
  },

  bindAdminUsers() {
    // Send changelog summary email
    const sendChangelogBtn = document.getElementById('btn-send-changelog-summary');
    if (sendChangelogBtn) {
      sendChangelogBtn.addEventListener('click', async () => {
        sendChangelogBtn.disabled = true;
        sendChangelogBtn.textContent = 'Invio in corso...';
        try {
          const data = await ApiClient.sendChangelogSummary();
          App.showToast(data.message, 'success');
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        } finally {
          sendChangelogBtn.disabled = false;
          sendChangelogBtn.innerHTML = '<i data-lucide="mail" class="w-4 h-4 inline-block mr-1.5"></i>Invia riepilogo changelog';
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    // Toggle create user form
    const toggleBtn = document.getElementById('btn-toggle-create-user');
    const createSection = document.getElementById('create-user-section');
    if (toggleBtn && createSection) {
      toggleBtn.addEventListener('click', () => {
        createSection.classList.toggle('hidden');
        document.getElementById('create-user-result')?.classList.add('hidden');
        if (window.lucide) lucide.createIcons();
      });
    }

    // Submit create user form
    const createForm = document.getElementById('create-user-form');
    if (createForm) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-user-name').value.trim();
        const email = document.getElementById('new-user-email').value.trim();
        if (!name || !email) return;

        try {
          const data = await ApiClient.createUser(name, email);
          // Show credentials
          document.getElementById('created-user-email').textContent = data.user.email;
          document.getElementById('created-user-password').textContent = data.generatedPassword;
          document.getElementById('create-user-result').classList.remove('hidden');
          document.getElementById('create-user-section').classList.add('hidden');
          createForm.reset();
          if (window.lucide) lucide.createIcons();
          App.showToast('Utente creato con successo', 'success');
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        }
      });
    }

    // Dismiss result and refresh user list
    const dismissBtn = document.getElementById('btn-dismiss-result');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', async () => {
        document.getElementById('create-user-result').classList.add('hidden');
        try {
          const users = await ApiClient.getUsers();
          document.getElementById('main-content').innerHTML = AdminView.adminUsers(users);
          AdminView.bindAdminUsers();
          if (window.lucide) lucide.createIcons();
        } catch (err) {
          App.showToast('Errore aggiornamento lista: ' + err.message, 'error');
        }
      });
    }

    document.querySelectorAll('[data-approve]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.approve;
        try {
          await ApiClient.approveUser(userId);
          App.showToast('Utente approvato', 'success');
          // Refresh the view
          const users = await ApiClient.getUsers();
          document.getElementById('main-content').innerHTML = AdminView.adminUsers(users);
          AdminView.bindAdminUsers();
          if (window.lucide) lucide.createIcons();
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        }
      });
    });

    document.querySelectorAll('[data-promote]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.promote;
        if (!confirm('Promuovere questo utente ad amministratore?')) return;
        try {
          await ApiClient.changeUserRole(userId, 'admin');
          App.showToast('Utente promosso ad amministratore', 'success');
          const users = await ApiClient.getUsers();
          document.getElementById('main-content').innerHTML = AdminView.adminUsers(users);
          AdminView.bindAdminUsers();
          if (window.lucide) lucide.createIcons();
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        }
      });
    });

    document.querySelectorAll('[data-demote]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.demote;
        if (!confirm('Retrocedere questo utente a utente standard?')) return;
        try {
          await ApiClient.changeUserRole(userId, 'user');
          App.showToast('Utente retrocesso a utente standard', 'success');
          const users = await ApiClient.getUsers();
          document.getElementById('main-content').innerHTML = AdminView.adminUsers(users);
          AdminView.bindAdminUsers();
          if (window.lucide) lucide.createIcons();
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        }
      });
    });

    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.delete;
        if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
        try {
          await ApiClient.deleteUser(userId);
          App.showToast('Utente eliminato', 'success');
          const users = await ApiClient.getUsers();
          document.getElementById('main-content').innerHTML = AdminView.adminUsers(users);
          AdminView.bindAdminUsers();
          if (window.lucide) lucide.createIcons();
        } catch (err) {
          App.showToast('Errore: ' + err.message, 'error');
        }
      });
    });
  }
};
