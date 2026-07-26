/**
 * eco-animations.js — Sistema de animaciones avanzado EcoMarket v2
 * Funcionalidades:
 *   - 8 tipos de animaciones: fade-up, fade-down, fade-left, fade-right, scale, flip, clip, bounce-in
 *   - Stagger para grids con delays automáticos
 *   - Contadores animados con easing cúbico
 *   - Skeleton loading
 *   - Efecto typing
 *   - Pulse, float, shimmer, spin
 *   - Scroll reveal con IntersectionObserver
 *   - Soporte para animaciones en lote (batch)
 *   - Eventos personalizados
 *   - Dark mode compatible
 *
 * Incluir: <script src="eco-animations.js"></script>
 * CSS:     <link rel="stylesheet" href="eco-styles.css">
 */
const EcoAnimations = (() => {
  // ── Configuración ──────────────────────────────────────
  const defaults = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  // Mapa de tipos de animación a clases CSS
  const ANIM_TYPES = {
    'fade-up': 'eco-anim-fade-up',
    'fade-down': 'eco-anim-fade-down',
    'fade-left': 'eco-anim-fade-left',
    'fade-right': 'eco-anim-fade-right',
    'scale': 'eco-anim-scale',
    'flip': 'eco-anim-flip',
    'clip': 'eco-anim-clip',
    'bounce-in': 'eco-bounce-in'
  };

  // ── Observer principal ─────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('eco-visible');

        // Si tiene contador, iniciarlo
        if (el.dataset.counter !== undefined) {
          _startCounter(el);
        }

        observer.unobserve(el);
      }
    });
  }, defaults);

  // ── Observar elementos ─────────────────────────────────
  const observe = (sel = '[data-animate]') => {
    const items = document.querySelectorAll(sel);
    items.forEach((el, i) => {
      // Determinar tipo de animación
      const type = el.dataset.animate || 'fade-up';
      const animClass = ANIM_TYPES[type] || ANIM_TYPES['fade-up'];

      // Agregar clase de animación
      el.classList.add(animClass);

      // Stagger delay automático
      if (!el.style.transitionDelay && !el.dataset.delay) {
        const stagger = el.dataset.stagger || 'auto';
        if (stagger === 'auto') {
          const delay = (i % 20) * 60;
          el.style.transitionDelay = `${delay}ms`;
        } else if (stagger === 'none') {
          // Sin delay
        } else {
          el.style.transitionDelay = `${parseInt(stagger)}ms`;
        }
      } else if (el.dataset.delay) {
        el.style.transitionDelay = `${parseInt(el.dataset.delay)}ms`;
      }

      observer.observe(el);
    });
  };

  // ── Observar en lote (batch) ───────────────────────────
  const observeBatch = (selectors) => {
    if (typeof selectors === 'string') {
      observe(selectors);
      return;
    }
    if (Array.isArray(selectors)) {
      selectors.forEach(sel => observe(sel));
    }
  };

  // ── Contadores animados ────────────────────────────────
  const _startCounter = el => {
    const target = parseFloat(el.dataset.counter);
    const duration = parseInt(el.dataset.duration) || 1800;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals !== undefined ? parseInt(el.dataset.decimals) : (String(target).includes('.') ? 1 : 0);

    const start = performance.now();

    const step = ts => {
      const progress = Math.min((ts - start) / duration, 1);
      // Easing cúbico suave
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = target * ease;
      const formatted = val.toFixed(decimals);
      el.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        // Disparar evento
        el.dispatchEvent(new CustomEvent('eco-counter:complete', {
          detail: { target, value: target }
        }));
      }
    };

    requestAnimationFrame(step);
  };

  const counter = (el, target, duration = 1800, opts = {}) => {
    const { prefix = '', suffix = '', decimals } = opts;
    const dec = decimals !== undefined ? decimals : (String(target).includes('.') ? 1 : 0);
    const start = performance.now();

    const step = ts => {
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = target * ease;
      el.textContent = `${prefix}${val.toFixed(dec)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target.toFixed(dec)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  // ── Inicializar contadores con observer ────────────────
  const initCounters = (sel = '[data-counter]') => {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          _startCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll(sel).forEach(el => counterObserver.observe(el));
  };

  // ── Skeleton loading ───────────────────────────────────
  const showSkeleton = (container, count = 3, type = 'card') => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    const skeletons = [];
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'eco-skeleton-card';

      if (type === 'card') {
        sk.innerHTML = `
          <div class="eco-skeleton eco-skeleton-image"></div>
          <div style="padding:16px">
            <div class="eco-skeleton eco-skeleton-title"></div>
            <div class="eco-skeleton eco-skeleton-text"></div>
            <div class="eco-skeleton eco-skeleton-text" style="width:50%"></div>
          </div>
        `;
      } else if (type === 'list') {
        sk.innerHTML = `
          <div style="display:flex;gap:16px;align-items:center">
            <div class="eco-skeleton" style="width:60px;height:60px;border-radius:12px;flex-shrink:0"></div>
            <div style="flex:1">
              <div class="eco-skeleton eco-skeleton-title" style="width:70%"></div>
              <div class="eco-skeleton eco-skeleton-text" style="width:40%"></div>
            </div>
          </div>
        `;
      } else if (type === 'text') {
        sk.innerHTML = `
          <div class="eco-skeleton eco-skeleton-title" style="width:90%"></div>
          <div class="eco-skeleton eco-skeleton-text"></div>
          <div class="eco-skeleton eco-skeleton-text"></div>
          <div class="eco-skeleton eco-skeleton-text" style="width:60%"></div>
        `;
      }

      skeletons.push(sk);
      el.appendChild(sk);
    }

    return skeletons;
  };

  const hideSkeleton = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.querySelectorAll('.eco-skeleton-card').forEach(sk => sk.remove());
  };

  // ── Typing effect ──────────────────────────────────────
  const typing = (el, text, speed = 50, callback = null) => {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return;

    element.textContent = '';
    element.style.visibility = 'visible';
    element.classList.add('eco-typing');

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
      } else {
        clearInterval(interval);
        element.classList.remove('eco-typing');
        element.style.borderRight = 'none';
        if (callback) callback();
      }
    }, speed);
  };

  // ── Pulse effect ───────────────────────────────────────
  const pulse = (el, duration = 2000) => {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return;
    element.classList.add('eco-pulse');
    if (duration) {
      setTimeout(() => element.classList.remove('eco-pulse'), duration);
    }
  };

  // ── Float effect ───────────────────────────────────────
  const float = (el) => {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return;
    element.classList.add('eco-float');
  };

  // ── Shimmer effect ─────────────────────────────────────
  const shimmer = (el) => {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return;
    element.classList.add('eco-shimmer');
  };

  // ── Scroll to element with offset ──────────────────────
  const scrollTo = (el, offset = 80) => {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // ── Inicialización ─────────────────────────────────────
  const init = () => {
    observe();
    initCounters();
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  // ── API pública ────────────────────────────────────────
  return {
    observe,
    observeBatch,
    counter,
    initCounters,
    showSkeleton,
    hideSkeleton,
    typing,
    pulse,
    float,
    shimmer,
    scrollTo
  };
})();

window.EcoAnimations = EcoAnimations;