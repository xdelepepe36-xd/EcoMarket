/*
   EcoMarket - Sistema de Seguimiento de Pedidos
   Seguimiento en tiempo real del estado de pedidos
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaSeguimientoPedidos {
    constructor() {
        this.estadosPedido = {
            'pendiente': { icono: 'bi-clock', color: '#ffc107', texto: 'Pendiente' },
            'confirmado': { icono: 'bi-check-circle', color: '#17a2b8', texto: 'Confirmado' },
            'preparando': { icono: 'bi-box-seam', color: '#6610f2', texto: 'Preparando' },
            'enviado': { icono: 'bi-truck', color: '#fd7e14', texto: 'Enviado' },
            'entregado': { icono: 'bi-check2-all', color: '#28a745', texto: 'Entregado' },
            'cancelado': { icono: 'bi-x-circle', color: '#dc3545', texto: 'Cancelado' }
        };
        this.init();
    }

    init() {
        this.inicializarEventListeners();
        this.actualizarEstadoPedidos();
    }

    inicializarEventListeners() {
        // Actualizar estado al cargar
        window.addEventListener('load', () => {
            this.actualizarEstadoPedidos();
        });

        // Actualizar periódicamente (cada 30 segundos)
        setInterval(() => {
            this.actualizarEstadoPedidos();
        }, 30000);
    }

    async actualizarEstadoPedidos() {
        const elementosPedido = document.querySelectorAll('.seguimiento-pedido');
        
        elementosPedido.forEach(elemento => {
            const pedidoId = elemento.dataset.pedidoId;
            this.obtenerEstadoPedido(pedidoId);
        });
    }

    async obtenerEstadoPedido(pedidoId) {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}/estado`);
            if (response.ok) {
                const data = await response.json();
                this.actualizarEstadoUI(pedidoId, data.estado, data.detalle);
            }
        } catch (error) {
            console.error('Error obteniendo estado del pedido:', error);
        }
    }

    actualizarEstadoUI(pedidoId, estado, detalle) {
        const elemento = document.querySelector(`[data-pedido-id="${pedidoId}"]`);
        if (!elemento) return;

        const estadoInfo = this.estadosPedido[estado] || this.estadosPedido['pendiente'];
        
        // Actualizar icono de estado
        const iconoEstado = elemento.querySelector('.icono-estado');
        if (iconoEstado) {
            iconoEstado.className = `bi ${estadoInfo.icono} icono-estado`;
            iconoEstado.style.color = estadoInfo.color;
        }

        // Actualizar texto de estado
        const textoEstado = elemento.querySelector('.texto-estado');
        if (textoEstado) {
            textoEstado.textContent = estadoInfo.texto;
            textoEstado.style.color = estadoInfo.color;
        }

        // Actualizar detalle
        const detalleEstado = elemento.querySelector('.detalle-estado');
        if (detalleEstado && detalle) {
            detalleEstado.textContent = detalle;
        }

        // Actualizar timeline
        this.actualizarTimeline(elemento, estado);
    }

    actualizarTimeline(elemento, estadoActual) {
        const timeline = elemento.querySelector('.timeline-pedido');
        if (!timeline) return;

        const ordenEstados = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'];
        const indiceActual = ordenEstados.indexOf(estadoActual);

        ordenEstados.forEach((estado, indice) => {
            const paso = timeline.querySelector(`[data-estado="${estado}"]`);
            if (!paso) return;

            const estadoInfo = this.estadosPedido[estado];
            
            if (indice < indiceActual) {
                // Estados completados
                paso.classList.add('completado');
                paso.classList.remove('actual', 'pendiente');
                paso.querySelector('.icono-paso').className = `bi bi-check-circle icono-paso`;
                paso.querySelector('.icono-paso').style.color = '#28a745';
            } else if (indice === indiceActual) {
                // Estado actual
                paso.classList.add('actual');
                paso.classList.remove('completado', 'pendiente');
                paso.querySelector('.icono-paso').className = `bi ${estadoInfo.icono} icono-paso`;
                paso.querySelector('.icono-paso').style.color = estadoInfo.color;
            } else {
                // Estados pendientes
                paso.classList.add('pendiente');
                paso.classList.remove('completado', 'actual');
                paso.querySelector('.icono-paso').className = `bi bi-circle icono-paso`;
                paso.querySelector('.icono-paso').style.color = '#6c757d';
            }
        });
    }

    mostrarTimeline(pedidoId) {
        const elemento = document.querySelector(`[data-pedido-id="${pedidoId}"]`);
        if (!elemento) return;

        const timelineContainer = elemento.querySelector('.timeline-container');
        if (timelineContainer) {
            timelineContainer.style.display = timelineContainer.style.display === 'none' ? 'block' : 'none';
        }
    }

    calcularTiempoEstimado(estado) {
        const tiempos = {
            'pendiente': '1-2 horas',
            'confirmado': '24-48 horas',
            'preparando': '2-3 días',
            'enviado': '3-5 días',
            'entregado': 'Entregado'
        };
        return tiempos[estado] || 'Sin estimación';
    }

    obtenerHistorialEstados(pedidoId) {
        // Simular historial de estados
        return [
            { estado: 'pendiente', fecha: '2026-10-28 10:00', detalle: 'Pedido recibido' },
            { estado: 'confirmado', fecha: '2026-10-28 10:30', detalle: 'Pago confirmado' },
            { estado: 'preparando', fecha: '2026-10-28 14:00', detalle: 'Preparando envío' }
        ];
    }

    mostrarHistorial(pedidoId) {
        const historial = this.obtenerHistorialEstados(pedidoId);
        const modal = document.getElementById('modal-historial-pedido');
        
        if (modal) {
            const contenedor = modal.querySelector('.contenedor-historial');
            if (contenedor) {
                let html = '<div class="lista-historial">';
                
                historial.forEach(item => {
                    const estadoInfo = this.estadosPedido[item.estado];
                    html += `
                        <div class="item-historial">
                            <div class="icono-historial" style="color: ${estadoInfo.color}">
                                <i class="bi ${estadoInfo.icono}"></i>
                            </div>
                            <div class="contenido-historial">
                                <div class="estado-historial">${estadoInfo.texto}</div>
                                <div class="fecha-historial">${item.fecha}</div>
                                <div class="detalle-historial">${item.detalle}</div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                contenedor.innerHTML = html;
            }
            
            modal.style.display = 'flex';
        }
    }

    cerrarHistorial() {
        const modal = document.getElementById('modal-historial-pedido');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    agregarNotificacionEstado(pedidoId, estado, mensaje) {
        const notificaciones = JSON.parse(localStorage.getItem('ecomarket_notificaciones') || '[]');
        
        notificaciones.push({
            id: Date.now(),
            tipo: 'pedido',
            pedidoId: pedidoId,
            estado: estado,
            mensaje: mensaje,
            fecha: new Date().toISOString(),
            leida: false
        });
        
        localStorage.setItem('ecomarket_notificaciones', JSON.stringify(notificaciones));
    }

    mostrarNotificacionPush(pedidoId, estado) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const estadoInfo = this.estadosPedido[estado];
            new Notification('Actualización de Pedido', {
                body: `Tu pedido #${pedidoId} está: ${estadoInfo.texto}`,
                icon: '/static/assets/icon-192.png'
            });
        }
    }

    solicitarPermisoNotificaciones() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.mostrarNotificacion('Notificaciones activadas', 'success');
                }
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.seguimiento-pedido')) {
        window.sistemaSeguimientoPedidos = new SistemaSeguimientoPedidos();
    }
});