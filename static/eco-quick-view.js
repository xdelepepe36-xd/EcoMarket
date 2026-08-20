// Quick View - Vista rápida de productos
class EcoQuickView {
    constructor() {
        this.init();
    }

    init() {
        this.createQuickView();
        this.addQuickViewHandlers();
    }

    createQuickView() {
        const container = document.createElement('div');
        container.className = 'quick-view-container';
        container.innerHTML = `
            <h3>👁️ Vista rápida de productos</h3>
            <div class="quick-view-demo">
                <div class="product-card">
                    <div class="product-image">🌱</div>
                    <div class="product-info">
                        <h4>Botella ecológica</h4>
                        <p class="product-price">$15.99</p>
                        <button class="quick-view-btn">Vista rápida</button>
                    </div>
                </div>
            </div>
            <div class="quick-view-modal" id="quickViewModal">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <div class="modal-product">
                        <div class="modal-image">🌱</div>
                        <div class="modal-details">
                            <h3>Botella ecológica</h3>
                            <p class="modal-price">$15.99</p>
                            <p class="modal-description">Botella reutilizable de acero inoxidable con tapa hermética. Perfecta para llevar agua, jugos o cualquier bebida.</p>
                            <div class="modal-specs">
                                <span>🔒 Material: Acero inoxidable</span>
                                <span>📏 Capacidad: 500ml</span>
                                <span>🌱 Ecológico: Sí</span>
                            </div>
                            <button class="add-to-cart">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addQuickViewHandlers() {
        const quickViewBtn = document.querySelector('.quick-view-btn');
        const modal = document.getElementById('quickViewModal');
        const closeBtn = document.querySelector('.modal-close');

        quickViewBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoQuickView();
});