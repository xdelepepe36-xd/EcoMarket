// Advanced Filters - Filtros avanzados
class EcoAdvancedFilters {
    constructor() {
        this.init();
    }

    init() {
        this.createFilterPanel();
        this.addFilterToggle();
        this.addRangeSliders();
        this.addCheckboxFilters();
    }

    createFilterPanel() {
        const panel = document.createElement('div');
        panel.className = 'advanced-filters';
        panel.innerHTML = `
            <div class="filter-header">
                <h3>Filtros avanzados</h3>
                <button class="close-filters">&times;</button>
            </div>
            <div class="filter-content">
                <div class="filter-section">
                    <h4>Rango de precios</h4>
                    <div class="price-range">
                        <input type="range" min="0" max="1000" value="0" class="price-min" id="price-min">
                        <input type="range" min="0" max="1000" value="1000" class="price-max" id="price-max">
                        <div class="price-values">
                            <span>S/. <span id="min-value">0</span></span>
                            <span>S/. <span id="max-value">1000</span></span>
                        </div>
                    </div>
                </div>
                <div class="filter-section">
                    <h4>Categorías</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="accesorios"> Accesorios</label>
                        <label><input type="checkbox" value="alimentacion"> Alimentación</label>
                        <label><input type="checkbox" value="higiene"> Higiene</label>
                        <label><input type="checkbox" value="hogar"> Hogar</label>
                        <label><input type="checkbox" value="jardin"> Jardín</label>
                        <label><input type="checkbox" value="ropa"> Ropa</label>
                    </div>
                </div>
                <div class="filter-section">
                    <h4>Calificación</h4>
                    <div class="rating-filter">
                        <label><input type="radio" name="rating" value="4"> 4+ estrellas</label>
                        <label><input type="radio" name="rating" value="3"> 3+ estrellas</label>
                        <label><input type="radio" name="rating" value="2"> 2+ estrellas</label>
                        <label><input type="radio" name="rating" value="1"> 1+ estrellas</label>
                    </div>
                </div>
                <div class="filter-section">
                    <h4>Disponibilidad</h4>
                    <div class="availability-filter">
                        <label><input type="checkbox" value="instock"> En stock</label>
                        <label><input type="checkbox" value="preorder"> Pre-venta</label>
                        <label><input type="checkbox" value="outofstock"> Agotado</label>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="apply-filters">Aplicar filtros</button>
                    <button class="reset-filters">Limpiar</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        panel.querySelector('.close-filters').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        panel.querySelector('.apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });

        panel.querySelector('.reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });
    }

    addFilterToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'filter-toggle';
        toggle.innerHTML = '🔍 Filtros avanzados';
        document.body.appendChild(toggle);

        toggle.addEventListener('click', () => {
            const panel = document.querySelector('.advanced-filters');
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        });
    }

    addRangeSliders() {
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        const minValue = document.getElementById('min-value');
        const maxValue = document.getElementById('max-value');

        minSlider.addEventListener('input', () => {
            minValue.textContent = minSlider.value;
            if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
                maxSlider.value = minSlider.value;
                maxValue.textContent = minSlider.value;
            }
        });

        maxSlider.addEventListener('input', () => {
            maxValue.textContent = maxSlider.value;
            if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
                minSlider.value = maxSlider.value;
                minValue.textContent = maxSlider.value;
            }
        });
    }

    addCheckboxFilters() {
        const checkboxes = document.querySelectorAll('.checkbox-group input, .availability-filter input');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filterProducts();
            });
        });
    }

    applyFilters() {
        this.filterProducts();
        document.querySelector('.advanced-filters').style.display = 'none';
    }

    resetFilters() {
        document.querySelectorAll('.checkbox-group input, .availability-filter input').forEach(cb => {
            cb.checked = false;
        });
        document.querySelectorAll('.rating-filter input').forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('price-min').value = 0;
        document.getElementById('price-max').value = 1000;
        document.getElementById('min-value').textContent = '0';
        document.getElementById('max-value').textContent = '1000';
        this.filterProducts();
    }

    filterProducts() {
        // Simulación de filtrado
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            product.style.display = 'block';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoAdvancedFilters();
});