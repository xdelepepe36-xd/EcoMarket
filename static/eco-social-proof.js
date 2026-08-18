// Social Proof - Prueba social
class EcoSocialProof {
    constructor() {
        this.init();
    }

    init() {
        this.addLiveVisitors();
        this.addRecentPurchases();
        this.addSocialShare();
    }

    addLiveVisitors() {
        const visitors = document.createElement('div');
        visitors.className = 'live-visitors';
        visitors.innerHTML = `
            <div class="visitors-content">
                <span class="visitor-count">👁 ${this.getRandomNumber(50, 200)}</span>
                <span class="visitor-text">personas viendo esto ahora</span>
            </div>
        `;
        document.body.appendChild(visitors);

        setInterval(() => {
            const count = visitors.querySelector('.visitor-count');
            count.textContent = `👁 ${this.getRandomNumber(50, 200)}`;
        }, 5000);
    }

    addRecentPurchases() {
        const purchases = document.createElement('div');
        purchases.className = 'recent-purchases';
        purchases.innerHTML = `
            <div class="purchase-content">
                <span class="purchase-icon">🛒</span>
                <span class="purchase-text">Alguien compró hace ${this.getRandomNumber(1, 10)} minutos</span>
            </div>
        `;
        document.body.appendChild(purchases);

        setInterval(() => {
            const text = purchases.querySelector('.purchase-text');
            text.textContent = `Alguien compró hace ${this.getRandomNumber(1, 10)} minutos`;
        }, 8000);
    }

    addSocialShare() {
        const share = document.createElement('div');
        share.className = 'social-share';
        share.innerHTML = `
            <h4>Compartir</h4>
            <div class="share-buttons">
                <button class="share-btn facebook">Facebook</button>
                <button class="share-btn twitter">Twitter</button>
                <button class="share-btn whatsapp">WhatsApp</button>
                <button class="share-btn pinterest">Pinterest</button>
            </div>
        `;
        document.body.appendChild(share);

        share.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.shareContent(btn.className.split(' ')[1]);
            });
        });
    }

    shareContent(platform) {
        const url = window.location.href;
        const text = '¡Mira estos productos ecológicos increíbles en EcoMarket!';
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoSocialProof();
});