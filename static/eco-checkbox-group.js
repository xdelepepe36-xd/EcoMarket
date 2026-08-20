// Checkbox Group - Grupo de checkboxes
class EcoCheckboxGroup {
    constructor() {
        this.init();
    }

    init() {
        this.createCheckboxGroup();
        this.addCheckboxHandlers();
    }

    createCheckboxGroup() {
        const container = document.createElement('div');
        container.className = 'checkbox-group-container';
        container.innerHTML = `
            <h3>☑️ Grupo de checkboxes</h3>
            <div class="checkbox-group">
                <div class="checkbox-header">
                    <label class="select-all">
                        <input type="checkbox" id="selectAll">
                        <span>Seleccionar todos</span>
                    </label>
                    <span class="selected-count">0 seleccionados</span>
                </div>
                <div class="checkbox-list">
                    <label class="checkbox-item">
                        <input type="checkbox" value="product1">
                        <span>Producto ecológico 1</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" value="product2">
                        <span>Producto ecológico 2</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" value="product3">
                        <span>Producto ecológico 3</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" value="product4">
                        <span>Producto ecológico 4</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" value="product5">
                        <span>Producto ecológico 5</span>
                    </label>
                </div>
                <div class="checkbox-actions">
                    <button class="action-btn invert">Invertir selección</button>
                    <button class="action-btn clear">Limpiar todo</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addCheckboxHandlers() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.checkbox-item input');
        const selectedCount = document.querySelector('.selected-count');
        const invertBtn = document.querySelector('.action-btn.invert');
        const clearBtn = document.querySelector('.action-btn.clear');

        const updateCount = () => {
            const checked = document.querySelectorAll('.checkbox-item input:checked').length;
            selectedCount.textContent = `${checked} seleccionados`;
            selectAll.checked = checked === checkboxes.length;
        };

        selectAll.addEventListener('change', () => {
            checkboxes.forEach(cb => {
                cb.checked = selectAll.checked;
            });
            updateCount();
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('change', updateCount);
        });

        invertBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => {
                cb.checked = !cb.checked;
            });
            updateCount();
        });

        clearBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => {
                cb.checked = false;
            });
            selectAll.checked = false;
            updateCount();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoCheckboxGroup();
});