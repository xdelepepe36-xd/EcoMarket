/**
 * eco-search-advanced.js - Buscador avanzado
 * 
 * Funcionalidades:
 - Autocompletado inteligente
 - Filtros de busqueda
 - Sugerencias contextuales
 - Busqueda por imagen
 - Historial de busquedas
 - Resultados en tiempo real
 */

class EcoSearchAdvanced {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/search',
            storageKey: options.storageKey || 'ecomarket_search',
            enableAutocomplete: options.enableAutocomplete !== false,
            enableImageSearch: options.enableImageSearch !== false,
            ...options
        };
        
        this.searchHistory = [];
        this.searchIndex = [];
        
        this.init();
    }
    
    init() {
        this.loadSearchHistory();
        this.createSearchUI();
        this.setupEventListeners();
        this.buildSearchIndex();
    }
    
    createSearchUI() {
        const container = document.querySelector('[data-eco-search-advanced]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-search-advanced">
                <div class="eco-search-container">
                    <div class="eco-search-input-wrapper">
                        <i class="bi bi-search eco-search-icon"></i>
                        <input 
                            type="text" 
                            class="eco-search-input" 
                            data-search-input
                            placeholder="Buscar productos..."
                            autocomplete="off"
                        >
                        <button class="eco-image-search-btn" data-image-search>
                            <i class="bi bi-camera"></i>
                        </button>
                        <button class="eco-voice-search-btn" data-voice-search>
                            <i class="bi bi-mic"></i>
                        </button>
                    </div>
                    
                    <div class="eco-search-dropdown" data-search-dropdown style="display: none;">
                        <div class="eco-suggestions-section" data-suggestions-section>
                            <h4>Sugerencias</h4>
                            <div class="eco-suggestions-list" data-suggestions-list></div>
                        </div>
                        
                        <div class="eco-history-section" data-history-section>
                            <h4>Historial</h4>
                            <div class="eco-history-list" data-history-list>
                                ${this.renderSearchHistory()}
                            </div>
                        </div>
                        
                        <div class="eco-trending-section" data-trending-section>
                            <h4>Tendencias</h4>
                            <div class="eco-trending-list" data-trending-list>
                                <span class="eco-trending-item">Botella térmica</span>
                                <span class="eco-trending-item">Kit compostaje</span>
                                <span class="eco-trending-item">Jabón natural</span>
                                <span class="eco-trending-item">Sombrero ecológico</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="eco-search-filters" data-search-filters style="display: none;">
                    <div class="eco-filter-group">
                        <label>Categoría:</label>
                        <select data-filter-category>
                            <option value="">Todas</option>
                            <option value="hogar">Hogar</option>
                            <option value="higiene">Higiene</option>
                            <option value="accesorios">Accesorios</option>
                            <option value="jardin">Jardín</option>
                        </select>
                    </div>
                    
                    <div class="eco-filter-group">
                        <label>Precio:</label>
                        <input type="number" data-filter-min placeholder="Mín" data-currency>
                        <input type="number" data-filter-max placeholder="Máx" data-currency>
                    </div>
                    
                    <div class="eco-filter-group">
                        <label>Valoración:</label>
                        <select data-filter-rating>
                            <option value="">Todas</option>
                            <option value="4">4+ estrellas</option>
                            <option value="3">3+ estrellas</option>
                            <option value="2">2+ estrellas</option>
                        </select>
                    </div>
                    
                    <button class="eco-btn-eco" data-apply-filters>
                        Filtrar
                    </button>
                </div>
                
                <div class="eco-search-results" data-search-results style="display: none;">
                    <div class="eco-results-header">
                        <h4>Resultados</h4>
                        <span class="eco-results-count" data-results-count>0 productos</span>
                    </div>
                    <div class="eco-results-grid" data-results-grid></div>
                </div>
            </div>
        `;
    }
    
    renderSearchHistory() {
        if (this.searchHistory.length === 0) {
            return '<p class="eco-no-history">Sin historial</p>';
        }
        
        return this.searchHistory.slice(0, 5).map(query => `
            <div class="eco-history-item" data-history-item="${query}">
                <i class="bi bi-clock-history"></i>
                <span>${query}</span>
                <button class="eco-remove-history" data-remove-history="${query}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        const searchInput = document.querySelector('[data-search-input]');
        
        // Autocompletado
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                this.showSuggestions(query);
            } else {
                this.hideDropdown();
            }
        });
        
        // Mostrar historial al enfocar
        searchInput?.addEventListener('focus', () => {
            if (searchInput.value.length === 0) {
                this.showDropdown();
            }
        });
        
        // Ocultar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.eco-search-container')) {
                this.hideDropdown();
            }
        });
        
        // Busqueda por imagen
        document.querySelector('[data-image-search]')?.addEventListener('click', () => {
            this.searchByImage();
        });
        
        // Busqueda por voz
        document.querySelector('[data-voice-search]')?.addEventListener('click', () => {
            this.searchByVoice();
        });
        
        // Aplicar filtros
        document.querySelector('[data-apply-filters]')?.addEventListener('click', () => {
            this.applyFilters();
        });
        
        // Remover del historial
        document.querySelectorAll('[data-remove-history]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.dataset.removeHistory;
                this.removeFromHistory(query);
            });
        });
    }
    
    showSuggestions(query) {
        const suggestions = this.getSuggestions(query);
        const suggestionsList = document.querySelector('[data-suggestions-list]');
        
        if (suggestionsList) {
            suggestionsList.innerHTML = suggestions.map(s => `
                <div class="eco-suggestion-item" data-suggestion="${s}">
                    <i class="bi bi-search"></i>
                    <span>${s}</span>
                </div>
            `).join('');
            
            // Agregar event listeners a sugerencias
            suggestionsList.querySelectorAll('[data-suggestion]').forEach(item => {
                item.addEventListener('click', () => {
                    this.performSearch(item.dataset.suggestion);
                });
            });
        }
        
        this.showDropdown();
    }
    
    getSuggestions(query) {
        // Sugerencias simuladas
        const allSuggestions = [
            'Botella térmica ecológica',
            'Kit de compostaje',
            'Jabón natural',
            'Sombrero ecológico',
            'Bolsas reutilizables',
            'Tazas de bambú',
            'Cepillo de bambú',
            'Toallas ecológicas'
        ];
        
        return allSuggestions.filter(s => 
            s.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }
    
    showDropdown() {
        const dropdown = document.querySelector('[data-search-dropdown]');
        if (dropdown) {
            dropdown.style.display = 'block';
        }
    }
    
    hideDropdown() {
        const dropdown = document.querySelector('[data-search-dropdown]');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    performSearch(query) {
        // Guardar en historial
        this.addToHistory(query);
        
        // Simular búsqueda
        const results = this.searchProducts(query);
        this.displayResults(results);
        
        // Ocultar dropdown
        this.hideDropdown();
        
        // Actualizar input
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) {
            searchInput.value = query;
        }
    }
    
    searchProducts(query) {
        // Simulación de búsqueda
        // En producción, esto llamaría a la API
        return [
            { id: 1, name: 'Botella Térmica', price: 45, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200' },
            { id: 2, name: 'Kit Compostaje', price: 55, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200' }
        ];
    }
    
    displayResults(results) {
        const resultsContainer = document.querySelector('[data-search-results]');
        const resultsGrid = document.querySelector('[data-results-grid]');
        const resultsCount = document.querySelector('[data-results-count]');
        
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
        
        if (resultsCount) {
            resultsCount.textContent = `${results.length} productos`;
        }
        
        if (resultsGrid) {
            resultsGrid.innerHTML = results.map(product => `
                <div class="eco-result-card">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="eco-result-info">
                        <h5>${product.name}</h5>
                        <span class="eco-result-price">S/.${product.price}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    searchByImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                alert(`Analizando imagen: ${file.name}...`);
                // Simular búsqueda por imagen
                this.performSearch('Resultado de búsqueda por imagen');
            }
        };
        
        input.click();
    }
    
    searchByVoice() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'es-ES';
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.performSearch(transcript);
            };
            
            recognition.start();
            alert('Escuchando...');
        } else {
            alert('Tu navegador no soporta búsqueda por voz');
        }
    }
    
    applyFilters() {
        const category = document.querySelector('[data-filter-category]')?.value;
        const minPrice = document.querySelector('[data-filter-min]')?.value;
        const maxPrice = document.querySelector('[data-filter-max]')?.value;
        const rating = document.querySelector('[data-filter-rating]')?.value;
        
        alert(`Filtros aplicados: ${category}, S/.${minPrice} - S/.${maxPrice}, ${rating}+ estrellas`);
    }
    
    addToHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10);
            this.saveSearchHistory();
        }
    }
    
    removeFromHistory(query) {
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        this.saveSearchHistory();
        this.updateHistoryUI();
    }
    
    updateHistoryUI() {
        const historyList = document.querySelector('[data-history-list]');
        if (historyList) {
            historyList.innerHTML = this.renderSearchHistory();
        }
    }
    
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch {
            // Usar historial por defecto
        }
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }
    
    buildSearchIndex() {
        // Construir índice de búsqueda
        // En producción, esto cargaría todos los productos
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.querySelector('[data-eco-search-advanced]');
    if (searchContainer && searchContainer.dataset.ecoSearchAdvanced !== 'false') {
        window.ecoSearchAdvanced = new EcoSearchAdvanced({
            ...searchContainer.dataset
        });
    }
});