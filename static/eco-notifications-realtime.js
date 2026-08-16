/**
 * eco-notifications-realtime.js - Sistema de notificaciones en tiempo real
 * 
 * Funcionalidades:
 * - Notificaciones push del navegador
 * - Notificaciones en-app
 * - WebSocket para actualizaciones en tiempo real
 * - Sonidos de notificación
 * - Agrupación de notificaciones
 * - Historial de notificaciones
 * - Preferencias de usuario
 * - Diferentes tipos de notificaciones
 */

class EcoNotifications {
    constructor(options = {}) {
        this.options = {
            wsEndpoint: options.wsEndpoint || 'ws://localhost:5000/ws/notifications',
            apiEndpoint: options.apiEndpoint || '/api/notificaciones',
            enablePush: options.enablePush !== false,
            enableSound: options.enableSound !== false,
            storageKey: options.storageKey || 'ecomarket_notifications',
            maxNotifications: options.maxNotifications || 50,
            soundFile: options.soundFile || '/static/assets/notification.mp3',
            ...options
        };
        
        this.notifications = [];
        this.unreadCount = 0;
        this.socket = null;
        this.isConnected = false;
        this.permissions = {
            push: 'default',
            sound: true
        };
        
        this.init();
    }
    
    async init() {
        this.loadNotifications();
        this.loadPermissions();
        this.setupNotificationUI();
        
        if (this.options.enablePush) {
            await this.requestPushPermission();
        }
        
        this.connectWebSocket();
        this.setupEventListeners();
    }
    
    setupNotificationUI() {
        // Crear botón de notificaciones
        const notificationBtn = document.createElement('button');
        notificationBtn.className = 'eco-notification-btn';
        notificationBtn.setAttribute('aria-label', 'Notificaciones');
        notificationBtn.innerHTML = `
            <i class="bi bi-bell"></i>
            <span class="eco-notification-badge" data-notification-count>0</span>
        `;
        
        // Insertar en el navbar
        const navbar = document.querySelector('.eco-navbar');
        if (navbar) {
            navbar.appendChild(notificationBtn);
        }
        
        this.notificationBtn = notificationBtn;
        this.notificationBadge = notificationBtn.querySelector('[data-notification-count]');
        
        // Crear panel de notificaciones
        this.createNotificationPanel();
        
        // Event listener para abrir/cerrar panel
        notificationBtn.addEventListener('click', () => this.toggleNotificationPanel());
    }
    
    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'eco-notification-panel';
        panel.setAttribute('data-notification-panel', '');
        panel.innerHTML = `
            <div class="eco-notification-header">
                <h3>Notificaciones</h3>
                <div class="eco-notification-actions">
                    <button class="eco-btn-icon" data-mark-all-read title="Marcar todas como leídas">
                        <i class="bi bi-check-double"></i>
                    </button>
                    <button class="eco-btn-icon" data-notification-settings title="Configuración">
                        <i class="bi bi-gear"></i>
                    </button>
                    <button class="eco-btn-icon" data-close-panel title="Cerrar">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
            
            <div class="eco-notification-filters">
                <button class="eco-filter-btn active" data-filter="all">Todas</button>
                <button class="eco-filter-btn" data-filter="unread">No leídas</button>
                <button class="eco-filter-btn" data-filter="orders">Pedidos</button>
                <button class="eco-filter-btn" data-filter="promos">Promociones</button>
            </div>
            
            <div class="eco-notification-list" data-notification-list>
                <!-- Las notificaciones se renderizarán aquí -->
            </div>
            
            <div class="eco-notification-footer">
                <button class="eco-view-all" data-view-all>Ver todas las notificaciones</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.notificationPanel = panel;
        
        // Event listeners del panel
        panel.querySelector('[data-close-panel]').addEventListener('click', () => this.closeNotificationPanel());
        panel.querySelector('[data-mark-all-read]').addEventListener('click', () => this.markAllAsRead());
        panel.querySelector('[data-notification-settings]').addEventListener('click', () => this.showSettings());
        
        // Filtros
        panel.querySelectorAll('.eco-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }
    
    async requestPushPermission() {
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones');
            return;
        }
        
        if (Notification.permission === 'granted') {
            this.permissions.push = 'granted';
            return;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permissions.push = permission;
            this.savePermissions();
        }
    }
    
    connectWebSocket() {
        try {
            this.socket = new WebSocket(this.options.wsEndpoint);
            
            this.socket.onopen = () => {
                this.isConnected = true;
                console.log('Conectado al servidor de notificaciones');
            };
            
            this.socket.onmessage = (event) => {
                const notification = JSON.parse(event.data);
                this.handleIncomingNotification(notification);
            };
            
            this.socket.onclose = () => {
                this.isConnected = false;
                console.log('Desconectado del servidor de notificaciones');
                // Intentar reconectar después de 5 segundos
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.socket.onerror = (error) => {
                console.error('Error en WebSocket:', error);
            };
        } catch (error) {
            console.error('Error conectando WebSocket:', error);
        }
    }
    
    handleIncomingNotification(notification) {
        // Agregar a la lista
        this.addNotification(notification);
        
        // Mostrar notificación push si está habilitado
        if (this.permissions.push === 'granted') {
            this.showPushNotification(notification);
        }
        
        // Reproducir sonido si está habilitado
        if (this.permissions.sound && this.options.enableSound) {
            this.playNotificationSound();
        }
        
        // Actualizar UI
        this.updateNotificationUI();
    }
    
    addNotification(notification) {
        const notificationWithMeta = {
            ...notification,
            id: notification.id || Date.now(),
            read: false,
            timestamp: notification.timestamp || new Date().toISOString(),
            type: notification.type || 'info'
        };
        
        this.notifications.unshift(notificationWithMeta);
        
        // Limitar número de notificaciones
        if (this.notifications.length > this.options.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.options.maxNotifications);
        }
        
        this.unreadCount++;
        this.saveNotifications();
    }
    
    showPushNotification(notification) {
        const pushNotification = new Notification(notification.title || 'EcoMarket', {
            body: notification.message || notification.body,
            icon: '/static/assets/icon-gift.svg',
            badge: '/static/assets/icon-gift.svg',
            tag: notification.type || 'default',
            requireInteraction: notification.urgent || false,
            data: {
                url: notification.url || '/'
            }
        });
        
        pushNotification.onclick = () => {
            window.focus();
            pushNotification.close();
            if (notification.url) {
                window.location.href = notification.url;
            }
        };
    }
    
    playNotificationSound() {
        const audio = new Audio(this.options.soundFile);
        audio.play().catch(error => {
            console.error('Error reproduciendo sonido:', error);
        });
    }
    
    updateNotificationUI() {
        // Actualizar badge
        if (this.notificationBadge) {
            this.notificationBadge.textContent = this.unreadCount;
            this.notificationBadge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
        
        // Renderizar lista si el panel está abierto
        if (this.notificationPanel.style.display === 'block') {
            this.renderNotifications();
        }
    }
    
    renderNotifications(filter = 'all') {
        const listContainer = this.notificationPanel.querySelector('[data-notification-list]');
        if (!listContainer) return;
        
        let filteredNotifications = this.notifications;
        
        if (filter === 'unread') {
            filteredNotifications = this.notifications.filter(n => !n.read);
        } else if (filter === 'orders') {
            filteredNotifications = this.notifications.filter(n => n.type === 'order');
        } else if (filter === 'promos') {
            filteredNotifications = this.notifications.filter(n => n.type === 'promo');
        }
        
        if (filteredNotifications.length === 0) {
            listContainer.innerHTML = `
                <div class="eco-no-notifications">
                    <i class="bi bi-bell-slash"></i>
                    <p>No hay notificaciones${filter !== 'all' ? ' de este tipo' : ''}</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = filteredNotifications.map(notification => `
            <div class="eco-notification-item ${notification.read ? 'read' : 'unread'}" 
                 data-notification-id="${notification.id}">
                <div class="eco-notification-icon">
                    <i class="bi ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="eco-notification-content">
                    <div class="eco-notification-title">${notification.title}</div>
                    <div class="eco-notification-message">${notification.message}</div>
                    <div class="eco-notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                <div class="eco-notification-actions">
                    <button class="eco-btn-icon" data-mark-read title="Marcar como leído">
                        <i class="bi bi-check"></i>
                    </button>
                    <button class="eco-btn-icon" data-delete-notification title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Event listeners para las notificaciones
        listContainer.querySelectorAll('[data-mark-read]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.eco-notification-item').dataset.notificationId;
                this.markAsRead(id);
            });
        });
        
        listContainer.querySelectorAll('[data-delete-notification]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.eco-notification-item').dataset.notificationId;
                this.deleteNotification(id);
            });
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            'order': 'bi-box-seam',
            'promo': 'bi-tag',
            'review': 'bi-star',
            'message': 'bi-chat-dots',
            'system': 'bi-gear',
            'info': 'bi-info-circle',
            'success': 'bi-check-circle',
            'warning': 'bi-exclamation-triangle',
            'error': 'bi-x-circle'
        };
        return icons[type] || 'bi-bell';
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Ahora mismo';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} días`;
        
        return date.toLocaleDateString('es-ES');
    }
    
    toggleNotificationPanel() {
        const isOpen = this.notificationPanel.style.display === 'block';
        
        if (isOpen) {
            this.closeNotificationPanel();
        } else {
            this.openNotificationPanel();
        }
    }
    
    openNotificationPanel() {
        this.notificationPanel.style.display = 'block';
        this.renderNotifications();
        
        // Marcar como leídas al abrir
        if (this.unreadCount > 0) {
            setTimeout(() => this.markAllAsRead(), 1000);
        }
    }
    
    closeNotificationPanel() {
        this.notificationPanel.style.display = 'none';
    }
    
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount--;
            this.updateNotificationUI();
            this.saveNotifications();
            this.renderNotifications();
        }
    }
    
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.updateNotificationUI();
        this.saveNotifications();
        this.renderNotifications();
    }
    
    deleteNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            if (!this.notifications[index].read) {
                this.unreadCount--;
            }
            this.notifications.splice(index, 1);
            this.updateNotificationUI();
            this.saveNotifications();
            this.renderNotifications();
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar botones activos
        this.notificationPanel.querySelectorAll('.eco-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderNotifications(filter);
    }
    
    showSettings() {
        const settingsModal = document.createElement('div');
        settingsModal.className = 'eco-notification-settings-modal';
        settingsModal.innerHTML = `
            <div class="eco-modal-content">
                <div class="eco-modal-header">
                    <h3>Configuración de Notificaciones</h3>
                    <button class="eco-btn-icon" data-close-settings>
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                
                <div class="eco-modal-body">
                    <div class="eco-setting-item">
                        <label>
                            <input type="checkbox" id="push-enabled" ${this.permissions.push === 'granted' ? 'checked' : ''}>
                            Habilitar notificaciones push
                        </label>
                    </div>
                    
                    <div class="eco-setting-item">
                        <label>
                            <input type="checkbox" id="sound-enabled" ${this.permissions.sound ? 'checked' : ''}>
                            Habilitar sonidos de notificación
                        </label>
                    </div>
                    
                    <div class="eco-setting-item">
                        <label>Tipo de notificaciones:</label>
                        <div class="eco-notification-types">
                            <label><input type="checkbox" checked> Pedidos</label>
                            <label><input type="checkbox" checked> Promociones</label>
                            <label><input type="checkbox" checked> Reviews</label>
                            <label><input type="checkbox" checked> Mensajes</label>
                        </div>
                    </div>
                </div>
                
                <div class="eco-modal-footer">
                    <button class="eco-btn-eco" data-save-settings>Guardar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
        
        // Event listeners
        settingsModal.querySelector('[data-close-settings]').addEventListener('click', () => {
            settingsModal.remove();
        });
        
        settingsModal.querySelector('[data-save-settings]').addEventListener('click', () => {
            this.saveSettings(settingsModal);
            settingsModal.remove();
        });
    }
    
    saveSettings(modal) {
        const pushEnabled = modal.querySelector('#push-enabled').checked;
        const soundEnabled = modal.querySelector('#sound-enabled').checked;
        
        this.permissions.push = pushEnabled ? 'granted' : 'denied';
        this.permissions.sound = soundEnabled;
        
        this.savePermissions();
        
        if (pushEnabled && this.permissions.push !== 'granted') {
            this.requestPushPermission();
        }
    }
    
    loadNotifications() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
            }
        } catch {
            this.notifications = [];
            this.unreadCount = 0;
        }
    }
    
    saveNotifications() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                notifications: this.notifications,
                unreadCount: this.unreadCount
            }));
        } catch (error) {
            console.error('Error guardando notificaciones:', error);
        }
    }
    
    loadPermissions() {
        try {
            const saved = localStorage.getItem(this.options.storageKey + '_permissions');
            if (saved) {
                this.permissions = JSON.parse(saved);
            }
        } catch {
            // Usar permisos por defecto
        }
    }
    
    savePermissions() {
        try {
            localStorage.setItem(this.options.storageKey + '_permissions', JSON.stringify(this.permissions));
        } catch (error) {
            console.error('Error guardando permisos:', error);
        }
    }
    
    setupEventListeners() {
        // Cerrar panel al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.notificationPanel.contains(e.target) && !this.notificationBtn.contains(e.target)) {
                this.closeNotificationPanel();
            }
        });
    }
    
    destroy() {
        if (this.socket) {
            this.socket.close();
        }
        
        if (this.notificationPanel) {
            this.notificationPanel.remove();
        }
        
        if (this.notificationBtn) {
            this.notificationBtn.remove();
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay configuración de notificaciones
    const notificationConfig = document.querySelector('[data-eco-notifications]');
    if (notificationConfig && notificationConfig.dataset.ecoNotifications !== 'false') {
        window.ecoNotifications = new EcoNotifications({
            ...notificationConfig.dataset
        });
    }
});