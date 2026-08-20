// Status Badge - Badges de estado
class EcoStatusBadge {
    constructor() {
        this.init();
    }

    init() {
        this.createStatusBadges();
        this.addPulseAnimation();
    }

    createStatusBadges() {
        const container = document.createElement('div');
        container.className = 'status-badges-container';
        container.innerHTML = `
            <h3>🏷️ Badges de estado</h3>
            <div class="badges-grid">
                <div class="status-badge success">
                    <span class="badge-icon">✓</span>
                    <span class="badge-text">Completado</span>
                </div>
                <div class="status-badge warning">
                    <span class="badge-icon">⚠</span>
                    <span class="badge-text">Pendiente</span>
                </div>
                <div class="status-badge error">
                    <span class="badge-icon">✗</span>
                    <span class="badge-text">Error</span>
                </div>
                <div class="status-badge info">
                    <span class="badge-icon">ℹ</span>
                    <span class="badge-text">Información</span>
                </div>
                <div class="status-badge processing">
                    <span class="badge-icon">⟳</span>
                    <span class="badge-text">Procesando</span>
                </div>
                <div class="status-badge new">
                    <span class="badge-icon">★</span>
                    <span class="badge-text">Nuevo</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addPulseAnimation() {
        const processingBadge = document.querySelector('.status-badge.processing');
        if (processingBadge) {
            const icon = processingBadge.querySelector('.badge-icon');
            setInterval(() => {
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    icon.style.transform = 'rotate(0deg)';
                }, 500);
            }, 1000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoStatusBadge();
});