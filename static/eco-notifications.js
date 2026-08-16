/**
 * eco-notifications.js — Sistema de notificaciones EcoMarket
 * Notificaciones push-style, campanita con dropdown, persistencia local
 *
 * Incluir: <script src="eco-notifications.js"></script>
 */
const EcoNotifications = (() => {
  const KEY = 'eco_notifications';
  const MAX_VISIBLE = 5;
  const t = (key, params = {}) => (window.EcoI18n && typeof window.EcoI18n.t === 'function') ? window.EcoI18n.t(key, params) : key;

  // ── Datos ──────────────────────────────────────────────
  const get = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = items => {
    localStorage.setItem(KEY, JSON.stringify(items));
    _dispatch();
  };

  const add = (title, message, opts = {}) => {
    const { type = 'info', icon = '', link = '', timeout = 0 } = opts;
    const items = get();
    items.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title,
      message,
      type,
      icon: icon || _getIcon(type),
      link,
      read: false,
      timestamp: Date.now()
    });
    // Máximo 50 notificaciones
    if (items.length > 50) items.length = 50;
    save(items);
    _renderDropdown();
    _updateBadge();

    // Toast si está disponible
    if (window.EcoToast) {
      const toastMap = { success: 'success', error: 'error', warning: 'warning', info: 'info', eco: 'eco' };
      EcoToast[toastMap[type] || 'info'](message, { duration: 4000 });
    }

    // Timeout para auto-remover
    if (timeout > 0) {
      setTimeout(() => {
        const current = get();
        const idx = current.findIndex(n => n.id === items[0].id);
        if (idx >= 0) {
          current.splice(idx, 1);
          save(current);
          _renderDropdown();
          _updateBadge();
        }
      }, timeout);
    }
  };

  const markRead = id => {
    const items = get();
    const item = items.find(n => n.id === id);
    if (item) { item.read = true; save(items); _renderDropdown(); _updateBadge(); }
  };

  const markAllRead = () => {
    const items = get();
    items.forEach(n => n.read = true);
    save(items);
    _renderDropdown();
    _updateBadge();
  };

  const remove = id => {
    save(get().filter(n => n.id !== id));
    _renderDropdown();
    _updateBadge();
  };

  const clearAll = () => {
    save([]);
    _renderDropdown();
    _updateBadge();
  };

  const unreadCount = () => get().filter(n => !n.read).length;

  // ── UI ─────────────────────────────────────────────────
  const _getIcon = type => {
    const icons = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️', eco: '🌿',
      order: '📦', heart: '❤️', message: '💬', sale: '💰', star: '⭐'
    };
    return icons[type] || '🔔';
  };

  const _dispatch = () => {
    window.dispatchEvent(new CustomEvent('eco-notifications:update', {
      detail: { items: get(), unread: unreadCount() }
    }));
  };

  const _updateBadge = () => {
    const count = unreadCount();
    document.querySelectorAll('.eco-notif-badge').forEach(el => {
      el.textContent = count > 9 ? '9+' : count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  };

  // ── Construir dropdown ─────────────────────────────────
  const _buildDropdown = () => {
    if (document.getElementById('ecoNotifDropdown')) return;

    const container = document.createElement('div');
    container.id = 'ecoNotifDropdown';
    container.style.cssText = `
      position: fixed; top: 72px; right: 20px; z-index: 9999;
      background: #fff; border-radius: 20px; width: 360px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.18);
      border: 1px solid rgba(46,125,50,0.12);
      font-family: 'Poppins', sans-serif;
      transform: translateY(-10px) scale(0.95); opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
      max-height: 480px; display: flex; flex-direction: column;
    `;
    container.innerHTML = `
      <div style="padding:18px 20px;border-bottom:1px solid rgba(46,125,50,0.08);display:flex;align-items:center;justify-content:space-between">
        <strong style="font-size:0.95rem;display:flex;align-items:center;gap:8px">
          <span>🔔</span> ${t('notifications.title')}
          <span id="ecoNotifCount" style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:700">0</span>
        </strong>
        <div style="display:flex;gap:6px">
          <button id="ecoNotifMarkAll" style="background:none;border:none;color:#2e7d32;font-size:0.72rem;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:8px">${t('notifications.read_all')}</button>
          <button id="ecoNotifClear" style="background:none;border:none;color:#e53935;font-size:0.72rem;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:8px">${t('notifications.clear')}</button>
        </div>
      </div>
      <div id="ecoNotifList" style="flex:1;overflow-y:auto;padding:8px 12px;min-height:80px"></div>
      <div style="padding:12px 20px;border-top:1px solid rgba(46,125,50,0.08);text-align:center">
        <span style="font-size:0.75rem;color:#5d6a5f">🌱 ${t('notifications.footer')}</span>
      </div>
    `;
    document.body.appendChild(container);

    // Eventos
    document.getElementById('ecoNotifMarkAll').addEventListener('click', markAllRead);
    document.getElementById('ecoNotifClear').addEventListener('click', clearAll);
  };

  const _renderDropdown = () => {
    const list = document.getElementById('ecoNotifList');
    const count = document.getElementById('ecoNotifCount');
    if (!list) return;

    const items = get();
    const unread = unreadCount();
    if (count) {
      count.textContent = unread;
      count.style.display = unread > 0 ? 'inline' : 'none';
    }

    if (items.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:32px 16px;color:#5d6a5f">
          <div style="font-size:2.5rem;margin-bottom:12px">🔔</div>
          <p style="font-size:0.88rem;font-weight:600">${t('notifications.empty')}</p>
          <p style="font-size:0.78rem;margin-top:4px">${t('notifications.empty_desc')}</p>
        </div>
      `;
      return;
    }

    list.innerHTML = items.slice(0, MAX_VISIBLE).map(n => {
      const timeAgo = _timeAgo(n.timestamp);
      return `
        <div onclick="EcoNotifications.markRead('${n.id}')" style="
          display:flex;align-items:flex-start;gap:12px;padding:12px 14px;
          border-radius:14px;margin-bottom:4px;cursor:pointer;
          background:${n.read ? 'transparent' : 'rgba(46,125,50,0.06)'};
          transition:background 0.2s;
          ${n.read ? '' : 'border-left:3px solid #2e7d32'}
        " onmouseover="this.style.background='rgba(46,125,50,0.04)'" onmouseout="this.style.background='${n.read ? 'transparent' : 'rgba(46,125,50,0.06)'}'">
          <span style="font-size:1.4rem;flex-shrink:0;width:32px;text-align:center">${n.icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.82rem;font-weight:700;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.title}</div>
            <div style="font-size:0.75rem;color:#5d6a5f;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${n.message}</div>
            <div style="font-size:0.68rem;color:#5d6a5f;margin-top:4px;opacity:0.7">${timeAgo}</div>
          </div>
          <button onclick="event.stopPropagation();EcoNotifications.remove('${n.id}')" style="
            background:none;border:none;color:#5d6a5f;cursor:pointer;font-size:0.85rem;
            padding:2px 4px;opacity:0;transition:opacity 0.2s;flex-shrink:0
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">✕</button>
        </div>
      `;
    }).join('');

    if (items.length > MAX_VISIBLE) {
      list.innerHTML += `
        <div style="text-align:center;padding:10px;font-size:0.78rem;color:#5d6a5f">
          ${t('notifications.more', { count: items.length - MAX_VISIBLE })}
        </div>
      `;
    }
  };

  const _timeAgo = timestamp => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const isEn = window.EcoI18n && window.EcoI18n.getLang ? window.EcoI18n.getLang() === 'en' : false;
    if (mins < 1) return isEn ? 'Now' : 'Ahora';
    if (mins < 60) return isEn ? `${mins} min ago` : `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return isEn ? `${hrs}h ago` : `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return isEn ? `${days}d ago` : `Hace ${days}d`;
    return new Date(timestamp).toLocaleDateString(isEn ? 'en-US' : 'es-ES');
  };

  const _toggleDropdown = show => {
    const dd = document.getElementById('ecoNotifDropdown');
    if (!dd) return;
    _renderDropdown();
    if (show) {
      dd.style.pointerEvents = 'auto';
      dd.style.transform = 'translateY(0) scale(1)';
      dd.style.opacity = '1';
    } else {
      dd.style.pointerEvents = 'none';
      dd.style.transform = 'translateY(-10px) scale(0.95)';
      dd.style.opacity = '0';
    }
  };

  // ── Inicialización ────────────────────────────────────
  const init = () => {
    _buildDropdown();
    _updateBadge();
    window.addEventListener('eco:langchange', () => {
      if (document.getElementById('ecoNotifDropdown')) {
        _buildDropdown();
        _renderDropdown();
      }
    });

    // Vincular al botón de campanita
    document.querySelectorAll('[data-eco-notif]').forEach(el => {
      el.addEventListener('mouseenter', () => _toggleDropdown(true));
      el.addEventListener('mouseleave', () => {
        setTimeout(() => {
          const dd = document.getElementById('ecoNotifDropdown');
          if (dd && !dd.matches(':hover')) _toggleDropdown(false);
        }, 200);
      });
    });
    document.getElementById('ecoNotifDropdown')?.addEventListener('mouseleave', () => _toggleDropdown(false));
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  // ── API pública ────────────────────────────────────────
  return { add, markRead, markAllRead, remove, clearAll, get, unreadCount };
})();

window.EcoNotifications = EcoNotifications;