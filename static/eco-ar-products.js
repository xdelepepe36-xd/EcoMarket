/**
 * eco-ar-products.js - Sistema de Realidad Aumentada para productos
 * 
 * Funcionalidades:
 - Ver productos en 3D en tu espacio real
 - AR para muebles y plantas
 - Visualizacion con camara
 - Ajuste de tamaño y posicion
 - Captura de screenshots
 - Soporte para modelos 3D
 - Compatible con navegadores modernos
 */

class EcoARProducts {
    constructor(options = {}) {
        this.options = {
            enableAR: options.enableAR !== false,
            enable3D: options.enable3D !== false,
            storageKey: options.storageKey || 'ecomarket_ar',
            ...options
        };
        
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.currentProduct = null;
        this.productSize = 1;
        this.productPosition = { x: 0, y: 0 };
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        this.createARUI();
        this.setupEventListeners();
    }
    
    createARUI() {
        const container = document.querySelector('[data-eco-ar]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-ar-products">
                <div class="eco-ar-header">
                    <h3>Realidad Aumentada</h3>
                    <p>Visualiza productos en tu espacio real</p>
                </div>
                
                <div class="eco-ar-viewer" data-ar-viewer>
                    <div class="eco-ar-placeholder">
                        <i class="bi bi-camera-video"></i>
                        <p>Selecciona un producto para ver en AR</p>
                        <button class="eco-btn-eco" data-start-ar>
                            <i class="bi bi-camera"></i>
                            Iniciar AR
                        </button>
                    </div>
                    
                    <video class="eco-ar-video" data-ar-video autoplay playsinline style="display: none;"></video>
                    <canvas class="eco-ar-canvas" data-ar-canvas style="display: none;"></canvas>
                    
                    <div class="eco-ar-controls" data-ar-controls style="display: none;">
                        <div class="eco-ar-control-group">
                            <label>Tamaño</label>
                            <input type="range" data-ar-size min="0.5" max="2" step="0.1" value="1">
                        </div>
                        <div class="eco-ar-control-group">
                            <label>Posición X</label>
                            <input type="range" data-ar-pos-x min="-200" max="200" step="10" value="0">
                        </div>
                        <div class="eco-ar-control-group">
                            <label>Posición Y</label>
                            <input type="range" data-ar-pos-y min="-200" max="200" step="10" value="0">
                        </div>
                        <div class="eco-ar-actions">
                            <button class="eco-btn-secondary" data-ar-screenshot>
                                <i class="bi bi-camera"></i>
                                Capturar
                            </button>
                            <button class="eco-btn-secondary" data-ar-close>
                                <i class="bi bi-x"></i>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="eco-ar-products-list" data-ar-products-list>
                    <h4>Productos compatibles con AR</h4>
                    <div class="eco-ar-products-grid">
                        <!-- Los productos se renderizarán aquí -->
                    </div>
                </div>
            </div>
        `;
        
        this.renderCompatibleProducts();
    }
    
    renderCompatibleProducts() {
        const products = [
            { id: 1, name: 'Maceta Reciclada', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200', category: 'Jardín' },
            { id: 2, name: 'Taza de Cerámica', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200', category: 'Hogar' },
            { id: 3, name: 'Lámpara Solar', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', category: 'Jardín' },
            { id: 4, name: 'Maceta Colgante', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200', category: 'Jardín' },
            { id: 5, name: 'Organizador Bambú', image: 'https://images.unsplash.com/photo-1506439253660-9e3e57e43b68?w=200', category: 'Hogar' },
            { id: 6, name: 'Lámpara de Mesa', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200', category: 'Hogar' }
        ];
        
        const grid = document.querySelector('.eco-ar-products-grid');
        if (!grid) return;
        
        grid.innerHTML = products.map(product => `
            <div class="eco-ar-product-card" data-ar-product="${product.id}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="eco-ar-product-info">
                    <h5>${product.name}</h5>
                    <span class="eco-ar-category">${product.category}</span>
                </div>
                <button class="eco-view-ar-btn" data-view-ar="${product.id}">
                    <i class="bi bi-camera"></i>
                    Ver en AR
                </button>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Iniciar AR
        document.querySelector('[data-start-ar]')?.addEventListener('click', () => {
            this.startAR();
        });
        
        // Ver producto en AR
        document.querySelectorAll('[data-view-ar]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.viewAr;
                this.viewProductInAR(productId);
            });
        });
        
        // Controles AR
        document.querySelector('[data-ar-size]')?.addEventListener('input', (e) => {
            this.productSize = parseFloat(e.target.value);
            this.updateARView();
        });
        
        document.querySelector('[data-ar-pos-x]')?.addEventListener('input', (e) => {
            this.productPosition.x = parseInt(e.target.value);
            this.updateARView();
        });
        
        document.querySelector('[data-ar-pos-y]')?.addEventListener('input', (e) => {
            this.productPosition.y = parseInt(e.target.value);
            this.updateARView();
        });
        
        // Screenshot
        document.querySelector('[data-ar-screenshot]')?.addEventListener('click', () => {
            this.captureScreenshot();
        });
        
        // Cerrar AR
        document.querySelector('[data-ar-close]')?.addEventListener('click', () => {
            this.stopAR();
        });
    }
    
    async startAR() {
        try {
            // Solicitar acceso a la cámara
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            this.video = document.querySelector('[data-ar-video]');
            this.canvas = document.querySelector('[data-ar-canvas]');
            this.ctx = this.canvas.getContext('2d');
            
            this.video.srcObject = stream;
            this.video.style.display = 'block';
            this.canvas.style.display = 'block';
            
            // Configurar canvas
            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;
            
            // Ocultar placeholder y mostrar controles
            document.querySelector('.eco-ar-placeholder').style.display = 'none';
            document.querySelector('[data-ar-controls]').style.display = 'block';
            
            this.isInitialized = true;
            this.renderARLoop();
            
        } catch (error) {
            console.error('Error iniciando AR:', error);
            alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
        }
    }
    
    viewProductInAR(productId) {
        const products = [
            { id: 1, name: 'Maceta Reciclada', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400' },
            { id: 2, name: 'Taza de Cerámica', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400' },
            { id: 3, name: 'Lámpara Solar', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
            { id: 4, name: 'Maceta Colgante', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400' },
            { id: 5, name: 'Organizador Bambú', image: 'https://images.unsplash.com/photo-1506439253660-9e3e57e43b68?w=400' },
            { id: 6, name: 'Lámpara de Mesa', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' }
        ];
        
        this.currentProduct = products.find(p => p.id === parseInt(productId));
        
        if (!this.isInitialized) {
            this.startAR();
        } else {
            this.updateARView();
        }
    }
    
    renderARLoop() {
        if (!this.isInitialized) return;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar video
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar producto si está seleccionado
        if (this.currentProduct) {
            this.drawProduct();
        }
        
        requestAnimationFrame(() => this.renderARLoop());
    }
    
    drawProduct() {
        const img = new Image();
        img.src = this.currentProduct.image;
        
        const centerX = this.canvas.width / 2 + this.productPosition.x;
        const centerY = this.canvas.height / 2 + this.productPosition.y;
        const size = 200 * this.productSize;
        
        // Dibujar sombra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY + size / 2, size / 2, size / 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Dibujar producto
        this.ctx.drawImage(img, centerX - size / 2, centerY - size / 2, size, size);
        
        // Dibujar borde
        this.ctx.strokeStyle = 'rgba(46, 125, 50, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
    }
    
    updateARView() {
        // La actualización se hace en el render loop
    }
    
    captureScreenshot() {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = `eco-ar-screenshot-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        
        // Notificación
        alert('Screenshot guardado exitosamente');
    }
    
    stopAR() {
        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        this.isInitialized = false;
        this.currentProduct = null;
        
        if (this.video) {
            this.video.style.display = 'none';
        }
        
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
        
        document.querySelector('.eco-ar-placeholder').style.display = 'block';
        document.querySelector('[data-ar-controls]').style.display = 'none';
    }
    
    destroy() {
        this.stopAR();
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const arContainer = document.querySelector('[data-eco-ar]');
    if (arContainer && arContainer.dataset.ecoAr !== 'false') {
        window.ecoARProducts = new EcoARProducts({
            ...arContainer.dataset
        });
    }
});