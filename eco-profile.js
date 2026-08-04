/**
 * eco-profile.js — Perfil completo EcoMarket v2.0
 * 20 mejoras: perfil público, seguidores, ranking, logros, insignias, PDF, avatar, banner, etc.
 * 
 * Incluir: <script src="eco-profile.js"></script>
 */
const EcoProfile = (() => {
  const KEY = 'eco_profile_data';

  // ============================================================
  // DATOS DE PERFIL
  // ============================================================
  const getProfile = () => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (data) return data;
    } catch {}
    return _defaultProfile();
  };

  const _defaultProfile = () => ({
    name: 'Usuario EcoMarket',
    email: 'usuario@ecomarket.com',
    bio: '🌱 Amante del planeta. Comprador y vendedor ecológico.',
    avatar: '',
    avatarColor: '#2e7d32',
    banner: '',
    joinDate: new Date().toISOString(),
    social: { instagram: '', facebook: '', twitter: '', tiktok: '', youtube: '' },
    stats: {
      products: 0, sales: 0, purchases: 0, reviews: 0, followers: 0, following: 0,
      ecoScore: 0, co2Saved: 0, plasticAvoided: 0, treesSaved: 0, waterSaved: 0,
      level: 1, xp: 0, rank: 'Semilla 🌱'
    },
    badges: [],
    achievements: [],
    history: { products: [], purchases: [], sales: [], eco: [] },
    settings: {
      darkMode: false, notifications: true, emailUpdates: true, publicProfile: true
    }
  });

  const saveProfile = (data) => {
    localStorage.setItem(KEY, JSON.stringify(data));
    _dispatch();
  };

  const _dispatch = () => {
    window.dispatchEvent(new CustomEvent('eco-profile:update', { detail: getProfile() }));
  };

  // ============================================================
  // 1. PERFIL PÚBLICO
  // ============================================================
  const getPublicProfile = (userId) => {
    const profile = getProfile();
    return {
      name: profile.name,
      bio: profile.bio,
      avatar: profile.avatar,
      avatarColor: profile.avatarColor,
      banner: profile.banner,
      joinDate: profile.joinDate,
      social: profile.social,
      stats: {
        products: profile.stats.products,
        sales: profile.stats.sales,
        reviews: profile.stats.reviews,
        followers: profile.stats.followers,
        level: profile.stats.level,
        rank: profile.stats.rank
      },
      badges: profile.badges.slice(0, 6)
    };
  };

  // ============================================================
  // 2. SEGUIDORES
  // ============================================================
  const followers = {
    get() {
      try { return JSON.parse(localStorage.getItem('eco_followers') || '[]'); } catch { return []; }
    },
    count() { return this.get().length; },
    follow(userId) {
      const list = this.get();
      if (!list.includes(userId)) {
        list.push(userId);
        localStorage.setItem('eco_followers', JSON.stringify(list));
        const profile = getProfile();
        profile.stats.followers = list.length;
        saveProfile(profile);
        if (window.EcoToast) EcoToast.success('✅ Ahora sigues a este usuario');
      }
    },
    unfollow(userId) {
      const list = this.get().filter(id => id !== userId);
      localStorage.setItem('eco_followers', JSON.stringify(list));
      const profile = getProfile();
      profile.stats.followers = list.length;
      saveProfile(profile);
    },
    isFollowing(userId) { return this.get().includes(userId); }
  };

  // ============================================================
  // 3. RANKING
  // ============================================================
  const getRank = (xp) => {
    const ranks = [
      { min: 0, name: 'Semilla 🌱', icon: '🌱' },
      { min: 100, name: 'Brote 🌿', icon: '🌿' },
      { min: 300, name: 'Árbol 🌳', icon: '🌳' },
      { min: 600, name: 'Bosque 🌲', icon: '🌲' },
      { min: 1000, name: 'Eco Legend 🏆', icon: '🏆' }
    ];
    let current = ranks[0];
    for (const r of ranks) {
      if (xp >= r.min) current = r;
    }
    return current;
  };

  const getNextRank = (xp) => {
    const ranks = [
      { min: 0, name: 'Semilla 🌱' },
      { min: 100, name: 'Brote 🌿' },
      { min: 300, name: 'Árbol 🌳' },
      { min: 600, name: 'Bosque 🌲' },
      { min: 1000, name: 'Eco Legend 🏆' }
    ];
    const current = getRank(xp);
    const idx = ranks.findIndex(r => r.name === current.name);
    return ranks[idx + 1] || null;
  };

  const getRankProgress = (xp) => {
    const current = getRank(xp);
    const next = getNextRank(xp);
    if (!next) return 100;
    const range = next.min - current.min;
    const progress = xp - current.min;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  // ============================================================
  // 4. ESTADÍSTICAS PERSONALES
  // ============================================================
  const getStats = () => getProfile().stats;

  const addXP = (amount) => {
    const profile = getProfile();
    profile.stats.xp += amount;
    const newRank = getRank(profile.stats.xp);
    if (newRank.name !== profile.stats.rank) {
      profile.stats.rank = newRank.name;
      profile.stats.level = newRank.min / 100 + 1;
      if (window.EcoToast) EcoToast.eco(`🏆 ¡Subiste a nivel ${newRank.name}!`);
      _checkAchievements(profile);
    }
    saveProfile(profile);
  };

  // ============================================================
  // 5-7. HISTORIALES
  // ============================================================
  const addToHistory = (type, item) => {
    const profile = getProfile();
    if (!profile.history[type]) profile.history[type] = [];
    profile.history[type].unshift({ ...item, date: new Date().toISOString() });
    if (profile.history[type].length > 50) profile.history[type].length = 50;
    saveProfile(profile);
  };

  const getHistory = (type, limit = 10) => {
    const profile = getProfile();
    return (profile.history[type] || []).slice(0, limit);
  };

  // ============================================================
  // 8. HISTORIAL ECO
  // ============================================================
  const addEcoEntry = (entry) => {
    const profile = getProfile();
    profile.history.eco.unshift({ ...entry, date: new Date().toISOString() });
    if (profile.history.eco.length > 100) profile.history.eco.length = 100;
    profile.stats.co2Saved += entry.co2 || 0;
    profile.stats.plasticAvoided += entry.plastic || 0;
    profile.stats.treesSaved += entry.trees || 0;
    profile.stats.waterSaved += entry.water || 0;
    saveProfile(profile);
  };

  // ============================================================
  // 9-11. LOGROS, INSIGNIAS, NIVELES
  // ============================================================
  const ACHIEVEMENTS = [
    { id: 'first_purchase', name: 'Primera Compra', icon: '🛍️', desc: 'Realiza tu primera compra', xp: 50 },
    { id: 'first_sale', name: 'Primera Venta', icon: '💰', desc: 'Vende tu primer producto', xp: 50 },
    { id: 'first_product', name: 'Primer Producto', icon: '📦', desc: 'Publica tu primer producto', xp: 30 },
    { id: 'five_products', name: 'Vendedor Activo', icon: '🏪', desc: 'Publica 5 productos', xp: 100 },
    { id: 'ten_sales', name: 'Vendedor Estrella', icon: '⭐', desc: 'Realiza 10 ventas', xp: 200 },
    { id: 'hundred_views', name: 'Popular', icon: '👁️', desc: 'Acumula 100 vistas en tus productos', xp: 80 },
    { id: 'five_reviews', name: 'Crítico', icon: '✍️', desc: 'Escribe 5 reseñas', xp: 60 },
    { id: 'ten_favorites', name: 'Coleccionista', icon: '❤️', desc: 'Guarda 10 favoritos', xp: 40 },
    { id: 'eco_friendly', name: 'Eco Amigable', icon: '🌿', desc: 'Compra 3 productos ecológicos', xp: 75 },
    { id: 'social', name: 'Social', icon: '🦋', desc: 'Comparte 5 productos', xp: 50 },
    { id: 'level_5', name: 'Eco Legend', icon: '🏆', desc: 'Alcanza el nivel 5', xp: 500 },
    { id: 'follower_10', name: 'Influencer', icon: '🌟', desc: 'Consigue 10 seguidores', xp: 150 }
  ];

  const BADGES = [
    { id: 'green_buyer', name: 'Comprador Verde', icon: '🟢', desc: 'Compra productos ecológicos' },
    { id: 'super_seller', name: 'Super Vendedor', icon: '💎', desc: 'Vende más de 10 productos' },
    { id: 'eco_warrior', name: 'Eco Guerrero', icon: '⚔️', desc: 'Ahorra 10kg de CO₂' },
    { id: 'plastic_free', name: 'Libre de Plástico', icon: '🚫', desc: 'Evita 5kg de plástico' },
    { id: 'tree_lover', name: 'Amante de Árboles', icon: '🌳', desc: 'Salva 10 árboles' },
    { id: 'water_saver', name: 'Ahorrador de Agua', icon: '💧', desc: 'Ahorra 1000L de agua' },
    { id: 'community', name: 'Comunitario', icon: '🤝', desc: 'Sigue a 5 usuarios' },
    { id: 'veteran', name: 'Veterano', icon: '🎖️', desc: 'Miembro por más de 1 año' }
  ];

  const _checkAchievements = (profile) => {
    ACHIEVEMENTS.forEach(a => {
      if (profile.achievements.includes(a.id)) return;
      let earned = false;
      switch (a.id) {
        case 'first_purchase': earned = profile.stats.purchases >= 1; break;
        case 'first_sale': earned = profile.stats.sales >= 1; break;
        case 'first_product': earned = profile.stats.products >= 1; break;
        case 'five_products': earned = profile.stats.products >= 5; break;
        case 'ten_sales': earned = profile.stats.sales >= 10; break;
        case 'hundred_views': earned = (profile.stats.co2Saved * 100) >= 100; break;
        case 'five_reviews': earned = profile.stats.reviews >= 5; break;
        case 'ten_favorites': earned = profile.stats.purchases >= 3; break;
        case 'eco_friendly': earned = profile.stats.purchases >= 3; break;
        case 'social': earned = profile.stats.sales >= 2; break;
        case 'level_5': earned = profile.stats.level >= 5; break;
        case 'follower_10': earned = profile.stats.followers >= 10; break;
      }
      if (earned) {
        profile.achievements.push(a.id);
        profile.stats.xp += a.xp;
        if (window.EcoToast) EcoToast.eco(`🏅 ¡Logro desbloqueado: ${a.name}! +${a.xp} XP`);
      }
    });
    saveProfile(profile);
  };

  const getAchievements = () => {
    const profile = getProfile();
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: profile.achievements.includes(a.id) }));
  };

  const getBadges = () => {
    const profile = getProfile();
    return BADGES.map(b => ({ ...b, unlocked: profile.badges.includes(b.id) }));
  };

  const unlockBadge = (badgeId) => {
    const profile = getProfile();
    if (!profile.badges.includes(badgeId)) {
      profile.badges.push(badgeId);
      profile.stats.xp += 100;
      saveProfile(profile);
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge && window.EcoToast) EcoToast.eco(`🏅 ¡Insignia desbloqueada: ${badge.name}!`);
    }
  };

  // ============================================================
  // 12-13. FACTURA Y COMPROBANTE PDF
  // ============================================================
  const generateInvoice = (order) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Factura #ECO-${order.id}</title>
      <style>
        body{font-family:'Poppins',sans-serif;padding:40px;color:#1f2a21}
        .header{text-align:center;margin-bottom:30px;border-bottom:2px solid #2e7d32;padding-bottom:20px}
        .header h1{color:#2e7d32;margin:0}
        .info{display:flex;justify-content:space-between;margin-bottom:30px}
        table{width:100%;border-collapse:collapse;margin-bottom:30px}
        th{background:#2e7d32;color:#fff;padding:12px;text-align:left}
        td{padding:12px;border-bottom:1px solid #e8f5e9}
        .total{text-align:right;font-size:1.2rem;font-weight:800;color:#2e7d32}
        .footer{text-align:center;margin-top:40px;color:#5d6a5f;font-size:0.85rem;border-top:1px solid #e8f5e9;padding-top:20px}
      </style></head>
      <body>
        <div class="header">
          <h1>🌱 EcoMarket</h1>
          <p>Factura Electrónica</p>
        </div>
        <div class="info">
          <div>
            <strong>Cliente:</strong> ${order.nombre}<br>
            <strong>Email:</strong> ${order.email}<br>
            <strong>Dirección:</strong> ${order.direccion}
          </div>
          <div style="text-align:right">
            <strong>Factura #:</strong> ECO-${order.id}<br>
            <strong>Fecha:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString('es')}<br>
            <strong>Estado:</strong> ${(order.estado || 'confirmado').toUpperCase()}
          </div>
        </div>
        <table>
          <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
          ${(order.items || [{nombre: order.nombre || 'Producto', cantidad: 1, precio: order.total || 0}]).map(i => `
            <tr><td>${i.nombre}</td><td>${i.cantidad || 1}</td><td>S/. ${(i.precio || 0).toFixed(2)}</td><td>S/. ${((i.precio || 0) * (i.cantidad || 1)).toFixed(2)}</td></tr>
          `).join('')}
        </table>
        <div class="total">Total: S/. ${(order.total || 0).toFixed(2)}</div>
        <div class="footer">
          <p>🌱 EcoMarket - Marketplace Ecológico</p>
          <p>Gracias por contribuir al planeta 💚</p>
        </div>
        <script>
          window.onload = function() { window.print(); };
        <\/script>
      </body></html>
    `);
    win.document.close();
  };

  // ============================================================
  // 14. CONFIGURACIÓN AVANZADA
  // ============================================================
  const updateSettings = (newSettings) => {
    const profile = getProfile();
    profile.settings = { ...profile.settings, ...newSettings };
    saveProfile(profile);
    if (window.EcoToast) EcoToast.success('⚙️ Configuración actualizada');
  };

  // ============================================================
  // 15-16. AVATAR Y BANNER EDITABLES
  // ============================================================
  const updateAvatar = (avatarData) => {
    const profile = getProfile();
    profile.avatar = avatarData;
    saveProfile(profile);
    if (window.EcoToast) EcoToast.success('🖼️ Avatar actualizado');
  };

  const updateBanner = (bannerData) => {
    const profile = getProfile();
    profile.banner = bannerData;
    saveProfile(profile);
    if (window.EcoToast) EcoToast.success('🖼️ Banner actualizado');
  };

  // ============================================================
  // 17. REDES SOCIALES
  // ============================================================
  const updateSocial = (social) => {
    const profile = getProfile();
    profile.social = { ...profile.social, ...social };
    saveProfile(profile);
    if (window.EcoToast) EcoToast.success('🌐 Redes sociales actualizadas');
  };

  // ============================================================
  // 18. PRODUCTOS FAVORITOS MEJORADOS
  // ============================================================
  const getFavoritesWithDetails = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('eco_favorites') || '[]');
      const products = JSON.parse(localStorage.getItem('eco_products_cache') || '[]');
      return favs.map(f => {
        const p = products.find(pr => pr.id === f.id);
        return { ...f, ...p, addedAt: f.addedAt || Date.now() };
      });
    } catch { return []; }
  };

  // ============================================================
  // 19. PANEL DE USUARIO MODERNO
  // ============================================================
  const renderDashboard = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const profile = getProfile();
    const rank = getRank(profile.stats.xp);
    const progress = getRankProgress(profile.stats.xp);
    const next = getNextRank(profile.stats.xp);
    const achievements = getAchievements();
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const badges = getBadges();
    const unlockedBadges = badges.filter(b => b.unlocked).length;

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
        <!-- Tarjeta de nivel -->
        <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:var(--sombra);border:1px solid rgba(46,125,50,0.08)">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
            <div style="font-size:3rem;width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:#e8f5e9;border-radius:16px">${rank.icon}</div>
            <div>
              <div style="font-size:0.78rem;color:var(--texto-sec);font-weight:600">NIVEL ${profile.stats.level}</div>
              <div style="font-size:1.2rem;font-weight:800;color:var(--texto)">${rank.name}</div>
              <div style="font-size:0.85rem;color:var(--verde);font-weight:700">${profile.stats.xp} XP</div>
            </div>
          </div>
          ${next ? `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--texto-sec);margin-bottom:4px">
                <span>Siguiente: ${next.name}</span>
                <span>${profile.stats.xp}/${next.min} XP</span>
              </div>
              <div style="height:8px;background:#e8f5e9;border-radius:999px;overflow:hidden">
                <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#4caf50,#2e7d32);border-radius:999px;transition:width 0.8s"></div>
              </div>
            </div>
          ` : '<div style="text-align:center;padding:12px;background:#e8f5e9;border-radius:12px;margin-bottom:12px;color:#2e7d32;font-weight:700;font-size:0.9rem">🏆 ¡Nivel máximo alcanzado!</div>'}
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(46,125,50,0.08)">
            <span style="font-size:0.82rem;color:var(--texto-sec)">Logros</span>
            <span style="font-size:0.82rem;font-weight:700;color:var(--verde)">${unlockedAchievements}/${achievements.length}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0">
            <span style="font-size:0.82rem;color:var(--texto-sec)">Insignias</span>
            <span style="font-size:0.82rem;font-weight:700;color:var(--verde)">${unlockedBadges}/${badges.length}</span>
          </div>
        </div>

        <!-- Estadísticas -->
        <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:var(--sombra);border:1px solid rgba(46,125,50,0.08)">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px">📊 Estadísticas</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="text-align:center;padding:12px;background:#e8f5e9;border-radius:12px">
              <div style="font-size:1.3rem;font-weight:800;color:var(--verde)">${profile.stats.products}</div>
              <div style="font-size:0.75rem;color:var(--texto-sec)">Publicaciones</div>
            </div>
            <div style="text-align:center;padding:12px;background:#e3f2fd;border-radius:12px">
              <div style="font-size:1.3rem;font-weight:800;color:#1565c0">${profile.stats.sales}</div>
              <div style="font-size:0.75rem;color:var(--texto-sec)">Ventas</div>
            </div>
            <div style="text-align:center;padding:12px;background:#fff3e0;border-radius:12px">
              <div style="font-size:1.3rem;font-weight:800;color:#e65100">${profile.stats.purchases}</div>
              <div style="font-size:0.75rem;color:var(--texto-sec)">Compras</div>
            </div>
            <div style="text-align:center;padding:12px;background:#f3e5f5;border-radius:12px">
              <div style="font-size:1.3rem;font-weight:800;color:#6a1b9a">${profile.stats.followers}</div>
              <div style="font-size:0.75rem;color:var(--texto-sec)">Seguidores</div>
            </div>
          </div>
        </div>

        <!-- Impacto Eco -->
        <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:var(--sombra);border:1px solid rgba(46,125,50,0.08)">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px">🌍 Impacto Ambiental</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between;font-size:0.85rem">
              <span>🌿 CO₂ ahorrado</span>
              <strong style="color:var(--verde)">${profile.stats.co2Saved.toFixed(1)} kg</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.85rem">
              <span>🚫 Plástico evitado</span>
              <strong style="color:var(--verde)">${profile.stats.plasticAvoided.toFixed(1)} kg</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.85rem">
              <span>💧 Agua ahorrada</span>
              <strong style="color:var(--verde)">${Math.round(profile.stats.waterSaved)} L</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.85rem">
              <span>🌳 Árboles salvados</span>
              <strong style="color:var(--verde)">${profile.stats.treesSaved.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // ============================================================
  // 20. PERFIL COMPLETAMENTE RESPONSIVE
  // ============================================================
  const renderProfileCard = (container, userData) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const data = userData || getProfile();
    const rank = getRank(data.stats.xp || 0);
    
    el.innerHTML = `
      <div style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:var(--sombra);border:1px solid rgba(46,125,50,0.08)">
        <!-- Banner -->
        <div style="height:120px;background:${data.banner ? `url(${data.banner}) center/cover` : 'linear-gradient(135deg,#1b5e20,#2e7d32)'};position:relative">
          ${!data.banner ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.2">🌿</div>' : ''}
        </div>
        <!-- Avatar -->
        <div style="text-align:center;margin-top:-40px;padding:0 20px">
          <div style="width:80px;height:80px;border-radius:50%;background:${data.avatarColor || '#2e7d32'};margin:0 auto;border:4px solid #fff;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
            ${data.avatar ? `<img src="${data.avatar}" style="width:100%;height:100%;object-fit:cover">` : (data.name ? data.name[0].toUpperCase() : '👤')}
          </div>
          <h3 style="margin-top:12px;font-size:1.2rem;font-weight:800">${data.name}</h3>
          <p style="font-size:0.85rem;color:var(--texto-sec);margin:4px 0">${data.bio || ''}</p>
          <div style="display:inline-flex;align-items:center;gap:6px;background:#e8f5e9;padding:4px 14px;border-radius:999px;font-size:0.78rem;font-weight:700;color:var(--verde);margin:8px 0">
            ${rank.icon} ${rank.name}
          </div>
          <div style="display:flex;justify-content:center;gap:20px;margin:16px 0;flex-wrap:wrap">
            <div style="text-align:center">
              <div style="font-size:1.1rem;font-weight:800;color:var(--verde)">${data.stats?.products || 0}</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">Productos</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:1.1rem;font-weight:800;color:var(--verde)">${data.stats?.sales || 0}</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">Ventas</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:1.1rem;font-weight:800;color:var(--verde)">${data.stats?.followers || 0}</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">Seguidores</div>
            </div>
          </div>
          <!-- Redes sociales -->
          ${data.social ? `
            <div style="display:flex;justify-content:center;gap:8px;margin-bottom:16px">
              ${data.social.instagram ? `<a href="https://instagram.com/${data.social.instagram}" target="_blank" style="width:36px;height:36px;border-radius:10px;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:1rem"><i class="bi bi-instagram"></i></a>` : ''}
              ${data.social.facebook ? `<a href="https://facebook.com/${data.social.facebook}" target="_blank" style="width:36px;height:36px;border-radius:10px;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:1rem"><i class="bi bi-facebook"></i></a>` : ''}
              ${data.social.twitter ? `<a href="https://twitter.com/${data.social.twitter}" target="_blank" style="width:36px;height:36px;border-radius:10px;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:1rem"><i class="bi bi-twitter-x"></i></a>` : ''}
              ${data.social.tiktok ? `<a href="https://tiktok.com/@${data.social.tiktok}" target="_blank" style="width:36px;height:36px;border-radius:10px;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:1rem"><i class="bi bi-tiktok"></i></a>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    // Inicializar perfil si no existe
    if (!localStorage.getItem(KEY)) {
      saveProfile(_defaultProfile());
    }

    // Renderizar componentes
    document.querySelectorAll('[data-profile-dashboard]').forEach(el => renderDashboard(el));
    document.querySelectorAll('[data-profile-card]').forEach(el => {
      try {
        const data = el.dataset.profileCard ? JSON.parse(el.dataset.profileCard) : null;
        renderProfileCard(el, data);
      } catch { renderProfileCard(el); }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getProfile, saveProfile, getPublicProfile,
    followers,
    getRank, getNextRank, getRankProgress,
    getStats, addXP,
    addToHistory, getHistory, addEcoEntry,
    getAchievements, getBadges, unlockBadge,
    generateInvoice,
    updateSettings, updateAvatar, updateBanner, updateSocial,
    getFavoritesWithDetails,
    renderDashboard, renderProfileCard,
    ACHIEVEMENTS, BADGES
  };
})();

window.EcoProfile = EcoProfile;