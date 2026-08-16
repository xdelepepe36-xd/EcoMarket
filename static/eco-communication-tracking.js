/**
 * eco-communication-tracking.js - Sistema de comunicación y seguimiento de pedidos
 * 
 * Funcionalidades:
 - Chat en tiempo real entre compradores y vendedores
 - Tracking de pedidos con mapa en tiempo real
 - Notificaciones de actualizaciones de estado
 - Historial de mensajes
 - Estados de pedido actualizados
 - Geolocalización de paquetes
 */

class EcoCommunicationTracking {
    constructor(options = {}) {
        this.options = {
            chatEndpoint: options.chatEndpoint || '/api/chat',
            trackingEndpoint: options.trackingEndpoint || '/api/tracking',
            storageKey: options.storageKey || 'ecomarket_communication',
            enableRealTime: options.enableRealTime !== false,
            ...options
        };
        
        this.chats = new Map();
        this.activeOrder = null;
        this.socket = null;
        
        this.init();
    }
    
    init() {
        this.createChatUI();
        this.createTrackingUI();
        this.setupWebSocket();
        this.setupEventListeners();
    }
    
    createChatUI() {
        const container = document.querySelector('[data-eco-chat-messaging]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-chat-messaging">
                <div class="eco-chat-list" data-chat-list>
                    <div class="eco-chat-list-header">
                        <h3>Mensajes</h3>
                        <button class="eco-btn-icon" data-new-chat title="Nuevo chat">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                    <div class="eco-chat-conversations" data-chat-conversations>
                        <!-- Las conversaciones se renderizarán aquí -->
                    </div>
                </div>
                
                <div class="eco-chat-window" data-chat-window>
                    <div class="eco-chat-header">
                        <div class="eco-chat-user-info">
                            <div class="eco-user-avatar" data-chat-avatar></div>
                            <div class="eco-user-details">
                                <h4 data-chat-username>Selecciona un chat</h4>
                                <span data-chat-status></span>
                            </div>
                        </div>
                        <div class="eco-chat-actions">
                            <button class="eco-btn-icon" data-close-chat title="Cerrar">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="eco-chat-messages" data-chat-messages>
                        <div class="eco-chat-placeholder">
                            <i class="bi bi-chat-dots"></i>
                            <p>Selecciona una conversación para comenzar</p>
                        </div>
                    </div>
                    
                    <div class="eco-chat-input">
                        <input type="text" data-chat-input placeholder="Escribe un mensaje...">
                        <button class="eco-send-btn" data-send-message>
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    createTrackingUI() {
        const container = document.querySelector('[data-eco-tracking]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-tracking-system">
                <div class="eco-tracking-header">
                    <h3>Seguimiento de Pedidos</h3>
                    <div class="eco-tracking-search">
                        <input type="text" data-tracking-search placeholder="Número de pedido...">
                        <button class="eco-search-btn">
                            <i class="bi bi-search"></i>
                        </button>
                    </div>
                </div>
                
                <div class="eco-tracking-content">
                    <div class="eco-tracking-map" data-tracking-map>
                        <div class="eco-map-placeholder">
                            <i class="bi bi-map"></i>
                            <p>Ingresa un número de pedido para ver el seguimiento</p>
                        </div>
                    </div>
                    
                    <div class="eco-tracking-timeline" data-tracking-timeline>
                        <!-- La línea de tiempo se renderizará aquí -->
                    </div>
                    
                    <div class="eco-tracking-details" data-tracking-details>
                        <!-- Los detalles se renderizarán aquí -->
                    </div>
                </div>
            </div>
        `;
    }
    
    setupWebSocket() {
        if (!this.options.enableRealTime) return;
        
        try {
            this.socket = new WebSocket('ws://localhost:5000/ws/chat');
            
            this.socket.onopen = () => {
                console.log('WebSocket conectado para chat');
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleIncomingMessage(data);
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket desconectado');
                setTimeout(() => this.setupWebSocket(), 5000);
            };
        } catch (error) {
            console.error('Error conectando WebSocket:', error);
        }
    }
    
    setupEventListeners() {
        // Chat input
        const chatInput = document.querySelector('[data-chat-input]');
        const sendBtn = document.querySelector('[data-send-message]');
        
        if (chatInput && sendBtn) {
            const sendMessage = () => {
                const message = chatInput.value.trim();
                if (message) {
                    this.sendMessage(message);
                    chatInput.value = '';
                }
            };
            
            sendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
        
        // Tracking search
        const trackingSearch = document.querySelector('[data-tracking-search]');
        const searchBtn = document.querySelector('.eco-search-btn');
        
        if (trackingSearch && searchBtn) {
            const searchOrder = () => {
                const orderNumber = trackingSearch.value.trim();
                if (orderNumber) {
                    this.trackOrder(orderNumber);
                }
            };
            
            searchBtn.addEventListener('click', searchOrder);
            trackingSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchOrder();
            });
        }
    }
    
    async sendMessage(message) {
        try {
            const response = await fetch(this.options.chatEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: this.activeConversation
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderMessage(data);
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    }
    
    handleIncomingMessage(data) {
        this.renderMessage(data);
        this.showNotification(data);
    }
    
    renderMessage(message) {
        const messagesContainer = document.querySelector('[data-chat-messages]');
        if (!messagesContainer) return;
        
        // Remover placeholder si existe
        const placeholder = messagesContainer.querySelector('.eco-chat-placeholder');
        if (placeholder) placeholder.remove();
        
        const messageElement = document.createElement('div');
        messageElement.className = `eco-message ${message.sent_by === 'me' ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <div class="eco-message-content">
                <p>${message.text}</p>
                <span class="eco-message-time">${this.formatTime(message.timestamp)}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    async trackOrder(orderNumber) {
        try {
            const response = await fetch(`${this.options.trackingEndpoint}/${orderNumber}`);
            if (response.ok) {
                const data = await response.json();
                this.renderTracking(data);
            }
        } catch (error) {
            console.error('Error tracking order:', error);
        }
    }
    
    renderTracking(trackingData) {
        const mapContainer = document.querySelector('[data-tracking-map]');
        const timelineContainer = document.querySelector('[data-tracking-timeline]');
        const detailsContainer = document.querySelector('[data-tracking-details]');
        
        // Renderizar mapa (simplificado - en producción usaría una API de mapas real)
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="eco-map-view">
                    <div class="eco-map-marker" style="left: ${trackingData.progress}%"></div>
                    <div class="eco-map-route"></div>
                    <div class="eco-map-locations">
                        <div class="eco-location origin">📍 Origen</div>
                        <div class="eco-location destination">📍 Destino</div>
                    </div>
                </div>
            `;
        }
        
        // Renderizar timeline
        if (timelineContainer) {
            const statuses = [
                { key: 'created', label: 'Pedido creado', icon: 'bi-receipt' },
                { key: 'confirmed', label: 'Confirmado', icon: 'bi-check-circle' },
                { key: 'processing', label: 'En proceso', icon: 'bi-gear' },
                { key: 'shipped', label: 'Enviado', icon: 'bi-truck' },
                { key: 'delivered', label: 'Entregado', icon: 'bi-house' }
            ];
            
            timelineContainer.innerHTML = statuses.map((status, index) => {
                const isActive = trackingData.current_status === status.key;
                const isPast = statuses.findIndex(s => s.key === trackingData.current_status) > index;
                
                return `
                    <div class="eco-timeline-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}">
                        <div class="eco-timeline-icon">
                            <i class="bi ${status.icon}"></i>
                        </div>
                        <div class="eco-timeline-content">
                            <h5>${status.label}</h5>
                            ${trackingData[status.key + '_date'] ? 
                                `<span class="eco-timeline-date">${this.formatDate(trackingData[status.key + '_date'])}</span>` : 
                                ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Renderizar detalles
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="eco-tracking-details-content">
                    <h4>Detalles del Pedido #${trackingData.order_number}</h4>
                    <div class="eco-detail-row">
                        <span>Estado:</span>
                        <span class="eco-status-badge ${trackingData.current_status}">${trackingData.current_status}</span>
                    </div>
                    <div class="eco-detail-row">
                        <span>Fecha estimada:</span>
                        <span>${this.formatDate(trackingData.estimated_delivery)}</span>
                    </div>
                    <div class="eco-detail-row">
                        <span>Dirección:</span>
                        <span>${trackingData.shipping_address}</span>
                    </div>
                    <div class="eco-detail-row">
                        <span>Método de envío:</span>
                        <span>${trackingData.shipping_method}</span>
                    </div>
                </div>
            `;
        }
    }
    
    showNotification(message) {
        // Usar el sistema de notificaciones existente
        if (window.ecoNotifications) {
            window.ecoNotifications.addNotification({
                title: 'Nuevo mensaje',
                message: message.text,
                type: 'message'
            });
        }
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
    const chatContainer = document.querySelector('[data-eco-chat-messaging]');
    const trackingContainer = document.querySelector('[data-eco-tracking]');
    
    if (chatContainer || trackingContainer) {
        window.ecoCommunicationTracking = new EcoCommunicationTracking();
    }
});