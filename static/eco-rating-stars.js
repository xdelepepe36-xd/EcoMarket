// Rating Stars - Sistema de calificación con estrellas
class EcoRatingStars {
    constructor() {
        this.init();
    }

    init() {
        this.createRatingStars();
        this.addRatingHandlers();
    }

    createRatingStars() {
        const container = document.createElement('div');
        container.className = 'rating-stars-container';
        container.innerHTML = `
            <h3>⭐ Sistema de calificación</h3>
            <div class="rating-stars">
                <div class="rating-item">
                    <span class="rating-label">Calidad del producto:</span>
                    <div class="stars" data-rating="0">
                        <span class="star" data-value="1">★</span>
                        <span class="star" data-value="2">★</span>
                        <span class="star" data-value="3">★</span>
                        <span class="star" data-value="4">★</span>
                        <span class="star" data-value="5">★</span>
                    </div>
                    <span class="rating-value">0/5</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Atención al cliente:</span>
                    <div class="stars" data-rating="0">
                        <span class="star" data-value="1">★</span>
                        <span class="star" data-value="2">★</span>
                        <span class="star" data-value="3">★</span>
                        <span class="star" data-value="4">★</span>
                        <span class="star" data-value="5">★</span>
                    </div>
                    <span class="rating-value">0/5</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Envío y entrega:</span>
                    <div class="stars" data-rating="0">
                        <span class="star" data-value="1">★</span>
                        <span class="star" data-value="2">★</span>
                        <span class="star" data-value="3">★</span>
                        <span class="star" data-value="4">★</span>
                        <span class="star" data-value="5">★</span>
                    </div>
                    <span class="rating-value">0/5</span>
                </div>
                <div class="rating-summary">
                    <span class="summary-label">Promedio general:</span>
                    <span class="summary-value">0.0/5.0</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addRatingHandlers() {
        const starGroups = document.querySelectorAll('.stars');
        
        starGroups.forEach(group => {
            const stars = group.querySelectorAll('.star');
            const ratingValue = group.parentElement.querySelector('.rating-value');
            
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const value = parseInt(star.dataset.value);
                    this.setRating(group, value, ratingValue);
                });
                
                star.addEventListener('mouseenter', () => {
                    const value = parseInt(star.dataset.value);
                    this.previewRating(group, value);
                });
                
                star.addEventListener('mouseleave', () => {
                    const currentRating = parseInt(group.dataset.rating);
                    this.previewRating(group, currentRating);
                });
            });
        });
    }

    setRating(group, value, ratingValue) {
        group.dataset.rating = value;
        ratingValue.textContent = `${value}/5`;
        this.updateSummary();
    }

    previewRating(group, value) {
        const stars = group.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
                star.style.color = '#f39c12';
            } else {
                star.classList.remove('active');
                star.style.color = '#ddd';
            }
        });
    }

    updateSummary() {
        const ratings = Array.from(document.querySelectorAll('.stars')).map(group => 
            parseInt(group.dataset.rating)
        );
        
        const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        document.querySelector('.summary-value').textContent = `${average.toFixed(1)}/5.0`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoRatingStars();
});