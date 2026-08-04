/**
 * eco-favorites.js — Sistema de favoritos EcoMarket v2
 * Funcionalidades:
 *   - Gestión completa con localStorage
 *   - Animación de "pop" con partículas al agregar
 *   - Badge animado en navbar
 *   - Tooltips informativos
 *   - Botón "Eliminar todos"
 *   - Sincronización automática con el DOM
 *   - Dark mode compatible
 *   - Eventos personalizados para integración con otros módulos
 *
 * Incluir: <script src="eco-favorites.js"></script>
 * CSS:     <link rel="stylesheet" href="eco-styles.css">
 */
const EcoFavorites = (() => {
  const KEY = 'eco_favorites';

  // ── Datos ──────────────────────────────────────────────
  const get = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = items => {
    localStorage.setItem(KEY, JSON.stringify(items));
    _dispatch();
  };

  // ── CRUD ───────────────────────────────────────────────
  const add = item => {
    const items = get();
    if (!items.find(i => i.id === item.id)) {
      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        emoji: item.emoji || '🌿',
        category: item.category || '',
        image: item.image || '',
        addedAt: Date.now()
      };
      items.push(newItem);
      save(items);
      _updateUI();
      _spawnParticles(item.id);
      _animateBadge();
      if (window.EcoToast) EcoToast.eco(`❤️ ${item.name} agregado a favoritos`);
    }
  };

  const remove = id => {
    const item = get().find(i => i.id === id);
    save(get().filter(i => i.id !== id));
    _updateUI();
    document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(el => {
      el.classList.remove('active');
      // Breve animación de salida
      el.style.transform = 'scale(0.8)';
      setTimeout(() => { el.style.transform = ''; }, 200);
    });
    if (window.EcoToast && item) EcoToast.info(`💔 ${item.name} eliminado de favoritos`);
  };

  const toggle = item => (has(item.id) ? remove(item.id) : add(item));

  const has = id => get().some(i => i.id === id);

  const count = () => get().length;

  const clearAll = () => {
    if (get().length === 0) return;
    save([]);
    _updateUI();
    document.querySelectorAll('[data-fav-id]').forEach(el => el.classList.remove('active'));
    if (window.EcoToast) EcoToast.warning('🗑️ Todos los favoritos eliminados');
  };

  const getById = id => get().find(i => i.id === id) || null;

  // ── UI / DOM ───────────────────────────────────────────
  const _dispatch = () => {
    window.dispatchEvent(new CustomEvent('eco-favorites:update', {
      detail: { items: get(), count: count() }
    }));
  };

  const _updateUI = () => {
    // Actualizar badges
    const c = count();
    document.querySelectorAll('.eco-fav-badge, .fav-badge').forEach(el => {
      el.textContent = c;
      el.classList.toggle('show', c > 0);
      el.style.display = c ? 'flex' : 'none';
    });

    // Actualizar estado de botones
    document.querySelectorAll('[data-fav-id]').forEach(btn => {
      const id = btn.dataset.favId;
      btn.classList.toggle('active', has(id));
    });

    // Actualizar página de favoritos si existe
    _updateFavoritesPage();
  };

  // Partículas de corazón
  const _spawnParticles = id => {
    const btn = document.querySelector(`[data-fav-id="${id}"]`);
    if (!btn) return;

    const container = document.createElement('div');
    container.className = 'eco-fav-particles';
    btn.appendChild(container);

    const colors = ['#4caf50', '#2e7d32', '#66bb6a', '#a5d6a7', '#e53935'];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'eco-fav-particle';
      const angle = (i / count) * 360;
      const distance = 30 + Math.random() * 20;
      p.style.setProperty('--tx', `${Math.cos(angle * Math.PI / 180) * distance}px`);
      p.style.setProperty('--ty', `${Math.sin(angle * Math.PI / 180) * distance}px`);
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = `${i * 20}ms`;
      container.appendChild(p);
    }

    setTimeout(() => container.remove(), 800);
  };

  // Animación de badge
  const _animateBadge = () => {
    document.querySelectorAll('.eco-fav-badge, .fav-badge').forEach(el => {
      el.classList.remove('bump');
      // Forzar reflow
      void el.offsetWidth;
      el.classList.add('bump');
    });
  };

  // Actualizar página de favoritos (similar a static/favorites.js)
  const _updateFavoritesPage = () => {
    const favPage = document.querySelector('.eco-fav-page, .favoritos-page');
    if (!favPage) return;

    const favorites = get();
    const grid = favPage.querySelector('.eco-fav-grid, .productos-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('[data-producto-id]');
    const noFavs = document.getElementById('noFavoritesMessage') || favPage.querySelector('.eco-fav-empty');
    let hasVisible = false;

    cards.forEach(card => {
      const pid = card.dataset.productoId;
      const matches = favorites.some(f => f.id === pid || f.id.toString() === pid);
      card.style.display = matches ? '' : 'none';
      if (matches) hasVisible = true;
    });

    if (noFavs) noFavs.hidden = hasVisible;
  };

  // ── Binding de botones ─────────────────────────────────
  const bindButtons = (scope = document) => {
    scope.querySelectorAll('[data-eco-fav]').forEach(btn => {
      if (btn._ecoFavBound) return;
      btn._ecoFavBound = true;

      const id = btn.dataset.ecoFav;

      // Marcar estado inicial
      btn.setAttribute('data-fav-id', id);
      if (has(id)) btn.classList.add('active');

      // Crear tooltip
      const tooltip = document.createElement('span');
      tooltip.className = 'eco-fav-tooltip';
      tooltip.textContent = has(id) ? 'Quitar de favoritos' : 'Agregar a favoritos';
      btn.appendChild(tooltip);

      // Actualizar tooltip al cambiar estado
      const updateTooltip = () => {
        tooltip.textContent = has(id) ? 'Quitar de favoritos' : 'Agregar a favoritos';
      };

      // Evento click
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const item = {
          id,
          name: btn.dataset.name || id,
          price: parseFloat(btn.dataset.price) || 0,
          emoji: btn.dataset.emoji || '🌿',
          category: btn.dataset.category || '',
          image: btn.dataset.image || ''
        };
        toggle(item);
        updateTooltip();
      });
    });

    // Botón "Eliminar todos"
    scope.querySelectorAll('[data-fav-clear]').forEach(btn => {
      if (btn._ecoFavClearBound) return;
      btn._ecoFavClearBound = true;
      btn.addEventListener('click', e => {
        e.preventDefault();
        clearAll();
      });
    });
  };

  // ── Inicialización ────────────────────────────────────
  const init = () => {
    _updateUI();
    bindButtons();

    // Observer para nuevos botones agregados dinámicamente
    const observer = new MutationObserver(() => bindButtons());
    observer.observe(document.body, { childList: true, subtree: true });
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  // ── API pública ────────────────────────────────────────
  return { add, remove, toggle, has, get, count, clearAll, getById, bindButtons };
})();

window.EcoFavorites = EcoFavorites;