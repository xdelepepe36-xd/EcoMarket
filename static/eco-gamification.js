/**
 * eco-gamification.js — Sistema de gamificación EcoMarket
 * - Puntos Eco por acciones
 * - Insignias por logros
 * - Nivel de impacto del usuario
 * - Tabla de progreso
 *
 * Incluir: <script src="eco-gamification.js"></script>
 */
const EcoGamification = (() => {
  const KEY = 'eco_gamification';

  // ── Configuración ──────────────────────────────────────
  const POINTS = {
    purchase: 50,        // Por cada compra
    publish: 30,         // Por publicar producto
    favorite: 5,         // Por agregar favorito
    review: 20,          // Por dejar reseña
    login_streak: 10,    // Por día consecutivo
    share: 15,           // Por compartir
    refer: 100,          // Por referir amigo
    eco_product: 25,     // Por producto ecológico comprado
    save_plastic: 40,    // Por producto que ahorra plástico
  };

  const BADGES = [
    { id: 'first_purchase', name: 'Primera Compra', icon: '🛍️', desc: 'Realiza tu primera compra', points: 50 },
    { id: 'eco_collector', name: 'Coleccionista Eco', icon: '🌿', desc: 'Compra 5 productos ecológicos', points: 200 },
    { id: 'super_seller', name: 'Super Vendedor', icon: '💰', desc: 'Publica 10 productos', points: 300 },
    { id: 'planet_saver', name: 'Salvador del Planeta', icon: '🌍', desc: 'Ahorra 10kg de CO₂', points: 500 },
    { id: 'loyal_member', name: 'Miembro Fiel', icon: '⭐', desc: '30 días de actividad', points: 150 },
    { id: 'social_butterfly', name: 'Mariposa Social', icon: '🦋', desc: 'Comparte 5 productos', points: 75 },
    { id: 'review_master', name: 'Maestro Reseñador', icon: '✍️', desc: 'Escribe 10 reseñas', points: 200 },
    { id: 'water_saver', name: 'Ahorrador de Agua', icon: '💧', desc: 'Compra productos que ahorren 1000L', points: 400 },
    { id: 'plastic_free', name: 'Libre de Plástico', icon: '🚫', desc: 'Evita 5kg de plástico', points: 350 },
    { id: 'eco_ambassador', name: 'Embajador Eco', icon: '🌟', desc: 'Refiere a 3 amigos', points: 300 },
  ];

  const LEVELS = [
    { level: 1, name: 'Semilla', minPoints: 0, icon: '🌱' },
    { level: 2, name: 'Brote', minPoints: 100, icon: '🌿' },
    { level: 3, name: 'Árbol', minPoints: 300, icon: '🌳' },
    { level: 4, name: 'Bosque', minPoints: 600, icon: '🌲' },
    { level: 5, name: 'Eco Legend', minPoints: 1000, icon: '🏆' },
  ];

  // ── Datos ──────────────────────────────────────────────
  const getData = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || _defaultData();
    } catch { return _defaultData(); }
  };

  const _defaultData = () => ({
    points: 0,
    badges: [],
    stats: {
      purchases: 0,
      publications: 0,
      favorites: 0,
      reviews: 0,
      shares: 0,
      referrals: 0,
      ecoProducts: 0,
      co2Saved: 0,
      plasticAvoided: 0,
      waterSaved: 0,
      loginStreak: 0,
      lastLogin: null
    },
    history: [],
    createdAt: Date.now()
  });

  const saveData = data => {
    localStorage.setItem(KEY, JSON.stringify(data));
    _dispatch();
  };

  // ── Acciones ───────────────────────────────────────────
  const addPoints = (action, metadata = {}) => {
    const data = getData();
    const points = POINTS[action] || 0;
    if (points === 0) return;

    data.points += points;
    data.history.unshift({
      action,
      points,
      metadata,
      timestamp: Date.now()
    });
    if (data.history.length > 100) data.history.length = 100;

    // Actualizar stats según acción
    if (action === 'purchase') data.stats.purchases++;
    if (action === 'publish') data.stats.publications++;
    if (action === 'favorite') data.stats.favorites++;
    if (action === 'review') data.stats.reviews++;
    if (action === 'share') data.stats.shares++;
    if (action === 'refer') data.stats.referrals++;
    if (action === 'eco_product') data.stats.ecoProducts++;

    if (metadata.co2) data.stats.co2Saved += metadata.co2;
    if (metadata.plastic) data.stats.plasticAvoided += metadata.plastic;
    if (metadata.water) data.stats.waterSaved += metadata.water;

    saveData(data);
    _checkBadges(data);
    _showNotification(action, points);
    return points;
  };

  const _checkBadges = data => {
    const earned = [];
    BADGES.forEach(badge => {
      if (data.badges.includes(badge.id)) return;

      let earned = false;
      switch (badge.id) {
        case 'first_purchase': earned = data.stats.purchases >= 1; break;
        case 'eco_collector': earned = data.stats.ecoProducts >= 5; break;
        case 'super_seller': earned = data.stats.publications >= 10; break;
        case 'planet_saver': earned = data.stats.co2Saved >= 10; break;
        case 'loyal_member': earned = data.stats.loginStreak >= 30; break;
        case 'social_butterfly': earned = data.stats.shares >= 5; break;
        case 'review_master': earned = data.stats.reviews >= 10; break;
        case 'water_saver': earned = data.stats.waterSaved >= 1000; break;
        case 'plastic_free': earned = data.stats.plasticAvoided >= 5; break;
        case 'eco_ambassador': earned = data.stats.referrals >= 3; break;
      }

      if (earned) {
        data.badges.push(badge.id);
        data.points += badge.points;
        if (window.EcoNotifications) {
          EcoNotifications.add(
            `🏅 Insignia desbloqueada: ${badge.name}`,
            badge.desc,
            { type: 'success', icon: badge.icon, timeout: 8000 }
          );
        }
        if (window.EcoToast) {
          EcoToast.eco(`🏅 ¡Desbloqueaste "${badge.name}"! +${badge.points} pts eco`);
        }
      }
    });
    saveData(data);
  };

  const _showNotification = (action, points) => {
    const messages = {
      purchase: `+${points} pts por compra`,
      publish: `+${points} pts por publicar producto`,
      favorite: `+${points} pts por favorito`,
      review: `+${points} pts por reseña`,
      share: `+${points} pts por compartir`,
      refer: `+${points} pts por referir amigo`,
      eco_product: `+${points} pts por producto ecológico`,
    };
    const msg = messages[action];
    if (msg && window.EcoToast) {
      EcoToast.eco(`🌱 ${msg}`);
    }
  };

  // ── Consultas ──────────────────────────────────────────
  const getLevel = () => {
    const data = getData();
    let current = LEVELS[0];
    for (const l of LEVELS) {
      if (data.points >= l.minPoints) current = l;
    }
    return current;
  };

  const getNextLevel = () => {
    const data = getData();
    const current = getLevel();
    const idx = LEVELS.indexOf(current);
    return LEVELS[idx + 1] || null;
  };

  const getProgress = () => {
    const data = getData();
    const current = getLevel();
    const next = getNextLevel();
    if (!next) return 100;
    const range = next.minPoints - current.minPoints;
    const progress = data.points - current.minPoints;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  const getBadges = () => {
    const data = getData();
    return BADGES.map(b => ({
      ...b,
      unlocked: data.badges.includes(b.id)
    }));
  };

  const getStats = () => getData().stats;

  // ── Login streak ───────────────────────────────────────
  const checkLoginStreak = () => {
    const data = getData();
    const today = new Date().toDateString();
    const last = data.stats.lastLogin;

    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last === yesterday) {
        data.stats.loginStreak++;
      } else {
        data.stats.loginStreak = 1;
      }
      data.stats.lastLogin = today;
      saveData(data);

      if (data.stats.loginStreak >= 3) {
        addPoints('login_streak');
      }
    }
  };

  // ── UI ─────────────────────────────────────────────────
  const _dispatch = () => {
    const data = getData();
    window.dispatchEvent(new CustomEvent('eco-gamification:update', {
      detail: { points: data.points, level: getLevel(), progress: getProgress(), badges: data.badges }
    }));
  };

  const renderWidget = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    const data = getData();
    const level = getLevel();
    const next = getNextLevel();
    const progress = getProgress();
    const badges = getBadges();
    const unlocked = badges.filter(b => b.unlocked).length;

    el.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,0.07);border:1px solid rgba(46,125,50,0.08)">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
          <div style="font-size:3rem;width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:#e8f5e9;border-radius:16px">${level.icon}</div>
          <div>
            <div style="font-size:0.78rem;color:#5d6a5f;font-weight:600">NIVEL ${level.level}</div>
            <div style="font-size:1.2rem;font-weight:800;color:#1f2a21">${level.name}</div>
            <div style="font-size:0.85rem;color:#2e7d32;font-weight:700">${data.points} pts eco</div>
          </div>
        </div>
        ${next ? `
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:#5d6a5f;margin-bottom:6px">
              <span>Siguiente: ${next.name}</span>
              <span>${data.points}/${next.minPoints} pts</span>
            </div>
            <div style="height:8px;background:#e8f5e9;border-radius:999px;overflow:hidden">
              <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#4caf50,#2e7d32);border-radius:999px;transition:width 0.8s cubic-bezier(0.34,1.56,0.64,1)"></div>
            </div>
          </div>
        ` : `
          <div style="text-align:center;padding:12px;background:#e8f5e9;border-radius:12px;margin-bottom:16px;color:#2e7d32;font-weight:700;font-size:0.9rem">
            🏆 ¡Has alcanzado el nivel máximo!
          </div>
        `}
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid rgba(46,125,50,0.08)">
          <span style="font-size:0.82rem;color:#5d6a5f">Insignias</span>
          <span style="font-size:0.82rem;font-weight:700;color:#2e7d32">${unlocked}/${badges.length}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${badges.slice(0, 6).map(b => `
            <div style="
              width:40px;height:40px;border-radius:12px;
              display:flex;align-items:center;justify-content:center;
              font-size:1.2rem;
              background:${b.unlocked ? '#e8f5e9' : '#f0f0f0'};
              opacity:${b.unlocked ? 1 : 0.3};
              cursor:pointer;position:relative;
              transition:transform 0.2s;
            " title="${b.name}: ${b.desc}" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              ${b.icon}
            </div>
          `).join('')}
          ${badges.length > 6 ? `<div style="width:40px;height:40px;border-radius:12px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:0.78rem;color:#5d6a5f;font-weight:700">+${badges.length - 6}</div>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid rgba(46,125,50,0.08)">
          <div style="text-align:center;padding:10px;background:#e8f5e9;border-radius:12px">
            <div style="font-size:1.2rem;font-weight:800;color:#2e7d32">${data.stats.purchases}</div>
            <div style="font-size:0.72rem;color:#5d6a5f">Compras</div>
          </div>
          <div style="text-align:center;padding:10px;background:#e8f5e9;border-radius:12px">
            <div style="font-size:1.2rem;font-weight:800;color:#2e7d32">${data.stats.co2Saved}kg</div>
            <div style="font-size:0.72rem;color:#5d6a5f">CO₂ ahorrado</div>
          </div>
          <div style="text-align:center;padding:10px;background:#e8f5e9;border-radius:12px">
            <div style="font-size:1.2rem;font-weight:800;color:#2e7d32">${data.stats.plasticAvoided}kg</div>
            <div style="font-size:0.72rem;color:#5d6a5f">Plástico evitado</div>
          </div>
          <div style="text-align:center;padding:10px;background:#e8f5e9;border-radius:12px">
            <div style="font-size:1.2rem;font-weight:800;color:#2e7d32">🔥 ${data.stats.loginStreak}</div>
            <div style="font-size:0.72rem;color:#5d6a5f">Días seguidos</div>
          </div>
        </div>
      </div>
    `;
  };

  // ── Inicialización ────────────────────────────────────
  const init = () => {
    checkLoginStreak();
    _dispatch();

    // Renderizar widgets
    document.querySelectorAll('[data-eco-gamification]').forEach(el => renderWidget(el));
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return {
    addPoints, getData, getLevel, getNextLevel, getProgress,
    getBadges, getStats, renderWidget, checkLoginStreak,
    BADGES, LEVELS, POINTS
  };
})();

window.EcoGamification = EcoGamification;