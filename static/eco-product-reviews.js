// Product Reviews - Sistema de reviews
class EcoProductReviews {
    constructor() {
        this.init();
    }

    init() {
        this.addReviewButton();
        this.createReviewModal();
        this.displayExistingReviews();
    }

    addReviewButton() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const reviewBtn = document.createElement('button');
            reviewBtn.className = 'review-btn';
            reviewBtn.innerHTML = '⭐ Escribir review';
            reviewBtn.addEventListener('click', () => {
                this.showReviewModal(product);
            });
            product.appendChild(reviewBtn);
        });
    }

    createReviewModal() {
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Escribe tu review</h2>
                <form class="review-form">
                    <div class="rating-selector">
                        <label>Calificación:</label>
                        <div class="stars">
                            <span class="star" data-rating="1">★</span>
                            <span class="star" data-rating="2">★</span>
                            <span class="star" data-rating="3">★</span>
                            <span class="star" data-rating="4">★</span>
                            <span class="star" data-rating="5">★</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Título:</label>
                        <input type="text" name="title" required>
                    </div>
                    <div class="form-group">
                        <label>Comentario:</label>
                        <textarea name="comment" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Nombre:</label>
                        <input type="text" name="name" required>
                    </div>
                    <button type="submit">Enviar review</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.querySelector('.review-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview(e.target);
        });

        modal.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
            });
        });
    }

    setRating(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    showReviewModal(product) {
        const modal = document.querySelector('.review-modal');
        modal.style.display = 'flex';
    }

    submitReview(form) {
        const review = {
            title: form.title.value,
            comment: form.comment.value,
            name: form.name.value,
            rating: document.querySelectorAll('.star.active').length,
            date: new Date().toLocaleDateString()
        };

        this.displayReview(review);
        document.querySelector('.review-modal').style.display = 'none';
        form.reset();
        this.setRating(0);
    }

    displayReview(review) {
        const reviewsContainer = document.querySelector('.reviews-container');
        if (!reviewsContainer) {
            this.createReviewsContainer();
        }

        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        reviewElement.innerHTML = `
            <div class="review-header">
                <h4>${review.title}</h4>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            </div>
            <p class="review-comment">${review.comment}</p>
            <div class="review-footer">
                <span class="review-author">${review.name}</span>
                <span class="review-date">${review.date}</span>
            </div>
        `;

        document.querySelector('.reviews-container').appendChild(reviewElement);
    }

    createReviewsContainer() {
        const container = document.createElement('div');
        container.className = 'reviews-container';
        document.body.appendChild(container);
    }

    displayExistingReviews() {
        const existingReviews = [
            {
                title: 'Excelente producto',
                comment: 'Me encantó, muy buena calidad y ecológico.',
                name: 'María G.',
                rating: 5,
                date: '15/08/2026'
            },
            {
                title: 'Buen producto',
                comment: 'Cumple con lo esperado, recomiendo.',
                name: 'Juan P.',
                rating: 4,
                date: '10/08/2026'
            }
        ];

        existingReviews.forEach(review => this.displayReview(review));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProductReviews();
});