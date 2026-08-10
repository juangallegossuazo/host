/* Navigation menu & theme switcher for BlockSite settings */

function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('blocksite_theme') || 'dark';

  setTheme(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
      localStorage.setItem('blocksite_theme', next);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    const textEl = toggleBtn.querySelector('.theme-text');
    if (textEl) {
      textEl.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    }
  }
}

function initMenu() {
  const items = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const titleEl = document.getElementById('pageTitle');
  const subtitleEl = document.getElementById('pageSubtitle');

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const target = item.dataset.target;
      sections.forEach(s => s.classList.toggle('active', s.id === target));

      if (titleEl && item.dataset.title) titleEl.textContent = item.dataset.title;
      if (subtitleEl && item.dataset.subtitle) subtitleEl.textContent = item.dataset.subtitle;
    });
  });

  const search = document.getElementById('navSearch');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      items.forEach(item => {
        const label = (item.dataset.title || '').toLowerCase();
        item.style.display = (!q || label.includes(q)) ? '' : 'none';
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenu();
  });
} else {
  initTheme();
  initMenu();
}
