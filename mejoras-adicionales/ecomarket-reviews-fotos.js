/**
 * EcoMarket - Sistema de Reviews con Fotos
 * Permite subir fotos en las reseñas
 */

const ReviewsConFotos = {
    maxFotos: 5,
    fotosActuales: [],

    init: function() {
        this.inicializarUploader();
        this.inicializarFormulario();
    },

    inicializarUploader: function() {
        const input = document.getElementById('review-fotos-input');
        if (!input) return;

        input.addEventListener('change', (e) => {
            const archivos = Array.from(e.target.files);
            
            if (this.fotosActuales.length + archivos.length > this.maxFotos) {
                alert(`Máximo ${this.maxFotos} fotos permitidas`);
                return;
            }

            archivos.forEach(archivo => {
                if (archivo.type.startsWith('image/')) {
                    this.procesarFoto(archivo);
                }
            });
        });
    },

    procesarFoto: function(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.fotosActuales.push({
                archivo: archivo,
                dataUrl: e.target.result
            });
            this.renderizarPreviews();
        };
        reader.readAsDataURL(archivo);
    },

    renderizarPreviews: function() {
        const container = document.getElementById('review-fotos-preview');
        if (!container) return;

        container.innerHTML = this.fotosActuales.map((foto, index) => `
            <div class="foto-preview">
                <img src="${foto.dataUrl}" alt="Foto ${index + 1}">
                <button class="btn-eliminar-foto" data-index="${index}">×</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-eliminar-foto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.fotosActuales.splice(index, 1);
                this.renderizarPreviews();
            });
        });
    },

    inicializarFormulario: function() {
        const form = document.getElementById('review-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.enviarReview();
        });
    },

    enviarReview: function() {
        const calificacion = document.getElementById('review-calificacion').value;
        const comentario = document.getElementById('review-comentario').value;

        const review = {
            calificacion,
            comentario,
            fotos: this.fotosActuales.map(f => f.dataUrl),
            fecha: new Date().toISOString()
        };

        // Guardar en localStorage (simulación)
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));

        alert('Reseña enviada exitosamente');
        this.limpiarFormulario();
    },

    limpiarFormulario: function() {
        document.getElementById('review-form').reset();
        this.fotosActuales = [];
        this.renderizarPreviews();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReviewsConFotos.init());
} else {
    ReviewsConFotos.init();
}
