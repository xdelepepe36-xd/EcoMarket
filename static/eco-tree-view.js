// Tree View - Vista de árbol
class EcoTreeView {
    constructor() {
        this.init();
    }

    init() {
        this.createTreeView();
        this.addToggleHandlers();
    }

    createTreeView() {
        const container = document.createElement('div');
        container.className = 'tree-view-container';
        container.innerHTML = `
            <h3>📁 Categorías de productos</h3>
            <ul class="tree-view">
                <li class="tree-node">
                    <span class="node-toggle">▶</span>
                    <span class="node-label">🌱 Alimentación</span>
                    <ul class="tree-children">
                        <li class="tree-node">
                            <span class="node-toggle">▶</span>
                            <span class="node-label">🥕 Orgánicos</span>
                            <ul class="tree-children">
                                <li class="tree-leaf">Frutas</li>
                                <li class="tree-leaf">Verduras</li>
                                <li class="tree-leaf">Frutos secos</li>
                            </ul>
                        </li>
                        <li class="tree-node">
                            <span class="node-toggle">▶</span>
                            <span class="node-label">🍶 Bebidas</span>
                            <ul class="tree-children">
                                <li class="tree-leaf">Jugos naturales</li>
                                <li class="tree-leaf">Tés e infusiones</li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li class="tree-node">
                    <span class="node-toggle">▶</span>
                    <span class="node-label">🧼 Higiene</span>
                    <ul class="tree-children">
                        <li class="tree-leaf">Jabones naturales</li>
                        <li class="tree-leaf">Champús sólidos</li>
                        <li class="tree-leaf">Cepillos de bambú</li>
                    </ul>
                </li>
                <li class="tree-node">
                    <span class="node-toggle">▶</span>
                    <span class="node-label">🏠 Hogar</span>
                    <ul class="tree-children">
                        <li class="tree-leaf">Bolsas reutilizables</li>
                        <li class="tree-leaf">Contenedores ecológicos</li>
                        <li class="tree-leaf">Limpiadores naturales</li>
                    </ul>
                </li>
            </ul>
        `;
        document.body.appendChild(container);
    }

    addToggleHandlers() {
        const toggles = document.querySelectorAll('.node-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const node = e.target.closest('.tree-node');
                const children = node.querySelector('.tree-children');
                
                if (children) {
                    children.classList.toggle('expanded');
                    toggle.textContent = children.classList.contains('expanded') ? '▼' : '▶';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTreeView();
});