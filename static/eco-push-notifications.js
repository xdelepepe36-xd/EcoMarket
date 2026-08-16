/**
 * eco-push-notifications.js - Sistema de notificaciones push
 * 
 * Funcionalidades:
 - Notificaciones push
 - Alertas de stock
 - Promociones
 - Recordatorios
 - Suscripcion a notificaciones
 - Gestion de permisos
 */

class EcoPushNotifications {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/push',
            storageKey: options.storageKey || 'ecomarket_push',
            enableStockAlerts: options.enableStockAlerts !== false,
            enablePromotions: options.enablePromotions !== false,
            enableReminders: options.enableReminders !== false,
            ...options
        };
        
        this.subscription = null;
        this.notifications = [];
        this.permission = 'default';
        
        this.init();
    }
    
    init() {
        this.loadNotifications();
        this.createPushUI();
        this.setupEventListeners();
        this.checkPermission();
    }
    
    createPushUI() {
        const container = document.querySelector('[data-eco-push-notifications]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-push-notifications">
                <div class="eco-push-header">
                    <h3>Notificaciones Push</h3>
                    <div class="eco-permission-status" data-permission-status>
                        <i class="bi bi-${this.getPermissionIcon()}"></i>
                        <span>${this.getPermissionText()}</span>
                    </div>
                </div>
                
                <div class="eco-push-actions">
                    ${this.permission === 'default' ? `
                        <button class="eco-btn-eco" data-enable-push>
                            <i class="bi bi-bell"></i>
                            Habilitar Notificaciones
                        </button>
                    ` : this.permission === 'granted' ? `
                        <button class="eco-btn-secondary" data-disable-push>
                            <i class="bi bi-bell-slash"></i>
                            Deshabilitar
                        </button>
                    ` : `
                        <button class="eco-btn-secondary" disabled>
                            <i class="bi bi-ban"></i>
                            Bloqueado
                        </button>
                    `}
                </div>
                
                <div class="eco-push-preferences">
                    <h4>Preferencias</h4>
                    <div class="eco-preference-item">
                        <label>
                            <input type="checkbox" data-preference-stock ${this.options.enableStockAlerts ? 'checked' : ''}>
                            Alertas de stock
                        </label>
                    </div>
                    <div class="eco-preference-item">
                        <label>
                            <input type="checkbox" data-preference-promotions ${this.options.enablePromotions ? 'checked' : ''}>
                            Promociones y ofertas
                        </label>
                    </div>
                    <div class="eco-preference-item">
                        <label>
                            <input type="checkbox" data-preference-reminders ${this.options.enableReminders ? 'checked' : ''}>
                            Recordatorios de carrito
                        </label>
                    </div>
                </div>
                
                <div class="eco-push-history">
                    <h4>Historial de Notificaciones</h4>
                    <div class="eco-notifications-list" data-notifications-list>
                        ${this.renderNotifications()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderNotifications() {
        if (this.notifications.length === 0) {
            return '<p class="eco-no-notifications">Sin notificaciones</p>';
        }
        
        return this.notifications.slice(0, 10).map(notif => `
            <div class="eco-notification-item ${notif.read ? 'read' : 'unread'}">
                <div class="eco-notification-icon">
                    <i class="bi bi-${this.getNotificationIcon(notif.type)}"></i>
                </div>
                <div class="eco-notification-content">
                    <span class="eco-notification-title">${notif.title}</span>
                    <span class="eco-notification-message">${notif.message}</span>
                    <span class="eco-notification-time">${this.formatTime(notif.time)}</span>
                </div>
                <button class="eco-mark-read-btn" data-mark-read="${notif.id}">
                    <i class="bi bi-check"></i>
                </button>
            </div>
        `).join('');
    }
    
    getPermissionIcon() {
        switch (this.permission) {
            case 'granted': return 'check-circle';
            case 'denied': return 'x-circle';
            default: return 'question-circle';
        }
    }
    
    getPermissionText() {
        switch (this.permission) {
            case 'granted': return 'Habilitadas';
            case 'denied': return 'Bloqueadas';
            default: return 'No configuradas';
        }
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'stock': return 'box';
            case 'promotion': return 'tag';
            case 'reminder': return 'clock';
            default: return 'bell';
        }
    }
    
    setupEventListeners() {
        document.querySelector('[data-enable-push]')?.addEventListener('click', () => {
            this.requestPermission();
        });
        
        document.querySelector('[data-disable-push]')?.addEventListener('click', () => {
            this.disablePush();
        });
        
        document.querySelectorAll('[data-preference-stock]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.options.enableStockAlerts = e.target.checked;
            });
        });
        
        document.querySelectorAll('[data-preference-promotions]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.options.enablePromotions = e.target.checked;
            });
        });
        
        document.querySelectorAll('[data-preference-reminders]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.options.enableReminders = e.target.checked;
            });
        });
        
        document.querySelectorAll('[data-mark-read]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const notifId = e.target.dataset.markRead;
                this.markAsRead(parseInt(notifId));
            });
        });
    }
    
    checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
            this.updatePermissionUI();
        }
    }
    
    async requestPermission() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
            this.updatePermissionUI();
            
            if (this.permission === 'granted') {
                this.subscribeToPush();
            }
        }
    }
    
    disablePush() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.permission = 'default';
        this.updatePermissionUI();
    }
    
    async subscribeToPush() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                this.subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.options.vapidKey)
                });
                
                // Enviar suscripción al servidor
                await this.sendSubscriptionToServer(this.subscription);
            } catch (error) {
                console.error('Error suscribiendo a push:', error);
            }
        }
    }
    
    async sendSubscriptionToServer(subscription) {
        try {
            await fetch(this.options.apiEndpoint + '/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });
        } catch (error) {
            console.error('Error enviando suscripción:', error);
        }
    }
    
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
    
    sendNotification(title, message, type = 'info') {
        if (this.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/static/assets/icon-192.png',
                badge: '/static/assets/icon-72.png'
            });
        }
        
        // Guardar en historial
        this.notifications.unshift({
            id: Date.now(),
            title: title,
            message: message,
            type: type,
            time: new Date().toISOString(),
            read: false
        });
        
        this.saveNotifications();
        this.updateNotificationsUI();
    }
    
    markAsRead(notifId) {
        const notif = this.notifications.find(n => n.id === notifId);
        if (notif) {
            notif.read = true;
            this.saveNotifications();
            this.updateNotificationsUI();
        }
    }
    
    updatePermissionUI() {
        const statusEl = document.querySelector('[data-permission-status]');
        if (statusEl) {
            statusEl.innerHTML = `
                <i class="bi bi-${this.getPermissionIcon()}"></i>
                <span>${this.getPermissionText()}</span>
            `;
        }
        
        // Actualizar botones
        const actionsEl = document.querySelector('.eco-push-actions');
        if (actionsEl) {
            if (this.permission === 'default') {
                actionsEl.innerHTML = `
                    <button class="eco-btn-eco" data-enable-push>
                        <i class="bi bi-bell"></i>
                        Habilitar Notificaciones
                    </button>
                `;
            } else if (this.permission === 'granted') {
                actionsEl.innerHTML = `
                    <button class="eco-btn-secondary" data-disable-push>
                        <i class="bi bi-bell-slash"></i>
                        Deshabilitar
                    </button>
                `;
            } else {
                actionsEl.innerHTML = `
                    <button class="eco-btn-secondary" disabled>
                        <i class="bi bi-ban"></i>
                        Bloqueado
                    </button>
                `;
            }
        }
        
        // Re-attach event listeners
        this.setupEventListeners();
    }
    
    updateNotificationsUI() {
        const list = document.querySelector('[data-notifications-list]');
        if (list) {
            list.innerHTML = this.renderNotifications();
        }
    }
    
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
        return date.toLocaleDateString('es-ES');
    }
    
    loadNotifications() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.notifications = JSON.parse(saved);
            }
        } catch {
            // Usar notificaciones por defecto
        }
    }
    
    saveNotifications() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error guardando notificaciones:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const pushContainer = document.querySelector('[data-eco-push-notifications]');
    if (pushContainer && pushContainer.dataset.ecoPushNotifications !== 'false') {
        window.ecoPushNotifications = new EcoPushNotifications({
            ...pushContainer.dataset
        });
    }
});