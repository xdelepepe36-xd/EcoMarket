/*
   EcoMarket - Checkout Wizard con Pasos Visuales
   Checkout multi-paso con validación en tiempo real
   Author: EcoMarket Team
   Version: 4.0
*/

class CheckoutWizard {
    constructor() {
        this.pasoActual = 1;
        this.totalPasos = 4;
        this.datosCheckout = {
            direccion: {},
            envio: {},
            pago: {},
            confirmacion: {}
        };
        this.init();
    }

    init() {
        this.inicializarPasos();
        this.inicializarEventListeners();
        this.cargarDatosGuardados();
        this.actualizarUI();
    }

    inicializarPasos() {
        this.pasos = [
            { id: 1, nombre: 'Dirección', icono: 'bi-geo-alt' },
            { id: 2, nombre: 'Envío', icono: 'bi-truck' },
            { id: 3, nombre: 'Pago', icono: 'bi-credit-card' },
            { id: 4, nombre: 'Confirmación', icono: 'bi-check-circle' }
        ];
    }

    inicializarEventListeners() {
        // Botón siguiente
        const btnSiguiente = document.getElementById('btn-siguiente-paso');
        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', () => {
                this.siguientePaso();
            });
        }

        // Botón anterior
        const btnAnterior = document.getElementById('btn-anterior-paso');
        if (btnAnterior) {
            btnAnterior.addEventListener('click', () => {
                this.anteriorPaso();
            });
        }

        // Botón finalizar compra
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', () => {
                this.finalizarCompra();
            });
        }

        // Validación en tiempo real
        this.inicializarValidacion();
    }

    inicializarValidacion() {
        // Validación de dirección
        const inputsDireccion = document.querySelectorAll('.input-direccion');
        inputsDireccion.forEach(input => {
            input.addEventListener('input', () => {
                this.validarPaso(1);
            });
        });

        // Validación de envío
        const inputsEnvio = document.querySelectorAll('.input-envio');
        inputsEnvio.forEach(input => {
            input.addEventListener('change', () => {
                this.validarPaso(2);
            });
        });

        // Validación de pago
        const inputsPago = document.querySelectorAll('.input-pago');
        inputsPago.forEach(input => {
            input.addEventListener('input', () => {
                this.validarPaso(3);
            });
        });
    }

    siguientePaso() {
        if (!this.validarPaso(this.pasoActual)) {
            this.mostrarError('Por favor completa todos los campos requeridos');
            return;
        }

        if (this.pasoActual < this.totalPasos) {
            this.pasoActual++;
            this.guardarDatosPaso(this.pasoActual - 1);
            this.actualizarUI();
        }
    }

    anteriorPaso() {
        if (this.pasoActual > 1) {
            this.pasoActual--;
            this.actualizarUI();
        }
    }

    validarPaso(paso) {
        let valido = true;

        switch (paso) {
            case 1: // Dirección
                const nombre = document.getElementById('direccion-nombre');
                const direccion = document.getElementById('direccion-linea1');
                const ciudad = document.getElementById('direccion-ciudad');
                const codigoPostal = document.getElementById('direccion-codigo-postal');
                const telefono = document.getElementById('direccion-telefono');

                valido = nombre?.value && direccion?.value && ciudad?.value && 
                         codigoPostal?.value && telefono?.value;
                break;

            case 2: // Envío
                const metodoEnvio = document.querySelector('input[name="metodo-envio"]:checked');
                valido = metodoEnvio !== null;
                break;

            case 3: // Pago
                const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
                const numeroTarjeta = document.getElementById('tarjeta-numero');
                const fechaExpiracion = document.getElementById('tarjeta-expiracion');
                const cvv = document.getElementById('tarjeta-cvv');

                if (metodoPago?.value === 'tarjeta') {
                    valido = numeroTarjeta?.value && fechaExpiracion?.value && cvv?.value;
                } else {
                    valido = metodoPago !== null;
                }
                break;

            case 4: // Confirmación
                valido = true;
                break;
        }

        return valido;
    }

    guardarDatosPaso(paso) {
        switch (paso) {
            case 1:
                this.datosCheckout.direccion = {
                    nombre: document.getElementById('direccion-nombre')?.value,
                    linea1: document.getElementById('direccion-linea1')?.value,
                    linea2: document.getElementById('direccion-linea2')?.value,
                    ciudad: document.getElementById('direccion-ciudad')?.value,
                    codigoPostal: document.getElementById('direccion-codigo-postal')?.value,
                    telefono: document.getElementById('direccion-telefono')?.value
                };
                break;

            case 2:
                const metodoEnvio = document.querySelector('input[name="metodo-envio"]:checked');
                this.datosCheckout.envio = {
                    metodo: metodoEnvio?.value,
                    costo: parseFloat(metodoEnvio?.dataset.costo || 0)
                };
                break;

            case 3:
                const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
                this.datosCheckout.pago = {
                    metodo: metodoPago?.value,
                    numero: document.getElementById('tarjeta-numero')?.value,
                    expiracion: document.getElementById('tarjeta-expiracion')?.value
                };
                break;
        }

        localStorage.setItem('ecomarket_checkout', JSON.stringify(this.datosCheckout));
    }

    cargarDatosGuardados() {
        const guardado = localStorage.getItem('ecomarket_checkout');
        if (guardado) {
            this.datosCheckout = JSON.parse(guardado);
            this.rellenarFormularios();
        }
    }

    rellenarFormularios() {
        // Rellenar dirección
        if (this.datosCheckout.direccion.nombre) {
            document.getElementById('direccion-nombre').value = this.datosCheckout.direccion.nombre;
            document.getElementById('direccion-linea1').value = this.datosCheckout.direccion.linea1;
            document.getElementById('direccion-linea2').value = this.datosCheckout.direccion.linea2;
            document.getElementById('direccion-ciudad').value = this.datosCheckout.direccion.ciudad;
            document.getElementById('direccion-codigo-postal').value = this.datosCheckout.direccion.codigoPostal;
            document.getElementById('direccion-telefono').value = this.datosCheckout.direccion.telefono;
        }

        // Rellenar envío
        if (this.datosCheckout.envio.metodo) {
            const radioEnvio = document.querySelector(`input[name="metodo-envio"][value="${this.datosCheckout.envio.metodo}"]`);
            if (radioEnvio) radioEnvio.checked = true;
        }

        // Rellenar pago
        if (this.datosCheckout.pago.metodo) {
            const radioPago = document.querySelector(`input[name="metodo-pago"][value="${this.datosCheckout.pago.metodo}"]`);
            if (radioPago) radioPago.checked = true;
            document.getElementById('tarjeta-numero').value = this.datosCheckout.pago.numero || '';
            document.getElementById('tarjeta-expiracion').value = this.datosCheckout.pago.expiracion || '';
        }
    }

    actualizarUI() {
        this.actualizarPasosIndicadores();
        this.actualizarContenidoPaso();
        this.actualizarBotones();
        this.actualizarResumen();
    }

    actualizarPasosIndicadores() {
        const contenedorPasos = document.getElementById('contenedor-pasos');
        if (!contenedorPasos) return;

        let html = '<div class="pasos-indicadores">';
        
        this.pasos.forEach((paso, indice) => {
            const estado = this.obtenerEstadoPaso(paso.id);
            const estadoClass = estado;
            
            html += `
                <div class="paso-indicador ${estadoClass}">
                    <div class="paso-icono">
                        ${estado === 'completado' ? '<i class="bi bi-check"></i>' : 
                          estado === 'actual' ? '<i class="bi ' + paso.icono + '"></i>' : 
                          '<i class="bi ' + paso.icono + '"></i>'}
                    </div>
                    <div class="paso-nombre">${paso.nombre}</div>
                    ${indice < this.pasos.length - 1 ? '<div class="paso-conector"></div>' : ''}
                </div>
            `;
        });
        
        html += '</div>';
        contenedorPasos.innerHTML = html;
    }

    obtenerEstadoPaso(pasoId) {
        if (pasoId < this.pasoActual) return 'completado';
        if (pasoId === this.pasoActual) return 'actual';
        return 'pendiente';
    }

    actualizarContenidoPaso() {
        // Ocultar todos los pasos
        document.querySelectorAll('.contenido-paso').forEach(el => {
            el.style.display = 'none';
        });

        // Mostrar paso actual
        const pasoActual = document.getElementById(`paso-${this.pasoActual}`);
        if (pasoActual) {
            pasoActual.style.display = 'block';
            // Animación de entrada
            pasoActual.style.opacity = '0';
            pasoActual.style.transform = 'translateX(20px)';
            setTimeout(() => {
                pasoActual.style.transition = 'all 0.3s ease';
                pasoActual.style.opacity = '1';
                pasoActual.style.transform = 'translateX(0)';
            }, 10);
        }
    }

    actualizarBotones() {
        const btnSiguiente = document.getElementById('btn-siguiente-paso');
        const btnAnterior = document.getElementById('btn-anterior-paso');
        const btnFinalizar = document.getElementById('btn-finalizar-compra');

        if (btnSiguiente) {
            btnSiguiente.style.display = this.pasoActual < this.totalPasos ? 'block' : 'none';
        }

        if (btnAnterior) {
            btnAnterior.style.display = this.pasoActual > 1 ? 'block' : 'none';
        }

        if (btnFinalizar) {
            btnFinalizar.style.display = this.pasoActual === this.totalPasos ? 'block' : 'none';
        }
    }

    actualizarResumen() {
        const resumen = document.getElementById('resumen-checkout');
        if (!resumen) return;

        // Calcular totales
        const subtotal = this.obtenerSubtotal();
        const envio = this.datosCheckout.envio.costo || 0;
        const total = subtotal + envio;

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

    obtenerSubtotal() {
        // Obtener del carrito
        const itemsCarrito = document.querySelectorAll('.item-carrito');
        let subtotal = 0;

        itemsCarrito.forEach(item => {
            const precio = parseFloat(item.dataset.precio);
            const cantidad = parseInt(item.dataset.cantidad);
            subtotal += precio * cantidad;
        });

        return subtotal;
    }

    async finalizarCompra() {
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.textContent = 'Procesando...';
        }

        try {
            const response = await fetch('/api/pedidos/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.datosCheckout)
            });

            if (response.ok) {
                const data = await response.json();
                this.mostrarExito(data.pedidoId);
                localStorage.removeItem('ecomarket_checkout');
            } else {
                this.mostrarError('Error al procesar la compra');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        } finally {
            if (btnFinalizar) {
                btnFinalizar.disabled = false;
                btnFinalizar.textContent = 'Finalizar Compra';
            }
        }
    }

    mostrarExito(pedidoId) {
        const modal = document.getElementById('modal-exito-compra');
        if (modal) {
            modal.style.display = 'flex';
            const numeroPedido = modal.querySelector('.numero-pedido');
            if (numeroPedido) {
                numeroPedido.textContent = pedidoId;
            }
        }
    }

    mostrarError(mensaje) {
        const alerta = document.getElementById('alerta-checkout');
        if (alerta) {
            alerta.textContent = mensaje;
            alerta.style.display = 'block';
            setTimeout(() => {
                alerta.style.display = 'none';
            }, 5000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-wizard')) {
        window.checkoutWizard = new CheckoutWizard();
    }
});