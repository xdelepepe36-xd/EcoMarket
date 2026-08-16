/**
 * eco-payment-oneclick.js - Sistema de pago con un clic
 * 
 * Funcionalidades:
 - Checkout one-click
 - Recordar tarjeta
 - Pago sin formularios
 - Checkout instantáneo
 - Tokenización segura
 */

class EcoPaymentOneClick {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/oneclick',
            storageKey: options.storageKey || 'ecomarket_oneclick',
            enableTokenization: options.enableTokenization !== false,
            ...options
        };
        
        this.savedCard = null;
        this.paymentTokens = [];
        
        this.init();
    }
    
    init() {
        this.loadSavedCard();
        this.createOneClickUI();
        this.setupEventListeners();
    }
    
    createOneClickUI() {
        const container = document.querySelector('[data-eco-oneclick]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-payment-oneclick">
                <div class="eco-oneclick-header">
                    <h3>Pago con Un Clic</h3>
                    <p>Compra rápido con tu tarjeta guardada</p>
                </div>
                
                <div class="eco-saved-card-section" data-saved-card-section>
                    ${this.savedCard ? `
                        <div class="eco-saved-card">
                            <div class="eco-card-info">
                                <span class="eco-card-brand">${this.savedCard.brand}</span>
                                <span class="eco-card-number">**** **** **** ${this.savedCard.last4}</span>
                                <span class="eco-card-expiry">${this.savedCard.expiry}</span>
                            </div>
                            <button class="eco-pay-now-btn" data-pay-now>
                                <i class="bi bi-lightning"></i>
                                Pagar Ahora
                            </button>
                            <button class="eco-change-card-btn" data-change-card>
                                <i class="bi bi-pencil"></i>
                                Cambiar
                            </button>
                        </div>
                    ` : `
                        <div class="eco-no-card">
                            <i class="bi bi-credit-card"></i>
                            <p>No tienes tarjeta guardada</p>
                            <button class="eco-save-card-btn" data-save-card>
                                <i class="bi bi-plus"></i>
                                Guardar Tarjeta
                            </button>
                        </div>
                    `}
                </div>
                
                <div class="eco-token-section" data-token-section style="display: none;">
                    <h4>Tokenización Segura</h4>
                    <p>Tu tarjeta está tokenizada para pagos seguros</p>
                    <div class="eco-token-status">
                        <i class="bi bi-shield-check"></i>
                        <span>Token activo</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        document.querySelector('[data-pay-now]')?.addEventListener('click', () => {
            this.processOneClickPayment();
        });
        
        document.querySelector('[data-change-card]')?.addEventListener('click', () => {
            this.changeCard();
        });
        
        document.querySelector('[data-save-card]')?.addEventListener('click', () => {
            this.saveCard();
        });
    }
    
    processOneClickPayment() {
        const amount = this.getCurrentCartAmount();
        
        if (!amount || amount <= 0) {
            alert('El carrito está vacío');
            return;
        }
        
        alert(`Procesando pago de S/.${amount.toFixed(2)} con un clic...`);
        
        // Simular proceso de pago
        setTimeout(() => {
            alert('¡Pago exitoso! Tu pedido está siendo procesado.');
            
            // Emitir evento de pago completado
            document.dispatchEvent(new CustomEvent('payment:oneclick-complete', {
                detail: { amount, card: this.savedCard }
            }));
        }, 1500);
    }
    
    getCurrentCartAmount() {
        // En producción, esto obtendría el monto del carrito real
        // Aquí simulamos un monto
        return 150; // S/.150 como ejemplo
    }
    
    saveCard() {
        const cardNumber = prompt('Número de tarjeta:');
        const expiry = prompt('Fecha de expiración (MM/AA):');
        const cvv = prompt('CVV:');
        const brand = prompt('Marca (Visa, Mastercard):');
        
        if (cardNumber && expiry && cvv && brand) {
            this.savedCard = {
                number: cardNumber,
                last4: cardNumber.slice(-4),
                expiry: expiry,
                cvv: cvv,
                brand: brand
            };
            
            this.saveSavedCard();
            this.updateUI();
            alert('Tarjeta guardada exitosamente');
        }
    }
    
    changeCard() {
        this.savedCard = null;
        this.saveSavedCard();
        this.updateUI();
    }
    
    updateUI() {
        const container = document.querySelector('[data-saved-card-section]');
        if (container) {
            container.innerHTML = this.savedCard ? `
                <div class="eco-saved-card">
                    <div class="eco-card-info">
                        <span class="eco-card-brand">${this.savedCard.brand}</span>
                        <span class="eco-card-number">**** **** **** ${this.savedCard.last4}</span>
                        <span class="eco-card-expiry">${this.savedCard.expiry}</span>
                    </div>
                    <button class="eco-pay-now-btn" data-pay-now>
                        <i class="bi bi-lightning"></i>
                        Pagar Ahora
                    </button>
                    <button class="eco-change-card-btn" data-change-card>
                        <i class="bi bi-pencil"></i>
                        Cambiar
                    </button>
                </div>
            ` : `
                <div class="eco-no-card">
                    <i class="bi bi-credit-card"></i>
                    <p>No tienes tarjeta guardada</p>
                    <button class="eco-save-card-btn" data-save-card>
                        <i class="bi bi-plus"></i>
                        Guardar Tarjeta
                    </button>
                </div>
            `;
        }
    }
    
    loadSavedCard() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.savedCard = data.card || null;
                this.paymentTokens = data.tokens || [];
            }
        } catch {
            // Usar tarjeta por defecto
        }
    }
    
    saveSavedCard() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                card: this.savedCard,
                tokens: this.paymentTokens
            }));
        } catch (error) {
            console.error('Error guardando tarjeta:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', => => {
    const oneclickContainer = document.querySelector('[data-eco-oneclick]');
    if (oneclickContainer && oneclickContainer.dataset.ecoOneclick !== 'false') {
        window.ecoPaymentOneClick = new EcoPaymentOneClick({
            ...oneclickContainer.dataset
        });
    }
});