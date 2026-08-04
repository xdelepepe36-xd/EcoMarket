/**
 * eco-marketplace.js — 20 mejoras premium para EcoMarket
 * Incluye: reseñas, reacciones, comparador, historial, cupones, ofertas, compartir, QR, EcoScore y más
 * 
 * Incluir: <script src="eco-marketplace.js"></script>
 */
const EcoMarketplace = (() => {
  // ============================================================
  // 1. SISTEMA DE RESEÑAS CON ESTRELLAS (1-5)
  // ============================================================
  const renderStarRating = (container, rating = 0, interactive = false, onChange = null) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    el.innerHTML = '';
    el.style.cssText = 'display:flex;gap:3px;font-size:1.4rem';
    
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.innerHTML = i <= rating ? '★' : '☆';
      star.style.cssText = `color:${i <= rating ? '#f59e0b' : '#ddd'};cursor:${interactive ? 'pointer' : 'default'};transition:all 0.2s`;
      if (interactive) {
        star.addEventListener('click', () => {
          renderStarRating(el, i, true, onChange);
          if (onChange) onChange(i);
        });
        star.addEventListener('mouseenter', () => star.style.transform = 'scale(1.3)');
        star.addEventListener('mouseleave', () => star.style.transform = 'scale(1)');
      }
      el.appendChild(star);
    }
  };

  // ============================================================
  // 2. COMENTARIOS EN PRODUCTOS
  // ============================================================
  const renderComments = (container, productId) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const comments = JSON.parse(localStorage.getItem(`eco_comments_${productId}`) || '[]');
    
    el.innerHTML = `
      <div style="margin-bottom:16px">
        <textarea id="ecoCommentInput" placeholder="Escribe un comentario..." style="width:100%;padding:12px;border:1.5px solid rgba(46,125,50,0.18);border-radius:12px;font-family:inherit;font-size:0.88rem;resize:vertical;min-height:60px;outline:none;margin-bottom:8px"></textarea>
        <button onclick="EcoMarketplace.addComment('${productId}')" style="background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;padding:8px 20px;border-radius:10px;font-family:inherit;font-weight:700;font-size:0.85rem;cursor:pointer"><i class="bi bi-send"></i> Comentar</button>
      </div>
      <div id="ecoCommentsList" style="display:flex;flex-direction:column;gap:10px">
        ${comments.length === 0 ? '<div style="text-align:center;padding:20px;color:var(--texto-sec);font-size:0.85rem">No hay comentarios aún. ¡Sé el primero!</div>' : ''}
        ${comments.map(c => `
          <div style="background:#fff;border-radius:12px;padding:12px 16px;border:1px solid rgba(46,125,50,0.08)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <strong style="font-size:0.82rem">${c.name}</strong>
              <span style="font-size:0.7rem;color:var(--texto-sec)">${new Date(c.date).toLocaleDateString('es')}</span>
            </div>
            <p style="font-size:0.85rem;color:var(--texto-sec);line-height:1.6">${c.text}</p>
          </div>
        `).join('')}
      </div>
    `;
  };

  const addComment = (productId) => {
    const input = document.getElementById('ecoCommentInput');
    if (!input || !input.value.trim()) return;
    
    const user = window.EcoAuth?.getUser();
    const comments = JSON.parse(localStorage.getItem(`eco_comments_${productId}`) || '[]');
    comments.unshift({
      id: Date.now().toString(36),
      name: user?.name || 'Anónimo',
      text: input.value.trim(),
      date: new Date().toISOString()
    });
    localStorage.setItem(`eco_comments_${productId}`, JSON.stringify(comments));
    input.value = '';
    renderComments(document.querySelector('[data-comments]'), productId);
    if (window.EcoToast) EcoToast.success('💬 Comentario agregado');
  };

  // ============================================================
  // 3. REACCIONES 👍 ❤️ 🌱
  // ============================================================
  const renderReactions = (container, productId) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const reactions = JSON.parse(localStorage.getItem(`eco_reactions_${productId}`) || '{"👍":0,"❤️":0,"🌱":0}');
    const userReactions = JSON.parse(localStorage.getItem(`eco_user_reactions`) || '{}');
    const myReaction = userReactions[productId] || '';
    
    el.innerHTML = Object.entries(reactions).map(([emoji, count]) => `
      <button onclick="EcoMarketplace.toggleReaction('${productId}','${emoji}')" style="
        display:flex;align-items:center;gap:6px;padding:6px 14px;
        border-radius:999px;border:1.5px solid rgba(46,125,50,0.15);
        background:${myReaction === emoji ? '#e8f5e9' : '#fff'};
        color:${myReaction === emoji ? '#2e7d32' : 'var(--texto-sec)'};
        font-size:0.9rem;cursor:pointer;font-family:inherit;
        transition:all 0.2s
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <span>${emoji}</span>
        <span style="font-weight:700;font-size:0.85rem">${count}</span>
      </button>
    `).join('');
  };

  const toggleReaction = (productId, emoji) => {
    const reactions = JSON.parse(localStorage.getItem(`eco_reactions_${productId}`) || '{"👍":0,"❤️":0,"🌱":0}');
    const userReactions = JSON.parse(localStorage.getItem(`eco_user_reactions`) || '{}');
    
    if (userReactions[productId] === emoji) {
      reactions[emoji] = Math.max(0, reactions[emoji] - 1);
      delete userReactions[productId];
    } else {
      if (userReactions[productId]) {
        reactions[userReactions[productId]] = Math.max(0, reactions[userReactions[productId]] - 1);
      }
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      userReactions[productId] = emoji;
    }
    
    localStorage.setItem(`eco_reactions_${productId}`, JSON.stringify(reactions));
    localStorage.setItem(`eco_user_reactions`, JSON.stringify(userReactions));
    renderReactions(document.querySelector('[data-reactions]'), productId);
  };

  // ============================================================
  // 4. COMPARADOR DE PRODUCTOS
  // ============================================================
  const comparador = {
    items: [],
    
    add(product) {
      if (this.items.length >= 3) {
        if (window.EcoToast) EcoToast.warning('Máximo 3 productos para comparar');
        return;
      }
      if (this.items.find(i => i.id === product.id)) {
        if (window.EcoToast) EcoToast.info('Producto ya agregado');
        return;
      }
      this.items.push(product);
      localStorage.setItem('eco_comparador', JSON.stringify(this.items));
      this.render();
      if (window.EcoToast) EcoToast.success(`✅ ${product.name} agregado para comparar`);
    },
    
    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      localStorage.setItem('eco_comparador', JSON.stringify(this.items));
      this.render();
    },
    
    load() {
      try { this.items = JSON.parse(localStorage.getItem('eco_comparador')) || []; } catch { this.items = []; }
    },
    
    render() {
      const container = document.getElementById('ecoComparador');
      if (!container) return;
      
      if (this.items.length === 0) {
        container.style.display = 'none';
        return;
      }
      
      container.style.display = 'block';
      container.innerHTML = `
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,0.12);border:1px solid rgba(46,125,50,0.08);max-width:100%;overflow-x:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3 style="font-size:1rem;font-weight:700">📊 Comparar productos (${this.items.length}/3)</h3>
            <button onclick="EcoMarketplace.comparador.clear()" style="background:none;border:none;color:#b91c1c;cursor:pointer;font-size:0.82rem">Limpiar</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(${Math.max(2, this.items.length)},1fr);gap:16px;min-width:600px">
            ${this.items.map(p => `
              <div style="text-align:center;padding:16px;background:var(--verde-suave);border-radius:14px;position:relative">
                <button onclick="EcoMarketplace.comparador.remove('${p.id}')" style="position:absolute;top:8px;right:8px;background:none;border:none;color:#b91c1c;cursor:pointer;font-size:1rem">✕</button>
                <div style="font-size:2.5rem;margin-bottom:8px">${p.emoji || '📦'}</div>
                <strong style="font-size:0.88rem">${p.name}</strong>
                <div style="font-size:1.1rem;font-weight:800;color:var(--verde);margin:8px 0">S/. ${p.price?.toFixed(2) || '0.00'}</div>
                <div style="font-size:0.78rem;color:var(--texto-sec)">${p.category || ''}</div>
              </div>
            `).join('')}
            ${this.items.length < 3 ? `<div style="display:flex;align-items:center;justify-content:center;border:2px dashed rgba(46,125,50,0.2);border-radius:14px;color:var(--texto-sec);font-size:0.85rem;padding:20px">Agrega otro producto</div>` : ''}
          </div>
        </div>
      `;
    },
    
    clear() {
      this.items = [];
      localStorage.removeItem('eco_comparador');
      this.render();
    }
  };

  // ============================================================
  // 5-8. PRODUCTOS RELACIONADOS, RECOMENDADOS, NUEVOS, MÁS VENDIDOS
  // ============================================================
  const getRelatedProducts = (category, excludeId, limit = 4) => {
    try {
      const all = JSON.parse(localStorage.getItem('eco_products_cache') || '[]');
      return all.filter(p => p.categoria === category && p.id !== excludeId).slice(0, limit);
    } catch { return []; }
  };

  const getRecommendedProducts = (limit = 4) => {
    try {
      const history = JSON.parse(localStorage.getItem('eco_view_history') || '[]');
      const all = JSON.parse(localStorage.getItem('eco_products_cache') || '[]');
      const viewedIds = history.map(h => h.id);
      return all.filter(p => !viewedIds.includes(p.id)).slice(0, limit);
    } catch { return []; }
  };

  const getNewProducts = (limit = 4) => {
    try {
      const all = JSON.parse(localStorage.getItem('eco_products_cache') || '[]');
      return all.slice(0, limit);
    } catch { return []; }
  };

  // ============================================================
  // 9. LISTA DE DESEOS (synced with eco-favorites)
  // ============================================================
  const wishlist = {
    get() { try { return JSON.parse(localStorage.getItem('eco_favorites') || '[]'); } catch { return []; } },
    toggle(item) { /* handled by eco-favorites.js */ },
    count() { return this.get().length; }
  };

  // ============================================================
  // 10. HISTORIAL DE PRODUCTOS VISTOS
  // ============================================================
  const addToHistory = (product) => {
    try {
      let history = JSON.parse(localStorage.getItem('eco_view_history') || '[]');
      history = history.filter(h => h.id !== product.id);
      history.unshift({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, date: Date.now() });
      if (history.length > 20) history.length = 20;
      localStorage.setItem('eco_view_history', JSON.stringify(history));
    } catch {}
  };

  const getHistory = (limit = 6) => {
    try { return JSON.parse(localStorage.getItem('eco_view_history') || '[]').slice(0, limit); } catch { return []; }
  };

  const renderHistory = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const history = getHistory();
    if (history.length === 0) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.innerHTML = `
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px">👁️ Visto recientemente</h3>
      <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px">
        ${history.map(h => `
          <div style="min-width:120px;text-align:center;padding:12px;background:#fff;border-radius:14px;border:1px solid rgba(46,125,50,0.08);cursor:pointer" onclick="window.location.href='detalle-producto.html?id=${h.id}'">
            <div style="font-size:2rem">${h.emoji || '📦'}</div>
            <div style="font-size:0.78rem;font-weight:600;margin-top:4px">${h.name?.substring(0, 15)}</div>
            <div style="font-size:0.82rem;font-weight:800;color:var(--verde)">S/. ${h.price?.toFixed(2) || '0'}</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // ============================================================
  // 11-13. CUPONES, OFERTAS, CUENTA REGRESIVA
  // ============================================================
  const activeCoupons = [
    { code: 'ECO10', discount: 10, type: '%', min: 30, label: '10% OFF', expires: '2026-08-30', uses: 45 },
    { code: 'ECO20', discount: 20, type: '%', min: 80, label: '20% OFF', expires: '2026-08-30', uses: 23 },
    { code: 'ENVIOFREE', discount: 100, type: 'shipping', min: 0, label: 'Envío gratis', expires: '2026-09-15', uses: 67 },
    { code: 'BIENVENIDO', discount: 15, type: 'fixed', min: 0, label: 'S/.15 OFF', expires: '2026-12-31', uses: 120 }
  ];

  const renderDeals = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const getTimeLeft = (expires) => {
      const diff = new Date(expires) - new Date();
      if (diff <= 0) return null;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { days, hours, total: diff };
    };

    const validCoupons = activeCoupons.filter(c => getTimeLeft(c.expires));

    el.innerHTML = `
      <div style="background:linear-gradient(135deg,#1b5e20,#2e7d32);border-radius:20px;padding:24px;color:#fff">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
          <h3 style="font-size:1.1rem;font-weight:800">🔥 Ofertas activas</h3>
          <div id="ecoCountdown" style="display:flex;gap:8px;font-size:0.85rem"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
          ${validCoupons.map(c => `
            <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:14px;text-align:center;backdrop-filter:blur(8px)">
              <div style="font-size:1.3rem;font-weight:800">${c.label}</div>
              <div style="font-size:0.75rem;opacity:0.8;margin:4px 0">Cupo: ${c.code}</div>
              <div style="font-size:0.7rem;opacity:0.6">${c.uses} usados</div>
              <button onclick="EcoMarketplace.copyCoupon('${c.code}')" style="margin-top:8px;background:#fff;color:#2e7d32;border:none;padding:6px 14px;border-radius:999px;font-weight:700;font-size:0.78rem;cursor:pointer;width:100%">Copiar</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Cuenta regresiva (actualiza cada segundo)
    const updateCountdown = () => {
      const cd = document.getElementById('ecoCountdown');
      if (!cd) return;
      const nearest = validCoupons.sort((a, b) => new Date(a.expires) - new Date(b.expires))[0];
      if (!nearest) return;
      const time = getTimeLeft(nearest.expires);
      if (!time) { cd.innerHTML = '<span>⏰ Ofertas terminadas</span>'; return; }
      cd.innerHTML = `
        <span style="background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:8px;font-weight:700">${String(time.days).padStart(2,'0')}d</span>
        <span style="background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:8px;font-weight:700">${String(Math.floor((time.total % 86400000) / 3600000)).padStart(2,'0')}h</span>
        <span style="background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:8px;font-weight:700">${String(Math.floor((time.total % 3600000) / 60000)).padStart(2,'0')}m</span>
        <span style="background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:8px;font-weight:700">${String(Math.floor((time.total % 60000) / 1000)).padStart(2,'0')}s</span>
      `;
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);
  };

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code).then(() => {
      if (window.EcoToast) EcoToast.success(`🎉 Cupón ${code} copiado`);
    });
  };

  // ============================================================
  // 14-16. COMPARTIR EN WHATSAPP, FACEBOOK, X
  // ============================================================
  const share = {
    whatsapp(url, text) {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    },
    facebook(url) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    },
    twitter(url, text) {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  const renderShareButtons = (container, url, text) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="EcoMarketplace.share.whatsapp('${url}','${text}')" style="width:40px;height:40px;border-radius:12px;border:none;background:#25D366;color:#fff;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s" title="WhatsApp"><i class="bi bi-whatsapp"></i></button>
        <button onclick="EcoMarketplace.share.facebook('${url}')" style="width:40px;height:40px;border-radius:12px;border:none;background:#1877F2;color:#fff;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s" title="Facebook"><i class="bi bi-facebook"></i></button>
        <button onclick="EcoMarketplace.share.twitter('${url}','${text}')" style="width:40px;height:40px;border-radius:12px;border:none;background:#000;color:#fff;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s" title="X"><i class="bi bi-twitter-x"></i></button>
      </div>
    `;
  };

  // ============================================================
  // 17. CÓDIGO QR
  // ============================================================
  const generateQR = (container, data) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    // Cargar librería QR
    if (!window.QRCode) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
      script.onload = () => generateQR(el, data);
      document.head.appendChild(script);
      return;
    }
    
    el.innerHTML = '<div id="ecoQRCode"></div>';
    new QRCode(document.getElementById('ecoQRCode'), {
      text: data,
      width: 128,
      height: 128,
      colorDark: '#2e7d32',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  };

  // ============================================================
  // 18. ECOSCORE
  // ============================================================
  const calculateEcoScore = (product) => {
    let score = 50;
    if (product.eco) score += 20;
    if (product.condicion === 'nuevo') score += 5;
    if (product.descripcion?.toLowerCase().includes('reciclado')) score += 10;
    if (product.descripcion?.toLowerCase().includes('orgánico')) score += 10;
    if (product.descripcion?.toLowerCase().includes('biodegradable')) score += 10;
    if (product.descripcion?.toLowerCase().includes('solar')) score += 5;
    if (product.stock > 50) score -= 5;
    return Math.min(100, Math.max(0, score));
  };

  const renderEcoScore = (container, product) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const score = calculateEcoScore(product);
    const color = score >= 80 ? '#2e7d32' : score >= 60 ? '#f59e0b' : '#e53935';
    const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : 'Regular';
    
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f4fbf5;border-radius:14px;border:1px solid rgba(46,125,50,0.12)">
        <div style="width:48px;height:48px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;flex-shrink:0">${score}</div>
        <div>
          <div style="font-weight:700;font-size:0.9rem">EcoScore: ${label}</div>
          <div style="font-size:0.75rem;color:var(--texto-sec)">Impacto ambiental del producto</div>
        </div>
        <div style="margin-left:auto;font-size:1.5rem">${score >= 80 ? '🌿' : score >= 60 ? '🌱' : '♻️'}</div>
      </div>
    `;
  };

  // ============================================================
  // 19. ETIQUETAS (Nuevo, Oferta, Top)
  // ============================================================
  const getProductTags = (product) => {
    const tags = [];
    const created = new Date(product.created_at || Date.now());
    const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysOld < 7) tags.push({ label: 'NUEVO', color: '#2e7d32' });
    if (product.precio_original && product.precio_original > product.precio) tags.push({ label: 'OFERTA', color: '#e53935' });
    if (product.vistas > 500) tags.push({ label: 'TOP', color: '#f59e0b' });
    if (product.stock <= 5) tags.push({ label: 'ÚLTIMOS', color: '#e53935' });
    
    return tags;
  };

  const renderTags = (container, product) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const tags = getProductTags(product);
    el.innerHTML = tags.map(t => `
      <span style="background:${t.color};color:#fff;padding:3px 10px;border-radius:999px;font-size:0.7rem;font-weight:700;letter-spacing:0.05em">${t.label}</span>
    `).join('');
  };

  // ============================================================
  // 20. STOCK DISPONIBLE
  // ============================================================
  const renderStock = (container, stock) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const pct = Math.min(100, (stock / 100) * 100);
    const color = stock > 20 ? '#2e7d32' : stock > 5 ? '#f59e0b' : '#e53935';
    
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:6px;background:var(--verde-suave);border-radius:999px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:999px;transition:width 0.5s"></div>
        </div>
        <span style="font-size:0.82rem;font-weight:700;color:${color}">${stock} disponibles</span>
      </div>
    `;
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    comparador.load();
    comparador.render();

    // Auto-inicializar componentes
    document.querySelectorAll('[data-star-rating]').forEach(el => {
      const rating = parseFloat(el.dataset.starRating) || 0;
      renderStarRating(el, rating, el.dataset.interactive === 'true');
    });

    document.querySelectorAll('[data-comments]').forEach(el => {
      renderComments(el, el.dataset.comments);
    });

    document.querySelectorAll('[data-reactions]').forEach(el => {
      renderReactions(el, el.dataset.reactions);
    });

    document.querySelectorAll('[data-history]').forEach(el => {
      renderHistory(el);
    });

    document.querySelectorAll('[data-deals]').forEach(el => {
      renderDeals(el);
    });

    document.querySelectorAll('[data-share]').forEach(el => {
      const url = el.dataset.shareUrl || window.location.href;
      const text = el.dataset.shareText || document.title;
      renderShareButtons(el, url, text);
    });

    document.querySelectorAll('[data-qr]').forEach(el => {
      generateQR(el, el.dataset.qr || window.location.href);
    });

    document.querySelectorAll('[data-ecoscore]').forEach(el => {
      try {
        const product = JSON.parse(el.dataset.ecoscore);
        renderEcoScore(el, product);
      } catch {}
    });

    document.querySelectorAll('[data-tags]').forEach(el => {
      try {
        const product = JSON.parse(el.dataset.tags);
        renderTags(el, product);
      } catch {}
    });

    document.querySelectorAll('[data-stock]').forEach(el => {
      renderStock(el, parseInt(el.dataset.stock) || 0);
    });

    // Auto-track de vista de producto
    document.querySelectorAll('[data-product-id]').forEach(el => {
      el.addEventListener('click', () => {
        addToHistory({
          id: el.dataset.productId,
          name: el.dataset.productName || 'Producto',
          price: parseFloat(el.dataset.productPrice) || 0,
          emoji: el.dataset.productEmoji || '📦'
        });
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    renderStarRating,
    addComment,
    toggleReaction,
    renderReactions,
    renderComments,
    comparador,
    addToHistory,
    getHistory,
    renderHistory,
    renderDeals,
    copyCoupon,
    share,
    renderShareButtons,
    generateQR,
    calculateEcoScore,
    renderEcoScore,
    getProductTags,
    renderTags,
    renderStock,
    activeCoupons
  };
})();

window.EcoMarketplace = EcoMarketplace;