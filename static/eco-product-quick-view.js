// Product Quick View - Vista rápida de productos
class EcoProductQuickView {
    constructor() {
        this.init();
    }

    init() {
        this.addQuickViewButtons();
        this.createQuickViewModal();
    }

    addQuickViewButtons() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const quickViewBtn = document.createElement('button');
            quickViewBtn.className = 'quick-view-btn';
            quickViewBtn.innerHTML = '👁 Vista rápida';
            quickViewBtn.addEventListener('click', () => {
                this.showQuickView(product);
            });
            product.appendChild(quickViewBtn);
        });
    }

    createQuickViewModal() {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-body">
                    <div class="product-image">
                        <img src="" alt="">
                    </div>
                    <div class="product-details">
                        <h2 class="product-title"></h2>
                        <p class="product-price"></p>
                        <p class="product-description"></p>
                        <div class="product-options">
                            <div class="color-options">
                                <span>Color:</span>
                                <div class="color-selector">
                                    <button class="color-btn green" data-color="green"></button>
                                    <button class="color-btn blue" data-color="blue"></button>
                                    <button class="color-btn red" data-color="red"></button>
                                </div>
                            </div>
                            <div class="quantity-selector">
                                <span>Cantidad:</span>
                                <button class="qty-btn minus">-</button>
                                <input type="number" value="1" min="1" class="qty-input">
                                <button class="qty-btn plus">+</button>
                            </div>
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart-btn">Agregar al carrito</button>
                            <button class="wishlist-btn">♡ Favoritos</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showQuickView(product) {
        const modal = document.querySelector('.quick-view-modal');
        const title = product.querySelector('.product-title').textContent;
        const price = product.querySelector('.price').textContent;
        const image = product.querySelector('.product-image').src;

        modal.querySelector('.product-title').textContent = title;
        modal.querySelector('.product-price').textContent = price;
        modal.querySelector('.product-image img').src = image;
        modal.querySelector('.product-description').textContent = 'Producto ecológico de alta calidad. Hecho con materiales sostenibles y procesos respetuosos con el medio ambiente.';

        modal.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProductQuickView();
});