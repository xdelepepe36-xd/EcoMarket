/**
 * eco-cache.js - Sistema de caché simple para EcoMarket
 * 
 * Funcionalidades:
 * - Caché en memoria con TTL
 * - Caché en localStorage
 * - Caché en sessionStorage
 * - Invalidación automática
 * - Compresión de datos
 * - Estadísticas de caché
 * - Prefetching inteligente
 */

class EcoCache {
    constructor(options = {}) {
        this.options = {
            defaultTTL: options.defaultTTL || 300000, // 5 minutos
            maxSize: options.maxSize || 100, // máximo de items
            enableStats: options.enableStats !== false,
            enableCompression: options.enableCompression !== false,
            storageType: options.storageType || 'memory', // memory, localStorage, sessionStorage
            prefix: options.prefix || 'ecomarket_',
            ...options
        };
        
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
        
        this.init();
    }
    
    init() {
        // Cargar caché persistente si se especifica
        if (this.options.storageType !== 'memory') {
            this.loadFromStorage();
        }
        
        // Configurar limpieza periódica
        this.startCleanupInterval();
    }
    
    set(key, value, ttl = null) {
        const effectiveTTL = ttl || this.options.defaultTTL;
        const expiry = Date.now() + effectiveTTL;
        
        // Comprimir datos si está habilitado
        let data = value;
        if (this.options.enableCompression && typeof value === 'object') {
            data = this.compressData(value);
        }
        
        const cacheItem = {
            data: data,
            expiry: expiry,
            size: this.calculateSize(data),
            compressed: this.options.enableCompression && typeof value === 'object'
        };
        
        // Evict si excede el tamaño máximo
        if (this.cache.size >= this.options.maxSize) {
            this.evictLRU();
        }
        
        this.cache.set(key, cacheItem);
        this.stats.sets++;
        
        // Guardar en storage persistente
        if (this.options.storageType !== 'memory') {
            this.saveToStorage();
        }
    }
    
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            this.stats.misses++;
            return null;
        }
        
        // Verificar expiración
        if (Date.now() > item.expiry) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }
        
        // Descomprimir datos si es necesario
        let data = item.data;
        if (item.compressed) {
            data = this.decompressData(data);
        }
        
        this.stats.hits++;
        
        // Actualizar posición LRU
        this.cache.delete(key);
        this.cache.set(key, item);
        
        return data;
    }
    
    has(key) {
        return this.cache.has(key) && this.get(key) !== null;
    }
    
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
            if (this.options.storageType !== 'memory') {
                this.saveToStorage();
            }
        }
        return deleted;
    }
    
    clear() {
        this.cache.clear();
        if (this.options.storageType !== 'memory') {
            this.clearStorage();
        }
    }
    
    evictLRU() {
        // Evict el item más antiguo (primer item en el Map)
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
            this.cache.delete(firstKey);
            this.stats.evictions++;
        }
    }
    
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0 && this.options.storageType !== 'memory') {
            this.saveToStorage();
        }
        
        return cleaned;
    }
    
    startCleanupInterval() {
        // Limpiar cada minuto
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }
    
    stopCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
    
    compressData(data) {
        try {
            // Simple compresión usando JSON.stringify + base64
            // En producción, usar librerías como lz-string
            const json = JSON.stringify(data);
            return btoa(json);
        } catch (error) {
            console.error('Error comprimiendo datos:', error);
            return data;
        }
    }
    
    decompressData(data) {
        try {
            const json = atob(data);
            return JSON.parse(json);
        } catch (error) {
            console.error('Error descomprimiendo datos:', error);
            return data;
        }
    }
    
    calculateSize(data) {
        if (typeof data === 'string') {
            return data.length;
        } else if (typeof data === 'object') {
            return JSON.stringify(data).length;
        }
        return 1;
    }
    
    getStats() {
        if (!this.options.enableStats) {
            return null;
        }
        
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        
        return {
            ...this.stats,
            size: this.cache.size,
            hitRate: hitRate.toFixed(2) + '%',
            totalRequests: totalRequests
        };
    }
    
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
    }
    
    // Métodos de almacenamiento persistente
    saveToStorage() {
        try {
            const storage = this.options.storageType === 'localStorage' ? localStorage : sessionStorage;
            const cacheData = Array.from(this.cache.entries());
            storage.setItem(this.options.prefix + 'cache', JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error guardando caché en storage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const storage = this.options.storageType === 'localStorage' ? localStorage : sessionStorage;
            const cacheData = storage.getItem(this.options.prefix + 'cache');
            
            if (cacheData) {
                const parsed = JSON.parse(cacheData);
                this.cache = new Map(parsed);
            }
        } catch (error) {
            console.error('Error cargando caché desde storage:', error);
        }
    }
    
    clearStorage() {
        try {
            const storage = this.options.storageType === 'localStorage' ? localStorage : sessionStorage;
            storage.removeItem(this.options.prefix + 'cache');
        } catch (error) {
            console.error('Error limpiando storage:', error);
        }
    }
    
    // Métodos de prefetching
    async prefetch(urls) {
        const prefetchPromises = urls.map(url => this.prefetchURL(url));
        await Promise.allSettled(prefetchPromises);
    }
    
    async prefetchURL(url) {
        try {
            const cacheKey = 'prefetch_' + this.hashURL(url);
            
            if (this.has(cacheKey)) {
                return;
            }
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.text();
                this.set(cacheKey, data, 600000); // 10 minutos
            }
        } catch (error) {
            console.error('Error prefetching URL:', url, error);
        }
    }
    
    hashURL(url) {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    
    // Método para caché de API responses
    async fetchWithCache(url, options = {}) {
        const cacheKey = 'api_' + this.hashURL(url + JSON.stringify(options));
        
        // Intentar obtener de caché
        const cached = this.get(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Si no está en caché, hacer la petición
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            // Guardar en caché
            this.set(cacheKey, data, options.ttl || this.options.defaultTTL);
            
            return data;
        } catch (error) {
            console.error('Error en fetch con caché:', error);
            throw error;
        }
    }
    
    // Método para caché de imágenes
    async cacheImage(url) {
        const cacheKey = 'image_' + this.hashURL(url);
        
        if (this.has(cacheKey)) {
            return this.get(cacheKey);
        }
        
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            // Convertir a base64 para almacenamiento
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                this.set(cacheKey, base64data, 3600000); // 1 hora
            };
            reader.readAsDataURL(blob);
            
            return url; // Retornar URL original mientras carga
        } catch (error) {
            console.error('Error cacheando imagen:', error);
            return url;
        }
    }
    
    destroy() {
        this.stopCleanupInterval();
        this.clear();
    }
}

// Caché global
const ecoCache = new EcoCache({
    defaultTTL: 300000,
    maxSize: 100,
    enableStats: true,
    storageType: 'localStorage'
});

// Helper functions
window.ecoCache = {
    get: (key) => ecoCache.get(key),
    set: (key, value, ttl) => ecoCache.set(key, value, ttl),
    has: (key) => ecoCache.has(key),
    delete: (key) => ecoCache.delete(key),
    clear: () => ecoCache.clear(),
    getStats: () => ecoCache.getStats(),
    fetchWithCache: (url, options) => ecoCache.fetchWithCache(url, options),
    cacheImage: (url) => ecoCache.cacheImage(url),
    prefetch: (urls) => ecoCache.prefetch(urls)
};

// Auto-prefetch de recursos importantes
document.addEventListener('DOMContentLoaded', () => {
    // Prefetch de recursos críticos
    const criticalResources = [
        '/api/productos/destacados',
        '/api/categorias',
        '/api/banners/activos'
    ];
    
    setTimeout(() => {
        window.ecoCache.prefetch(criticalResources);
    }, 1000);
});