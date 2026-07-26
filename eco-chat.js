/**
 * eco-chat.js — Sistema de mensajería entre comprador y vendedor
 * Comunicación en tiempo real con almacenamiento local y notificaciones
 * 
 * Incluir: <script src="eco-chat.js"></script>
 */
const EcoChat = (() => {
  const KEY = 'eco_chat_messages';

  // ── Datos ──────────────────────────────────────────────
  const getConversations = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  };

  const saveConversations = (data) => {
    localStorage.setItem(KEY, JSON.stringify(data));
  };

  const getMessages = (conversationId) => {
    const convs = getConversations();
    return convs[conversationId] || [];
  };

  const sendMessage = (conversationId, data) => {
    const convs = getConversations();
    if (!convs[conversationId]) convs[conversationId] = [];
    convs[conversationId].push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      conversationId,
      from: data.from || 'usuario',
      to: data.to || 'vendedor',
      text: data.text || '',
      timestamp: Date.now(),
      read: false
    });
    if (convs[conversationId].length > 100) convs[conversationId].shift();
    saveConversations(convs);

    // Notificar
    if (window.EcoNotifications) {
      EcoNotifications.add(
        `💬 Nuevo mensaje de ${data.from === 'usuario' ? 'ti' : data.to}`,
        data.text?.substring(0, 60) || 'Sin contenido',
        { type: 'info', icon: '💬', timeout: 6000 }
      );
    }
    return true;
  };

  const markAsRead = (conversationId) => {
    const convs = getConversations();
    if (convs[conversationId]) {
      convs[conversationId].forEach(m => m.read = true);
      saveConversations(convs);
    }
  };

  const getUnreadCount = (conversationId) => {
    const msgs = getMessages(conversationId);
    return msgs.filter(m => !m.read).length;
  };

  const getAllUnread = () => {
    const convs = getConversations();
    let total = 0;
    Object.keys(convs).forEach(id => {
      total += convs[id].filter(m => !m.read).length;
    });
    return total;
  };

  // ── UI: Ventana de chat ────────────────────────────────
  const openChat = (conversationId, participantName, productName) => {
    let container = document.getElementById('ecoChatContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ecoChatContainer';
      container.style.cssText = `
        position:fixed;bottom:20px;right:20px;z-index:10000;
        font-family:'Poppins',sans-serif;
        display:flex;flex-direction:column;align-items:flex-end;gap:10px;
      `;
      document.body.appendChild(container);
    }

    // Botón flotante
    let btn = document.getElementById('ecoChatBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'ecoChatBtn';
      btn.style.cssText = `
        width:56px;height:56px;border-radius:50%;
        background:linear-gradient(135deg,#4caf50,#2e7d32);
        color:#fff;border:none;font-size:1.4rem;cursor:pointer;
        box-shadow:0 8px 24px rgba(46,125,50,0.35);
        transition:transform 0.2s;
      `;
      btn.innerHTML = '💬';
      btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
      btn.onmouseout = () => btn.style.transform = 'scale(1)';
      btn.onclick = () => toggleChat(conversationId, participantName, productName);
      container.appendChild(btn);
    }

    // Ventana de chat
    let window = document.getElementById('ecoChatWindow');
    if (!window) {
      window = document.createElement('div');
      window.id = 'ecoChatWindow';
      window.style.cssText = `
        display:none;width:360px;height:480px;
        background:#fff;border-radius:20px;
        box-shadow:0 24px 60px rgba(0,0,0,0.18);
        border:1px solid rgba(46,125,50,0.12);
        overflow:hidden;flex-direction:column;
      `;
      container.insertBefore(window, btn);
    }

    // Renderizar
    renderChat(conversationId, participantName, productName);
  };

  const renderChat = (conversationId, participantName, productName) => {
    const w = document.getElementById('ecoChatWindow');
    if (!w) return;

    const msgs = getMessages(conversationId);
    markAsRead(conversationId);

    w.style.display = 'flex';
    w.innerHTML = `
      <div style="padding:16px 18px;border-bottom:1px solid rgba(46,125,50,0.1);display:flex;align-items:center;gap:10px;background:#f4fbf5">
        <div style="width:36px;height:36px;border-radius:50%;background:#2e7d32;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem">${participantName[0]}</div>
        <div style="flex:1">
          <strong style="font-size:0.88rem">${participantName}</strong>
          <div style="font-size:0.72rem;color:#5d6a5f">${productName || 'Producto'}</div>
        </div>
        <button onclick="document.getElementById('ecoChatWindow').style.display='none'" style="background:none;border:none;color:#5d6a5f;cursor:pointer;font-size:1.2rem;padding:4px">✕</button>
      </div>
      <div id="ecoChatMessages" style="flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px">
        ${msgs.length === 0 ? '<div style="text-align:center;padding:40px 16px;color:#5d6a5f;font-size:0.85rem">💬 Inicia la conversación<br><span style="font-size:0.78rem">Pregunta sobre el producto</span></div>' : ''}
        ${msgs.map(m => `
          <div style="display:flex;flex-direction:column;align-items:${m.from === 'usuario' ? 'flex-end' : 'flex-start'};max-width:85%;align-self:${m.from === 'usuario' ? 'flex-end' : 'flex-start'}">
            <div style="background:${m.from === 'usuario' ? '#2e7d32' : '#e8f5e9'};color:${m.from === 'usuario' ? '#fff' : '#1f2a21'};padding:10px 14px;border-radius:${m.from === 'usuario' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};font-size:0.85rem;line-height:1.6">${m.text}</div>
            <span style="font-size:0.65rem;color:#5d6a5f;margin-top:3px">${new Date(m.timestamp).toLocaleString('es', {hour:'2-digit',minute:'2-digit'})}</span>
          </div>
        `).join('')}
      </div>
      <div style="padding:12px 16px;border-top:1px solid rgba(46,125,50,0.1);display:flex;gap:8px;background:#fff">
        <input id="ecoChatInput" placeholder="Escribe un mensaje..." style="flex:1;padding:10px 14px;border:1.5px solid rgba(46,125,50,0.18);border-radius:12px;font-family:inherit;font-size:0.85rem;outline:none">
        <button onclick="EcoChat._sendFromInput('${conversationId}')" style="width:40px;height:40px;border-radius:12px;border:none;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">➤</button>
      </div>
    `;

    // Scroll al último mensaje
    const msgsContainer = document.getElementById('ecoChatMessages');
    if (msgsContainer) msgsContainer.scrollTop = msgsContainer.scrollHeight;

    // Enter para enviar
    const input = document.getElementById('ecoChatInput');
    if (input) {
      input.focus();
      input.onkeydown = (e) => {
        if (e.key === 'Enter') EcoChat._sendFromInput(conversationId);
      };
    }
  };

  const _sendFromInput = (conversationId) => {
    const input = document.getElementById('ecoChatInput');
    if (!input || !input.value.trim()) return;
    const user = window.EcoAuth?.getUser();
    sendMessage(conversationId, {
      from: 'usuario',
      to: 'vendedor',
      text: input.value.trim()
    });
    input.value = '';
    // Re-renderizar
    const name = document.querySelector('#ecoChatWindow strong')?.textContent || 'Vendedor';
    const prod = document.querySelector('#ecoChatWindow div[style*="font-size:0.72rem"]')?.textContent || '';
    renderChat(conversationId, name, prod);
  };

  const toggleChat = (conversationId, participantName, productName) => {
    const w = document.getElementById('ecoChatWindow');
    if (w && w.style.display === 'flex') {
      w.style.display = 'none';
    } else {
      renderChat(conversationId || 'general', participantName || 'Vendedor', productName || 'Producto');
    }
  };

  // ── Init ────────────────────────────────────────────────
  const init = () => {
    // Botón de chat global
    if (!document.getElementById('ecoChatContainer')) {
      openChat('general', 'Soporte EcoMarket', '');
    }
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return {
    sendMessage, getMessages, getUnreadCount, getAllUnread,
    openChat, toggleChat, _sendFromInput
  };
})();

window.EcoChat = EcoChat;