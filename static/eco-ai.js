/**
 * eco-ai.js — Funcionalidades inteligentes EcoMarket
 * 15 mejoras: clima, calculadora ecológica, IA, traductor, dashboard IA, gamificación, calendario
 *
 * Incluir: <script src="eco-ai.js"></script>
 */
const EcoAI = (() => {
  // ============================================================
  // 1. CLIMA
  // ============================================================
  const getWeather = async (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--texto-sec)">🌤️ Cargando clima...</div>';
    
    try {
      const res = await fetch('https://wttr.in/Lima?format=j1');
      const data = await res.json();
      const current = data.current_condition[0];
      const temp = current.temp_C;
      const desc = current.weatherDesc[0].value;
      const humidity = current.humidity;
      const icon = temp > 25 ? '☀️' : temp > 18 ? '⛅' : temp > 10 ? '🌥️' : '🌧️';
      
      el.innerHTML = `
        <div style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);border-radius:16px;padding:20px;color:#1a237e">
          <div style="display:flex;align-items:center;gap:16px">
            <span style="font-size:3rem">${icon}</span>
            <div>
              <div style="font-size:2rem;font-weight:800">${temp}°C</div>
              <div style="font-size:0.9rem">${desc}</div>
              <div style="font-size:0.78rem;opacity:0.7;margin-top:4px">💧 ${humidity}% humedad • Lima, Perú</div>
            </div>
          </div>
          <div style="margin-top:12px;font-size:0.78rem;opacity:0.7">🌱 Clima ideal para productos ecológicos</div>
        </div>
      `;
    } catch {
      el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--texto-sec)">🌤️ Clima no disponible</div>';
    }
  };

  // ============================================================
  // 2. TIEMPO DE ENTREGA
  // ============================================================
  const calculateDelivery = (city = 'Lima') => {
    const cities = {
      'Lima': { days: '1-2', price: 0, minFree: 0 },
      'Callao': { days: '1-2', price: 0, minFree: 0 },
      'Arequipa': { days: '3-4', price: 15, minFree: 150 },
      'Cusco': { days: '4-5', price: 18, minFree: 150 },
      'Trujillo': { days: '3-4', price: 12, minFree: 150 },
      'Chiclayo': { days: '3-4', price: 12, minFree: 150 },
      'Piura': { days: '4-5', price: 15, minFree: 150 },
      'Iquitos': { days: '5-7', price: 25, minFree: 200 },
      'Huancayo': { days: '3-4', price: 14, minFree: 150 },
      'Puno': { days: '5-6', price: 20, minFree: 200 }
    };
    return cities[city] || { days: '3-5', price: 12, minFree: 150 };
  };

  const renderDelivery = (container, city = 'Lima', subtotal = 0) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const delivery = calculateDelivery(city);
    const free = subtotal >= delivery.minFree;
    
    el.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:16px;border:1px solid rgba(46,125,50,0.08)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-size:1.5rem">🚚</span>
          <div>
            <strong style="font-size:0.9rem">Envío a ${city}</strong>
            <div style="font-size:0.78rem;color:var(--texto-sec)">Entrega: ${delivery.days} días hábiles</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:${free ? '#e8f5e9' : '#fff3e0'};border-radius:10px">
          <span style="font-size:0.85rem">${free ? '🎉 Envío gratis' : `Costo de envío: S/.${delivery.price.toFixed(2)}`}</span>
          ${!free ? `<span style="font-size:0.75rem;color:var(--texto-sec)">Faltan S/.${(delivery.minFree - subtotal).toFixed(2)} para envío gratis</span>` : ''}
        </div>
      </div>
    `;
  };

  // ============================================================
  // 3. CALCULADORA ECOLÓGICA
  // ============================================================
  const ecoCalculator = {
    factors: {
      'Botella Reutilizable': { co2: 2.5, plastic: 0.5, water: 100, trees: 0.02 },
      'Bolsa Ecológica': { co2: 1.2, plastic: 0.3, water: 50, trees: 0.01 },
      'Cepillo de Bambú': { co2: 0.8, plastic: 0.2, water: 30, trees: 0.01 },
      'Maceta Reciclada': { co2: 1.5, plastic: 0.4, water: 60, trees: 0.03 },
      'Jabón Natural': { co2: 0.5, plastic: 0.1, water: 20, trees: 0.005 },
      'default': { co2: 1.0, plastic: 0.2, water: 40, trees: 0.01 }
    },

    calculate(productName, quantity = 1) {
      const factor = this.factors[productName] || this.factors['default'];
      return {
        co2: (factor.co2 * quantity).toFixed(1),
        plastic: (factor.plastic * quantity).toFixed(1),
        water: Math.round(factor.water * quantity),
        trees: (factor.trees * quantity).toFixed(3)
      };
    },

    render(container, productName, quantity = 1) {
      const el = typeof container === 'string' ? document.querySelector(container) : container;
      if (!el) return;
      const impact = this.calculate(productName, quantity);
      
      el.innerHTML = `
        <div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:16px;padding:20px">
          <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:12px;color:#2e7d32">🌍 Impacto ambiental</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:rgba(255,255,255,0.7);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:800;color:#2e7d32">${impact.co2} kg</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">CO₂ ahorrado</div>
            </div>
            <div style="background:rgba(255,255,255,0.7);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:800;color:#1565c0">${impact.plastic} kg</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">Plástico evitado</div>
            </div>
            <div style="background:rgba(255,255,255,0.7);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:800;color:#00695c">${impact.water} L</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">Agua ahorrada</div>
            </div>
            <div style="background:rgba(255,255,255,0.7);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:800;color:#e65100">${impact.trees}</div>
              <div style="font-size:0.72rem;color:var(--texto-sec)">Árboles salvados</div>
            </div>
          </div>
        </div>
      `;
    }
  };

  // ============================================================
  // 4. IA PARA DESCRIBIR PRODUCTOS
  // ============================================================
  const generateDescription = (product) => {
    const templates = [
      `🌿 ${product.nombre} — El producto ecológico perfecto para tu hogar. Fabricado con materiales sostenibles y libre de químicos dañinos.`,
      `♻️ Descubre ${product.nombre}, una alternativa ecológica que cuida del planeta mientras disfrutas de la mejor calidad.`,
      `🌱 ${product.nombre} es parte de nuestra selección eco-friendly. Cada compra ayuda a reducir tu huella de carbono.`,
      `💚 ${product.nombre}: calidad, sostenibilidad y diseño en un solo producto. Ideal para quienes buscan un estilo de vida verde.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  // ============================================================
  // 5. TRADUCTOR (simplificado)
  // ============================================================
  const translator = {
    dict: {
      'hola': 'hello', 'gracias': 'thank you', 'producto': 'product',
      'ecológico': 'ecological', 'carrito': 'cart', 'comprar': 'buy',
      'vender': 'sell', 'precio': 'price', 'envío': 'shipping', 'pago': 'payment'
    },
    translate(text, lang = 'en') {
      if (lang === 'es') return text;
      const words = text.toLowerCase().split(' ');
      return words.map(w => this.dict[w] || w).join(' ');
    }
  };

  // ============================================================
  // 6-9. DASHBOARD IA, ESTADÍSTICAS, RECOMENDACIONES
  // ============================================================
  const getRecommendations = (userId) => {
    try {
      const history = JSON.parse(localStorage.getItem('eco_view_history') || '[]');
      const products = JSON.parse(localStorage.getItem('eco_products_cache') || '[]');
      const viewedIds = history.map(h => h.id);
      return products.filter(p => !viewedIds.includes(p.id)).slice(0, 4);
    } catch { return []; }
  };

  const getStats = () => {
    try {
      const profile = JSON.parse(localStorage.getItem('eco_profile_data') || '{}');
      return profile.stats || { products: 0, sales: 0, xp: 0 };
    } catch { return { products: 0, sales: 0, xp: 0 }; }
  };

  // ============================================================
  // 10-13. GAMIFICACIÓN EXTRA
  // ============================================================
  const extraAchievements = [
    { id: 'eco_master', name: 'Eco Master', icon: '🏆', desc: 'Alcanza 2000 puntos eco', xp: 1000 },
    { id: 'super_seller', name: 'Super Vendedor', icon: '💎', desc: 'Vende 50 productos', xp: 500 },
    { id: 'green_thumb', name: 'Pulgar Verde', icon: '🌿', desc: 'Compra 20 productos de jardín', xp: 300 },
    { id: 'water_hero', name: 'Héroe del Agua', icon: '💧', desc: 'Ahorra 5000L de agua', xp: 400 },
    { id: 'plastic_warrior', name: 'Guerrero Antiplástico', icon: '♻️', desc: 'Evita 20kg de plástico', xp: 500 },
    { id: 'tree_saver', name: 'Salvador de Árboles', icon: '🌳', desc: 'Salva 50 árboles', xp: 600 },
    { id: 'social_star', name: 'Estrella Social', icon: '🌟', desc: 'Comparte 20 productos', xp: 200 },
    { id: 'review_pro', name: 'Pro de Reseñas', icon: '⭐', desc: 'Escribe 25 reseñas', xp: 300 }
  ];

  // ============================================================
  // 14. SISTEMA DE EVENTOS
  // ============================================================
  const events = [
    { name: '🌱 Día del Planeta', date: '04-22', bonus: 2 },
    { name: '♻️ Día del Reciclaje', date: '05-17', bonus: 3 },
    { name: '🌊 Día del Agua', date: '03-22', bonus: 2 },
    { name: '🌿 EcoWeek', date: '06-01', bonus: 1.5 },
    { name: '🎄 Navidad Verde', date: '12-25', bonus: 2 }
  ];

  const getActiveEvent = () => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return events.find(e => e.date === todayStr) || null;
  };

  const renderEvent = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const event = getActiveEvent();
    if (!event) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.innerHTML = `
      <div style="background:linear-gradient(135deg,#1b5e20,#2e7d32);border-radius:16px;padding:16px;color:#fff;text-align:center">
        <div style="font-size:1.5rem;margin-bottom:4px">${event.name}</div>
        <div style="font-size:0.82rem;opacity:0.9">🎉 ¡Puntos extra x${event.bonus} hoy!</div>
      </div>
    `;
  };

  // ============================================================
  // 15. CALENDARIO ECOLÓGICO
  // ============================================================
  const renderEcoCalendar = (container) => {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
    
    let days = '';
    for (let i = 0; i < firstDay; i++) days += '<div></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate();
      const isEvent = events.some(e => e.date === `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      days += `
        <div style="
          padding:6px;text-align:center;border-radius:8px;font-size:0.82rem;
          background:${isToday ? '#2e7d32' : isEvent ? '#e8f5e9' : 'transparent'};
          color:${isToday ? '#fff' : isEvent ? '#2e7d32' : 'var(--texto)'};
          font-weight:${isToday || isEvent ? '700' : '400'};
          cursor:${isEvent ? 'pointer' : 'default'};
        " title="${isEvent ? '🌱 Evento ecológico' : ''}">
          ${d}
          ${isEvent ? '<div style="font-size:0.5rem">🌱</div>' : ''}
        </div>
      `;
    }

    el.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid rgba(46,125,50,0.08)">
        <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:12px">📅 ${monthNames[month]} ${year}</h4>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
          ${['Do','Lu','Ma','Mi','Ju','Vi','Sá'].map(d => `<div style="text-align:center;font-size:0.72rem;font-weight:700;color:var(--texto-sec);padding:4px">${d}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${days}</div>
        <div style="margin-top:12px;font-size:0.75rem;color:var(--texto-sec);text-align:center">
          🌱 Eventos ecológicos del mes
        </div>
      </div>
    `;
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    document.querySelectorAll('[data-eco-weather]').forEach(el => getWeather(el));
    document.querySelectorAll('[data-eco-delivery]').forEach(el => {
      const city = el.dataset.ecoDelivery || 'Lima';
      const subtotal = parseFloat(el.dataset.subtotal) || 0;
      renderDelivery(el, city, subtotal);
    });
    document.querySelectorAll('[data-eco-calculator]').forEach(el => {
      try {
        const data = JSON.parse(el.dataset.ecoCalculator);
        ecoCalculator.render(el, data.name, data.qty || 1);
      } catch {}
    });
    document.querySelectorAll('[data-eco-event]').forEach(el => renderEvent(el));
    document.querySelectorAll('[data-eco-calendar]').forEach(el => renderEcoCalendar(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getWeather, calculateDelivery, renderDelivery,
    ecoCalculator, generateDescription, translator,
    getRecommendations, getStats,
    extraAchievements, getActiveEvent, renderEvent, renderEcoCalendar
  };
})();

window.EcoAI = EcoAI;