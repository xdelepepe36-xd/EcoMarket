/**
 * eco-support-customer.js - Sistema de soporte al cliente
 * 
 * Funcionalidades:
 - Chat de soporte en vivo
 - Tickets de ayuda
 - Base de conocimiento
 - FAQ interactivo
 - Estado de tickets
 - Clasificación de problemas
 - Historial de soporte
 */

class EcoSupportCustomer {
    constructor(options = {}) {
        this.options = {
            chatEndpoint: options.chatEndpoint || '/api/soporte/chat',
            ticketEndpoint: options.ticketEndpoint || '/api/soporte/tickets',
            storageKey: options.storageKey || 'ecomarket_support',
            enableLiveChat: options.enableLiveChat !== false,
            enableTickets: options.enableTickets !== false,
            enableFAQ: options.enableFAQ !== false,
            ...options
        };
        
        this.tickets = [];
        this.activeChat = null;
        this.socket = null;
        
        this.init();
    }
    
    init() {
        this.createSupportUI();
        this.setupWebSocket();
        this.loadTickets();
        this.setupEventListeners();
    }
    
    createSupportUI() {
        const container = document.querySelector('[data-eco-support]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-support-customer">
                <div class="eco-support-header">
                    <h3>Centro de Ayuda</h3>
                    <div class="eco-support-tabs">
                        <button class="eco-tab-btn active" data-support-tab="chat">Chat en vivo</button>
                        <button class="eco-tab-btn" data-support-tab="tickets">Tickets</button>
                        <button class="eco-tab-btn" data-support-tab="faq">FAQ</button>
                    </div>
                </div>
                
                <div class="eco-support-content">
                    <div class="eco-support-tab active" data-support-content="chat">
                        <div class="eco-live-chat">
                            <div class="eco-chat-status" data-chat-status>
                                <span class="status-dot online"></span>
                                <span>Agentes disponibles</span>
                            </div>
                            <div class="eco-chat-messages" data-support-messages>
                                <div class="eco-welcome-message">
                                    <i class="bi bi-headset"></i>
                                    <p>¡Hola! ¿En qué podemos ayudarte hoy?</p>
                                </div>
                            </div>
                            <div class="eco-chat-input">
                                <input type="text" data-support-input placeholder="Describe tu problema...">
                                <button class="eco-send-btn" data-send-support>
                                    <i class="bi bi-send"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="eco-support-tab" data-support-content="tickets">
                        <div class="eco-tickets-header">
                            <h4>Mis Tickets</h4>
                            <button class="eco-btn-eco" data-create-ticket>
                                <i class="bi bi-plus"></i>
                                Nuevo Ticket
                            </button>
                        </div>
                        <div class="eco-tickets-list" data-tickets-list>
                            <!-- Los tickets se renderizarán aquí -->
                        </div>
                    </div>
                    
                    <div class="eco-support-tab" data-support-content="faq">
                        <div class="eco-faq-search">
                            <input type="text" data-faq-search placeholder="Buscar en FAQ...">
                        </div>
                        <div class="eco-faq-categories" data-faq-categories>
                            <button class="eco-faq-category active" data-faq-category="all">Todas</button>
                            <button class="eco-faq-category" data-faq-category="orders">Pedidos</button>
                            <button class="eco-faq-category" data-faq-category="payments">Pagos</button>
                            <button class="eco-faq-category" data-faq-category="shipping">Envíos</button>
                            <button class="eco-faq-category" data-faq-category="account">Cuenta</button>
                        </div>
                        <div class="eco-faq-list" data-faq-list>
                            ${this.renderFAQ()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFAQ() {
        const faqData = [
            {
                category: 'orders',
                question: '¿Cómo puedo rastrear mi pedido?',
                answer: 'Puedes rastrear tu pedido en la sección "Mis Pedidos" o ingresando el número de pedido en el sistema de seguimiento.'
            },
            {
                category: 'orders',
                question: '¿Qué pasa si mi pedido no llega?',
                answer: 'Si tu pedido no llega en el tiempo estimado, contacta a soporte y te ayudaremos a resolver el problema.'
            },
            {
                category: 'payments',
                question: '¿Qué métodos de pago aceptan?',
                answer: 'Aceptamos tarjetas de crédito/débito, Yape/Plin, transferencias bancarias y pago contra entrega.'
            },
            {
                category: 'payments',
                question: '¿Es seguro pagar en línea?',
                answer: 'Sí, usamos encriptación SSL de 256 bits y procesadores de pago certificados para garantizar la seguridad de tus datos.'
            },
            {
                category: 'shipping',
                question: '¿Cuánto cuesta el envío?',
                answer: 'El envío estándar cuesta S/.12. Es gratis en compras mayores a S/.150 o con el cupón ENVIOFREE.'
            },
            {
                category: 'shipping',
                question: '¿Hacen envíos internacionales?',
                answer: 'Actualmente solo hacemos envíos nacionales en Perú. Estamos trabajando para expandir a otros países.'
            },
            {
                category: 'account',
                question: '¿Cómo cambio mi contraseña?',
                answer: 'Ve a "Mi Perfil" > "Configuración" > "Cambiar contraseña". Sigue las instrucciones para actualizarla.'
            },
            {
                category: 'account',
                question: '¿Puedo eliminar mi cuenta?',
                answer: 'Sí, puedes eliminar tu cuenta desde "Mi Perfil" > "Configuración" > "Eliminar cuenta". Ten en cuenta que esta acción es irreversible.'
            }
        ];
        
        return faqData.map((item, index) => `
            <div class="eco-faq-item" data-faq-item="${index}">
                <div class="eco-faq-question">
                    <h5>${item.question}</h5>
                    <i class="bi bi-chevron-down"></i>
                </div>
                <div class="eco-faq-answer">
                    <p>${item.answer}</p>
                </div>
            </div>
        `).join('');
    }
    
    setupWebSocket() {
        if (!this.options.enableLiveChat) return;
        
        try {
            this.socket = new WebSocket('ws://localhost:5000/ws/soporte');
            
            this.socket.onopen = () => {
                console.log('WebSocket de soporte conectado');
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleSupportMessage(data);
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket de soporte desconectado');
                setTimeout(() => this.setupWebSocket(), 5000);
            };
        } catch (error) {
            console.error('Error conectando WebSocket de soporte:', error);
        }
    }
    
    setupEventListeners() {
        // Tabs
        document.querySelectorAll('[data-support-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.supportTab;
                this.switchTab(tab);
            });
        });
        
        // FAQ categories
        document.querySelectorAll('[data-faq-category]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.faqCategory;
                this.filterFAQ(category);
            });
        });
        
        // FAQ items
        document.querySelectorAll('[data-faq-item]').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
        
        // Support chat input
        const supportInput = document.querySelector('[data-support-input]');
        const sendBtn = document.querySelector('[data-send-support]');
        
        if (supportInput && sendBtn) {
            const sendSupportMessage = () => {
                const message = supportInput.value.trim();
                if (message) {
                    this.sendSupportMessage(message);
                    supportInput.value = '';
                }
            };
            
            sendBtn.addEventListener('click', sendSupportMessage);
            supportInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendSupportMessage();
            });
        }
        
        // Create ticket
        document.querySelector('[data-create-ticket]')?.addEventListener('click', () => {
            this.createTicket();
        });
    }
    
    switchTab(tab) {
        document.querySelectorAll('[data-support-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.supportTab === tab);
        });
        
        document.querySelectorAll('[data-support-content]').forEach(content => {
            content.classList.toggle('active', content.dataset.supportContent === tab);
        });
    }
    
    filterFAQ(category) {
        document.querySelectorAll('[data-faq-category]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.faqCategory === category);
        });
        
        const faqItems = document.querySelectorAll('[data-faq-item]');
        faqItems.forEach(item => {
            if (category === 'all') {
                item.style.display = 'block';
            } else {
                const itemData = this.getFAQData(parseInt(item.dataset.faqItem));
                item.style.display = itemData.category === category ? 'block' : 'none';
            }
        });
    }
    
    getFAQData(index) {
        const faqData = [
            { category: 'orders' },
            { category: 'orders' },
            { category: 'payments' },
            { category: 'payments' },
            { category: 'shipping' },
            { category: 'shipping' },
            { category: 'account' },
            { category: 'account' }
        ];
        return faqData[index] || { category: 'all' };
    }
    
    async sendSupportMessage(message) {
        try {
            const response = await fetch(this.options.chatEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderSupportMessage(data);
            }
        } catch (error) {
            console.error('Error enviando mensaje de soporte:', error);
        }
    }
    
    renderSupportMessage(message) {
        const messagesContainer = document.querySelector('[data-support-messages]');
        if (!messagesContainer) return;
        
        // Remover mensaje de bienvenida
        const welcome = messagesContainer.querySelector('.eco-welcome-message');
        if (welcome) welcome.remove();
        
        const messageElement = document.createElement('div');
        messageElement.className = `eco-support-message ${message.from === 'user' ? 'user' : 'agent'}`;
        messageElement.innerHTML = `
            <div class="eco-message-content">
                <p>${message.text}</p>
                <span class="eco-message-time">${this.formatTime(message.timestamp)}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    handleSupportMessage(data) {
        this.renderSupportMessage(data);
    }
    
    async createTicket() {
        const title = prompt('Título del ticket:');
        if (!title) return;
        
        const description = prompt('Descripción del problema:');
        if (!description) return;
        
        const category = prompt('Categoría (Pedidos, Pagos, Envíos, Cuenta, Otro):');
        
        try {
            const response = await fetch(this.options.ticketEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    category: category || 'Otro'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.tickets.push(data);
                this.renderTickets();
                alert('Ticket creado exitosamente');
            }
        } catch (error) {
            console.error('Error creando ticket:', error);
        }
    }
    
    async loadTickets() {
        try {
            const response = await fetch(this.options.ticketEndpoint);
            if (response.ok) {
                const data = await response.json();
                this.tickets = data.tickets || [];
                this.renderTickets();
            }
        } catch (error) {
            console.error('Error cargando tickets:', error);
        }
    }
    
    renderTickets() {
        const container = document.querySelector('[data-tickets-list]');
        if (!container) return;
        
        if (this.tickets.length === 0) {
            container.innerHTML = '<p class="eco-no-tickets">No tienes tickets activos</p>';
            return;
        }
        
        container.innerHTML = this.tickets.map(ticket => `
            <div class="eco-ticket-item">
                <div class="eco-ticket-header">
                    <h5>${ticket.title}</h5>
                    <span class="eco-ticket-status ${ticket.status}">${ticket.status}</span>
                </div>
                <p class="eco-ticket-description">${ticket.description}</p>
                <div class="eco-ticket-meta">
                    <span class="eco-ticket-category">${ticket.category}</span>
                    <span class="eco-ticket-date">${this.formatDate(ticket.created_at)}</span>
                </div>
            </div>
        `).join('');
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    destroy() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const supportContainer = document.querySelector('[data-eco-support]');
    if (supportContainer && supportContainer.dataset.ecoSupport !== 'false') {
        window.ecoSupportCustomer = new EcoSupportCustomer({
            ...supportContainer.dataset
        });
    }
});