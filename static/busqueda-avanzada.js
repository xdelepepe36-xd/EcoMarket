/**
 * EcoMarket - Sistema de Búsqueda Avanzada
 * Búsqueda con sugerencias reales, filtros y resultados
 */

const BusquedaAvanzada = {
    filtros: {
        categoria: '',
        precio_min: 0,
        precio_max: 10000,
        eco_score: 0
    },

    historial: [],
    resultados: [],
    debounceTimer: null,

    init: function() {
        this.inicializarFiltros();
        this.inicializarBusqueda();
        this.cargarHistorial();
        this.renderizarHistorial();
    },

    inicializarFiltros: function() {
        const filtros = document.querySelectorAll('.filtro-avanzado');
        filtros.forEach(filtro => {
            filtro.addEventListener('change', () => this.aplicarFiltros());
            filtro.addEventListener('input', () => this.aplicarFiltros());
        });
    },

    leerFiltros: function() {
        document.querySelectorAll('.filtro-avanzado').forEach(f => {
            this.filtros[f.name] = f.type === 'range' || f.type === 'number'
                ? parseFloat(f.value) || 0
                : f.value;
        });
    },

    inicializarBusqueda: function() {
        const input = document.getElementById('busqueda-input');
        if (!input) return;

        input.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            const query = input.value.trim();
            if (query.length >= 2) {
                this.debounceTimer = setTimeout(() => this.mostrarSugerencias(query), 250);
            } else {
                this.limpiarSugerencias();
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.realizarBusqueda(input.value.trim());
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.busqueda-input')) this.limpiarSugerencias();
        });
    },

    async mostrarSugerencias(query) {
        const container = document.getElementById('sugerencias-busqueda');
        if (!container) return;

        try {
            const res = await fetch('/api/buscar?q=' + encodeURIComponent(query));
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '';
                return;
            }
            container.innerHTML = data.map(p => `
                <div class="sugerencia-item" data-id="${p.id}">
                    <strong>${this.esc(p.nombre)}</strong>
                    <span style="float:right;color:var(--verde,#2e7d32);font-weight:600">S/ ${p.precio}</span>
                </div>
            `).join('');

            container.querySelectorAll('.sugerencia-item').forEach(item => {
                item.addEventListener('click', () => {
                    window.location.href = '/producto/' + item.dataset.id;
                });
            });
        } catch (e) {
            container.innerHTML = '';
        }
    },

    limpiarSugerencias: function() {
        const container = document.getElementById('sugerencias-busqueda');
        if (container) container.innerHTML = '';
    },

    esc: function(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    },

    async realizarBusqueda(query) {
        if (!query) return;
        this.limpiarSugerencias();
        document.getElementById('busqueda-input').value = query;

        this.historial.unshift({ query, fecha: new Date().toISOString() });
        if (this.historial.length > 10) this.historial.pop();
        localStorage.setItem('busqueda_historial', JSON.stringify(this.historial));
        this.renderizarHistorial();

        const cont = document.getElementById('resultados-busqueda');
        if (cont) cont.innerHTML = '<p style="text-align:center;padding:20px">Buscando...</p>';

        try {
            const res = await fetch('/api/buscar?q=' + encodeURIComponent(query));
            this.resultados = await res.json();
        } catch (e) {
            this.resultados = [];
        }
        this.leerFiltros();
        this.renderizarResultados();
    },

    aplicarFiltros: function() {
        this.leerFiltros();
        this.renderizarResultados();
    },

    renderizarResultados: function() {
        const cont = document.getElementById('resultados-busqueda');
        if (!cont) return;

        const f = this.filtros;
        const filtrados = (this.resultados || []).filter(p => {
            const precio = parseFloat(p.precio) || 0;
            if (precio < f.precio_min || precio > f.precio_max) return false;
            if (f.categoria && (p.categoria || '').toLowerCase() !== f.categoria.toLowerCase()) return false;
            if ((p.eco_score || 0) < f.eco_score) return false;
            return true;
        });

        if (filtrados.length === 0) {
            cont.innerHTML = '<p style="text-align:center;padding:20px;color:var(--texto-sec,#666)">Sin resultados para los filtros actuales.</p>';
            return;
        }

        cont.innerHTML = '<div class="productos-grid">' + filtrados.map(p => `
            <a href="/producto/${p.id}" class="producto-card" style="text-decoration:none;color:inherit">
                <div class="producto-img" style="height:180px;overflow:hidden;border-radius:10px 10px 0 0">
                    <img src="${this.esc(p.imagen || '/static/images/placeholder.png')}" alt="${this.esc(p.nombre)}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
                </div>
                <div class="producto-info" style="padding:14px">
                    <span class="producto-categoria" style="font-size:.8rem;color:var(--verde,#2e7d32)">${this.esc(p.categoria || '')}</span>
                    <h3 style="font-size:1rem;margin:6px 0">${this.esc(p.nombre)}</h3>
                    <p style="font-weight:700;color:var(--naranja,#f57c00);font-size:1.1rem">S/ ${p.precio}</p>
                </div>
            </a>
        `).join('') + '</div>';
    },

    cargarHistorial: function() {
        const stored = localStorage.getItem('busqueda_historial');
        if (stored) {
            try { this.historial = JSON.parse(stored); } catch (e) { this.historial = []; }
        }
    },

    renderizarHistorial: function() {
        const container = document.getElementById('historial-busqueda');
        if (!container) return;

        if (this.historial.length === 0) {
            container.innerHTML = '<p style="color:var(--texto-sec,#666)">Aún no has buscado nada.</p>';
            return;
        }

        container.innerHTML = this.historial.map((h, i) => `
            <div class="historial-item">
                <span>${this.esc(h.query)}</span>
                <button class="btn-buscar-historial" data-query="${this.esc(h.query)}" data-idx="${i}">🔍</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-buscar-historial').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('busqueda-input').value = btn.dataset.query;
                this.realizarBusqueda(btn.dataset.query);
            });
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BusquedaAvanzada.init());
} else {
    BusquedaAvanzada.init();
}
