# 🌱 EcoMarket - Marketplace Ecológico

![Version](https://img.shields.io/badge/version-3.2-green)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![Flask](https://img.shields.io/badge/flask-3.0+-red)
![License](https://img.shields.io/badge/license-MIT-blue)

EcoMarket es un marketplace ecológico completo donde puedes comprar, vender y dar una segunda vida a productos sostenibles y reciclados. Desarrollado con Python Flask, SQLite y JavaScript vanilla.

## ✨ Características

### 🛍️ Catálogo de Productos
- **332 productos** en **18 categorías** distintas
- Categorías: Higiene, Hogar, Alimentación, Ropa, Jardín, Accesorios, Libros, Tecnología, Deportes, Juguetes, Arte, Mascotas, Bebés, Papelería, Música, Electrodomésticos, Herramientas, Muebles
- Filtros avanzados por categoría, precio, eco-score y condición
- Comparación de hasta 4 productos simultáneamente
- Sistema de búsqueda inteligente

### 🎨 Interfaz de Usuario
- Diseño moderno y responsive
- **Animaciones CSS suaves** optimizadas para rendimiento
- Soporte para modo oscuro
- PWA (Progressive Web App) con manifest
- Compatibilidad WCAG 2.1 AA (accesibilidad)

### 💰 Sistema de Comercio
- Carrito de compras completo
- **Checkout wizard** multi-paso
- Sistema de **cupones y descuentos**
- Seguimiento de pedidos con timeline visual
- Múltiples métodos de pago (Stripe, PayPal)

### 👥 Funcionalidades de Usuario
- Registro e inicio de sesión
- Perfil de usuario personalizable
- **Dashboard premium** con estadísticas
- Sistema de favoritos/wishlist
- **Wishlist compartido** con URL única

### 💬 Interacción Social
- Sistema de **preguntas y respuestas** en productos
- **Chat en tiempo real** con vendedores
- Sistema de reseñas y valoraciones
- **Valoración de vendedores** con ranking

### 🔔 Notificaciones y Alertas
- **Notificaciones push** avanzadas
- **Alertas de precio** (bajadas de precio)
- Alertas de reposición de stock
- Sistema de notificaciones personalizables

### 📊 Analytics y Gamificación
- Dashboard de analytics
- Impacto ecológico del usuario
- Sistema de badges y logros
- Leaderboard de usuarios
- Recomendaciones personalizadas

## 🚀 Instalación

### Requisitos Previos
- Python 3.12 o superior
- pip (gestor de paquetes de Python)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/xdelepepe36-xd/EcoMarket.git
cd EcoMarket
```

2. **Crear entorno virtual**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.production .env
# Editar .env con tus configuraciones
```

5. **Inicializar base de datos**
```bash
python app.py
```

La base de datos se creará automáticamente en `ecomarket.db`.

## 🏃 Ejecución

### Desarrollo
```bash
python app.py
```

La aplicación estará disponible en http://localhost:5000

### Producción
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📁 Estructura del Proyecto

```
EcoMarket/
├── app.py                      # Aplicación principal Flask
├── requirements.txt            # Dependencias Python
├── requirements-test.txt       # Dependencias de testing
├── render.yaml                 # Configuración de despliegue Render
├── Procfile                    # Configuración de proceso
├── .env.production             # Variables de entorno (plantilla)
├── manifest.json               # PWA manifest
├── .gitignore                  # Archivos ignorados por Git
├── AGENTS.md                   # Guía para agentes de desarrollo
├── README.md                   # Este archivo
│
├── static/                     # Archivos estáticos
│   ├── ecomarket-*.js         # Módulos JavaScript
│   ├── ecomarket-*.css        # Estilos CSS
│   ├── accessibility.css      # WCAG 2.1 AA compliance
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt             # Robots para SEO
│   ├── sitemap.xml            # Sitemap para SEO
│   └── uploads/               # Imágenes subidas
│
├── templates/                  # Plantillas Jinja2
│   ├── base.html              # Template base
│   ├── index.html             # Página principal
│   ├── productos.html         # Catálogo de productos
│   ├── producto_detalle.html  # Detalle de producto
│   ├── login.html             # Login
│   ├── registro.html          # Registro
│   ├── carrito.html           # Carrito
│   ├── perfil.html            # Perfil de usuario
│   └── dashboard-premium.html # Dashboard premium
│
├── tests/                      # Tests unitarios
│   └── test_app.py            # Tests de la aplicación
│
├── scripts/                    # Scripts de utilidad
│   ├── agregar_productos_batch.py      # Agregar productos por lotes
│   ├── agregar_imagenes_productos.py   # Agregar imágenes a productos
│   ├── backup_automatizado.py          # Backup automatizado
│   └── agregar_categorias.py           # Agregar categorías
│
└── data/                       # Datos
    └── ecomarket.db           # Base de datos SQLite
```

## 🧪 Testing

### Ejecutar Tests
```bash
pytest tests/
```

### Ejecutar con Cobertura
```bash
pytest tests/ --cov=app --cov-report=html
```

### Tests Actuales
- 17 tests automatizados
- Tests de rutas, seguridad, API, autenticación
- Tests de operaciones de productos y carrito

## 🔧 Scripts de Utilidad

### Agregar Productos
```bash
python scripts/agregar_productos_batch.py
python scripts/agregar_productos_nuevas_categorias.py
```

### Agregar Imágenes
```bash
python scripts/agregar_imagenes_productos.py
```

### Backup Automatizado
```bash
python scripts/backup_automatizado.py
```

## 🌐 Despliegue

### Render
El proyecto está configurado para despliegue en Render:
- Archivo: `render.yaml`
- Base de datos: SQLite (Render PostgreSQL opcional)
- Servidor: Gunicorn

### Netlify
Para encuestas y páginas estáticas:
- Carpeta: `encuestas-ecomarket-todo`
- Configuración: `netlify.toml`

## 🔒 Seguridad

- Validación de inputs y sanitización
- Hashing de contraseñas
- Protección contra CSRF
- Headers de seguridad HTTP
- SQL injection prevention
- XSS protection

## ♿ Accesibilidad

- WCAG 2.1 AA compliance
- Skip navigation para screen readers
- Focus visible mejorado
- Soporte para `prefers-reduced-motion`
- Soporte para `prefers-contrast`
- Touch targets optimizados (44px mínimo)
- Marcadores ARIA y landmarks

## 📱 PWA Features

- Manifest completo con iconos y screenshots
- Service Worker para offline
- Installable en escritorio y móvil
- Share Target API
- Shortcuts para acciones rápidas

## 🎯 SEO

- Sitemap XML dinámico
- Robots.txt optimizado
- Meta tags Open Graph
- Meta tags Twitter Cards
- Estructura semántica HTML5
- Schema.org (pendiente)

## 📊 Métricas de Rendimiento

- Lazy loading de imágenes
- Resource prefetching
- Caché en memoria con TTL
- Índices de base de datos optimizados
- Paginación de productos
- Compresión de archivos estáticos (WhiteNoise)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## 👥 Autores

- **Equipo de Desarrollo EcoMarket** - Trabajo inicial

## 🙏 Agradecimientos

- Flask y comunidad Python
- Bootstrap Icons
- Unsplash (imágenes de productos)
- Render (plataforma de hosting)

## 📞 Soporte

Para soporte, envía un email a hola@ecomarket.com o abre un issue en el repositorio.

## 🗺️ Roadmap

- [ ] Completar integración Schema.org
- [ ] Mejorar accesibilidad WCAG 2.1
- [ ] Sistema de notificaciones push completo
- [ ] Chat en tiempo real con WebSockets
- [ ] App móvil React Native
- [ ] Sistema de recomendaciones con ML

---

**Versión:** 3.2  
**Última actualización:** 2026-10-31  
**Estado:** 🟢 Activo y en desarrollo
