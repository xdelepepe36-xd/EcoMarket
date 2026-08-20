// Circular Menu - Menú circular
class EcoCircularMenu {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createCircularMenu();
        this.addMenuHandlers();
    }

    createCircularMenu() {
        const menu = document.createElement('div');
        menu.className = 'circular-menu';
        menu.innerHTML = `
            <button class="menu-toggle" id="menuToggle">+</button>
            <div class="menu-items" id="menuItems">
                <button class="menu-item" data-action="home">🏠</button>
                <button class="menu-item" data-action="products">🛍️</button>
                <button class="menu-item" data-action="cart">🛒</button>
                <button class="menu-item" data-action="favorites">❤️</button>
                <button class="menu-item" data-action="profile">👤</button>
                <button class="menu-item" data-action="settings">⚙️</button>
            </div>
        `;
        document.body.appendChild(menu);
    }

    addMenuHandlers() {
        const toggle = document.getElementById('menuToggle');
        const items = document.getElementById('menuItems');
        const menuItems = document.querySelectorAll('.menu-item');

        toggle.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            items.classList.toggle('open');
            toggle.textContent = this.isOpen ? '×' : '+';
        });

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                console.log(`Acción: ${action}`);
                this.isOpen = false;
                items.classList.remove('open');
                toggle.textContent = '+';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoCircularMenu();
});