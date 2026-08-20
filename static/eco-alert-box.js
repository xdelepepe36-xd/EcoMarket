// Alert Box - Cajas de alerta
class EcoAlertBox {
    constructor() {
        this.init();
    }

    init() {
        this.createAlertBoxes();
    }

    createAlertBoxes() {
        const container = document.createElement('div');
        container.className = 'alert-box-container';
        container.innerHTML = `
            <h3>⚠️ Cajas de alerta</h3>
            <div class="alert-box success">
                <span class="alert-icon">✓</span>
                <span class="alert-message">¡Operación completada exitosamente!</span>
                <span class="alert-close">&times;</span>
            </div>
            <div class="alert-box warning">
                <span class="alert-icon">⚠</span>
                <span class="alert-message">Por favor verifica la información ingresada.</span>
                <span class="alert-close">&times;</span>
            </div>
            <div class="alert-box error">
                <span class="alert-icon">✗</span>
                <span class="alert-message">Ha ocurrido un error. Por favor intenta nuevamente.</span>
                <span class="alert-close">&times;</span>
            </div>
            <div class="alert-box info">
                <span class="alert-icon">ℹ</span>
                <span class="alert-message">Información importante: tu sesión expirará en 5 minutos.</span>
                <span class="alert-close">&times;</span>
            </div>
        `;
        document.body.appendChild(container);

        container.querySelectorAll('.alert-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.alert-box').remove();
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoAlertBox();
});