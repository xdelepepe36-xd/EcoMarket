/**
 * eco-filters-advanced.js - Sistema de filtros avanzados de productos
 * 
 * Funcionalidades:
 - Filtros por precio, categoría, condición, calificación
 - Filtros por características específicas (material, tamaño, color)
 - Búsqueda en tiempo real
 - Guardado de filtros como presets
 - Historial de filtros
 - Conteo de resultados en tiempo real
 - Compartir filtros
 */

class EcoFiltersAdvanced {
    constructor(options = {}) {
        this.options = {
            container: options.container || '[data-eco-filters]',
            apiEndpoint: options.apiEndpoint || '/api/productos/filtrar',
            storageKey: options.storageKey || 'ecomarket_filters',
            enablePresets: options.enablePresets !== false,
            enableHistory: options.enableHistory !== false,
            maxHistory: options.maxHistory || 10,
            ...options
        };
        
        this.filters = {
            category: '',
            priceMin: null,
            priceMax: null,
            condition: '',
            rating: null,
            search: '',
            features: {}
        };
        
        this.filterHistory = [];
        this.presets = [];
        this.resultsCount = 0;
        
        this.init();
    }
    
    init() {
        this.createFilterUI();
        this.loadFilters();
        this.loadHistory();
        this.setupEventListeners();
        this.applyFilters();
    }
    
    createFilterUI() {
        const container = document.querySelector(this.options.container);
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-filters-advanced">
                <div class="eco-filters-header">
                    <h3>Filtros</h3>
                    <div class="eco-filters-actions">
                        <button class="eco-btn-icon" data-save-preset title="Guardar preset">
                            <i class="bi bi-bookmark"></i>
                        </button>
                        <button class="eco-btn-icon" data-clear-filters title="Limpiar filtros">
                            <i class="bi bi-x-circle"></i>
                        </button>
                        <button class="eco-btn-icon" data-toggle-filters title="Toggle filtros">
                            <i class="bi bi-funnel"></i>
                        </button>
                    </div>
                </div>
                
                <div class="eco-filters-body">
                    <!-- Búsqueda -->
                    <div class="eco-filter-group">
                        <label>Buscar</label>
                        <div class="eco-search-input">
                            <i class="bi bi-search"></i>
                            <input type="text" data-filter-search placeholder="Buscar productos...">
                        </div>
                    </div>
                    
                    <!-- Categoría -->
                    <div class="eco-filter-group">
                        <label>Categoría</label>
                        <select data-filter-category>
                            <option value="">Todas</option>
                            <option value="Hogar">Hogar</option>
                            <option value="Accesorios">Accesorios</option>
                            <option value="Higiene">Higiene</option>
                            <option value="Jardín">Jardín</option>
                            <option value="Alimentación">Alimentación</option>
                            <option value="Ropa">Ropa</option>
                        </select>
                    </div>
                    
                    <!-- Precio -->
                    <div class="eco-filter-group">
                        <label>Precio</label>
                        <div class="eco-price-range">
                            <input type="number" data-filter-price-min placeholder="Mín" min="0">
                            <span>-</span>
                            <input type="number" data-filter-price-max placeholder="Máx" min="0">
                        </div>
                        <input type="range" data-filter-price-slider min="0" max="500" step="10">
                    </div>
                    
                    <!-- Condición -->
                    <div class="eco-filter-group">
                        <label>Condición</label>
                        <div class="eco-checkbox-group">
                            <label><input type="checkbox" data-filter-condition value="nuevo"> Nuevo</label>
                            <label><input type="checkbox" data-filter-condition value="como_nuevo"> Como nuevo</label>
                            <label><input type="checkbox" data-filter-condition value="usado"> Usado</label>
                        </div>
                    </div>
                    
                    <!-- Calificación -->
                    <div class="eco-filter-group">
                        <label>Calificación mínima</label>
                        <div class="eco-rating-filter">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <button class="eco-rating-star" data-filter-rating="${star}">
                                    <i class="bi bi-star${star <= (this.filters.rating || 0) ? '-fill' : ''}"></i>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Características específicas -->
                    <div class="eco-filter-group">
                        <label>Características</label>
                        <div class="eco-features-filter">
                            <label><input type="checkbox" data-filter-feature value="organic"> Orgánico</label>
                            <label><input type="checkbox" data-filter-feature value="recycled"> Reciclado</label>
                            <label><input type="checkbox" data-filter-feature value="biodegradable"> Biodegradable</label>
                            <label><input type="checkbox" data-filter-feature value="fair_trade"> Comercio justo</label>
                            <label><input type="checkbox" data-filter-feature value="local"> Local</label>
                        </div>
                    </div>
                    
                    <!-- Stock -->
                    <div class="eco-filter-group">
                        <label>Disponibilidad</label>
                        <div class="eco-checkbox-group">
                            <label><input type="checkbox" data-filter-stock value="in_stock"> En stock</label>
                            <label><input type="checkbox" data-filter-stock value="on_sale"> En oferta</label>
                        </div>
                    </div>
                </div>
                
                <div class="eco-filters-footer">
                    <div class="eco-results-count">
                        <span data-results-count>0</span> resultados
                    </div>
                    <button class="eco-apply-filters" data-apply-filters>
                        Aplicar filtros
                    </button>
                </div>
                
                <!-- Presets guardados -->
                ${this.options.enablePresets ? `
                    <div class="eco-filter-presets">
                        <h4>Presets guardados</h4>
                        <div class="eco-presets-list" data-presets-list>
                            <!-- Los presets se renderizarán aquí -->
                        </div>
                    </div>
                ` : ''}
                
                <!-- Historial -->
                ${this.options.enableHistory ? `
                    <div class="eco-filter-history">
                        <h4>Historial</h4>
                        <div class="eco-history-list" data-history-list>
                            <!-- El historial se renderizará aquí -->
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.filterElements = {
            search: container.querySelector('[data-filter-search]'),
            category: container.querySelector('[data-filter-category]'),
            priceMin: container.querySelector('[data-filter-price-min]'),
            priceMax: container.querySelector('[data-filter-price-max]'),
            priceSlider: container.querySelector('[data-filter-price-slider]'),
            conditions: container.querySelectorAll('[data-filter-condition]'),
            ratings: container.querySelectorAll('[data-filter-rating]'),
            features: container.querySelectorAll('[data-filter-feature]'),
            stock: container.querySelectorAll('[data-filter-stock]'),
            resultsCount: container.querySelector('[data-results-count]'),
            presetsList: container.querySelector('[data-presets-list]'),
            historyList: container.querySelector('[data-history-list]')
        };
    }
    
    setupEventListeners() {
        // Búsqueda con debounce
        this.filterElements.search.addEventListener('input', this.debounce((e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        }, 300));
        
        // Categoría
        this.filterElements.category.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });
        
        // Precio
        this.filterElements.priceMin.addEventListener('input', (e) => {
            this.filters.priceMin = parseFloat(e.target.value) || null;
            this.applyFilters();
        });
        
        this.filterElements.priceMax.addEventListener('input', (e) => {
            this.filters.priceMax = parseFloat(e.target.value) || null;
            this.applyFilters();
        });
        
        this.filterElements.priceSlider.addEventListener('input', (e) => {
            this.filterElements.priceMax.value = e.target.value;
            this.filters.priceMax = parseFloat(e.target.value);
            this.applyFilters();
        });
        
        // Condición
        this.filterElements.conditions.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checked = Array.from(this.filterElements.conditions)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                this.filters.condition = checked.join(',');
                this.applyFilters();
            });
        });
        
        // Calificación
        this.filterElements.ratings.forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = parseInt(btn.dataset.filterRating);
                this.filters.rating = this.filters.rating === rating ? null : rating;
                this.updateRatingUI();
                this.applyFilters();
            });
        });
        
        // Características
        this.filterElements.features.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checked = Array.from(this.filterElements.features)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                this.filters.features = checked;
                this.applyFilters();
            });
        });
        
        // Stock
        this.filterElements.stock.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checked = Array.from(this.filterElements.stock)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                this.filters.stock = checked.join(',');
                this.applyFilters();
            });
        });
        
        // Botones de acción
        document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
            this.clearFilters();
        });
        
        document.querySelector('[data-save-preset]')?.addEventListener('click', () => {
            this.savePreset();
        });
        
        document.querySelector('[data-apply-filters]')?.addEventListener('click', () => {
            this.applyFilters();
        });
    }
    
    async applyFilters() {
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.filters)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.resultsCount = data.count || data.products?.length || 0;
                this.filterElements.resultsCount.textContent = this.resultsCount;
                
                // Emitir evento con resultados
                document.dispatchEvent(new CustomEvent('filters:applied', {
                    detail: { filters: this.filters, results: data }
                }));
                
                // Guardar en historial
                this.addToHistory();
            }
        } catch (error) {
            console.error('Error aplicando filtros:', error);
        }
    }
    
    updateRatingUI() {
        this.filterElements.ratings.forEach(btn => {
            const rating = parseInt(btn.dataset.filterRating);
            const icon = btn.querySelector('i');
            icon.className = `bi bi-star${rating <= (this.filters.rating || 0) ? '-fill' : ''}`;
        });
    }
    
    clearFilters() {
        this.filters = {
            category: '',
            priceMin: null,
            priceMax: null,
            condition: '',
            rating: null,
            search: '',
            features: {},
            stock: ''
        };
        
        // Resetear UI
        this.filterElements.search.value = '';
        this.filterElements.category.value = '';
        this.filterElements.priceMin.value = '';
        this.filterElements.priceMax.value = '';
        this.filterElements.priceSlider.value = 500;
        
        this.filterElements.conditions.forEach(cb => cb.checked = false);
        this.filterElements.features.forEach(cb => cb.checked = false);
        this.filterElements.stock.forEach(cb => cb.checked = false);
        
        this.updateRatingUI();
        this.applyFilters();
    }
    
    savePreset() {
        const name = prompt('Nombre del preset:');
        if (!name) return;
        
        const preset = {
            id: Date.now(),
            name: name,
            filters: { ...this.filters },
            createdAt: new Date().toISOString()
        };
        
        this.presets.push(preset);
        this.savePresets();
        this.renderPresets();
    }
    
    loadPresets() {
        try {
            const saved = localStorage.getItem(this.options.storageKey + '_presets');
            if (saved) {
                this.presets = JSON.parse(saved);
            }
        } catch {
            this.presets = [];
        }
    }
    
    savePresets() {
        try {
            localStorage.setItem(this.options.storageKey + '_presets', JSON.stringify(this.presets));
        } catch (error) {
            console.error('Error guardando presets:', error);
        }
    }
    
    renderPresets() {
        if (!this.filterElements.presetsList) return;
        
        if (this.presets.length === 0) {
            this.filterElements.presetsList.innerHTML = '<p>No hay presets guardados</p>';
            return;
        }
        
        this.filterElements.presetsList.innerHTML = this.presets.map(preset => `
            <div class="eco-preset-item">
                <span>${preset.name}</span>
                <div class="eco-preset-actions">
                    <button class="eco-btn-icon" data-load-preset="${preset.id}">
                        <i class="bi bi-arrow-right-circle"></i>
                    </button>
                    <button class="eco-btn-icon" data-delete-preset="${preset.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Event listeners
        this.filterElements.presetsList.querySelectorAll('[data-load-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetId = parseInt(btn.dataset.loadPreset);
                this.loadPreset(presetId);
            });
        });
        
        this.filterElements.presetsList.querySelectorAll('[data-delete-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetId = parseInt(btn.dataset.deletePreset);
                this.deletePreset(presetId);
            });
        });
    }
    
    loadPreset(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        if (preset) {
            this.filters = { ...preset.filters };
            this.updateUIFromFilters();
            this.applyFilters();
        }
    }
    
    deletePreset(presetId) {
        this.presets = this.presets.filter(p => p.id !== presetId);
        this.savePresets();
        this.renderPresets();
    }
    
    addToHistory() {
        const historyItem = {
            id: Date.now(),
            filters: { ...this.filters },
            timestamp: new Date().toISOString()
        };
        
        this.filterHistory.unshift(historyItem);
        
        if (this.filterHistory.length > this.options.maxHistory) {
            this.filterHistory.pop();
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem(this.options.storageKey + '_history');
            if (saved) {
                this.filterHistory = JSON.parse(saved);
            }
        } catch {
            this.filterHistory = [];
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem(this.options.storageKey + '_history', JSON.stringify(this.filterHistory));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }
    
    renderHistory() {
        if (!this.filterElements.historyList) return;
        
        if (this.filterHistory.length === 0) {
            this.filterElements.historyList.innerHTML = '<p>Sin historial</p>';
            return;
        }
        
        this.filterElements.historyList.innerHTML = this.filterHistory.map((item, index) => `
            <div class="eco-history-item">
                <span>Búsqueda ${index + 1}</span>
                <span class="eco-history-time">${this.formatTime(item.timestamp)}</span>
                <button class="eco-btn-icon" data-load-history="${item.id}">
                    <i class="bi bi-arrow-right-circle"></i>
                </button>
            </div>
        `).join('');
        
        this.filterElements.historyList.querySelectorAll('[data-load-history]').forEach(btn => {
            btn.addEventListener('click', () => {
                const historyId = parseInt(btn.dataset.loadHistory);
                const historyItem = this.filterHistory.find(h => h.id === historyId);
                if (historyItem) {
                    this.filters = { ...historyItem.filters };
                    this.updateUIFromFilters();
                    this.applyFilters();
                }
            });
        });
    }
    
    updateUIFromFilters() {
        this.filterElements.search.value = this.filters.search || '';
        this.filterElements.category.value = this.filters.category || '';
        this.filterElements.priceMin.value = this.filters.priceMin || '';
        this.filterElements.priceMax.value = this.filters.priceMax || '';
        
        // Actualizar checkboxes de condición
        const conditions = this.filters.condition ? this.filters.condition.split(',') : [];
        this.filterElements.conditions.forEach(cb => {
            cb.checked = conditions.includes(cb.value);
        });
        
        // Actualizar calificación
        this.updateRatingUI();
        
        // Actualizar características
        const features = this.filters.features || [];
        this.filterElements.features.forEach(cb => {
            cb.checked = features.includes(cb.value);
        });
    }
    
    loadFilters() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.filters = JSON.parse(saved);
                this.updateUIFromFilters();
            }
        } catch {
            // Usar filtros por defecto
        }
    }
    
    saveFilters() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.filters));
        } catch (error) {
            console.error('Error guardando filtros:', error);
        }
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    getCurrentFilters() {
        return { ...this.filters };
    }
    
    getResultsCount() {
        return this.resultsCount;
    }
    
    destroy() {
        // Limpiar event listeners
        this.filterElements.search.removeEventListener('input', this.debounce);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const filterContainer = document.querySelector('[data-eco-filters]');
    if (filterContainer && filterContainer.dataset.ecoFilters !== 'false') {
        window.ecoFilters = new EcoFiltersAdvanced({
            ...filterContainer.dataset
        });
    }
});