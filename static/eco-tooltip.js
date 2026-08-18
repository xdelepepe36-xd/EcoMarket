// Tooltip - Tooltips informativos
class EcoTooltip {
    constructor() {
        this.init();
    }

    init() {
        this.addTooltipsToProducts();
        this.createTooltipElement();
    }

    addTooltipsToProducts() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const title = product.querySelector('.product-title');
            if (title) {
                title.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e, 'Haz clic para ver más detalles');
                });
                title.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
            }
        });
    }

    createTooltipElement() {
        const tooltip = document.createElement('div');
        tooltip.className = 'eco-tooltip';
        document.body.appendChild(tooltip);
    }

    showTooltip(e, text) {
        const tooltip = document.querySelector('.eco-tooltip');
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
    }

    hideTooltip() {
        const tooltip = document.querySelector('.eco-tooltip');
        tooltip.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTooltip();
});