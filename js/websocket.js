/**
 * EcoMarket - WebSocket Client
 * Cliente WebSocket para comunicación en tiempo real
 */

class WebSocketClient {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            pingInterval: 30000,
            ...options
        };
        
        this.ws = null;
        this.reconnectAttempts = 0;
        this.isIntentionallyClosed = false;
        this.eventHandlers = {};
        this.pingTimer = null;
        
        this.connect();
    }

    /**
     * Conecta al servidor WebSocket
     */
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Configura los manejadores de eventos del WebSocket
     */
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.startPing();
            this.emit('connected');
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.stopPing();
            
            if (!this.isIntentionallyClosed) {
                this.emit('disconnected', { code: event.code, reason: event.reason });
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    }

    /**
     * Maneja mensajes recibidos
     */
    handleMessage(data) {
        const { type, payload } = data;
        
        // Emitir evento específico
        this.emit(type, payload);
        
        // Emitir evento genérico
        this.emit('message', data);
        
        // Manejar tipos de mensajes específicos
        switch (type) {
            case 'notification':
                this.handleNotification(payload);
                break;
            case 'chat':
                this.handleChatMessage(payload);
                break;
            case 'presence':
                this.handlePresenceUpdate(payload);
                break;
            case 'ping':
                this.handlePing();
                break;
            default:
                console.log('Unhandled message type:', type);
        }
    }

    /**
     * Maneja notificaciones
     */
    handleNotification(payload) {
        if (typeof notifications !== 'undefined') {
            notifications.show(payload.message, payload.type || 'info', {
                browser: true,
                onClick: () => {
                    if (payload.action) {
                        window.location.href = payload.action;
                    }
                }
            });
        }
        
        // Emitir evento para otros listeners
        document.dispatchEvent(new CustomEvent('notification:received', {
            detail: payload
        }));
    }

    /**
     * Maneja mensajes de chat
     */
    handleChatMessage(payload) {
        document.dispatchEvent(new CustomEvent('chat:message', {
            detail: payload
        }));
    }

    /**
     * Maneja actualizaciones de presencia
     */
    handlePresenceUpdate(payload) {
        document.dispatchEvent(new CustomEvent('presence:update', {
            detail: payload
        }));
    }

    /**
     * Maneja pings del servidor
     */
    handlePing() {
        this.pong();
    }

    /**
     * Inicia el ping periódico
     */
    startPing() {
        this.stopPing();
        this.pingTimer = setInterval(() => {
            this.ping();
        }, this.options.pingInterval);
    }

    /**
     * Detiene el ping periódico
     */
    stopPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * Envía ping al servidor
     */
    ping() {
        this.send({ type: 'ping' });
    }

    /**
     * Envía pong al servidor
     */
    pong() {
        this.send({ type: 'pong' });
    }

    /**
     * Programa reconexión
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('reconnectFailed');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Envía mensaje al servidor
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        } else {
            console.warn('WebSocket is not connected');
            return false;
        }
    }

    /**
     * Registra manejador de evento
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    /**
     * Elimina manejador de evento
     */
    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }

    /**
     * Emite evento
     */
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Cierra la conexión WebSocket
     */
    close() {
        this.isIntentionallyClosed = true;
        this.stopPing();
        
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * Obtiene estado de la conexión
     */
    getReadyState() {
        if (!this.ws) return 'DISCONNECTED';
        
        const states = {
            [WebSocket.CONNECTING]: 'CONNECTING',
            [WebSocket.OPEN]: 'CONNECTED',
            [WebSocket.CLOSING]: 'CLOSING',
            [WebSocket.CLOSED]: 'DISCONNECTED'
        };
        
        return states[this.ws.readyState] || 'UNKNOWN';
    }

    /**
     * Verifica si está conectado
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Instancia global (se inicializa cuando haya URL de WebSocket)
let wsClient = null;

function initWebSocket(url) {
    if (wsClient) {
        wsClient.close();
    }
    
    wsClient = new WebSocketClient(url);
    
    // Configurar manejadores por defecto
    wsClient.on('connected', () => {
        console.log('WebSocket connected successfully');
    });
    
    wsClient.on('disconnected', () => {
        console.log('WebSocket disconnected');
    });
    
    wsClient.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    return wsClient;
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebSocketClient, initWebSocket, wsClient };
}