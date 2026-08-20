// Drag and Drop - Sistema de arrastrar y soltar
class EcoDragDrop {
    constructor() {
        this.init();
    }

    init() {
        this.createDraggableElements();
        this.addDropZones();
        this.addEventListeners();
    }

    createDraggableElements() {
        const container = document.createElement('div');
        container.className = 'drag-drop-container';
        container.innerHTML = `
            <div class="draggable-item" draggable="true" data-id="1">
                <div class="drag-content">Producto 1</div>
            </div>
            <div class="draggable-item" draggable="true" data-id="2">
                <div class="drag-content">Producto 2</div>
            </div>
            <div class="draggable-item" draggable="true" data-id="3">
                <div class="drag-content">Producto 3</div>
            </div>
            <div class="drop-zone" data-zone="carrito">
                <div class="zone-content">🛒 Carrito</div>
            </div>
            <div class="drop-zone" data-zone="favoritos">
                <div class="zone-content">❤️ Favoritos</div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addDropZones() {
        const zones = document.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const itemId = e.dataTransfer.getData('text/plain');
                this.handleDrop(itemId, zone.dataset.zone);
            });
        });
    }

    addEventListeners() {
        const items = document.querySelectorAll('.draggable-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
    }

    handleDrop(itemId, zone) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        const zone = document.querySelector(`[data-zone="${zone}"]`);
        
        const message = document.createElement('div');
        message.className = 'drop-message';
        message.textContent = `Producto ${itemId} agregado a ${zone}`;
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoDragDrop();
});