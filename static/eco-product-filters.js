// Product Filters - Filtros de productos
class EcoProductFilters {
    constructor() {
        this.init();
    }

    init() {
        this.createProductFilters();
        this.addFilterHandlers();
    }

    createProductFilters() {
        const container = document.createElement('div');
        container.className = 'product-filters-container';
        container.innerHTML = `
            <h3>🔍 Filtros de productos</h3>
            <div class="product-filters">
                <div class="filter-section">
                    <h4 class="filter-title">Categoría</h4>
                    <div class="filter-options">
                        <label class="filter-option">
                            <input type="checkbox" checked> Accesorios
                        </label>
                        <label class="filter-option">
                            <input type="checkbox"> Hogar
                        </label>
                        <label class="filter-option">
                            <input type="checkbox"> Alimentos
                        </label>
                        <label class="filter-option">
                            <input type="checkbox"> Ropa
                        </label>
                    </div>
                </div>
                <div class="filter-section">
                    <h4 class="filter-title">Precio</h4>
                    <div class="price-range">
                        <input type="range" min="0" max="100" value="50" class="price-slider">
                        <div class="price-values">
                            <span>$0</span>
                            <span id="priceValue">$50</span>
                            <span>$100</span>
                        </div>
                    </div>
                </div>
                <div class="filter-section">
                    <h4 class="filter-title">Color</h4>
                    <div class="color-options">
                        <button class="color-option active" data-color="verde"></button>
                        <button class="color-option" data-color="azul"></button>
                        <button class="color-option" data-color="rojo"></button>
                        <button class="color-option" data-color="negro"></button>
                        <button class="color-option" data-color="blanco"></button>
                    </div>
                </div>
                <div class="filter-section">
                    <h4 class="filter-title">Calificación</h4>
                    <div class="rating-options">
                        <label class="rating-option">
                            <input type="radio" name="rating" value="5"> ⭐⭐⭐⭐⭐
                        </label>
                        <label class="rating-option">
                            <input type="radio" name="rating" value="4"> ⭐⭐⭐⭐
                        </label>
                        <label class="rating-option">
                            <input type="radio" name="rating" value="3"> ⭐⭐⭐
                        </label>
                    </div>
                </div>
                <button class="apply-filters">Aplicar filtros</button>
            </div>
        `;
        document.body.appendChild(container);
    }

    addFilterHandlers() {
        const priceSlider = document.querySelector('.price-slider');
        const priceValue = document.getElementById('priceValue');
        const colorOptions = document.querySelectorAll('.color-option');
        const applyBtn = document.querySelector('.apply-filters');

        priceSlider.addEventListener('input', (e) => {
            priceValue.textContent = `$${e.target.value}`;
        });

        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });

        applyBtn.addEventListener('click', () => {
            alert('Filtros aplicados exitosamente');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProductFilters();
});