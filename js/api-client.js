/**
 * EcoMarket - API Client
 * Cliente HTTP unificado para comunicarse con el backend
 */

class EcoMarketAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    /**
     * Construye la URL completa para un endpoint
     */
    buildURL(endpoint) {
        return `${this.baseURL}${endpoint}`;
    }

    /**
     * Obtiene los headers por defecto más headers adicionales
     */
    getHeaders(additionalHeaders = {}) {
        return {
            ...this.defaultHeaders,
            ...additionalHeaders
        };
    }

    /**
     * Maneja errores de respuesta
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
        }
        return response.json();
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        const url = this.buildURL(endpoint);
        const config = {
            method: 'GET',
            headers: this.getHeaders(options.headers),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}, options = {}) {
        const url = this.buildURL(endpoint);
        const config = {
            method: 'POST',
            headers: this.getHeaders(options.headers),
            body: JSON.stringify(data),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('POST request error:', error);
            throw error;
        }
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}, options = {}) {
        const url = this.buildURL(endpoint);
        const config = {
            method: 'PUT',
            headers: this.getHeaders(options.headers),
            body: JSON.stringify(data),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('PUT request error:', error);
            throw error;
        }
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        const url = this.buildURL(endpoint);
        const config = {
            method: 'DELETE',
            headers: this.getHeaders(options.headers),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('DELETE request error:', error);
            throw error;
        }
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = {}, options = {}) {
        const url = this.buildURL(endpoint);
        const config = {
            method: 'PATCH',
            headers: this.getHeaders(options.headers),
            body: JSON.stringify(data),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('PATCH request error:', error);
            throw error;
        }
    }

    /**
     * FormData request (para subida de archivos)
     */
    async upload(endpoint, formData, options = {}) {
        const url = this.buildURL(endpoint);
        const headers = { ...options.headers };
        delete headers['Content-Type']; // Dejar que el navegador establezca el boundary
        
        const config = {
            method: 'POST',
            headers: this.getHeaders(headers),
            body: formData,
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Upload request error:', error);
            throw error;
        }
    }
}

// Instancia global del API client
const api = new EcoMarketAPI();

// Endpoints específicos de EcoMarket
const EcoMarketEndpoints = {
    // Productos
    productos: '/api/productos',
    producto: (id) => `/api/productos/${id}`,
    productosSearch: '/api/productos/search',
    productosCategoria: (categoria) => `/api/productos?categoria=${categoria}`,
    
    // Carrito
    carrito: '/api/carrito',
    carritoAdd: '/api/carrito/add',
    carritoRemove: '/api/carrito/remove',
    carritoUpdate: '/api/carrito/update',
    carritoClear: '/api/carrito/clear',
    
    // Favoritos
    favoritos: '/api/favoritos',
    favoritoAdd: (id) => `/api/favoritos/${id}/add`,
    favoritoRemove: (id) => `/api/favoritos/${id}/remove`,
    
    // Reseñas
    resenas: (productoId) => `/api/productos/${productoId}/resenas`,
    resenaAdd: (productoId) => `/api/productos/${productoId}/resenas`,
    resenaVote: (resenaId) => `/api/resenas/${resenaId}/voto`,
    
    // Usuario
    perfil: '/api/perfil',
    perfilUpdate: '/api/perfil/update',
    passwordUpdate: '/api/perfil/password',
    
    // Admin
    adminStats: '/api/admin/stats',
    adminUsers: '/api/admin/users',
    adminProductos: '/api/admin/productos',
    
    // AI Chat
    aiChat: '/api/chat',
    aiDescribe: (id) => `/api/describe/${id}`
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcoMarketAPI, api, EcoMarketEndpoints };
}