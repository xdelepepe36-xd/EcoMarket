/**
 * eco-improvements.js — Mejoras integrales EcoMarket v4.0
 * Incluye: lazy loading, accesibilidad, SEO, gráficos, multi-idioma, notificaciones push
 * 
 * Incluir: <script src="eco-improvements.js"></script>
 */
const EcoImprovements = (() => {
  // ── 1. LAZY LOADING DE IMÁGENES ────────────────────────
  const initLazyLoading = () => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });

      document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
  };

  // ── 2. ACCESIBILIDAD (A11y) ────────────────────────────
  const initAccessibility = () => {
    // ARIA labels para botones sin texto
    document.querySelectorAll('button:not([aria-label]):not([title])').forEach(btn => {
      const text = btn.textContent.trim() || btn.innerHTML.replace(/<[^>]*>/g, '').trim();
      if (text) btn.setAttribute('aria-label', text);
    });

    // Skip to content link
    if (!document.getElementById('skip-link')) {
      const skip = document.createElement('a');
      skip.id = 'skip-link';
      skip.href = '#main-content';
      skip.textContent = 'Saltar al contenido principal';
      skip.style.cssText = 'position:absolute;top:-40px;left:0;background:#2e7d32;color:#fff;padding:8px 16px;z-index:9999;transition:top 0.2s';
      skip.onfocus = function() { this.style.top = '0'; };
      skip.onblur = function() { this.style.top = '-40px'; };
      document.body.insertBefore(skip, document.body.firstChild);
    }

    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-backdrop.show, .success-overlay.show');
        modals.forEach(m => m.classList.remove('show'));
      }
    });
  };

  // ── 3. SEO - META TAGS DINÁMICOS ───────────────────────
  const initSEO = () => {
    const title = document.title || 'EcoMarket - Marketplace Ecológico';
    const desc = document.querySelector('meta[name="description"]')?.content || 
                 'Compra y vende productos ecológicos. Marketplace sostenible con impacto ambiental positivo. Envíos a todo Perú.';

    // Open Graph
    const ogTags = {
      'og:title': title,
      'og:description': desc,
      'og:type': 'website',
      'og:site_name': 'EcoMarket',
      'og:locale': 'es_PE'
    };

    Object.entries(ogTags).forEach(([prop, content]) => {
      let meta = document.querySelector(`meta[property="${prop}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', prop);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // Twitter Card
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': desc
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // JSON-LD Schema.org
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'EcoMarket',
      'url': window.location.origin,
      'description': desc,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${window.location.origin}/productos?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    let script = document.querySelector('#schema-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-script';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  };

  // ── 4. GRÁFICOS CON CHART.JS ───────────────────────────
  const loadChartJS = () => {
    return new Promise((resolve) => {
      if (window.Chart) { resolve(window.Chart); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => resolve(window.Chart);
      document.head.appendChild(script);
    });
  };

  const initCharts = async () => {
    const canvases = document.querySelectorAll('[data-chart]');
    if (canvases.length === 0) return;

    try {
      const Chart = await loadChartJS();

      canvases.forEach(canvas => {
        const type = canvas.dataset.chart || 'bar';
        const labels = JSON.parse(canvas.dataset.labels || '[]');
        const values = JSON.parse(canvas.dataset.values || '[]');
        const label = canvas.dataset.label || 'Datos';

        new Chart(canvas, {
          type,
          data: {
            labels,
            datasets: [{
              label,
              data: values,
              backgroundColor: [
                'rgba(46,125,50,0.7)', 'rgba(76,175,80,0.7)',
                'rgba(129,199,132,0.7)', 'rgba(165,214,167,0.7)',
                'rgba(200,230,201,0.7)', 'rgba(27,94,32,0.7)'
              ],
              borderColor: '#2e7d32',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      });
    } catch (e) {
      console.warn('Chart.js no disponible:', e.message);
    }
  };

  // ── 5. MULTI-IDIOMA (i18n) ─────────────────────────────
  const translations = {
    es: {
      nav_inicio: 'Inicio',
      nav_productos: 'Productos',
      nav_favoritos: 'Favoritos',
      nav_carrito: 'Carrito',
      nav_impacto: 'Impacto',
      nav_contacto: 'Contacto',
      nav_publicar: 'Publicar',
      nav_perfil: 'Mi perfil',
      nav_admin: 'Admin',
      nav_cerrar: 'Cerrar sesión',
      nav_ingresar: 'Ingresar',
      nav_registrarse: 'Registrarse',
      buscar: 'Buscar...',
      agregar_carrito: 'Agregar al carrito',
      ver_detalles: 'Ver detalles',
      sin_resultados: 'No se encontraron resultados',
      carrito_vacio: 'Tu carrito está vacío',
      finalizar_compra: 'Finalizar compra',
      total: 'Total',
      envio: 'Envío',
      gratis: 'Gratis',
      producto_publicado: 'Producto publicado con éxito',
      reseña_enviada: 'Reseña enviada correctamente',
      favorito_agregado: 'Agregado a favoritos',
      favorito_quitado: 'Quitado de favoritos'
    },
    en: {
      nav_inicio: 'Home',
      nav_productos: 'Products',
      nav_favoritos: 'Favorites',
      nav_carrito: 'Cart',
      nav_impacto: 'Impact',
      nav_contacto: 'Contact',
      nav_publicar: 'Publish',
      nav_perfil: 'My profile',
      nav_admin: 'Admin',
      nav_cerrar: 'Logout',
      nav_ingresar: 'Login',
      nav_registrarse: 'Sign up',
      buscar: 'Search...',
      agregar_carrito: 'Add to cart',
      ver_detalles: 'View details',
      sin_resultados: 'No results found',
      carrito_vacio: 'Your cart is empty',
      finalizar_compra: 'Checkout',
      total: 'Total',
      envio: 'Shipping',
      gratis: 'Free',
      producto_publicado: 'Product published successfully',
      reseña_enviada: 'Review submitted successfully',
      favorito_agregado: 'Added to favorites',
      favorito_quitado: 'Removed from favorites'
    },
    pt: {
      nav_inicio: 'Início',
      nav_productos: 'Produtos',
      nav_favoritos: 'Favoritos',
      nav_carrito: 'Carrinho',
      nav_impacto: 'Impacto',
      nav_contacto: 'Contato',
      nav_publicar: 'Publicar',
      nav_perfil: 'Meu perfil',
      nav_admin: 'Admin',
      nav_cerrar: 'Sair',
      nav_ingresar: 'Entrar',
      nav_registrarse: 'Cadastrar',
      buscar: 'Buscar...',
      agregar_carrito: 'Adicionar ao carrinho',
      ver_detalles: 'Ver detalhes',
      sin_resultados: 'Nenhum resultado encontrado',
      carrito_vacio: 'Seu carrinho está vazio',
      finalizar_compra: 'Finalizar compra',
      total: 'Total',
      envio: 'Frete',
      gratis: 'Grátis',
      producto_publicado: 'Produto publicado com sucesso',
      reseña_enviada: 'Avaliação enviada com sucesso',
      favorito_agregado: 'Adicionado aos favoritos',
      favorito_quitado: 'Removido dos favoritos'
    }
  };

  let currentLang = localStorage.getItem('eco_lang') || 'es';

  const t = (key, fallback = '') => {
    return translations[currentLang]?.[key] || translations['es']?.[key] || fallback || key;
  };

  const setLanguage = (lang) => {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('eco_lang', lang);
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'pt' ? 'pt' : 'es';

    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const fallback = el.textContent?.trim() || key;
      el.textContent = t(key, fallback);
    });

    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const fallback = el.getAttribute('placeholder') || '';
      el.placeholder = t(key, fallback);
    });

    window.dispatchEvent(new CustomEvent('eco-lang:change', { detail: { lang } }));
  };

  const initI18n = () => {
    // Solo respetar el selector de idioma del header; no crear duplicados flotantes.
    if (document.querySelector('[data-eco-lang-btn]') || document.getElementById('langSelector')) {
      setLanguage(currentLang);
      return;
    }

    setLanguage(currentLang);
  };

  // ── 6. NOTIFICACIONES PUSH ──────────────────────────────
  const initPushNotifications = () => {
    if (!('Notification' in window)) return;

    // Solicitar permiso
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Mostrar notificación push
    window.showPushNotification = (title, options = {}) => {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification(title, {
            icon: '/manifest.json',
            badge: '/manifest.json',
            ...options
          });
          setTimeout(() => notif.close(), 5000);
          return notif;
        } catch (e) {
          console.warn('Push notification error:', e);
        }
      }
    };
  };

  // ── 7. SITEMAP GENERATOR ────────────────────────────────
  const generateSitemap = () => {
    const pages = [
      '', '/productos', '/carrito', '/checkout', '/confirmacion',
      '/contacto', '/impacto', '/login', '/registro', '/terminos', '/privacidad'
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${window.location.origin}${page}</loc>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

    // Guardar en localStorage para depuración
    localStorage.setItem('eco_sitemap', sitemap);
  };

  // ── 8. PAGOS SIMULADOS ──────────────────────────────────
  const initPayments = () => {
    // Botón de pago con Mercado Pago simulado
    document.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const amount = parseFloat(btn.dataset.amount || '0');
        const desc = btn.dataset.description || 'Compra EcoMarket';

        // Simular procesamiento
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';

        await new Promise(r => setTimeout(r, 2000));

        // Simular éxito
        if (window.EcoToast) {
          EcoToast.success(`✅ Pago de S/.${amount.toFixed(2)} aprobado`);
        }

        btn.innerHTML = '✅ Pagado';
        btn.style.background = '#2e7d32';

        // Redirigir después del pago
        setTimeout(() => {
          const form = btn.closest('form');
          if (form) form.submit();
        }, 1000);
      });
    });
  };

  // ── 9. TRACKING DE ENVÍOS ──────────────────────────────
  const initShippingTracking = () => {
    document.querySelectorAll('[data-tracking]').forEach(el => {
      const code = el.dataset.tracking;
      const status = el.dataset.status || 'preparando';

      const statuses = {
        'confirmado': { icon: '📋', text: 'Pedido confirmado', pct: 20 },
        'preparando': { icon: '📦', text: 'Preparando envío', pct: 40 },
        'enviado': { icon: '🚚', text: 'En camino', pct: 70 },
        'entregado': { icon: '✅', text: 'Entregado', pct: 100 }
      };

      const current = statuses[status] || statuses['confirmado'];
      const nextStatuses = Object.keys(statuses);
      const currentIdx = nextStatuses.indexOf(status);

      el.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:var(--sombra);border:1px solid rgba(46,125,50,0.08)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <strong style="font-size:0.95rem">📦 Tracking #ECO-${code}</strong>
            <span style="font-size:0.78rem;color:var(--texto-sec)">${new Date().toLocaleDateString('es')}</span>
          </div>
          <div style="height:8px;background:var(--verde-suave);border-radius:999px;overflow:hidden;margin-bottom:16px">
            <div style="height:100%;width:${current.pct}%;background:linear-gradient(90deg,var(--verde-claro),var(--verde));border-radius:999px;transition:width 1s"></div>
          </div>
          <div style="display:flex;justify-content:space-between">
            ${nextStatuses.map((s, i) => `
              <div style="text-align:center;flex:1">
                <div style="width:32px;height:32px;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;
                  background:${i <= currentIdx ? 'var(--verde)' : 'var(--verde-suave)'};
                  color:${i <= currentIdx ? '#fff' : 'var(--texto-sec)'}">
                  ${statuses[s].icon}
                </div>
                <div style="font-size:0.65rem;color:${i <= currentIdx ? 'var(--verde)' : 'var(--texto-sec)'};font-weight:${i <= currentIdx ? '700' : '500'}">
                  ${statuses[s].text.split(' ')[0]}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
  };

  // ── INIT ────────────────────────────────────────────────
  const init = () => {
    initLazyLoading();
    initAccessibility();
    initSEO();
    initI18n();
    initPushNotifications();
    generateSitemap();
    initPayments();
    initShippingTracking();

    // Cargar gráficos después de la página
    if (document.readyState === 'complete') {
      initCharts();
    } else {
      window.addEventListener('load', initCharts);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    setLanguage,
    t,
    initCharts,
    initShippingTracking
  };
})();

window.EcoImprovements = EcoImprovements;