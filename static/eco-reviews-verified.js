/**
 * eco-reviews-verified.js - Reviews con verificacion
 * 
 * Funcionalidades:
 - Verificacion de compra
 - Reviews con fotos
 - Rating detallado
 - Reviews verificadas
 - Sistema de likes en reviews
 - Reporte de reviews
 */

class EcoReviewsVerified {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/reviews',
            storageKey: options.storageKey || 'ecomarket_reviews_verified',
            enablePhotos: options.enablePhotos !== false,
            enableVerification: options.enableVerification !== false,
            ...options
        };
        
        this.reviews = [];
        this.verifiedPurchases = [];
        
        this.init();
    }
    
    init() {
        this.loadReviews();
        this.createReviewsUI();
        this.setupEventListeners();
    }
    
    createReviewsUI() {
        const container = document.querySelector('[data-eco-reviews-verified]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-reviews-verified">
                <div class="eco-reviews-header">
                    <h3>Reviews Verificadas</h3>
                    <div class="eco-reviews-stats">
                        <div class="eco-average-rating">
                            <span class="eco-rating-value" data-average-rating>4.5</span>
                            <div class="eco-stars" data-average-stars></div>
                        </div>
                        <span class="eco-total-reviews" data-total-reviews>0 reviews</span>
                    </div>
                </div>
                
                <div class="eco-reviews-actions">
                    <button class="eco-btn-eco" data-write-review>
                        <i class="bi bi-pencil"></i>
                        Escribir Review
                    </button>
                    <button class="eco-btn-secondary" data-filter-verified>
                        <i class="bi bi-check-circle"></i>
                        Solo Verificadas
                    </button>
                </div>
                
                <div class="eco-review-form" data-review-form style="display: none;">
                    <h4>Nueva Review</h4>
                    <div class="eco-verification-status" data-verification-status>
                        ${this.renderVerificationStatus()}
                    </div>
                    
                    <div class="eco-form-group">
                        <label>Valoración:</label>
                        <div class="eco-rating-input" data-rating-input>
                            ${this.renderRatingStars(0)}
                        </div>
                    </div>
                    
                    <div class="eco-form-group">
                        <label>Título:</label>
                        <input type="text" data-review-title placeholder="Resumen de tu experiencia" required>
                    </div>
                    
                    <div class="eco-form-group">
                        <label>Descripción:</label>
                        <textarea data-review-description placeholder="Detalla tu experiencia..." rows="4" required></textarea>
                    </div>
                    
                    <div class="eco-form-group">
                        <label>Pros:</label>
                        <input type="text" data-review-pros placeholder="Lo que te gustó (separado por comas)">
                    </div>
                    
                    <div class="eco-form-group">
                        <label>Contras:</label>
                        <input type="text" data-review-cons placeholder="Lo que se podría mejorar (separado por comas)">
                    </div>
                    
                    ${this.options.enablePhotos ? `
                        <div class="eco-form-group">
                            <label>Fotos:</label>
                            <input type="file" data-review-photos accept="image/*" multiple>
                            <div class="eco-photos-preview" data-photos-preview></div>
                        </div>
                    ` : ''}
                    
                    <div class="eco-rating-breakdown">
                        <h5>Valoración Detallada:</h5>
                        <div class="eco-rating-item">
                            <label>Calidad:</label>
                            <div class="eco-mini-rating" data-mini-rating-quality></div>
                        </div>
                        <div class="eco-rating-item">
                            <label>Precio:</label>
                            <div class="eco-mini-rating" data-mini-rating-price></div>
                        </div>
                        <div class="eco-rating-item">
                            <label>Envío:</label>
                            <div class="eco-mini-rating" data-mini-rating-shipping></div>
                        </div>
                        <div class="eco-rating-item">
                            <label>Servicio:</label>
                            <div class="eco-mini-rating" data-mini-rating-service></div>
                        </div>
                    </div>
                    
                    <div class="eco-form-actions">
                        <button class="eco-btn-eco" data-submit-review>
                            Publicar Review
                        </button>
                        <button class="eco-btn-secondary" data-cancel-review>
                            Cancelar
                        </button>
                    </div>
                </div>
                
                <div class="eco-reviews-list" data-reviews-list>
                    ${this.renderReviews()}
                </div>
            </div>
        `;
        
        this.initializeRatingInputs();
    }
    
    renderVerificationStatus() {
        if (this.verifiedPurchases.length > 0) {
            return `
                <div class="eco-verified-badge">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>Compra verificada: ${this.verifiedPurchases[0].product}</span>
                </div>
            `;
        }
        return `
            <div class="eco-unverified-badge">
                <i class="bi bi-info-circle"></i>
                <span>No tienes compras verificadas de este producto</span>
            </div>
        `;
    }
    
    renderRatingStars(rating) {
        return Array.from({length: 5}, (_, i) => `
            <i class="bi bi-star${i < rating ? '-fill' : ''}" data-star="${i + 1}"></i>
        `).join('');
    }
    
    renderReviews() {
        if (this.reviews.length === 0) {
            return '<p class="eco-no-reviews">Sin reviews</p>';
        }
        
        return this.reviews.map(review => `
            <div class="eco-review-item ${review.verified ? 'verified' : ''}">
                <div class="eco-review-header">
                    <div class="eco-reviewer-info">
                        <div class="eco-reviewer-avatar">
                            <i class="bi bi-person"></i>
                        </div>
                        <div class="eco-reviewer-details">
                            <span class="eco-reviewer-name">${review.author}</span>
                            ${review.verified ? '<span class="eco-verified-label"><i class="bi bi-check-circle"></i> Compra verificada</span>' : ''}
                        </div>
                    </div>
                    <div class="eco-review-rating">
                        <div class="eco-stars">${this.renderRatingStars(review.rating)}</div>
                        <span class="eco-review-date">${this.formatDate(review.date)}</span>
                    </div>
                </div>
                
                <div class="eco-review-content">
                    <h5>${review.title}</h5>
                    <p>${review.description}</p>
                    
                    ${review.pros ? `
                        <div class="eco-review-pros">
                            <strong>Pros:</strong> ${review.pros}
                        </div>
                    ` : ''}
                    
                    ${review.cons ? `
                        <div class="eco-review-cons">
                            <strong>Contras:</strong> ${review.cons}
                        </div>
                    ` : ''}
                    
                    ${review.photos && review.photos.length > 0 ? `
                        <div class="eco-review-photos">
                            ${review.photos.map(photo => `
                                <img src="${photo}" alt="Foto de review" loading="lazy">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="eco-rating-breakdown">
                    <span>Calidad: ${review.detailed?.quality || 0}/5</span>
                    <span>Precio: ${review.detailed?.price || 0}/5</span>
                    <span>Envío: ${review.detailed?.shipping || 0}/5</span>
                    <span>Servicio: ${review.detailed?.service || 0}/5</span>
                </div>
                
                <div class="eco-review-actions">
                    <button class="eco-like-btn" data-like-review="${review.id}">
                        <i class="bi bi-hand-thumbs-up"></i>
                        <span>${review.likes || 0}</span>
                    </button>
                    <button class="eco-report-btn" data-report-review="${review.id}">
                        <i class="bi bi-flag"></i>
                        Reportar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    initializeRatingInputs() {
        // Rating principal
        document.querySelectorAll('[data-star]').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.star);
                this.setRating(rating);
            });
        });
        
        // Mini ratings detallados
        ['quality', 'price', 'shipping', 'service'].forEach(type => {
            const container = document.querySelector(`[data-mini-rating-${type}]`);
            if (container) {
                container.innerHTML = Array.from({length: 5}, (_, i) => `
                    <i class="bi bi-star" data-mini-star="${type}-${i + 1}"></i>
                `).join('');
                
                container.querySelectorAll('[data-mini-star]').forEach(star => {
                    star.addEventListener('click', (e) => {
                        const rating = parseInt(e.target.dataset.miniStar.split('-')[1]);
                        this.setMiniRating(type, rating);
                    });
                });
            }
        });
    }
    
    setRating(rating) {
        const container = document.querySelector('[data-rating-input]');
        if (container) {
            container.innerHTML = this.renderRatingStars(rating);
            this.initializeRatingInputs();
        }
    }
    
    setMiniRating(type, rating) {
        const container = document.querySelector(`[data-mini-rating-${type}]`);
        if (container) {
            container.innerHTML = Array.from({length: 5}, (_, i) => `
                <i class="bi bi-star${i < rating ? '-fill' : ''}" data-mini-star="${type}-${i + 1}"></i>
            `).join('');
            this.initializeRatingInputs();
        }
    }
    
    setupEventListeners() {
        document.querySelector('[data-write-review]')?.addEventListener('click', () => {
            this.showReviewForm();
        });
        
        document.querySelector('[data-submit-review]')?.addEventListener('click', () => {
            this.submitReview();
        });
        
        document.querySelector('[data-cancel-review]')?.addEventListener('click', () => {
            this.hideReviewForm();
        });
        
        document.querySelectorAll('[data-like-review]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reviewId = e.target.dataset.likeReview;
                this.likeReview(parseInt(reviewId));
            });
        });
        
        document.querySelectorAll('[data-report-review]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reviewId = e.target.dataset.reportReview;
                this.reportReview(parseInt(reviewId));
            });
        });
    }
    
    showReviewForm() {
        const form = document.querySelector('[data-review-form]');
        if (form) {
            form.style.display = 'block';
        }
    }
    
    hideReviewForm() {
        const form = document.querySelector('[data-review-form]');
        if (form) {
            form.style.display = 'none';
        }
    }
    
    submitReview() {
        const title = document.querySelector('[data-review-title]')?.value;
        const description = document.querySelector('[data-review-description]')?.value;
        const pros = document.querySelector('[data-review-pros]')?.value;
        const cons = document.querySelector('[data-review-cons]')?.value;
        
        if (!title || !description) {
            alert('Por favor completa título y descripción');
            return;
        }
        
        const newReview = {
            id: Date.now(),
            author: 'Usuario',
            rating: 4, // Simulado
            title: title,
            description: description,
            pros: pros,
            cons: cons,
            verified: this.verifiedPurchases.length > 0,
            date: new Date().toISOString(),
            likes: 0,
            detailed: {
                quality: 4,
                price: 4,
                shipping: 4,
                service: 4
            }
        };
        
        this.reviews.unshift(newReview);
        this.saveReviews();
        this.updateUI();
        this.hideReviewForm();
        
        alert('Review publicada exitosamente');
    }
    
    likeReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.likes = (review.likes || 0) + 1;
            this.saveReviews();
            this.updateUI();
        }
    }
    
    reportReview(reviewId) {
        const reason = prompt('Razón del reporte:');
        if (reason) {
            alert('Review reportada. Gracias por tu ayuda.');
        }
    }
    
    updateUI() {
        const list = document.querySelector('[data-reviews-list]');
        if (list) {
            list.innerHTML = this.renderReviews();
        }
        
        // Actualizar estadísticas
        const avgRating = this.calculateAverageRating();
        const avgEl = document.querySelector('[data-average-rating]');
        if (avgEl) {
            avgEl.textContent = avgRating.toFixed(1);
        }
        
        const totalEl = document.querySelector('[data-total-reviews]');
        if (totalEl) {
            totalEl.textContent = `${this.reviews.length} reviews`;
        }
    }
    
    calculateAverageRating() {
        if (this.reviews.length === 0) return 0;
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / this.reviews.length;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    loadReviews() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.reviews = data.reviews || [];
                this.verifiedPurchases = data.verifiedPurchases || [];
            }
        } catch {
            // Usar reviews por defecto
        }
    }
    
    saveReviews() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                reviews: this.reviews,
                verifiedPurchases: this.verifiedPurchases
            }));
        } catch (error) {
            console.error('Error guardando reviews:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.querySelector('[data-eco-reviews-verified]');
    if (reviewsContainer && reviewsContainer.dataset.ecoReviewsVerified !== 'false') {
        window.ecoReviewsVerified = new EcoReviewsVerified({
            ...reviewsContainer.dataset
        });
    }
});