// Context Menu - Menú contextual
class EcoContextMenu {
    constructor() {
        this.init();
    }

    init() {
        this.createContextMenu();
        this.addContextMenuHandlers();
    }

    createContextMenu() {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="copy">📋 Copiar</div>
            <div class="context-menu-item" data-action="paste">📌 Pegar</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="edit">✏️ Editar</div>
            <div class="context-menu-item" data-action="delete">🗑️ Eliminar</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="share">🔗 Compartir</div>
        `;
        document.body.appendChild(menu);
        menu.style.display = 'none';
    }

    addContextMenuHandlers() {
        const menu = document.querySelector('.context-menu');
        const items = document.querySelectorAll('.context-menu-item');

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            menu.style.display = 'block';
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';
        });

        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });

        items.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                console.log(`Acción contextual: ${action}`);
                menu.style.display = 'none';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoContextMenu();
});