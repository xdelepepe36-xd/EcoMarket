# EcoMarket - Documentación Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Backend (Flask)](#backend-flask)
6. [Frontend (JavaScript)](#frontend-javascript)
7. [Base de Datos](#base-de-datos)
8. [API Documentation](#api-documentation)
9. [Sistema de Seguridad](#sistema-de-seguridad)
10. [Sistema de Optimizaciones](#sistema-de-optimizaciones)
11. [Testing](#testing)
12. [Despliegue](#despliegue)
13. [Guía de Desarrollo](#guía-de-desarrollo)
14. [Troubleshooting](#troubleshooting)

---

## Introducción

EcoMarket es un marketplace ecológico completo desarrollado con Flask (Python) y JavaScript puro. Permite a los usuarios comprar y vender productos sostenibles con características avanzadas como gamificación, reviews, búsqueda avanzada y más.

### Características Principales

- **Marketplace Ecológico**: Compra y venta de productos sostenibles
- **Sistema de Usuarios**: Registro, login, perfiles, gamificación
- **Gestión de Productos**: Publicación, edición, categorías, stock
- **Sistema de Reviews**: Valoraciones, comentarios, filtros
- **Búsqueda Avanzada**: Búsqueda inteligente con filtros y sugerencias
- **Carrito de Compras**: Gestión completa de compras
- **Favoritos**: Lista de deseos personalizada
- **Sistema de Temas**: 8 temas diferentes (light, dark, sepia, nature, ocean, midnight, rose, high-contrast)
- **Gamificación**: Niveles, XP, logros, desafíos
- **Optimización de Imágenes**: Compresión automática, thumbnails, responsive
- **Seguridad Avanzada**: CSRF, XSS protection, rate limiting
- **Performance**: Caching, connection pooling, lazy loading

### Version

- **Versión Actual**: v3.0
- **Última Actualización**: 2026-08-25
- **Python**: 3.8+
- **Flask**: 2.0+
- **JavaScript**: ES6+

---

## Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     EcoMarket Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │  Database    │  │
│  │              │    │              │    │              │  │
│  │  • HTML/CSS  │◄──►│  • Flask     │◄──►│  • SQLite    │  │
│  │  • JavaScript│    │  • Python    │    │  • Tablas    │  │
│  │  • Modules   │    │  • Routes    │    │  • Índices   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │            │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Static     │    │ Optimizations│    │   Storage    │  │
│  │              │    │              │    │              │  │
│  │  • CSS/JS    │    │  • Caching   │    │  • Uploads   │  │
│  │  • Images    │    │  • Pooling   │    │  • Cache     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales

#### Frontend
- **HTML**: Plantillas Jinja2 en `templates/`
- **CSS**: Archivos optimizados en `static/`
- **JavaScript**: Módulos organizados en `static/`

#### Backend
- **Flask**: Framework web principal
- **SQLite**: Base de datos relacional
- **PIL**: Procesamiento de imágenes
- **Werkzeug**: Seguridad y utilidades

#### Optimizaciones
- **Caching**: Sistema de caché en memoria
- **Connection Pooling**: Pool de conexiones a DB
- **Rate Limiting**: Protección contra abusos
- **Image Optimization**: Compresión automática

---

## Instalación y Configuración

### Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Git (opcional)

### Instalación

1. **Clonar el repositorio** (si aplica):
```bash
git clone https://github.com/tu-usuario/ecomarket.git
cd ecomarket
```

2. **Crear entorno virtual**:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**:
```bash
# Windows (PowerShell)
$env:SECRET_KEY = "tu-secret-key-aqui"
$env:DATABASE_URL = "sqlite:///data/ecomarket.db"
$env:UPLOADS_DIR = "static/uploads"

# macOS/Linux
export SECRET_KEY="tu-secret-key-aqui"
export DATABASE_URL="sqlite:///data/ecomarket.db"
export UPLOADS_DIR="static/uploads"
```

5. **Inicializar base de datos**:
```bash
python -c "from app import init_db; init_db()"
```

6. **Ejecutar aplicación**:
```bash
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

### Configuración Avanzada

#### Configuración de Flask (app.py)

```python
# Configuración básica
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configuración de optimizaciones
from app_optimizations import initialize_optimizations
db_pool = initialize_optimizations(DB_PATH)
```

#### Configuración de Base de Datos

```python
# SQLite con optimizaciones
DB_PATH = os.path.join(BASE_DIR, 'data', 'ecomarket.db')

# Opciones adicionales
- journal_mode=WAL (Write-Ahead Logging)
- cache_size=-8000 (8MB de caché)
- foreign_keys=ON (Integridad referencial)
```

---

## Estructura del Proyecto

```
EcoMarket/
├── app.py                      # Aplicación Flask principal
├── app_optimizations.py        # Optimizaciones y mejoras
├── image_optimizer.py          # Sistema de optimización de imágenes
├── requirements.txt            # Dependencias Python
├── pyproject.toml             # Configuración de proyecto
├── data/                      # Datos y base de datos
│   └── ecomarket.db          # Base de datos SQLite
├── static/                    # Archivos estáticos
│   ├── uploads/              # Imágenes subidas
│   ├── ecomarket-consolidated.css  # CSS consolidado
│   ├── ecomarket-consolidated.js   # JS consolidado
│   ├── ecomarket-corrections.js    # Correcciones de errores
│   ├── ecomarket-security-enhanced.js  # Seguridad frontend
│   ├── ecomarket-advanced-search.js   # Búsqueda avanzada
│   ├── ecomarket-reviews-system.js   # Sistema de reviews
│   ├── ecomarket-themes-enhanced.js  # Sistema de temas
│   ├── ecomarket-themes-enhanced.css # Estilos de temas
│   ├── ecomarket-advanced-features.js # Características avanzadas
│   ├── ecomarket-advanced-features.css # Estilos avanzados
│   ├── ecomarket-megaplan.js        # Funcionalidades megaplan
│   ├── ecomarket-dashboard.js       # Dashboard de usuario
│   ├── ecomarket-ultimate.js        # Funcionalidades premium
│   ├── ecomarket-extra.js          # Funcionalidades extra
│   ├── ecomarket-fixes.js          # Correcciones básicas
│   ├── ecomarket-final.js          # JS principal (antiguo)
│   ├── ecomarket-final.css         # CSS principal (antiguo)
│   ├── ecomarket-dashboard.css     # Estilos dashboard
│   ├── ecomarket-ultimate.css     # Estilos premium
│   ├── ecomarket-extra.css         # Estilos extra
│   └── manifest.json              # Manifest PWA
├── templates/                 # Plantillas HTML
│   ├── base.html              # Plantilla base
│   ├── index.html             # Página principal
│   ├── productos.html         # Catálogo de productos
│   ├── detalle-producto.html  # Detalle de producto
│   ├── login.html             # Login
│   ├── registro.html          # Registro
│   ├── perfil.html            # Perfil de usuario
│   ├── carrito.html           # Carrito de compras
│   ├── favoritos.html         # Favoritos
│   ├── publicar.html          # Publicar producto
│   ├── admin.html             # Panel admin
│   ├── contacto.html          # Contacto
│   ├── impacto.html           # Impacto ambiental
│   ├── checkout.html          # Proceso de compra
│   ├── confirmacion.html      # Confirmación de pedido
│   ├── compare.html           # Comparación de productos
│   ├── terminos.html          # Términos y condiciones
│   ├── privacidad.html        # Política de privacidad
│   ├── 404.html               # Página no encontrada
│   └── 500.html               # Error del servidor
├── tests/                     # Tests
│   └── test_app.py           # Tests unitarios
├── .gitignore                # Archivos ignorados por Git
├── README.md                 # Documentación principal
├── ECOMARKET_ERRORES_Y_SOLUCIONES.md  # Análisis de errores
└── DOCUMENTACION_COMPLETA.md # Este archivo
```

---

## Backend (Flask)

### Estructura de app.py

```python
# Importaciones principales
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image

# Configuración
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
```

### Rutas Principales

#### Rutas Públicas
- `GET /` - Página principal
- `GET /productos` - Catálogo de productos
- `GET /productos/<id>` - Detalle de producto
- `GET /contacto` - Página de contacto
- `GET /impacto` - Impacto ambiental

#### Rutas de Autenticación
- `GET /login` - Formulario de login
- `POST /login` - Procesar login
- `GET /registro` - Formulario de registro
- `POST /registro` - Procesar registro
- `GET /logout` - Cerrar sesión

#### Rutas de Usuario
- `GET /perfil` - Perfil de usuario
- `POST /perfil` - Actualizar perfil
- `GET /favoritos` - Lista de favoritos
- `GET /carrito` - Carrito de compras

#### Rutas de Productos
- `GET /publicar` - Formulario de publicación
- `POST /publicar` - Publicar producto
- `POST /productos/<id>/editar` - Editar producto
- `POST /productos/<id>/eliminar` - Eliminar producto

#### Rutas de Admin
- `GET /admin` - Panel administrativo
- `POST /admin/productos` - Gestión de productos
- `POST /admin/usuarios` - Gestión de usuarios

#### Rutas API
- `GET /api/productos` - Listado de productos (JSON)
- `GET /api/productos/<id>` - Detalle de producto (JSON)
- `POST /api/resenas` - Crear review
- `GET /api/resenas/producto/<id>` - Reviews de producto

### Decoradores

#### Decorador de Login Requerido
```python
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            flash('Debes iniciar sesión', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
```

#### Decorador de Admin Requerido
```python
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('rol') != 'admin':
            flash('Acceso restringido', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function
```

### Funciones de Base de Datos

#### Conexión a Base de Datos
```python
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode=WAL")
    return conn
```

#### Inicialización de Base de Datos
```python
def init_db():
    conn = get_db()
    # Crear tablas
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS usuarios (...);
        CREATE TABLE IF NOT EXISTS productos (...);
        CREATE TABLE IF NOT EXISTS resenas (...);
        -- Más tablas...
    ''')
    conn.commit()
    conn.close()
```

---

## Frontend (JavaScript)

### Módulos JavaScript

#### EcoMarket (Módulo Principal)
```javascript
const EcoMarket = {
    version: 'CONSOLIDATED-1.0',
    state: {
        theme: localStorage.getItem('ecomarket-theme') || 'light',
        lang: localStorage.getItem('ecomarket-lang') || 'es'
    },
    init() {
        this.initTheme();
        this.initLang();
        this.initSplashScreen();
    }
};
```

#### EcoThemes (Sistema de Temas)
```javascript
const EcoThemes = {
    themes: {
        light: { name: 'Claro', icon: 'bi-sun' },
        dark: { name: 'Oscuro', icon: 'bi-moon' },
        // ... más temas
    },
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ecomarket-theme', theme);
    }
};
```

#### EcoFavorites (Sistema de Favoritos)
```javascript
const EcoFavorites = {
    favoritos: [],
    toggle(productId) {
        // Agregar/eliminar de favoritos
    },
    esFavorito(productId) {
        return this.favoritos.includes(productId);
    }
};
```

#### EcoCart (Sistema de Carrito)
```javascript
const EcoCart = {
    items: [],
    agregar(producto, cantidad) {
        // Agregar al carrito
    },
    obtenerTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }
};
```

#### EcoSearch (Búsqueda Avanzada)
```javascript
const EcoSearch = {
    state: {
        query: '',
        filters: {},
        results: []
    },
    async performSearch() {
        // Realizar búsqueda con filtros
    }
};
```

#### EcoReviews (Sistema de Reviews)
```javascript
const EcoReviews = {
    async submitReview(form, productId) {
        // Enviar review
    },
    async loadProductReviews(productId) {
        // Cargar reviews
    }
};
```

#### EcoSecurity (Seguridad Frontend)
```javascript
const EcoSecurity = {
    initCSRFProtection() {
        // Protección CSRF
    },
    sanitizeInput(text) {
        // Sanitizar input
    }
};
```

### Sistema de Eventos

#### Eventos Personalizados
```javascript
// Cambio de tema
document.addEventListener('themeChanged', (e) => {
    console.log('Tema cambiado a:', e.detail.theme);
});

// Agregado a favoritos
document.addEventListener('favoriteAdded', (e) => {
    console.log('Producto agregado:', e.detail.productId);
});
```

---

## Base de Datos

### Esquema de Base de Datos

#### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    avatar_color TEXT DEFAULT '#2e7d32',
    banner TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    rol TEXT DEFAULT 'comprador',
    xp INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1,
    rango TEXT DEFAULT 'Semilla 🌱',
    eco_puntos INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: productos
```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio REAL NOT NULL,
    precio_original REAL,
    descripcion TEXT NOT NULL,
    imagen TEXT DEFAULT '',
    imagen_thumb TEXT DEFAULT '',
    stock INTEGER DEFAULT 10,
    condicion TEXT DEFAULT 'nuevo',
    etiquetas TEXT DEFAULT '',
    eco_score INTEGER DEFAULT 0,
    especificaciones TEXT DEFAULT '',
    usuario_id INTEGER,
    ubicacion TEXT DEFAULT '',
    vistas INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

#### Tabla: resenas
```sql
CREATE TABLE resenas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    usuario_id INTEGER,
    nombre TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comentario TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

#### Tabla: favoritos
```sql
CREATE TABLE favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

#### Tabla: pedidos
```sql
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    direccion TEXT NOT NULL,
    total REAL NOT NULL,
    estado TEXT DEFAULT 'confirmado',
    metodo_pago TEXT DEFAULT '',
    ciudad TEXT DEFAULT '',
    telefono TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

### Índices

```sql
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_usuario ON productos(usuario_id);
CREATE INDEX idx_resenas_producto ON resenas(producto_id);
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
```

---

## API Documentation

### Endpoints Principales

#### Productos

**GET /api/productos**
```json
{
    "success": true,
    "productos": [
        {
            "id": 1,
            "nombre": "Botella Ecológica",
            "categoria": "Hogar",
            "precio": 45.00,
            "imagen": "/static/uploads/botella.jpg",
            "eco_score": 85
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 12,
        "total": 79
    }
}
```

**GET /api/productos/<id>**
```json
{
    "success": true,
    "producto": {
        "id": 1,
        "nombre": "Botella Ecológica",
        "descripcion": "Botella reutilizable...",
        "precio": 45.00,
        "stock": 15,
        "vendedor": {
            "id": 5,
            "nombre": "Eco Seller"
        }
    }
}
```

#### Reviews

**POST /api/resenas**
```json
{
    "producto_id": 1,
    "rating": 5,
    "comentario": "Excelente producto"
}
```

**GET /api/resenas/producto/<id>**
```json
{
    "success": true,
    "reviews": [
        {
            "id": 1,
            "nombre": "Juan Pérez",
            "rating": 5,
            "comentario": "Excelente",
            "created_at": "2026-08-25T10:00:00"
        }
    ]
}
```

#### Búsqueda

**GET /api/productos/buscar**
```
Query params:
- q: término de búsqueda
- categoria: filtro de categoría
- precio_min: precio mínimo
- precio_max: precio máximo
- eco_score_min: eco-score mínimo
- sort_by: campo de ordenamiento
- sort_dir: dirección (asc/desc)
```

### Códigos de Error

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Sistema de Seguridad

### Seguridad Backend

#### Protección CSRF
```python
@app.before_request
def csrf_protect():
    if request.method == 'POST' and request.form:
        token = session.get('_csrf_token', '')
        sent = request.form.get('csrf_token', '')
        if not token or not sent or not hmac.compare_digest(token, sent):
            flash('Error de seguridad (CSRF)', 'danger')
            return redirect(request.referrer or url_for('index'))
```

#### Rate Limiting
```python
from app_optimizations import rate_limiter

@app.route('/login', methods=['POST'])
@rate_limit(max_requests=5, window=60)  # 5 intentos por minuto
def login():
    # Lógica de login
```

#### Validación de Contraseñas
```python
def password_strength(password):
    errores = []
    if len(password) < 8:
        errores.append('Debe tener al menos 8 caracteres')
    if not re.search(r'[A-Za-z]', password):
        errores.append('Debe contener letras')
    if not re.search(r'\d', password):
        errores.append('Debe contener al menos un número')
    return len(errores) == 0, errores
```

### Seguridad Frontend

#### Sanitización de Input
```javascript
const EcoSecurity = {
    sanitizeInput(text) {
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi
        ];
        
        dangerousPatterns.forEach(pattern => {
            text = text.replace(pattern, '');
        });
        
        return text;
    }
};
```

#### Protección XSS
```javascript
// Sobrescribir innerHTML para sanitización
const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(html) {
        const sanitized = EcoSecurity.sanitizeHTML(html);
        originalInnerHTML.set.call(this, sanitized);
    }
});
```

#### Timeout de Sesión
```javascript
const EcoSecurity = {
    config: {
        sessionTimeout: 30 * 60 * 1000 // 30 minutos
    },
    checkSessionTimeout() {
        const inactiveTime = Date.now() - this.state.lastActivity;
        if (inactiveTime > this.config.sessionTimeout) {
            this.logoutUser();
        }
    }
};
```

---

## Sistema de Optimizaciones

### Caching

#### Sistema de Caché en Memoria
```python
class SimpleCache:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()
    
    def get(self, key, default=None):
        with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]
                if time.time() < expiry:
                    return value
        return default
    
    def set(self, key, value, ttl=300):
        with self._lock:
            self._cache[key] = (value, time.time() + ttl)
```

#### Decorador de Caché
```python
@cached(ttl=300, key_prefix="productos")
def get_productos_paginados(pagina=1, por_pagina=12):
    # Consulta a base de datos
    return productos
```

### Connection Pooling

#### Pool de Conexiones
```python
class DatabasePool:
    def __init__(self, db_path, pool_size=5):
        self.db_path = db_path
        self.pool_size = pool_size
        self._connections = []
        self._initialize_pool()
    
    @contextmanager
    def get_connection(self):
        conn = None
        try:
            with self._lock:
                if self._connections:
                    conn = self._connections.pop()
                else:
                    conn = self._create_connection()
            yield conn
        finally:
            if conn:
                with self._lock:
                    if len(self._connections) < self.pool_size:
                        self._connections.append(conn)
```

### Optimización de Imágenes

#### Sistema de Optimización
```python
class ImageOptimizer:
    def optimize_image(self, file_path):
        with Image.open(file_path) as img:
            # Redimensionar si es muy grande
            if img.size[0] > 1200 or img.size[1] > 1200:
                img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            
            # Guardar como WebP optimizado
            img.save(output_path, 'WEBP', quality=85, optimize=True)
```

### Performance Monitoring

#### Monitor de Rendimiento
```python
class PerformanceMonitor:
    def record(self, operation, duration):
        if operation not in self._metrics:
            self._metrics[operation] = []
        self._metrics[operation].append(duration)
    
    def get_stats(self, operation):
        durations = self._metrics.get(operation, [])
        return {
            'avg': sum(durations) / len(durations),
            'min': min(durations),
            'max': max(durations)
        }
```

---

## Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
python tests/test_app.py

# Ejecutar tests específicos
python -m pytest tests/test_app.py::TestEcoMarketBasic::test_index_page

# Ejecutar con cobertura
python -m pytest tests/ --cov=app --cov-report=html
```

### Estructura de Tests

```python
class TestEcoMarketBasic(unittest.TestCase):
    def setUp(self):
        # Configuración antes de cada test
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['DATABASE_URL'] = self.db_path
        self.client = app.test_client()
        
        with app.app_context():
            init_db()
    
    def test_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
    
    def test_registro_usuario_valido(self):
        response = self.client.post('/registro', data={
            'nombre': 'Test User',
            'email': 'test@example.com',
            'password': 'TestPassword123'
        })
        self.assertEqual(response.status_code, 200)
```

### Tests Disponibles

- Tests básicos de funcionalidad
- Tests de seguridad
- Tests de caché
- Tests de API
- Tests de autenticación
- Tests de validaciones

---

## Despliegue

### Despliegue Local

```bash
# 1. Configurar entorno virtual
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
export SECRET_KEY="tu-secret-key"
export DATABASE_URL="sqlite:///data/ecomarket.db"

# 4. Inicializar base de datos
python -c "from app import init_db; init_db()"

# 5. Ejecutar aplicación
python app.py
```

### Despliegue en Producción

#### Opción 1: Heroku
```bash
# 1. Instalar Heroku CLI
# 2. Login en Heroku
heroku login

# 3. Crear aplicación
heroku create ecomarket-app

# 4. Configurar variables de entorno
heroku config:set SECRET_KEY="tu-secret-key-produccion"
heroku config:set DATABASE_URL="postgres://..."

# 5. Deploy
git push heroku main
```

#### Opción 2: Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN python -c "from app import init_db; init_db()"

EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
# Construir imagen
docker build -t ecomarket .

# Ejecutar contenedor
docker run -p 5000:5000 ecomarket
```

#### Opción 3: VPS (DigitalOcean, AWS, etc.)
```bash
# 1. Configurar servidor
sudo apt update
sudo apt install python3-pip python3-venv nginx

# 2. Clonar repositorio
git clone <repo-url>
cd ecomarket

# 3. Configurar entorno virtual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configurar Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 5. Configurar Nginx como reverse proxy
# (configuración en /etc/nginx/sites-available/ecomarket)
```

---

## Guía de Desarrollo

### Convenciones de Código

#### Python
- Usar 4 espacios para indentación
- Líneas máximas de 100 caracteres
- Nombres de funciones en snake_case
- Nombres de clases en PascalCase
- Docstrings para todas las funciones públicas

#### JavaScript
- Usar 2 espacios para indentación
- Usar const/let en lugar de var
- Nombres de funciones en camelCase
- Nombres de clases en PascalCase
- JSDoc para funciones públicas

#### CSS
- Usar 2 espacios para indentación
- Nombres de clases en kebab-case
- Variables CSS en kebab-case
- Ordenar propiedades alfabéticamente

### Flujo de Trabajo

1. **Crear rama para feature**
```bash
git checkout -b feature/nueva-funcionalidad
```

2. **Implementar cambios**
- Escribir código
- Escribir tests
- Documentar cambios

3. **Probar cambios**
```bash
python tests/test_app.py
```

4. **Commit changes**
```bash
git add .
git commit -m "Add nueva funcionalidad"
```

5. **Push y crear PR**
```bash
git push origin feature/nueva-funcionalidad
```

### Good Practices

#### Backend
- Usar decoradores para validación
- Implementar manejo de errores robusto
- Usar transacciones para operaciones críticas
- Validar todos los inputs de usuario
- Usar parameters queries para prevenir SQL injection

#### Frontend
- Usar módulos para organizar código
- Implementar lazy loading para mejorar rendimiento
- Sanitizar todos los inputs de usuario
- Usar event delegation cuando sea posible
- Implementar graceful degradation

#### Base de Datos
- Usar índices para consultas frecuentes
- Evitar N+1 queries
- Usar transacciones para operaciones múltiples
- Implementar connection pooling
- Usar tipos de datos apropiados

---

## Troubleshooting

### Problemas Comunes

#### Error: "ModuleNotFoundError"
**Solución:**
```bash
pip install -r requirements.txt
```

#### Error: "Database is locked"
**Solución:**
```python
# Asegurar que las conexiones se cierren correctamente
# Usar context managers
with get_db() as conn:
    # operaciones
```

#### Error: "CSRF token missing"
**Solución:**
```html
<!-- Asegurar que el token CSRF esté en los formularios -->
<input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
```

#### Error: "Template not found"
**Solución:**
```python
# Verificar que las plantillas estén en la carpeta correcta
# app.py debe estar en el directorio principal
```

#### Error: "Images not loading"
**Solución:**
```python
# Verificar que la carpeta uploads exista y tenga permisos
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
```

### Debugging

#### Modo Debug
```python
app.run(debug=True)
```

#### Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Mensaje de debug")
```

#### Flask Debug Toolbar
```bash
pip install flask-debugtoolbar
```

```python
from flask_debugtoolbar import DebugToolbarExtension
toolbar = DebugToolbarExtension(app)
```

---

## Recursos Adicionales

### Documentación Externa
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Tricks](https://css-tricks.com/)

### Herramientas Recomendadas
- **IDE**: VS Code, PyCharm
- **Testing**: pytest, unittest
- **Database**: DB Browser for SQLite
- **API Testing**: Postman, curl
- **Git**: GitHub Desktop, SourceTree

### Comunidad
- [Flask Discord](https://discord.gg/flask)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/flask)
- [Reddit r/flask](https://reddit.com/r/flask)

---

## Licencia

Este proyecto es propiedad de EcoMarket. Todos los derechos reservados.

---

## Contacto

- **Email**: hola@ecomarket.com
- **GitHub**: https://github.com/ecomarket
- **Soporte**: https://ecomarket.com/soporte

---

**Última actualización**: 2026-08-25  
**Versión**: 3.0  
**Autores**: Equipo de Desarrollo EcoMarket