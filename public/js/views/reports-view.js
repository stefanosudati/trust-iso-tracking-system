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
        <button id="report-gap-analysis" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-all" onmouseenter="this.style.borderColor='var(--primary-light)'" onmouseleave="this.style.borderColor=''">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <i data-lucide="clipboard-check" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Report Gap Analysis</h3>
          <p class="text-sm text-slate-500 mt-1">Stato di tutti i requisiti per clausola</p>
        </button>
        <button id="report-implementation-plan" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-all" onmouseenter="this.style.borderColor='var(--primary-light)'" onmouseleave="this.style.borderColor=''">
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <i data-lucide="list-checks" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Piano di Implementazione</h3>
          <p class="text-sm text-slate-500 mt-1">NC e parziali con azioni e milestone</p>
        </button>
        <button id="report-executive-summary" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-all" onmouseenter="this.style.borderColor='var(--primary-light)'" onmouseleave="this.style.borderColor=''">
          <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <i data-lucide="pie-chart" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Executive Summary</h3>
          <p class="text-sm text-slate-500 mt-1">Riepilogo conformita per la direzione</p>
        </button>
        <button id="report-documents-checklist" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-all" onmouseenter="this.style.borderColor='var(--primary-light)'" onmouseleave="this.style.borderColor=''">
          <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <i data-lucide="file-check" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Checklist Documenti</h3>
          <p class="text-sm text-slate-500 mt-1">Documenti obbligatori vs registrati</p>
        </button>
        <button id="report-nc-register" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md transition-all" onmouseenter="this.style.borderColor='var(--primary-light)'" onmouseleave="this.style.borderColor=''">
          <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
          </div>
          <h3 class="font-semibold text-slate-800">Registro NC</h3>
          <p class="text-sm text-slate-500 mt-1">Non conformita con dettagli e azioni</p>
        </button>
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
    document.getElementById('report-gap-analysis')?.addEventListener('click', () => ReportExport.gapAnalysis(project));
    document.getElementById('report-implementation-plan')?.addEventListener('click', () => ReportExport.implementationPlan(project));
    document.getElementById('report-executive-summary')?.addEventListener('click', () => ReportExport.executiveSummary(project));
    document.getElementById('report-documents-checklist')?.addEventListener('click', () => ReportExport.documentsChecklist(project));
    document.getElementById('report-nc-register')?.addEventListener('click', () => ReportExport.ncRegister(project));
    document.getElementById('export-json')?.addEventListener('click', () => App.exportData());
  }
};
