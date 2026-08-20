// Radio Group - Grupo de radio buttons
class EcoRadioGroup {
    constructor() {
        this.init();
    }

    init() {
        this.createRadioGroup();
        this.addRadioHandlers();
    }

    createRadioGroup() {
        const container = document.createElement('div');
        container.className = 'radio-group-container';
        container.innerHTML = `
            <h3>🔘 Grupo de opciones</h3>
            <div class="radio-group">
                <div class="radio-header">
                    <span class="group-label">Método de envío preferido:</span>
                <span class="selected-option" id="selectedOption">Ninguno seleccionado</span>
                </div>
                <div class="radio-list">
                    <label class="radio-item">
                        <input type="radio" name="shipping" value="standard">
                        <div class="radio-content">
                            <span class="radio-title">📦 Envío estándar</span>
                            <span class="radio-desc">3-5 días hábiles - S/. 12.00</span>
                        </div>
                    </label>
                    <label class="radio-item">
                        <input type="radio" name="shipping" value="express">
                        <div class="radio-content">
                            <span class="radio-title">🚀 Envío express</span>
                            <span class="radio-desc">1-2 días hábiles - S/. 25.00</span>
                        </div>
                    </label>
                    <label class="radio-item">
                        <input type="radio" name="shipping" value="overnight">
                        <div class="radio-content">
                            <span class="radio-title">🌙 Envío nocturno</span>
                            <span class="radio-desc">Entrega misma noche - S/. 35.00</span>
                        </div>
                    </label>
                    <label class="radio-item">
                        <input type="radio" name="shipping" value="pickup">
                        <div class="radio-content">
                            <span class="radio-title">🏪 Recoger en tienda</span>
                            <span class="radio-desc">Sin costo - Disponible inmediatamente</span>
                        </div>
                    </label>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addRadioHandlers() {
        const radios = document.querySelectorAll('.radio-item input');
        const selectedOption = document.getElementById('selectedOption');

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selected = e.target.closest('.radio-item').querySelector('.radio-title').textContent;
                selectedOption.textContent = selected;
                
                // Remover selección visual previa
                document.querySelectorAll('.radio-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Agregar selección visual actual
                e.target.closest('.radio-item').classList.add('selected');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoRadioGroup();
});