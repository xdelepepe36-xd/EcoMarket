// Breadcrumb - Navegación breadcrumb
class EcoBreadcrumb {
    constructor() {
        this.init();
    }

    init() {
        this.createBreadcrumb();
    }

    createBreadcrumb() {
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        breadcrumb.innerHTML = `
            <ol>
                <li><a href="/">Inicio</a></li>
                <li><a href="/productos">Productos</a></li>
                <li><a href="/productos?categoria=Accesorios">Accesorios</a></li>
                <li aria-current="page">Producto actual</li>
            </ol>
        `;
        document.body.appendChild(breadcrumb);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoBreadcrumb();
});