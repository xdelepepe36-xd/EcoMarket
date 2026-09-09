/**
 * EcoMarket - Sistema de Búsqueda Avanzada
 * Búsqueda inteligente con filtros, sugerencias y más
 */

const EcoSearch = {
    // Estado de búsqueda
    state: {
        query: '',
        filters: {
            categoria: '',
            precioMin: 0,
            precioMax: 1000,
            ecoScoreMin: 0,
            condicion: '',
            ubicacion: '',
            soloStock: false
        },
        sortBy: 'relevancia',
        sortDirection: 'desc',
        results: [],
        suggestions: [],
        searching: false
    },
    
    // Configuración
    config: {
        debounceTime: 300,
        maxSuggestions: 8,
        minQueryLength: 2,
        apiEndpoint: '/api/productos/buscar'
    },
    
    init() {
        this.initSearchInput();
        this.initFilters();
        this.initSortOptions();
        this.initSearchHistory();
        this.initVoiceSearch();
        this.initVisualSearch();
    },
    
    // Inicializar input de búsqueda
    initSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        // Debounce para búsqueda
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.handleSearchInput(e.target.value);
            }, this.config.debounceTime);
        });
        
        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Mostrar sugerencias al foco
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= this.config.minQueryLength) {
                this.showSuggestions();
            }
        });
        
        // Ocultar sugerencias al blur
        searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });
    },
    
    // Manejar input de búsqueda
    handleSearchInput(query) {
        this.state.query = query;
        
        if (query.length >= this.config.minQueryLength) {
            this.fetchSuggestions(query);
        } else {
            this.hideSuggestions();
        }
    },
    
    // Obtener sugerencias
    async fetchSuggestions(query) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}?q=${encodeURIComponent(query)}&suggestions=true`);
            const data = await response.json();
            
            if (data.suggestions) {
                this.state.suggestions = data.suggestions.slice(0, this.config.maxSuggestions);
                this.renderSuggestions();
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    },
    
    // Renderizar sugerencias
    renderSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        if (this.state.suggestions.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="search-suggestions">
                ${this.state.suggestions.map(suggestion => `
                    <div class="suggestion-item" data-query="${suggestion.query}">
                        <i class="bi bi-search"></i>
                        <span class="suggestion-text">${this.highlightMatch(suggestion.query, this.state.query)}</span>
                        <span class="suggestion-count">${suggestion.count} resultados</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Event listeners
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                document.getElementById('searchInput').value = query;
                this.state.query = query;
                this.performSearch();
                this.hideSuggestions();
            });
        });
    },
    
    // Resaltar coincidencia en texto
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    },
    
    // Mostrar/ocultar sugerencias
    showSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'block';
        }
    },
    
    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'none';
        }
    },
    
    // Realizar búsqueda completa
    async performSearch() {
        if (this.state.query.length < this.config.minQueryLength) {
            if (window.EcoToast) {
                EcoToast.show('Búsqueda muy corta', 'Ingresa al menos 2 caracteres', 'warning');
            }
            return;
        }
        
        this.state.searching = true;
        this.updateSearchUI();
        
        try {
            const params = new URLSearchParams({
                q: this.state.query,
                categoria: this.state.filters.categoria,
                precio_min: this.state.filters.precioMin,
                precio_max: this.state.filters.precioMax,
                eco_score_min: this.state.filters.ecoScoreMin,
                condicion: this.state.filters.condicion,
                ubicacion: this.state.filters.ubicacion,
                solo_stock: this.state.filters.soloStock,
                sort_by: this.state.sortBy,
                sort_dir: this.state.sortDirection
            });
            
            const response = await fetch(`${this.config.apiEndpoint}?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.state.results = data.productos;
                this.renderResults();
                this.saveToHistory(this.state.query);
                
                if (window.EcoToast) {
                    EcoToast.show('Búsqueda completada', `${data.productos.length} resultados encontrados`, 'success');
                }
            } else {
                throw new Error(data.message || 'Error en búsqueda');
            }
        } catch (error) {
            console.error('Search error:', error);
            if (window.EcoToast) {
                EcoToast.show('Error en búsqueda', error.message, 'error');
            }
        } finally {
            this.state.searching = false;
            this.updateSearchUI();
        }
    },
    
    // Renderizar resultados
    renderResults() {
        const container = document.getElementById('searchResults');
        if (!container) return;
        
        if (this.state.results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="bi bi-search" style="font-size: 3rem; color: var(--texto-sec);"></i>
                    <h3>No se encontraron resultados</h3>
                    <p>Intenta con otros términos o ajusta los filtros</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="search-results-grid">
                ${this.state.results.map(producto => `
                    <div class="producto-card" data-producto-id="${producto.id}">
                        <div class="producto-img-container">
                            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                            ${producto.stock > 0 ? '<span class="stock-badge">En stock</span>' : '<span class="stock-badge out">Agotado</span>'}
                        </div>
                        <div class="producto-info">
                            <span class="producto-categoria">${producto.categoria}</span>
                            <h3 class="producto-nombre">${producto.nombre}</h3>
                            <div class="producto-precio">
                                <span class="precio-actual">S/. ${producto.precio}</span>
                                ${producto.precio_original ? `<span class="precio-original">S/. ${producto.precio_original}</span>` : ''}
                            </div>
                            <div class="producto-eco-score">
                                <span class="eco-score-badge" style="background: ${this.getEcoScoreColor(producto.eco_score)}">
                                    Eco: ${producto.eco_score}/100
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // Color según eco-score
    getEcoScoreColor(score) {
        if (score >= 80) return '#4CAF50';
        if (score >= 60) return '#8BC34A';
        if (score >= 40) return '#FFC107';
        if (score >= 20) return '#FF9800';
        return '#F44336';
    },
    
    // Actualizar UI de búsqueda
    updateSearchUI() {
        const searchButton = document.getElementById('searchButton');
        const resultsContainer = document.getElementById('searchResults');
        
        if (searchButton) {
            searchButton.disabled = this.state.searching;
            searchButton.innerHTML = this.state.searching ? 
                '<i class="bi bi-hourglass-split"></i> Buscando...' : 
                '<i class="bi bi-search"></i> Buscar';
        }
        
        if (resultsContainer) {
            resultsContainer.style.opacity = this.state.searching ? '0.5' : '1';
        }
    },
    
    // Inicializar filtros
    initFilters() {
        // Filtro de categoría
        const categoriaSelect = document.getElementById('filterCategoria');
        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', (e) => {
                this.state.filters.categoria = e.target.value;
                this.performSearch();
            });
        }
        
        // Filtro de precio
        const precioMin = document.getElementById('filterPrecioMin');
        const precioMax = document.getElementById('filterPrecioMax');
        
        if (precioMin && precioMax) {
            [precioMin, precioMax].forEach(input => {
                input.addEventListener('change', () => {
                    this.state.filters.precioMin = parseInt(precioMin.value) || 0;
                    this.state.filters.precioMax = parseInt(precioMax.value) || 1000;
                    this.performSearch();
                });
            });
        }
        
        // Filtro de eco-score
        const ecoScoreMin = document.getElementById('filterEcoScoreMin');
        if (ecoScoreMin) {
            ecoScoreMin.addEventListener('input', (e) => {
                this.state.filters.ecoScoreMin = parseInt(e.target.value);
                document.getElementById('ecoScoreValue').textContent = e.target.value;
            });
            
            ecoScoreMin.addEventListener('change', () => {
                this.performSearch();
            });
        }
        
        // Filtro de condición
        const condicionSelect = document.getElementById('filterCondicion');
        if (condicionSelect) {
            condicionSelect.addEventListener('change', (e) => {
                this.state.filters.condicion = e.target.value;
                this.performSearch();
            });
        }
        
        // Checkbox de solo stock
        const soloStockCheckbox = document.getElementById('filterSoloStock');
        if (soloStockCheckbox) {
            soloStockCheckbox.addEventListener('change', (e) => {
                this.state.filters.soloStock = e.target.checked;
                this.performSearch();
            });
        }
        
        // Botón de limpiar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    },
    
    // Inicializar opciones de ordenamiento
    initSortOptions() {
        const sortSelect = document.getElementById('sortOptions');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortDir] = e.target.value.split('-');
                this.state.sortBy = sortBy;
                this.state.sortDirection = sortDir;
                this.performSearch();
            });
        }
    },
    
    // Limpiar filtros
    clearFilters() {
        this.state.filters = {
            categoria: '',
            precioMin: 0,
            precioMax: 1000,
            ecoScoreMin: 0,
            condicion: '',
            ubicacion: '',
            soloStock: false
        };
        
        // Resetear UI
        document.getElementById('filterCategoria').value = '';
        document.getElementById('filterPrecioMin').value = 0;
        document.getElementById('filterPrecioMax').value = 1000;
        document.getElementById('filterEcoScoreMin').value = 0;
        document.getElementById('filterCondicion').value = '';
        document.getElementById('filterSoloStock').checked = false;
        
        this.performSearch();
    },
    
    // Historial de búsqueda
    initSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        if (!historyContainer) return;
        
        const history = this.getSearchHistory();
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">Sin historial reciente</p>';
            return;
        }
        
        historyContainer.innerHTML = `
            <h4>Búsquedas recientes</h4>
            <div class="history-list">
                ${history.map(item => `
                    <div class="history-item" data-query="${item.query}">
                        <i class="bi bi-clock-history"></i>
                        <span>${item.query}</span>
                        <span class="history-date">${this.formatDate(item.date)}</span>
                        <button class="history-delete" data-query="${item.query}"><i class="bi bi-x"></i></button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Event listeners
        historyContainer.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.history-delete')) {
                    const query = item.dataset.query;
                    document.getElementById('searchInput').value = query;
                    this.state.query = query;
                    this.performSearch();
                }
            });
        });
        
        historyContainer.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const query = btn.dataset.query;
                this.removeFromHistory(query);
                this.initSearchHistory();
            });
        });
    },
    
    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('ecomarket_search_history') || '[]');
        } catch {
            return [];
        }
    },
    
    saveToHistory(query) {
        const history = this.getSearchHistory();
        
        // Eliminar si ya existe
        const filtered = history.filter(item => item.query !== query);
        
        // Agregar al inicio
        filtered.unshift({
            query: query,
            date: new Date().toISOString()
        });
        
        // Mantener solo últimos 10
        const trimmed = filtered.slice(0, 10);
        
        localStorage.setItem('ecomarket_search_history', JSON.stringify(trimmed));
    },
    
    removeFromHistory(query) {
        const history = this.getSearchHistory();
        const filtered = history.filter(item => item.query !== query);
        localStorage.setItem('ecomarket_search_history', JSON.stringify(filtered));
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        return date.toLocaleDateString();
    },
    
    // Búsqueda por voz
    initVoiceSearch() {
        const voiceButton = document.getElementById('voiceSearchButton');
        if (!voiceButton || !('webkitSpeechRecognition' in window)) return;
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        voiceButton.addEventListener('click', () => {
            recognition.start();
            voiceButton.innerHTML = '<i class="bi bi-mic-fill"></i>';
            voiceButton.classList.add('listening');
        });
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('searchInput').value = transcript;
            this.state.query = transcript;
            this.performSearch();
        };
        
        recognition.onend = () => {
            voiceButton.innerHTML = '<i class="bi bi-mic"></i>';
            voiceButton.classList.remove('listening');
        };
        
        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            voiceButton.innerHTML = '<i class="bi bi-mic"></i>';
            voiceButton.classList.remove('listening');
            
            if (window.EcoToast) {
                EcoToast.show('Error de voz', 'No se pudo reconocer el audio', 'error');
            }
        };
    },
    
    // Búsqueda visual (placeholder)
    initVisualSearch() {
        const visualSearchButton = document.getElementById('visualSearchButton');
        if (!visualSearchButton) return;
        
        visualSearchButton.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.performVisualSearch(file);
                }
            };
            input.click();
        });
    },
    
    async performVisualSearch(file) {
        if (window.EcoToast) {
            EcoToast.show('Búsqueda visual', 'Analizando imagen...', 'info');
        }
        
        // Placeholder para implementación real
        setTimeout(() => {
            if (window.EcoToast) {
                EcoToast.show('Próximamente', 'La búsqueda visual estará disponible pronto', 'warning');
            }
        }, 2000);
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoSearch.init());
} else {
    EcoSearch.init();
}

// Exponer globalmente
window.EcoSearch = EcoSearch;