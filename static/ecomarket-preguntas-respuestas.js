/*
   EcoMarket - Sistema de Preguntas y Respuestas
   Q&A para productos con respuestas del vendedor
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaPreguntasRespuestas {
    constructor() {
        this.productoId = null;
        this.preguntas = [];
        this.init();
    }

    init() {
        this.obtenerProductoId();
        this.cargarPreguntas();
        this.inicializarEventListeners();
    }

    obtenerProductoId() {
        const elemento = document.querySelector('[data-producto-id]');
        if (elemento) {
            this.productoId = elemento.dataset.productoId;
        }
    }

    inicializarEventListeners() {
        // Formulario de nueva pregunta
        const formPregunta = document.getElementById('form-nueva-pregunta');
        if (formPregunta) {
            formPregunta.addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarPregunta();
            });
        }

        // Botón de helpful
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-helpful')) {
                const preguntaId = e.target.dataset.preguntaId;
                this.marcarHelpful(preguntaId);
            }
        });

        // Formulario de respuesta (solo vendedor)
        const formRespuesta = document.getElementById('form-respuesta');
        if (formRespuesta) {
            formRespuesta.addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarRespuesta();
            });
        }

        // Botón ver más preguntas
        const btnVerMas = document.getElementById('btn-ver-mas-preguntas');
        if (btnVerMas) {
            btnVerMas.addEventListener('click', () => {
                this.cargarMasPreguntas();
            });
        }
    }

    async cargarPreguntas() {
        if (!this.productoId) return;

        try {
            const response = await fetch(`/api/productos/${this.productoId}/preguntas`);
            if (response.ok) {
                const data = await response.json();
                this.preguntas = data.preguntas;
                this.renderizarPreguntas();
            }
        } catch (error) {
            console.error('Error cargando preguntas:', error);
        }
    }

    async cargarMasPreguntas() {
        if (!this.productoId) return;

        try {
            const response = await fetch(`/api/productos/${this.productoId}/preguntas?offset=${this.preguntas.length}`);
            if (response.ok) {
                const data = await response.json();
                this.preguntas = [...this.preguntas, ...data.preguntas];
                this.renderizarPreguntas();
            }
        } catch (error) {
            console.error('Error cargando más preguntas:', error);
        }
    }

    async enviarPregunta() {
        const textarea = document.getElementById('texto-pregunta');
        const pregunta = textarea?.value.trim();

        if (!pregunta) {
            this.mostrarError('Por favor escribe tu pregunta');
            return;
        }

        if (pregunta.length < 10) {
            this.mostrarError('La pregunta debe tener al menos 10 caracteres');
            return;
        }

        if (pregunta.length > 500) {
            this.mostrarError('La pregunta no puede exceder 500 caracteres');
            return;
        }

        try {
            const response = await fetch(`/api/productos/${this.productoId}/preguntas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pregunta })
            });

            if (response.ok) {
                const data = await response.json();
                this.preguntas.unshift(data.pregunta);
                this.renderizarPreguntas();
                textarea.value = '';
                this.mostrarExito('Pregunta enviada. Te notificaremos cuando recibas respuesta.');
            } else {
                this.mostrarError('Error al enviar la pregunta');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async enviarRespuesta() {
        const textarea = document.getElementById('texto-respuesta');
        const preguntaId = document.getElementById('pregunta-id-responder')?.value;
        const respuesta = textarea?.value.trim();

        if (!respuesta) {
            this.mostrarError('Por favor escribe tu respuesta');
            return;
        }

        try {
            const response = await fetch(`/api/preguntas/${preguntaId}/responder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ respuesta })
            });

            if (response.ok) {
                const data = await response.json();
                // Actualizar pregunta en la lista
                const indice = this.preguntas.findIndex(p => p.id === parseInt(preguntaId));
                if (indice !== -1) {
                    this.preguntas[indice].respuesta = data.respuesta;
                    this.preguntas[indice].fechaRespuesta = new Date().toISOString();
                }
                this.renderizarPreguntas();
                textarea.value = '';
                this.cerrarModalRespuesta();
                this.mostrarExito('Respuesta enviada');
            } else {
                this.mostrarError('Error al enviar la respuesta');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async marcarHelpful(preguntaId) {
        try {
            const response = await fetch(`/api/preguntas/${preguntaId}/helpful`, {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                // Actualizar contador
                const pregunta = this.preguntas.find(p => p.id === parseInt(preguntaId));
                if (pregunta) {
                    pregunta.helpful = data.helpful;
                    this.renderizarPreguntas();
                }
            }
        } catch (error) {
            console.error('Error marcando helpful:', error);
        }
    }

    renderizarPreguntas() {
        const contenedor = document.getElementById('contenedor-preguntas');
        if (!contenedor) return;

        if (this.preguntas.length === 0) {
            contenedor.innerHTML = `
                <div class="sin-preguntas">
                    <i class="bi bi-chat-dots"></i>
                    <p>No hay preguntas aún. ¡Sé el primero en preguntar!</p>
                </div>
            `;
            return;
        }

        let html = '<div class="lista-preguntas">';
        
        this.preguntas.forEach(p => {
            const fechaPregunta = this.formatearFecha(p.fechaPregunta);
            const fechaRespuesta = p.fechaRespuesta ? this.formatearFecha(p.fechaRespuesta) : null;
            const esVendedor = p.esVendedor || false;

            html += `
                <div class="item-pregunta">
                    <div class="encabezado-pregunta">
                        <div class="autor-pregunta">
                            <img src="${p.usuario.avatar || '/static/assets/avatar-default.png'}" alt="${p.usuario.nombre}" class="avatar-autor">
                            <div>
                                <div class="nombre-autor">${p.usuario.nombre}</div>
                                <div class="fecha-pregunta">${fechaPregunta}</div>
                            </div>
                        </div>
                        ${esVendedor ? '<span class="badge-vendedor">Vendedor</span>' : ''}
                    </div>
                    
                    <div class="texto-pregunta">${p.pregunta}</div>
                    
                    <div class="acciones-pregunta">
                        <button class="btn-helpful" data-pregunta-id="${p.id}">
                            <i class="bi bi-hand-thumbs-up"></i>
                            <span>Útil (${p.helpful || 0})</span>
                        </button>
                        ${this.puedeResponder(p) ? `
                            <button class="btn-responder" data-pregunta-id="${p.id}">
                                <i class="bi bi-reply"></i>
                                Responder
                            </button>
                        ` : ''}
                    </div>
                    
                    ${p.respuesta ? `
                        <div class="respuesta-vendedor">
                            <div class="encabezado-respuesta">
                                <div class="autor-respuesta">
                                    <img src="${p.vendedor.avatar || '/static/assets/avatar-default.png'}" alt="${p.vendedor.nombre}" class="avatar-autor">
                                    <div>
                                        <div class="nombre-autor">${p.vendedor.nombre} <span class="badge-vendedor">Vendedor</span></div>
                                        <div class="fecha-respuesta">${fechaRespuesta}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="texto-respuesta">${p.respuesta}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;

        // Agregar event listeners a botones de responder
        document.querySelectorAll('.btn-responder').forEach(btn => {
            btn.addEventListener('click', () => {
                const preguntaId = btn.dataset.preguntaId;
                this.abrirModalRespuesta(preguntaId);
            });
        });
    }

    puedeResponder(pregunta) {
        // Verificar si el usuario es el vendedor
        const esVendedor = document.body.dataset.rol === 'vendedor';
        return esVendedor && !pregunta.respuesta;
    }

    abrirModalRespuesta(preguntaId) {
        const modal = document.getElementById('modal-responder-pregunta');
        if (modal) {
            document.getElementById('pregunta-id-responder').value = preguntaId;
            modal.style.display = 'flex';
        }
    }

    cerrarModalRespuesta() {
        const modal = document.getElementById('modal-responder-pregunta');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    formatearFecha(fechaIso) {
        const fecha = new Date(fechaIso);
        const ahora = new Date();
        const diferencia = ahora - fecha;
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

        if (dias === 0) return 'Hoy';
        if (dias === 1) return 'Ayer';
        if (dias < 7) return `Hace ${dias} días`;
        if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
        return fecha.toLocaleDateString('es-ES');
    }

    mostrarExito(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-exito';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    mostrarError(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-error';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sistema-preguntas')) {
        window.sistemaPreguntas = new SistemaPreguntasRespuestas();
    }
});