/**
 * EcoMarket - Sistema de Comentarios
 * Sistema de comentarios para productos y reseñas
 */

const EcoComments = {
    comments: {},
    currentUser: null,

    init() {
        try {
            this.loadCurrentUser();
            this.loadComments();
            this.setupEventListeners();
            this.renderComments();
        } catch (error) {
            console.error('Error inicializando sistema de comentarios:', error);
        }
    },

    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('ecomarket-user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
        }
    },

    loadComments() {
        try {
            const saved = localStorage.getItem('ecomarket-comments');
            if (saved) {
                this.comments = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando comentarios:', error);
            this.comments = {};
        }
    },

    saveComments() {
        try {
            localStorage.setItem('ecomarket-comments', JSON.stringify(this.comments));
        } catch (error) {
            console.error('Error guardando comentarios:', error);
        }
    },

    getComments(productId) {
        return this.comments[productId] || [];
    },

    addComment(productId, commentData) {
        if (!this.currentUser) {
            if (window.EcoToast) {
                EcoToast.show('Inicia sesión', 'Debes iniciar sesión para comentar', 'warning');
            }
            return false;
        }

        const comment = {
            id: Date.now(),
            productId: productId,
            userId: this.currentUser.id,
            userName: this.currentUser.nombre,
            avatar: this.currentUser.avatar,
            avatarColor: this.currentUser.avatarColor,
            content: commentData.content,
            rating: commentData.rating || 0,
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        if (!this.comments[productId]) {
            this.comments[productId] = [];
        }

        this.comments[productId].push(comment);
        this.saveComments();
        this.renderComments(productId);

        if (window.EcoToast) {
            EcoToast.show('Comentario agregado', 'Tu comentario ha sido publicado', 'success');
        }

        return comment;
    },

    likeComment(productId, commentId) {
        if (!this.currentUser) {
            if (window.EcoToast) {
                EcoToast.show('Inicia sesión', 'Debes iniciar sesión para dar like', 'warning');
            }
            return false;
        }

        const comments = this.getComments(productId);
        const comment = comments.find(c => c.id === commentId);

        if (comment) {
            comment.likes++;
            this.saveComments();
            this.renderComments(productId);
            return true;
        }

        return false;
    },

    deleteComment(productId, commentId) {
        if (!this.currentUser) return false;

        const comments = this.getComments(productId);
        const commentIndex = comments.findIndex(c => c.id === commentId && c.userId === this.currentUser.id);

        if (commentIndex !== -1) {
            comments.splice(commentIndex, 1);
            this.saveComments();
            this.renderComments(productId);

            if (window.EcoToast) {
                EcoToast.show('Comentario eliminado', 'Tu comentario ha sido eliminado', 'info');
            }
            return true;
        }

        return false;
    },

    replyToComment(productId, commentId, replyData) {
        if (!this.currentUser) {
            if (window.EcoToast) {
                EcoToast.show('Inicia sesión', 'Debes iniciar sesión para responder', 'warning');
            }
            return false;
        }

        const comments = this.getComments(productId);
        const comment = comments.find(c => c.id === commentId);

        if (comment) {
            const reply = {
                id: Date.now(),
                userId: this.currentUser.id,
                userName: this.currentUser.nombre,
                avatar: this.currentUser.avatar,
                avatarColor: this.currentUser.avatarColor,
                content: replyData.content,
                createdAt: new Date().toISOString(),
                likes: 0
            };

            comment.replies.push(reply);
            this.saveComments();
            this.renderComments(productId);

            if (window.EcoToast) {
                EcoToast.show('Respuesta agregada', 'Tu respuesta ha sido publicada', 'success');
            }
            return true;
        }

        return false;
    },

    renderComments(productId) {
        const container = document.getElementById('comments-container');
        if (!container) return;

        const comments = this.getComments(productId);

        if (comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <i class="bi bi-chat-square"></i>
                    <p>Aún no hay comentarios. ¡Sé el primero en comentar!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="comments-list">
                ${comments.map(comment => this.renderComment(comment, productId)).join('')}
            </div>
        `;
    },

    renderComment(comment, productId) {
        const timeAgo = this.getTimeAgo(comment.createdAt);
        const isOwner = this.currentUser && comment.userId === this.currentUser.id;

        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-avatar" style="background: ${comment.avatarColor}">
                    ${comment.avatar ? `<img src="${comment.avatar}" alt="${comment.userName}">` : comment.userName.charAt(0).toUpperCase()}
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-time">${timeAgo}</span>
                        ${comment.rating > 0 ? `<div class="comment-rating">${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}</div>` : ''}
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.content)}</div>
                    <div class="comment-actions">
                        <button class="comment-action like-btn" onclick="EcoComments.likeComment(${productId}, ${comment.id})">
                            <i class="bi bi-heart"></i> ${comment.likes}
                        </button>
                        <button class="comment-action reply-btn" onclick="EcoComments.showReplyForm(${productId}, ${comment.id})">
                            <i class="bi bi-reply"></i> Responder
                        </button>
                        ${isOwner ? `
                            <button class="comment-action delete-btn" onclick="EcoComments.deleteComment(${productId}, ${comment.id})">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        ` : ''}
                    </div>
                    ${comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            ${comment.replies.map(reply => this.renderReply(reply, comment.id, productId)).join('')}
                        </div>
                    ` : ''}
                    <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
                        <textarea placeholder="Escribe tu respuesta..." rows="2"></textarea>
                        <div class="reply-actions">
                            <button class="btn-cancel" onclick="EcoComments.hideReplyForm(${comment.id})">Cancelar</button>
                            <button class="btn-submit" onclick="EcoComments.submitReply(${productId}, ${comment.id})">Responder</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderReply(reply, commentId, productId) {
        const timeAgo = this.getTimeAgo(reply.createdAt);
        const isOwner = this.currentUser && reply.userId === this.currentUser.id;

        return `
            <div class="comment-reply" data-reply-id="${reply.id}">
                <div class="reply-avatar" style="background: ${reply.avatarColor}">
                    ${reply.avatar ? `<img src="${reply.avatar}" alt="${reply.userName}">` : reply.userName.charAt(0).toUpperCase()}
                </div>
                <div class="reply-content">
                    <div class="reply-header">
                        <span class="reply-author">${reply.userName}</span>
                        <span class="reply-time">${timeAgo}</span>
                    </div>
                    <div class="reply-text">${this.escapeHtml(reply.content)}</div>
                    <div class="reply-actions">
                        <button class="reply-action like-btn" onclick="EcoComments.likeReply(${productId}, ${commentId}, ${reply.id})">
                            <i class="bi bi-heart"></i> ${reply.likes}
                        </button>
                        ${isOwner ? `
                            <button class="reply-action delete-btn" onclick="EcoComments.deleteReply(${productId}, ${commentId}, ${reply.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    showReplyForm(productId, commentId) {
        const form = document.getElementById(`reply-form-${commentId}`);
        if (form) {
            form.style.display = 'block';
            form.querySelector('textarea').focus();
        }
    },

    hideReplyForm(commentId) {
        const form = document.getElementById(`reply-form-${commentId}`);
        if (form) {
            form.style.display = 'none';
            form.querySelector('textarea').value = '';
        }
    },

    submitReply(productId, commentId) {
        const form = document.getElementById(`reply-form-${commentId}`);
        const textarea = form.querySelector('textarea');
        const content = textarea.value.trim();

        if (!content) {
            if (window.EcoToast) {
                EcoToast.show('Campo vacío', 'Escribe una respuesta', 'warning');
            }
            return;
        }

        this.replyToComment(productId, commentId, { content });
        this.hideReplyForm(commentId);
    },

    likeReply(productId, commentId, replyId) {
        const comments = this.getComments(productId);
        const comment = comments.find(c => c.id === commentId);

        if (comment) {
            const reply = comment.replies.find(r => r.id === replyId);
            if (reply) {
                reply.likes++;
                this.saveComments();
                this.renderComments(productId);
            }
        }
    },

    deleteReply(productId, commentId, replyId) {
        if (!this.currentUser) return;

        const comments = this.getComments(productId);
        const comment = comments.find(c => c.id === commentId);

        if (comment) {
            const replyIndex = comment.replies.findIndex(r => r.id === replyId && r.userId === this.currentUser.id);
            if (replyIndex !== -1) {
                comment.replies.splice(replyIndex, 1);
                this.saveComments();
                this.renderComments(productId);

                if (window.EcoToast) {
                    EcoToast.show('Respuesta eliminada', 'Tu respuesta ha sido eliminada', 'info');
                }
            }
        }
    },

    setupEventListeners() {
        // Formulario de nuevo comentario
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productId = parseInt(commentForm.dataset.productId);
                const content = commentForm.querySelector('#comment-content').value.trim();
                const rating = parseInt(commentForm.querySelector('#comment-rating')?.value || 0);

                if (!content) {
                    if (window.EcoToast) {
                        EcoToast.show('Campo vacío', 'Escribe un comentario', 'warning');
                    }
                    return;
                }

                this.addComment(productId, { content, rating });
                commentForm.reset();
            });
        }
    },

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'ahora mismo';
        if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
        if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
        if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;
        return date.toLocaleDateString();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoComments.init());
} else {
    EcoComments.init();
}

// Exponer globalmente
window.EcoComments = EcoComments;