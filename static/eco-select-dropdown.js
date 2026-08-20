// Select Dropdown - Dropdown select personalizado
class EcoSelectDropdown {
    constructor() {
        this.init();
    }

    init() {
        this.createSelectDropdown();
        this.addDropdownHandlers();
    }

    createSelectDropdown() {
        const container = document.createElement('div');
        container.className = 'select-dropdown-container';
        container.innerHTML = `
            <h3>📋 Dropdown select</h3>
            <div class="select-dropdown">
                <div class="dropdown-trigger" id="dropdownTrigger">
                    <span class="selected-value">Selecciona una opción</span>
                    <span class="dropdown-arrow">▼</span>
                </div>
                <div class="dropdown-menu" id="dropdownMenu">
                    <div class="dropdown-item" data-value="option1">Opción 1</div>
                    <div class="dropdown-item" data-value="option2">Opción 2</div>
                    <div class="dropdown-item" data-value="option3">Opción 3</div>
                    <div class="dropdown-item" data-value="option4">Opción 4</div>
                    <div class="dropdown-item" data-value="option5">Opción 5</div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addDropdownHandlers() {
        const trigger = document.getElementById('dropdownTrigger');
        const menu = document.getElementById('dropdownMenu');
        const items = document.querySelectorAll('.dropdown-item');
        const selectedValue = document.querySelector('.selected-value');
        const arrow = document.querySelector('.dropdown-arrow');

        trigger.addEventListener('click', () => {
            menu.classList.toggle('open');
            arrow.classList.toggle('rotated');
        });

        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const text = item.textContent;
                
                selectedValue.textContent = text;
                menu.classList.remove('open');
                arrow.classList.remove('rotated');
                
                // Remover selección previa
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.select-dropdown')) {
                menu.classList.remove('open');
                arrow.classList.remove('rotated');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoSelectDropdown();
});