// Split View - Vista dividida
class EcoSplitView {
    constructor() {
        this.init();
    }

    init() {
        this.createSplitView();
        this.addSplitterHandler();
    }

    createSplitView() {
        const container = document.createElement('div');
        container.className = 'split-view-container';
        container.innerHTML = `
            <div class="split-pane left-pane">
                <div class="pane-content">
                    <h3>Panel Izquierdo</h3>
                    <p>Contenido del panel izquierdo. Puedes redimensionar este panel arrastrando el divisor.</p>
                    <ul>
                        <li>Producto 1</li>
                        <li>Producto 2</li>
                        <li>Producto 3</li>
                    </ul>
                </div>
            </div>
            <div class="splitter" id="splitter"></div>
            <div class="split-pane right-pane">
                <div class="pane-content">
                    <h3>Panel Derecho</h3>
                    <p>Contenido del panel derecho. Este panel muestra información detallada.</p>
                    <div class="detail-card">
                        <h4>Detalles del producto seleccionado</h4>
                        <p>Descripción completa del producto con todas las características.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addSplitterHandler() {
        const splitter = document.getElementById('splitter');
        const leftPane = document.querySelector('.left-pane');
        const rightPane = document.querySelector('.right-pane');
        const container = document.querySelector('.split-view-container');

        let isResizing = false;

        splitter.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const x = e.clientX - containerRect.left;

            const leftPercentage = (x / containerWidth) * 100;
            const rightPercentage = 100 - leftPercentage;

            if (leftPercentage > 20 && leftPercentage < 80) {
                leftPane.style.flex = `0 0 ${leftPercentage}%`;
                rightPane.style.flex = `0 0 ${rightPercentage}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoSplitView();
});