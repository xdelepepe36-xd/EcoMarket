/**
 * EcoMarket - Comparador de Productos
 * Sistema para comparar múltiples productos lado a lado
 */

const EcoCompare = {
    products: [],
    maxProducts: 3,
    comparisonCriteria: ['precio', 'stock', 'eco_score', 'rating', 'condicion'],

    init() {
        try {
            this.loadComparison();
            this.setupEventListeners();
            this.renderComparisonPanel();
        } catch (error) {
            console.error('Error inicializando comparador:', error);
        }
    },

    loadComparison() {
        try {
            const saved = localStorage.getItem('ecomarket-comparison');
            if (saved) {
                this.products = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando comparación:', error);
            this.products = [];
        }
    },

    saveComparison() {
        try {
            localStorage.setItem('ecomarket-comparison', JSON.stringify(this.products));
        } catch (error) {
            console.error('Error guardando comparación:', error);
        }
    },

    addProduct(product) {
        if (this.products.length >= this.maxProducts) {
            if (window.EcoToast) {
                EcoToast.show('Límite alcanzado', `Máximo ${this.maxProducts} productos para comparar`, 'warning');
            }
            return false;
        }

        if (this.products.some(p => p.id === product.id)) {
            if (window.EcoToast) {
                EcoToast.show('Ya añadido', 'Este producto ya está en la comparación', 'info');
            }
            return false;
        }

        this.products.push(product);
        this.saveComparison();
        this.renderComparisonPanel();
        this.renderComparisonTable();

        if (window.EcoToast) {
            EcoToast.show('Producto añadido', `${product.nombre} agregado a comparación`, 'success');
        }

        return true;
    },

    removeProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.saveComparison();
        this.renderComparisonPanel();
        this.renderComparisonTable();

        if (window.EcoToast) {
            EcoToast.show('Producto eliminado', 'Producto eliminado de la comparación', 'info');
        }
    },

    clearComparison() {
        this.products = [];
        this.saveComparison();
        this.renderComparisonPanel();
        this.renderComparisonTable();

        if (window.EcoToast) {
            EcoToast.show('Comparación limpiada', 'Todos los productos han sido eliminados', 'info');
        }
    },

    getComparisonData() {
        return this.products.map(product => ({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            precio_original: product.precio_original || product.precio,
            stock: product.stock,
            condicion: product.condicion,
            categoria: product.categoria,
            eco_score: product.eco_score || 0,
            rating: product.rating_promedio || 0,
            rating_count: product.total_resenas || 0,
            imagen: product.imagen,
            ubicacion: product.ubicacion || 'No especificada',
            especificaciones: product.especificaciones ? JSON.parse(product.especificaciones) : {}
        }));
    },

    calculateScores() {
        const data = this.getComparisonData();
        const scores = {};

        data.forEach(product => {
            let score = 0;
            let maxScore = 0;

            // Criterio precio (más barato es mejor)
            const minPrice = Math.min(...data.map(p => p.precio));
            const maxPrice = Math.max(...data.map(p => p.precio));
            if (maxPrice > minPrice) {
                score += (1 - (product.precio - minPrice) / (maxPrice - minPrice)) * 25;
            }
            maxScore += 25;

            // Criterio stock (más stock es mejor)
            const maxStock = Math.max(...data.map(p => p.stock));
            if (maxStock > 0) {
                score += (product.stock / maxStock) * 15;
            }
            maxScore += 15;

            // Criterio eco_score
            score += (product.eco_score / 100) * 20;
            maxScore += 20;

            // Criterio rating
            score += (product.rating / 5) * 20;
            maxScore += 20;

            // Criterio condición (nuevo es mejor)
            if (product.condicion === 'nuevo') {
                score += 20;
            }
            maxScore += 20;

            scores[product.id] = {
                score: Math.round(score),
                maxScore: maxScore,
                percentage: Math.round((score / maxScore) * 100)
            };
        });

        return scores;
    },

    getWinner() {
        const scores = this.calculateScores();
        let winner = null;
        let maxScore = 0;

        Object.entries(scores).forEach(([productId, scoreData]) => {
            if (scoreData.score > maxScore) {
                maxScore = scoreData.score;
                winner = productId;
            }
        });

        return winner;
    },

    renderComparisonPanel() {
        const container = document.getElementById('compare-panel');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="compare-empty">
                    <i class="bi bi-layout-sidebar"></i>
                    <p>No hay productos para comparar</p>
                    <small>Agrega productos usando el botón "Comparar" en las tarjetas de producto</small>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="compare-header">
                <h3>Comparar Productos (${this.products.length}/${this.maxProducts})</h3>
                <button class="btn-clear" onclick="EcoCompare.clearComparison()">
                    <i class="bi bi-x-circle"></i> Limpiar
                </button>
            </div>
            <div class="compare-products">
                ${this.products.map(product => `
                    <div class="compare-product-card">
                        <img src="${product.imagen.startsWith('http') ? product.imagen : '/static/' + product.imagen}" alt="${product.nombre}">
                        <span class="product-name">${product.nombre}</span>
                        <button class="btn-remove" onclick="EcoCompare.removeProduct(${product.id})">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <button class="btn-compare" onclick="EcoCompare.showComparisonModal()">
                <i class="bi bi-arrows-angle-expand"></i> Ver comparación detallada
            </button>
        `;
    },

    renderComparisonTable() {
        const container = document.getElementById('comparison-table');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = '';
            return;
        }

        const data = this.getComparisonData();
        const scores = this.calculateScores();
        const winner = this.getWinner();

        container.innerHTML = `
            <div class="comparison-table-wrapper">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Criterio</th>
                            ${data.map(product => `
                                <th class="${product.id === winner ? 'winner' : ''}">
                                    ${product.nombre}
                                    ${product.id === winner ? '<i class="bi bi-trophy"></i>' : ''}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Precio</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    S/. ${product.precio.toFixed(2)}
                                    ${product.precio_original && product.precio_original > product.precio ? 
                                        `<span class="original-price">S/. ${product.precio_original.toFixed(2)}</span>` : ''}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Stock</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    ${product.stock} unidades
                                    ${product.stock > 0 ? '<span class="in-stock">Disponible</span>' : '<span class="out-of-stock">Agotado</span>'}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Condición</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    ${product.condicion === 'nuevo' ? '🆕 Nuevo' : '♻️ Usado'}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Categoría</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    ${product.categoria}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Eco-Score</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    <div class="eco-score-bar">
                                        <div class="eco-score-fill" style="width: ${product.eco_score}%"></div>
                                    <span>${product.eco_score}/100</span>
                                    </div>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Rating</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    <div class="rating-stars">
                                        ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}
                                    </div>
                                    <small>(${product.rating_count} reseñas)</small>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Ubicación</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    ${product.ubicacion}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td><strong>Puntuación Total</strong></td>
                            ${data.map(product => `
                                <td class="${product.id === winner ? 'winner' : ''}">
                                    <div class="total-score">
                                        <span class="score-value">${scores[product.id]?.score || 0}</span>
                                        <span class="score-max">/ ${scores[product.id]?.maxScore || 100}</span>
                                    </div>
                                    <div class="score-percentage">
                                        ${scores[product.id]?.percentage || 0}%
                                    </div>
                                </td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },

    showComparisonModal() {
        const modal = document.getElementById('comparison-modal');
        if (!modal) return;

        const data = this.getComparisonData();
        const scores = this.calculateScores();
        const winner = this.getWinner();

        modal.innerHTML = `
            <div class="modal-content comparison-modal">
                <div class="modal-header">
                    <h2>Comparación Detallada de Productos</h2>
                    <button class="modal-close" onclick="EcoCompare.closeModal()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.renderDetailedComparison(data, scores, winner)}
                </div>
                <div class="modal-footer">
                    <button class="btn-secundario" onclick="EcoCompare.closeModal()">Cerrar</button>
                    <button class="btn-principal" onclick="EcoCompare.exportComparison()">
                        <i class="bi bi-download"></i> Exportar
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    },

    renderDetailedComparison(data, scores, winner) {
        return `
            <div class="detailed-comparison">
                <div class="comparison-summary">
                    <h3>🏆 Ganador: ${data.find(p => p.id === winner)?.nombre || 'Sin ganador'}</h3>
                    <p>Basado en precio, stock, eco-score, rating y condición</p>
                </div>
                
                <div class="comparison-criteria">
                    ${this.comparisonCriteria.map(criterion => `
                        <div class="criterion-section">
                            <h4>${this.formatCriterionName(criterion)}</h4>
                            ${this.renderCriterionBars(data, criterion, winner)}
                        </div>
                    `).join('')}
                </div>

                <div class="comparison-recommendation">
                    <h4>Recomendación</h4>
                    <p>Consideramos que el producto <strong>${data.find(p => p.id === winner)?.nombre}</strong> es la mejor opción basada en el análisis de los criterios seleccionados.</p>
                </div>
            </div>
        `;
    },

    renderCriterionBars(data, criterion, winner) {
        const values = data.map(p => {
            switch(criterion) {
                case 'precio':
                    return { value: p.precio, inverted: true, label: `S/. ${p.precio.toFixed(2)}` };
                case 'stock':
                    return { value: p.stock, inverted: false, label: `${p.stock} unidades` };
                case 'eco_score':
                    return { value: p.eco_score, inverted: false, label: `${p.eco_score}/100` };
                case 'rating':
                    return { value: p.rating * 20, inverted: false, label: `${p.rating}/5` };
                case 'condicion':
                    return { value: p.condicion === 'nuevo' ? 100 : 50, inverted: false, label: p.condicion };
                default:
                    return { value: 0, inverted: false, label: '' };
            }
        });

        const maxValue = Math.max(...values.map(v => v.value));

        return `
            <div class="criterion-bars">
                ${values.map((item, index) => {
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    const isWinner = data[index].id === winner;
                    return `
                        <div class="criterion-bar ${isWinner ? 'winner' : ''}">
                            <div class="bar-label">${item.label}</div>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${percentage}%"></div>
                            </div>
                            <div class="bar-value">${Math.round(percentage)}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    formatCriterionName(criterion) {
        const names = {
            'precio': '💰 Precio',
            'stock': '📦 Stock',
            'eco_score': '🌱 Eco-Score',
            'rating': '⭐ Rating',
            'condicion': '🏷️ Condición'
        };
        return names[criterion] || criterion;
    },

    closeModal() {
        const modal = document.getElementById('comparison-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    exportComparison() {
        const data = this.getComparisonData();
        const scores = this.calculateScores();
        const winner = this.getWinner();

        const exportData = {
            fecha: new Date().toISOString(),
            productos: data,
            puntuaciones: scores,
            ganador: winner,
            criterios: this.comparisonCriteria
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparacion_ecomarket_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.EcoToast) {
            EcoToast.show('Exportación completada', 'Comparación exportada exitosamente', 'success');
        }
    },

    setupEventListeners() {
        // Botones de comparación en tarjetas de producto
        document.addEventListener('click', (e) => {
            const compareBtn = e.target.closest('[data-compare]');
            if (compareBtn) {
                const productId = parseInt(compareBtn.dataset.productId);
                const product = this.findProductById(productId);
                if (product) {
                    this.addProduct(product);
                }
            }
        });
    },

    findProductById(productId) {
        // Esta función debería buscar el producto en la página actual
        // Implementación básica - en producción debería conectar con el backend
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            return {
                id: productId,
                nombre: productCard.querySelector('.producto-name')?.textContent || 'Producto',
                precio: parseFloat(productCard.querySelector('.producto-precio')?.textContent?.replace('S/.', '') || 0),
                categoria: productCard.querySelector('.categoria')?.textContent || 'General',
                imagen: productCard.querySelector('img')?.src || '',
                condicion: 'nuevo',
                stock: 10,
                eco_score: 75,
                rating_promedio: 4.0,
                total_resenas: 5
            };
        }
        return null;
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoCompare.init());
} else {
    EcoCompare.init();
}

// Exponer globalmente
window.EcoCompare = EcoCompare;