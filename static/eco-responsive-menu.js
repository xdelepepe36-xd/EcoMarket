// Responsive Menu - Menú responsive
class EcoResponsiveMenu {
    constructor() {
        this.init();
    }

    init() {
        this.createHamburger();
        this.addMenuToggle();
    }

    createHamburger() {
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-menu';
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        document.body.appendChild(hamburger);

        hamburger.addEventListener('click', () => {
            this.toggleMenu();
        });
    }

    addMenuToggle() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        nav.classList.add('responsive-nav');
    }

    toggleMenu() {
        const nav = document.querySelector('nav');
        const hamburger = document.querySelector('.hamburger-menu');
        
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoResponsiveMenu();
});