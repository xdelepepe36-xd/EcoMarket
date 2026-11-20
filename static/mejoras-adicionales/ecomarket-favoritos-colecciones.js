/**
 * EcoMarket - Sistema de Favoritos con Colecciones
 * Permite crear listas organizadas de favoritos
 */

const FavoritosColecciones = {
    colecciones: [],

    init: function() {
        this.cargarColecciones();
        this.renderizarColecciones();
        this.inicializarEventos();
    },

    cargarColecciones: function() {
        const stored = localStorage.getItem('favoritos_colecciones');
        if (stored) {
            this.colecciones = JSON.parse(stored);
        } else {
            // Colecciones por defecto
            this.colecciones = [
                { id: 1, nombre: 'Deseos', productos: [], icono: '❤️' },
                { id: 2, nombre: 'Regalos', productos: [], icono: '🎁' }
            ];
            this.guardarColecciones();
        }
    },

    guardarColecciones: function() {
        localStorage.setItem('favoritos_colecciones', JSON.stringify(this.colecciones));
    },

    renderizarColecciones: function() {
        const container = document.getElementById('colecciones-container');
        if (!container) return;

        container.innerHTML = this.colecciones.map(col => `
            <div class="coleccion-card" data-id="${col.id}">
                <div class="coleccion-icono">${col.icono}</div>
                <h4>${col.nombre}</h4>
                <p>${col.productos.length} productos</p>
                <button class="btn btn-ver-coleccion">Ver</button>
                <button class="btn btn-compartir-coleccion">Compartir</button>
            </div>
        `).join('');
    },

    crearColeccion: function(nombre, icono) {
        const nueva = {
            id: Date.now(),
            nombre,
            productos: [],
            icono: icono || '📋'
        };
        this.colecciones.push(nueva);
        this.guardarColecciones();
        this.renderizarColecciones();
    },

    agregarProducto: function(coleccionId, productoId) {
        const coleccion = this.colecciones.find(c => c.id === coleccionId);
        if (coleccion && !coleccion.productos.includes(productoId)) {
            coleccion.productos.push(productoId);
            this.guardarColecciones();
            this.renderizarColecciones();
        }
    },

    eliminarColeccion: function(id) {
        this.colecciones = this.colecciones.filter(c => c.id !== id);
        this.guardarColecciones();
        this.renderizarColecciones();
    },

    compartirColeccion: function(id) {
        const coleccion = this.colecciones.find(c => c.id === id);
        if (coleccion) {
            const url = `${window.location.origin}/favoritos/compartir/${id}`;
            navigator.clipboard.writeText(url);
            alert('Enlace copiado al portapapeles');
        }
    },

    inicializarEventos: function() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-crear-coleccion')) {
                const nombre = prompt('Nombre de la colección:');
                const icono = prompt('Icono (emoji):', '📋');
                if (nombre) this.crearColeccion(nombre, icono);
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FavoritosColecciones.init());
} else {
    FavoritosColecciones.init();
}
