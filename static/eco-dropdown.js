// Dropdown - Menús desplegables
class EcoDropdown {
    constructor() {
        this.init();
    }

    init() {
        this.createDropdowns();
        this.addEventListeners();
    }

    createDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-trigger');
        dropdowns.forEach(trigger => {
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown-menu';
            dropdown.innerHTML = `
                <ul>
                    <li><a href="#">Opción 1</a></li>
                    <li><a href="#">Opción 2</a></li>
                    <li><a href="#">Opción 3</a></li>
                </ul>
            `;
            trigger.appendChild(dropdown);
        });
    }

    addEventListeners() {
        const triggers = document.querySelectorAll('.dropdown-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.querySelector('.dropdown-menu');
                dropdown.classList.toggle('active');
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoDropdown();
});