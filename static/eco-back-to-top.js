// Back to Top - Botón volver arriba
class EcoBackToTop {
    constructor() {
        this.init();
    }

    init() {
        this.createButton();
        this.addScrollListener();
    }

    createButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '↑';
        button.style.display = 'none';
        document.body.appendChild(button);

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    addScrollListener() {
        window.addEventListener('scroll', () => {
            const button = document.querySelector('.back-to-top');
            if (window.pageYOffset > 300) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoBackToTop();
});