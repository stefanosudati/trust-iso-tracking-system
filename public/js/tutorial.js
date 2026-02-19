/**
 * Tutorial - First-login onboarding wizard.
 * Shows a guided tour of the app's main features.
 */
const Tutorial = {

  _currentStep: 0,
  _overlay: null,

  _steps: [
    {
      title: 'Benvenuto!',
      description: 'Benvenuto in <strong>Trust ISO Tracking System</strong>, il tuo strumento per gestire i percorsi di certificazione ISO 9001:2015.<br><br>Questo breve tutorial ti guider\u00e0 alla scoperta delle funzionalit\u00e0 principali dell\'applicazione.',
      icon: 'hand-metal'
    },
    {
      title: 'Progetti',
      description: 'Dalla sezione <strong>Progetti</strong> puoi creare e gestire i tuoi progetti di certificazione. Ogni progetto \u00e8 associato a un cliente e a uno standard ISO, con tutte le informazioni necessarie per il percorso di certificazione.',
      icon: 'folder'
    },
    {
      title: 'Requisiti ISO',
      description: 'Per ogni progetto puoi valutare lo stato di conformit\u00e0 di ciascun requisito della norma: <strong>implementato</strong>, <strong>parzialmente implementato</strong>, <strong>non implementato</strong> o <strong>non applicabile</strong>. Aggiungi note, evidenze e scadenze per ogni requisito.',
      icon: 'clipboard-check'
    },
    {
      title: 'Documenti',
      description: 'La sezione <strong>Documenti</strong> ti permette di tracciare tutta la documentazione richiesta per la certificazione: manuali, procedure, registrazioni e moduli. Monitora lo stato di completamento di ciascun documento.',
      icon: 'file-text'
    },
    {
      title: 'Timeline',
      description: 'Nella <strong>Timeline</strong> puoi definire le milestone del progetto e monitorare le scadenze. Tieni sotto controllo l\'avanzamento del percorso di certificazione e non perdere mai una data importante.',
      icon: 'calendar'
    },
    {
      title: 'Report',
      description: 'Genera <strong>report di conformit\u00e0</strong> dettagliati per avere una panoramica completa dello stato del progetto. I report mostrano statistiche, grafici e aree critiche da affrontare.',
      icon: 'bar-chart-2'
    },
    {
      title: 'Tutto pronto!',
      description: 'Hai completato il tutorial! Ora sei pronto per iniziare.<br><br>Crea il tuo primo progetto dalla sezione <strong>Progetti</strong> oppure esplora la dashboard per familiarizzare con l\'interfaccia. Buon lavoro!',
      icon: 'rocket'
    }
  ],

  start() {
    this._currentStep = 0;
    this._createOverlay();
    this._renderStep();
  },

  _createOverlay() {
    // Remove existing overlay if present
    if (this._overlay) {
      this._overlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
    overlay.style.cssText = 'background-color: rgba(0,0,0,0); transition: background-color 0.3s ease;';

    overlay.innerHTML = `
      <div id="tutorial-card" class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform scale-95 opacity-0 transition-all duration-300 ease-out"
           style="max-height: 90vh;">

        <!-- Progress bar at top -->
        <div class="h-1 w-full bg-slate-100">
          <div id="tutorial-progress-bar" class="h-1 rounded-r-full transition-all duration-500 ease-out" style="background-color: var(--primary); width: 0%"></div>
        </div>

        <!-- Skip button -->
        <button id="tutorial-skip" class="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 transition-colors z-10">
          Salta tutorial
        </button>

        <!-- Content area -->
        <div class="p-8 pt-6">
          <!-- Icon -->
          <div id="tutorial-icon-container" class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300"
               style="background-color: var(--primary-light);">
            <i id="tutorial-icon" data-lucide="hand-metal" class="w-8 h-8" style="color: var(--primary);"></i>
          </div>

          <!-- Title -->
          <h2 id="tutorial-title" class="text-xl font-bold text-slate-800 text-center mb-3"></h2>

          <!-- Description -->
          <p id="tutorial-description" class="text-sm text-slate-600 text-center leading-relaxed mb-6"></p>

          <!-- Step indicator dots -->
          <div id="tutorial-dots" class="flex items-center justify-center gap-2 mb-6"></div>

          <!-- Navigation buttons -->
          <div class="flex items-center gap-3">
            <button id="tutorial-prev" class="flex-1 btn-secondary justify-center py-2.5 text-sm">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              Indietro
            </button>
            <button id="tutorial-next" class="flex-1 btn-primary justify-center py-2.5 text-sm">
              Avanti
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this._overlay = overlay;

    // Bind events
    overlay.querySelector('#tutorial-skip').addEventListener('click', () => this._complete(true));
    overlay.querySelector('#tutorial-prev').addEventListener('click', () => this._prevStep());
    overlay.querySelector('#tutorial-next').addEventListener('click', () => this._nextStep());

    // Close on overlay background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._complete(true);
    });

    // Keyboard navigation
    this._keyHandler = (e) => {
      if (e.key === 'Escape') this._complete(true);
      if (e.key === 'ArrowRight' || e.key === 'Enter') this._nextStep();
      if (e.key === 'ArrowLeft') this._prevStep();
    };
    document.addEventListener('keydown', this._keyHandler);

    // Animate in
    requestAnimationFrame(() => {
      overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
      const card = overlay.querySelector('#tutorial-card');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  },

  _renderStep() {
    const step = this._steps[this._currentStep];
    const total = this._steps.length;

    // Update progress bar
    const progressBar = document.getElementById('tutorial-progress-bar');
    if (progressBar) {
      progressBar.style.width = ((this._currentStep + 1) / total * 100) + '%';
    }

    // Update icon
    const iconEl = document.getElementById('tutorial-icon');
    if (iconEl) {
      iconEl.setAttribute('data-lucide', step.icon);
    }

    // Update title and description
    const titleEl = document.getElementById('tutorial-title');
    const descEl = document.getElementById('tutorial-description');
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.innerHTML = step.description;

    // Update dots
    const dotsContainer = document.getElementById('tutorial-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = this._steps.map((_, i) => {
        const isActive = i === this._currentStep;
        const isPast = i < this._currentStep;
        let dotStyle = 'background-color: #e2e8f0;';
        if (isActive) dotStyle = 'background-color: var(--primary); transform: scale(1.3);';
        else if (isPast) dotStyle = 'background-color: var(--primary); opacity: 0.4;';
        return `<div class="w-2 h-2 rounded-full transition-all duration-300" style="${dotStyle}"></div>`;
      }).join('');
    }

    // Update buttons
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    const isFirst = this._currentStep === 0;
    const isLast = this._currentStep === total - 1;

    if (prevBtn) {
      prevBtn.style.visibility = isFirst ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (isLast) {
        nextBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Inizia!';
      } else {
        nextBtn.innerHTML = 'Avanti <i data-lucide="arrow-right" class="w-4 h-4"></i>';
      }
    }

    // Re-init Lucide icons
    if (window.lucide) lucide.createIcons();
  },

  _nextStep() {
    if (this._currentStep < this._steps.length - 1) {
      this._currentStep++;
      this._animateTransition('next');
    } else {
      this._complete(false);
    }
  },

  _prevStep() {
    if (this._currentStep > 0) {
      this._currentStep--;
      this._animateTransition('prev');
    }
  },

  _animateTransition(direction) {
    const card = document.getElementById('tutorial-card');
    if (!card) {
      this._renderStep();
      return;
    }

    const content = card.querySelector('.p-8');
    if (!content) {
      this._renderStep();
      return;
    }

    // Quick fade out
    content.style.opacity = '0';
    content.style.transform = direction === 'next' ? 'translateX(-10px)' : 'translateX(10px)';
    content.style.transition = 'opacity 0.15s ease, transform 0.15s ease';

    setTimeout(() => {
      this._renderStep();
      // Fade in from opposite direction
      content.style.transform = direction === 'next' ? 'translateX(10px)' : 'translateX(-10px)';
      content.style.opacity = '0';

      requestAnimationFrame(() => {
        content.style.transform = 'translateX(0)';
        content.style.opacity = '1';
      });
    }, 150);
  },

  async _complete(skipped) {
    // Remove keyboard handler
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }

    // Animate out
    if (this._overlay) {
      this._overlay.style.backgroundColor = 'rgba(0,0,0,0)';
      const card = this._overlay.querySelector('#tutorial-card');
      if (card) {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
      }

      setTimeout(() => {
        if (this._overlay) {
          this._overlay.remove();
          this._overlay = null;
        }
      }, 300);
    }

    // Mark tutorial as complete on the server
    try {
      await ApiClient.completeTutorial();
    } catch (err) {
      console.warn('Errore completamento tutorial:', err.message);
    }

    // Show toast
    if (typeof App !== 'undefined' && App.showToast) {
      if (skipped) {
        App.showToast('Tutorial saltato. Puoi esplorare l\'app liberamente!', 'info');
      } else {
        App.showToast('Tutorial completato! Benvenuto in Trust ISO.', 'success');
      }
    }
  }
};
