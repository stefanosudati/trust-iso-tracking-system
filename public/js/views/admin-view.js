/**
 * AdminView - Admin user management views and bindings.
 * Extracted from views.js: adminUsers, bindAdminUsers
 */
const AdminView = {

  adminUsers(users) {
    return `
    <div class="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Gestione Utenti</h1>
        <p class="text-slate-500">Approva o rimuovi gli utenti del sistema</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
        ${users.length === 0 ? '<div class="p-8 text-center text-slate-400">Nessun utente registrato</div>' : ''}
      </div>
    </div>`;
  },

  bindAdminUsers() {
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
