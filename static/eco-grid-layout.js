// Grid Layout - Layout grid
class EcoGridLayout {
    constructor() {
        this.init();
    }

    init() {
        this.createGrid();
    }

    createGrid() {
        const grid = document.createElement('div');
        grid.className = 'grid-layout';
        grid.innerHTML = `
            <div class="grid-item">
                <img src="https://via.placeholder.com/300x300/2ecc71/ffffff?text=Grid+1" alt="Grid 1">
                <h4>Producto 1</h4>
            </div>
            <div class="grid-item">
                <img src="https://via.placeholder.com/300x300/3498db/ffffff?text=Grid+2" alt="Grid 2">
                <h4>Producto 2</h4>
            </div>
            <div class="grid-item">
                <img src="https://via.placeholder.com/300x300/e74c3c/ffffff?text=Grid+3" alt="Grid 3">
                <h4>Producto 3</h4>
            </div>
            <div class="grid-item">
                <img src="https://via.placeholder.com/300x300/f39c12/ffffff?text=Grid+4" alt="Grid 4">
                <h4>Producto 4</h4>
            </div>
            <div class="grid-item">
                <img src="https://via.placeholder.com/300x300/9b59b6/ffffff?text=Grid+5" alt="Grid 5">
                <h4>Producto 5</h4>
            </div>
            <div class="grid-item">
                <img src="https://via.placeholder.com/300x300/1abc9c/ffffff?text=Grid+6" alt="Grid 6">
                <h4>Producto 6</h4>
            </div>
        `;
        document.body.appendChild(grid);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoGridLayout();
});