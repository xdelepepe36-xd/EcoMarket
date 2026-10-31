/*
   EcoMarket - Sistema de Alertas de Precio
   Alertas cuando el precio baja o cuando vuelve a estar en stock
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaAlertasPrecio {
    constructor() {
        this.alertas = [];
        this.init();
    }

    init() {
        this.cargarAlertasGuardadas();
        this.inicializarEventListeners();
        this.verificarAlertasPeriodicamente();
    }

    async cargarAlertasGuardadas() {
        try {
            const response = await fetch('/api/alertas/usuario');
            if (response.ok) {
                const data = await response.json();
                this.alertas = data.alertas;
                this.renderizarAlertas();
            }
        } catch (error) {
            console.error('Error cargando alertas:', error);
        }
    }

    inicializarEventListeners() {
        // Botón crear alerta de precio
        const btnAlertaPrecio = document.getElementById('btn-crear-alerta-precio');
        if (btnAlertaPrecio) {
            btnAlertaPrecio.addEventListener('click', () => {
                this.abrirModalAlertaPrecio();
            });
        }

        // Botón crear alerta de stock
        const btnAlertaStock = document.getElementById('btn-crear-alerta-stock');
        if (btnAlertaStock) {
            btnAlertaStock.addEventListener('click', () => {
                this.abrirModalAlertaStock();
            });
        }

        // Formulario alerta precio
        const formAlertaPrecio = document.getElementById('form-alerta-precio');
        if (formAlertaPrecio) {
            formAlertaPrecio.addEventListener('submit', (e) => {
                e.preventDefault();
                this.crearAlertaPrecio();
            });
        }

        // Formulario alerta stock
        const formAlertaStock = document.getElementById('form-alerta-stock');
        if (formAlertaStock) {
            formAlertaStock.addEventListener('submit', (e) => {
                e.preventDefault();
                this.crearAlertaStock();
            });
        }

        // Botón eliminar alerta
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-alerta')) {
                const alertaId = e.target.dataset.alertaId;
                this.eliminarAlerta(alertaId);
            }
        });

        // Cerrar modales
        const btnCerrarAlertaPrecio = document.getElementById('btn-cerrar-alerta-precio');
        const btnCerrarAlertaStock = document.getElementById('btn-cerrar-alerta-stock');
        
        if (btnCerrarAlertaPrecio) {
            btnCerrarAlertaPrecio.addEventListener('click', () => {
                this.cerrarModal('modal-alerta-precio');
            });
        }
        
        if (btnCerrarAlertaStock) {
            btnCerrarAlertaStock.addEventListener('click', () => {
                this.cerrarModal('modal-alerta-stock');
            });
        }
    }

    async crearAlertaPrecio() {
        const productoId = document.getElementById('alerta-precio-producto-id')?.value;
        const precioMaximo = parseFloat(document.getElementById('alerta-precio-maximo')?.value);

        if (!productoId || !precioMaximo) {
            this.mostrarError('Por favor completa todos los campos');
            return;
        }

        try {
            const response = await fetch('/api/alertas/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipo: 'precio',
                    producto_id: productoId,
                    precio_maximo: precioMaximo
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.alertas.push(data.alerta);
                this.renderizarAlertas();
                this.cerrarModal('modal-alerta-precio');
                this.mostrarExito('Alerta de precio creada');
            } else {
                this.mostrarError('Error al crear alerta');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async crearAlertaStock() {
        const productoId = document.getElementById('alerta-stock-producto-id')?.value;

        if (!productoId) {
            this.mostrarError('Por favor selecciona un producto');
            return;
        }

        try {
            const response = await fetch('/api/alertas/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipo: 'stock',
                    producto_id: productoId
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.alertas.push(data.alerta);
                this.renderizarAlertas();
                this.cerrarModal('modal-alerta-stock');
                this.mostrarExito('Alerta de stock creada');
            } else {
                this.mostrarError('Error al crear alerta');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async eliminarAlerta(alertaId) {
        try {
            const response = await fetch(`/api/alertas/${alertaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.alertas = this.alertas.filter(a => a.id !== parseInt(alertaId));
                this.renderizarAlertas();
                this.mostrarExito('Alerta eliminada');
            } else {
                this.mostrarError('Error al eliminar alerta');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async verificarAlertasPeriodicamente() {
        // Verificar alertas cada 5 minutos
        setInterval(async () => {
            await this.verificarAlertas();
        }, 300000);
    }

    async verificarAlertas() {
        try {
            const response = await fetch('/api/alertas/verificar');
            if (response.ok) {
                const data = await response.json();
                data.alertas_activadas.forEach(alerta => {
                    this.notificarAlerta(alerta);
                });
            }
        } catch (error) {
            console.error('Error verificando alertas:', error);
        }
    }

    notificarAlerta(alerta) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const titulo = alerta.tipo === 'precio' 
                ? '¡Precio bajado!' 
                : '¡Producto disponible!';
            
            const cuerpo = alerta.tipo === 'precio'
                ? `${alerta.producto} ahora está a S/ ${alerta.precio_actual}`
                : `${alerta.producto} está disponible nuevamente`;

            new Notification(titulo, {
                body: cuerpo,
                icon: '/static/assets/icon-192.png',
                tag: `alerta-${alerta.id}`,
                data: { url: `/producto/${alerta.producto_id}` }
            }).onclick = () => {
                window.location.href = `/producto/${alerta.producto_id}`;
            };
        }
    }

    renderizarAlertas() {
        const contenedor = document.getElementById('contenedor-alertas');
        if (!contenedor) return;

        if (this.alertas.length === 0) {
            contenedor.innerHTML = '<p class="sin-alertas">No tienes alertas configuradas</p>';
            return;
        }

        let html = '<div class="lista-alertas">';
        
        this.alertas.forEach(alerta => {
            const esPrecio = alerta.tipo === 'precio';
            const icono = esPrecio ? 'bi-tag' : 'bi-box-seam';
            const titulo = esPrecio 
                ? `Alerta de precio: S/ ${alerta.precio_maximo}` 
                : 'Alerta de stock';
            const fecha = this.formatearFecha(alerta.fecha_creacion);
            
            html += `
                <div class="item-alerta">
                    <div class="alerta-icono">
                        <i class="bi ${icono}"></i>
                    </div>
                    <div class="alerta-info">
                        <div class="alerta-titulo">${titulo}</div>
                        <div class="alerta-producto">${alerta.producto}</div>
                        <div class="alerta-fecha">Creada: ${fecha}</div>
                    </div>
                    <button class="btn-eliminar-alerta" data-alerta-id="${alerta.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    abrirModalAlertaPrecio() {
        const modal = document.getElementById('modal-alerta-precio');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    abrirModalAlertaStock() {
        const modal = document.getElementById('modal-alerta-stock');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    formatearFecha(fechaIso) {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sistema-alertas')) {
        window.sistemaAlertasPrecio = new SistemaAlertasPrecio();
    }
});
