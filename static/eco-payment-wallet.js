/**
 * eco-payment-wallet.js - Sistema de wallet digital
 * 
 * Funcionalidades:
 - Wallet digital con saldo
 - Historial de transacciones
 - Recarga simple
 - Saldo en tiempo real
 - Transacciones recientes
 - Estados de saldo
 */

class EcoPaymentWallet {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/wallet',
            storageKey: options.storageKey || 'ecomarket_wallet',
            enableTransactions: options.enableTransactions !== false,
            ...options
        };
        
        this.wallet = {
            balance: 0,
            currency: 'PEN',
            transactions: [],
            cards: []
        };
        
        this.init();
    }
    
    init() {
        this.loadWallet();
        this.createWalletUI();
        this.setupEventListeners();
    }
    
    createWalletUI() {
        const container = document.querySelector('[data-eco-wallet]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-payment-wallet">
                <div class="eco-wallet-header">
                    <h3>Wallet Digital</h3>
                    <div class="eco-wallet-balance">
                        <div class="eco-balance-amount" data-balance-amount>S/.${this.wallet.balance.toFixed(2)}</div>
                        <div class="eco-balance-currency">${this.wallet.currency}</div>
                    </div>
                </div>
                
                <div class="eco-wallet-actions">
                    <button class="eco-btn-eco" data-topup>
                        <i class="bi bi-plus-circle"></i>
                        Recargar
                    </button>
                    <button class="eco-btn-secondary" data-transfer>
                        <i class="bi bi-arrow-right-circle"></i>
                        Transferir
                    </button>
                </div>
                
                <div class="eco-wallet-cards">
                    <h4>Mis Tarjetas</h4>
                    <div class="eco-cards-list" data-cards-list>
                        ${this.renderCards()}
                    </div>
                    <button class="eco-add-card-btn" data-add-card>
                        <i class="bi bi-plus"></i>
                        Agregar tarjeta
                    </button>
                </div>
                
                <div class="eco-wallet-transactions">
                    <h4>Historial de Transacciones</h4>
                    <div class="eco-transactions-list" data-transactions-list>
                        ${this.renderTransactions()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCards() {
        if (this.wallet.cards.length === 0) {
            return '<p class="eco-no-cards">Sin tarjetas guardadas</p>';
        }
        
        return this.wallet.cards.map(card => `
            <div class="eco-card-item">
                <div class="eco-card-info">
                    <span class="eco-card-number">**** **** **** ${card.last4}</span>
                    <span class="eco-card-expiry">${card.expiry}</span>
                </div>
                <span class="eco-card-type">${card.type}</span>
            </div>
        `).join('');
    }
    
    renderTransactions() {
        if (this.wallet.transactions.length === 0) {
            return '<p class="eco-no-transactions">Sin transacciones</p>';
        }
        
        return this.wallet.transactions.slice(0, 10).map(tx => `
            <div class="eco-transaction-item">
                <div class="eco-tx-info">
                    <span class="eco-tx-type">${tx.type}</span>
                    <span class="eco-tx-date">${this.formatDate(tx.date)}</span>
                </div>
                <div class="eco-tx-amount ${tx.type === 'ingreso' ? 'positive' : 'negative'}">
                    ${tx.type === 'ingreso' ? '+' : '-'}S/.${tx.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        document.querySelector('[data-topup]')?.addEventListener('click', () => {
            this.topUp();
        });
        
        document.querySelector('[data-transfer]')?.addEventListener('click', () => {
            this.transfer();
        });
        
        document.querySelector('[data-add-card]')?.addEventListener('click', () => {
            this.addCard();
        });
    }
    
    topUp() {
        const amount = prompt('Monto a recargar:');
        if (amount) {
            const amountValue = parseFloat(amount);
            if (amountValue > 0) {
                this.wallet.balance += amountValue;
                this.wallet.transactions.unshift({
                    type: 'ingreso',
                    amount: amountValue,
                    date: new Date().toISOString(),
                    description: 'Recarga de wallet'
                });
                this.saveWallet();
                this.updateUI();
                alert(`Recarga exitosa: +S/.${amountValue.toFixed(2)}`);
            }
        }
    }
    
    transfer() {
        const amount = prompt('Monto a transferir:');
        const recipient = prompt('Destinatario (email):');
        
        if (amount && recipient) {
            const amountValue = parseFloat(amount);
            if (amountValue > 0 && amountValue <= this.wallet.balance) {
                this.wallet.balance -= amountValue;
                this.wallet.transactions.unshift({
                    type: 'egreso',
                    amount: amountValue,
                    date: new Date().toISOString(),
                    description: `Transferencia a ${recipient}`
                });
                this.saveWallet();
                this.updateUI();
                alert(`Transferencia exitosa: -S/.${amountValue.toFixed(2)}`);
            } else {
                alert('Saldo insuficiente');
            }
        }
    }
    
    addCard() {
        const cardNumber = prompt('Número de tarjeta (últimos 4 dígitos):');
        const expiry = prompt('Fecha de expiración (MM/AA):');
        const type = prompt('Tipo (Visa, Mastercard):');
        
        if (cardNumber && expiry && type) {
            this.wallet.cards.push({
                last4: cardNumber.slice(-4),
                expiry: expiry,
                type: type
            });
            this.saveWallet();
            this.updateUI();
            alert('Tarjeta agregada exitosamente');
        }
    }
    
    updateUI() {
        const balanceEl = document.querySelector('[data-balance-amount]');
        if (balanceEl) {
            balanceEl.textContent = `S/.${this.wallet.balance.toFixed(2)}`;
        }
        
        const cardsList = document.querySelector('[data-cards-list]');
        if (cardsList) {
            cardsList.innerHTML = this.renderCards();
        }
        
        const txList = document.querySelector('[data-transactions-list]');
        if (txList) {
            txList.innerHTML = this.renderTransactions();
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
    
    loadWallet() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.wallet = JSON.parse(saved);
            }
        } catch {
            // Usar wallet por defecto
        }
    }
    
    saveWallet() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.wallet));
        } catch (error) {
            console.error('Error guardando wallet:', error);
        }
    }
    
    getBalance() {
        return this.wallet.balance;
    }
    
    addBalance(amount) {
        this.wallet.balance += amount;
        this.saveWallet();
        this.updateUI();
    }
    
    subtractBalance(amount) {
        if (this.wallet.balance >= amount) {
            this.wallet.balance -= amount;
            this.saveWallet();
            this.updateUI();
            return true;
        }
        return false;
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const walletContainer = document.querySelector('[data-eco-wallet]');
    if (walletContainer && walletContainer.dataset.ecoWallet !== 'false') {
        window.ecoPaymentWallet = new EcoPaymentWallet({
            ...walletContainer.dataset
        });
    }
});