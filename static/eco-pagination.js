// Pagination - Paginación
class EcoPagination {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 10;
        this.init();
    }

    init() {
        this.createPagination();
        this.addEventListeners();
    }

    createPagination() {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.innerHTML = `
            <button class="page-btn prev" disabled>← Anterior</button>
            <div class="page-numbers"></div>
            <button class="page-btn next">Siguiente →</button>
        `;
        document.body.appendChild(pagination);

        this.createPageNumbers();
    }

    createPageNumbers() {
        const container = document.querySelector('.page-numbers');
        container.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.goToPage(i);
            });
            container.appendChild(pageBtn);
        }
    }

    addEventListeners() {
        document.querySelector('.page-btn.prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.goToPage(this.currentPage - 1);
            }
        });

        document.querySelector('.page-btn.next').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.goToPage(this.currentPage + 1);
            }
        });
    }

    goToPage(page) {
        this.currentPage = page;
        this.updatePagination();
        // Aquí cargarías los productos de la página correspondiente
    }

    updatePagination() {
        document.querySelector('.page-btn.prev').disabled = this.currentPage === 1;
        document.querySelector('.page-btn.next').disabled = this.currentPage === this.totalPages;

        document.querySelectorAll('.page-number').forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === this.currentPage);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoPagination();
});