# 🌱 EcoMarket — Mejoras Integrales v4.0

Documento que resume **todas las mejoras implementadas** en esta revisión,
corrección de errores y nuevas funcionalidades.

---

## ✅ Errores Corregidos

| # | Error | Archivo | Solución |
|---|-------|---------|----------|
| 1 | **`/productos` daba error 500**: la plantilla usa `producto.get('imagen_pref')` pero `producto` era un `sqlite3.Row` (sin `.get`) | `app.py` / `productos.html` | Convertir filas a `dict` en la ruta |
| 2 | **`eco-dark.css` no estaba enlazado** → el modo oscuro detallado nunca se aplicaba | `base.html` | Añadido `<link>` al head |
| 3 | **Checkout podía fallar con `KeyError`** si un item del carrito no traía `nombre` | `app.py` | Uso de `.get()` con valores por defecto |
| 4 | **Discrepancia de métodos de pago**: el frontend enviaba `card`/`yape` pero el backend validaba `tarjeta`/`paypal` → checkout rechazado | `app.py` | Lista blanca alineada con el frontend |
| 5 | **Checkout ignoraba apellido/teléfono/ciudad** (no se enviaban ni validaban) | `checkout.html` | Envío y validación completos |
| 6 | **Registro permitía contraseñas débiles y emails inválidos** | `app.py` | Validación robusta (email regex, fuerza de contraseña) |
| 7 | **Faltaban columnas** `ciudad`/`telefono` en `pedidos` | `app.py` | Migraciones automáticas ADD COLUMN |

---

## 🚀 Nuevas Funcionalidades

### 1. 🔐 Inicio de sesión con Google
- Botón **"Continuar con Google"** en `login.html` y `registro.html`.
- Integración con **Google Identity Services (GIS)** — `static/eco-google.js`.
- Ruta backend `POST /auth/google` que **verifica el token contra Google** (`oauth2.googleapis.com/tokeninfo`) antes de crear/iniciar sesión.
- Si la cuenta ya existe, se vincula el `google_id` (índice único).
- Campos `google_id` y `email_verificado` en la tabla `usuarios`.
- **Configuración:** definir la variable de entorno `GOOGLE_CLIENT_ID` (ver `GUIA_GOOGLE_LOGIN.md`).

### 2. 🧾 Validación avanzada de compras (checkout)
- **Server-side** en `app.py`:
  - Nombre: solo letras, mínimo 2 caracteres.
  - Email: formato válido.
  - Dirección: debe tener calle **y** número (regex).
  - Teléfono: 7–15 dígitos.
  - Ciudad obligatoria + método de pago en lista blanca.
- **Client-side** en `checkout.html` con `eco-validation.js`:
  - Resaltado en rojo/verde de campos.
  - Errores por campo devueltos por el backend mostrados en el input correcto.

### 3. 📝 Registro elaborado
- Campos adicionales: **apellidos, teléfono, ciudad**.
- **Medidor de fuerza de contraseña** (barra + etiqueta bilingüe).
- Validación en vivo al escribir (blur/input).
- Política de contraseña: mínimo 8 caracteres, letras y números.

### 4. 🤖 IA avanzada en el chat (EcoBot v2)
- **Bilingüe ES/EN**: responde en el idioma activo de la app.
- **16 intenciones** (productos, envíos, cupones, pagos, devoluciones, cuenta, reciclaje, EcoScore, puntos XP, contacto…).
- **Respuestas rápidas** (quick replies) y **indicador "escribiendo…"**.
- Se adapta al tema claro/oscuro.

### 5. 🌙 Modo oscuro mucho más complejo
Ahora hay **5 temas** seleccionables (el botón los cicla):
| Tema | Descripción |
|------|-------------|
| ☀️ **Claro** | Tema por defecto |
| 🌙 **Oscuro** | Verde sobre fondo oscuro (mejorado) |
| 🌃 **Noche AMOLED** | Negro profundo, ideal pantallas OLED |
| 🕯️ **Sepia** | Tono cálido para lectura |
| ♿ **Alto contraste** | Accesibilidad máxima |

- Paletas por tema aplicadas vía variables CSS en `eco-theme.js`.
- Estilos detallados para cada tema en `eco-dark.css`.
- `eco-dark.css` ahora sí se carga en `base.html`.

### 6. 📦 Más productos e imágenes coherentes
- Catálogo ampliado de **45 → 65 productos** (`data/products.json`).
- Cada producto tiene una **imagen específica** coherente con su categoría/uso.
- **Seed aditivo**: al iniciar la app, los productos nuevos se agregan a BD existentes **sin borrar** productos creados por usuarios ni duplicar.
- Script de ayuda: `scripts/agregar_producto.py`.

### 7. ♿ Validación de datos personales (nombre/dirección)
- Helpers reutilizables en `app.py` (`is_valid_email`, `is_valid_nombre`, `is_valid_direccion`, `is_valid_telefono`, `password_strength`).
- Helpers en frontend: `static/eco-validation.js` (`EcoValidation`).

### 8. 🌐 Internacionalización completa
- Diccionarios ES/EN **balanceados (403 claves cada uno)**.
- Nuevas claves para Google login, campos de registro y errores de validación.

---

## 📁 Archivos nuevos/creados

| Archivo | Propósito |
|---------|-----------|
| `static/eco-google.js` | Integración Google Identity Services |
| `static/eco-validation.js` | Validación de formularios en el cliente |
| `GUIA_GOOGLE_LOGIN.md` | Pasos para configurar Google OAuth |
| `scripts/agregar_producto.py` | Script para añadir productos al catálogo |
| `Makefile` | Tareas comunes (install, run, test, seed, backup) |
| `.env.example` | Plantilla de variables de entorno |
| `tools/catalogo_stats.cpp` | Utilidad C++17 que analiza `products.json` |
| `.github/workflows/ci.yml` | CI automática con GitHub Actions |

---

## 🚀 Ronda 2 de mejoras

### 9. 🤖 IA estilo ChatGPT (`/api/chat`)
- **Endpoint inteligente** `POST /api/chat` en el backend.
- Responde con **datos reales** de la BD: productos, precios, categorías.
- Entiende peticiones como:
  - "dame 3 productos de accesorios" / "give me 2 accessories products"
  - "productos baratos" / "cheap products" → lista ordenada por precio.
  - "cupones", "envíos", "pagos", "publicar", "consejos eco", "mi cuenta".
- Bilingüe: detecta el idioma del mensaje y de la sesión.
- **Frontend**: efecto de escritura letra a letra (como ChatGPT), respuestas rápidas dinámicas devueltas por la API y fallback al motor local si no hay conexión.

### 🌐 Inglés completo (también en el servidor)
- Ruta `POST /api/set_lang`: el cliente sincroniza el idioma con la sesión.
- **Mensajes flash traducidos en servidor** (`flash_t` / `tr`): registro, login, logout, checkout, perfil, publicar, admin, contacto, Google.
- Los **errores JSON del checkout** se devuelven en el idioma activo.
- Ejemplo verificado: con idioma EN, el error de dirección llega como *"Enter a full address (street and number, min 8 chars)."*

### 🌙 Modo oscuro pulido
- `color-scheme` correcto por tema (light/dark).
- **Transiciones suaves** al cambiar de tema.
- Cobertura ampliada: checkout, carrito, alertas/flash, tablas, menús, perfil, scrollbar.

---

## 🧪 Pruebas

- `scripts/test_backend.py` cubre: seed de productos, registro (inválido/válido),
  checkout (sin sesión, dirección inválida, pedido válido, errores en inglés) y
  Google (token inválido → 401). **Resultado: 9/9 PASAN.** Ejecutar con: `python scripts/test_backend.py`
- Todas las páginas principales renderizan HTTP 200.