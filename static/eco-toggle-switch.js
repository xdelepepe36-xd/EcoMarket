// Toggle Switch - Interruptor toggle
class EcoToggleSwitch {
    constructor() {
        this.init();
    }

    init() {
        this.createToggleSwitches();
        this.addToggleHandlers();
    }

    createToggleSwitches() {
        const container = document.createElement('div');
        container.className = 'toggle-switch-container';
        container.innerHTML = `
            <h3>🔘 Interruptores</h3>
            <div class="switches-grid">
                <div class="toggle-item">
                    <label class="toggle-label">Notificaciones</label>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-item">
                    <label class="toggle-label">Modo oscuro</label>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-item">
                    <label class="toggle-label">Sonido</label>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-item">
                    <label class="toggle-label">Vibración</label>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-item">
                    <label class="toggle-label">Actualizaciones automáticas</label>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="toggle-item">
                    <label class="toggle-label">Geolocalización</label>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addToggleHandlers() {
        const toggles = document.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const label = e.target.closest('.toggle-item').querySelector('.toggle-label').textContent;
                const status = e.target.checked ? 'activado' : 'desactivado';
                console.log(`${label} ${status}`);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoToggleSwitch();
});