// Typography - Tipografía mejorada
class EcoTypography {
    constructor() {
        this.init();
    }

    init() {
        this.createTypography();
    }

    createTypography() {
        const container = document.createElement('div');
        container.className = 'typography-container';
        container.innerHTML = `
            <h3>📝 Tipografía mejorada</h3>
            <div class="typography-demo">
                <div class="typo-section">
                    <h1 class="typo-display">Display Text</h1>
                    <h2 class="typo-heading">Heading Text</h2>
                    <h3 class="typo-subheading">Subheading Text</h3>
                    <p class="typo-body">Body text with improved readability and spacing. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    <p class="typo-caption">Caption text for smaller descriptions.</p>
                </div>
                <div class="typo-section">
                    <span class="typo-highlight">Texto destacado</span>
                    <span class="typo-muted">Texto en mudo</span>
                    <span class="typo-success">Texto de éxito</span>
                    <span class="typo-warning">Texto de advertencia</span>
                    <span class="typo-error">Texto de error</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTypography();
});