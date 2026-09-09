// Dashboard Analytics Mejorado - EcoMarket
(function() {
    'use strict';

    const AnalyticsDashboard = {
        // Datos de analytics
        analyticsData: {
            pageViews: [],
            productViews: [],
            conversions: [],
            userBehavior: [],
            salesData: [],
            trafficSources: {},
            userDemographics: {},
            productPerformance: {},
            timeSeriesData: {}
        },

        // Métricas calculadas
        metrics: {
            totalPageViews: 0,
            uniqueVisitors: 0,
            bounceRate: 0,
            avgSessionDuration: 0,
            conversionRate: 0,
            totalRevenue: 0,
            avgOrderValue: 0,
            topProducts: [],
            topCategories: [],
            peakHours: [],
            userRetention: 0
        },

        // Inicializar dashboard
        init() {
            this.loadAnalyticsData();
            this.calculateMetrics();
            this.renderDashboard();
            this.startRealTimeUpdates();
            this.setupEventListeners();
            console.log('📊 Dashboard Analytics inicializado');
        },

        // Cargar datos de analytics
        loadAnalyticsData() {
            const saved = localStorage.getItem('ecomarket_analytics');
            if (saved) {
                try {
                    this.analyticsData = JSON.parse(saved);
                } catch (e) {
                    console.error('Error cargando datos de analytics:', e);
                }
            }
        },

        // Guardar datos de analytics
        saveAnalyticsData() {
            localStorage.setItem('ecomarket_analytics', JSON.stringify(this.analyticsData));
        },

        // Calcular métricas
        calculateMetrics() {
            // Page views totales
            this.metrics.totalPageViews = this.analyticsData.pageViews.length;

            // Visitantes únicos
            const uniqueUsers = new Set(this.analyticsData.pageViews.map(pv => pv.userId));
            this.metrics.uniqueVisitors = uniqueUsers.size;

            // Tasa de rebote (sesiones de una sola página)
            const userSessions = this.groupByUser(this.analyticsData.pageViews);
            const singlePageSessions = Object.values(userSessions).filter(session => session.length === 1).length;
            this.metrics.bounceRate = userSessions.length > 0 
                ? (singlePageSessions / userSessions.length) * 100 
                : 0;

            // Duración promedio de sesión
            const sessionDurations = Object.values(userSessions).map(session => {
                if (session.length < 2) return 0;
                const first = new Date(session[0].timestamp);
                const last = new Date(session[session.length - 1].timestamp);
                return (last - first) / 1000; // en segundos
            });
            this.metrics.avgSessionDuration = sessionDurations.length > 0
                ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
                : 0;

            // Tasa de conversión
            const conversions = this.analyticsData.conversions.length;
            this.metrics.conversionRate = this.metrics.uniqueVisitors > 0
                ? (conversions / this.metrics.uniqueVisitors) * 100
                : 0;

            // Ingresos totales
            this.metrics.totalRevenue = this.analyticsData.salesData.reduce((sum, sale) => sum + sale.amount, 0);

            // Valor promedio de orden
            const orders = this.analyticsData.salesData.length;
            this.metrics.avgOrderValue = orders > 0
                ? this.metrics.totalRevenue / orders
                : 0;

            // Productos más vistos
            const productViews = this.groupBy(this.analyticsData.productViews, 'productId');
            this.metrics.topProducts = Object.entries(productViews)
                .map(([productId, views]) => ({ productId, views: views.length }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            // Horas pico
            const hourlyViews = this.groupBy(this.analyticsData.pageViews, 'hour');
            this.metrics.peakHours = Object.entries(hourlyViews)
                .map(([hour, views]) => ({ hour: parseInt(hour), views: views.length }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 5);

            // Retención de usuarios
            this.metrics.userRetention = this.calculateUserRetention();
        },

        // Agrupar por usuario
        groupByUser(pageViews) {
            const grouped = {};
            pageViews.forEach(pv => {
                if (!pv.userId) return;
                if (!grouped[pv.userId]) {
                    grouped[pv.userId] = [];
                }
                grouped[pv.userId].push(pv);
            });
            return grouped;
        },

        // Agrupar por propiedad
        groupBy(array, key) {
            return array.reduce((result, item) => {
                const groupKey = item[key];
                if (!result[groupKey]) {
                    result[groupKey] = [];
                }
                result[groupKey].push(item);
                return result;
            }, {});
        },

        // Calcular retención de usuarios
        calculateUserRetention() {
            const userSessions = this.groupByUser(this.analyticsData.pageViews);
            const returningUsers = Object.values(userSessions).filter(sessions => sessions.length > 1).length;
            const totalUsers = Object.keys(userSessions).length;
            return totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;
        },

        // Renderizar dashboard
        renderDashboard() {
            this.renderOverviewCards();
            this.renderCharts();
            this.renderTables();
            this.renderRealTimeStats();
        },

        // Renderizar tarjetas de overview
        renderOverviewCards() {
            const container = document.querySelector('.analytics-overview');
            if (!container) return;

            container.innerHTML = `
                <div class="analytics-card">
                    <div class="card-icon">👁️</div>
                    <div class="card-content">
                        <div class="card-label">Page Views</div>
                        <div class="card-value">${this.formatNumber(this.metrics.totalPageViews)}</div>
                        <div class="card-trend positive">↑ 12% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">👥</div>
                    <div class="card-content">
                        <div class="card-label">Visitantes Únicos</div>
                        <div class="card-value">${this.formatNumber(this.metrics.uniqueVisitors)}</div>
                        <div class="card-trend positive">↑ 8% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">🔄</div>
                    <div class="card-content">
                        <div class="card-label">Tasa de Rebote</div>
                        <div class="card-value">${this.metrics.bounceRate.toFixed(1)}%</div>
                        <div class="card-trend negative">↓ 3% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">⏱️</div>
                    <div class="card-content">
                        <div class="card-label">Duración Promedio</div>
                        <div class="card-value">${this.formatDuration(this.metrics.avgSessionDuration)}</div>
                        <div class="card-trend positive">↑ 15% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">🎯</div>
                    <div class="card-content">
                        <div class="card-label">Tasa de Conversión</div>
                        <div class="card-value">${this.metrics.conversionRate.toFixed(2)}%</div>
                        <div class="card-trend positive">↑ 5% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">💰</div>
                    <div class="card-content">
                        <div class="card-label">Ingresos Totales</div>
                        <div class="card-value">S/. ${this.formatNumber(this.metrics.totalRevenue)}</div>
                        <div class="card-trend positive">↑ 20% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">🛒</div>
                    <div class="card-content">
                        <div class="card-label">Valor Promedio</div>
                        <div class="card-value">S/. ${this.metrics.avgOrderValue.toFixed(2)}</div>
                        <div class="card-trend positive">↑ 7% vs semana pasada</div>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="card-icon">🔄</div>
                    <div class="card-content">
                        <div class="card-label">Retención</div>
                        <div class="card-value">${this.metrics.userRetention.toFixed(1)}%</div>
                        <div class="card-trend positive">↑ 10% vs semana pasada</div>
                    </div>
                </div>
            `;
        },

        // Renderizar gráficos
        renderCharts() {
            this.renderTrafficChart();
            this.renderConversionChart();
            this.renderRevenueChart();
            this.renderHourlyChart();
        },

        // Renderizar gráfico de tráfico
        renderTrafficChart() {
            const container = document.querySelector('.traffic-chart');
            if (!container) return;

            const dailyViews = this.groupByDate(this.analyticsData.pageViews);
            const labels = Object.keys(dailyViews).slice(-7); // Últimos 7 días
            const data = labels.map(date => dailyViews[date].length);

            this.createChart(container, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Page Views',
                        data: data,
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Tráfico Semanal'
                        }
                    }
                }
            });
        },

        // Renderizar gráfico de conversiones
        renderConversionChart() {
            const container = document.querySelector('.conversion-chart');
            if (!container) return;

            const funnelData = [
                { stage: 'Visitantes', value: this.metrics.uniqueVisitors },
                { stage: 'Vistas Producto', value: this.analyticsData.productViews.length },
                { stage: 'Carrito', value: this.analyticsData.userBehavior.filter(b => b.action === 'add_to_cart').length },
                { stage: 'Conversiones', value: this.analyticsData.conversions.length }
            ];

            this.createChart(container, {
                type: 'bar',
                data: {
                    labels: funnelData.map(d => d.stage),
                    datasets: [{
                        label: 'Usuarios',
                        data: funnelData.map(d => d.value),
                        backgroundColor: ['#2e7d32', '#43a047', '#66bb6a', '#81c784']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Embudo de Conversión'
                        }
                    }
                }
            });
        },

        // Renderizar gráfico de ingresos
        renderRevenueChart() {
            const container = document.querySelector('.revenue-chart');
            if (!container) return;

            const dailyRevenue = this.groupByDate(this.analyticsData.salesData);
            const labels = Object.keys(dailyRevenue).slice(-7);
            const data = labels.map(date => 
                dailyRevenue[date].reduce((sum, sale) => sum + sale.amount, 0)
            );

            this.createChart(container, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ingresos (S/.)',
                        data: data,
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Ingresos Semanales'
                        }
                    }
                }
            });
        },

        // Renderizar gráfico horario
        renderHourlyChart() {
            const container = document.querySelector('.hourly-chart');
            if (!container) return;

            const hourlyData = new Array(24).fill(0);
            this.analyticsData.pageViews.forEach(pv => {
                const hour = new Date(pv.timestamp).getHours();
                hourlyData[hour]++;
            });

            this.createChart(container, {
                type: 'bar',
                data: {
                    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                    datasets: [{
                        label: 'Page Views',
                        data: hourlyData,
                        backgroundColor: '#ffa726'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Actividad por Hora'
                        }
                    }
                }
            });
        },

        // Renderizar tablas
        renderTables() {
            this.renderTopProductsTable();
            this.renderPeakHoursTable();
        },

        // Renderizar tabla de productos top
        renderTopProductsTable() {
            const container = document.querySelector('.top-products-table');
            if (!container) return;

            let html = `
                <h3>🏆 Productos Más Vistos</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Vistas</th>
                            <th>Tendencia</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            this.metrics.topProducts.forEach((product, index) => {
                html += `
                    <tr>
                        <td>#${index + 1} - Producto ID: ${product.productId}</td>
                        <td>${this.formatNumber(product.views)}</td>
                        <td><span class="trend-up">↑</span></td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        },

        // Renderizar tabla de horas pico
        renderPeakHoursTable() {
            const container = document.querySelector('.peak-hours-table');
            if (!container) return;

            let html = `
                <h3>⏰ Horas Pico de Actividad</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Page Views</th>
                            <th>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            const totalViews = this.metrics.totalPageViews;
            this.metrics.peakHours.forEach((hourData, index) => {
                const percentage = totalViews > 0 ? (hourData.views / totalViews) * 100 : 0;
                html += `
                    <tr>
                        <td>${hourData.hour}:00</td>
                        <td>${this.formatNumber(hourData.views)}</td>
                        <td>${percentage.toFixed(1)}%</td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        },

        // Renderizar estadísticas en tiempo real
        renderRealTimeStats() {
            const container = document.querySelector('.real-time-stats');
            if (!container) return;

            const now = new Date();
            const lastHour = this.analyticsData.pageViews.filter(pv => {
                const viewTime = new Date(pv.timestamp);
                return (now - viewTime) < 3600000; // Última hora
            });

            const currentUsers = new Set(lastHour.map(pv => pv.userId)).size;

            container.innerHTML = `
                <div class="real-time-item">
                    <span class="real-time-label">Usuarios Activos</span>
                    <span class="real-time-value">${currentUsers}</span>
                </div>
                <div class="real-time-item">
                    <span class="real-time-label">Page Views (1h)</span>
                    <span class="real-time-value">${lastHour.length}</span>
                </div>
                <div class="real-time-item">
                    <span class="real-time-label">Última Actualización</span>
                    <span class="real-time-value">${now.toLocaleTimeString()}</span>
                </div>
            `;
        },

        // Agrupar por fecha
        groupByDate(array) {
            const grouped = {};
            array.forEach(item => {
                const date = new Date(item.timestamp).toISOString().split('T')[0];
                if (!grouped[date]) {
                    grouped[date] = [];
                }
                grouped[date].push(item);
            });
            return grouped;
        },

        // Crear gráfico (placeholder - usar Chart.js en producción)
        createChart(container, config) {
            // En producción, usar Chart.js u otra librería
            container.innerHTML = `
                <div class="chart-placeholder">
                    <div class="chart-info">
                        <strong>${config.options.plugins.title.text}</strong>
                        <p>Tipo: ${config.type}</p>
                        <p>Datos: ${config.data.datasets[0].data.join(', ')}</p>
                    </div>
                </div>
            `;
        },

        // Iniciar actualizaciones en tiempo real
        startRealTimeUpdates() {
            setInterval(() => {
                this.renderRealTimeStats();
            }, 30000); // Actualizar cada 30 segundos
        },

        // Configurar event listeners
        setupEventListeners() {
            // Escuchar eventos de analytics
            document.addEventListener('analyticsEvent', (e) => {
                this.handleAnalyticsEvent(e.detail);
            });
        },

        // Manejar eventos de analytics
        handleAnalyticsEvent(eventData) {
            switch (eventData.type) {
                case 'pageView':
                    this.analyticsData.pageViews.push({
                        timestamp: new Date().toISOString(),
                        page: eventData.page,
                        userId: eventData.userId,
                        hour: new Date().getHours()
                    });
                    break;
                case 'productView':
                    this.analyticsData.productViews.push({
                        timestamp: new Date().toISOString(),
                        productId: eventData.productId,
                        userId: eventData.userId
                    });
                    break;
                case 'conversion':
                    this.analyticsData.conversions.push({
                        timestamp: new Date().toISOString(),
                        type: eventData.conversionType,
                        userId: eventData.userId,
                        value: eventData.value
                    });
                    break;
                case 'sale':
                    this.analyticsData.salesData.push({
                        timestamp: new Date().toISOString(),
                        amount: eventData.amount,
                        userId: eventData.userId,
                        products: eventData.products
                    });
                    break;
                case 'userBehavior':
                    this.analyticsData.userBehavior.push({
                        timestamp: new Date().toISOString(),
                        action: eventData.action,
                        userId: eventData.userId,
                        details: eventData.details
                    });
                    break;
            }
            this.saveAnalyticsData();
            this.calculateMetrics();
        },

        // Utilidades de formato
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        },

        formatDuration(seconds) {
            if (seconds < 60) return Math.round(seconds) + 's';
            if (seconds < 3600) return Math.round(seconds / 60) + 'm';
            return Math.round(seconds / 3600) + 'h';
        },

        // API pública
        trackEvent(type, data) {
            const eventData = {
                type: type,
                timestamp: new Date().toISOString(),
                ...data
            };
            
            document.dispatchEvent(new CustomEvent('analyticsEvent', { detail: eventData }));
        },

        getMetrics() {
            return this.metrics;
        },

        exportData(format = 'json') {
            const exportData = {
                metrics: this.metrics,
                rawData: this.analyticsData,
                exportDate: new Date().toISOString()
            };

            if (format === 'json') {
                return JSON.stringify(exportData, null, 2);
            } else if (format === 'csv') {
                // Implementar exportación CSV
                return this.exportToCSV(exportData);
            }
        },

        exportToCSV(data) {
            // Implementación básica de CSV
            let csv = 'Metric,Value\n';
            Object.entries(data.metrics).forEach(([key, value]) => {
                csv += `${key},${value}\n`;
            });
            return csv;
        }
    };

    // Exponer al scope global
    window.EcoAnalytics = AnalyticsDashboard;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AnalyticsDashboard.init());
    } else {
        AnalyticsDashboard.init();
    }

})();