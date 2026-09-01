/**
 * EcoMarket - Sistema de Analytics
 * Seguimiento de comportamiento de usuarios y métricas
 */

const EcoAnalytics = {
    config: {
        googleAnalyticsId: '',
        mixpanelToken: '',
        hotjarId: '',
        enableLocalTracking: true
    },

    data: {
        pageViews: [],
        events: [],
        userActions: [],
        performanceMetrics: []
    },

    init() {
        try {
            this.loadConfig();
            this.loadLocalData();
            this.initGoogleAnalytics();
            this.initMixpanel();
            this.initHotjar();
            this.setupEventListeners();
            this.trackPageView();
        } catch (error) {
            console.error('Error inicializando analytics:', error);
        }
    },

    loadConfig() {
        try {
            this.config.googleAnalyticsId = window.GOOGLE_ANALYTICS_ID || '';
            this.config.mixpanelToken = window.MIXPANEL_TOKEN || '';
            this.config.hotjarId = window.HOTJAR_ID || '';
        } catch (error) {
            console.error('Error cargando configuración de analytics:', error);
        }
    },

    loadLocalData() {
        try {
            const saved = localStorage.getItem('ecomarket-analytics');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando datos locales:', error);
        }
    },

    saveLocalData() {
        try {
            localStorage.setItem('ecomarket-analytics', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error guardando datos locales:', error);
        }
    },

    initGoogleAnalytics() {
        if (!this.config.googleAnalyticsId) {
            console.log('Google Analytics no configurado');
            return;
        }

        try {
            // Cargar Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
                dataLayer.push(arguments);
            };
            gtag('js', new Date());
            gtag('config', this.config.googleAnalyticsId);

            console.log('Google Analytics inicializado');
        } catch (error) {
            console.error('Error inicializando Google Analytics:', error);
        }
    },

    initMixpanel() {
        if (!this.config.mixpanelToken) {
            console.log('Mixpanel no configurado');
            return;
        }

        try {
            (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=c.hash,g="script";d=d||function(){(a.__SV=a.__SV||[]).push(arguments)};b.mixpanel=a;a._i=[];a.init=function(b,e,f){function g(b,d){var a=d.split(".");2==a.length&&(b=b[a[0]],d=a[1]);b[d]=function(){b.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var c=a;"undefined"!==typeof f?c=a[f]=[]:f="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<i.length;h++)g(c,i[h]);a._i.push([b,e,f])};a.__SV=1.2;b=c.createElement(g);b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===c.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName(g)[0];d.parentNode.insertBefore(b,d)}})(document,window.mixpanel||[]);
            mixpanel.init(this.config.mixpanelToken);

            console.log('Mixpanel inicializado');
        } catch (error) {
            console.error('Error inicializando Mixpanel:', error);
        }
    },

    initHotjar() {
        if (!this.config.hotjarId) {
            console.log('Hotjar no configurado');
            return;
        }

        try {
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:this.config.hotjarId,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

            console.log('Hotjar inicializado');
        } catch (error) {
            console.error('Error inicializando Hotjar:', error);
        }
    },

    trackPageView(pageName = null) {
        const page = pageName || window.location.pathname;
        const timestamp = new Date().toISOString();

        // Guardar localmente
        this.data.pageViews.push({
            page: page,
            timestamp: timestamp,
            referrer: document.referrer,
            userAgent: navigator.userAgent
        });

        // Enviar a Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: page
            });
        }

        // Enviar a Mixpanel
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track('Page View', {
                page: page,
                title: document.title
            });
        }

        this.saveLocalData();
    },

    trackEvent(eventName, properties = {}) {
        const timestamp = new Date().toISOString();

        // Guardar localmente
        this.data.events.push({
            event: eventName,
            properties: properties,
            timestamp: timestamp
        });

        // Enviar a Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        // Enviar a Mixpanel
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(eventName, properties);
        }

        this.saveLocalData();
    },

    trackUserAction(action, details = {}) {
        const timestamp = new Date().toISOString();

        this.data.userActions.push({
            action: action,
            details: details,
            timestamp: timestamp,
            page: window.location.pathname
        });

        this.saveLocalData();
    },

    trackProductView(productId, productName, category) {
        this.trackEvent('product_view', {
            product_id: productId,
            product_name: productName,
            category: category
        });

        this.trackUserAction('view_product', {
            product_id: productId,
            product_name: productName
        });
    },

    trackAddToCart(productId, productName, price, quantity) {
        this.trackEvent('add_to_cart', {
            product_id: productId,
            product_name: productName,
            price: price,
            quantity: quantity,
            total: price * quantity
        });

        this.trackUserAction('add_to_cart', {
            product_id: productId,
            product_name: productName,
            quantity: quantity
        });
    },

    trackPurchase(orderId, total, items) {
        this.trackEvent('purchase', {
            order_id: orderId,
            total: total,
            items: items.length,
            currency: 'PEN'
        });

        this.trackUserAction('purchase', {
            order_id: orderId,
            total: total,
            items_count: items.length
        });
    },

    trackSearch(query, resultsCount) {
        this.trackEvent('search', {
            query: query,
            results_count: resultsCount
        });

        this.trackUserAction('search', {
            query: query,
            results_count: resultsCount
        });
    },

    trackFilter(category, filters) {
        this.trackEvent('filter', {
            category: category,
            filters: filters
        });

        this.trackUserAction('filter', {
            category: category,
            filters: Object.keys(filters)
        });
    },

    trackError(error, context = {}) {
        this.trackEvent('error', {
            error_message: error.message,
            error_stack: error.stack,
            context: context
        });

        this.trackUserAction('error', {
            error_message: error.message,
            context: context
        });
    },

    trackPerformance() {
        if ('performance' in window) {
            const timing = performance.timing;
            const metrics = {
                page_load_time: timing.loadEventEnd - timing.navigationStart,
                dom_content_loaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                first_paint: timing.responseStart - timing.navigationStart,
                timestamp: new Date().toISOString()
            };

            this.data.performanceMetrics.push(metrics);
            this.saveLocalData();

            this.trackEvent('performance', metrics);
        }
    },

    identifyUser(userId, properties = {}) {
        if (typeof mixpanel !== 'undefined') {
            mixpanel.identify(userId);
            mixpanel.people.set(properties);
        }

        if (typeof gtag !== 'undefined') {
            gtag('config', this.config.googleAnalyticsId, {
                user_id: userId
            });
        }
    },

    setUserProperties(properties) {
        if (typeof mixpanel !== 'undefined') {
            mixpanel.people.set(properties);
        }
    },

    getSessionData() {
        return {
            pageViews: this.data.pageViews.length,
            events: this.data.events.length,
            userActions: this.data.userActions.length,
            sessionDuration: this.calculateSessionDuration(),
            mostViewedPages: this.getMostViewedPages(),
            topEvents: this.getTopEvents()
        };
    },

    calculateSessionDuration() {
        if (this.data.pageViews.length === 0) return 0;

        const firstView = new Date(this.data.pageViews[0].timestamp);
        const lastView = new Date(this.data.pageViews[this.data.pageViews.length - 1].timestamp);
        return Math.round((lastView - firstView) / 1000); // segundos
    },

    getMostViewedPages() {
        const pageCounts = {};
        this.data.pageViews.forEach(view => {
            pageCounts[view.page] = (pageCounts[view.page] || 0) + 1;
        });

        return Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([page, count]) => ({ page, count }));
    },

    getTopEvents() {
        const eventCounts = {};
        this.data.events.forEach(event => {
            eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        });

        return Object.entries(eventCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([event, count]) => ({ event, count }));
    },

    exportAnalyticsData() {
        const exportData = {
            export_date: new Date().toISOString(),
            session_data: this.getSessionData(),
            page_views: this.data.pageViews,
            events: this.data.events,
            user_actions: this.data.userActions,
            performance_metrics: this.data.performanceMetrics
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecomarket_analytics_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.EcoToast) {
            EcoToast.show('Exportación completada', 'Datos de analytics exportados', 'success');
        }
    },

    clearLocalData() {
        this.data = {
            pageViews: [],
            events: [],
            userActions: [],
            performanceMetrics: []
        };
        this.saveLocalData();

        if (window.EcoToast) {
            EcoToast.show('Datos limpiados', 'Datos locales de analytics eliminados', 'info');
        }
    },

    setupEventListeners() {
        // Seguimiento de clics en productos
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('[data-product-id]');
            if (productCard) {
                const productId = productCard.dataset.productId;
                const productName = productCard.dataset.productName || 'Producto';
                const category = productCard.dataset.category || 'General';
                this.trackProductView(productId, productName, category);
            }
        });

        // Seguimiento de búsqueda
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('search', (e) => {
                const query = e.target.value;
                if (query.trim()) {
                    this.trackSearch(query, 0); // resultsCount se actualizaría con resultados reales
                }
            });
        }

        // Seguimiento de rendimiento
        window.addEventListener('load', () => {
            setTimeout(() => this.trackPerformance(), 1000);
        });

        // Exportar datos (para admin)
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="export-analytics"]')) {
                this.exportAnalyticsData();
            }
            if (e.target.closest('[data-action="clear-analytics"]')) {
                this.clearLocalData();
            }
        });
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoAnalytics.init());
} else {
    EcoAnalytics.init();
}

// Exponer globalmente
window.EcoAnalytics = EcoAnalytics;