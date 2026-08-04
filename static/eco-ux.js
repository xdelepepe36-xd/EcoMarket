/**
 * eco-ux.js - Experiencia de usuario mejorada para EcoMarket
 * Scroll animations, back to top, autocomplete, skeleton loading, etc.
 */
const EcoUX = (() => {
  // ============================================================
  // 1. SCROLL ANIMATIONS (Intersection Observer)
  // ============================================================
  const initScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('eco-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.eco-animate').forEach(el => observer.observe(el));
    
    // Also animate cards and sections
    document.querySelectorAll('.producto-card, .feature-card, .impacto-card-item, .testimonio-card, .categoria-card, .stat-card, .admin-stat-card').forEach(el => {
      el.classList.add('eco-animate');
      observer.observe(el);
    });
  };

  // ============================================================
  // 2. BACK TO TOP BUTTON
  // ============================================================
  const initBackToTop = () => {
    const btn = document.createElement('button');
    btn.id = 'ecoBackToTop';
    btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    btn.style.cssText = `
      position:fixed;bottom:90px;right:24px;width:44px;height:44px;border-radius:50%;
      background:var(--verde,#2e7d32);color:#fff;border:none;font-size:1.2rem;
      cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9997;
      display:none;align-items:center;justify-content:center;
      transition:all 0.3s;opacity:0;
    `;
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.style.display = 'flex';
        setTimeout(() => { btn.style.opacity = '1'; }, 10);
      } else {
        btn.style.opacity = '0';
        setTimeout(() => { btn.style.display = 'none'; }, 300);
      }
    });
  };

  // ============================================================
  // 3. SEARCH AUTOCOMPLETE
  // ============================================================
  const initSearchAutocomplete = () => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const container = document.createElement('div');
    container.id = 'ecoSearchResults';
    container.style.cssText = `
      position:absolute;top:100%;left:0;right:0;background:#fff;border-radius:0 0 16px 16px;
      box-shadow:0 12px 40px rgba(0,0,0,0.12);z-index:100;display:none;
      border:1px solid rgba(46,125,50,0.1);border-top:none;max-height:320px;overflow-y:auto;
    `;
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(container);

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = searchInput.value.trim();
      if (q.length < 2) { container.style.display = 'none'; return; }
      
      debounceTimer = setTimeout(() => {
        fetch(`/api/buscar?q=${encodeURIComponent(q)}`)
          .then(r => r.json())
          .then(data => {
            if (data.length === 0) {
              container.style.display = 'none';
              return;
            }
            container.innerHTML = data.map(p => `
              <a href="/producto/${p.id}" style="display:flex;align-items:center;gap:12px;padding:10px 16px;text-decoration:none;color:inherit;border-bottom:1px solid rgba(46,125,50,0.06);transition:background 0.2s"
                onmouseover="this.style.background='#f4fbf5'" onmouseout="this.style.background=''">
                <div style="width:40px;height:40px;border-radius:10px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:var(--verde)">
                  <i class="bi bi-box-seam"></i>
                </div>
                <div style="flex:1">
                  <div style="font-size:0.85rem;font-weight:600">${p.nombre}</div>
                  <div style="font-size:0.75rem;color:var(--texto-sec)">${p.categoria} · S/. ${parseFloat(p.precio).toFixed(2)}</div>
                </div>
              </a>
            `).join('');
            container.style.display = 'block';
          })
          .catch(() => { container.style.display = 'none'; });
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#searchInput, #ecoSearchResults')) {
        container.style.display = 'none';
      }
    });
  };

  // ============================================================
  // 4. SKELETON LOADING
  // ============================================================
  const showSkeleton = (container, count = 4) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = Array(count).fill(0).map(() => `
      <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06)">
        <div style="height:180px;background:linear-gradient(90deg,#e8f5e9 25%,#f4fbf5 50%,#e8f5e9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
        <div style="padding:16px">
          <div style="height:12px;width:60%;background:#e8f5e9;border-radius:999px;margin-bottom:8px;animation:shimmer 1.5s infinite"></div>
          <div style="height:16px;width:80%;background:#e8f5e9;border-radius:999px;margin-bottom:8px;animation:shimmer 1.5s infinite"></div>
          <div style="height:12px;width:40%;background:#e8f5e9;border-radius:999px;animation:shimmer 1.5s infinite"></div>
        </div>
      </div>
    `).join('');
  };

  // ============================================================
  // 5. NOTIFICATION BADGE
  // ============================================================
  const updateNotificationBadge = () => {
    const userId = document.body.dataset.userId;
    if (!userId) return;
    // Simple badge update from localStorage
    try {
      const notifs = JSON.parse(localStorage.getItem('eco_notifications') || '[]');
      const unread = notifs.filter(n => !n.read).length;
      const badge = document.getElementById('notifBadge');
      if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
      }
    } catch {}
  };

  // ============================================================
  // 6. SMOOTH PAGE TRANSITIONS
  // ============================================================
  const initPageTransitions = () => {
    document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="javascript"])').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.hostname === window.location.hostname && !link.hasAttribute('download')) {
          e.preventDefault();
          document.body.style.opacity = '0';
          document.body.style.transition = 'opacity 0.2s';
          setTimeout(() => { window.location.href = link.href; }, 200);
        }
      });
    });
    // Fade in on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s';
    setTimeout(() => { document.body.style.opacity = '1'; }, 100);
  };

  // ============================================================
  // 7. COOKIE CONSENT
  // ============================================================
  const initCookieConsent = () => {
    if (localStorage.getItem('eco_cookies_accepted')) return;
    
    const banner = document.createElement('div');
    banner.id = 'ecoCookieBanner';
    banner.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;background:#fff;padding:16px 24px;
      box-shadow:0 -4px 20px rgba(0,0,0,0.1);z-index:9999;display:flex;
      align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
      border-top:3px solid #2e7d32;
    `;
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;flex:1">
        <i class="bi bi-cookie" style="font-size:1.5rem;color:#2e7d32"></i>
        <span style="font-size:0.85rem;color:var(--texto-sec)">Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra política de cookies.</span>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="EcoUX.acceptCookies()" style="padding:8px 20px;border-radius:999px;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;font-weight:700;font-size:0.85rem;cursor:pointer">Aceptar</button>
        <button onclick="EcoUX.acceptCookies()" style="padding:8px 20px;border-radius:999px;background:#f0f7f0;color:#2e7d32;border:1px solid rgba(46,125,50,0.2);font-weight:600;font-size:0.85rem;cursor:pointer">Cerrar</button>
      </div>
    `;
    document.body.appendChild(banner);
  };

  const acceptCookies = () => {
    localStorage.setItem('eco_cookies_accepted', 'true');
    const banner = document.getElementById('ecoCookieBanner');
    if (banner) {
      banner.style.transition = 'transform 0.3s, opacity 0.3s';
      banner.style.transform = 'translateY(100%)';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 300);
    }
  };

  // ============================================================
  // 8. PRODUCT IMAGE LAZY LOADING
  // ============================================================
  const initLazyLoading = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imgObserver.observe(img));
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    // Add shimmer animation
    if (!document.getElementById('ecoShimmerStyle')) {
      const style = document.createElement('style');
      style.id = 'ecoShimmerStyle';
      style.textContent = `
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .eco-animate { opacity:0; transform:translateY(20px); transition:opacity 0.6s, transform 0.6s; }
        .eco-visible { opacity:1 !important; transform:translateY(0) !important; }
        .producto-card, .feature-card, .impacto-card-item, .testimonio-card, .categoria-card, .stat-card, .admin-stat-card {
          transition:opacity 0.6s, transform 0.6s;
        }
      `;
      document.head.appendChild(style);
    }

    initScrollAnimations();
    initBackToTop();
    initSearchAutocomplete();
    initCookieConsent();
    initLazyLoading();
    updateNotificationBadge();
    
    // Auto-refresh badge periodically
    setInterval(updateNotificationBadge, 10000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { acceptCookies, showSkeleton };
})();

window.EcoUX = EcoUX;