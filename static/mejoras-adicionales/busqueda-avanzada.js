/**
 * EcoMarket - Sistema de Búsqueda Avanzada
 * Filtros inteligentes y búsqueda mejorada
 */

const BusquedaAvanzada = {
    filtros: {
        categoria: '',
        precio_min: 0,
        precio_max: 10000,
        eco_score: 0,
        condicion: '',
        ubicacion: '',
        vendido_por: ''
    },

    historial: [],

    init: function() {
        this.inicializarFiltros();
        this.inicializarBusqueda();
        this.cargarHistorial();
    },

    inicializarFiltros: function() {
        const filtros = document.querySelectorAll('.filtro-avanzado');
        filtros.forEach(filtro => {
            filtro.addEventListener('change', (e) => {
                this.filtros[e.target.name] = e.target.value;
                this.aplicarFiltros();
            });
        });
    },

    inicializarBusqueda: function() {
        const input = document.getElementById('busqueda-input');
        if (!input) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                this.mostrarSugerencias(query);
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.realizarBusqueda(e.target.value);
            }
        });
    },

    mostrarSugerencias: function(query) {
        const container = document.getElementById('sugerencias-busqueda');
        if (!container) return;

        // Simulación de sugerencias
        const sugerencias = [
            'Botella ecológica',
            'Manta de lana',
            'Jabón natural',
            'Taza de bambú'
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));

        container.innerHTML = sugerencias.map(s => `
            <div class="sugerencia-item" data-query="${s}">${s}</div>
        `).join('');
    },

    realizarBusqueda: function(query) {
        if (!query) return;

        this.historial.unshift({
            query,
            fecha: new Date().toISOString()
        });

        if (this.historial.length > 10) {
            this.historial.pop();
        }

        localStorage.setItem('busqueda_historial', JSON.stringify(this.historial));
        this.renderizarHistorial();
    },

    cargarHistorial: function() {
        const stored = localStorage.getItem('busqueda_historial');
        if (stored) {
            this.historial = JSON.parse(stored);
            this.renderizarHistorial();
        }
    },

    renderizarHistorial: function() {
        const container = document.getElementById('historial-busqueda');
        if (!container) return;

        container.innerHTML = this.historial.map(h => `
            <div class="historial-item">
                <span>${h.query}</span>
                <button class="btn-buscar-historial" data-query="${h.query}">🔍</button>
            </div>
        `).join('');
    },

    aplicarFiltros: function() {
        const productos = document.querySelectorAll('.producto-card');
        productos.forEach(prod => {
            const precio = parseFloat(prod.dataset.precio);
            const eco_score = parseInt(prod.dataset.ecoScore);
            const categoria = prod.dataset.categoria;

            let visible = true;

            if (precio < this.filtros.precio_min || precio > this.filtros.precio_max) {
                visible = false;
            }

            if (eco_score < this.filtros.eco_score) {
                visible = false;
            }

            if (this.filtros.categoria && categoria !== this.filtros.categoria) {
                visible = false;
            }

            prod.style.display = visible ? 'block' : 'none';
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BusquedaAvanzada.init());
} else {
    BusquedaAvanzada.init();
}
