/**
 * DocumentsView - Document management views and bindings.
 * Extracted from views.js: documentManager, _mandatoryDocsChecklist, bindDocumentManager, _showDocModal
 */
const DocumentsView = {

  documentManager(project) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const docs = project.documents || [];

    return `
    <div class="p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Gestione Documenti</h1>
          <p class="text-slate-500">${docs.length} document${docs.length === 1 ? 'o' : 'i'}</p>
        </div>
        <button id="add-doc-btn" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nuovo Documento
        </button>
      </div>

      <!-- Mandatory Docs Checklist -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-3">Documenti Obbligatori ISO 9001:2015</h3>
        <div class="space-y-2" id="mandatory-docs-list">
          ${this._mandatoryDocsChecklist(project)}
        </div>
      </div>

      <!-- Documents Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        ${docs.length === 0 ? `
          <div class="p-8 text-center text-slate-500">
            <i data-lucide="file-text" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
            <p>Nessun documento registrato</p>
          </div>
        ` : `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Codice</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Versione</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Data</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Stato</th>
                <th class="text-left px-4 py-3 font-medium text-slate-600">Requisiti</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${docs.map(d => `
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800">${d.code || '-'}</td>
                <td class="px-4 py-3 text-slate-700">${d.name}</td>
                <td class="px-4 py-3 text-slate-600">${d.version || '1.0'}</td>
                <td class="px-4 py-3 text-slate-600">${App.formatDate(d.issueDate)}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full ${
                    d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    d.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }">${d.status === 'approved' ? 'Approvato' : d.status === 'draft' ? 'Bozza' : 'Obsoleto'}</span>
                </td>
                <td class="px-4 py-3 text-slate-600 text-xs">${(d.linkedRequirements || []).join(', ') || '-'}</td>
                <td class="px-4 py-3 text-right">
                  <button class="edit-doc text-slate-400 mr-2" data-doc-id="${d.id}"
                          onmouseenter="this.style.color='var(--primary)'" onmouseleave="this.style.color=''">
                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                  </button>
                  <button class="delete-doc text-slate-400 hover:text-red-600" data-doc-id="${d.id}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `}
      </div>
    </div>`;
  },

  _mandatoryDocsChecklist(project) {
    const mandatory = MANDATORY_DOCS;

    const docNames = (project.documents || []).map(d => d.name.toLowerCase());

    return mandatory.map(m => {
      const exists = docNames.some(dn => dn.includes(m.name.toLowerCase().substring(0, 15)));
      return `
      <div class="flex items-center gap-3 p-2 rounded-lg ${exists ? 'bg-emerald-50' : 'bg-red-50'}">
        <span class="w-5 h-5 flex items-center justify-center rounded-full ${exists ? 'bg-emerald-500 text-white' : 'bg-red-200 text-red-600'} text-xs font-bold">
          ${exists ? '&#10003;' : '!'}
        </span>
        <span class="flex-1 text-sm ${exists ? 'text-emerald-800' : 'text-red-800'}">${m.name}</span>
        <span class="text-xs text-slate-500">Rif. ${m.req}</span>
      </div>`;
    }).join('');
  },

  bindDocumentManager(project) {
    if (!project) return;

    document.getElementById('add-doc-btn')?.addEventListener('click', () => {
      this._showDocModal(project);
    });

    document.querySelectorAll('.edit-doc').forEach(el => {
      el.addEventListener('click', () => {
        const doc = project.documents.find(d => d.id === el.dataset.docId);
        if (doc) this._showDocModal(project, doc);
      });
    });

    document.querySelectorAll('.delete-doc').forEach(el => {
      el.addEventListener('click', async () => {
        if (confirm('Eliminare questo documento?')) {
          try {
            await Store.deleteDocument(project.id, el.dataset.docId);
            App.render();
            App.showToast('Documento eliminato', 'success');
          } catch (err) {
            App.showToast('Errore: ' + err.message, 'error');
          }
        }
      });
    });
  },

  _showDocModal(project, doc = null) {
    const isEdit = !!doc;
    App.showModal(isEdit ? 'Modifica Documento' : 'Nuovo Documento', `
      <form id="doc-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="form-label">Nome Documento *</label>
            <input type="text" name="name" value="${doc?.name || ''}" required class="form-input">
          </div>
          <div>
            <label class="form-label">Codice</label>
            <input type="text" name="code" value="${doc?.code || ''}" class="form-input" placeholder="Es. PQ-001">
          </div>
          <div>
            <label class="form-label">Versione</label>
            <input type="text" name="version" value="${doc?.version || '1.0'}" class="form-input">
          </div>
          <div>
            <label class="form-label">Data Emissione</label>
            <input type="date" name="issueDate" value="${doc?.issueDate || new Date().toISOString().split('T')[0]}" class="form-input">
          </div>
          <div>
            <label class="form-label">Stato</label>
            <select name="status" class="form-input">
              <option value="draft" ${doc?.status === 'draft' ? 'selected' : ''}>Bozza</option>
              <option value="approved" ${doc?.status === 'approved' ? 'selected' : ''}>Approvato</option>
              <option value="obsolete" ${doc?.status === 'obsolete' ? 'selected' : ''}>Obsoleto</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="form-label">Requisiti Collegati</label>
            <input type="text" name="linkedRequirements" value="${(doc?.linkedRequirements || []).join(', ')}" class="form-input" placeholder="Es. 4.3, 5.2, 7.5">
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="App.closeModal()" class="btn-secondary">Annulla</button>
          <button type="submit" class="btn-primary">${isEdit ? 'Salva' : 'Aggiungi'}</button>
        </div>
      </form>
    `);

    document.getElementById('doc-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        name: fd.get('name'),
        code: fd.get('code'),
        version: fd.get('version'),
        issueDate: fd.get('issueDate'),
        status: fd.get('status'),
        linkedRequirements: fd.get('linkedRequirements')?.split(',').map(s => s.trim()).filter(Boolean) || []
      };

      try {
        if (isEdit) {
          await Store.updateDocument(project.id, doc.id, data);
          App.showToast('Documento aggiornato', 'success');
        } else {
          await Store.addDocument(project.id, data);
          App.showToast('Documento aggiunto', 'success');
        }
        App.closeModal();
        App.render();
      } catch (err) {
        App.showToast('Errore salvataggio documento: ' + err.message, 'error');
      }
    });
  }
};
