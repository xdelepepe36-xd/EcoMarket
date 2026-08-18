// Tabs - Pestañas
class EcoTabs {
    constructor() {
        this.init();
    }

    init() {
        this.createTabs();
        this.addEventListeners();
    }

    createTabs() {
        const tabs = document.createElement('div');
        tabs.className = 'eco-tabs';
        tabs.innerHTML = `
            <div class="tabs-header">
                <button class="tab-btn active" data-tab="featured">Destacados</button>
                <button class="tab-btn" data-tab="new">Nuevos</button>
                <button class="tab-btn" data-tab="popular">Populares</button>
                <button class="tab-btn" data-tab="offers">Ofertas</button>
            </div>
            <div class="tabs-content">
                <div class="tab-pane active" id="featured">
                    <div class="products-grid">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/2ecc71/ffffff?text=Destacado+1" alt="Producto">
                            <h4>Producto Destacado 1</h4>
                            <p class="price">S/. 45.00</p>
                        </div>
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/3498db/ffffff?text=Destacado+2" alt="Producto">
                            <h4>Producto Destacado 2</h4>
                            <p class="price">S/. 35.00</p>
                        </div>
                    </div>
                </div>
                <div class="tab-pane" id="new">
                    <div class="products-grid">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/e74c3c/ffffff?text=Nuevo+1" alt="Producto">
                            <h4>Producto Nuevo 1</h4>
                            <p class="price">S/. 55.00</p>
                        </div>
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/f39c12/ffffff?text=Nuevo+2" alt="Producto">
                            <h4>Producto Nuevo 2</h4>
                            <p class="price">S/. 65.00</p>
                        </div>
                    </div>
                </div>
                <div class="tab-pane" id="popular">
                    <div class="products-grid">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/9b59b6/ffffff?text=Popular+1" alt="Producto">
                            <h4>Producto Popular 1</h4>
                            <p class="price">S/. 25.00</p>
                        </div>
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/1abc9c/ffffff?text=Popular+2" alt="Producto">
                            <h4>Producto Popular 2</h4>
                            <p class="price">S/. 75.00</p>
                        </div>
                    </div>
                </div>
                <div class="tab-pane" id="offers">
                    <div class="products-grid">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/e67e22/ffffff?text=Oferta+1" alt="Producto">
                            <h4>Producto Oferta 1</h4>
                            <p class="price">S/. 30.00 <span class="original-price">S/. 50.00</span></p>
                        </div>
                        <div class="product-card">
                            <img src="https://via.placeholder.com/200x200/34495e/ffffff?text=Oferta+2" alt="Producto">
                            <h4>Producto Oferta 2</h4>
                            <p class="price">S/. 40.00 <span class="original-price">S/. 60.00</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(tabs);
    }

    addEventListeners() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Remover active de todos
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Activar el seleccionado
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTabs();
});