/**
 * eco-effects.js — Efectos visuales premium EcoMarket
 * 15 efectos: fondo día/noche, hojas, confeti, partículas, animaciones, loader, etc.
 *
 * Incluir: <script src="eco-effects.js"></script>
 */
const EcoEffects = (() => {
  // ============================================================
  // 1. FONDO DÍA/NOCHE
  // ============================================================
  const initDayNight = () => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    if (isNight) {
      document.body.style.background = 'linear-gradient(135deg, #0c1210 0%, #1a2e1b 50%, #0d1f0e 100%)';
      document.body.style.color = '#edf5ea';
    }
  };

  // ============================================================
  // 2. FONDO ANIMADO
  // ============================================================
  const initAnimatedBg = () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'ecoAnimatedBg';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0.3';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const circles = Array.from({length: 20}, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 60 + 20,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: `rgba(46,125,50,${Math.random() * 0.08 + 0.02})`
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      circles.forEach(c => {
        c.x += c.dx; c.y += c.dy;
        if (c.x < -c.r) c.x = w + c.r;
        if (c.x > w + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = h + c.r;
        if (c.y > h + c.r) c.y = -c.r;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
  };

  // ============================================================
  // 3. HOJAS CAYENDO
  // ============================================================
  const initFallingLeaves = () => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden';
    document.body.prepend(container);
    const leaves = ['🍃', '🌿', '🍂', '🌱'];
    for (let i = 0; i < 15; i++) {
      const leaf = document.createElement('div');
      leaf.textContent = leaves[i % leaves.length];
      leaf.style.cssText = `
        position:absolute;font-size:${Math.random() * 16 + 12}px;
        left:${Math.random() * 100}%;top:-30px;
        opacity:${Math.random() * 0.3 + 0.1};
        animation: ecoLeafFall ${Math.random() * 8 + 6}s linear infinite;
        animation-delay:${Math.random() * 10}s;
      `;
      container.appendChild(leaf);
    }
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ecoLeafFall {
        0% { transform: translateX(0) rotate(0deg); top: -30px; }
        100% { transform: translateX(${Math.random() > 0.5 ? '' : '-'}100px) rotate(360deg); top: 110vh; }
      }
    `;
    document.head.appendChild(style);
  };

  // ============================================================
  // 4. CONFETI AL COMPRAR
  // ============================================================
  const showConfetti = (duration = 3000) => {
    const colors = ['#2e7d32', '#4caf50', '#81c784', '#a5d6a7', '#f59e0b', '#e53935', '#1565c0', '#6a1b9a'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden';
    document.body.appendChild(container);

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 10 + 5;
      piece.style.cssText = `
        position:absolute;width:${size}px;height:${size * 0.6}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%;top:-20px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        animation: ecoConfetti ${Math.random() * 2 + 1.5}s ease-out forwards;
        animation-delay:${Math.random() * 0.5}s;
        transform:rotate(${Math.random() * 360}deg);
      `;
      container.appendChild(piece);
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ecoConfetti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(${Math.random() * 720 - 360}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    setTimeout(() => container.remove(), duration);
  };

  // ============================================================
  // 5. PARTÍCULAS
  // ============================================================
  const spawnParticles = (x, y, color = '#4caf50', count = 12) => {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const angle = (i / count) * 360;
      const dist = Math.random() * 40 + 20;
      p.style.cssText = `
        position:fixed;width:6px;height:6px;border-radius:50%;
        background:${color};left:${x}px;top:${y}px;z-index:99999;
        pointer-events:none;
        transition:all 0.6s cubic-bezier(0.34,1.56,0.64,1);
        opacity:1;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle * Math.PI / 180) * dist}px, ${Math.sin(angle * Math.PI / 180) * dist}px) scale(0)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 700);
    }
  };

  // ============================================================
  // 6-7. TRANSICIONES Y ANIMACIONES AL SCROLL
  // ============================================================
  const initScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('eco-animated');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${el.dataset.delay || '0'}s`;
      observer.observe(el);
    });
  };

  // ============================================================
  // 8-9. CARDS ANIMADAS Y HOVER AVANZADOS
  // ============================================================
  const initCardEffects = () => {
    document.querySelectorAll('.producto-card, .eco-card, [data-hover="3d"]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  };

  // ============================================================
  // 10. MICROANIMACIONES
  // ============================================================
  const initMicroAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
      .eco-micro-bounce { animation: ecoMicroBounce 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .eco-micro-pop { animation: ecoMicroPop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      .eco-micro-shake { animation: ecoMicroShake 0.3s ease; }
      .eco-micro-glow { animation: ecoMicroGlow 2s ease-in-out infinite; }
      @keyframes ecoMicroBounce { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
      @keyframes ecoMicroPop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
      @keyframes ecoMicroShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
      @keyframes ecoMicroGlow { 0%,100%{box-shadow:0 0 5px rgba(46,125,50,0.2)} 50%{box-shadow:0 0 20px rgba(46,125,50,0.4)} }
    `;
    document.head.appendChild(style);
  };

  // ============================================================
  // 11. EFECTOS EN BOTONES
  // ============================================================
  const initButtonEffects = () => {
    document.querySelectorAll('.btn-principal, .btn-secundario, .eco-btn').forEach(btn => {
      btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
      btn.addEventListener('mouseup', () => btn.style.transform = '');
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
      
      // Ripple effect
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
          position:absolute;width:${size}px;height:${size}px;
          border-radius:50%;background:rgba(255,255,255,0.3);
          left:${e.clientX - rect.left - size/2}px;
          top:${e.clientY - rect.top - size/2}px;
          transform:scale(0);animation:ecoRipple 0.6s ease-out;pointer-events:none;
        `;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
    const style = document.createElement('style');
    style.textContent = `@keyframes ecoRipple { to { transform:scale(4); opacity:0; } }`;
    document.head.appendChild(style);
  };

  // ============================================================
  // 12. LOADER ELEGANTE
  // ============================================================
  const showLoader = (text = 'Cargando...') => {
    let loader = document.getElementById('ecoLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'ecoLoader';
      loader.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.95);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s';
      loader.innerHTML = `
        <div style="position:relative;width:80px;height:80px;margin-bottom:20px">
          <div style="position:absolute;inset:0;border:4px solid rgba(46,125,50,0.1);border-radius:50%"></div>
          <div style="position:absolute;inset:0;border:4px solid transparent;border-top-color:#2e7d32;border-radius:50%;animation:ecoSpin 0.8s linear infinite"></div>
          <div style="position:absolute;inset:8px;border:4px solid transparent;border-top-color:#4caf50;border-radius:50%;animation:ecoSpin 1.2s linear infinite reverse"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem">🌱</div>
        </div>
        <div id="ecoLoaderText" style="font-size:0.95rem;font-weight:600;color:#2e7d32;animation:ecoPulse 1.5s infinite">${text}</div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.opacity = '1';
    loader.style.pointerEvents = 'auto';
    return { hide: () => { loader.style.opacity = '0'; loader.style.pointerEvents = 'none'; } };
  };

  // ============================================================
  // 13-15. ANIMACIONES CARRITO, FAVORITOS, CHECKOUT
  // ============================================================
  const animateCartAdd = (btn) => {
    btn.classList.add('eco-micro-bounce');
    setTimeout(() => btn.classList.remove('eco-micro-bounce'), 400);
    // Animación de volar al carrito
    const rect = btn.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.textContent = '📦';
    fly.style.cssText = `
      position:fixed;font-size:1.5rem;z-index:99999;pointer-events:none;
      left:${rect.left + rect.width/2}px;top:${rect.top}px;
      transition:all 0.8s cubic-bezier(0.34,1.56,0.64,1);
    `;
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      const cart = document.querySelector('[href*="carrito"]');
      if (cart) {
        const cartRect = cart.getBoundingClientRect();
        fly.style.left = `${cartRect.left + cartRect.width/2}px`;
        fly.style.top = `${cartRect.top}px`;
        fly.style.transform = 'scale(0.3)';
        fly.style.opacity = '0';
      }
    });
    setTimeout(() => fly.remove(), 900);
  };

  const animateFavorite = (btn) => {
    btn.classList.add('eco-micro-bounce');
    setTimeout(() => btn.classList.remove('eco-micro-bounce'), 400);
    const rect = btn.getBoundingClientRect();
    spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, '#e53935', 8);
  };

  const animateCheckout = () => {
    showConfetti(4000);
    showLoader('Procesando tu pedido... 🌱');
    setTimeout(() => {
      const loader = document.getElementById('ecoLoader');
      if (loader) { loader.style.opacity = '0'; loader.style.pointerEvents = 'none'; }
    }, 2000);
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    initDayNight();
    initAnimatedBg();
    initFallingLeaves();
    initScrollAnimations();
    initCardEffects();
    initMicroAnimations();
    initButtonEffects();

    // Auto-bind a botones
    document.querySelectorAll('.add-cart, [data-eco-add]').forEach(btn => {
      btn.addEventListener('click', () => animateCartAdd(btn));
    });
    document.querySelectorAll('.favorite-btn, [data-eco-fav]').forEach(btn => {
      btn.addEventListener('click', () => animateFavorite(btn));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    showConfetti, spawnParticles, showLoader,
    animateCartAdd, animateFavorite, animateCheckout,
    initDayNight, initAnimatedBg, initFallingLeaves
  };
})();

window.EcoEffects = EcoEffects;