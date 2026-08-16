/**
 * eco-chatgpt.js - Chat estilo ChatGPT para EcoMarket
 * 
 * Funcionalidades:
 * - Efecto de escritura letra por letra (typewriter effect)
 * - Respuestas dinámicas del backend
 * - Historial de conversación
 * - Quick replies dinámicos
 * - Indicador "escribiendo..."
 * - Bilingüe ES/EN
 * - Soporte para código y formato
 */

class EcoChatGPT {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/chat',
            typingSpeed: options.typingSpeed || 30, // ms por carácter
            enableHistory: options.enableHistory !== false,
            enableSound: options.enableSound !== false,
            maxHistory: options.maxHistory || 50,
            storageKey: options.storageKey || 'ecomarket_chat_history',
            ...options
        };
        
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.conversationId = null;
        
        this.init();
    }
    
    init() {
        this.createChatUI();
        this.loadHistory();
        this.setupEventListeners();
        
        // Mensaje de bienvenida
        setTimeout(() => {
            this.addBotMessage(this.getWelcomeMessage());
        }, 500);
    }
    
    createChatUI() {
        const container = document.querySelector('[data-eco-chatgpt]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-chatgpt-container">
                <div class="eco-chatgpt-header">
                    <div class="eco-chatgpt-info">
                        <div class="eco-chatgpt-avatar">
                            <i class="bi bi-robot"></i>
                        </div>
                        <div class="eco-chatgpt-details">
                            <h3>EcoBot IA</h3>
                            <div class="eco-chatgpt-status" data-chat-status>
                                <span class="status-dot"></span>
                                <span class="status-text">En línea</span>
                            </div>
                        </div>
                    </div>
                    <div class="eco-chatgpt-actions">
                        <button class="eco-btn-icon" data-clear-chat title="Limpiar chat">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="eco-btn-icon" data-close-chat title="Cerrar">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
                
                <div class="eco-chatgpt-messages" data-chat-messages>
                    <!-- Los mensajes se renderizarán aquí -->
                </div>
                
                <div class="eco-chatgpt-typing" data-chat-typing style="display: none;">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">EcoBot está escribiendo...</span>
                </div>
                
                <div class="eco-chatgpt-quick-replies" data-quick-replies>
                    <!-- Las sugerencias se renderizarán aquí -->
                </div>
                
                <div class="eco-chatgpt-input">
                    <textarea 
                        data-chat-input 
                        placeholder="Escribe tu mensaje..." 
                        rows="1"
                        data-auto-resize
                    ></textarea>
                    <button class="eco-send-btn" data-send-btn>
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.messagesContainer = container.querySelector('[data-chat-messages]');
        this.inputContainer = container.querySelector('[data-chat-input]');
        this.sendBtn = container.querySelector('[data-send-btn]');
        this.typingIndicator = container.querySelector('[data-chat-typing]');
        this.quickRepliesContainer = container.querySelector('[data-quick-replies]');
    }
    
    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        this.inputContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.inputContainer.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        // Botón de limpiar
        this.sendBtn.parentElement.querySelector('[data-clear-chat]')?.addEventListener('click', () => {
            this.clearChat();
        });
        
        // Botón de cerrar
        this.sendBtn.parentElement.querySelector('[data-close-chat]')?.addEventListener('click', () => {
            this.closeChat();
        });
        
        // Quick replies
        this.quickRepliesContainer.addEventListener('click', (e) => {
            if (e.target.dataset.quickReply) {
                this.inputContainer.value = e.target.dataset.quickReply;
                this.sendMessage();
            }
        });
    }
    
    async sendMessage() {
        const message = this.inputContainer.value.trim();
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addUserMessage(message);
        this.inputContainer.value = '';
        this.autoResizeTextarea();
        
        // Mostrar indicador de escritura
        this.showTypingIndicator();
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: this.conversationId,
                    history: this.messages.slice(-10) // Últimos 10 mensajes para contexto
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.conversationId = data.conversation_id;
                this.hideTypingIndicator();
                
                // Efecto de escritura letra por letra
                await this.typeWriterEffect(data.response);
                
                // Mostrar quick replies si están disponibles
                if (data.quick_replies && data.quick_replies.length > 0) {
                    this.showQuickReplies(data.quick_replies);
                }
            } else {
                this.hideTypingIndicator();
                this.addBotMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            this.hideTypingIndicator();
            
            // Fallback a respuestas locales si hay error de conexión
            this.handleLocalResponse(message);
        }
    }
    
    async typeWriterEffect(text) {
        this.isTyping = true;
        const messageElement = this.addBotMessage('', true); // Mensaje vacío inicial
        
        let currentText = '';
        const chars = text.split('');
        
        for (let i = 0; i < chars.length; i++) {
            currentText += chars[i];
            messageElement.querySelector('.eco-message-text').textContent = currentText;
            messageElement.querySelector('.eco-message-text').scrollTop = messageElement.querySelector('.eco-message-text').scrollHeight;
            
            // Pausa variable para simular escritura natural
            const delay = this.options.typingSpeed + (Math.random() * 20 - 10);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.isTyping = false;
        
        // Guardar en historial
        if (this.options.enableHistory) {
            this.messages.push({
                role: 'assistant',
                content: text,
                timestamp: new Date().toISOString()
            });
            this.saveHistory();
        }
    }
    
    addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'eco-chat-message eco-user-message';
        messageElement.innerHTML = `
            <div class="eco-message-content">
                <div class="eco-message-text">${this.escapeHtml(text)}</div>
                <div class="eco-message-time">${this.formatTime(new Date())}</div>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        if (this.options.enableHistory) {
            this.messages.push({
                role: 'user',
                content: text,
                timestamp: new Date().toISOString()
            });
            this.saveHistory();
        }
    }
    
    addBotMessage(text, isTyping = false) {
        const messageElement = document.createElement('div');
        messageElement.className = 'eco-chat-message eco-bot-message';
        messageElement.innerHTML = `
            <div class="eco-message-content">
                <div class="eco-message-text">${isTyping ? '' : this.formatMessage(text)}</div>
                ${!isTyping ? `<div class="eco-message-time">${this.formatTime(new Date())}</div>` : ''}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement;
    }
    
    formatMessage(text) {
        // Formatear negrita
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Formatear código
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Formatear listas
        text = text.replace(/^• (.*)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Formatear emojis
        text = text.replace(/([🌱🎒🧴🌻🥗👕🚚📦🎫💳👤♻️💡🤖✨])/g, '<span class="eco-emoji">$1</span>');
        
        // Formatear saltos de línea
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    showQuickReplies(replies) {
        this.quickRepliesContainer.innerHTML = `
            <div class="eco-quick-replies">
                ${replies.map(reply => `
                    <button class="eco-quick-reply" data-quick-reply="${reply}">
                        ${reply}
                    </button>
                `).join('')}
            </div>
        `;
        
        this.quickRepliesContainer.style.display = 'flex';
    }
    
    hideQuickReplies() {
        this.quickRepliesContainer.style.display = 'none';
    }
    
    handleLocalResponse(message) {
        // Respuestas locales básicas como fallback
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
            response = this.getWelcomeMessage();
        } else if (lowerMessage.includes('producto') || lowerMessage.includes('catálogo')) {
            response = 'Puedo ayudarte a buscar productos. ¿Qué categoría te interesa? Tenemos Hogar, Accesorios, Higiene, Jardín, Alimentación y Ropa.';
        } else if (lowerMessage.includes('envío') || lowerMessage.includes('envio')) {
            response = '🚚 Enviamos a todo Perú en 3-7 días hábiles. Envío GRATIS en compras mayores a S/.150.';
        } else if (lowerMessage.includes('cupón') || lowerMessage.includes('descuento')) {
            response = '🎫 Cupones activos: ECO10 (10% OFF), ECO20 (20% OFF), ENVIOFREE (envío gratis), BIENVENIDO (S/.15 OFF).';
        } else {
            response = 'Entiendo. Soy EcoBot, el asistente de EcoMarket. Puedo ayudarte con productos, envíos, cupones, pagos o tu cuenta. ¿Qué necesitas?';
        }
        
        this.typeWriterEffect(response);
    }
    
    getWelcomeMessage() {
        const lang = this.getLanguage();
        if (lang === 'en') {
            return 'Hi! 🌱 I am **EcoBot AI**, the intelligent assistant of EcoMarket. I can help you find real products, answer shipping questions, coupons or your account. What do you need?';
        }
        return '¡Hola! 🌱 Soy **EcoBot IA**, el asistente inteligente de EcoMarket. Puedo ayudarte a buscar productos reales, resolver dudas de envíos, cupones o tu cuenta. ¿Qué necesitas?';
    }
    
    getLanguage() {
        // Detectar idioma del documento o localStorage
        return document.documentElement.lang || localStorage.getItem('ecomarket_lang') || 'es';
    }
    
    loadHistory() {
        if (!this.options.enableHistory) return;
        
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.messages = JSON.parse(saved);
                this.renderHistory();
            }
        } catch {
            this.messages = [];
        }
    }
    
    saveHistory() {
        if (!this.options.enableHistory) return;
        
        try {
            const historyToSave = this.messages.slice(-this.options.maxHistory);
            localStorage.setItem(this.options.storageKey, JSON.stringify(historyToSave));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }
    
    renderHistory() {
        this.messagesContainer.innerHTML = '';
        
        this.messages.forEach(msg => {
            if (msg.role === 'user') {
                this.addUserMessage(msg.content);
            } else {
                this.addBotMessage(msg.content);
            }
        });
    }
    
    clearChat() {
        this.messages = [];
        this.messagesContainer.innerHTML = '';
        this.conversationId = null;
        this.hideQuickReplies();
        
        if (this.options.enableHistory) {
            this.saveHistory();
        }
        
        // Mensaje de bienvenida
        setTimeout(() => {
            this.addBotMessage(this.getWelcomeMessage());
        }, 300);
    }
    
    closeChat() {
        const container = document.querySelector('[data-eco-chatgpt]');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    openChat() {
        const container = document.querySelector('[data-eco-chatgpt]');
        if (container) {
            container.style.display = 'block';
            this.inputContainer.focus();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    autoResizeTextarea() {
        const textarea = this.inputContainer;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    destroy() {
        this.sendBtn.removeEventListener('click', () => this.sendMessage());
        this.inputContainer.removeEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        clearTimeout(this.typingTimeout);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('[data-eco-chatgpt]');
    if (chatContainer && chatContainer.dataset.ecoChatgpt !== 'false') {
        window.ecoChatGPT = new EcoChatGPT({
            ...chatContainer.dataset
        });
    }
});