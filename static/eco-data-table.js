// Data Table - Tabla de datos interactiva
class EcoDataTable {
    constructor() {
        this.init();
    }

    init() {
        this.createDataTable();
        this.addSorting();
        this.addFiltering();
        this.addPagination();
    }

    createDataTable() {
        const table = document.createElement('div');
        table.className = 'data-table-container';
        table.innerHTML = `
            <h3>📊 Historial de pedidos</h3>
            <div class="table-controls">
                <input type="text" class="table-search" placeholder="Buscar pedidos...">
                <select class="table-filter">
                    <option value="">Todos los estados</option>
                    <option value="entregado">Entregado</option>
                    <option value="en camino">En camino</option>
                    <option value="pendiente">Pendiente</option>
                </select>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-sort="id">ID</th>
                        <th data-sort="date">Fecha</th>
                        <th data-sort="product">Producto</th>
                        <th data-sort="amount">Monto</th>
                        <th data-sort="status">Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#1234</td>
                        <td>18/08/2026</td>
                        <td>Botella ecológica</td>
                        <td>S/. 45.00</td>
                        <td><span class="status delivered">Entregado</span></td>
                        <td><button class="action-btn">Ver</button></td>
                    </tr>
                    <tr>
                        <td>#1233</td>
                        <td>17/08/2026</td>
                        <td>Cepillo de bambú</td>
                        <td>S/. 12.00</td>
                        <td><span class="status in-transit">En camino</span></td>
                        <td><button class="action-btn">Ver</button></td>
                    </tr>
                    <tr>
                        <td>#1232</td>
                        <td>16/08/2026</td>
                        <td>Jabón natural</td>
                        <td>S/. 15.00</td>
                        <td><span class="status pending">Pendiente</span></td>
                        <td><button class="action-btn">Ver</button></td>
                    </tr>
                    <tr>
                        <td>#1231</td>
                        <td>15/08/2026</td>
                        <td>Bolsa reutilizable</td>
                        <td>S/. 18.00</td>
                        <td><span class="status delivered">Entregado</span></td>
                        <td><button class="action-btn">Ver</button></td>
                    </tr>
                </tbody>
            </table>
            <div class="table-pagination">
                <button class="page-btn" disabled>Anterior</button>
                <span class="page-info">Página 1 de 1</span>
                <button class="page-btn" disabled>Siguiente</button>
            </div>
        `;
        document.body.appendChild(table);
    }

    addSorting() {
        const headers = document.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                this.sortTable(sortBy);
            });
        });
    }

    sortTable(sortBy) {
        const tbody = document.querySelector('.data-table tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aText = a.cells[Array.from(a.cells).findIndex(cell => 
                cell.parentElement.querySelector(`th[data-sort="${sortBy}]`)
            )].textContent;
            const bText = b.cells[Array.from(b.cells).findIndex(cell => 
                cell.parentElement.querySelector(`th[data-sort="${sortBy}"]`)
            )].textContent;
            return aText.localeCompare(bText);
        });

        rows.forEach(row => tbody.appendChild(row));
    }

    addFiltering() {
        const searchInput = document.querySelector('.table-search');
        const filterSelect = document.querySelector('.table-filter');

        searchInput.addEventListener('input', () => {
            this.filterTable(searchInput.value, filterSelect.value);
        });

        filterSelect.addEventListener('change', () => {
            this.filterTable(searchInput.value, filterSelect.value);
        });
    }

    filterTable(searchText, statusFilter) {
        const rows = document.querySelectorAll('.data-table tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const status = row.querySelector('.status').textContent.toLowerCase();
            
            const matchesSearch = text.includes(searchText.toLowerCase());
            const matchesStatus = !statusFilter || status === statusFilter.toLowerCase();
            
            row.style.display = matchesSearch && matchesStatus ? '' : 'none';
        });
    }

    addPagination() {
        // Implementación básica de paginación
        const pageButtons = document.querySelectorAll('.page-btn');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Funcionalidad de paginación - Implementar lógica real');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoDataTable();
});