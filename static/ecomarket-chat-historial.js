/**
 * EcoMarket - Sistema de Chat con Historial
 * Guarda conversaciones y permite búsqueda
 */

const ChatConHistorial = {
    conversaciones: [],
    conversacionActiva: null,

    init: function() {
        this.cargarConversaciones();
        this.renderizarListaConversaciones();
        this.inicializarEventos();
    },

    cargarConversaciones: function() {
        const stored = localStorage.getItem('chat_conversaciones');
        if (stored) {
            this.conversaciones = JSON.parse(stored);
        }
    },

    guardarConversaciones: function() {
        localStorage.setItem('chat_conversaciones', JSON.stringify(this.conversaciones));
    },

    renderizarListaConversaciones: function() {
        const container = document.getElementById('chat-lista');
        if (!container) return;

        container.innerHTML = this.conversaciones.map(conv => `
            <div class="chat-item" data-id="${conv.id}">
                <div class="chat-avatar">${conv.vendedor_nombre[0]}</div>
                <div class="chat-info">
                    <h4>${conv.vendedor_nombre}</h4>
                    <p>${conv.mensajes[conv.mensajes.length - 1]?.texto || 'Sin mensajes'}</p>
                    <span class="chat-fecha">${this.formatearFecha(conv.ultima_actividad)}</span>
                </div>
                <button class="btn-archivar-chat">📁</button>
            </div>
        `).join('');
    },

    renderizarChat: function(id) {
        const conv = this.conversaciones.find(c => c.id === id);
        if (!conv) return;

        this.conversacionActiva = conv;
        const container = document.getElementById('chat-mensajes');
        
        container.innerHTML = conv.mensajes.map(msg => `
            <div class="mensaje ${msg.enviado ? 'enviado' : 'recibido'}">
                <p>${msg.texto}</p>
                <span class="mensaje-hora">${this.formatearHora(msg.fecha)}</span>
            </div>
        `).join('');
    },

    enviarMensaje: function(texto) {
        if (!this.conversacionActiva) return;

        const mensaje = {
            texto,
            enviado: true,
            fecha: new Date().toISOString()
        };

        this.conversacionActiva.mensajes.push(mensaje);
        this.conversacionActiva.ultima_actividad = new Date().toISOString();
        this.guardarConversaciones();
        this.renderizarChat(this.conversacionActiva.id);
        this.renderizarListaConversaciones();
    },

    buscarConversaciones: function(termino) {
        const resultados = this.conversaciones.filter(conv => 
            conv.vendedor_nombre.toLowerCase().includes(termino.toLowerCase()) ||
            conv.mensajes.some(m => m.texto.toLowerCase().includes(termino.toLowerCase()))
        );
        return resultados;
    },

    archivarConversacion: function(id) {
        const conv = this.conversaciones.find(c => c.id === id);
        if (conv) {
            conv.archivada = true;
            this.guardarConversaciones();
            this.renderizarListaConversaciones();
        }
    },

    formatearFecha: function(fecha) {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES');
    },

    formatearHora: function(fecha) {
        const date = new Date(fecha);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    },

    inicializarEventos: function() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-item')) {
                const id = parseInt(e.target.dataset.id);
                this.renderizarChat(id);
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChatConHistorial.init());
} else {
    ChatConHistorial.init();
}
