document.addEventListener('DOMContentLoaded', function () {
    const welcomeKey = 'EcoMarketWelcome';
    if (!localStorage.getItem(welcomeKey)) {
        if (typeof showToast === 'function') {
            showToast('Bienvenido a EcoMarket. Explora productos ecológicos y disfruta tu compra.', 'info');
        }
        localStorage.setItem(welcomeKey, 'true');
    }

    const backToTop = document.createElement('button');
    backToTop.id = 'backToTop';
    backToTop.type = 'button';
    backToTop.title = 'Ir arriba';
    backToTop.textContent = '↑';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        if (window.scrollY > 420) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
});
