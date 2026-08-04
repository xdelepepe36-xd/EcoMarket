/**
 * eco-theme.js — Sistema de temas EcoMarket v2
 * - 3 temas: Claro, Oscuro, Alto Contraste
 * - Persistencia con localStorage
 * - Sincronización con preferencias del sistema
 * - Transiciones suaves
 * - Eventos personalizados
 *
 * Incluir: <script src="eco-theme.js"></script>
 */
const EcoTheme = (() => {
  const KEY = 'eco_theme';
  const THEMES = {
    light: 'Claro',
    dark: 'Oscuro',
    highcontrast: 'Alto contraste'
  };

  // ── Gestión ────────────────────────────────────────────
  const get = () => localStorage.getItem(KEY) || 'light';
  const set = theme => {
    if (!THEMES[theme]) return;
    localStorage.setItem(KEY, theme);
    _apply(theme);
    _updateUI();
    window.dispatchEvent(new CustomEvent('eco-theme:change', { detail: { theme } }));
  };

  const toggle = () => {
    const current = get();
    const order = ['light', 'dark', 'highcontrast'];
    const idx = order.indexOf(current);
    set(order[(idx + 1) % order.length]);
  };

  const isDark = () => get() === 'dark';
  const isHighContrast = () => get() === 'highcontrast';

  // ── Aplicar tema ───────────────────────────────────────
  const _apply = theme => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);

    // Alto contraste: forzar colores
    if (theme === 'highcontrast') {
      html.style.setProperty('--verde', '#006400');
      html.style.setProperty('--verde-claro', '#228b22');
      html.style.setProperty('--texto', '#000000');
      html.style.setProperty('--texto-sec', '#333333');
      html.style.setProperty('--fondo', '#ffffff');
    } else {
      html.style.removeProperty('--verde');
      html.style.removeProperty('--verde-claro');
      html.style.removeProperty('--texto');
      html.style.removeProperty('--texto-sec');
      html.style.removeProperty('--fondo');
    }
  };

  // ── UI ─────────────────────────────────────────────────
  const _updateUI = () => {
    const theme = get();
    document.querySelectorAll('[data-eco-theme-btn]').forEach(btn => {
      btn.textContent = _getIcon(theme);
      btn.setAttribute('aria-label', `Tema: ${THEMES[theme]}`);

      // Tooltip
      let tip = btn.querySelector('.eco-theme-tip');
      if (!tip) {
        tip = document.createElement('span');
        tip.className = 'eco-theme-tip';
        tip.style.cssText = `
          position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
          background:#1f2a21;color:#fff;padding:4px 10px;border-radius:8px;
          font-size:0.7rem;font-weight:600;white-space:nowrap;opacity:0;
          pointer-events:none;transition:opacity 0.2s;
        `;
        btn.style.position = 'relative';
        btn.appendChild(tip);
      }
      tip.textContent = THEMES[theme];

      btn.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
      btn.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    });

    // Selector dropdown si existe
    document.querySelectorAll('[data-eco-theme-select]').forEach(select => {
      select.value = theme;
    });
  };

  const _getIcon = theme => {
    const icons = { light: '☀️', dark: '🌙', highcontrast: '♿' };
    return icons[theme] || '☀️';
  };

  // ── Inicialización ────────────────────────────────────
  const init = () => {
    // Detectar preferencia del sistema
    const saved = localStorage.getItem(KEY);
    if (!saved) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        localStorage.setItem(KEY, 'dark');
      }
    }

    // Aplicar tema guardado
    _apply(get());
    _updateUI();

    // Vincular botones
    document.querySelectorAll('[data-eco-theme-btn]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });

    // Vincular selectores
    document.querySelectorAll('[data-eco-theme-select]').forEach(select => {
      select.addEventListener('change', () => set(select.value));
    });

    // Escuchar cambios del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(KEY)) {
        set(e.matches ? 'dark' : 'light');
      }
    });
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return { get, set, toggle, isDark, isHighContrast };
})();

window.EcoTheme = EcoTheme;