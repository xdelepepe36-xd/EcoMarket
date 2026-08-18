// Sticky Header - Header pegajoso
class EcoStickyHeader {
    constructor() {
        this.init();
    }

    init() {
        this.addScrollListener();
    }

    addScrollListener() {
        const header = document.querySelector('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoStickyHeader();
});