// Ticker - Ticker de noticias
class EcoTicker {
    constructor() {
        this.init();
    }

    init() {
        this.createTicker();
        this.startAnimation();
    }

    createTicker() {
        const ticker = document.createElement('div');
        ticker.className = 'eco-ticker';
        ticker.innerHTML = `
            <div class="ticker-label">📢 Noticias:</div>
            <div class="ticker-content">
                <div class="ticker-item">¡Nueva colección de productos sostenibles disponible!</div>
                <div class="ticker-item">Envío gratis en pedidos mayores a S/. 100</div>
                <div class="ticker-item">20% de descuento en tu primera compra con código ECO20</div>
                <div class="ticker-item">Ya tenemos más de 5000 productos ecológicos</div>
                <div class="ticker-item">Únete a nuestro programa de recompensas</div>
            </div>
        `;
        document.body.appendChild(ticker);
    }

    startAnimation() {
        const content = document.querySelector('.ticker-content');
        const items = content.querySelectorAll('.ticker-item');
        let currentIndex = 0;

        setInterval(() => {
            items[currentIndex].style.opacity = '0';
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].style.opacity = '1';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTicker();
});