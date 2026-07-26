# 🌿 EcoMarket - Guía Completa

## 🚀 CÓMO PROBAR EL MODO OSCURO

Hay **3 formas** de cambiar el tema:

### 1️⃣ Botón de tema (en todas las páginas)
- Busca el botón con el icono **🌙** (luna) en la esquina superior derecha del navbar
- **Haz clic** para alternar entre:
  - ☀️ **Claro** (por defecto)
  - 🌙 **Oscuro** (fondo oscuro, texto claro)
  - ♿ **Alto Contraste** (máxima legibilidad)

### 2️⃣ Usando el selector en el admin
- Ve a `/admin.html` → "Ajustes" → "Apariencia"
- Selecciona el tema en el dropdown

### 3️⃣ Desde el código (programáticamente)
```javascript
// Abre la consola del navegador (F12) y escribe:
EcoTheme.set('dark');    // Modo oscuro
EcoTheme.set('light');   // Modo claro
EcoTheme.set('highcontrast'); // Alto contraste
EcoTheme.toggle();       // Alternar entre los 3
```

### ✨ Características del modo oscuro:
- ✅ Navbar, footer, tarjetas, inputs, botones - todo cambia
- ✅ Se guarda automáticamente (aunque cierres el navegador)
- ✅ Detecta la preferencia del sistema (si tu PC está en modo oscuro)
- ✅ Transiciones suaves entre modos

---

## 🌐 CÓMO SUBIR A NETLIFY

### Opción 1: Versión Estática (HTML + JS)
Los archivos HTML en la raíz del proyecto **ya funcionan** en Netlify sin necesidad de Python.

**Pasos:**
1. Sube todos los archivos a un repositorio de **GitHub**
2. Conecta Netlify a tu repositorio
3. Configura:
   - **Build command:** `(ninguno)`
   - **Publish directory:** `/`
4. Netlify usa automáticamente el archivo `netlify.toml` para las reglas de redirección

**Archivos HTML disponibles:**
- `index.html` → Página principal
- `productos.html` → Catálogo (45 productos desde `data/products.json`)
- `carrito.html` → Carrito de compras
- `favoritos.html` → Favoritos
- `detalle-producto.html` → Detalle de producto
- `login.html` → Iniciar sesión
- `registro.html` → Crear cuenta
- `perfil.html` → Mi perfil
- `admin.html` → Panel admin
- `checkout.html` → Pago
- `confirmacion.html` → Confirmación
- `contacto.html` → Contacto
- `impacto.html` → Impacto ambiental
- `404.html` → Página no encontrada

### Opción 2: Versión Flask (servidor completo)
Para funcionalidad completa con base de datos (reseñas, pedidos, usuarios):

```bash
# En tu PC local o servidor:
pip install flask
python app.py
# Abre http://localhost:5000
```

Para desplegar Flask en Netlify se necesita un adaptador especial (no es directo).

---

## 🎯 PRUEBAS RÁPIDAS

### ✅ Probar modo oscuro
1. Abre cualquier página
2. Busca el icono 🌙 arriba a la derecha
3. Haz clic varias veces para ver los 3 temas

### ✅ Probar catálogo (45 productos)
1. Ve a `productos.html`
2. Usa los filtros por categoría
3. Prueba el buscador en tiempo real
4. Ordena por precio/rating

### ✅ Probar el selector de idioma
1. Abre cualquier página
2. Busca las banderas **🇪🇸 🇬🇧 🇧🇷** en la esquina inferior derecha
3. Haz clic para cambiar idioma

### ✅ Probar el chat
1. Busca el botón **💬** en la esquina inferior derecha
2. Haz clic para abrir la ventana de chat
3. Escribe un mensaje y presiona Enter

### ✅ Probar favoritos
1. En `productos.html`, haz clic en el corazón ❤️ de cualquier producto
2. Ve a `favoritos.html` para ver tus favoritos guardados

### ✅ Probar carrito
1. En `productos.html`, haz clic en "Agregar al carrito"
2. Ve a `carrito.html` para ver los productos

### ✅ Probar inicio de sesión
1. Ve a `login.html`
2. Usa cualquier email con contraseña de 6+ caracteres
3. El navbar cambiará para mostrar tu perfil

---

## 📁 ESTRUCTURA DEL PROYECTO

```
EcoMarket/
├── index.html          # Página principal
├── productos.html       # Catálogo (45 productos)
├── carrito.html         # Carrito de compras
├── favoritos.html       # Favoritos
├── detalle-producto.html # Detalle de producto
├── login.html           # Inicio de sesión (con Google)
├── registro.html        # Crear cuenta
├── perfil.html          # Mi perfil
├── admin.html           # Panel admin
├── checkout.html        # Proceso de pago
├── confirmacion.html    # Confirmación de pedido
├── contacto.html        # Formulario de contacto
├── impacto.html         # Impacto ambiental
├── 404.html             # Página no encontrada
│
├── eco-auth.js          # Autenticación
├── eco-cart.js          # Carrito (con cupones)
├── eco-favorites.js     # Favoritos
├── eco-search.js        # Búsqueda avanzada
├── eco-animations.js    # Animaciones
├── eco-toast.js         # Notificaciones
├── eco-notifications.js # Centro de notificaciones
├── eco-theme.js         # 3 temas (claro/oscuro/contraste)
├── eco-gamification.js  # Puntos e insignias
├── eco-chat.js          # Chat en vivo
├── eco-reviews.js       # Sistema de reseñas
├── eco-analytics.js     # Estadísticas
├── eco-improvements.js  # Mejoras (i18n, lazy, SEO, charts)
│
├── eco-styles.css       # Estilos de componentes
├── eco-shared.css       # Estilos compartidos
│
├── data/products.json   # 45 productos
├── manifest.json        # PWA
├── sw.js                # Service Worker (offline)
├── netlify.toml         # Configuración Netlify
├── app.py               # Backend Flask (opcional)
│
└── static/              # Assets estáticos
    ├── style.css, main.js, cart.js, ...
    └── uploads/         # Subida de imágenes