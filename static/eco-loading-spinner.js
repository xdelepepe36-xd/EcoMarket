// Loading Spinner - Spinner de carga
class EcoLoadingSpinner {
    constructor() {
        this.init();
    }

    init() {
        this.createSpinner();
    }

    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <p>Cargando...</p>
        `;
        document.body.appendChild(spinner);

        setTimeout(() => {
            spinner.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoLoadingSpinner();
});