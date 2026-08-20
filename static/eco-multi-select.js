// Multi Select - Selección múltiple
class EcoMultiSelect {
    constructor() {
        this.init();
    }

    init() {
        this.createMultiSelect();
        this.addMultiSelectHandlers();
    }

    createMultiSelect() {
        const container = document.createElement('div');
        container.className = 'multi-select-container';
        container.innerHTML = `
            <h3📝 Selección múltiple</h3>
            <div class="multi-select">
                <div class="select-trigger" id="multiSelectTrigger">
                    <div class="selected-tags" id="selectedTags">
                        <span class="placeholder">Selecciona opciones...</span>
                    </div>
                    <span class="dropdown-arrow">▼</span>
                </div>
                <div class="dropdown-menu" id="multiDropdownMenu">
                    <div class="search-box">
                        <input type="text" placeholder="Buscar..." id="multiSearch">
                    </div>
                    <div class="options-list">
                        <label class="option-item">
                            <input type="checkbox" value="vegetales">
                            <span>🥕 Vegetales</span>
                        </label>
                        <label class="option-item">
                            <input type="checkbox" value="frutas">
                            <span>🍎 Frutas</span>
                        </label>
                        <label class="option-item">
                            <input type="checkbox" value="lacteos">
                            <span>🥛 Lácteos</span>
                        </label>
                        <label class="option-item">
                            <input type="checkbox" value="carnes">
                            <span>🥩 Carnes</span>
                        </label>
                        <label class="option-item">
                            <input type="checkbox" value="granos">
                            <span>🌾 Granos</span>
                        </label>
                        <label class="option-item">
                            <input type="checkbox" value="bebidas">
                            <span>🥤 Bebidas</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addMultiSelectHandlers() {
        const trigger = document.getElementById('multiSelectTrigger');
        const menu = document.getElementById('multiDropdownMenu');
        const selectedTags = document.getElementById('selectedTags');
        const checkboxes = document.querySelectorAll('.option-item input');
        const searchInput = document.getElementById('multiSearch');
        const arrow = document.querySelector('.dropdown-arrow');

        trigger.addEventListener('click', () => {
            menu.classList.toggle('open');
            arrow.classList.toggle('rotated');
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.updateSelectedTags();
            });
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = document.querySelectorAll('.option-item');
            
            options.forEach(option => {
                const text = option.querySelector('span').textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.multi-select')) {
                menu.classList.remove('open');
                arrow.classList.remove('rotated');
            }
        });
    }

    updateSelectedTags() {
        const selectedTags = document.getElementById('selectedTags');
        const checkboxes = document.querySelectorAll('.option-item input:checked');
        
        if (checkboxes.length === 0) {
            selectedTags.innerHTML = '<span class="placeholder">Selecciona opciones...</span>';
        } else {
            selectedTags.innerHTML = '';
            checkboxes.forEach(cb => {
                const label = cb.closest('.option-item').querySelector('span').textContent;
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.innerHTML = `${label} <span class="remove-tag">×</span>`;
                tag.querySelector('.remove-tag').addEventListener('click', (e) => {
                    e.stopPropagation();
                    cb.checked = false;
                    this.updateSelectedTags();
                });
                selectedTags.appendChild(tag);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoMultiSelect();
});