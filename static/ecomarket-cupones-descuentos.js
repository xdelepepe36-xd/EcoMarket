/*
   EcoMarket - Sistema de Cupones y Descuentos
   Cupones, códigos promocionales, descuentos por primera compra, cashback
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaCupones {
    constructor() {
        this.cuponesDisponibles = [];
        this.cuponAplicado = null;
        this.init();
    }

    init() {
        this.cargarCuponesDisponibles();
        this.inicializarEventListeners();
        this.cargarCuponGuardado();
    }

    async cargarCuponesDisponibles() {
        try {
            const response = await fetch('/api/cupones/disponibles');
            if (response.ok) {
                const data = await response.json();
                this.cuponesDisponibles = data.cupones;
                this.renderizarCupones();
            }
        } catch (error) {
            console.error('Error cargando cupones:', error);
        }
    }

    inicializarEventListeners() {
        // Input de código de cupón
        const inputCupon = document.getElementById('input-cupon');
        const btnAplicar = document.getElementById('btn-aplicar-cupon');
        
        if (inputCupon && btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                this.aplicarCupon(inputCupon.value);
            });
            
            inputCupon.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.aplicarCupon(inputCupon.value);
                }
            });
        }

        // Botón remover cupón
        const btnRemover = document.getElementById('btn-remover-cupon');
        if (btnRemover) {
            btnRemover.addEventListener('click', () => {
                this.removerCupon();
            });
        }

        // Cupones de clic rápido
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cupon-rapido')) {
                const codigo = e.target.dataset.codigo;
                this.aplicarCupon(codigo);
            }
        });
    }

    async aplicarCupon(codigo) {
        if (!codigo || !codigo.trim()) {
            this.mostrarError('Por favor ingresa un código de cupón');
            return;
        }

        try {
            const response = await fetch('/api/cupones/aplicar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ codigo: codigo.trim() })
            });

            if (response.ok) {
                const data = await response.json();
                this.cuponAplicado = data.cupon;
                this.guardarCupon(data.cupon);
                this.actualizarUIConCupon(data.cupon);
                this.mostrarExito(`¡Cupón aplicado! Ahorras S/ ${data.descuento.toFixed(2)}`);
            } else {
                const error = await response.json();
                this.mostrarError(error.mensaje || 'Cupón inválido o expirado');
            }
        } catch (error) {
            this.mostrarError('Error al aplicar cupón');
        }
    }

    async removerCupon() {
        try {
            const response = await fetch('/api/cupones/remover', {
                method: 'POST'
            });

            if (response.ok) {
                this.cuponAplicado = null;
                localStorage.removeItem('ecomarket_cupon');
                this.actualizarUISinCupon();
                this.mostrarExito('Cupón removido');
            }
        } catch (error) {
            this.mostrarError('Error al remover cupón');
        }
    }

    renderizarCupones() {
        const contenedor = document.getElementById('contenedor-cupones');
        if (!contenedor) return;

        if (this.cuponesDisponibles.length === 0) {
            contenedor.innerHTML = '<p class="sin-cupones">No hay cupones disponibles en este momento</p>';
            return;
        }

        let html = '<div class="grid-cupones">';
        
        this.cuponesDisponibles.forEach(cupon => {
            const esPrimeraCompra = cupon.tipo === 'primera_compra';
            const esCashback = cupon.tipo === 'cashback';
            
            html += `
                <div class="card-cupon ${cupon.aplicado ? 'aplicado' : ''}">
                    <div class="cupon-header">
                        <div class="cupon-descuento">
                            ${esCashback ? `${cupon.descuento}% Cashback` : `${cupon.descuento}% OFF`}
                        </div>
                        ${esPrimeraCompra ? '<span class="badge-primera">Primera Compra</span>' : ''}
                    </div>
                    <div class="cupon-codigo">${cupon.codigo}</div>
                    <div class="cupon-descripcion">${cupon.descripcion}</div>
                    <div class="cupon-condiciones">
                        <small>Mínimo: S/ ${cupon.minimo} | Expira: ${this.formatearFecha(cupon.expira)}</small>
                    </div>
                    <button class="btn-cupon-rapido" data-codigo="${cupon.codigo}" ${cupon.aplicado ? 'disabled' : ''}>
                        ${cupon.aplicado ? 'Aplicado' : 'Aplicar'}
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    actualizarUIConCupon(cupon) {
        // Actualizar resumen del carrito
        const subtotal = this.obtenerSubtotal();
        const descuento = subtotal * (cupon.descuento / 100);
        const envio = this.obtenerCostoEnvio();
        const total = subtotal - descuento + envio;

        const resumen = document.getElementById('resumen-carrito');
        if (resumen) {
            resumen.innerHTML = `
                <div class="resumen-item">
                    <span>Subtotal</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="resumen-item descuento">
                    <span>Descuento (${cupon.descuento}%)</span>
                    <span>-S/ ${descuento.toFixed(2)}</span>
                </div>
                <div class="resumen-item">
                    <span>Envío</span>
                    <span>S/ ${envio.toFixed(2)}</span>
                </div>
                <div class="resumen-item total">
                    <span>Total</span>
                    <span>S/ ${total.toFixed(2)}</span>
                </div>
            `;
        }

        // Mostrar cupón aplicado
        const cuponInfo = document.getElementById('cupon-aplicado-info');
        if (cuponInfo) {
            cuponInfo.style.display = 'flex';
            cuponInfo.innerHTML = `
                <span class="cupon-codigo-aplicado">${cupon.codigo}</span>
                <span class="cupon-descuento-aplicado">-${cupon.descuento}%</span>
                <button id="btn-remover-cupon" class="btn-remover-cupon">✕</button>
            `;
        }

        // Ocultar input de cupón
        const inputContainer = document.getElementById('input-cupon-container');
        if (inputContainer) {
            inputContainer.style.display = 'none';
        }
    }

    actualizarUISinCupon() {
        const subtotal = this.obtenerSubtotal();
        const envio = this.obtenerCostoEnvio();
        const total = subtotal + envio;

        const resumen = document.getElementById('resumen-carrito');
        if (resumen) {
            resumen.innerHTML = `
                <div class="resumen-item">
                    <span>Subtotal</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="resumen-item">
                    <span>Envío</span>
                    <span>S/ ${envio.toFixed(2)}</span>
                </div>
                <div class="resumen-item total">
                    <span>Total</span>
                    <span>S/ ${total.toFixed(2)}</span>
                </div>
            `;
        }

        // Ocultar cupón aplicado
        const cuponInfo = document.getElementById('cupon-aplicado-info');
        if (cuponInfo) {
            cuponInfo.style.display = 'none';
        }

        // Mostrar input de cupón
        const inputContainer = document.getElementById('input-cupon-container');
        if (inputContainer) {
            inputContainer.style.display = 'flex';
        }
    }

    obtenerSubtotal() {
        const itemsCarrito = document.querySelectorAll('.item-carrito');
        let subtotal = 0;

        itemsCarrito.forEach(item => {
            const precio = parseFloat(item.dataset.precio);
            const cantidad = parseInt(item.dataset.cantidad);
            subtotal += precio * cantidad;
        });

        return subtotal;
    }

    obtenerCostoEnvio() {
        const metodoEnvio = document.querySelector('input[name="metodo-envio"]:checked');
        if (metodoEnvio) {
            return parseFloat(metodoEnvio.dataset.costo || 0);
        }
        return 0;
    }

    guardarCupon(cupon) {
        localStorage.setItem('ecomarket_cupon', JSON.stringify(cupon));
    }

    cargarCuponGuardado() {
        const guardado = localStorage.getItem('ecomarket_cupon');
        if (guardado) {
            this.cuponAplicado = JSON.parse(guardado);
            this.actualizarUIConCupon(this.cuponAplicado);
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

    obtenerCuponAplicado() {
        return this.cuponAplicado;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sistema-cupones')) {
        window.sistemaCupones = new SistemaCupones();
    }
});
