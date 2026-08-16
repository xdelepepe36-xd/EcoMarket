/**
 * eco-weather-contextual.js - Sistema de clima y productos contextuales
 * 
 * Funcionalidades:
 - Widget del clima integrado
 - Productos recomendados segun clima
 - Impacto ambiental del clima
 - Adapatacion de UI segun clima
 - Historial de clima
 - Predicciones meteorologicas
 */

class EcoWeatherContextual {
    constructor(options = {}) {
        this.options = {
            apiKey: options.apiKey || '',
            storageKey: options.storageKey || 'ecomarket_weather',
            enableRecommendations: options.enableRecommendations !== false,
            ...options
        };
        
        this.currentWeather = null;
        this.weatherHistory = [];
        
        this.init();
    }
    
    init() {
        this.createWeatherUI();
        this.loadWeatherData();
        this.setupEventListeners();
    }
    
    createWeatherUI() {
        const container = document.querySelector('[data-eco-weather]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-weather-contextual">
                <div class="eco-weather-widget" data-weather-widget>
                    <div class="eco-weather-header">
                        <h3>Clima Actual</h3>
                        <span class="eco-weather-location" data-weather-location>Cargando...</span>
                    </div>
                    
                    <div class="eco-weather-main">
                        <div class="eco-weather-icon" data-weather-icon>
                            <i class="bi bi-cloud"></i>
                        </div>
                        <div class="eco-weather-temp" data-weather-temp>--°C</div>
                        <div class="eco-weather-desc" data-weather-desc>Cargando...</div>
                    </div>
                    
                    <div class="eco-weather-details">
                        <div class="eco-weather-detail">
                            <i class="bi bi-droplet"></i>
                            <span data-weather-humidity>--%</span>
                            <span>Humedad</span>
                        </div>
                        <div class="eco-weather-detail">
                            <i class="bi bi-wind"></i>
                            <span data-weather-wind>-- km/h</span>
                            <span>Viento</span>
                        </div>
                        <div class="eco-weather-detail">
                            <i class="bi bi-thermometer"></i>
                            <span data-weather-feels-like>--°C</span>
                            <span>Sensación</span>
                        </div>
                    </div>
                </div>
                
                <div class="eco-weather-recommendations" data-weather-recommendations>
                    <h4>Productos Recomendados</h4>
                    <div class="eco-recommended-products" data-recommended-products>
                        ${this.renderRecommendedProducts()}
                    </div>
                </div>
                
                <div class="eco-weather-impact" data-weather-impact>
                    <h4>Impacto Ambiental</h4>
                    <div class="eco-impact-info">
                        <p data-weather-impact-text>Cargando datos de impacto...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderRecommendedProducts() {
        // Productos recomendados según clima (simulado)
        const recommendations = [
            { id: 1, name: 'Botella Térmica', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200', reason: 'Perfecto para días calurosos' },
            { id: 2, name: 'Sombrero Ecológico', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=200', reason: 'Protección solar' },
            { id: 3, name: 'Chaqueta Impermeable', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200', reason: 'Ideal para días lluviosos' }
        ];
        
        return recommendations.map(product => `
            <div class="eco-weather-product-card">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="eco-product-info">
                    <h5>${product.name}</h5>
                    <span class="eco-product-reason">${product.reason}</span>
                </div>
            </div>
        `).join('');
    }
    
    async loadWeatherData() {
        try {
            // Intentar obtener ubicación del usuario
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.fetchWeather(position.coords.latitude, position.coords.longitude);
                    },
                    () => {
                        this.setMockWeather();
                    }
                );
            } else {
                this.setMockWeather();
            }
        } catch (error) {
            console.error('Error cargando clima:', error);
            this.setMockWeather();
        }
    }
    
    async fetchWeather(lat, lon) {
        try {
            // En producción, usarías una API real como OpenWeatherMap
            // Aquí simulamos la respuesta
            this.setMockWeather(lat, lon);
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.setMockWeather();
        }
    }
    
    setMockWeather(lat = 0, lon = 0) {
        // Simular datos del clima
        const weatherTypes = [
            { type: 'sunny', icon: 'bi-sun', desc: 'Soleado', temp: 28 },
            { type: 'cloudy', icon: 'bi-cloud', desc: 'Nublado', temp: 22 },
            { type: 'rainy', icon: 'bi-cloud-rain', desc: 'Lluvia', temp: 18 },
            { type: 'partly-cloudy', icon: 'bi-cloud-sun', desc: 'Parcialmente nublado', temp: 25 }
        ];
        
        const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        this.currentWeather = {
            type: weather.type,
            icon: weather.icon,
            description: weather.desc,
            temperature: weather.temp,
            humidity: 60 + Math.floor(Math.random() * 30),
            wind: 5 + Math.floor(Math.random() * 20),
            feelsLike: weather.temp + (Math.random() > 0.5 ? 2 : -2),
            location: 'Lima, Perú'
        };
        
        this.updateWeatherUI();
        this.updateRecommendations();
        this.updateImpact();
    }
    
    updateWeatherUI() {
        if (!this.currentWeather) return;
        
        const widget = document.querySelector('[data-weather-widget]');
        if (!widget) return;
        
        document.querySelector('[data-weather-location]').textContent = this.currentWeather.location;
        document.querySelector('[data-weather-icon]').innerHTML = `<i class="bi ${this.currentWeather.icon}"></i>`;
        document.querySelector('[data-weather-temp]').textContent = `${this.currentWeather.temperature}°C`;
        document.querySelector('[data-weather-desc]').textContent = this.currentWeather.description;
        document.querySelector('[data-weather-humidity]').textContent = `${this.currentWeather.humidity}%`;
        document.querySelector('[data-weather-wind]').textContent = `${this.currentWeather.wind} km/h`;
        document.querySelector('[data-weather-feels-like]').textContent = `${this.currentWeather.feelsLike}°C`;
        
        // Adaptar UI según clima
        this.adaptUIToWeather();
    }
    
    adaptUIToWeather() {
        const body = document.body;
        
        // Remover clases anteriores
        body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-partly-cloudy');
        
        // Agregar clase según clima
        body.classList.add(`weather-${this.currentWeather.type}`);
    }
    
    updateRecommendations() {
        if (!this.currentWeather) return;
        
        const container = document.querySelector('[data-recommended-products]');
        if (!container) return;
        
        let recommendations = [];
        
        if (this.currentWeather.type === 'sunny' || this.currentWeather.type === 'partly-cloudy') {
            recommendations = [
                { id: 1, name: 'Botella Térmica', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200', reason: 'Perfecto para días calurosos' },
                { id: 2, name: 'Sombrero Ecológico', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=200', reason: 'Protección solar' },
                { id: 3, name: 'Protector Solar', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200', reason: 'Protección UV' }
            ];
        } else if (this.currentWeather.type === 'rainy') {
            recommendations = [
                { id: 1, name: 'Chaqueta Impermeable', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200', reason: 'Ideal para días lluviosos' },
                { id: 2, name: 'Paraguas Ecológico', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200', reason: 'Protección lluvia' },
                { id: 3, name: 'Botas Ecológicas', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200', reason: 'Calzado impermeable' }
            ];
        } else {
            recommendations = [
                { id: 1, name: 'Suéter de Algodón', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200', reason: 'Comodidad en días nublados' },
                { id: 2, name: 'Bufanda Ecológica', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=200', reason: 'Accesorio versátil' },
                { id: 3, name: 'Guantes de Bambú', image: 'https://images.unsplash.com/photo-1609367466231-5c3223a92b1a?w=200', reason: 'Material natural' }
            ];
        }
        
        container.innerHTML = recommendations.map(product => `
            <div class="eco-weather-product-card">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="eco-product-info">
                    <h5>${product.name}</h5>
                    <span class="eco-product-reason">${product.reason}</span>
                </div>
            </div>
        `).join('');
    }
    
    updateImpact() {
        if (!this.currentWeather) return;
        
        const container = document.querySelector('[data-weather-impact-text]');
        if (!container) return;
        
        let impactText = '';
        
        if (this.currentWeather.type === 'sunny') {
            impactText = '¡El sol brilla! Es el momento perfecto para productos solares y accesorios al aire libre. Ahorra energía aprovechando la luz natural.';
        } else if (this.currentWeather.type === 'rainy') {
            impactText = 'Día lluvioso: productos impermeables y de interior son ideales. Aprovecha para organizar tu hogar de forma ecológica.';
        } else {
            impactText = 'Clima templado: perfecto para todas las actividades al aire libre. Elige productos que se adapten a tu rutina diaria.';
        }
        
        container.textContent = impactText;
    }
    
    setupEventListeners() {
        // Refrescar clima
        document.addEventListener('weather:refresh', () => {
            this.loadWeatherData();
        });
    }
    
    getCurrentWeather() {
        return this.currentWeather;
    }
    
    destroy() {
        document.removeEventListener('weather:refresh', () => this.loadWeatherData());
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const weatherContainer = document.querySelector('[data-eco-weather]');
    if (weatherContainer && weatherContainer.dataset.ecoWeather !== 'false') {
        window.ecoWeatherContextual = new EcoWeatherContextual({
            ...weatherContainer.dataset
        });
    }
});