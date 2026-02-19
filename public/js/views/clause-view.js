/**
 * ClauseView - Clause view rendering and binding
 */
const ClauseView = {

  clauseView(project, clauseNumber) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);
    const clause = cert?.clauses.find(c => c.number === clauseNumber);
    if (!clause) return '<div class="p-6">Clausola non trovata</div>';

    const allReqs = this._flattenClauseRequirements(clause);

    return `
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <a href="#" onclick="App.navigate('dashboard'); return false;" onmouseenter="this.style.color='var(--primary-text-light)'" onmouseleave="this.style.color=''">Dashboard</a>
            <span>/</span>
            <span>Clausola ${clause.number}</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Clausola ${clause.number}: ${clause.title}</h1>
        </div>
      </div>

      <!-- Requirements List -->
      <div class="space-y-3">
        ${allReqs.map(req => {
          const ev = project.evaluations[req.id] || { status: 'not_evaluated' };
          return `
          <div class="bg-white rounded-xl border ${App.statusColor(ev.status)} p-4 hover:shadow-sm transition-all cursor-pointer requirement-row"
               data-req="${req.id}">
            <div class="flex items-center gap-3">
              ${App.statusIcon(ev.status)}
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-800">${req.id}</span>
                  <span class="text-slate-700">${req.title}</span>
                </div>
                ${ev.notes ? `<p class="text-sm text-slate-500 mt-1 truncate">${App.truncate(ev.notes, 80)}</p>` : ''}
              </div>
              <div class="flex items-center gap-2">
                ${ev.priority && ev.status === 'not_implemented' ? `<span class="text-xs px-2 py-0.5 rounded ${App.priorityColor(ev.priority)}">${App.priorityLabel(ev.priority)}</span>` : ''}
                ${ev.deadline ? `<span class="text-xs text-slate-500">${App.formatDate(ev.deadline)}</span>` : ''}
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  _flattenClauseRequirements(clause) {
    const result = [];
    function walk(items) {
      if (!items) return;
      for (const item of items) {
        result.push(item);
        if (item.subRequirements) walk(item.subRequirements);
      }
    }
    walk(clause.requirements);
    return result;
  },

  bindClauseView(_project, _clauseNumber) {
    document.querySelectorAll('.requirement-row').forEach(el => {
      el.addEventListener('click', () => {
        App.navigate('requirement', { currentRequirement: el.dataset.req });
      });
    });
  }
};
