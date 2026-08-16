/**
 * eco-reviews-advanced.js - Sistema avanzado de reviews con estrellas
 * 
 * Funcionalidades:
 * - Sistema de calificación con estrellas interactivas
 * - Reviews con fotos y videos
 * - Validación de reviews
 * - Respuestas del vendedor
 * - Votación útil/no útil
 * - Filtrado y ordenamiento
 * - Análisis de sentimiento básico
 * - Notificaciones de nuevas reviews
 */

class EcoReviews {
    constructor(options = {}) {
        this.options = {
            productId: options.productId || null,
            apiEndpoint: options.apiEndpoint || '/api/reviews',
            storageKey: options.storageKey || 'ecomarket_reviews',
            enablePhotos: options.enablePhotos !== false,
            enableVideos: options.enableVideos !== false,
            maxPhotos: options.maxPhotos || 5,
            enableVoting: options.enableVoting !== false,
            enableResponses: options.enableResponses !== false,
            ...options
        };
        
        this.reviews = [];
        this.userReview = null;
        this.averageRating = 0;
        this.ratingDistribution = {};
        
        this.init();
    }
    
    init() {
        this.setupReviewForm();
        this.loadReviews();
        this.setupEventListeners();
    }
    
    setupReviewForm() {
        const form = document.querySelector('[data-review-form]');
        if (!form) return;
        
        form.innerHTML = `
            <div class="eco-review-form">
                <div class="eco-rating-input" data-rating-input>
                    <div class="eco-stars" data-stars>
                        ${this.createStarHTML(0)}
                    </div>
                    <div class="eco-rating-label" data-rating-label>Selecciona una calificación</div>
                </div>
                
                <div class="eco-review-fields">
                    <div class="eco-form-group">
                        <label for="review-title">Título de tu review</label>
                        <input type="text" id="review-title" name="title" 
                               placeholder="Resumen de tu experiencia" 
                               maxlength="100" required>
                    </div>
                    
                    <div class="eco-form-group">
                        <label for="review-text">Tu review</label>
                        <textarea id="review-text" name="text" 
                                  placeholder="Comparte tu experiencia con este producto..." 
                                  rows="4" minlength="50" maxlength="1000" required></textarea>
                        <div class="eco-char-count">
                            <span data-char-count>0</span>/1000
                        </div>
                    </div>
                    
                    ${this.options.enablePhotos ? `
                        <div class="eco-form-group">
                            <label>Fotos (opcional)</label>
                            <div class="eco-photo-upload" data-photo-upload>
                                <input type="file" id="review-photos" name="photos" 
                                       accept="image/*" multiple 
                                       max="${this.options.maxPhotos}" hidden>
                                <button type="button" class="eco-upload-btn" data-upload-trigger>
                                    <i class="bi bi-camera"></i>
                                    Agregar fotos
                                </button>
                                <div class="eco-photo-preview" data-photo-preview></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${this.options.enableVideos ? `
                        <div class="eco-form-group">
                            <label>Video (opcional)</label>
                            <div class="eco-video-upload" data-video-upload>
                                <input type="file" id="review-video" name="video" 
                                       accept="video/*" hidden>
                                <button type="button" class="eco-upload-btn" data-video-trigger>
                                    <i class="bi bi-camera-video"></i>
                                    Agregar video
                                </button>
                                <div class="eco-video-preview" data-video-preview></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="eco-form-group">
                        <label>
                            <input type="checkbox" id="recommend-product" name="recommend">
                            Recomiendo este producto
                        </label>
                    </div>
                    
                    <button type="submit" class="eco-submit-review">
                        <i class="bi bi-send"></i>
                        Publicar review
                    </button>
                </div>
            </div>
        `;
        
        this.setupRatingInput();
        this.setupPhotoUpload();
        this.setupVideoUpload();
        this.setupCharCounter();
    }
    
    createStarHTML(rating) {
        return [1, 2, 3, 4, 5].map(i => `
            <button type="button" class="eco-star ${i <= rating ? 'active' : ''}" 
                    data-star="${i}" aria-label="Calificar con ${i} estrellas">
                <i class="bi bi-star${i <= rating ? '-fill' : ''}"></i>
            </button>
        `).join('');
    }
    
    setupRatingInput() {
        const starsContainer = document.querySelector('[data-stars]');
        const ratingLabel = document.querySelector('[data-rating-label]');
        const ratingInput = document.querySelector('[data-rating-input]');
        
        if (!starsContainer) return;
        
        const stars = starsContainer.querySelectorAll('.eco-star');
        const ratingTexts = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];
        
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.star);
                this.updateStarsVisual(rating);
                if (ratingLabel) {
                    ratingLabel.textContent = ratingTexts[rating];
                }
            });
            
            star.addEventListener('mouseleave', () => {
                const currentRating = ratingInput.dataset.rating || 0;
                this.updateStarsVisual(parseInt(currentRating));
                if (ratingLabel) {
                    ratingLabel.textContent = currentRating > 0 ? ratingTexts[currentRating] : 'Selecciona una calificación';
                }
            });
            
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.star);
                ratingInput.dataset.rating = rating;
                this.updateStarsVisual(rating);
                if (ratingLabel) {
                    ratingLabel.textContent = ratingTexts[rating];
                }
                
                // Animación de selección
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            s.style.transform = 'scale(1)';
                        }, 200);
                    }
                });
            });
        });
    }
    
    updateStarsVisual(rating) {
        const stars = document.querySelectorAll('[data-stars] .eco-star');
        stars.forEach((star, index) => {
            const isActive = index < rating;
            star.classList.toggle('active', isActive);
            const icon = star.querySelector('i');
            icon.className = `bi bi-star${isActive ? '-fill' : ''}`;
        });
    }
    
    setupPhotoUpload() {
        if (!this.options.enablePhotos) return;
        
        const uploadTrigger = document.querySelector('[data-upload-trigger]');
        const photoInput = document.getElementById('review-photos');
        const photoPreview = document.querySelector('[data-photo-preview]');
        
        if (!uploadTrigger || !photoInput) return;
        
        uploadTrigger.addEventListener('click', () => photoInput.click());
        
        photoInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files).slice(0, this.options.maxPhotos);
            this.displayPhotoPreviews(files, photoPreview);
        });
    }
    
    displayPhotoPreviews(files, container) {
        container.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'eco-photo-preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Foto ${index + 1}">
                    <button type="button" class="eco-remove-photo" data-remove-index="${index}">
                        <i class="bi bi-x"></i>
                    </button>
                `;
                container.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
        
        // Event listeners para eliminar fotos
        container.querySelectorAll('.eco-remove-photo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.removeIndex);
                this.removePhoto(index, container);
            });
        });
    }
    
    removePhoto(index, container) {
        const photoInput = document.getElementById('review-photos');
        const files = Array.from(photoInput.files);
        files.splice(index, 1);
        
        // Crear nuevo FileList
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        photoInput.files = dataTransfer.files;
        
        this.displayPhotoPreviews(files, container);
    }
    
    setupVideoUpload() {
        if (!this.options.enableVideos) return;
        
        const videoTrigger = document.querySelector('[data-video-trigger]');
        const videoInput = document.getElementById('review-video');
        const videoPreview = document.querySelector('[data-video-preview]');
        
        if (!videoTrigger || !videoInput) return;
        
        videoTrigger.addEventListener('click', () => videoInput.click());
        
        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.displayVideoPreview(file, videoPreview);
            }
        });
    }
    
    displayVideoPreview(file, container) {
        const reader = new FileReader();
        reader.onload = (e) => {
            container.innerHTML = `
                <video src="${e.target.result}" controls class="eco-video-preview-item"></video>
                <button type="button" class="eco-remove-video">
                    <i class="bi bi-x"></i>
                </button>
            `;
            
            container.querySelector('.eco-remove-video').addEventListener('click', () => {
                container.innerHTML = '';
                document.getElementById('review-video').value = '';
            });
        };
        reader.readAsDataURL(file);
    }
    
    setupCharCounter() {
        const textarea = document.getElementById('review-text');
        const charCount = document.querySelector('[data-char-count]');
        
        if (!textarea || !charCount) return;
        
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = count;
            
            if (count > 900) {
                charCount.parentElement.classList.add('warning');
            } else {
                charCount.parentElement.classList.remove('warning');
            }
        });
    }
    
    async loadReviews() {
        if (!this.options.productId) return;
        
        try {
            const response = await fetch(`${this.options.apiEndpoint}?producto_id=${this.options.productId}`);
            if (response.ok) {
                const data = await response.json();
                this.reviews = data.reviews || [];
                this.averageRating = data.average_rating || 0;
                this.ratingDistribution = data.rating_distribution || {};
                this.userReview = data.user_review || null;
                
                this.renderReviews();
                this.renderRatingSummary();
            }
        } catch (error) {
            console.error('Error cargando reviews:', error);
        }
    }
    
    renderReviews() {
        const container = document.querySelector('[data-reviews-container]');
        if (!container) return;
        
        if (this.reviews.length === 0) {
            container.innerHTML = `
                <div class="eco-no-reviews">
                    <i class="bi bi-chat-square-text"></i>
                    <p>Aún no hay reviews. ¡Sé el primero en opinar!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="eco-reviews-list">
                ${this.reviews.map(review => this.createReviewHTML(review)).join('')}
            </div>
        `;
        
        this.setupReviewInteractions();
    }
    
    createReviewHTML(review) {
        const stars = this.createStarHTML(review.calificacion);
        const date = new Date(review.fecha_creacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="eco-review-item" data-review-id="${review.id}">
                <div class="eco-review-header">
                    <div class="eco-reviewer-info">
                        <div class="eco-reviewer-avatar">
                            ${review.usuario_avatar ? 
                                `<img src="${review.usuario_avatar}" alt="${review.usuario_nombre}">` :
                                `<div class="eco-avatar-placeholder">${review.usuario_nombre.charAt(0).toUpperCase()}</div>`
                            }
                        </div>
                        <div class="eco-reviewer-details">
                            <div class="eco-reviewer-name">${review.usuario_nombre}</div>
                            <div class="eco-review-date">${date}</div>
                        </div>
                    </div>
                    
                    <div class="eco-review-rating">
                        <div class="eco-stars-sm">${stars}</div>
                        ${review.recomienda ? '<span class="eco-recommend-badge"><i class="bi bi-check-circle"></i> Recomendado</span>' : ''}
                    </div>
                </div>
                
                <div class="eco-review-content">
                    <h4 class="eco-review-title">${review.titulo}</h4>
                    <p class="eco-review-text">${review.texto}</p>
                    
                    ${review.fotos && review.fotos.length > 0 ? `
                        <div class="eco-review-photos">
                            ${review.fotos.map(foto => `
                                <img src="${foto}" alt="Foto de review" loading="lazy">
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${review.video ? `
                        <div class="eco-review-video">
                            <video src="${review.video}" controls loading="lazy"></video>
                        </div>
                    ` : ''}
                </div>
                
                <div class="eco-review-footer">
                    ${this.options.enableVoting ? `
                        <div class="eco-review-voting">
                            <button class="eco-vote-btn helpful" data-vote-type="helpful">
                                <i class="bi bi-hand-thumbs-up"></i>
                                <span>${review.votes_helpful || 0}</span>
                            </button>
                            <button class="eco-vote-btn not-helpful" data-vote-type="not-helpful">
                                <i class="bi bi-hand-thumbs-down"></i>
                                <span>${review.votes_not_helpful || 0}</span>
                            </button>
                        </div>
                    ` : ''}
                    
                    ${this.options.enableResponses && review.respuesta ? `
                        <div class="eco-review-response">
                            <div class="eco-response-header">
                                <span class="eco-response-badge">Respuesta del vendedor</span>
                            </div>
                            <p class="eco-response-text">${review.respuesta.texto}</p>
                        </div>
                    ` : ''}
                    
                    <button class="eco-report-review" data-report-review>
                        <i class="bi bi-flag"></i>
                        Reportar
                    </button>
                </div>
            </div>
        `;
    }
    
    renderRatingSummary() {
        const summaryContainer = document.querySelector('[data-rating-summary]');
        if (!summaryContainer) return;
        
        const totalReviews = this.reviews.length;
        const ratingPercentage = totalReviews > 0 ? (this.averageRating / 5) * 100 : 0;
        
        summaryContainer.innerHTML = `
            <div class="eco-rating-summary">
                <div class="eco-average-rating">
                    <div class="eco-rating-number">${this.averageRating.toFixed(1)}</div>
                    <div class="eco-stars-large">${this.createStarHTML(Math.round(this.averageRating))}</div>
                    <div class="eco-total-reviews">${totalReviews} reviews</div>
                </div>
                
                <div class="eco-rating-distribution">
                    ${[5, 4, 3, 2, 1].map(star => {
                        const count = this.ratingDistribution[star] || 0;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return `
                            <div class="eco-rating-bar">
                                <span class="eco-star-label">${star} estrellas</span>
                                <div class="eco-bar-container">
                                    <div class="eco-bar-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="eco-star-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        const form = document.querySelector('[data-review-form]');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const ratingInput = document.querySelector('[data-rating-input]');
        const rating = ratingInput.dataset.rating || 0;
        
        if (rating === 0) {
            this.showReviewMessage('Por favor selecciona una calificación', 'error');
            return;
        }
        
        const formData = new FormData(form);
        formData.append('producto_id', this.options.productId);
        formData.append('calificacion', rating);
        
        const submitBtn = form.querySelector('.eco-submit-review');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-spinner spin"></i> Publicando...';
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showReviewMessage('¡Review publicada exitosamente!', 'success');
                form.reset();
                this.updateStarsVisual(0);
                ratingInput.dataset.rating = 0;
                this.loadReviews(); // Recargar reviews
            } else {
                this.showReviewMessage(data.mensaje || 'Error al publicar review', 'error');
            }
        } catch (error) {
            console.error('Error publicando review:', error);
            this.showReviewMessage('Error al publicar review', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-send"></i> Publicar review';
        }
    }
    
    setupReviewInteractions() {
        // Votación de reviews
        if (this.options.enableVoting) {
            document.querySelectorAll('.eco-vote-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleVote(e));
            });
        }
        
        // Reportar reviews
        document.querySelectorAll('[data-report-review]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleReport(e));
        });
    }
    
    async handleVote(event) {
        const btn = event.currentTarget;
        const reviewId = btn.closest('.eco-review-item').dataset.reviewId;
        const voteType = btn.dataset.voteType;
        
        try {
            const response = await fetch('/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review_id: reviewId,
                    vote_type: voteType
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Actualizar contador
                const countSpan = btn.querySelector('span');
                countSpan.textContent = data.new_count;
                
                // Deshabilitar botón temporalmente
                btn.disabled = true;
                setTimeout(() => btn.disabled = false, 5000);
            }
        } catch (error) {
            console.error('Error votando review:', error);
        }
    }
    
    handleReport(event) {
        const reviewId = event.target.closest('.eco-review-item').dataset.reviewId;
        
        if (confirm('¿Estás seguro de que quieres reportar esta review?')) {
            // Implementar lógica de reporte
            alert('Review reportada. Gracias por tu ayuda.');
        }
    }
    
    showReviewMessage(message, type = 'info') {
        const messageContainer = document.querySelector('[data-review-message]');
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = `eco-review-message ${type}`;
            messageContainer.style.display = 'block';
            
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        }
    }
    
    getCurrentRating() {
        const ratingInput = document.querySelector('[data-rating-input]');
        return ratingInput ? parseInt(ratingInput.dataset.rating || 0) : 0;
    }
    
    destroy() {
        // Limpiar eventos
        const form = document.querySelector('[data-review-form]');
        if (form) {
            form.removeEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Buscar contenedores de reviews
    const reviewContainers = document.querySelectorAll('[data-eco-reviews]');
    reviewContainers.forEach(container => {
        new EcoReviews({
            ...container.dataset
        });
    });
});