// Product Cards Improved - Cards de productos mejoradas
class EcoCardsImproved {
    constructor() {
        this.init();
    }

    init() {
        this.improveProductCards();
        this.addHoverEffects();
        this.addQuickView();
        this.addWishlistButtons();
        this.addRatingStars();
    }

    improveProductCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.classList.add('improved-card');
            this.addCardImageZoom(card);
            this.addDiscountBadge(card);
            this.addStockIndicator(card);
        });
    }

    addCardImageZoom(card) {
        const image = card.querySelector('.product-image');
        if (image) {
            image.addEventListener('mouseenter', () => {
                image.style.transform = 'scale(1.1)';
                image.style.transition = 'transform 0.3s ease';
            });
            image.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1)';
            });
        }
    }

    addDiscountBadge(card) {
        const price = card.querySelector('.price');
        if (price) {
            const priceText = price.textContent;
            if (priceText.includes('S/.')) {
                const originalPrice = parseFloat(priceText.replace('S/.', '').trim());
                const discountPrice = (originalPrice * 0.75).toFixed(2);
                
                if (originalPrice > 20) {
                    const badge = document.createElement('span');
                    badge.className = 'discount-badge';
                    badge.textContent = '-25%';
                    card.appendChild(badge);
                }
            }
        }
    }

    addStockIndicator(card) {
        const stockInfo = card.querySelector('.stock-info');
        if (stockInfo) {
            const stock = parseInt(stockInfo.textContent);
            const indicator = document.createElement('div');
            indicator.className = 'stock-indicator';
            
            if (stock > 50) {
                indicator.className += ' high';
                indicator.textContent = '✓ Stock alto';
            } else if (stock > 20) {
                indicator.className += ' medium';
                indicator.textContent = '⚡ Stock medio';
            } else {
                indicator.className += ' low';
                indicator.textContent = '⚠ Stock bajo';
            }
            
            card.appendChild(indicator);
        }
    }

    addHoverEffects() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                card.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            });
        });
    }

    addQuickView() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const quickViewBtn = document.createElement('button');
            quickViewBtn.className = 'quick-view-btn';
            quickViewBtn.textContent = '👁 Vista rápida';
            quickViewBtn.addEventListener('click', () => {
                this.showQuickView(card);
            });
            card.appendChild(quickViewBtn);
        });
    }

    showQuickView(card) {
        const title = card.querySelector('.product-title').textContent;
        const price = card.querySelector('.price').textContent;
        const image = card.querySelector('.product-image').src;
        
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="${image}" alt="${title}">
                <h3>${title}</h3>
                <p class="price">${price}</p>
                <button class="btn-primary">Agregar al carrito</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }

    addWishlistButtons() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.innerHTML = '♡';
            wishlistBtn.addEventListener('click', () => {
                wishlistBtn.innerHTML = wishlistBtn.innerHTML === '♡' ? '♥' : '♡';
                wishlistBtn.classList.toggle('active');
            });
            card.appendChild(wishlistBtn);
        });
    }

    addRatingStars() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const rating = card.querySelector('.rating');
            if (rating) {
                const ratingValue = parseFloat(rating.textContent);
                const stars = this.generateStars(ratingValue);
                rating.innerHTML = stars;
            }
        });
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '★';
            } else if (i - 0.5 <= rating) {
                stars += '☆';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoCardsImproved();
});