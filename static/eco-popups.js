// Popups - Sistema de popups
class EcoPopups {
    constructor() {
        this.init();
    }

    init() {
        this.addWelcomePopup();
        this.addExitIntentPopup();
        this.addScrollPopup();
    }

    addWelcomePopup() {
        const popup = document.createElement('div');
        popup.className = 'popup welcome-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close-popup">&times;</span>
                <h2>🎉 ¡Bienvenido a EcoMarket!</h2>
                <p>Obtén 20% de descuento en tu primera compra</p>
                <button class="popup-btn">Obtener descuento</button>
            </div>
        `;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.display = 'flex';
        }, 2000);

        popup.querySelector('.close-popup').addEventListener('click', () => {
            popup.style.display = 'none';
        });

        popup.querySelector('.popup-btn').addEventListener('click', () => {
            popup.style.display = 'none';
            this.showCoupon();
        });
    }

    addExitIntentPopup() {
        const popup = document.createElement('div');
        popup.className = 'popup exit-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close-popup">&times;</span>
                <h2>🚀 ¡Espera!</h2>
                <p>No te vayas sin tu 15% de descuento</p>
                <button class="popup-btn">Quiero mi descuento</button>
            </div>
        `;
        document.body.appendChild(popup);

        document.addEventListener('mouseout', (e) => {
            if (e.clientY < 0) {
                popup.style.display = 'flex';
            }
        });

        popup.querySelector('.close-popup').addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    addScrollPopup() {
        const popup = document.createElement('div');
        popup.className = 'popup scroll-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close-popup">&times;</span>
                <h2>✨ ¿Te gusta lo que ves?</h2>
                <p>Suscríbete y recibe ofertas exclusivas</p>
                <input type="email" placeholder="Tu correo">
                <button class="popup-btn">Suscribirse</button>
            </div>
        `;
        document.body.appendChild(popup);

        let scrollShown = false;
        window.addEventListener('scroll', () => {
            if (!scrollShown && window.pageYOffset > 500) {
                popup.style.display = 'flex';
                scrollShown = true;
            }
        });

        popup.querySelector('.close-popup').addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    showCoupon() {
        const coupon = document.createElement('div');
        coupon.className = 'coupon-display';
        coupon.innerHTML = `
            <div class="coupon-content">
                <h3>🎁 ¡Tu cupón está listo!</h3>
                <p class="coupon-code">ECO20</p>
                <p>Usa este código en tu próxima compra</p>
                <button class="close-coupon">Entendido</button>
            </div>
        `;
        document.body.appendChild(coupon);

        coupon.querySelector('.close-coupon').addEventListener('click', () => {
            coupon.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoPopups();
});