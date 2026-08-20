// Sortable List - Lista ordenable
class EcoSortableList {
    constructor() {
        this.init();
    }

    init() {
        this.createSortableList();
        this.addDragHandlers();
    }

    createSortableList() {
        const container = document.createElement('div');
        container.className = 'sortable-container';
        container.innerHTML = `
            <h3>📋 Lista de prioridades (arrastra para reordenar)</h3>
            <ul class="sortable-list">
                <li class="sortable-item" data-priority="1">
                    <span class="drag-handle">☰</span>
                    <span class="item-content">Urgente - Pago pendiente</span>
                </li>
                <li class="sortable-item" data-priority="2">
                    <span class="drag-handle">☰</span>
                    <span class="item-content">Media - Envío en proceso</span>
                </li>
                <li class="sortable-item" data-priority="3">
                    <span class="drag-handle">☰</span>
                    <span class="item-content">Baja - Confirmación de entrega</span>
                </li>
                <li class="sortable-item" data-priority="4">
                    <span class="drag-handle">☰</span>
                    <span class="item-content">Info - Seguimiento de pedido</span>
                </li>
                <li class="sortable-item" data-priority="5">
                    <span class="drag-handle">☰</span>
                    <span class="item-content">General - Actualización de perfil</span>
                </li>
            </ul>
        `;
        document.body.appendChild(container);
    }

    addDragHandlers() {
        const list = document.querySelector('.sortable-list');
        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            draggedItem = e.target.closest('.sortable-item');
            draggedItem.classList.add('dragging');
        });

        list.addEventListener('dragend', (e) => {
            e.target.closest('.sortable-item')?.classList.remove('dragging');
            draggedItem = null;
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoSortableList();
});