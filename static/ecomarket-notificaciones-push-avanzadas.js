/*
   EcoMarket - Sistema de Notificaciones Push Avanzadas
   Notificaciones en tiempo real para pedidos, respuestas, ofertas y alertas de stock
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaNotificacionesPush {
    constructor() {
        this.permisoConcedido = false;
        this.subscripcion = null;
        this.init();
    }

    init() {
        this.verificarSoporte();
        this.cargarPermisoGuardado();
        this.inicializarEventListeners();
        this.solicitarPermisoInicial();
    }

    verificarSoporte() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker no soportado');
            return false;
        }

        if (!('PushManager' in window)) {
            console.warn('Push API no soportado');
            return false;
        }

        if (!('Notification' in window)) {
            console.warn('Notification API no soportada');
            return false;
        }

        return true;
    }

    async solicitarPermisoInicial() {
        const usuarioQuiereNotificaciones = localStorage.getItem('ecomarket_notificaciones_activas');
        
        if (usuarioQuiereNotificaciones === 'true') {
            await this.solicitarPermiso();
        }
    }

    async solicitarPermiso() {
        if (!('Notification' in window)) {
            this.mostrarError('Tu navegador no soporta notificaciones');
            return false;
        }

        const permiso = await Notification.requestPermission();
        
        if (permiso === 'granted') {
            this.permisoConcedido = true;
            localStorage.setItem('ecomarket_notificaciones_activas', 'true');
            await this.registrarServiceWorker();
            await this.suscribirAPush();
            this.mostrarExito('Notificaciones activadas');
            this.actualizarUIPermiso(true);
            return true;
        } else if (permiso === 'denied') {
            this.permisoConcedido = false;
            localStorage.setItem('ecomarket_notificaciones_activas', 'false');
            this.mostrarError('Notificaciones denegadas');
            this.actualizarUIPermiso(false);
            return false;
        } else {
            this.mostrarInfo('Permiso pendiente');
            return false;
        }
    }

    async registrarServiceWorker() {
        try {
            const registro = await navigator.serviceWorker.register('/sw-push.js');
            console.log('Service Worker registrado:', registro);
            return registro;
        } catch (error) {
            console.error('Error registrando Service Worker:', error);
            return null;
        }
    }

    async suscribirAPush() {
        try {
            const registro = await navigator.serviceWorker.getRegistration();
            
            if (!registro) {
                console.error('No hay Service Worker registrado');
                return null;
            }

            const sub = await registro.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.obtenerVAPIDPublicKey())
            });

            this.subscripcion = sub;
            localStorage.setItem('ecomarket_push_subscription', JSON.stringify(sub));
            
            // Enviar subscripción al servidor
            await this.enviarSubscripcionAlServidor(sub);
            
            return sub;
        } catch (error) {
            console.error('Error suscribiendo a Push:', error);
            return null;
        }
    }

    async enviarSubscripcionAlServidor(subscripcion) {
        try {
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: subscripcion,
                    usuario_id: this.obtenerUsuarioId()
                })
            });

            if (response.ok) {
                console.log('Subscripción enviada al servidor');
            }
        } catch (error) {
            console.error('Error enviando subscripción:', error);
        }
    }

    obtenerVAPIDPublicKey() {
        // Debe configurarse en el servidor
        return document.body.dataset.vapidPublicKey || '';
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

    obtenerUsuarioId() {
        return document.body.dataset.userId || '';
    }

    async desactivarNotificaciones() {
        try {
            localStorage.setItem('ecomarket_notificaciones_activas', 'false');
            
            if (this.subscripcion) {
                await this.subscripcion.unsubscribe();
                this.subscripcion = null;
            }
            
            localStorage.removeItem('ecomarket_push_subscription');
            this.permisoConcedido = false;
            this.actualizarUIPermiso(false);
            this.mostrarExito('Notificaciones desactivadas');
        } catch (error) {
            this.mostrarError('Error desactivando notificaciones');
        }
    }

    async probarNotificacion() {
        if (!this.permisoConcedido) {
            this.mostrarError('Activa las notificaciones primero');
            return;
        }

        const notificacion = new Notification('EcoMarket - Prueba', {
            body: '¡Las notificaciones están funcionando correctamente!',
            icon: '/static/assets/icon-192.png',
            badge: '/static/assets/icon-72.png',
            tag: 'prueba-notificacion',
            data: {
                url: window.location.href
            }
        });

        notificacion.onclick = () => {
            window.focus();
            notificacion.close();
        };
    }

    configurarTiposNotificaciones() {
        const configuracion = JSON.parse(localStorage.getItem('ecomarket_notificaciones_config') || '{}');
        
        return {
            pedidos: configuracion.pedidos !== false,
            respuestas: configuracion.respuestas !== false,
            ofertas: configuracion.ofertas !== false,
            stock: configuracion.stock !== false,
            ...configuracion
        };
    }

    guardarConfiguracion(config) {
        localStorage.setItem('ecomarket_notificaciones_config', JSON.stringify(config));
    }

    inicializarEventListeners() {
        // Botón activar notificaciones
        const btnActivar = document.getElementById('btn-activar-notificaciones');
        if (btnActivar) {
            btnActivar.addEventListener('click', () => {
                this.solicitarPermiso();
            });
        }

        // Botón desactivar notificaciones
        const btnDesactivar = document.getElementById('btn-desactivar-notificaciones');
        if (btnDesactivar) {
            btnDesactivar.addEventListener('click', () => {
                this.desactivarNotificaciones();
            });
        }

        // Botón probar notificación
        const btnProbar = document.getElementById('btn-probar-notificacion');
        if (btnProbar) {
            btnProbar.addEventListener('click', () => {
                this.probarNotificacion();
            });
        }

        // Checkboxes de configuración
        const checkPedidos = document.getElementById('check-notif-pedidos');
        const checkRespuestas = document.getElementById('check-notif-respuestas');
        const checkOfertas = document.getElementById('check-notif-ofertas');
        const checkStock = document.getElementById('check-notif-stock');

        if (checkPedidos) {
            checkPedidos.addEventListener('change', () => {
                this.actualizarConfiguracion('pedidos', checkPedidos.checked);
            });
        }

        if (checkRespuestas) {
            checkRespuestas.addEventListener('change', () => {
                this.actualizarConfiguracion('respuestas', checkRespuestas.checked);
            });
        }

        if (checkOfertas) {
            checkOfertas.addEventListener('change', () => {
                this.actualizarConfiguracion('ofertas', checkOfertas.checked);
            });
        }

        if (checkStock) {
            checkStock.addEventListener('change', () => {
                this.actualizarConfiguracion('stock', checkStock.checked);
            });
        }
    }

    actualizarConfiguracion(tipo, activo) {
        const config = this.configurarTiposNotificaciones();
        config[tipo] = activo;
        this.guardarConfiguracion(config);
    }

    cargarPermisoGuardado() {
        const permisoGuardado = localStorage.getItem('ecomarket_notificaciones_activas');
        
        if (permisoGuardado === 'true') {
            this.permisoConcedido = true;
            this.actualizarUIPermiso(true);
        } else {
            this.actualizarUIPermiso(false);
        }
    }

    actualizarUIPermiso(activo) {
        const btnActivar = document.getElementById('btn-activar-notificaciones');
        const btnDesactivar = document.getElementById('btn-desactivar-notificaciones');
        const estado = document.getElementById('estado-notificaciones');

        if (btnActivar) {
            btnActivar.style.display = activo ? 'none' : 'block';
        }

        if (btnDesactivar) {
            btnDesactivar.style.display = activo ? 'block' : 'none';
        }

        if (estado) {
            estado.textContent = activo ? 'Activadas' : 'Desactivadas';
            estado.className = `estado-notificaciones ${activo ? 'activo' : 'inactivo'}`;
        }
    }

    mostrarExito(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-exito';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    mostrarError(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-error';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    mostrarInfo(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-info';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    obtenerEstado() {
        return {
            permisoConcedido: this.permisoConcedido,
            subscripcion: this.subscripcion,
            configuracion: this.configurarTiposNotificaciones()
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sistema-notificaciones')) {
        window.sistemaNotificacionesPush = new SistemaNotificacionesPush();
    }
});
