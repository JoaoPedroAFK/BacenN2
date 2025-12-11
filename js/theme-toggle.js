/* === SISTEMA DE TEMA ESCURO - BACEN === */

// === SISTEMA DE TEMA ESCURO ===
class ThemeToggle {
  constructor() {
    this.isDarkMode = false;
    this.init();
  }

  init() {
    // Carregar tema salvo
    this.loadSavedTheme();
    
    // Aplicar tema inicial
    this.applyTheme();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('bacen-theme') || 'light';
    this.isDarkMode = savedTheme === 'dark';
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.saveTheme();
    this.updateToggleButton();
  }

  applyTheme() {
    const root = document.documentElement;
    
    if (this.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  saveTheme() {
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('bacen-theme', theme);
  }

  updateToggleButton() {
    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
      btn.innerHTML = this.isDarkMode ? '☀️' : '🌙';
    }
  }
}

// === FUNÇÃO GLOBAL PARA TOGGLE ===
function toggleTheme() {
  if (window.themeToggle) {
    window.themeToggle.toggleTheme();
  }
}

// === INICIALIZAR QUANDO O DOM ESTIVER PRONTO ===
document.addEventListener('DOMContentLoaded', () => {
  window.themeToggle = new ThemeToggle();
});
