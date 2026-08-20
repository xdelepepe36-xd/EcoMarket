// Wishlist - Lista de deseos
class EcoWishlist {
    constructor() {
        this.init();
    }

    init() {
        this.createWishlist();
        this.addWishlistHandlers();
    }

    createWishlist() {
        const container = document.createElement('div');
        container.className = 'wishlist-container';
        container.innerHTML = `
            <h3>❤️ Lista de deseos</h3>
            <div class="wishlist">
                <div class="wishlist-header">
                    <span class="wishlist-title">Mis favoritos</span>
                    <span class="wishlist-count">4 productos</span>
                </div>
                <div class="wishlist-items">
                    <div class="wishlist-item">
                        <div class="item-image">🌱</div>
                        <div class="item-details">
                            <div class="item-name">Botella ecológica</div>
                            <div class="item-price">$15.99</div>
                        </div>
                        <button class="remove-btn">🗑️</button>
                        <button class="add-to-cart-btn">🛒</button>
                    </div>
                    <div class="wishlist-item">
                        <div class="item-image">🧴</div>
                        <div class="item-details">
                            <div class="item-name">Jabón natural</div>
                            <div class="item-price">$8.50</div>
                        </div>
                        <button class="remove-btn">🗑️</button>
                        <button class="add-to-cart-btn">🛒</button>
                    </div>
                    <div class="wishlist-item">
                        <div class="item-image">👜</div>
                        <div class="item-details">
                            <div class="item-name">Bolsa reutilizable</div>
                            <div class="item-price">$12.00</div>
                        </div>
                        <button class="remove-btn">🗑️</button>
                        <button class="add-to-cart-btn">🛒</button>
                    </div>
                    <div class="wishlist-item">
                        <div class="item-image">🌿</div>
                        <div class="item-details">
                            <div class="item-name">Plantas medicinales</div>
                            <div class="item-price">$25.00</div>
                        </div>
                        <button class="remove-btn">🗑️</button>
                        <button class="add-to-cart-btn">🛒</button>
                    </div>
                </div>
                <div class="wishlist-footer">
                    <button class="clear-wishlist">Limpiar lista</button>
                    <button class="add-all-to-cart">Agregar todos al carrito</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addWishlistHandlers() {
        const removeBtns = document.querySelectorAll('.remove-btn');
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        const clearBtn = document.querySelector('.clear-wishlist');
        const addAllBtn = document.querySelector('.add-all-to-cart');

        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.wishlist-item').remove();
                this.updateCount();
            });
        });

        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Producto agregado al carrito');
            });
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de limpiar tu lista de deseos?')) {
                document.querySelectorAll('.wishlist-item').forEach(item => item.remove());
                this.updateCount();
            }
        });

        addAllBtn.addEventListener('click', () => {
            alert('Todos los productos agregados al carrito');
        });
    }

    updateCount() {
        const count = document.querySelectorAll('.wishlist-item').length;
        document.querySelector('.wishlist-count').textContent = `${count} productos`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoWishlist();
});