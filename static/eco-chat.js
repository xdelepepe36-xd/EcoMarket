/**
 * eco-chat.js - Chatbot inteligente para EcoMarket v2.0
 * Asistente virtual "EcoBot" con:
 *  - Respuestas bilingües (ES/EN) sincronizadas con el idioma activo
 *  - Motor de intenciones ampliado (intent + sinónimos en ambos idiomas)
 *  - Sugerencias de conversación (quick replies)
 *  - Indicador de "escribiendo..."
 *  - Adaptación al tema claro/oscuro
 */
const EcoChat = (() => {
  let isOpen = false;
  let messages = [];

  const _t = (key, params = {}) =>
    window.EcoI18n && typeof window.EcoI18n.t === 'function'
      ? window.EcoI18n.t(key, params, key)
      : key;

  const _lang = () =>
    (window.EcoI18n && (EcoI18n.getLang ? EcoI18n.getLang() : '')) || 'es';

  // ── Respuestas por intención (ES y EN) ──
  const RESPONSES = {
    hola: {
      es: '¡Hola! 🌱 Soy EcoBot, tu asistente ecológico. ¿En qué puedo ayudarte hoy? Puedes preguntarme por productos, envíos, publicaciones, cupones, pagos o tu cuenta.',
      en: 'Hi! 🌱 I am EcoBot, your eco assistant. How can I help you today? You can ask about products, shipping, listings, coupons, payments or your account.'
    },
    ayuda: {
      es: 'Claro, puedo ayudarte con:\n• 🔎 Buscar productos ecológicos\n• 🚚 Información sobre envíos\n• 📦 Cómo publicar productos\n• 🎫 Cupones y descuentos\n• 💳 Métodos de pago\n• 👤 Gestión de tu cuenta y perfil\n• ♻️ Consejos para reciclar y reducir huella',
      en: 'Sure, I can help you with:\n• 🔎 Searching for eco products\n• 🚚 Shipping information\n• 📦 How to publish products\n• 🎫 Coupons and discounts\n• 💳 Payment methods\n• 👤 Managing your account and profile\n• ♻️ Recycling and footprint tips'
    },
    producto: {
      es: 'Puedes explorar todo nuestro catálogo en la sección "Productos" o usar el buscador. Tenemos estas categorías: Hogar 🏠, Accesorios 🎒, Higiene 🧴, Jardín 🌻, Alimentación 🥗 y Ropa 👕. También puedo recomendarte algo según tu presupuesto.',
      en: 'You can browse our full catalog in the "Products" section or use the search bar. We have these categories: Home 🏠, Accessories 🎒, Hygiene 🧴, Garden 🌻, Food 🥗 and Clothing 👕. I can also recommend something based on your budget.'
    },
    envio: {
      es: '🚚 Enviamos a todo Perú. Tiempo estimado: 3-7 días hábiles. Envío GRATIS en compras mayores a S/.150 (o con el cupón ENVIOFREE). El costo estándar es S/.12.',
      en: '🚚 We ship nationwide. Estimated delivery: 3-7 business days. FREE shipping on orders over S/.150 (or with the ENVIOFREE coupon). Standard cost is S/.12.'
    },
    publicar: {
      es: '📦 Publicar es fácil: 1. Crea una cuenta 2. Ve a "Publicar" 3. Completa nombre, precio, categoría, descripción e imágenes 4. ¡Listo! Recibirás +15 XP por cada publicación. Las imágenes deben ser .jpg, .png o .webp.',
      en: '📦 Publishing is easy: 1. Create an account 2. Go to "Publish" 3. Fill in name, price, category, description and images 4. Done! You earn +15 XP per listing. Images must be .jpg, .png or .webp.'
    },
    cupon: {
      es: '🎫 Cupones activos:\n• ECO10 → 10% OFF (mín. S/.30)\n• ECO20 → 20% OFF (mín. S/.80)\n• ENVIOFREE → Envío gratis\n• BIENVENIDO → S/.15 OFF\nÚsalos en el carrito o durante el checkout.',
      en: '🎫 Active coupons:\n• ECO10 → 10% OFF (min. S/.30)\n• ECO20 → 20% OFF (min. S/.80)\n• ENVIOFREE → Free shipping\n• BIENVENIDO → S/.15 OFF\nUse them in the cart or at checkout.'
    },
    pago: {
      es: '💳 Aceptamos tarjeta de crédito/débito, Yape/Plin y transferencia bancaria (BCP, Interbank, BBVA). Todos los pagos se procesan de forma 100% segura.',
      en: '💳 We accept credit/debit cards, Yape/Plin and bank transfers (BCP, Interbank, BBVA). All payments are processed 100% securely.'
    },
    devolucion: {
      es: '🔄 Tienes 30 días para devoluciones. Los productos deben estar en su estado original. Contacta a soporte para iniciar el proceso y coordinar el recojo.',
      en: '🔄 You have 30 days for returns. Products must be in original condition. Contact support to start the process and arrange pickup.'
    },
    contacto: {
      es: '📧 Puedes contactarnos:\n• Email: hola@ecomarket.com\n• Tel: +51 999 888 777\n• Horario: Lun-Sáb 9am a 6pm',
      en: '📧 You can reach us:\n• Email: hola@ecomarket.com\n• Phone: +51 999 888 777\n• Hours: Mon-Sat 9am-6pm'
    },
    cuenta: {
      es: '👤 Tu cuenta incluye: perfil con avatar y banner, seguidores, XP y niveles, historial de compras/ventas, favoritos y configuración. ¿Quieres que te explique algo más de tu perfil?',
      en: '👤 Your account includes: profile with avatar and banner, followers, XP and levels, purchase/sales history, favorites and settings. Would you like to know more about your profile?'
    },
    reciclar: {
      es: '♻️ Consejos eco:\n• Lleva tu propia bolsa de tela y botella reutilizable\n• Separa residuos orgánicos para compostar\n• Prefiere productos a granel y sin empaques plásticos\n• Compra de segunda mano para reducir tu huella\nEn EcoMarket cada compra calcula tu ahorro de CO₂ y plástico.',
      en: '♻️ Eco tips:\n• Bring your own cloth bag and reusable bottle\n• Separate organic waste for composting\n• Prefer bulk products without plastic packaging\n• Buy second-hand to reduce your footprint\nAt EcoMarket every purchase calculates your CO₂ and plastic savings.'
    },
    ecoscore: {
      es: '🌿 El EcoScore valora del 0 al 100 qué tan sostenible es un producto según sus materiales, empaque y origen. Los productos con mayor puntaje muestran la insignia "Eco" y aportan más puntos a tu cuenta.',
      en: '🌿 The EcoScore rates from 0 to 100 how sustainable a product is based on its materials, packaging and origin. Products with higher scores show the "Eco" badge and give more points to your account.'
    },
    puntos: {
      es: '⭐ Ganas XP y puntos Eco por:\n• Comprar productos (+10 a +25 XP)\n• Publicar producto (+15 XP)\n• Dejar reseñas (+5 XP)\n• Iniciar sesión diario (streak)\nLos niveles van de Semilla 🌱 hasta Bosque 🌳 (50 niveles).',
      en: '⭐ You earn XP and Eco points by:\n• Buying products (+10 to +25 XP)\n• Publishing a product (+15 XP)\n• Leaving reviews (+5 XP)\n• Daily login (streak)\nLevels go from Seed 🌱 to Forest 🌳 (50 levels).'
    },
    gracia: {
      es: '¡De nada! 🌿 Si necesitas algo más, aquí estoy. ¡Feliz compra ecológica!',
      en: 'You are welcome! 🌿 If you need anything else, I am here. Happy eco shopping!'
    },
    adios: {
      es: '¡Hasta luego! 🌱 Recuerda que cada compra cuenta para el planeta.',
      en: 'Goodbye! 🌱 Remember every purchase counts for the planet.'
    },
    precio: {
      es: '💰 Te recomiendo filtrar en "Productos" usando el rango de precio y ordenar de menor a mayor. ¿Quieres ver opciones accesibles? Prueba escribiendo "productos baratos".',
      en: '💰 I recommend filtering in "Products" using the price range and sorting from lowest to highest. Want to see affordable options? Try typing "cheap products".'
    },
    default: {
      es: 'No entendí bien. 😅 Puedes preguntarme sobre: productos, envíos, publicaciones, cupones, pagos, devoluciones, contacto, cuenta, puntos XP o reciclaje.',
      en: 'I did not get that. 😅 You can ask me about: products, shipping, listings, coupons, payments, returns, contact, account, XP points or recycling.'
    }
  };

  // ── Motor de intenciones: [intención, lista de palabras clave] ──
  const INTENTS = [
    { key: 'hola', keys: ['hola', 'buenas', 'hey', 'hello', 'buenos dias', 'good morning'] },
    { key: 'ayuda', keys: ['ayuda', 'puedes', 'help'] },
    { key: 'producto', keys: ['producto', 'catalogo', 'catalog', 'comprar', 'buscar', 'search', 'buy', 'productos'] },
    { key: 'envio', keys: ['envio', 'shipping', 'entrega', 'delivery', 'demora', 'domicilio', 'costo de envio'] },
    { key: 'publicar', keys: ['publicar', 'publish', 'vender', 'sell', 'subir producto'] },
    { key: 'cupon', keys: ['cupon', 'coupon', 'descuento', 'discount', 'oferta', 'promo'] },
    { key: 'pago', keys: ['pago', 'payment', 'tarjeta', 'card', 'yape', 'paypal', 'transferencia', 'transfer', 'pagar'] },
    { key: 'devolucion', keys: ['devolucion', 'return', 'reembolso', 'refund', 'cambio'] },
    { key: 'contacto', keys: ['contacto', 'contact', 'soporte', 'support', 'telefono', 'phone', 'correo', 'email'] },
    { key: 'cuenta', keys: ['cuenta', 'account', 'perfil', 'profile', 'contrasena', 'password', 'sesion', 'login'] },
    { key: 'reciclar', keys: ['reciclar', 'recycle', 'reciclaje', 'consejo', 'tips'] },
    { key: 'ecoscore', keys: ['ecoscore', 'sostenible', 'sustainable', 'puntaje eco'] },
    { key: 'puntos', keys: ['puntos', 'points', ' xp', 'nivel', 'level', 'rango', 'rank', 'logro', 'achievement'] },
    { key: 'gracia', keys: ['gracias', 'thanks', 'thank', 'genial', 'perfecto'] },
    { key: 'adios', keys: ['adios', 'bye', 'chao', 'hasta luego', 'nos vemos'] },
    { key: 'precio', keys: ['barato', 'cheap', 'caro', 'expensive', 'presupuesto', 'budget', 'precio'] }
  ];

  // ── Resolución de respuesta según intención e idioma ──
  const getResponse = (msg) => {
    const lower = msg.toLowerCase();
    const lang = _lang();

    for (const intent of INTENTS) {
      if (intent.keys.some((k) => lower.includes(k))) {
        return RESPONSES[intent.key][lang];
      }
    }
    return RESPONSES.default[lang];
  };

  // ── Respuestas rápidas sugeridas ──
  const QUICK_REPLIES = ['🧴 Productos', '🚚 Envío', '🎫 Cupones', '♻️ Reciclar', '⭐ Puntos XP'];

  // ── UI ──
  const toggle = () => {
    isOpen = !isOpen;
    const el = document.getElementById('ecoChatWidget');
    if (el) {
      el.style.display = isOpen ? 'flex' : 'none';
      if (isOpen && messages.length === 0) {
        addTypedMessage('bot', RESPONSES.hola[_lang()]);
        renderQuickReplies();
      }
    }
  };

  const addMessage = (type, text) => {
    messages.push({ type, text });
    const container = document.getElementById('ecoChatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = `display:flex;${type === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin:6px 0;`;
    div.innerHTML = `
      <div style="max-width:78%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;
        ${type === 'user'
          ? 'background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border-bottom-right-radius:4px;'
          : 'background:#f0f7ef;color:#22302a;border-bottom-left-radius:4px;'}">
        ${text}
      </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  };

  const renderQuickReplies = () => {
    setQuickReplies(QUICK_REPLIES);
  };

  const setQuickReplies = (list) => {
    const container = document.getElementById('ecoChatQuick');
    if (!container || !list || !list.length) return;
    const textFor = (q) => q.replace(/^[^\wÑñáéíóúÁÉÍÓÚüÜ ]+/, '').replace(/"/g, '&quot;');
    container.innerHTML = list.map((q) => `
      <button type="button" onclick="EcoChat.sendText('${textFor(q)}')"
        style="background:#fff;border:1.5px solid rgba(46,125,50,0.25);color:#2e7d32;border-radius:999px;
        padding:6px 12px;font-size:0.75rem;font-weight:600;cursor:pointer;white-space:nowrap;font-family:inherit;">
        ${q}
      </button>`).join('');
    container.style.display = 'flex';
  };

  // Efecto "escribiendo" letra a letra estilo ChatGPT
  const addTypedMessage = (type, text, opts = {}) => {
    messages.push({ type, text });
    const container = document.getElementById('ecoChatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = `display:flex;${type === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin:6px 0;`;
    const bubble = document.createElement('div');
    bubble.style.cssText = (type === 'user'
      ? 'max-width:78%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border-bottom-right-radius:4px;'
      : 'max-width:78%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;background:#f0f7ef;color:#22302a;border-bottom-left-radius:4px;');
    div.appendChild(bubble);
    container.appendChild(div);
    const velocity = opts.fast ? 40 : 6;
    let i = 0;
    const timer = setInterval(() => {
      i = Math.min(i + velocity, text.length);
      bubble.textContent = text.slice(0, i);
      container.scrollTop = container.scrollHeight;
      if (i >= text.length) clearInterval(timer);
    }, 16);
  };

  const showTyping = () => {
    const container = document.getElementById('ecoChatMessages');
    if (!container || document.getElementById('ecoChatTyping')) return;
    const div = document.createElement('div');
    div.id = 'ecoChatTyping';
    div.style.cssText = 'display:flex;margin:6px 0;';
    div.innerHTML = '<div style="padding:10px 14px;background:#f0f7ef;border-radius:16px;color:#22302a;font-size:0.8rem">escribiendo…</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  };

  const hideTyping = () => {
    const t = document.getElementById('ecoChatTyping');
    if (t) t.remove();
  };

  const send = () => {
    const input = document.getElementById('ecoChatInput');
    if (!input || !input.value.trim()) return;
    sendText(input.value.trim());
  };

  const sendText = (text) => {
    const input = document.getElementById('ecoChatInput');
    if (input) input.value = '';
    const quick = document.getElementById('ecoChatQuick');
    if (quick) quick.style.display = 'none';
    addMessage('user', text);
    showTyping();

    // Usar la IA del servidor (/api/chat); si falla, usar el motor local
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
      .then((r) => r.json())
      .then((d) => {
        hideTyping();
        if (d && d.reply) {
          addTypedMessage('bot', d.reply);
          if (d.quick_replies && d.quick_replies.length) {
            setQuickReplies(d.quick_replies);
          }
        } else {
          addTypedMessage('bot', getResponse(text), { fast: true });
        }
      })
      .catch(() => {
        hideTyping();
        setTimeout(() => addTypedMessage('bot', getResponse(text), { fast: true }), 300);
      });
  };

  const init = () => {
    const existing = document.getElementById('ecoChatWidget');
    if (existing) return;

    const btn = document.createElement('button');
    btn.id = 'ecoChatBtn';
    btn.innerHTML = '<i class="bi bi-chat-dots"></i>';
    btn.style.cssText = `
      position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;
      background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;
      font-size:1.5rem;cursor:pointer;box-shadow:0 8px 24px rgba(46,125,50,0.3);
      z-index:9999;display:flex;align-items:center;justify-content:center;transition:all 0.3s;`;
    btn.onmouseover = () => { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = toggle;
    document.body.appendChild(btn);

    const widget = document.createElement('div');
    widget.id = 'ecoChatWidget';
    widget.style.cssText = `
      position:fixed;bottom:90px;right:24px;width:360px;max-width:calc(100vw - 32px);
      height:500px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;
      box-shadow:0 20px 60px rgba(0,0,0,0.15);z-index:9998;display:none;flex-direction:column;
      overflow:hidden;border:1px solid rgba(46,125,50,0.1);`;
    widget.innerHTML = `
      <div style="background:linear-gradient(135deg,#1b5e20,#2e7d32);color:#fff;padding:16px 20px;display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem">🌱</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:0.9rem">EcoBot v2</div>
          <div style="font-size:0.75rem;opacity:0.8">Asistente ecológico · IA</div>
        </div>
        <button onclick="EcoChat.toggle()" style="background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer"><i class="bi bi-x-lg"></i></button>
      </div>
      <div id="ecoChatMessages" style="flex:1;overflow-y:auto;padding:16px;background:#fafcfa"></div>
      <div id="ecoChatQuick" style="display:none;gap:6px;flex-wrap:wrap;padding:8px 16px;background:#fafcfa;border-top:1px solid rgba(46,125,50,0.06)"></div>
      <div style="padding:12px 16px;border-top:1px solid rgba(46,125,50,0.1);display:flex;gap:8px;background:#fff">
        <input id="ecoChatInput" type="text" placeholder="${_t('chat.placeholder')}"
          style="flex:1;padding:10px 14px;border:1.5px solid rgba(46,125,50,0.18);border-radius:12px;font-family:inherit;font-size:0.85rem;outline:none"
          onkeydown="if(event.key==='Enter')EcoChat.send()">
        <button onclick="EcoChat.send()" style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center">
          <i class="bi bi-send"></i>
        </button>
      </div>`;
    document.body.appendChild(widget);
  };

  // Re-aplicar tema (claro/oscuro) al widget
  document.addEventListener('eco-theme:change', function (e) {
    const widget = document.getElementById('ecoChatWidget');
    if (!widget) return;
    const isDark = e.detail && e.detail.theme !== 'light';
    widget.style.background = isDark ? '#141b17' : '#fff';
    const q = widget.querySelector('#ecoChatQuick');
    const i = widget.querySelector('#ecoChatInput');
    const m = widget.querySelector('#ecoChatMessages');
    if (q) { q.style.background = isDark ? '#141b17' : '#fafcfa'; }
    if (i) { i.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#fff'; i.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(46,125,50,0.18)'; i.style.color = isDark ? '#fff' : ''; }
    if (m) { m.style.background = isDark ? '#0f1612' : '#fafcfa'; }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggle, send, sendText };
})();

window.EcoChat = EcoChat;