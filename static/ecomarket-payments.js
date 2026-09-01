/**
 * EcoMarket - Sistema de Pagos
 * Integración con Stripe y PayPal
 */

const EcoPayments = {
    stripe: null,
    paypal: null,
    config: {
        stripePublicKey: '',
        stripeClientId: '',
        paypalClientId: ''
    },

    init() {
        try {
            this.loadConfig();
            this.initStripe();
            this.initPayPal();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando sistema de pagos:', error);
        }
    },

    loadConfig() {
        try {
            this.config.stripePublicKey = window.STRIPE_PUBLIC_KEY || '';
            this.config.stripeClientId = window.STRIPE_CLIENT_ID || '';
            this.config.paypalClientId = window.PAYPAL_CLIENT_ID || '';
        } catch (error) {
            console.error('Error cargando configuración de pagos:', error);
        }
    },

    initStripe() {
        if (!this.config.stripePublicKey) {
            console.log('Stripe no configurado');
            return;
        }

        try {
            this.stripe = Stripe(this.config.stripePublicKey);
            console.log('Stripe inicializado');
        } catch (error) {
            console.error('Error inicializando Stripe:', error);
        }
    },

    initPayPal() {
        if (!this.config.paypalClientId) {
            console.log('PayPal no configurado');
            return;
        }

        try {
            // Inicializar PayPal SDK
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.paypalClientId}&currency=PEN`;
            script.addEventListener('load', () => {
                paypal.Buttons().render('#paypal-button-container', {
                    createOrder: (data, actions) => {
                        return fetch('/api/create-paypal-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                cart: this.getCartData()
                            })
                        })
                        .then(res => res.json())
                        .then(order => {
                            return order.id;
                        });
                    },
                    onApprove: (data, actions) => {
                        return fetch('/api/capture-paypal-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                orderID: data.orderID
                            })
                        })
                        .then(res => res.json())
                        .then(details => {
                            alert('Pago completado: ' + details.status);
                            window.location.href = '/confirmacion';
                        });
                    }
                });
            });
            document.head.appendChild(script);
            console.log('PayPal inicializado');
        } catch (error) {
            console.error('Error inicializando PayPal:', error);
        }
    },

    getCartData() {
        // Obtener datos del carrito del localStorage
        try {
            const cart = localStorage.getItem('ecomarket-cart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error obteniendo datos del carrito:', error);
            return [];
        }
    },

    async processStripePayment(paymentMethodId, billingDetails) {
        if (!this.stripe) {
            if (window.EcoToast) {
                EcoToast.show('Error', 'Stripe no está configurado', 'error');
            }
            return false;
        }

        try {
            const cart = this.getCartData();
            const response = await fetch('/api/create-stripe-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: cart,
                    payment_method_id: paymentMethodId,
                    billing_details: billingDetails
                })
            });

            const { clientSecret } = await response.json();

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(
                this.config.stripePublicKey,
                clientSecret,
                {
                    payment_method: {
                        card: paymentMethodId,
                        billing_details: billingDetails
                    },
                    setup_future_usage: 'off_session'
                }
            );

            if (error) {
                console.error('Error en pago Stripe:', error);
                if (window.EcoToast) {
                    EcoToast.show('Error en pago', error.message, 'error');
                }
                return false;
            }

            if (paymentIntent.status === 'succeeded') {
                if (window.EcoToast) {
                    EcoToast.show('Pago exitoso', 'Tu pago ha sido procesado', 'success');
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error procesando pago Stripe:', error);
            if (window.EcoToast) {
                EcoToast.show('Error', 'Error al procesar el pago', 'error');
            }
            return false;
        }
    },

    renderPaymentMethods() {
        const container = document.getElementById('payment-methods-container');
        if (!container) return;

        container.innerHTML = `
            <div class="payment-methods">
                <div class="payment-method selected" data-method="stripe">
                    <input type="radio" name="payment_method" value="stripe" checked>
                    <label>
                        <img src="https://img.icons8.com/color/48/000000/stripe.png" alt="Stripe">
                        Tarjeta de crédito/débito
                    </label>
                </div>
                <div class="payment-method" data-method="paypal">
                    <input type="radio" name="payment_method" value="paypal">
                    <label>
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="PayPal">
                        PayPal
                    </label>
                </div>
            </div>
        `;
    },

    renderStripeForm() {
        const container = document.getElementById('stripe-form-container');
        if (!container) return;

        container.innerHTML = `
            <div class="stripe-form">
                <form id="payment-form">
                    <div class="form-group">
                        <label for="card-element">Tarjeta</label>
                        <div id="card-element"></div>
                        <div id="card-errors" role="alert"></div>
                    </div>
                    <div class="form-group">
                        <label for="cardholder-name">Nombre en la tarjeta</label>
                        <input type="text" id="cardholder-name" placeholder="Nombre como aparece en la tarjeta" required>
                    </div>
                    <div class="form-group">
                        <label for="cardholder-email">Email</label>
                        <input type="email" id="cardholder-email" placeholder="tu@email.com" required>
                    </div>
                    <button type="submit" class="btn-principal btn-pagar">
                        <i class="bi bi-lock-fill"></i> Pagar S/. <span id="payment-amount">0.00</span>
                    </button>
                </form>
            </div>
        `;

        if (this.stripe) {
            const elements = this.stripe.elements();
            const cardElement = elements.create('card');
            cardElement.mount('#card-element');

            cardElement.on('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });

            const form = document.getElementById('payment-form');
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                this.processStripePaymentForm();
            });
        }
    },

    async processStripePaymentForm() {
        const cardholderName = document.getElementById('cardholder-name').value;
        const cardholderEmail = document.getElementById('cardholder-email').value;

        if (!cardholderName || !cardholderEmail) {
            if (window.EcoToast) {
                EcoToast.show('Campos incompletos', 'Completa todos los campos requeridos', 'warning');
            }
            return;
        }

        const billingDetails = {
            name: cardholderName,
            email: cardholderEmail,
            address: {
                line1: document.getElementById('billing-address')?.value || '',
                city: document.getElementById('billing-city')?.value || '',
                state: document.getElementById('billing-state')?.value || '',
                postal_code: document.getElementById('billing-zip')?.value || '',
                country: 'PE'
            }
        };

        // Aquí necesitaríamos obtener el paymentMethodId de Stripe Elements
        // Esta es una implementación simplificada
        const paymentMethodId = 'pm_card_visa'; // En producción esto vendría de Stripe Elements

        const success = await this.processStripePayment(paymentMethodId, billingDetails);

        if (success) {
            window.location.href = '/confirmacion';
        }
    },

    calculateTotal() {
        const cart = this.getCartData();
        const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        return total;
    },

    setupEventListeners() {
        // Selector de método de pago
        document.addEventListener('change', (e) => {
            if (e.target.name === 'payment_method') {
                const method = e.target.value;
                this.switchPaymentMethod(method);
            }
        });
    },

    switchPaymentMethod(method) {
        const stripeContainer = document.getElementById('stripe-form-container');
        const paypalContainer = document.getElementById('paypal-button-container');

        if (method === 'stripe') {
            stripeContainer.style.display = 'block';
            paypalContainer.style.display = 'none';
            this.renderStripeForm();
        } else if (method === 'paypal') {
            stripeContainer.style.display = 'none';
            paypalContainer.style.display = 'block';
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoPayments.init());
} else {
    EcoPayments.init();
}

// Exponer globalmente
window.EcoPayments = EcoPayments;