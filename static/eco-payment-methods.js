/**
 * eco-payment-methods.js - Sistema de multiples metodos de pago
 * 
 * Funcionalidades:
 - Stripe integration
 - PayPal integration
 - Yape/Plin (QR codes)
 - Pago rapido con QR
 - Multiple payment gateways
 - Historial de pagos
 */

class EcoPaymentMethods {
    constructor(options = {}) {
        this.options = {
            stripeKey: options.stripeKey || '',
            paypalClientId: options.paypalClientId || '',
            storageKey: options.storageKey || 'ecomarket_payment',
            enableStripe: options.enableStripe !== false,
            enablePayPal: options.enablePayPal !== false,
            enableYapePlin: options.enableYapePlin !== false,
            ...options
        };
        
        this.savedMethods = [];
        this.paymentHistory = [];
        
        this.init();
    }
    
    init() {
        this.loadPaymentMethods();
        this.createPaymentUI();
        this.setupEventListeners();
    }
    
    createPaymentUI() {
        const container = document.querySelector('[data-eco-payment-methods]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-payment-methods">
                <div class="eco-payment-header">
                    <h3>Métodos de Pago</h3>
                    <p>Elige tu método de pago preferido</p>
                </div>
                
                <div class="eco-payment-gateways">
                    ${this.options.enableStripe ? `
                        <div class="eco-gateway-card" data-gateway="stripe">
                            <div class="eco-gateway-icon">
                                <i class="bi bi-credit-card"></i>
                            </div>
                            <div class="eco-gateway-info">
                                <h4>Stripe</h4>
                                <p>Tarjetas crédito/débito</p>
                            </div>
                            <button class="eco-select-btn" data-select-stripe>
                                Seleccionar
                            </button>
                        </div>
                    ` : ''}
                    
                    ${this.options.enablePayPal ? `
                        <div class="eco-gateway-card" data-gateway="paypal">
                            <div class="eco-gateway-icon">
                                <i class="bi bi-paypal"></i>
                            </div>
                            <div class="eco-gateway-info">
                                <h4>PayPal</h4>
                                <p>Pago seguro internacional</p>
                            </div>
                            <button class="eco-select-btn" data-select-paypal>
                                Seleccionar
                            </button>
                        </div>
                    ` : ''}
                    
                    ${this.options.enableYapePlin ? `
                        <div class="eco-gateway-card" data-gateway="yapeplin">
                            <div class="eco-gateway-icon">
                                <i class="bi bi-qr-code"></i>
                            </div>
                            <div class="eco-gateway-info">
                                <h4>Yape / Plin</h4>
                                <p>Pago rápido con QR</p>
                            </div>
                            <button class="eco-select-btn" data-select-yapeplin>
                                Seleccionar
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="eco-saved-methods">
                    <h4>Métodos Guardados</h4>
                    <div class="eco-saved-list" data-saved-list>
                        ${this.renderSavedMethods()}
                    </div>
                </div>
                
                <div class="eco-payment-history">
                    <h4>Historial de Pagos</h4>
                    <div class="eco-history-list" data-history-list>
                        ${this.renderPaymentHistory()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSavedMethods() {
        if (this.savedMethods.length === 0) {
            return '<p class="eco-no-methods">Sin métodos guardados</p>';
        }
        
        return this.savedMethods.map(method => `
            <div class="eco-saved-method-item">
                <div class="eco-method-icon">
                    <i class="bi bi-${method.type === 'stripe' ? 'credit-card' : method.type === 'paypal' ? 'paypal' : 'qr-code'}"></i>
                </div>
                <div class="eco-method-info">
                    <span class="eco-method-type">${method.type.charAt(0).toUpperCase() + method.type.slice(1)}</span>
                    <span class="eco-method-number">**** ${method.last4}</span>
                </div>
                <button class="eco-remove-btn" data-remove-method="${method.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    renderPaymentHistory() {
        if (this.paymentHistory.length === 0) {
            return '<p class="eco-no-history">Sin historial de pagos</p>';
        }
        
        return this.paymentHistory.slice(0, 10).map(payment => `
            <div class="eco-history-item">
                <div class="eco-history-info">
                    <span class="eco-history-method">${payment.method}</span>
                    <span class="eco-history-date">${this.formatDate(payment.date)}</span>
                </div>
                <div class="eco-history-amount">
                    <span class="eco-history-value">S/.${payment.amount.toFixed(2)}</span>
                    <span class="eco-history-status ${payment.status === 'completed' ? 'success' : 'pending'}">${payment.status}</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        document.querySelectorAll('[data-select-stripe]').forEach(btn => {
            btn.addEventListener('click', () => this.selectPayment('stripe'));
        });
        
        document.querySelectorAll('[data-select-paypal]').forEach(btn => {
            btn.addEventListener('click', () => this.selectPayment('paypal'));
        });
        
        document.querySelectorAll('[data-select-yapeplin]').forEach(btn => {
            btn.addEventListener('click', () => this.selectPayment('yapeplin'));
        });
        
        document.querySelectorAll('[data-remove-method]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const methodId = e.target.dataset.removeMethod;
                this.removeMethod(methodId);
            });
        });
    }
    
    selectPayment(method) {
        alert(`Método seleccionado: ${method}`);
        // Emitir evento de selección de pago
        document.dispatchEvent(new CustomEvent('payment:method-selected', {
            detail: { method }
        }));
    }
    
    removeMethod(methodId) {
        this.savedMethods = this.savedMethods.filter(m => m.id !== parseInt(methodId));
        this.savePaymentMethods();
        this.updateUI();
    }
    
    processStripePayment(amount) {
        // Simulación de pago con Stripe
        alert(`Procesando pago de S/.${amount} con Stripe...`);
        
        this.paymentHistory.unshift({
            method: 'stripe',
            amount: amount,
            date: new Date().toISOString(),
            status: 'completed'
        });
        
        this.savePaymentMethods();
        this.updateUI();
    }
    
    processPayPalPayment(amount) {
        // Simulación de pago con PayPal
        alert(`Procesando pago de S/.${amount} con PayPal...`);
        
        this.paymentHistory.unshift({
            method: 'paypal',
            amount: amount,
            date: new Date().toISOString(),
            status: 'completed'
        });
        
        this.savePaymentMethods();
        this.updateUI();
    }
    
    processYapePlinPayment(amount) {
        // Simulación de pago con Yape/Plin (QR)
        alert(`Generando QR para pago de S/.${amount} con Yape/Plin...`);
        
        this.paymentHistory.unshift({
            method: 'yapeplin',
            amount: amount,
            date: new Date().toISOString(),
            status: 'pending'
        });
        
        this.savePaymentMethods();
        this.updateUI();
    }
    
    updateUI() {
        const savedList = document.querySelector('[data-saved-list]');
        if (savedList) {
            savedList.innerHTML = this.renderSavedMethods();
        }
        
        const historyList = document.querySelector('[data-history-list]');
        if (historyList) {
            historyList.innerHTML = this.renderPaymentHistory();
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    loadPaymentMethods() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.savedMethods = data.methods || [];
                this.paymentHistory = data.history || [];
            }
        } catch {
            // Usar métodos por defecto
        }
    }
    
    savePaymentMethods() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                methods: this.savedMethods,
                history: this.paymentHistory
            }));
        } catch (error) {
            console.error('Error guardando métodos de pago:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const paymentContainer = document.querySelector('[data-eco-payment-methods]');
    if (paymentContainer && paymentContainer.dataset.ecoPaymentMethods !== 'false') {
        window.ecoPaymentMethods = new EcoPaymentMethods({
            ...paymentContainer.dataset
        });
    }
});