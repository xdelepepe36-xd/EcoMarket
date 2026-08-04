/**
 * eco-ux.js — 15 mejoras de experiencia de usuario EcoMarket
 * Chatbot, centro de ayuda, FAQ, tutorial, búsqueda inteligente, voz, notificaciones, etc.
 *
 * Incluir: <script src="eco-ux.js"></script>
 */
const EcoUX = (() => {
  // ============================================================
  // 1. CHATBOT INTELIGENTE
  // ============================================================
  const chatbot = {
    init() {
      if (document.getElementById('ecoChatbot')) return;
      const container = document.createElement('div');
      container.id = 'ecoChatbot';
      container.style.cssText = `
        position:fixed;bottom:90px;right:20px;z-index:9998;
        width:340px;background:#fff;border-radius:20px;
        box-shadow:0 24px 60px rgba(0,0,0,0.18);
        border:1px solid rgba(46,125,50,0.12);
        font-family:'Poppins',sans-serif;
        transform:translateY(20px) scale(0.95);opacity:0;
        pointer-events:none;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        max-height:500px;display:flex;flex-direction:column;
      `;
      container.innerHTML = `
        <div style="padding:16px 18px;border-bottom:1px solid rgba(46,125,50,0.1);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#2e7d32,#4caf50);border-radius:20px 20px 0 0;color:#fff">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem">🤖</div>
          <div style="flex:1">
            <strong style="font-size:0.9rem">Asistente Eco</strong>
            <div style="font-size:0.72rem;opacity:0.8">Online • Responde al instante</div>
          </div>
          <button onclick="EcoUX.chatbot.toggle()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem">✕</button>
        </div>
        <div id="ecoChatbotMessages" style="flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px;min-height:200px;max-height:300px">
          <div style="display:flex;gap:8px;align-self:flex-start;max-width:85%">
            <div style="width:28px;height:28px;border-radius:50%;background:#2e7d32;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0">🤖</div>
            <div style="background:#e8f5e9;padding:10px 14px;border-radius:14px 14px 14px 4px;font-size:0.82rem;line-height:1.6;color:#1f2a21">
              ¡Hola! Soy el asistente de EcoMarket 🌱<br>
              Puedo ayudarte con:
              <br>📦 Productos
              <br>🛒 Compras
              <br>📬 Contacto
              <br>❓ Preguntas frecuentes
              <br><br><em>Escribe tu consulta...</em>
            </div>
          </div>
        </div>
        <div style="padding:12px 16px;border-top:1px solid rgba(46,125,50,0.1);display:flex;gap:8px">
          <input id="ecoChatbotInput" placeholder="Escribe tu mensaje..." style="flex:1;padding:10px 14px;border:1.5px solid rgba(46,125,50,0.18);border-radius:12px;font-family:inherit;font-size:0.85rem;outline:none">
          <button onclick="EcoUX.chatbot.send()" style="width:40px;height:40px;border-radius:12px;border:none;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">➤</button>
        </div>
      `;
      document.body.appendChild(container);

      // Botón flotante
      if (!document.getElementById('ecoChatbotBtn')) {
        const btn = document.createElement('button');
        btn.id = 'ecoChatbotBtn';
        btn.innerHTML = '🤖';
        btn.style.cssText = `
          position:fixed;bottom:90px;right:20px;z-index:9997;
          width:56px;height:56px;border-radius:50%;
          background:linear-gradient(135deg,#4caf50,#2e7d32);
          color:#fff;border:none;font-size:1.5rem;cursor:pointer;
          box-shadow:0 8px 24px rgba(46,125,50,0.35);
          transition:transform 0.2s;display:none;
        `;
        btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        btn.onclick = () => chatbot.toggle();
        document.body.appendChild(btn);
      }

      // Enter para enviar
      document.getElementById('ecoChatbotInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') chatbot.send();
      });
    },

    toggle() {
      const el = document.getElementById('ecoChatbot');
      const btn = document.getElementById('ecoChatbotBtn');
      if (!el) return;
      const isOpen = el.style.pointerEvents === 'auto';
      el.style.pointerEvents = isOpen ? 'none' : 'auto';
      el.style.transform = isOpen ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)';
      el.style.opacity = isOpen ? '0' : '1';
      if (btn) btn.style.display = isOpen ? 'block' : 'none';
      if (!isOpen) document.getElementById('ecoChatbotInput')?.focus();
    },

    send() {
      const input = document.getElementById('ecoChatbotInput');
      if (!input || !input.value.trim()) return;
      const msg = input.value.trim();
      input.value = '';

      // Agregar mensaje del usuario
      this._addMessage(msg, 'user');

      // Respuesta automática
      setTimeout(() => {
        const response = this._getResponse(msg);
        this._addMessage(response, 'bot');
      }, 500 + Math.random() * 1000);
    },

    _addMessage(text, type) {
      const container = document.getElementById('ecoChatbotMessages');
      if (!container) return;
      const div = document.createElement('div');
      div.style.cssText = `
        display:flex;gap:8px;max-width:85%;
        align-self:${type === 'user' ? 'flex-end' : 'flex-start'};
        animation:ecoFadeIn 0.3s ease;
      `;
      div.innerHTML = type === 'user' ? `
        <div style="background:#2e7d32;color:#fff;padding:10px 14px;border-radius:14px 14px 4px 14px;font-size:0.82rem;line-height:1.6">${text}</div>
        <div style="width:28px;height:28px;border-radius:50%;background:#1565c0;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0">👤</div>
      ` : `
        <div style="width:28px;height:28px;border-radius:50%;background:#2e7d32;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0">🤖</div>
        <div style="background:#e8f5e9;padding:10px 14px;border-radius:14px 14px 14px 4px;font-size:0.82rem;line-height:1.6;color:#1f2a21">${text}</div>
      `;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    },

    _getResponse(msg) {
      const q = msg.toLowerCase();
      if (q.includes('hola') || q.includes('buenas') || q.includes('hey')) {
        return '¡Hola! 🌱 ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre productos, compras, envíos o cualquier duda de EcoMarket.';
      }
      if (q.includes('producto') || q.includes('catálogo') || q.includes('comprar')) {
        return '📦 Tenemos más de 45 productos ecológicos en 6 categorías: Hogar, Accesorios, Higiene, Jardín, Alimentación y Ropa. Puedes verlos todos en la sección "Productos" del menú. ¿Buscas algo en especial?';
      }
      if (q.includes('envío') || q.includes('envio') || q.includes('entrega') || q.includes('demora')) {
        return '🚚 Los envíos dentro de Lima toman 1-2 días hábiles. Para provincias, entre 3-5 días. El envío es GRATIS en pedidos mayores a S/.150. ¿Necesitas más detalles?';
      }
      if (q.includes('pago') || q.includes('tarjeta') || q.includes('yape') || q.includes('plin')) {
        return '💳 Aceptamos tarjetas de crédito/débito (Visa, Mastercard), Yape, Plin y transferencias bancarias. Todos los pagos son 100% seguros.';
      }
      if (q.includes('devolución') || q.includes('devolucion') || q.includes('cambio') || q.includes('reembolso')) {
        return '🔄 Tienes 7 días desde la recepción para solicitar una devolución si el producto no coincide con la descripción. El reembolso se procesa en 3-5 días hábiles.';
      }
      if (q.includes('cuenta') || q.includes('registro') || q.includes('login') || q.includes('sesión')) {
        return '👤 Crear una cuenta es gratis y rápido. Solo necesitas un email y contraseña. Con tu cuenta puedes publicar productos, guardar favoritos y dar seguimiento a tus pedidos.';
      }
      if (q.includes('gracias') || q.includes('ayuda') || q.includes('ok')) {
        return '¡De nada! 🌿 Si tienes más preguntas, aquí estoy para ayudarte. ¡Que tengas un excelente día!';
      }
      if (q.includes('contacto') || q.includes('teléfono') || q.includes('email') || q.includes('whatsapp')) {
        return '📬 Puedes contactarnos por email: hola@ecomarket.com, teléfono: +51 999 888 777, o visitar nuestra página de Contacto. Respondemos en menos de 24 horas.';
      }
      return '🌱 Gracias por tu mensaje. Para ayudarte mejor, puedes:\n\n• Explorar nuestro catálogo de productos\n• Visitar la sección de Preguntas Frecuentes\n• Contactarnos directamente\n\n¿En qué más puedo ayudarte?';
    }
  };

  // ============================================================
  // 2. CENTRO DE AYUDA
  // ============================================================
  const helpCenter = {
    topics: [
      { icon: '📦', title: 'Cómo comprar', desc: 'Guía paso a paso para realizar tu primera compra' },
      { icon: '💰', title: 'Cómo vender', desc: 'Publica tus productos ecológicos y llega a más personas' },
      { icon: '🚚', title: 'Envíos y entregas', desc: 'Información sobre tiempos y costos de envío' },
      { icon: '💳', title: 'Métodos de pago', desc: 'Tarjetas, Yape, Plin y transferencias' },
      { icon: '🔄', title: 'Devoluciones', desc: 'Política de devoluciones y reembolsos' },
      { icon: '👤', title: 'Mi cuenta', desc: 'Gestión de perfil, favoritos y pedidos' },
      { icon: '⭐', title: 'Reseñas', desc: 'Cómo calificar productos y escribir reseñas' },
      { icon: '🔒', title: 'Privacidad', desc: 'Protección de tus datos personales' }
    ],

    render(container) {
      const el = typeof container === 'string' ? document.querySelector(container) : container;
      if (!el) return;
      el.innerHTML = `
        <div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid rgba(46,125,50,0.08)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
            <h3 style="font-size:1.1rem;font-weight:800">📚 Centro de ayuda</h3>
            <input type="text" id="ecoHelpSearch" placeholder="Buscar ayuda..." oninput="EcoUX.helpCenter.filter(this.value)" style="padding:10px 16px;border:1.5px solid rgba(46,125,50,0.18);border-radius:12px;font-family:inherit;font-size:0.85rem;outline:none;width:220px">
          </div>
          <div id="ecoHelpGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
            ${this.topics.map(t => `
              <div class="eco-help-item" data-search="${t.title} ${t.desc}" onclick="EcoUX.helpCenter.openTopic('${t.title}')" style="padding:16px;background:#f4fbf5;border-radius:14px;cursor:pointer;transition:all 0.2s;border:1px solid transparent" onmouseover="this.style.borderColor='rgba(46,125,50,0.2)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='transparent';this.style.transform=''">
                <div style="font-size:2rem;margin-bottom:8px">${t.icon}</div>
                <strong style="font-size:0.88rem">${t.title}</strong>
                <p style="font-size:0.78rem;color:var(--texto-sec);margin-top:4px;line-height:1.5">${t.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    filter(query) {
      document.querySelectorAll('.eco-help-item').forEach(item => {
        const search = item.dataset.search.toLowerCase();
        item.style.display = search.includes(query.toLowerCase()) ? '' : 'none';
      });
    },

    openTopic(title) {
      if (window.EcoToast) EcoToast.info(`📖 Abriendo: ${title}`);
      chatbot.toggle();
      setTimeout(() => {
        chatbot._addMessage(`Quiero información sobre: ${title}`, 'user');
        setTimeout(() => {
          chatbot._addMessage(`Claro! Aquí tienes información sobre "${title}":\n\n🌿 En EcoMarket nos esforzamos por brindarte la mejor experiencia. Para más detalles, visita la sección correspondiente en nuestro sitio web o contáctanos directamente.`, 'bot');
        }, 800);
      }, 300);
    }
  };

  // ============================================================
  // 3. FAQ INTERACTIVO
  // ============================================================
  const faq = {
    items: [
      { q: '¿Cómo publico un producto?', r: 'Regístrate, inicia sesión y ve a "Publicar producto". Completa el formulario con nombre, categoría, precio, descripción e imagen. En minutos tu producto estará visible en el catálogo.' },
      { q: '¿Cuánto cuesta publicar?', r: 'Publicar productos en EcoMarket es completamente GRATIS. No cobramos comisión por publicar. Solo cuando vendas, hay una pequeña comisión del 5% para mantener la plataforma.' },
      { q: '¿Cómo funciona el carrito?', r: 'Agrega productos desde el catálogo haciendo clic en "Agregar al carrito". Puedes revisar tu carrito en cualquier momento y ajustar cantidades. Cuando estés listo, ve a "Finalizar compra".' },
      { q: '¿Qué métodos de pago aceptan?', r: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), Yape, Plin y transferencias bancarias (BCP, Interbank, BBVA).' },
      { q: '¿Cuánto tarda el envío?', r: 'Lima Metropolitana: 1-2 días hábiles. Provincias: 3-5 días hábiles. Envío GRATIS en pedidos mayores a S/.150.' },
      { q: '¿Puedo devolver un producto?', r: 'Sí, tienes 7 días desde la recepción para solicitar una devolución si el producto no coincide con la descripción o llega dañado.' },
      { q: '¿Cómo escribo una reseña?', r: 'Ve a la página del producto, desplázate hasta la sección de reseñas, selecciona tu calificación (1-5 estrellas) y escribe tu comentario.' },
      { q: '¿Es seguro comprar aquí?', r: 'Sí, EcoMarket utiliza conexiones seguras SSL y protegemos tus datos personales. Todos los pagos se procesan de forma segura.' }
    ],

    render(container) {
      const el = typeof container === 'string' ? document.querySelector(container) : container;
      if (!el) return;
      el.innerHTML = `
        <div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid rgba(46,125,50,0.08)">
          <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:20px">❓ Preguntas frecuentes</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${this.items.map((item, i) => `
              <div style="border:1px solid rgba(46,125,50,0.08);border-radius:14px;overflow:hidden">
                <button onclick="EcoUX.faq.toggle(${i})" style="width:100%;padding:14px 18px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--texto);text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px">
                  <span>${item.q}</span>
                  <span id="ecoFaqIcon${i}" style="font-size:0.8rem;color:var(--verde);transition:transform 0.3s">▼</span>
                </button>
                <div id="ecoFaqAnswer${i}" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;padding:0 18px">
                  <p style="font-size:0.85rem;color:var(--texto-sec);line-height:1.7;padding-bottom:16px">${item.r}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    toggle(i) {
      const answer = document.getElementById(`ecoFaqAnswer${i}`);
      const icon = document.getElementById(`ecoFaqIcon${i}`);
      if (!answer) return;
      const isOpen = answer.style.maxHeight !== '0px' && answer.style.maxHeight !== '';
      answer.style.maxHeight = isOpen ? '0' : `${answer.scrollHeight + 20}px`;
      if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  };

  // ============================================================
  // 4. TUTORIAL INTERACTIVO
  // ============================================================
  const tutorial = {
    steps: [],
    currentStep: 0,
    overlay: null,
    tooltip: null,

    start(steps) {
      this.steps = steps || [
        { target: '.eco-navbar', text: '🌱 Este es el menú principal. Aquí puedes navegar entre las secciones de EcoMarket.', position: 'bottom' },
        { target: '[href*="productos"]', text: '📦 Aquí encontrarás nuestro catálogo con más de 45 productos ecológicos.', position: 'bottom' },
        { target: '[href*="carrito"]', text: '🛒 Tus productos agregados aparecerán aquí. Revisa tu carrito antes de comprar.', position: 'bottom' },
        { target: '.eco-navbar-links a:last-child', text: '👤 Inicia sesión o regístrate para publicar productos y guardar favoritos.', position: 'bottom' }
      ];
      this.currentStep = 0;
      this._createOverlay();
      this._showStep(0);
    },

    _createOverlay() {
      if (!this.overlay) {
        this.overlay = document.createElement('div');
        this.overlay.id = 'ecoTutorialOverlay';
        this.overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;pointer-events:none';
        document.body.appendChild(this.overlay);
      }
      if (!this.tooltip) {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'ecoTutorialTooltip';
        this.tooltip.style.cssText = `
          position:fixed;z-index:99999;background:#fff;border-radius:16px;
          padding:20px;box-shadow:0 20px 60px rgba(0,0,0,0.2);
          max-width:360px;font-family:'Poppins',sans-serif;
          border:1px solid rgba(46,125,50,0.12);
        `;
        document.body.appendChild(this.tooltip);
      }
    },

    _showStep(index) {
      if (index >= this.steps.length) {
        this._end();
        return;
      }
      this.currentStep = index;
      const step = this.steps[index];
      const target = document.querySelector(step.target);
      if (!target) { this._next(); return; }

      const rect = target.getBoundingClientRect();
      this.tooltip.innerHTML = `
        <div style="font-size:0.9rem;line-height:1.7;color:var(--texto);margin-bottom:16px">${step.text}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.78rem;color:var(--texto-sec)">Paso ${index + 1} de ${this.steps.length}</span>
          <div style="display:flex;gap:8px">
            <button onclick="EcoUX.tutorial._end()" style="background:none;border:none;color:var(--texto-sec);cursor:pointer;font-size:0.82rem;font-family:inherit">Saltar</button>
            <button onclick="EcoUX.tutorial._next()" style="background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;padding:8px 20px;border-radius:10px;font-weight:700;font-size:0.85rem;cursor:pointer;font-family:inherit">
              ${index < this.steps.length - 1 ? 'Siguiente →' : '✓ Finalizar'}
            </button>
          </div>
        </div>
      `;

      // Posicionar tooltip
      let top, left;
      const pos = step.position || 'bottom';
      if (pos === 'bottom') {
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - 180;
      } else if (pos === 'top') {
        top = rect.top - this.tooltip.offsetHeight - 16;
        left = rect.left + rect.width / 2 - 180;
      }
      top = Math.max(16, Math.min(top, window.innerHeight - 200));
      left = Math.max(16, Math.min(left, window.innerWidth - 380));
      this.tooltip.style.top = `${top}px`;
      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.display = 'block';
    },

    _next() {
      this._showStep(this.currentStep + 1);
    },

    _end() {
      if (this.tooltip) this.tooltip.style.display = 'none';
      if (this.overlay) this.overlay.style.display = 'none';
      if (window.EcoToast) EcoToast.success('🎉 ¡Tutorial completado!');
    }
  };

  // ============================================================
  // 5. BÚSQUEDA INTELIGENTE
  // ============================================================
  const smartSearch = {
    init(inputSelector) {
      const input = document.querySelector(inputSelector || '#searchInput, [type="search"], .eco-search-input');
      if (!input) return;

      const container = document.createElement('div');
      container.id = 'ecoSmartSearch';
      container.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#fff;border-radius:0 0 16px 16px;box-shadow:0 20px 50px rgba(0,0,0,0.12);border:1px solid rgba(46,125,50,0.08);z-index:100;display:none;max-height:400px;overflow-y:auto';
      input.parentNode.style.position = 'relative';
      input.parentNode.appendChild(container);

      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { container.style.display = 'none'; return; }

        try {
          const products = JSON.parse(localStorage.getItem('eco_products_cache') || '[]');
          const results = products.filter(p =>
            (p.nombre || p.name || '').toLowerCase().includes(q) ||
            (p.categoria || p.category || '').toLowerCase().includes(q) ||
            (p.descripcion || '').toLowerCase().includes(q)
          ).slice(0, 6);

          if (results.length === 0) {
            container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--texto-sec);font-size:0.85rem">🔍 No se encontraron resultados para "${q}"</div>`;
          } else {
            container.innerHTML = results.map(p => `
              <div onclick="window.location.href='detalle-producto.html?id=${p.id}'" style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background='#f4fbf5'" onmouseout="this.style.background=''">
                <span style="font-size:1.8rem">${p.emoji || '📦'}</span>
                <div style="flex:1;min-width:0">
                  <strong style="font-size:0.85rem">${p.nombre || p.name || 'Producto'}</strong>
                  <div style="font-size:0.75rem;color:var(--texto-sec)">${p.categoria || p.category || ''} • S/. ${(p.precio || p.price || 0).toFixed(2)}</div>
                </div>
                <span style="font-weight:700;color:var(--verde);font-size:0.9rem">S/. ${(p.precio || p.price || 0).toFixed(2)}</span>
              </div>
            `).join('');
          }
          container.style.display = 'block';
        } catch { container.style.display = 'none'; }
      });

      input.addEventListener('blur', () => setTimeout(() => { container.style.display = 'none'; }, 200));
      input.addEventListener('focus', () => { if (input.value.trim().length >= 2) container.style.display = 'block'; });
    }
  };

  // ============================================================
  // 6. BÚSQUEDA POR VOZ
  // ============================================================
  const voiceSearch = {
    isListening: false,
    recognition: null,

    init(buttonSelector, inputSelector) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Voice search not supported');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-PE';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.querySelector(inputSelector || '#searchInput, [type="search"]');
        if (input) {
          input.value = transcript;
          input.dispatchEvent(new Event('input'));
          if (window.EcoToast) EcoToast.success(`🔊 Buscando: "${transcript}"`);
        }
        this.isListening = false;
        this._updateButton(buttonSelector);
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        this._updateButton(buttonSelector);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this._updateButton(buttonSelector);
      };

      const btn = document.querySelector(buttonSelector || '#voiceSearchBtn');
      if (btn) {
        btn.addEventListener('click', () => this.toggle(buttonSelector));
        btn.title = 'Buscar por voz';
      }
    },

    toggle(buttonSelector) {
      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      } else {
        this.recognition.start();
        this.isListening = true;
      }
      this._updateButton(buttonSelector);
    },

    _updateButton(buttonSelector) {
      const btn = document.querySelector(buttonSelector || '#voiceSearchBtn');
      if (!btn) return;
      btn.innerHTML = this.isListening ? '🔴' : '🎤';
      btn.style.background = this.isListening ? '#e53935' : 'rgba(46,125,50,0.1)';
      btn.style.animation = this.isListening ? 'ecoPulse 1s infinite' : 'none';
    }
  };

  // ============================================================
  // 7-9. NOTIFICACIONES, CONFIRMACIONES, TOAST ELEGANTES
  // ============================================================
  const notifications = {
    show(title, message, type = 'info', duration = 4000) {
      const colors = {
        success: { bg: '#2e7d32', icon: '✅' },
        error: { bg: '#b91c1c', icon: '❌' },
        warning: { bg: '#d97706', icon: '⚠️' },
        info: { bg: '#1565c0', icon: 'ℹ️' },
        eco: { bg: '#2e7d32', icon: '🌿' }
      };
      const color = colors[type] || colors.info;

      let container = document.getElementById('ecoNotificationsContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'ecoNotificationsContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:360px';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.style.cssText = `
        background:${color.bg};color:#fff;padding:14px 18px;border-radius:14px;
        display:flex;align-items:flex-start;gap:10px;
        box-shadow:0 12px 32px rgba(0,0,0,0.15);
        transform:translateX(120%);opacity:0;
        transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);
        position:relative;overflow:hidden;
      `;
      toast.innerHTML = `
        <span style="font-size:1.2rem;flex-shrink:0">${color.icon}</span>
        <div style="flex:1;min-width:0">
          <strong style="font-size:0.85rem;display:block;margin-bottom:2px">${title}</strong>
          <div style="font-size:0.78rem;opacity:0.9;line-height:1.5">${message}</div>
        </div>
        <button onclick="this.parentElement.style.transform='translateX(120%)';this.parentElement.style.opacity='0';setTimeout(()=>this.parentElement.remove(),400)" style="background:none;border:none;color:#fff;cursor:pointer;font-size:0.9rem;opacity:0.7;flex-shrink:0;padding:0">✕</button>
        <div style="position:absolute;bottom:0;left:0;height:3px;background:rgba(255,255,255,0.3);width:100%;transform-origin:left;animation:ecoShrink ${duration}ms linear forwards"></div>
      `;
      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });

      setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, duration);
    },

    confirm(title, message, options = {}) {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99999;display:flex;align-items:center;justify-content:center;animation:ecoFadeIn 0.2s ease';
        
        const box = document.createElement('div');
        box.style.cssText = `
          background:#fff;border-radius:24px;padding:32px;max-width:400px;width:90%;
          box-shadow:0 30px 80px rgba(0,0,0,0.2);text-align:center;
          transform:scale(0.9);animation:ecoScaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
          font-family:'Poppins',sans-serif;
        `;
        box.innerHTML = `
          <div style="font-size:3rem;margin-bottom:16px">${options.icon || 'ℹ️'}</div>
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:8px">${title}</h3>
          <p style="font-size:0.9rem;color:var(--texto-sec);line-height:1.7;margin-bottom:24px">${message}</p>
          <div style="display:flex;gap:12px;justify-content:center">
            <button id="ecoConfirmCancel" style="padding:11px 24px;border-radius:12px;border:1.5px solid rgba(46,125,50,0.2);background:#fff;color:var(--texto);font-family:inherit;font-weight:600;font-size:0.9rem;cursor:pointer">${options.cancelText || 'Cancelar'}</button>
            <button id="ecoConfirmOk" style="padding:11px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;font-family:inherit;font-weight:700;font-size:0.9rem;cursor:pointer">${options.confirmText || 'Confirmar'}</button>
          </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        document.getElementById('ecoConfirmOk').onclick = () => { overlay.remove(); resolve(true); };
        document.getElementById('ecoConfirmCancel').onclick = () => { overlay.remove(); resolve(false); };
        overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
      });
    }
  };

  // ============================================================
  // 10. MODO LECTURA
  // ============================================================
  const readingMode = {
    active: false,

    toggle() {
      this.active = !this.active;
      document.body.classList.toggle('eco-reading-mode', this.active);
      
      if (this.active) {
        const style = document.createElement('style');
        style.id = 'ecoReadingStyle';
        style.textContent = `
          .eco-reading-mode {
            background: #faf6f0 !important;
            color: #2d2d2d !important;
          }
          .eco-reading-mode p, .eco-reading-mode .detalle-info p {
            font-size: 1.1rem !important;
            line-height: 2 !important;
            max-width: 700px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .eco-reading-mode h1, .eco-reading-mode h2, .eco-reading-mode h3 {
            max-width: 700px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .eco-reading-mode img {
            max-width: 700px !important;
            display: block !important;
            margin: 0 auto !important;
          }
          .eco-reading-mode .header,
          .eco-reading-mode .footer,
          .eco-reading-mode nav,
          .eco-reading-mode .sidebar {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
        if (window.EcoToast) EcoToast.info('📖 Modo lectura activado');
      } else {
        document.getElementById('ecoReadingStyle')?.remove();
        if (window.EcoToast) EcoToast.info('📖 Modo lectura desactivado');
      }
    }
  };

  // ============================================================
  // 11. MODO AHORRO
  // ============================================================
  const powerSaveMode = {
    active: false,

    toggle() {
      this.active = !this.active;
      document.body.classList.toggle('eco-power-save', this.active);
      
      if (this.active) {
        const style = document.createElement('style');
        style.id = 'ecoPowerStyle';
        style.textContent = `
          .eco-power-save * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
          }
          .eco-power-save img:not([src*="logo"]) {
            opacity: 0.7;
          }
          .eco-power-save .eco-loader,
          .eco-power-save .eco-shimmer,
          .eco-power-save .eco-pulse,
          .eco-power-save .eco-float {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
        if (window.EcoToast) EcoToast.info('🔋 Modo ahorro activado');
      } else {
        document.getElementById('ecoPowerStyle')?.remove();
        if (window.EcoToast) EcoToast.info('🔋 Modo ahorro desactivado');
      }
    }
  };

  // ============================================================
  // 12-13. SCROLL SUAVE + BOTÓN VOLVER ARRIBA
  // ============================================================
  const initSmoothScroll = () => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Botón volver arriba
    if (!document.getElementById('ecoBackToTop')) {
      const btn = document.createElement('button');
      btn.id = 'ecoBackToTop';
      btn.innerHTML = '↑';
      btn.style.cssText = `
        position:fixed;bottom:150px;right:20px;z-index:9996;
        width:44px;height:44px;border-radius:50%;
        background:linear-gradient(135deg,#4caf50,#2e7d32);
        color:#fff;border:none;font-size:1.2rem;cursor:pointer;
        box-shadow:0 8px 24px rgba(46,125,50,0.3);
        transform:translateY(80px);opacity:0;
        transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        display:flex;align-items:center;justify-content:center;
      `;
      btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.appendChild(btn);

      window.addEventListener('scroll', () => {
        const show = window.scrollY > 300;
        btn.style.transform = show ? 'translateY(0)' : 'translateY(80px)';
        btn.style.opacity = show ? '1' : '0';
        btn.style.pointerEvents = show ? 'auto' : 'none';
      });
    }
  };

  // ============================================================
  // 14. MENÚ FLOTANTE
  // ============================================================
  const floatingMenu = {
    init() {
      if (document.getElementById('ecoFloatingMenu')) return;

      const items = [
        { icon: '🏠', label: 'Inicio', action: () => window.location.href = 'index.html' },
        { icon: '📦', label: 'Productos', action: () => window.location.href = 'productos.html' },
        { icon: '❤️', label: 'Favoritos', action: () => window.location.href = 'favoritos.html' },
        { icon: '🛒', label: 'Carrito', action: () => window.location.href = 'carrito.html' },
        { icon: '👤', label: 'Perfil', action: () => window.location.href = 'perfil.html' }
      ];

      const container = document.createElement('div');
      container.id = 'ecoFloatingMenu';
      container.style.cssText = `
        position:fixed;left:16px;top:50%;transform:translateY(-50%);z-index:9995;
        display:flex;flex-direction:column;gap:6px;
      `;

      items.forEach(item => {
        const btn = document.createElement('button');
        btn.innerHTML = item.icon;
        btn.title = item.label;
        btn.style.cssText = `
          width:44px;height:44px;border-radius:14px;
          background:#fff;border:1px solid rgba(46,125,50,0.1);
          color:var(--texto);font-size:1.1rem;cursor:pointer;
          box-shadow:0 4px 16px rgba(0,0,0,0.06);
          transition:all 0.2s;display:flex;align-items:center;justify-content:center;
          position:relative;
        `;
        btn.onmouseover = () => {
          btn.style.transform = 'scale(1.1)';
          btn.style.background = '#e8f5e9';
          btn.style.borderColor = '#2e7d32';
        };
        btn.onmouseout = () => {
          btn.style.transform = 'scale(1)';
          btn.style.background = '#fff';
          btn.style.borderColor = 'rgba(46,125,50,0.1)';
        };
        btn.onclick = item.action;
        container.appendChild(btn);
      });

      document.body.appendChild(container);

      // Ocultar en móvil
      if (window.innerWidth < 768) container.style.display = 'none';
    }
  };

  // ============================================================
  // 15. ACCESIBILIDAD MEJORADA
  // ============================================================
  const initAccessibility = () => {
    // Skip link
    if (!document.getElementById('ecoSkipLink')) {
      const skip = document.createElement('a');
      skip.id = 'ecoSkipLink';
      skip.href = '#main-content';
      skip.textContent = 'Saltar al contenido principal';
      skip.style.cssText = 'position:absolute;top:-40px;left:0;background:#2e7d32;color:#fff;padding:8px 16px;z-index:99999;transition:top 0.2s;font-family:Poppins,sans-serif;font-size:0.85rem;text-decoration:none';
      skip.onfocus = function() { this.style.top = '0'; };
      skip.onblur = function() { this.style.top = '-40px'; };
      document.body.insertBefore(skip, document.body.firstChild);
    }

    // ARIA labels
    document.querySelectorAll('button:not([aria-label]):not([title])').forEach(btn => {
      const text = btn.textContent.trim() || btn.innerHTML.replace(/<[^>]*>/g, '').trim();
      if (text) btn.setAttribute('aria-label', text.substring(0, 50));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.show, .success-overlay.show').forEach(m => m.classList.remove('show'));
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        document.querySelector('input[type="text"], input[type="search"]')?.focus();
      }
    });

    // Font size controls
    if (!document.getElementById('ecoFontControls')) {
      const controls = document.createElement('div');
      controls.id = 'ecoFontControls';
      controls.style.cssText = 'position:fixed;bottom:150px;left:16px;z-index:9995;display:flex;flex-direction:column;gap:4px';
      controls.innerHTML = `
        <button onclick="document.body.style.fontSize=parseInt(getComputedStyle(document.body).fontSize)+2+'px'" title="Aumentar texto" style="width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid rgba(46,125,50,0.1);cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center">A+</button>
        <button onclick="document.body.style.fontSize=parseInt(getComputedStyle(document.body).fontSize)-2+'px'" title="Disminuir texto" style="width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid rgba(46,125,50,0.1);cursor:pointer;font-size:0.85rem;display:flex;align-items:center;justify-content:center">A-</button>
        <button onclick="document.body.style.fontSize=''" title="Restablecer texto" style="width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid rgba(46,125,50,0.1);cursor:pointer;font-size:0.75rem;display:flex;align-items:center;justify-content:center">↺</button>
      `;
      document.body.appendChild(controls);
    }
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    // Inicializar chatbot
    chatbot.init();

    // Inicializar scroll suave y botón arriba
    initSmoothScroll();

    // Inicializar menú flotante
    floatingMenu.init();

    // Inicializar accesibilidad
    initAccessibility();

    // Inicializar búsqueda inteligente
    smartSearch.init();

    // Inicializar búsqueda por voz
    voiceSearch.init();

    // Auto-renderizar componentes
    document.querySelectorAll('[data-eco-help]').forEach(el => helpCenter.render(el));
    document.querySelectorAll('[data-eco-faq]').forEach(el => faq.render(el));
    document.querySelectorAll('[data-eco-tutorial]').forEach(el => {
      el.addEventListener('click', () => tutorial.start());
    });
    document.querySelectorAll('[data-eco-reading]').forEach(el => {
      el.addEventListener('click', () => readingMode.toggle());
    });
    document.querySelectorAll('[data-eco-powersave]').forEach(el => {
      el.addEventListener('click', () => powerSaveMode.toggle());
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    chatbot,
    helpCenter,
    faq,
    tutorial,
    smartSearch,
    voiceSearch,
    notifications,
    readingMode,
    powerSaveMode,
    initSmoothScroll,
    floatingMenu,
    initAccessibility
  };
})();

window.EcoUX = EcoUX;