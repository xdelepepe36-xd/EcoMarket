/**
 * eco-toast.js — Notificaciones globales EcoMarket
 * Incluir en cualquier HTML: <script src="eco-toast.js"></script>
 */

const EcoToast = (() => {
    let container = null;
    let queue = [];
    let active = 0;
    const MAX = 4;

    const ICONS = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
        error:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        eco:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 22c0 0 4-8 10-10s10 0 10 0-4 8-10 10S2 22 2 22z"/></svg>',
    };

    const COLORS = {
        success: { bg: '#2e7d32', light: '#e8f5e9', text: '#1b5e20' },
        error:   { bg: '#b91c1c', light: '#fdecea', text: '#7f1d1d' },
        warning: { bg: '#d97706', light: '#fff7ed', text: '#92400e' },
        info:    { bg: '#1565c0', light: '#e3f2fd', text: '#0d47a1' },
        eco:     { bg: '#2e7d32', light: '#e8f5e9', text: '#1b5e20' },
    };

    function _ensureContainer() {
        if (container) return;
        container = document.createElement('div');
        container.id = 'ecoToastContainer';
        container.style.cssText = `
            position: fixed; bottom: 24px; right: 24px;
            display: flex; flex-direction: column-reverse; gap: 10px;
            z-index: 99999; pointer-events: none;
            font-family: 'Poppins', sans-serif;
        `;
        document.body.appendChild(container);
    }

    function _show({ message, type = 'success', duration = 3000, action = null }) {
        _ensureContainer();

        if (active >= MAX) {
            queue.push({ message, type, duration, action });
            return;
        }
        active++;

        const color = COLORS[type] || COLORS.success;
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${color.bg};
            color: #fff;
            padding: 13px 18px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 260px;
            max-width: 340px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.18);
            pointer-events: auto;
            cursor: default;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
            position: relative;
            overflow: hidden;
        `;

        // Progress bar
        const progress = document.createElement('div');
        progress.style.cssText = `
            position: absolute; bottom: 0; left: 0;
            height: 3px; background: rgba(255,255,255,0.4);
            border-radius: 0 0 14px 14px;
            width: 100%;
            transform-origin: left;
            transition: transform ${duration}ms linear;
        `;

        const icon = document.createElement('span');
        icon.style.cssText = 'flex-shrink:0; display:flex; align-items:center;';
        icon.innerHTML = ICONS[type] || ICONS.success;

        const text = document.createElement('span');
        text.style.cssText = 'font-size:0.88rem; font-weight:600; line-height:1.4; flex:1;';
        text.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.2); border: none; color: #fff;
            width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.75rem; flex-shrink: 0; padding: 0;
            transition: background 0.2s;
        `;
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => _dismiss(toast));

        toast.appendChild(progress);
        toast.appendChild(icon);
        toast.appendChild(text);

        if (action) {
            const actionBtn = document.createElement('button');
            actionBtn.style.cssText = `
                background: rgba(255,255,255,0.2); border: none; color: #fff;
                padding: 5px 12px; border-radius: 8px; cursor: pointer;
                font-family: inherit; font-size: 0.78rem; font-weight: 700;
                flex-shrink: 0; transition: background 0.2s;
            `;
            actionBtn.textContent = action.label;
            actionBtn.addEventListener('click', () => { action.fn(); _dismiss(toast); });
            toast.appendChild(actionBtn);
        }

        toast.appendChild(closeBtn);
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.transform = 'translateX(0)';
                toast.style.opacity = '1';
                progress.style.transform = 'scaleX(0)';
            });
        });

        const timer = setTimeout(() => _dismiss(toast), duration);
        toast._timer = timer;

        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(toast._timer);
            progress.style.transition = 'none';
        });
        toast.addEventListener('mouseleave', () => {
            progress.style.transition = `transform 1200ms linear`;
            progress.style.transform = 'scaleX(0)';
            toast._timer = setTimeout(() => _dismiss(toast), 1200);
        });
    }

    function _dismiss(toast) {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        toast.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        setTimeout(() => {
            toast.remove();
            active--;
            if (queue.length > 0) _show(queue.shift());
        }, 300);
    }

    // ── API pública ────────────────────────────────────────
    function success(message, opts = {}) { _show({ message, type: 'success', ...opts }); }
    function error(message, opts = {})   { _show({ message, type: 'error',   ...opts }); }
    function warning(message, opts = {}) { _show({ message, type: 'warning', ...opts }); }
    function info(message, opts = {})    { _show({ message, type: 'info',    ...opts }); }
    function eco(message, opts = {})     { _show({ message, type: 'eco',     ...opts }); }

    // Con botón de acción: EcoToast.success('Eliminado', { action: { label: 'Deshacer', fn: () => {} } })
    function show(message, type = 'success', opts = {}) { _show({ message, type, ...opts }); }

    // Inicializar: reemplaza los toasts inline existentes
    function init() {
        // Exponer globalmente para compatibilidad con HTMLs existentes
        window.showToast = (msg, type = 'success') => _show({ message: msg, type });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

    return { success, error, warning, info, eco, show };
})();

window.EcoToast = EcoToast;
