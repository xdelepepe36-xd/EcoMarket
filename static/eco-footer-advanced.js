// Footer Advanced - Footer mejorado con funcionalidades reales
class EcoFooterAdvanced {
    constructor() {
        this.footer = document.querySelector('footer');
        this.init();
    }

    init() {
        if (!this.footer) return;
        this.addNewsletterForm();
        this.addSocialMedia();
        this.addPaymentMethods();
        this.addScrollToTop();
        this.addMobileMenu();
        this.addAnimations();
    }

    addNewsletterForm() {
        const newsletterSection = document.createElement('div');
        newsletterSection.className = 'footer-newsletter';
        newsletterSection.innerHTML = `
            <h3>📧 Suscríbete a nuestro boletín</h3>
            <p>Recibe ofertas exclusivas y consejos ecológicos</p>
            <form class="newsletter-form">
                <input type="email" placeholder="Tu correo electrónico" required>
                <button type="submit">Suscribirse</button>
            </form>
        `;
        
        this.footer.insertBefore(newsletterSection, this.footer.firstChild);
        
        newsletterSection.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input').value;
            this.showNewsletterSuccess(email);
        });
    }

    showNewsletterSuccess(email) {
        const successMessage = document.createElement('div');
        successMessage.className = 'newsletter-success';
        successMessage.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✓</span>
                <h4>¡Gracias por suscribirte!</h4>
                <p>Te hemos enviado un correo de confirmación a ${email}</p>
                <button class="close-success">Cerrar</button>
            </div>
        `;
        document.body.appendChild(successMessage);
        
        successMessage.querySelector('.close-success').addEventListener('click', () => {
            successMessage.remove();
        });
    }

    addSocialMedia() {
        const socialSection = document.createElement('div');
        socialSection.className = 'footer-social';
        socialSection.innerHTML = `
            <h4>Síguenos en redes sociales</h4>
            <div class="social-links">
                <a href="#" class="social-link facebook" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                    </svg>
                </a>
                <a href="#" class="social-link instagram" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12,2.16c3.2,0,3.58,0,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s0,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58,0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.18,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33,0,7.05.07c-4.27.2-6.78,2.71-7,7C0,8.33,0,8.74,0,12s0,3.67.07,4.95c.2,4.27,2.71,6.78,7,7C8.33,24,8.74,24,12,24s3.67,0,4.95-.07c4.27-.2,6.78-2.71,7-7C24,15.67,24,15.26,24,12s0-3.67-.07-4.95c-.2-4.27-2.71-6.78-7-7C15.67,0,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z"/>
                    </svg>
                </a>
                <a href="#" class="social-link twitter" aria-label="Twitter">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M23.95,4.57a10,10,0,0,1-2.82.77,4.96,4.96,0,0,0,2.16-2.72,9.9,9.9,0,0,1-3.12,1.19,4.92,4.92,0,0,0-8.39,4.49A14,14,0,0,1,1.64,3.16,4.92,4.92,0,0,0,3.16,9.72,4.86,4.86,0,0,1,.96,9.11v.06a4.93,4.93,0,0,0,3.95,4.83,4.86,4.86,0,0,1-2.22.08,4.93,4.93,0,0,0,4.6,3.42A9.87,9.87,0,0,1,0,19.54a13.94,13.94,0,0,0,7.55,2.21A13.9,13.9,0,0,0,21.55,7.82c0-.21,0-.42,0-.63A10,10,0,0,0,24,4.59Z"/>
                    </svg>
                </a>
                <a href="#" class="social-link youtube" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.5,3.5,12,3.5,12,3.5s-7.5,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.64,31.64,0,0,0,0,12a31.64,31.64,0,0,0,.5,5.81,3.02,3.02,0,0,0,2.12,2.14c1.88.55,9.38.55,9.38.55s7.5,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.64,31.64,0,0,0,24,12,31.64,31.64,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z"/>
                    </svg>
                </a>
            </div>
        `;
        
        this.footer.appendChild(socialSection);
    }

    addPaymentMethods() {
        const paymentSection = document.createElement('div');
        paymentSection.className = 'footer-payments';
        paymentSection.innerHTML = `
            <h4>Métodos de pago aceptados</h4>
            <div class="payment-icons">
                <div class="payment-icon visa">💳 Visa</div>
                <div class="payment-icon mastercard">💳 Mastercard</div>
                <div class="payment-icon paypal">💳 PayPal</div>
                <div class="payment-icon yape">💳 Yape</div>
                <div class="payment-icon plin">💳 Plin</div>
            </div>
        `;
        
        this.footer.appendChild(paymentSection);
    }

    addScrollToTop() {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.style.display = 'none';
        
        document.body.appendChild(scrollBtn);
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = 'block';
            } else {
                scrollBtn.style.display = 'none';
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    addMobileMenu() {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'footer-mobile-toggle';
        mobileToggle.innerHTML = '☰';
        
        this.footer.appendChild(mobileToggle);
        
        mobileToggle.addEventListener('click', () => {
            this.footer.classList.toggle('mobile-open');
        });
    }

    addAnimations() {
        const footerElements = this.footer.querySelectorAll('h3, h4, p, a');
        footerElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = `all 0.5s ease ${index * 0.05}s`;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + index * 50);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoFooterAdvanced();
});