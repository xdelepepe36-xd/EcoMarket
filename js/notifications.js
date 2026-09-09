/**
 * EcoMarket - Sistema de Notificaciones
 * Sistema unificado de notificaciones in-app y del navegador
 */

class NotificationSystem {
    constructor(options = {}) {
        this.options = {
            position: 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
            duration: 3000,
            maxVisible: 5,
            stack: true,
            ...options
        };
        
        this.notifications = [];
        this.container = this.createContainer();
        this.init();
    }

    /**
     * Crea el contenedor de notificaciones
     */
    createContainer() {
        const container = document.createElement('div');
        container.className = `notification-container notification-${this.options.position}`;
        container.id = 'notificationContainer';
        
        // Estilos inline para el contenedor
        const styles = {
            position: 'fixed',
            zIndex: '9999',
            pointerEvents: 'none',
            maxWidth: '400px',
            width: '100%'
        };

        // Posicionamiento
        const positions = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' }
        };

        Object.assign(styles, positions[this.options.position]);
        Object.assign(container.style, styles);

        document.body.appendChild(container);
        return container;
    }

    /**
     * Inicializa el sistema
     */
    init() {
        // Solicitar permisos para notificaciones del navegador
        if ('Notification' in window && Notification.permission === 'default') {
            this.requestPermission();
        }

        // Escuchar eventos personalizados
        this.setupEventListeners();
    }

    /**
     * Solicita permiso para notificaciones del navegador
     */
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Escuchar notificaciones del servidor (si se implementa WebSocket)
        document.addEventListener('notification:received', (e) => {
            this.show(e.detail.message, e.detail.type);
        });

        // Escuchar eventos de carrito
        document.addEventListener('cart:add', (e) => {
            this.show('Producto añadido al carrito', 'success');
        });

        document.addEventListener('cart:remove', (e) => {
            this.show('Producto eliminado del carrito', 'info');
        });

        // Escuchar eventos de favoritos
        document.addEventListener('favorite:add', (e) => {
            this.show('Producto añadido a favoritos', 'success');
        });

        document.addEventListener('favorite:remove', (e) => {
            this.show('Producto eliminado de favoritos', 'info');
        });
    }

    /**
     * Muestra una notificación
     */
    show(message, type = 'info', options = {}) {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        
        // También mostrar notificación del navegador si está permitido
        if (options.browser && 'Notification' in window && Notification.permission === 'granted') {
            this.showBrowserNotification(message, type, options);
        }

        return notification;
    }

    /**
     * Crea una notificación
     */
    createNotification(message, type, options = {}) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const colors = {
            success: '#2e7d32',
            error: '#d32f2f',
            warning: '#ff9800',
            info: '#2196f3'
        };

        notification.innerHTML = `
            <div class="notification-icon" style="background: ${colors[type]}">
                ${icons[type]}
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                ${options.description ? `<div class="notification-description">${options.description}</div>` : ''}
            </div>
            <button class="notification-close" aria-label="Cerrar">×</button>
        `;

        // Estilos inline
        Object.assign(notification.style, {
            background: 'white',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: this.options.stack ? '0.5rem' : '0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            pointerEvents: 'auto',
            opacity: '0',
            transform: 'translateX(-20px)',
            transition: 'all 0.3s ease'
        });

        // Estilos del icono
        const icon = notification.querySelector('.notification-icon');
        Object.assign(icon.style, {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            flexShrink: '0'
        });

        // Estilos del contenido
        const content = notification.querySelector('.notification-content');
        Object.assign(content.style, {
            flex: '1',
            minWidth: '0'
        });

        const messageEl = notification.querySelector('.notification-message');
        Object.assign(messageEl.style, {
            fontWeight: '500',
            color: '#333',
            fontSize: '0.95rem'
        });

        const descriptionEl = notification.querySelector('.notification-description');
        if (descriptionEl) {
            Object.assign(descriptionEl.style, {
                fontSize: '0.85rem',
                color: '#666',
                marginTop: '0.25rem'
            });
        }

        // Estilos del botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#999',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1',
            transition: 'color 0.3s ease'
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = '#333';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#999';
        });

        // Evento de cerrar
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Click en la notificación (si hay acción)
        if (options.onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', () => {
                options.onClick();
                this.removeNotification(notification);
            });
        }

        // Auto-remove después de la duración
        if (options.duration !== 0) {
            const duration = options.duration || this.options.duration;
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Añade notificación al contenedor
     */
    addNotification(notification) {
        // Limitar número de notificaciones visibles
        while (this.notifications.length >= this.options.maxVisible) {
            this.removeNotification(this.notifications[0]);
        }

        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animación de entrada
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
    }

    /**
     * Elimina notificación
     */
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        // Animación de salida
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Muestra notificación del navegador
     */
    showBrowserNotification(message, type, options = {}) {
        const notification = new Notification(options.title || 'EcoMarket', {
            body: message,
            icon: options.icon || '/static/favicon.ico',
            badge: options.badge || '/static/favicon.ico',
            tag: options.tag || 'ecomarket',
            requireInteraction: options.requireInteraction || false
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onClick) {
                options.onClick();
            }
        };

        // Auto-close
        if (!options.requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, options.duration || this.options.duration);
        }
    }

    /**
     * Métodos de conveniencia
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Limpia todas las notificaciones
     */
    clear() {
        while (this.notifications.length > 0) {
            this.removeNotification(this.notifications[0]);
        }
    }

    /**
     * Destruye el sistema de notificaciones
     */
    destroy() {
        this.clear();
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Instancia global
const notifications = new NotificationSystem({
    position: 'top-right',
    duration: 3000,
    maxVisible: 5,
    stack: true
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationSystem, notifications };
}