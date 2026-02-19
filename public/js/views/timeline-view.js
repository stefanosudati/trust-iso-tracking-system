/**
 * TimelineView - Timeline/milestone views and bindings.
 * Extracted from views.js: timeline, bindTimeline
 */
const TimelineView = {

  timeline(project) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const milestones = (project.milestones || []).sort((a, b) => new Date(a.date) - new Date(b.date));
    const start = milestones[0]?.date ? new Date(milestones[0].date) : new Date();
    const end = milestones[milestones.length - 1]?.date ? new Date(milestones[milestones.length - 1].date) : new Date();
    const totalDays = Math.max((end - start) / 86400000, 1);
    const now = new Date();
    const nowOffset = Math.max(0, Math.min(100, ((now - start) / 86400000 / totalDays) * 100));

    return `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Timeline Progetto</h1>
          <p class="text-slate-500">${App.formatDate(milestones[0]?.date)} - ${App.formatDate(milestones[milestones.length - 1]?.date)}</p>
        </div>
        <button id="add-milestone-btn" class="btn-secondary flex-shrink-0">
          <i data-lucide="plus" class="w-4 h-4"></i> Aggiungi Milestone
        </button>
      </div>

      <!-- Visual Timeline -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <!-- Progress bar -->
        <div class="relative mb-8">
          <div class="h-2 bg-slate-100 rounded-full">
            <div class="h-2 rounded-full transition-all" style="background-color: var(--progress-bar); width:${nowOffset}%"></div>
          </div>
          <div class="absolute top-0 h-2 w-0.5 bg-red-500" style="left:${nowOffset}%">
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-red-600 font-medium whitespace-nowrap">Oggi</div>
          </div>
        </div>

        <!-- Milestones -->
        <div class="space-y-4">
          ${milestones.map((m, i) => {
            const isPast = new Date(m.date) < now;
            const days = App.daysUntil(m.date);
            return `
            <div class="flex items-center gap-4 milestone-row" data-idx="${i}">
              <div class="w-20 text-right text-xs text-slate-500 flex-shrink-0">${App.formatDate(m.date)}</div>
              <div class="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                <div class="w-4 h-4 rounded-full border-2 ${m.completed ? 'bg-emerald-500 border-emerald-500' : isPast ? 'bg-amber-400 border-amber-400' : 'bg-white border-slate-300'}"></div>
                ${i < milestones.length - 1 ? '<div class="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-200"></div>' : ''}
              </div>
              <div class="flex-1 flex items-center gap-3 p-3 rounded-lg ${m.completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}">
                <div class="flex-1">
                  <div class="font-medium text-sm ${m.completed ? 'text-emerald-800 line-through' : 'text-slate-800'}">${m.title}</div>
                </div>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" class="milestone-check w-4 h-4 rounded border-slate-300 text-emerald-600" data-ms-id="${m.id}" ${m.completed ? 'checked' : ''}>
                  <span class="text-xs text-slate-500">${m.completed ? 'Fatto' : days > 0 ? days + 'g' : 'Scaduto'}</span>
                </label>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  bindTimeline(project) {
    if (!project) return;

    // Toggle milestone
    document.querySelectorAll('.milestone-check').forEach(el => {
      el.addEventListener('change', async () => {
        const milestones = project.milestones || [];
        const ms = milestones.find(m => m.id === el.dataset.msId);
        if (ms) {
          ms.completed = el.checked;
          try {
            await Store.saveMilestones(project.id, milestones);
            App.render();
          } catch (err) {
            App.showToast('Errore aggiornamento milestone: ' + err.message, 'error');
          }
        }
      });
    });

    // Add milestone
    document.getElementById('add-milestone-btn')?.addEventListener('click', () => {
      App.showModal('Nuova Milestone', `
        <form id="milestone-form" class="space-y-4">
          <div>
            <label class="form-label">Titolo *</label>
            <input type="text" name="title" required class="form-input">
          </div>
          <div>
            <label class="form-label">Data *</label>
            <input type="date" name="date" required class="form-input">
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="App.closeModal()" class="btn-secondary">Annulla</button>
            <button type="submit" class="btn-primary">Aggiungi</button>
          </div>
        </form>
      `);

      document.getElementById('milestone-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const milestones = project.milestones || [];
        milestones.push({
          id: 'ms-' + Date.now(),
          title: fd.get('title'),
          date: fd.get('date'),
          type: 'custom',
          completed: false
        });
        try {
          await Store.saveMilestones(project.id, milestones);
          App.closeModal();
          App.showToast('Milestone aggiunta', 'success');
          App.render();
        } catch (err) {
          App.showToast('Errore aggiunta milestone: ' + err.message, 'error');
        }
      });
    });
  }
};
