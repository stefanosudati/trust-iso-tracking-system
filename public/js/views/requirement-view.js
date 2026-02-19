/**
 * RequirementView - Requirement detail rendering and binding
 */
const RequirementView = {

  requirementDetail(project, reqId) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    if (!cert) return '<div class="p-6">Certificazione non trovata</div>';

    // Find requirement
    const allReqs = flattenRequirements(cert.clauses);
    const req = allReqs.find(r => r.id === reqId);
    if (!req) return '<div class="p-6">Requisito non trovato</div>';

    const ev = project.evaluations[reqId] || { ...DEFAULT_EVALUATION };

    // Find clause
    const clauseNum = reqId.split('.')[0];

    // Find prev/next requirement
    const idx = allReqs.findIndex(r => r.id === reqId);
    const prevReq = idx > 0 ? allReqs[idx - 1] : null;
    const nextReq = idx < allReqs.length - 1 ? allReqs[idx + 1] : null;

    return `
    <div class="p-6 max-w-4xl space-y-5">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <a href="#" onclick="App.navigate('dashboard'); return false;" onmouseenter="this.style.color='var(--primary-text-light)'" onmouseleave="this.style.color=''">Dashboard</a>
        <span>/</span>
        <a href="#" onclick="App.navigate('clause', {currentClause:'${clauseNum}'}); return false;" onmouseenter="this.style.color='var(--primary-text-light)'" onmouseleave="this.style.color=''">Clausola ${clauseNum}</a>
        <span>/</span>
        <span class="text-slate-700">${reqId}</span>
      </div>

      <!-- Title + Changelog Button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 class="text-xl font-bold text-slate-800">
          <span style="color: var(--primary-text-light);">${reqId}</span> ${req.title}
        </h1>
        <button id="btn-open-changelog" class="btn-secondary text-sm flex-shrink-0 self-start">
          <i data-lucide="history" class="w-4 h-4"></i> Change Log
        </button>
      </div>

      <!-- Requirement Text -->
      <div class="rounded-xl p-4" style="background-color: var(--primary-lighter); border: 1px solid var(--primary-light);">
        <h3 class="text-sm font-semibold mb-2" style="color: var(--primary-text);">Testo del Requisito</h3>
        <p class="text-sm leading-relaxed" style="color: var(--primary-text);">${req.text || 'Testo del requisito non disponibile.'}</p>
      </div>

      <!-- Evaluation Form -->
      <form id="evaluation-form" class="space-y-5">
        <!-- Status Selection -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Stato di Conformit\u00e0</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${this._statusRadio('implemented', 'Implementato', 'bg-emerald-100 text-emerald-700 border-emerald-300', ev.status)}
            ${this._statusRadio('partial', 'Parziale', 'bg-amber-100 text-amber-700 border-amber-300', ev.status)}
            ${this._statusRadio('not_implemented', 'Non Impl.', 'bg-red-100 text-red-700 border-red-300', ev.status)}
            ${this._statusRadio('not_applicable', 'N/A', 'bg-slate-100 text-slate-600 border-slate-300', ev.status)}
          </div>

          <!-- N/A justification -->
          <div id="na-justification" class="${ev.status === 'not_applicable' ? '' : 'hidden'} mt-3">
            <label class="form-label">Motivazione Non Applicabilita</label>
            <textarea name="naJustification" rows="2" class="form-input" placeholder="Specificare perch\u00e9 il requisito non \u00e8 applicabile...">${ev.naJustification || ''}</textarea>
          </div>
        </div>

        <!-- Notes & Observations -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Note e Osservazioni</h3>
          <textarea name="notes" rows="3" class="form-input" placeholder="Note interpretative, osservazioni sulla conformit\u00e0...">${ev.notes || ''}</textarea>
        </div>

        <!-- Evidence & Mandatory Docs -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Evidenze Richieste</h3>
          ${(req.mandatoryDocs && req.mandatoryDocs.length) ? `
            <div class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="text-sm font-semibold text-amber-800 mb-1">Documenti Obbligatori:</div>
              <ul class="list-disc list-inside text-sm text-amber-900">
                ${req.mandatoryDocs.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${(req.evidences && req.evidences.length) ? `
            <div class="space-y-2">
              ${req.evidences.map((e, i) => `
                <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" name="evidence_${i}" class="w-4 h-4 rounded border-slate-300 themed-checkbox"
                         ${ev.evidenceNotes?.includes(e) ? 'checked' : ''}>
                  <span class="text-sm text-slate-700">${e}</span>
                </label>
              `).join('')}
            </div>
          ` : '<p class="text-sm text-slate-500">Nessuna evidenza specifica richiesta</p>'}
        </div>

        <!-- Corrective Actions -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Azioni Correttive</h3>
          <div id="actions-list" class="space-y-2 mb-3">
            ${(ev.actions || []).map((a, i) => `
              <div class="flex items-center gap-2 action-item">
                <input type="checkbox" class="w-4 h-4 rounded border-slate-300 themed-checkbox" ${a.done ? 'checked' : ''} data-action-idx="${i}">
                <input type="text" class="form-input flex-1 text-sm" value="${a.text}" data-action-text="${i}">
                <button type="button" class="text-slate-400 hover:text-red-500 remove-action" data-idx="${i}">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              </div>
            `).join('')}
          </div>
          <button type="button" id="add-action" class="text-sm font-medium flex items-center gap-1" style="color: var(--primary-text-light);"
                  onmouseenter="this.style.color='var(--primary-text)'" onmouseleave="this.style.color='var(--primary-text-light)'"">
            <i data-lucide="plus" class="w-4 h-4"></i> Aggiungi azione
          </button>
        </div>

        <!-- Priority, Responsible, Deadline -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Assegnazione</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Priorita</label>
              <select name="priority" class="form-input">
                <option value="high" ${ev.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="medium" ${ev.priority === 'medium' ? 'selected' : ''}>Media</option>
                <option value="low" ${ev.priority === 'low' ? 'selected' : ''}>Bassa</option>
              </select>
            </div>
            <div>
              <label class="form-label">Responsabile</label>
              <input type="text" name="responsible" value="${ev.responsible || ''}" class="form-input" placeholder="Nome responsabile">
            </div>
            <div>
              <label class="form-label">Scadenza</label>
              <input type="date" name="deadline" value="${ev.deadline || ''}" class="form-input">
            </div>
          </div>
        </div>

        <!-- Audit Notes -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-800 mb-3">Note Audit</h3>
          <textarea name="auditNotes" rows="2" class="form-input" placeholder="Osservazioni dell'ispettore/auditor...">${ev.auditNotes || ''}</textarea>
        </div>

        <!-- History -->
        <!-- Save + Nav -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex gap-2">
            <button type="submit" class="btn-primary">
              <i data-lucide="save" class="w-4 h-4"></i> Salva Valutazione
            </button>
            <button type="button" onclick="App.navigate('clause', {currentClause:'${clauseNum}'})" class="btn-secondary">Indietro</button>
          </div>
          <div class="flex gap-2">
            ${prevReq ? `<button type="button" onclick="App.navigate('requirement', {currentRequirement:'${prevReq.id}'})" class="btn-secondary text-sm px-3">
              <i data-lucide="chevron-left" class="w-4 h-4"></i> ${prevReq.id}
            </button>` : ''}
            ${nextReq ? `<button type="button" onclick="App.navigate('requirement', {currentRequirement:'${nextReq.id}'})" class="btn-secondary text-sm px-3">
              ${nextReq.id} <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>` : ''}
          </div>
        </div>
      </form>
    </div>

    <!-- Changelog Slide-In Panel -->
    <div id="changelog-panel" class="fixed inset-y-0 right-0 w-96 max-w-full bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col"
         style="border-left: 1px solid #e2e8f0;">
      <div class="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 class="font-semibold text-slate-800 flex items-center gap-2">
          <i data-lucide="history" class="w-4 h-4"></i> Change Log — ${reqId}
        </h3>
        <button id="btn-close-changelog" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div id="changelog-entries" class="flex-1 overflow-y-auto p-4">
        <div class="text-sm text-slate-400 text-center py-8">Caricamento...</div>
      </div>
    </div>
    <div id="changelog-overlay" class="hidden fixed inset-0 bg-black/20 z-40"></div>`;
  },

  _statusRadio(value, label, colorClass, current) {
    const checked = current === value;
    return `
    <label class="status-radio flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${checked ? colorClass + ' border-current' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}">
      <input type="radio" name="status" value="${value}" ${checked ? 'checked' : ''} class="sr-only">
      <span class="text-sm font-medium">${label}</span>
    </label>`;
  },

  bindRequirementDetail(project, reqId) {
    if (!project || !reqId) return;

    // Status radio styling
    document.querySelectorAll('.status-radio input').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.status-radio').forEach(l => {
          l.className = l.className.replace(/bg-\S+ text-\S+ border-\S+/g, '').trim();
          l.classList.add('bg-white', 'border-slate-200', 'text-slate-600');
        });
        const label = radio.closest('label');
        label.classList.remove('bg-white', 'border-slate-200', 'text-slate-600');
        const colors = {
          'implemented': ['bg-emerald-100', 'text-emerald-700', 'border-emerald-300'],
          'partial': ['bg-amber-100', 'text-amber-700', 'border-amber-300'],
          'not_implemented': ['bg-red-100', 'text-red-700', 'border-red-300'],
          'not_applicable': ['bg-slate-100', 'text-slate-600', 'border-slate-300']
        };
        (colors[radio.value] || []).forEach(c => label.classList.add(c));
        document.getElementById('na-justification')?.classList.toggle('hidden', radio.value !== 'not_applicable');
      });
    });

    // Changelog panel open/close
    const changelogPanel = document.getElementById('changelog-panel');
    const changelogOverlay = document.getElementById('changelog-overlay');

    document.getElementById('btn-open-changelog')?.addEventListener('click', async () => {
      changelogPanel.classList.remove('translate-x-full');
      changelogOverlay.classList.remove('hidden');
      try {
        const data = await ApiClient.getRequirementChangelog(project.id, reqId);
        document.getElementById('changelog-entries').innerHTML =
          Views._renderChangelogEntries(data.entries);
        if (window.lucide) lucide.createIcons();
      } catch (err) {
        document.getElementById('changelog-entries').innerHTML =
          '<div class="text-sm text-red-500 text-center py-4">Errore: ' + err.message + '</div>';
      }
    });

    const closeChangelog = () => {
      changelogPanel.classList.add('translate-x-full');
      changelogOverlay.classList.add('hidden');
    };
    document.getElementById('btn-close-changelog')?.addEventListener('click', closeChangelog);
    changelogOverlay?.addEventListener('click', closeChangelog);

    // Add action
    document.getElementById('add-action')?.addEventListener('click', () => {
      const list = document.getElementById('actions-list');
      const idx = list.children.length;
      const div = document.createElement('div');
      div.className = 'flex items-center gap-2 action-item';
      div.innerHTML = `
        <input type="checkbox" class="w-4 h-4 rounded border-slate-300 themed-checkbox" data-action-idx="${idx}">
        <input type="text" class="form-input flex-1 text-sm" placeholder="Descrivi l'azione..." data-action-text="${idx}">
        <button type="button" class="text-slate-400 hover:text-red-500 remove-action" data-idx="${idx}">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;
      list.appendChild(div);
      div.querySelector('input[type="text"]').focus();
      if (window.lucide) lucide.createIcons();
    });

    // Remove action (delegated)
    document.getElementById('actions-list')?.addEventListener('click', (e) => {
      if (e.target.closest('.remove-action')) {
        e.target.closest('.action-item').remove();
      }
    });

    // Submit form
    document.getElementById('evaluation-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
      const allReqs = flattenRequirements(cert.clauses);
      const req = allReqs.find(r => r.id === reqId);

      // Gather actions
      const actions = [];
      document.querySelectorAll('.action-item').forEach(item => {
        const text = item.querySelector('input[type="text"]')?.value;
        const done = item.querySelector('input[type="checkbox"]')?.checked;
        if (text) actions.push({ text, done });
      });

      // Gather checked evidences
      const evidenceNotes = [];
      if (req?.evidences) {
        req.evidences.forEach((ev, i) => {
          if (fd.get(`evidence_${i}`) === 'on') evidenceNotes.push(ev);
        });
      }

      const evaluation = {
        status: fd.get('status') || 'not_evaluated',
        notes: fd.get('notes') || '',
        priority: fd.get('priority') || 'medium',
        responsible: fd.get('responsible') || '',
        deadline: fd.get('deadline') || '',
        actions,
        evidenceNotes,
        auditNotes: fd.get('auditNotes') || '',
        naJustification: fd.get('naJustification') || '',
        history: project.evaluations[reqId]?.history || []
      };

      try {
        await Store.saveEvaluation(project.id, reqId, evaluation);
        App.showToast('Valutazione salvata', 'success');
        App.render();
      } catch (err) {
        App.showToast('Errore: ' + err.message, 'error');
      }
    });
  }
};
