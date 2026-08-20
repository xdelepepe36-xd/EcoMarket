// Resizable Elements - Elementos redimensionables
class EcoResizableElements {
    constructor() {
        this.init();
    }

    init() {
        this.createResizablePanels();
        this.addResizeHandlers();
    }

    createResizablePanels() {
        const container = document.createElement('div');
        container.className = 'resizable-container';
        container.innerHTML = `
            <div class="resizable-panel" id="panel1">
                <div class="panel-header">
                    <h4>Panel 1</h4>
                    <div class="resize-handle resize-right"></div>
                </div>
                <div class="panel-content">
                    <p>Este panel puede redimensionarse arrastrando el borde derecho.</p>
                </div>
            </div>
            <div class="resizable-panel" id="panel2">
                <div class="panel-header">
                    <h4>Panel 2</h4>
                    <div class="resize-handle resize-right"></div>
                    <div class="resize-handle resize-bottom"></div>
                </div>
                <div class="panel-content">
                    <p>Este panel puede redimensionarse arrastrando los bordes derecho e inferior.</p>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addResizeHandlers() {
        const panels = document.querySelectorAll('.resizable-panel');
        
        panels.forEach(panel => {
            const rightHandle = panel.querySelector('.resize-right');
            const bottomHandle = panel.querySelector('.resize-bottom');

            if (rightHandle) {
                this.addHorizontalResize(panel, rightHandle);
            }

            if (bottomHandle) {
                this.addVerticalResize(panel, bottomHandle);
            }
        });
    }

    addHorizontalResize(panel, handle) {
        let startX, startWidth;

        handle.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startWidth = panel.offsetWidth;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        const resize = (e) => {
            const width = startWidth + (e.clientX - startX);
            panel.style.width = Math.max(200, width) + 'px';
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };
    }

    addVerticalResize(panel, handle) {
        let startY, startHeight;

        handle.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startHeight = panel.offsetHeight;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        const resize = (e) => {
            const height = startHeight + (e.clientY - startY);
            panel.style.height = Math.max(150, height) + 'px';
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoResizableElements();
});