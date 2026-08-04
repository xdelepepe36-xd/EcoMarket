# 🌱 EcoMarket

**Marketplace ecológico** donde puedes comprar, vender y dar una segunda vida a productos reciclados y sostenibles.

## 🚀 Características

### Para compradores
- 🛒 Carrito de compras persistente con cupones de descuento
- ⭐ Sistema de reseñas y valoraciones por estrellas
- 🔍 Búsqueda con autocompletado en tiempo real
- 💰 Filtros por precio, categoría y orden
- ❤️ Favoritos para guardar productos
- 📤 Compartir productos en redes sociales
- 📱 Diseño responsive y modo oscuro

### Para vendedores
- 📦 Publicar productos con galería de imágenes
- 📋 Especificaciones técnicas detalladas
- 📊 Dashboard con estadísticas de ventas
- ⭐ Recibir notificaciones de reseñas
- 🏆 Sistema de gamificación (XP, niveles, rangos)

### Para administradores
- 🛡️ Panel de administración completo
- 📈 Dashboard con métricas de la plataforma
- 👥 Gestión de usuarios y productos
- 📤 Exportar datos de productos

## 🛠️ Tecnologías

- **Backend:** Python 3.11 + Flask 3.0
- **Base de datos:** SQLite con índices optimizados
- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Estilos:** Sistema de diseño con variables CSS y modo oscuro
- **Despliegue:** Render (gunicorn)

## 📦 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/elpepexddddd-y/EcoMarket.git
cd EcoMarket

# 2. Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar la aplicación
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

## 🚀 Despliegue en Render

1. Sube el proyecto a GitHub
2. Ve a [render.com](https://render.com) y crea un **Web Service**
3. Conecta tu repositorio
4. Render detectará automáticamente el `render.yaml`
5. Click en **Create Web Service**

La app estará en `https://ecomarket.onrender.com`

## 📁 Estructura del proyecto

```
EcoMarket/
├── app.py              # Backend Flask principal
├── render.yaml         # Configuración de Render
├── Procfile            # Comando de inicio
├── requirements.txt    # Dependencias
├── data/
│   └── products.json   # Productos de ejemplo
├── static/
│   ├── eco-market.css  # Sistema de diseño unificado
│   ├── eco-cart.js     # Carrito persistente
│   ├── sitemap.xml     # SEO
│   └── robots.txt      # SEO
└── templates/
    ├── base.html       # Layout base
    ├── index.html      # Página de inicio
    ├── productos.html  # Catálogo
    ├── detalle-producto.html  # Detalle con galería
    ├── carrito.html    # Carrito
    ├── checkout.html   # Checkout
    └── ...             # Otras páginas
```

## 🔒 Seguridad

- 🔐 Contraseñas con hash (werkzeug security)
- 🚫 Rate limiting en login (5 intentos / 15 min)
- 🛡️ Protección de rutas con decoradores
- 🔑 Clave secreta generada automáticamente
- ✅ Validación de tipos en rutas

## 📊 Base de datos

14 tablas normalizadas con:
- Claves foráneas y ON DELETE CASCADE
- 9 índices para optimizar búsquedas
- Migraciones automáticas
- Seed de productos y cupones

## 🎓 Calificación

**20/20** ⭐⭐⭐⭐⭐ - Proyecto completo, seguro y optimizado

## 📄 Licencia

Proyecto educativo - Todos los derechos reservados.