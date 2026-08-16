/**
 * eco-payment-installments.js - Sistema de pago en cuotas
 * 
 * Funcionalidades:
 - Pago en cuotas
 - Plan de pago
 - Financiamiento sin intereses
 - Calculadora de cuotas
 - Estados de cuotas
 */

class EcoPaymentInstallments {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/installments',
            storageKey: options.storageKey || 'ecomarket_installments',
            interestRate: options.interestRate || 0, // 0% interés
            maxInstallments: options.maxInstallments || 12,
            minAmount: options.minAmount || 50,
            ...options
        };
        
        this.installments = [];
        
        this.init();
    }
    
    init() {
        this.loadInstallments();
        this.createInstallmentsUI();
        this.setupEventListeners();
    }
    
    createInstallmentsUI() {
        const container = document.querySelector('[data-eco-installments]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-payment-installments">
                <div class="eco-installments-header">
                    <h3>Pago en Cuotas</h3>
                    <p>Financiamiento sin intereses (${this.options.interestRate}% TAE)</p>
                </div>
                
                <div class="eco-installment-calculator">
                    <div class="eco-calc-input">
                        <label>Monto total:</label>
                        <input type="number" data-calc-amount placeholder="S/.100" min="${this.options.minAmount}" step="10">
                    </div>
                    <div class="eco-calc-input">
                        <label>Número de cuotas:</label>
                        <select data-calc-installments>
                            ${Array.from({length: this.options.maxInstallments}, (_, i) => 
                                `<option value="${i + 1}">${i + 1} cuota${i + 1 > 1 ? 's' : ''}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <button class="eco-btn-eco" data-calculate>
                        Calcular
                    </button>
                </div>
                
                <div class="eco-installment-result" data-installment-result>
                    <div class="eco-result-summary">
                        <h4>Resumen del Plan</h4>
                        <div class="eco-result-item">
                            <span>Monto total:</span>
                            <span data-result-total>S/.0.00</span>
                        </div>
                        <div class="eco-result-item">
                            <span>Cuota mensual:</span>
                            <span data-result-monthly>S/.0.00</span>
                        </div>
                        <div class="eco-result-item">
                            <span>Interés total:</span>
                            <span data-result-interest>S/.0.00</span>
                        </div>
                        <div class="eco-result-item">
                            <span>TAE:</span>
                            <span>${this.options.interestRate}%</span>
                        </div>
                    </div>
                    <button class="eco-btn-eco" data-confirm-installment>
                        Confirmar Plan
                    </button>
                </div>
                
                <div class="eco-active-installments">
                    <h4>Planes Activos</h4>
                    <div class="eco-installments-list" data-installments-list>
                        ${this.renderInstallments()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderInstallments() {
        if (this.installments.length === 0) {
            return '<p class="eco-no-installments">Sin planes activos</p>';
        }
        
        return this.installments.map(installment => `
            <div class="eco-installment-item">
                <div class="eco-installment-info">
                    <span class="eco-installment-amount">S/.${installment.amount.toFixed(2)}</span>
                    <span class="eco-installment-plan">${installment.installments} cuotas</span>
                </div>
                <div class="eco-installment-status">
                    <span class="eco-status-badge ${installment.status}">
                        ${installment.status === 'active' ? 'Activo' : 'Completado'}
                    </span>
                    <span class="eco-installment-monthly">S/.${installment.monthly.toFixed(2)}/mes</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        document.querySelector('[data-calculate]')?.addEventListener('click', () => {
            this.calculateInstallment();
        });
        
        document.querySelector('[data-confirm-installment]')?.addEventListener('click', () => {
            this.confirmInstallment();
        });
    }
    
    calculateInstallment() {
        const amount = parseFloat(document.querySelector('[data-calc-amount]').value);
        const installments = parseInt(document.querySelector('[data-calc-installments]').value);
        
        if (!amount || amount < this.options.minAmount) {
            alert(`El monto mínimo es S/.${this.options.minAmount}`);
            return;
        }
        
        const monthlyPayment = amount / installments;
        const totalInterest = amount * (this.options.interestRate / 100);
        
        document.querySelector('[data-result-total]').textContent = `S/.${amount.toFixed(2)}`;
        document.querySelector('[data-result-monthly]').textContent = `S/.${monthlyPayment.toFixed(2)}`;
        document.querySelector('[data-result-interest]').textContent = `S/.${totalInterest.toFixed(2)}`;
        
        // Mostrar resultado
        document.querySelector('[data-installment-result]').style.display = 'block';
    }
    
    confirmInstallment() {
        const amount = parseFloat(document.querySelector('[data-calc-amount]').value);
        const installments = parseInt(document.querySelector('[data-calc-installments]').value);
        
        if (!amount || amount < this.options.minAmount) {
            alert('Calcula primero el plan');
            return;
        }
        
        const monthlyPayment = amount / installments;
        
        this.installments.push({
            id: Date.now(),
            amount: amount,
            installments: installments,
            monthly: monthlyPayment,
            status: 'active',
            nextPayment: new Date().toISOString(),
            paid: 0
        });
        
        this.saveInstallments();
        this.updateUI();
        alert('Plan de cuotas confirmado');
    }
    
    updateUI() {
        const list = document.querySelector('[data-installments-list]');
        if (list) {
            list.innerHTML = this.renderInstallments();
        }
    }
    
    loadInstallments() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.installments = JSON.parse(saved);
            }
        } catch {
            // Usar instalaciones por defecto
        }
    }
    
    saveInstallments() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.installments));
        } catch (error) {
            console.error('Error guardando instalaciones:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', => {
    const installmentsContainer = document.querySelector('[data-eco-installments]');
    if (installmentsContainer && installmentsContainer.dataset.ecoInstallments !== 'false') {
        window.ecoPaymentInstallments = new EcoPaymentInstallments({
            ...installmentsContainer.dataset
        });
    }
});