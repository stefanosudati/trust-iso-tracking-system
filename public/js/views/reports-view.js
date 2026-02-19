/**
 * ReportsView - Reports and export views and bindings.
 */
const ReportsView = {

  reports(project) {
    if (!project) return '<div class="p-6">Nessun progetto attivo</div>';
    const stats = Store.getProjectStats(project.id);
    const cert = CERTIFICATIONS.find(c => c.id === project.certificationId);

    return `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Report e Esportazione</h1>
        <p class="text-slate-500">${project.clientName} - ${cert?.name}</p>
      </div>

      <!-- Export Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button id="export-json" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-all" onmouseenter="this.style.borderColor='var(--primary-light)'" onmouseleave="this.style.borderColor=''">
          <div class="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center mb-3">
            <i data-lucide="database" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Backup JSON</h3>
          <p class="text-sm text-slate-500 mt-1">Esporta tutti i dati in formato JSON</p>
        </button>
      </div>

      <!-- Quick Summary -->
      ${stats ? `
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-800 mb-4">Riepilogo Veloce</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-emerald-600">${stats.implemented}</div>
            <div class="text-xs text-slate-500">Conformi</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-amber-600">${stats.partial}</div>
            <div class="text-xs text-slate-500">Parziali</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">${stats.notImplemented}</div>
            <div class="text-xs text-slate-500">Non conformi</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-400">${stats.notApplicable}</div>
            <div class="text-xs text-slate-500">N/A</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-300">${stats.notEvaluated}</div>
            <div class="text-xs text-slate-500">Da valutare</div>
          </div>
        </div>
      </div>
      ` : ''}
    </div>`;
  },

  bindReports(project) {
    if (!project) return;
    document.getElementById('export-json')?.addEventListener('click', () => App.exportData());
  }
};
