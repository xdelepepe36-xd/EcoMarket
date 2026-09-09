/**
 * EcoMarket - Sistema de Reviews y Valoraciones
 * Sistema completo de reseñas, ratings y feedback
 */

const EcoReviews = {
    // Estado del sistema
    state: {
        currentProductId: null,
        userReviews: {},
        productReviews: {},
        averageRatings: {},
        loading: false
    },
    
    // Configuración
    config: {
        apiEndpoint: '/api/resenas',
        maxRating: 5,
        minRating: 1,
        reviewMaxLength: 1000,
        reviewMinLength: 10
    },
    
    init() {
        this.initReviewForms();
        this.initRatingDisplay();
        this.initReviewList();
        this.initReviewFilters();
        this.initReviewActions();
        this.loadUserReviews();
    },
    
    // Inicializar formularios de review
    initReviewForms() {
        const reviewForms = document.querySelectorAll('.review-form');
        
        reviewForms.forEach(form => {
            const productId = form.dataset.productId;
            const ratingInput = form.querySelector('.rating-input');
            const stars = form.querySelectorAll('.rating-star');
            const textArea = form.querySelector('.review-text');
            const submitBtn = form.querySelector('.submit-review');
            
            // Sistema de estrellas interactivo
            stars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    this.highlightStars(stars, index + 1);
                });
                
                star.addEventListener('mouseleave', () => {
                    const currentRating = parseInt(ratingInput.value) || 0;
                    this.highlightStars(stars, currentRating);
                });
                
                star.addEventListener('click', () => {
                    ratingInput.value = index + 1;
                    this.highlightStars(stars, index + 1);
                    this.addStarAnimation(star);
                });
            });
            
            // Validación de texto
            textArea.addEventListener('input', () => {
                const length = textArea.value.length;
                const charCount = form.querySelector('.char-count');
                if (charCount) {
                    charCount.textContent = `${length}/${this.config.reviewMaxLength}`;
                    charCount.classList.toggle('error', length > this.config.reviewMaxLength);
                }
                
                submitBtn.disabled = length < this.config.reviewMinLength || length > this.config.reviewMaxLength;
            });
            
            // Submit del formulario
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview(form, productId);
            });
        });
    },
    
    // Resaltar estrellas
    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.classList.remove('inactive');
            } else {
                star.classList.remove('active');
                star.classList.add('inactive');
            }
        });
    },
    
    // Animación de estrella
    addStarAnimation(star) {
        star.classList.add('pop');
        setTimeout(() => star.classList.remove('pop'), 300);
    },
    
    // Enviar review
    async submitReview(form, productId) {
        const rating = parseInt(form.querySelector('.rating-input').value);
        const comentario = form.querySelector('.review-text').value;
        
        // Validaciones
        if (!rating || rating < this.config.minRating || rating > this.config.maxRating) {
            if (window.EcoToast) {
                EcoToast.show('Rating requerido', 'Por favor selecciona una calificación', 'warning');
            }
            return;
        }
        
        if (comentario.length < this.config.reviewMinLength) {
            if (window.EcoToast) {
                EcoToast.show('Review muy corta', `Mínimo ${this.config.reviewMinLength} caracteres`, 'warning');
            }
            return;
        }
        
        if (comentario.length > this.config.reviewMaxLength) {
            if (window.EcoToast) {
                EcoToast.show('Review muy larga', `Máximo ${this.config.reviewMaxLength} caracteres`, 'warning');
            }
            return;
        }
        
        this.state.loading = true;
        this.updateFormUI(form, true);
        
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    producto_id: productId,
                    rating: rating,
                    comentario: comentario
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (window.EcoToast) {
                    EcoToast.show('¡Review enviada!', 'Gracias por tu opinión', 'success');
                }
                
                // Limpiar formulario
                form.reset();
                this.highlightStars(form.querySelectorAll('.rating-star'), 0);
                
                // Actualizar reviews del producto
                this.loadProductReviews(productId);
                
                // Guardar review del usuario
                this.state.userReviews[productId] = data.review;
                this.saveUserReviews();
                
            } else {
                throw new Error(data.message || 'Error al enviar review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            if (window.EcoToast) {
                EcoToast.show('Error', error.message, 'error');
            }
        } finally {
            this.state.loading = false;
            this.updateFormUI(form, false);
        }
    },
    
    // Actualizar UI del formulario
    updateFormUI(form, loading) {
        const submitBtn = form.querySelector('.submit-review');
        const ratingStars = form.querySelectorAll('.rating-star');
        
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.innerHTML = loading ? 
                '<i class="bi bi-hourglass-split"></i> Enviando...' : 
                '<i class="bi bi-send"></i> Enviar Review';
        }
        
        ratingStars.forEach(star => {
            star.style.pointerEvents = loading ? 'none' : 'auto';
        });
    },
    
    // Inicializar display de ratings
    initRatingDisplay() {
        const ratingDisplays = document.querySelectorAll('.rating-display');
        
        ratingDisplays.forEach(display => {
            const productId = display.dataset.productId;
            this.loadAverageRating(productId, display);
        });
    },
    
    // Cargar rating promedio
    async loadAverageRating(productId, display) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/promedio/${productId}`);
            const data = await response.json();
            
            if (data.success) {
                this.state.averageRatings[productId] = data.rating;
                this.renderRatingDisplay(display, data.rating);
            }
        } catch (error) {
            console.error('Error loading average rating:', error);
        }
    },
    
    // Renderizar display de rating
    renderRatingDisplay(display, rating) {
        const starsContainer = display.querySelector('.stars-container');
        const numericRating = display.querySelector('.numeric-rating');
        const reviewCount = display.querySelector('.review-count');
        
        if (starsContainer) {
            starsContainer.innerHTML = this.generateStarsHTML(rating.average);
        }
        
        if (numericRating) {
            numericRating.textContent = rating.average.toFixed(1);
        }
        
        if (reviewCount) {
            reviewCount.textContent = `(${rating.total} reviews)`;
        }
    },
    
    // Generar HTML de estrellas
    generateStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                html += '<i class="bi bi-star-fill active"></i>';
            } else if (i - 0.5 <= rating) {
                html += '<i class="bi bi-star-half active"></i>';
            } else {
                html += '<i class="bi bi-star inactive"></i>';
            }
        }
        return html;
    },
    
    // Inicializar lista de reviews
    initReviewList() {
        const reviewLists = document.querySelectorAll('.reviews-list');
        
        reviewLists.forEach(list => {
            const productId = list.dataset.productId;
            this.loadProductReviews(productId, list);
        });
    },
    
    // Cargar reviews de producto
    async loadProductReviews(productId, container) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/producto/${productId}`);
            const data = await response.json();
            
            if (data.success) {
                this.state.productReviews[productId] = data.reviews;
                this.renderReviewsList(container || document.querySelector(`.reviews-list[data-product-id="${productId}"]`), data.reviews);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    },
    
    // Renderizar lista de reviews
    renderReviewsList(container, reviews) {
        if (!container) return;
        
        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews">
                    <i class="bi bi-chat-square-text" style="font-size: 2rem; color: var(--texto-sec);"></i>
                    <p>Aún no hay reviews. ¡Sé el primero!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="reviews-container">
                ${reviews.map(review => `
                    <div class="review-item" data-review-id="${review.id}">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">
                                    ${review.avatar ? 
                                        `<img src="${review.avatar}" alt="${review.nombre}">` : 
                                        `<span>${review.nombre.charAt(0).toUpperCase()}</span>`
                                    }
                                </div>
                                <div class="reviewer-details">
                                    <h4 class="reviewer-name">${review.nombre}</h4>
                                    <span class="review-date">${this.formatDate(review.created_at)}</span>
                                </div>
                            </div>
                            <div class="review-rating">
                                ${this.generateStarsHTML(review.rating)}
                            </div>
                        </div>
                        <p class="review-text">${this.escapeHtml(review.comentario)}</p>
                        <div class="review-actions">
                            <button class="review-action helpful" data-review-id="${review.id}">
                                <i class="bi bi-hand-thumbs-up"></i>
                                <span>Útil</span>
                                <span class="helpful-count">${review.helpful_count || 0}</span>
                            </button>
                            <button class="review-action report" data-review-id="${review.id}">
                                <i class="bi bi-flag"></i>
                                <span>Reportar</span>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Event listeners para acciones
        container.querySelectorAll('.review-action.helpful').forEach(btn => {
            btn.addEventListener('click', () => this.markHelpful(btn.dataset.reviewId));
        });
        
        container.querySelectorAll('.review-action.report').forEach(btn => {
            btn.addEventListener('click', () => this.reportReview(btn.dataset.reviewId));
        });
    },
    
    // Marcar review como útil
    async markHelpful(reviewId) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/${reviewId}/helpful`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (window.EcoToast) {
                    EcoToast.show('¡Gracias!', 'Tu voto ha sido registrado', 'success');
                }
                
                // Actualizar contador
                const btn = document.querySelector(`.review-action.helpful[data-review-id="${reviewId}"]`);
                if (btn) {
                    const countSpan = btn.querySelector('.helpful-count');
                    countSpan.textContent = data.helpful_count;
                    btn.classList.add('voted');
                }
            }
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    },
    
    // Reportar review
    async reportReview(reviewId) {
        if (window.EcoToast) {
            EcoToast.show('Reporte enviado', 'Gracias por ayudar a mantener la comunidad segura', 'info');
        }
        
        // Enviar reporte al servidor
        try {
            await fetch(`${this.config.apiEndpoint}/${reviewId}/report`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error reporting review:', error);
        }
    },
    
    // Inicializar filtros de reviews
    initReviewFilters() {
        const filterButtons = document.querySelectorAll('.review-filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterReviews(filter);
                
                // Actualizar estado activo
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },
    
    // Filtrar reviews
    filterReviews(filter) {
        const reviews = document.querySelectorAll('.review-item');
        
        reviews.forEach(review => {
            const rating = parseInt(review.querySelector('.review-rating').dataset.rating) || 0;
            
            switch (filter) {
                case 'all':
                    review.style.display = 'block';
                    break;
                case 'positive':
                    review.style.display = rating >= 4 ? 'block' : 'none';
                    break;
                case 'neutral':
                    review.style.display = rating === 3 ? 'block' : 'none';
                    break;
                case 'negative':
                    review.style.display = rating <= 2 ? 'block' : 'none';
                    break;
                case 'recent':
                    // Ordenar por fecha (implementación simplificada)
                    review.style.display = 'block';
                    break;
            }
        });
    },
    
    // Inicializar acciones adicionales
    initReviewActions() {
        // Editar review
        document.querySelectorAll('.edit-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = btn.dataset.reviewId;
                this.editReview(reviewId);
            });
        });
        
        // Eliminar review
        document.querySelectorAll('.delete-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = btn.dataset.reviewId;
                this.deleteReview(reviewId);
            });
        });
    },
    
    // Editar review
    async editReview(reviewId) {
        // Implementación para editar review existente
        if (window.EcoToast) {
            EcoToast.show('Próximamente', 'La edición de reviews estará disponible pronto', 'info');
        }
    },
    
    // Eliminar review
    async deleteReview(reviewId) {
        if (!confirm('¿Estás seguro de eliminar esta review?')) return;
        
        try {
            const response = await fetch(`${this.config.apiEndpoint}/${reviewId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (window.EcoToast) {
                    EcoToast.show('Review eliminada', 'Tu review ha sido eliminada', 'success');
                }
                
                // Remover review del DOM
                const reviewElement = document.querySelector(`.review-item[data-review-id="${reviewId}"]`);
                if (reviewElement) {
                    reviewElement.remove();
                }
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            if (window.EcoToast) {
                EcoToast.show('Error', 'No se pudo eliminar la review', 'error');
            }
        }
    },
    
    // Cargar reviews del usuario
    loadUserReviews() {
        try {
            const saved = localStorage.getItem('ecomarket_user_reviews');
            if (saved) {
                this.state.userReviews = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading user reviews:', error);
        }
    },
    
    // Guardar reviews del usuario
    saveUserReviews() {
        try {
            localStorage.setItem('ecomarket_user_reviews', JSON.stringify(this.state.userReviews));
        } catch (error) {
            console.error('Error saving user reviews:', error);
        }
    },
    
    // Verificar si usuario ya reseñó producto
    hasUserReviewed(productId) {
        return productId in this.state.userReviews;
    },
    
    // Obtener review del usuario para un producto
    getUserReview(productId) {
        return this.state.userReviews[productId] || null;
    },
    
    // Utilidades
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) return 'Hoy';
        if (diff < 172800000) return 'Ayer';
        if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} días`;
        
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoReviews.init());
} else {
    EcoReviews.init();
}

// Exponer globalmente
window.EcoReviews = EcoReviews;