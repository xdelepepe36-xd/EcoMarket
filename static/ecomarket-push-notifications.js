/**
 * EcoMarket - Sistema de Notificaciones Push
 * Sistema completo de notificaciones web push
 */

const EcoPushNotifications = {
    // Configuración
    config: {
        publicKey: '', // Se configurará dinámicamente
        applicationServerKey: '', // VAPID key
        subscribeEndpoint: '/api/push/subscribe',
        unsubscribeEndpoint: '/api/push/unsubscribe'
    },
    
    // Estado
    subscription: null,
    isSupported: false,
    permission: 'default',
    
    // Inicialización
    async init() {
        this.checkSupport();
        if (this.isSupported) {
            await this.loadSubscription();
            await this.checkPermission();
            this.setupUI();
        }
    },
    
    // Verificar soporte del navegador
    checkSupport() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        if (!this.isSupported) {
            console.log('Push notifications not supported');
        }
    },
    
    // Verificar permiso
    async checkPermission() {
        this.permission = Notification.permission;
    },
    
    // Cargar suscripción existente
    async loadSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();
        } catch (error) {
            console.error('Error loading subscription:', error);
        }
    },
    
    // Solicitar permiso y suscribir
    async subscribe() {
        if (!this.isSupported) {
            this.showError('Tu navegador no soporta notificaciones push');
            return false;
        }
        
        if (this.permission === 'denied') {
            this.showError('Las notificaciones están bloqueadas. Habilita las en la configuración del navegador.');
            return false;
        }
        
        try {
            // Solicitar permiso
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission !== 'granted') {
                this.showError('Permiso de notificación denegado');
                return false;
            }
            
            // Registrar service worker si no está registrado
            const registration = await navigator.serviceWorker.register('/sw.js');
            
            // Crear suscripción
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.config.publicKey)
            });
            
            this.subscription = subscription;
            
            // Enviar suscripción al servidor
            await this.sendSubscriptionToServer(subscription);
            
            this.showSuccess('¡Notificaciones activadas!');
            return true;
            
        } catch (error) {
            console.error('Error subscribing:', error);
            this.showError('Error al suscribirse a notificaciones');
            return false;
        }
    },
    
    // Cancelar suscripción
    async unsubscribe() {
        if (!this.subscription) {
            this.showError('No hay suscripción activa');
            return false;
        }
        
        try {
            await this.subscription.unsubscribe();
            await this.sendUnsubscriptionToServer();
            this.subscription = null;
            this.showSuccess('Notificaciones desactivadas');
            return true;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            this.showError('Error al desactivar notificaciones');
            return false;
        }
    },
    
    // Enviar suscripción al servidor
    async sendSubscriptionToServer(subscription) {
        const subscriptionData = JSON.parse(JSON.stringify(subscription));
        
        try {
            const response = await fetch(this.config.subscribeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: subscriptionData,
                    user_id: this.getUserId()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error sending subscription:', error);
            throw error;
        }
    },
    
    // Enviar cancelación al servidor
    async sendUnsubscriptionToServer() {
        try {
            const response = await fetch(this.config.unsubscribeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.getUserId()
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error sending unsubscription:', error);
        }
    },
    
    // Obtener ID de usuario
    getUserId() {
        // Intentar obtener del storage o del DOM
        const userId = localStorage.getItem('ecomarket_user_id') || 
                     document.body?.dataset?.userId || 
                     'guest';
        return userId;
    },
    
    // Configurar UI
    setupUI() {
        // Crear botón de notificaciones si no existe
        if (!document.getElementById('pushNotificationBtn')) {
            this.createNotificationButton();
        }
        
        // Actualizar estado del botón
        this.updateButtonState();
    },
    
    // Crear botón de notificaciones
    createNotificationButton() {
        const button = document.createElement('button');
        button.id = 'pushNotificationBtn';
        button.className = 'btn-notification';
        button.innerHTML = '<i class="bi bi-bell"></i>';
        button.title = 'Notificaciones';
        
        button.addEventListener('click', () => this.toggleSubscription());
        
        // Agregar al header o navbar
        const navbar = document.querySelector('.navbar') || document.querySelector('.header-container');
        if (navbar) {
            navbar.appendChild(button);
        }
    },
    
    // Actualizar estado del botón
    updateButtonState() {
        const button = document.getElementById('pushNotificationBtn');
        if (!button) return;
        
        if (this.subscription) {
            button.classList.add('active');
            button.innerHTML = '<i class="bi bi-bell-fill"></i>';
            button.title = 'Notificaciones activadas';
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="bi bi-bell"></i>';
            button.title = 'Activar notificaciones';
        }
    },
    
    // Toggle suscripción
    async toggleSubscription() {
        if (this.subscription) {
            await this.unsubscribe();
        } else {
            await this.subscribe();
        }
        this.updateButtonState();
    },
    
    // Mostrar notificación local (fallback)
    showLocalNotification(title, options = {}) {
        if (this.permission === 'granted') {
            new Notification(title, {
                icon: '/static/assets/logo-icon.png',
                badge: '/static/assets/badge-icon.png',
                ...options
            });
        }
    },
    
    // Utilidad: convertir base64 a Uint8Array
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    },
    
    // Mostrar mensaje de éxito
    showSuccess(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            alert(message);
        }
    },
    
    // Mostrar mensaje de error
    showError(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert(message);
        }
    },
    
    // Configurar clave pública del servidor
    setPublicKey(key) {
        this.config.publicKey = key;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (typeof EcoPushNotifications !== 'undefined') {
        EcoPushNotifications.init();
    }
});

// Exportar para uso global
window.EcoPushNotifications = EcoPushNotifications;