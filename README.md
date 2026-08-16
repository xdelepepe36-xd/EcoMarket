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

## 🧪 Tests & CI

Se ha añadido un workflow de GitHub Actions básico en `.github/workflows/ci.yml` que instala dependencias y ejecuta `pytest` en cada push o PR a las ramas `main`/`master`.

Para ejecutar los tests localmente:

```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt  # si existe
pip install pytest
pytest -q
```

## 🖼️ Thumbnails locales y geocoding

Se han añadido utilidades y endpoints para mejorar la fiabilidad de imágenes y la validación de direcciones:

- Endpoint admin para generar thumbnails locales: POST /admin/generate_thumbs (requiere sesión de admin). Descarga imágenes remotas a `static/uploads/` y genera `static/uploads/thumb_product_{id}.jpg`, actualizando `productos.imagen_thumb` en la base de datos.

- Endpoint admin para validar imágenes: POST /admin/validate_images (requiere admin) — comprueba accesibilidad y tipo MIME de `productos.imagen` y `producto_imagenes`.

- Endpoint manual para disparar validación desde UI: POST /admin/run_image_validation (requiere admin).

- Export de comparación: GET /api/compare/export?ids=1,2,3  — devuelve CSV con los productos seleccionados.

- Subida de galería por propietario/admin: POST /producto/<id>/upload_images (multipart form-data, campo `images[]`). Guarda archivos en `static/uploads/` y crea thumbs en `static/uploads/thumb_*`, además inserta filas en `producto_imagenes`.

- Integración LLMs:
  - OpenAI: configurar `OPENAI_API_KEY` como variable de entorno (recomendado) para habilitar `/api/ai_chat_v2` y `/api/describe/<id>` con respuestas reales.
  - Modelo local: configurar `LOCAL_AI_MODEL` apuntando a un endpoint HTTP (ej: `http://localhost:5005/generate`) que acepte POST JSON `{messages:[...]}` y devuelva `{reply:"..."}`. Se ha añadido un servidor de ejemplo en `scripts/local_ai_mock.py` que puedes ejecutar localmente (`python scripts/local_ai_mock.py`). Cuando `LOCAL_AI_MODEL` apunta a una URL, `api_ai_chat_v2` reenviará allí las solicitudes en modo `local`.

Ejemplo de variables de entorno (Windows PowerShell):

```powershell
$env:OPENAI_API_KEY = 'sk-...'
$env:LOCAL_AI_MODEL = 'http://localhost:5005/generate'
```

  UI de subida añadida:

  - Se agregó una UI básica de subida a la ficha de producto (visible para el propietario o admin). Usa `static/eco-upload.js` para drag&drop, vista previa y subida multipart hacia `POST /producto/<id>/upload_images`.

- Job periódico: no se activa automáticamente por seguridad; use un cron/Render cron job que llame a `/admin/run_image_validation` mediante una petición autenticada o use la utilidad `scripts/generate_thumbnails.py` y `scripts/download_and_generate_thumbs.py` para procesos offline.

Continuaré añadiendo tests y mejoras según lo solicitado.

Se han añadido utilidades y endpoints para mejorar la fiabilidad de imágenes y la validación de direcciones:

- Endpoint admin para generar thumbnails locales: POST /admin/generate_thumbs (requiere sesión de admin). Descarga imágenes remotas a `static/uploads/` y genera `static/uploads/thumb_product_{id}.jpg`, actualizando `productos.imagen_thumb` en la base de datos.

- Geocoding en checkout: el flujo de checkout intenta geocodificar la dirección del comprador usando Nominatim (OpenStreetMap) y guarda `lat`/`lon` en `pedidos` si se resuelve con éxito. Si Nominatim no responde o hay error, el pedido igualmente se procesa (no bloqueante).

Notas:
- Nominatim tiene límites de uso y requiere respetar el User-Agent; para producción considere usar una API con quota (Google) o un servicio pago.
- Antes de generar thumbnails en masa, haga respaldo de `data/ecomarket.db`.
