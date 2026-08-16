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
    night: 'Noche AMOLED',
    sepia: 'Sepia',
    highcontrast: 'Alto contraste'
  };

  // Paleta personalizada por tema especial (sobrescribe variables CSS)
  const PALETTES = {
    night: {
      '--verde': '#9cef6b',
      '--verde-claro': '#c8ffad',
      '--texto': '#eef6ea',
      '--texto-sec': '#9fb4a3',
      '--fondo': '#00050a',
      '--fondo-alt': '#050b12',
      '--surface': 'rgba(6, 16, 22, 0.95)',
      '--surface-strong': 'rgba(8, 20, 28, 0.99)',
      '--blanco': '#eef6ea',
      '--sombra': '0 8px 24px rgba(0,0,0,0.7)',
      '--sombra-lg': '0 16px 48px rgba(0,0,0,0.8)'
    },
    dark: {
      '--verde': '#7ed957',
      '--verde-claro': '#a8ff80',
      '--texto': '#edf5ea',
      '--texto-sec': '#babfb6',
      '--fondo': '#0c1210',
      '--fondo-alt': '#141b17',
      '--surface': 'rgba(16, 28, 20, 0.92)',
      '--surface-strong': 'rgba(20, 34, 26, 0.97)',
      '--blanco': '#f8faf5'
    },
    sepia: {
      '--texto': '#4a3b2a',
      '--texto-sec': '#7a6a55',
      '--fondo': '#f7f1e5',
      '--fondo-alt': '#efe5d2',
      '--surface': 'rgba(255, 252, 246, 0.94)',
      '--surface-strong': 'rgba(255, 252, 246, 0.98)',
      '--blanco': '#4a3b2a',
      '--verde': '#5b7a3a',
      '--verde-claro': '#7e9c5b',
      '--sombra': '0 8px 24px rgba(90, 70, 40, 0.14)'
    },
    highcontrast: {
      '--verde': '#006400',
      '--verde-claro': '#228b22',
      '--texto': '#000000',
      '--texto-sec': '#333333',
      '--fondo': '#ffffff',
      '--fondo-alt': '#f2f2f2',
      '--surface': '#ffffff',
      '--blanco': '#000000'
    }
  };

  // ── Gestión ────────────────────────────────────────────
  const readStorage = (fallback = 'light') => {
    try {
      return localStorage.getItem(KEY) || fallback;
    } catch (error) {
      return fallback;
    }
  };

  const writeStorage = theme => {
    try {
      localStorage.setItem(KEY, theme);
    } catch (error) {
      // Storage may be unavailable in some browser contexts.
    }
  };

  const get = () => readStorage('light');
  const set = theme => {
    if (!THEMES[theme]) return;
    writeStorage(theme);
    _apply(theme);
    _updateUI();
    window.dispatchEvent(new CustomEvent('eco-theme:change', { detail: { theme } }));
  };

  const toggle = () => {
    const current = get();
    const order = ['light', 'dark', 'night', 'sepia', 'highcontrast'];
    const idx = order.indexOf(current);
    set(order[(idx + 1) % order.length]);
  };

  const isDark = () => get() === 'dark' || get() === 'night';
  const isHighContrast = () => get() === 'highcontrast';
  const isSepia = () => get() === 'sepia';

  // ── Aplicar tema ───────────────────────────────────────
  const _apply = theme => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);

    // Temas especiales: aplicar paleta de variables en línea
    const palette = PALETTES[theme];
    const defaultProps = ['--verde', '--verde-claro', '--texto', '--texto-sec', '--fondo', '--fondo-alt', '--surface', '--surface-strong', '--blanco', '--sombra', '--sombra-md', '--sombra-lg'];
    if (palette) {
      defaultProps.forEach((prop) => html.style.setProperty(prop, palette[prop] || ''));
      // Marcar tema oscuro para selectores auxiliares
      html.classList.toggle('is-dark', theme === 'dark' || theme === 'night');
    } else {
      defaultProps.forEach((prop) => html.style.removeProperty(prop));
      html.classList.remove('is-dark');
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
    const icons = { light: '☀️', dark: '🌙', night: '🌃', sepia: '🕯️', highcontrast: '♿' };
    return icons[theme] || '☀️';
  };

  // ── Inicialización ────────────────────────────────────
  const init = () => {
    // Detectar preferencia del sistema
    const saved = readStorage();
    if (!saved || !THEMES[saved]) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        writeStorage('dark');
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