/**
 * EcoMarket - Configuración Centralizada
 * Variables y constantes de configuración
 */

const EcoMarketConfig = {
    // Configuración de la aplicación
    app: {
        name: 'EcoMarket',
        version: '3.0.0',
        environment: 'production', // 'development' | 'production'
        debug: false,
        apiUrl: '/api',
        wsUrl: '' // URL para WebSockets si se implementa
    },

    // Configuración de imágenes
    images: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        thumbnailSize: 300,
        quality: 85,
        defaultImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        cdnUrl: '' // URL de CDN si se usa
    },

    // Configuración de carrito
    cart: {
        storageKey: 'ecomarket_cart',
        expiryDays: 30,
        maxItems: 50,
        freeShippingThreshold: 150 // PEN
    },

    // Configuración de favoritos
    favorites: {
        storageKey: 'ecomarket_favorites',
        maxItems: 100
    },

    // Configuración de búsqueda
    search: {
        minQueryLength: 2,
        debounceTime: 300,
        maxResults: 20,
        highlightResults: true
    },

    // Configuración de paginación
    pagination: {
        defaultItemsPerPage: 12,
        maxItemsPerPage: 50,
        visiblePages: 5
    },

    // Configuración de moneda
    currency: {
        code: 'PEN',
        symbol: 'S/',
        locale: 'es-PE',
        decimalPlaces: 2
    },

    // Configuración de idiomas
    i18n: {
        defaultLanguage: 'es',
        availableLanguages: ['es', 'en'],
        storageKey: 'ecomarket_language',
        autoDetect: true
    },

    // Configuración de temas
    themes: {
        defaultTheme: 'light',
        availableThemes: ['light', 'dark', 'eco'],
        storageKey: 'ecomarket_theme',
        followSystem: true
    },

    // Configuración de notificaciones
    notifications: {
        enabled: true,
        position: 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        duration: 3000,
        maxVisible: 5
    },

    // Configuración de analytics
    analytics: {
        enabled: true,
        trackPageViews: true,
        trackClicks: true,
        trackScroll: true,
        sampleRate: 1.0, // 100% de los usuarios
        endpoint: '/api/analytics'
    },

    // Configuración de seguridad
    security: {
        csrfToken: true,
        rateLimiting: true,
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000, // 15 minutos
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 horas
    },

    // Configuración de productos
    products: {
        categories: [
            'Hogar',
            'Accesorios', 
            'Higiene',
            'Jardín',
            'Alimentación',
            'Ropa'
        ],
        conditions: ['nuevo', 'usado', 'reconditionado'],
        ecoScores: [0, 1, 2, 3, 4, 5],
        maxImages: 10
    },

    // Configuración de envíos
    shipping: {
        methods: ['standard', 'express', 'pickup'],
        standardCost: 15,
        expressCost: 25,
        freeShippingThreshold: 150,
        estimatedDays: {
            standard: 3,
            express: 1,
            pickup: 0
        }
    },

    // Configuración de pagos
    payments: {
        methods: ['card', 'cash', 'transfer'],
        minAmount: 10,
        maxAmount: 10000,
        currency: 'PEN'
    },

    // Configuración de reseñas
    reviews: {
        minRating: 1,
        maxRating: 5,
        minCommentLength: 10,
        maxCommentLength: 500,
        allowEdit: true,
        editTimeLimit: 24 * 60 * 60 * 1000 // 24 horas
    },

    // Configuración de usuarios
    users: {
        minNameLength: 2,
        maxNameLength: 80,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        requireEmailVerification: false,
        allowSocialLogin: true,
        providers: ['google']
    },

    // Configuración de gamificación
    gamification: {
        enabled: true,
        levels: [
            { level: 1, name: 'Semilla 🌱', xp: 0 },
            { level: 2, name: 'Brote 🌿', xp: 100 },
            { level: 3, name: 'Planta 🪴', xp: 500 },
            { level: 4, name: 'Árbol 🌳', xp: 1000 },
            { level: 5, name: 'Bosque 🌲', xp: 5000 }
        ],
        actions: {
            purchase: { xp: 10, ecoPoints: 1 },
            review: { xp: 5, ecoPoints: 1 },
            favorite: { xp: 1, ecoPoints: 0 },
            publish: { xp: 20, ecoPoints: 2 }
        }
    },

    // Configuración de caché
    cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutos
        maxSize: 100, // número máximo de items
        storage: 'localStorage' // 'localStorage' | 'sessionStorage' | 'memory'
    },

    // Configuración de API
    api: {
        timeout: 10000, // 10 segundos
        retryAttempts: 3,
        retryDelay: 1000,
        baseUrl: '/api',
        version: 'v1'
    },

    // Configuración de desarrollo
    development: {
        mockApi: false,
        mockData: false,
        verboseLogging: false,
        hotReload: false
    },

    // Configuración de SEO
    seo: {
        enabled: true,
        defaultTitle: 'EcoMarket - Marketplace Ecológico',
        defaultDescription: 'Compra y vende productos sostenibles en el marketplace ecológico más grande.',
        defaultKeywords: 'ecommerce, eco, sostenible, reciclado, marketplace',
        ogImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=630&fit=crop'
    },

    // Configuración de accesibilidad
    accessibility: {
        skipToContent: true,
        highContrastMode: false,
        reducedMotion: false,
        fontSize: 'medium', // 'small' | 'medium' | 'large' | 'extra-large'
        screenReader: false
    },

    // Configuración de performance
    performance: {
        lazyLoadImages: true,
        lazyLoadComponents: false,
        prefetchLinks: true,
        preloadCriticalResources: true,
        serviceWorker: true
    },

    // Configuración de errores
    errors: {
        showToasts: true,
        logToConsole: true,
        sendToServer: true,
        maxStackFrames: 10
    },

    // Configuración de funciones experimentales
    experimental: {
        aiChat: false,
        arView: false,
        voiceSearch: false,
        smartRecommendations: false
    }
};

// Función para obtener configuración
function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = EcoMarketConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

// Función para establecer configuración (solo en desarrollo)
function setConfig(path, value) {
    if (EcoMarketConfig.app.environment !== 'development') {
        console.warn('Config changes are only allowed in development mode');
        return false;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = EcoMarketConfig;

    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }

    target[lastKey] = value;
    return true;
}

// Función para validar configuración
function validateConfig() {
    const errors = [];

    // Validar configuración requerida
    if (!EcoMarketConfig.app.name) {
        errors.push('app.name is required');
    }

    if (!EcoMarketConfig.app.apiUrl) {
        errors.push('app.apiUrl is required');
    }

    // Validar rangos numéricos
    if (EcoMarketConfig.images.maxFileSize <= 0) {
        errors.push('images.maxFileSize must be positive');
    }

    if (EcoMarketConfig.pagination.defaultItemsPerPage <= 0) {
        errors.push('pagination.defaultItemsPerPage must be positive');
    }

    if (EcoMarketConfig.reviews.minRating < 1 || EcoMarketConfig.reviews.maxRating > 5) {
        errors.push('reviews.rating must be between 1 and 5');
    }

    return errors;
}

// Inicializar configuración
function initConfig() {
    // Detectar entorno
    EcoMarketConfig.app.environment = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' 
            ? 'development' 
            : 'production';

    // Detectar preferencias del sistema
    if (EcoMarketConfig.themes.followSystem) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            EcoMarketConfig.themes.defaultTheme = 'dark';
        }
    }

    // Detectar idioma del navegador
    if (EcoMarketConfig.i18n.autoDetect) {
        const browserLang = navigator.language.split('-')[0];
        if (EcoMarketConfig.i18n.availableLanguages.includes(browserLang)) {
            EcoMarketConfig.i18n.defaultLanguage = browserLang;
        }
    }

    // Validar configuración
    const errors = validateConfig();
    if (errors.length > 0) {
        console.error('Configuration errors:', errors);
    }

    // Exponer configuración globalmente
    window.EcoMarketConfig = EcoMarketConfig;
    window.getConfig = getConfig;
    window.setConfig = setConfig;

    if (EcoMarketConfig.app.debug) {
        console.log('EcoMarket Config initialized:', EcoMarketConfig);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfig);
} else {
    initConfig();
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EcoMarketConfig,
        getConfig,
        setConfig,
        validateConfig,
        initConfig
    };
}