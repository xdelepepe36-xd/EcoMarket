// Breadcrumb Navigation - Navegación breadcrumb avanzada
class EcoBreadcrumbNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.createAdvancedBreadcrumb();
        this.addBreadcrumbHandlers();
    }

    createAdvancedBreadcrumb() {
        const container = document.createElement('div');
        container.className = 'breadcrumb-nav-container';
        container.innerHTML = `
            <h3>🔗 Navegación breadcrumb avanzada</h3>
            <nav class="breadcrumb-advanced" aria-label="Breadcrumb">
                <a href="/" class="breadcrumb-item">
                    <span class="breadcrumb-icon">🏠</span>
                    <span class="breadcrumb-text">Inicio</span>
                </a>
                <span class="breadcrumb-separator">/</span>
                <a href="/productos" class="breadcrumb-item">
                    <span class="breadcrumb-icon">🛍️</span>
                    <span class="breadcrumb-text">Productos</span>
                </a>
                <span class="breadcrumb-separator">/</span>
                <a href="/productos?categoria=Accesorios" class="breadcrumb-item">
                    <span class="breadcrumb-icon">🎒</span>
                    <span class="breadcrumb-text">Accesorios</span>
                </a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">
                    <span class="breadcrumb-icon">📍</span>
                    <span class="breadcrumb-text">Botella ecológica</span>
                </span>
            </nav>
        `;
        document.body.appendChild(container);
    }

    addBreadcrumbHandlers() {
        const items = document.querySelectorAll('.breadcrumb-item:not(.current)');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.querySelector('.breadcrumb-icon').style.transform = 'scale(1.2)';
            });
            item.addEventListener('mouseleave', () => {
                item.querySelector('.breadcrumb-icon').style.transform = 'scale(1)';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoBreadcrumbNavigation();
});