/**
 * EcoMarket - Dashboard de Analytics Visual
 * Gráficos interactivos y métricas en tiempo real
 */

const AnalyticsDashboard = {
    datos: {
        visitas: 0,
        ventas: 0,
        ingresos: 0,
        conversion: 0
    },

    init: function() {
        this.cargarDatos();
        this.renderizarGraficos();
        this.renderizarMetricas();
    },

    cargarDatos: function() {
        const stored = localStorage.getItem('analytics_datos');
        if (stored) {
            this.datos = JSON.parse(stored);
        }
    },

    renderizarMetricas: function() {
        const container = document.getElementById('analytics-metricas');
        if (!container) return;

        container.innerHTML = `
            <div class="metrica-card">
                <h3>Visitas</h3>
                <p class="metrica-valor">${this.datos.visitas}</p>
                <span class="metrica-trend">+12% vs mes anterior</span>
            </div>
            <div class="metrica-card">
                <h3>Ventas</h3>
                <p class="metrica-valor">${this.datos.ventas}</p>
                <span class="metrica-trend">+8% vs mes anterior</span>
            </div>
            <div class="metrica-card">
                <h3>Ingresos</h3>
                <p class="metrica-valor">S/${this.datos.ingresos}</p>
                <span class="metrica-trend">+15% vs mes anterior</span>
            </div>
            <div class="metrica-card">
                <h3>Conversión</h3>
                <p class="metrica-valor">${this.datos.conversion}%</p>
                <span class="metrica-trend">+2% vs mes anterior</span>
            </div>
        `;
    },

    renderizarGraficos: function() {
        this.renderizarGraficoVentas();
        this.renderizarGraficoCategorias();
    },

    renderizarGraficoVentas: function() {
        const canvas = document.getElementById('grafico-ventas');
        if (!canvas) return;

        // Simulación de gráfico con barras
        const ctx = canvas.getContext('2d');
        const datos = [120, 190, 300, 250, 400, 350, 450];
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        ctx.fillStyle = '#2e7d32';
        datos.forEach((valor, index) => {
            const x = index * 60 + 50;
            const height = valor / 5;
            ctx.fillRect(x, 300 - height, 40, height);
            
            ctx.fillStyle = '#333';
            ctx.fillText(labels[index], x + 15, 320);
            ctx.fillStyle = '#2e7d32';
        });
    },

    renderizarGraficoCategorias: function() {
        const canvas = document.getElementById('grafico-categorias');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const categorias = [
            { nombre: 'Higiene', valor: 30, color: '#2e7d32' },
            { nombre: 'Hogar', valor: 25, color: '#1976d2' },
            { nombre: 'Ropa', valor: 20, color: '#f57c00' },
            { nombre: 'Alimentación', valor: 15, color: '#7b1fa2' },
            { nombre: 'Otros', valor: 10, color: '#616161' }
        ];

        let angulo = 0;
        categorias.forEach(cat => {
            const porcentaje = cat.valor / 100;
            const sliceAngle = porcentaje * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(150, 150);
            ctx.arc(150, 150, 100, angulo, angulo + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = cat.color;
            ctx.fill();
            
            angulo += sliceAngle;
        });
    },

    exportarReporte: function() {
        const reporte = {
            fecha: new Date().toISOString(),
            metricas: this.datos,
            generado_por: 'EcoMarket Analytics'
        };

        const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_analytics.json';
        a.click();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnalyticsDashboard.init());
} else {
    AnalyticsDashboard.init();
}
