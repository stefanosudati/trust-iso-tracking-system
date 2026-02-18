/**
 * Trust ISO Tracking System — Theme Definitions & Manager
 */

const ThemeDefinitions = {
  'default': {
    name: 'Default (Blue)',
    colors: {
      '--primary': '#2563eb',
      '--primary-hover': '#1d4ed8',
      '--primary-light': '#dbeafe',
      '--primary-lighter': '#eff6ff',
      '--primary-text': '#1d4ed8',
      '--primary-text-light': '#2563eb',
      '--primary-rgb': '37, 99, 235',

      '--sidebar-bg': '#ffffff',
      '--sidebar-text': '#475569',
      '--sidebar-hover-bg': '#f8fafc',
      '--sidebar-active-bg': '#eff6ff',
      '--sidebar-active-text': '#1d4ed8',
      '--sidebar-active-icon': '#2563eb',
      '--sidebar-border': '#e2e8f0',
      '--sidebar-section': '#64748b',

      '--header-bg': '#ffffff',
      '--header-border': '#e2e8f0',

      '--body-bg': '#f8fafc',

      '--focus-border': '#60a5fa',
      '--focus-ring': 'rgba(59, 130, 246, 0.1)',

      '--badge-bg': '#dbeafe',
      '--badge-text': '#1d4ed8',
      '--progress-bar': '#3b82f6',

      '--chart-fill': 'rgba(37, 99, 235, 0.15)',
      '--chart-stroke': '#2563eb',

      '--app-title': '#1e293b',
    }
  },

  'trust-corporate': {
    name: 'Trust Corporate',
    colors: {
      '--primary': '#2A5C73',
      '--primary-hover': '#1F4A5E',
      '--primary-light': '#D4E8F0',
      '--primary-lighter': '#EBF4F8',
      '--primary-text': '#1F4A5E',
      '--primary-text-light': '#2A5C73',
      '--primary-rgb': '42, 92, 115',

      '--sidebar-bg': '#C5124E',
      '--sidebar-text': 'rgba(255,255,255,0.75)',
      '--sidebar-hover-bg': 'rgba(255,255,255,0.08)',
      '--sidebar-active-bg': 'rgba(255,255,255,0.18)',
      '--sidebar-active-text': '#ffffff',
      '--sidebar-active-icon': '#ffffff',
      '--sidebar-border': '#A80F42',
      '--sidebar-section': 'rgba(255,255,255,0.5)',

      '--header-bg': '#ffffff',
      '--header-border': '#e2e8f0',

      '--body-bg': '#f8fafc',

      '--focus-border': '#4A8CA3',
      '--focus-ring': 'rgba(42, 92, 115, 0.15)',

      '--badge-bg': '#D4E8F0',
      '--badge-text': '#1F4A5E',
      '--progress-bar': '#2A5C73',

      '--chart-fill': 'rgba(42, 92, 115, 0.15)',
      '--chart-stroke': '#2A5C73',

      '--app-title': '#2A5C73',
    }
  },

  'ocean': {
    name: 'Ocean',
    colors: {
      '--primary': '#0e7490',
      '--primary-hover': '#0c6378',
      '--primary-light': '#cffafe',
      '--primary-lighter': '#ecfeff',
      '--primary-text': '#0e7490',
      '--primary-text-light': '#0891b2',
      '--primary-rgb': '14, 116, 144',

      '--sidebar-bg': '#0c4a6e',
      '--sidebar-text': 'rgba(255,255,255,0.7)',
      '--sidebar-hover-bg': 'rgba(255,255,255,0.08)',
      '--sidebar-active-bg': 'rgba(255,255,255,0.15)',
      '--sidebar-active-text': '#ffffff',
      '--sidebar-active-icon': '#ffffff',
      '--sidebar-border': '#075985',
      '--sidebar-section': 'rgba(255,255,255,0.45)',

      '--header-bg': '#ffffff',
      '--header-border': '#e2e8f0',

      '--body-bg': '#f0f9ff',

      '--focus-border': '#22d3ee',
      '--focus-ring': 'rgba(14, 116, 144, 0.15)',

      '--badge-bg': '#cffafe',
      '--badge-text': '#0e7490',
      '--progress-bar': '#06b6d4',

      '--chart-fill': 'rgba(14, 116, 144, 0.15)',
      '--chart-stroke': '#0e7490',

      '--app-title': '#0c4a6e',
    }
  },

  'forest': {
    name: 'Forest',
    colors: {
      '--primary': '#15803d',
      '--primary-hover': '#166534',
      '--primary-light': '#dcfce7',
      '--primary-lighter': '#f0fdf4',
      '--primary-text': '#15803d',
      '--primary-text-light': '#16a34a',
      '--primary-rgb': '21, 128, 61',

      '--sidebar-bg': '#14532d',
      '--sidebar-text': 'rgba(255,255,255,0.7)',
      '--sidebar-hover-bg': 'rgba(255,255,255,0.08)',
      '--sidebar-active-bg': 'rgba(255,255,255,0.15)',
      '--sidebar-active-text': '#ffffff',
      '--sidebar-active-icon': '#ffffff',
      '--sidebar-border': '#166534',
      '--sidebar-section': 'rgba(255,255,255,0.45)',

      '--header-bg': '#ffffff',
      '--header-border': '#e2e8f0',

      '--body-bg': '#f0fdf4',

      '--focus-border': '#4ade80',
      '--focus-ring': 'rgba(21, 128, 61, 0.15)',

      '--badge-bg': '#dcfce7',
      '--badge-text': '#15803d',
      '--progress-bar': '#22c55e',

      '--chart-fill': 'rgba(21, 128, 61, 0.15)',
      '--chart-stroke': '#15803d',

      '--app-title': '#14532d',
    }
  },

  'slate': {
    name: 'Slate',
    colors: {
      '--primary': '#475569',
      '--primary-hover': '#334155',
      '--primary-light': '#e2e8f0',
      '--primary-lighter': '#f1f5f9',
      '--primary-text': '#334155',
      '--primary-text-light': '#475569',
      '--primary-rgb': '71, 85, 105',

      '--sidebar-bg': '#1e293b',
      '--sidebar-text': 'rgba(255,255,255,0.65)',
      '--sidebar-hover-bg': 'rgba(255,255,255,0.06)',
      '--sidebar-active-bg': 'rgba(255,255,255,0.12)',
      '--sidebar-active-text': '#ffffff',
      '--sidebar-active-icon': '#ffffff',
      '--sidebar-border': '#334155',
      '--sidebar-section': 'rgba(255,255,255,0.4)',

      '--header-bg': '#ffffff',
      '--header-border': '#e2e8f0',

      '--body-bg': '#f8fafc',

      '--focus-border': '#94a3b8',
      '--focus-ring': 'rgba(71, 85, 105, 0.15)',

      '--badge-bg': '#e2e8f0',
      '--badge-text': '#334155',
      '--progress-bar': '#64748b',

      '--chart-fill': 'rgba(71, 85, 105, 0.15)',
      '--chart-stroke': '#475569',

      '--app-title': '#1e293b',
    }
  }
};

// ─── Theme Manager ───────────────────────────────────────

const ThemeManager = {
  _currentTheme: 'default',

  apply(themeId) {
    const theme = ThemeDefinitions[themeId];
    if (!theme) return;

    const root = document.documentElement;
    for (const [prop, value] of Object.entries(theme.colors)) {
      root.style.setProperty(prop, value);
    }
    this._currentTheme = themeId;
    localStorage.setItem('trust_iso_theme', themeId);
    localStorage.setItem('trust_iso_theme_vars', JSON.stringify(theme.colors));
    document.body?.setAttribute('data-theme', themeId);
  },

  current() {
    return this._currentTheme;
  },

  loadFromStorage() {
    const saved = localStorage.getItem('trust_iso_theme');
    this.apply(saved && ThemeDefinitions[saved] ? saved : 'default');
  },

  syncFromUser(userTheme) {
    if (userTheme && ThemeDefinitions[userTheme]) {
      this.apply(userTheme);
    }
  },

  async saveToServer(themeId) {
    try {
      await ApiClient._fetch('/auth/theme', {
        method: 'PUT',
        body: JSON.stringify({ theme: themeId })
      });
    } catch (e) {
      console.warn('Could not save theme to server:', e);
    }
  },

  getAll() {
    return Object.entries(ThemeDefinitions).map(([id, def]) => ({ id, name: def.name }));
  }
};
