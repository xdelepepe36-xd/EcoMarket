// Product Comparison - Comparador de productos
class EcoProductComparison {
    constructor() {
        this.comparisonList = [];
        this.init();
    }

    init() {
        this.addCompareButtons();
        this.createComparisonPanel();
        this.addCompareFloatingButton();
    }

    addCompareButtons() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const compareBtn = document.createElement('button');
            compareBtn.className = 'compare-btn';
            compareBtn.innerHTML = '⚖ Comparar';
            compareBtn.addEventListener('click', () => {
                this.addToComparison(product);
            });
            product.appendChild(compareBtn);
        });
    }

    createComparisonPanel() {
        const panel = document.createElement('div');
        panel.className = 'comparison-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Comparar productos</h3>
                <button class="close-panel">&times;</button>
            </div>
            <div class="comparison-content">
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Calificación</th>
                                <th>Stock</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="comparison-body">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        panel.querySelector('.close-panel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }

    addCompareFloatingButton() {
        const btn = document.createElement('button');
        btn.className = 'compare-floating-btn';
        btn.innerHTML = '⚖ Comparar (0)';
        btn.style.display = 'none';
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            document.querySelector('.comparison-panel').style.display = 'block';
        });
    }

    addToComparison(product) {
        if (this.comparisonList.length >= 4) {
            alert('Solo puedes comparar hasta 4 productos');
            return;
        }

        const productData = {
            id: Date.now(),
            name: product.querySelector('.product-title').textContent,
            price: product.querySelector('.price').textContent,
            rating: product.querySelector('.rating')?.textContent || 'N/A',
            stock: product.querySelector('.stock-info')?.textContent || 'N/A'
        };

        this.comparisonList.push(productData);
        this.updateComparisonTable();
        this.updateFloatingButton();
    }

    updateComparisonTable() {
        const tbody = document.getElementById('comparison-body');
        tbody.innerHTML = '';

        this.comparisonList.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.rating}</td>
                <td>${product.stock}</td>
                <td><button class="remove-compare" data-id="${product.id}">Eliminar</button></td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('.remove-compare').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.comparisonList = this.comparisonList.filter(p => p.id !== id);
                this.updateComparisonTable();
                this.updateFloatingButton();
            });
        });
    }

    updateFloatingButton() {
        const btn = document.querySelector('.compare-floating-btn');
        btn.innerHTML = `⚖ Comparar (${this.comparisonList.length})`;
        btn.style.display = this.comparisonList.length > 0 ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProductComparison();
});