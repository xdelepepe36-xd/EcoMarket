// Mini Cart - Carrito miniatura
class EcoMiniCart {
    constructor() {
        this.init();
    }

    init() {
        this.createMiniCart();
        this.addCartHandlers();
    }

    createMiniCart() {
        const container = document.createElement('div');
        container.className = 'mini-cart-container';
        container.innerHTML = `
            <h3>🛒 Carrito miniatura</h3>
            <div class="mini-cart">
                <div class="cart-header">
                    <span class="cart-title">Tu carrito</span>
                    <span class="cart-count">3 items</span>
                </div>
                <div class="cart-items">
                    <div class="cart-item">
                        <div class="item-image">🌱</div>
                        <div class="item-details">
                            <div class="item-name">Botella ecológica</div>
                            <div class="item-price">$15.99</div>
                        </div>
                        <div class="item-quantity">1</div>
                    </div>
                    <div class="cart-item">
                        <div class="item-image">🧴</div>
                        <div class="item-details">
                            <div class="item-name">Jabón natural</div>
                            <div class="item-price">$8.50</div>
                        </div>
                        <div class="item-quantity">2</div>
                    </div>
                    <div class="cart-item">
                        <div class="item-image">👜</div>
                        <div class="item-details">
                            <div class="item-name">Bolsa reutilizable</div>
                            <div class="item-price">$12.00</div>
                        </div>
                        <div class="item-quantity">1</div>
                    </div>
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span class="total-label">Total:</span>
                        <span class="total-price">$44.99</span>
                    </div>
                    <button class="checkout-btn">Finalizar compra</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addCartHandlers() {
        const checkoutBtn = document.querySelector('.checkout-btn');
        checkoutBtn.addEventListener('click', () => {
            alert('¡Procediendo al checkout!');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoMiniCart();
});