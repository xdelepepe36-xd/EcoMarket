/**
 * eco-chat.js - Chatbot inteligente para EcoMarket
 * Asistente virtual para ayudar a los usuarios
 */
const EcoChat = (() => {
  let isOpen = false;
  let messages = [];

  const RESPONSES = {
    'hola': '¡Hola! 🌱 Soy el asistente de EcoMarket. ¿En qué puedo ayudarte?',
    'ayuda': 'Claro, puedo ayudarte con:\n• Buscar productos ecológicos\n• Información sobre envíos\n• Cómo publicar productos\n• Cupones y descuentos\n• Seguimiento de pedidos',
    'producto': 'Puedes explorar nuestro catálogo en la sección "Productos" o usar el buscador. Tenemos: Hogar, Accesorios, Higiene, Jardín, Alimentación y Ropa.',
    'envio': '🚚 Ofrecemos envíos a todo Perú. El tiempo estimado es de 3-7 días hábiles. Los envíos son gratuitos en compras mayores a S/.80.',
    'publicar': '📦 Para publicar un producto: 1. Crea una cuenta 2. Ve a "Publicar" 3. Completa los datos 4. ¡Listo! Recibirás XP por cada publicación.',
    'cupon': '🎫 Usa estos cupones:\n• ECO10 - 10% OFF (mín. S/.30)\n• ECO20 - 20% OFF (mín. S/.80)\n• ENVIOFREE - Envío gratis\n• BIENVENIDO - S/.15 OFF',
    'pago': '💳 Aceptamos: Tarjeta de crédito/débito, PayPal y transferencia bancaria. Todos los pagos son 100% seguros.',
    'devolucion': '🔄 Tienes 30 días para devoluciones. Los productos deben estar en su estado original. Contacta a soporte para iniciar el proceso.',
    'contacto': '📧 Puedes contactarnos:\n• Email: hola@ecomarket.com\n• Tel: +51 999 888 777\n• Horario: Lun-Sáb 9am-6pm',
    'gracias': '¡De nada! 🌿 Si necesitas algo más, aquí estoy. ¡Feliz compra ecológica!',
    'adios': '¡Hasta luego! 🌱 Recuerda que cada compra cuenta para el planeta.',
    'default': 'No entendí bien. Puedes preguntarme sobre: productos, envíos, publicaciones, cupones, pagos, devoluciones o contacto. 😊'
  };

  const getResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hey')) return RESPONSES.hola;
    if (lower.includes('ayuda') || lower.includes('puedes')) return RESPONSES.ayuda;
    if (lower.includes('producto') || lower.includes('catalogo') || lower.includes('comprar')) return RESPONSES.producto;
    if (lower.includes('envio') || lower.includes('entrega') || lower.includes('demora')) return RESPONSES.envio;
    if (lower.includes('publicar') || lower.includes('vender')) return RESPONSES.publicar;
    if (lower.includes('cupon') || lower.includes('descuento') || lower.includes('oferta')) return RESPONSES.cupon;
    if (lower.includes('pago') || lower.includes('tarjeta') || lower.includes('paypal')) return RESPONSES.pago;
    if (lower.includes('devolucion') || lower.includes('reembolso') || lower.includes('cambio')) return RESPONSES.devolucion;
    if (lower.includes('contacto') || lower.includes('soporte') || lower.includes('telefono')) return RESPONSES.contacto;
    if (lower.includes('gracias') || lower.includes('thanks')) return RESPONSES.gracias;
    if (lower.includes('adios') || lower.includes('chao') || lower.includes('bye')) return RESPONSES.adios;
    return RESPONSES.default;
  };

  const toggle = () => {
    isOpen = !isOpen;
    const el = document.getElementById('ecoChatWidget');
    if (el) {
      el.style.display = isOpen ? 'flex' : 'none';
      if (isOpen && messages.length === 0) {
        addMessage('bot', '🌱 ¡Hola! Soy EcoBot, tu asistente ecológico. ¿En qué puedo ayudarte?');
      }
    }
  };

  const addMessage = (type, text) => {
    messages.push({ type, text });
    const container = document.getElementById('ecoChatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = `display:flex;${type === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin-bottom:8px`;
    div.innerHTML = `
      <div style="max-width:80%;padding:10px 14px;border-radius:${type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
        background:${type === 'user' ? 'linear-gradient(135deg,#4caf50,#2e7d32)' : '#f0f7f0'};
        color:${type === 'user' ? '#fff' : '#1f2a21'};font-size:0.85rem;line-height:1.6;white-space:pre-wrap">
        ${text}
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  };

  const send = () => {
    const input = document.getElementById('ecoChatInput');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    addMessage('user', text);
    setTimeout(() => {
      const response = getResponse(text);
      addMessage('bot', response);
    }, 500 + Math.random() * 500);
  };

  const init = () => {
    // Create chat widget
    const existing = document.getElementById('ecoChatWidget');
    if (existing) return;

    const btn = document.createElement('button');
    btn.id = 'ecoChatBtn';
    btn.innerHTML = '<i class="bi bi-chat-dots"></i>';
    btn.style.cssText = `
      position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;
      background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;
      font-size:1.5rem;cursor:pointer;box-shadow:0 8px 24px rgba(46,125,50,0.3);
      z-index:9999;display:flex;align-items:center;justify-content:center;
      transition:all 0.3s;
    `;
    btn.onmouseover = () => { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = toggle;
    document.body.appendChild(btn);

    const widget = document.createElement('div');
    widget.id = 'ecoChatWidget';
    widget.style.cssText = `
      position:fixed;bottom:90px;right:24px;width:360px;height:500px;
      background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);
      z-index:9998;display:none;flex-direction:column;overflow:hidden;
      border:1px solid rgba(46,125,50,0.1);
    `;
    widget.innerHTML = `
      <div style="background:linear-gradient(135deg,#1b5e20,#2e7d32);color:#fff;padding:16px 20px;display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.2rem">🌱</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:0.9rem">EcoBot</div>
          <div style="font-size:0.75rem;opacity:0.8">Asistente ecológico</div>
        </div>
        <button onclick="EcoChat.toggle()" style="background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer"><i class="bi bi-x-lg"></i></button>
      </div>
      <div id="ecoChatMessages" style="flex:1;overflow-y:auto;padding:16px;background:#fafcfa"></div>
      <div style="padding:12px 16px;border-top:1px solid rgba(46,125,50,0.1);display:flex;gap:8px;background:#fff">
        <input id="ecoChatInput" type="text" placeholder="Escribe un mensaje..." 
          style="flex:1;padding:10px 14px;border:1.5px solid rgba(46,125,50,0.18);border-radius:12px;font-family:inherit;font-size:0.85rem;outline:none"
          onkeydown="if(event.key==='Enter')EcoChat.send()">
        <button onclick="EcoChat.send()" style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;border:none;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center">
          <i class="bi bi-send"></i>
        </button>
      </div>
    `;
    document.body.appendChild(widget);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggle, send };
})();

window.EcoChat = EcoChat;