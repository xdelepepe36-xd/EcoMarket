/**
 * eco-search.js — Sistema de búsqueda avanzada EcoMarket v2
 * Funcionalidades:
 *   - Búsqueda en tiempo real con debounce
 *   - Filtros combinados (texto + categoría + precio)
 *   - Contador de resultados visible
 *   - Highlight de términos buscados
 *   - Botón de limpiar búsqueda
 *   - Animación de resultados
 *   - Múltiples instancias independientes
 *   - Eventos personalizados
 *   - Dark mode compatible
 *
 * Incluir: <script src="eco-search.js"></script>
 * CSS:     <link rel="stylesheet" href="eco-styles.css">
 */
const EcoSearch = (() => {
  const instances = {};

  // ── Utilidades ─────────────────────────────────────────
  const debounce = (fn, delay = 250) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Escapar caracteres especiales para regex
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Highlight texto
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const escaped = escapeRegex(query);
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<span class="eco-search-highlight">$1</span>');
  };

  // ── Inicialización ─────────────────────────────────────
  const init = (inputSel, itemsSel, opts = {}) => {
    const input = document.querySelector(inputSel);
    if (!input) {
      console.warn(`EcoSearch: No se encontró el input "${inputSel}"`);
      return null;
    }

    const {
      searchAttr = 'data-search',
      categoryAttr = 'data-category',
      priceAttr = 'data-price',
      emptyMsg = 'No se encontraron resultados',
      onFilter = null,
      highlight = true,
      minChars = 0,
      debounceMs = 200,
      showCount = true,
      countSelector = null,
      filtersContainer = null,
      priceFilter = false,
      priceMax = 500,
      animateResults = true
    } = opts;

    // Crear contenedor si no existe
    let wrap = input.closest('.eco-search-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'eco-search-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
    }

    // Icono de búsqueda
    let icon = wrap.querySelector('.eco-search-icon');
    if (!icon) {
      icon = document.createElement('span');
      icon.className = 'eco-search-icon';
      icon.textContent = '🔍';
      wrap.insertBefore(icon, input);
    }

    // Botón de limpiar
    let clearBtn = wrap.querySelector('.eco-search-clear');
    if (!clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.className = 'eco-search-clear';
      clearBtn.textContent = '✕';
      clearBtn.setAttribute('aria-label', 'Limpiar búsqueda');
      clearBtn.type = 'button';
      wrap.appendChild(clearBtn);
    }

    // Contador de resultados
    let countEl = null;
    if (showCount) {
      countEl = countSelector
        ? document.querySelector(countSelector)
        : document.querySelector('.eco-search-count');
      if (!countEl) {
        countEl = document.createElement('div');
        countEl.className = 'eco-search-count hidden';
        wrap.parentNode?.insertBefore(countEl, wrap.nextSibling);
      }
    }

    // Filtros de categoría
    let filterBtns = [];
    if (filtersContainer) {
      const container = typeof filtersContainer === 'string'
        ? document.querySelector(filtersContainer)
        : filtersContainer;
      if (container) {
        filterBtns = container.querySelectorAll('.eco-search-filter');
      }
    }

    // Filtro de precio
    let priceInput = null;
    let priceLabel = null;
    if (priceFilter) {
      const priceWrap = document.createElement('div');
      priceWrap.className = 'eco-search-price';
      priceLabel = document.createElement('span');
      priceLabel.textContent = `S/. 0 - S/. ${priceMax}`;
      priceInput = document.createElement('input');
      priceInput.type = 'range';
      priceInput.min = '0';
      priceInput.max = String(priceMax);
      priceInput.value = String(priceMax);
      priceWrap.appendChild(priceLabel);
      priceWrap.appendChild(priceInput);
      wrap.parentNode?.insertBefore(priceWrap, wrap.nextSibling);
    }

    // ── Lógica de filtrado ──────────────────────────────
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      const items = document.querySelectorAll(itemsSel);
      let visible = 0;

      // Categoría seleccionada
      let selectedCategory = '';
      filterBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
          selectedCategory = btn.dataset.filter || '';
        }
      });

      // Precio máximo
      const maxPrice = priceInput ? parseFloat(priceInput.value) : Infinity;

      // Mostrar/ocultar botón de limpiar
      clearBtn.classList.toggle('show', q.length > 0);

      items.forEach((el, index) => {
        const text = (el.getAttribute(searchAttr) || el.textContent).toLowerCase();
        const category = (el.getAttribute(categoryAttr) || '').toLowerCase();
        const price = parseFloat(el.getAttribute(priceAttr)) || Infinity;

        const matchesQuery = q.length < minChars || text.includes(q);
        const matchesCategory = !selectedCategory || category === selectedCategory.toLowerCase();
        const matchesPrice = price <= maxPrice;
        const show = matchesQuery && matchesCategory && matchesPrice;

        el.style.display = show ? '' : 'none';
        if (show) visible++;

        // Highlight
        if (show && highlight && q.length >= minChars) {
          const textEl = el.querySelector('[data-search-text]') || el;
          if (!textEl.dataset._originalText) {
            textEl.dataset._originalText = textEl.innerHTML;
          }
          textEl.innerHTML = highlightText(textEl.dataset._originalText, q);
        } else if (show && highlight) {
          const textEl = el.querySelector('[data-search-text]') || el;
          if (textEl.dataset._originalText) {
            textEl.innerHTML = textEl.dataset._originalText;
            delete textEl.dataset._originalText;
          }
        }

        // Animación de resultados
        if (show && animateResults) {
          el.style.setProperty('--result-index', index);
          el.classList.add('eco-search-result');
          el.style.animationDelay = `${(index % 20) * 30}ms`;
        } else {
          el.classList.remove('eco-search-result');
        }
      });

      // Actualizar contador
      if (countEl) {
        countEl.classList.toggle('hidden', visible === 0 && q.length === 0);
        if (q.length > 0 || selectedCategory || (priceInput && parseFloat(priceInput.value) < priceMax)) {
          countEl.textContent = `📦 ${visible} resultado${visible !== 1 ? 's' : ''}`;
          countEl.classList.remove('hidden');
        } else {
          countEl.classList.add('hidden');
        }
      }

      // Mensaje vacío
      let emptyEl = document.querySelector('.eco-search-empty');
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'eco-search-empty';
        emptyEl.style.cssText = 'text-align:center;padding:2rem;display:none';
        emptyEl.innerHTML = `
          <div style="font-size:3rem;margin-bottom:12px;opacity:0.4">🔍</div>
          <p style="color:var(--texto-sec,#5d6a5f);font-weight:600">${emptyMsg}</p>
        `;
        wrap.closest('section, .container, body')?.appendChild(emptyEl);
      }
      emptyEl.style.display = visible === 0 && (q.length > 0 || selectedCategory || (priceInput && parseFloat(priceInput.value) < priceMax)) ? 'block' : 'none';

      if (onFilter) onFilter(visible, q, selectedCategory, maxPrice);
    };

    const debouncedFilter = debounce(filter, debounceMs);

    // ── Eventos ─────────────────────────────────────────
    input.addEventListener('input', debouncedFilter);

    // Limpiar
    clearBtn.addEventListener('click', () => {
      input.value = '';
      filter();
      input.focus();
    });

    // Filtros de categoría
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter();
      });
    });

    // Filtro de precio
    if (priceInput && priceLabel) {
      priceInput.addEventListener('input', () => {
        priceLabel.textContent = `S/. 0 - S/. ${parseFloat(priceInput.value).toFixed(0)}`;
        debouncedFilter();
      });
    }

    // ── Almacenar instancia ─────────────────────────────
    const instance = { input, filter, clear: () => { input.value = ''; filter(); } };
    instances[inputSel] = instance;

    // Ejecutar filtro inicial
    filter();

    return instance;
  };

  // ── API ────────────────────────────────────────────────
  const clear = inputSel => {
    const inst = instances[inputSel];
    if (inst) { inst.input.value = ''; inst.filter(); }
  };

  const getInstance = inputSel => instances[inputSel] || null;

  const destroy = inputSel => {
    const inst = instances[inputSel];
    if (inst) {
      // Restaurar highlight original
      document.querySelectorAll('[data-search-text]').forEach(el => {
        if (el.dataset._originalText) {
          el.innerHTML = el.dataset._originalText;
          delete el.dataset._originalText;
        }
      });
      delete instances[inputSel];
    }
  };

  return { init, clear, getInstance, destroy };
})();

window.EcoSearch = EcoSearch;