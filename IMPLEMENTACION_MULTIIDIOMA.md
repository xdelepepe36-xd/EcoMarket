# EcoMarket - Implementación de Sistema Multiidioma

## 🌍 Resumen de la Implementación

Se ha implementado un sistema completo de internacionalización (i18n) para EcoMarket, permitiendo que toda la aplicación funcione en 6 idiomas diferentes.

## 📋 Idiomas Soportados

- 🇪🇸 **Español (es)** - Idioma principal
- 🇬🇧 **English (en)** - Inglés
- 🇧🇷 **Português (pt)** - Portugués
- 🇫🇷 **Français (fr)** - Francés
- 🇩🇪 **Deutsch (de)** - Alemán
- 🇮🇹 **Italiano (it)** - Italiano

## 📁 Archivos Nuevos Creados

### 1. Frontend
- **`static/ecomarket-i18n-complete.js`** (1,054 líneas)
  - Sistema completo de traducciones para 6 idiomas
  - Selector de idioma mejorado con dropdown
  - Detección automática de idioma del navegador
  - Traducción automática de productos y categorías
  - Soporte para RTL (idiomas de derecha a izquierda)
  - Traducciones de toda la UI: navegación, productos, reviews, checkout, etc.

### 2. Backend
- **`database_migration_i18n.py`** (403 líneas)
  - Script de migración para base de datos
  - Agrega columnas de idioma a productos (nombre_en, nombre_pt, etc.)
  - Crea tabla de traducciones de categorías
  - Crea tabla de traducciones de contenido estático
  - Inserta traducciones iniciales
  - Índices de optimización
  - Funciones de rollback y status

- **`app_i18n_routes.py`** (589 líneas)
  - Rutas API para gestión de traducciones
  - Funciones auxiliares para traducción
  - Context processor para plantillas
  - Estadísticas de traducciones
  - Soporte para edición de traducciones

### 3. Archivos Modificados

#### `app.py`
- Importación de funciones i18n
- Modificación de ruta `/productos` para soportar parámetro `lang`
- Selección dinámica de campos según idioma
- Traducción de categorías en resultados
- Inyección de idioma actual en plantillas

#### `templates/base.html`
- Incluye `ecomarket-i18n-complete.js`
- Selector de idioma generado automáticamente
- Atributos `data-i18n` en todos los elementos traducibles
- Soporte para traducciones en navegación y footer

#### `templates/index.html`
- Atributos `data-i18n` en elementos traducibles
- Preparado para traducción automática de categorías

## 🗄️ Cambios en Base de Datos

### Nuevas Columnas en `productos`
```sql
nombre_en TEXT
nombre_pt TEXT
nombre_fr TEXT
nombre_de TEXT
nombre_it TEXT
descripcion_en TEXT
descripcion_pt TEXT
descripcion_fr TEXT
descripcion_de TEXT
descripcion_it TEXT
idiomas_disponibles TEXT DEFAULT '["es"]'
```

### Nueva Tabla: `categoria_traducciones`
```sql
CREATE TABLE categoria_traducciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id TEXT NOT NULL,
    idioma TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria_id, idioma)
)
```

### Nueva Tabla: `contenido_traducciones`
```sql
CREATE TABLE contenido_traducciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT NOT NULL,
    idioma TEXT NOT NULL,
    valor TEXT NOT NULL,
    contexto TEXT DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clave, idioma)
)
```

## 🚀 Cómo Usar el Sistema

### Ejecutar Migración de Base de Datos

```bash
# Ejecutar migración
python database_migration_i18n.py migrate

# Ver estado
python database_migration_i18n.py status

# Revertir si es necesario
python database_migration_i18n.py rollback
```

### Frontend - Traducir Elementos

Usar atributos `data-i18n`:

```html
<span data-i18n="nav.home">Inicio</span>
<button data-i18n="products.search_placeholder">Buscar productos...</button>
```

### Frontend - Traducir en JavaScript

```javascript
// Usar función de traducción
const texto = EcoI18n.t('nav.home');
const texto_con_param = EcoI18n.t('products.count', { count: 5 });

// Cambiar idioma
EcoI18n.setLanguage('en');
```

### Backend - Obtener Productos en Idioma Específico

```python
# Usar parámetro lang en URL
@app.route('/productos')
def productos_view():
    lang = request.args.get('lang', 'es')
    # La query seleccionará campos según idioma
```

### Backend - Traducir Contenido en Plantillas

```html
<!-- Usar función t() disponible en plantillas -->
<span>{{ t('nav.home') }}</span>
<span>{{ t('products.count', count=total) }}</span>
```

### Backend - API de Traducciones

```python
# Obtener traducciones de productos
GET /api/traducciones/productos?lang=en

# Obtener traducciones de un producto específico
GET /api/traducciones/producto/123

# Actualizar traducciones (requiere autenticación)
PUT /api/traducciones/producto/123
{
    "nombre_en": "Eco Bottle",
    "descripcion_en": "Sustainable water bottle"
}

# Obtener traducciones de categorías
GET /api/traducciones/categorias

# Obtener traducciones de contenido
GET /api/traducciones/contenido?lang=en

# Obtener estadísticas
GET /api/traducciones/estadisticas
```

## 📊 Traducciones Disponibles

### Contenido Traducido

#### Navegación
- Inicio, Productos, Favoritos, Carrito, Impacto, Contacto
- Publicar, Perfil, Admin, Login, Registro, Logout

#### Banner/Hero
- Ofertas, títulos, descripciones, CTAs
- Ventajas (envío gratis, pago seguro, etc.)
- Estadísticas (familias, productos, plástico)

#### Categorías
- Hogar (Home/Lar/Maison/Haushalt/Casa)
- Accesorios (Accessories/Acessórios/Accessoires/Zubehör/Accessori)
- Higiene (Hygiene/Higiene/Hygiène/Hygiene/Igiene)
- Jardín (Garden/Jardim/Jardin/Garten/Giardino)
- Alimentación (Food/Alimentação/Alimentation/Lebensmittel/Alimentazione)
- Ropa (Clothing/Roupa/Vêtements/Kleidung/Abbigliamento)

#### Productos
- Títulos, descripciones, precios, stock
- Filtros, ordenamiento, resultados
- Detalle de producto, vendedor, envío

#### Carrito
- Título, vacío, continuar comprando
- Total, subtotal, envío, impuestos
- Acciones de agregar/eliminar

#### Perfil
- Dashboard, publicaciones, favoritos
- XP, followers, following
- Editar perfil, configuraciones

#### Reviews
- Título, escribir review, calificación
- Comentario, enviar, útil, reportar

#### Contacto
- Título, descripción, información
- Formulario, campos, enviar

#### Checkout
- Título, dirección, método de pago
- Resumen, tarjeta, éxito

#### Mensajes de Error/Éxito
- Campos requeridos, email inválido
- Contraseña incorrecta, conexión
- Actualizado, guardado, eliminado

#### Formatos
- Moneda (S/, $, R$, €)
- Fecha (DD/MM/YYYY, MM/DD/YYYY, DD.MM.YYYY)
- Hora (HH:mm)

## 🎨 Características del Selector de Idioma

- **Dropdown Mejorado**: Menú desplegable con banderas y nombres nativos
- **Auto-detección**: Detecta idioma del navegador automáticamente
- **Persistencia**: Guarda preferencia en localStorage
- **Traducción Automática**: Traduce toda la página al cambiar idioma
- **RTL Support**: Soporte para idiomas de derecha a izquierda
- **Símbolo de Check**: Muestra idioma activo con checkmark

## 🔧 Funciones Auxiliares Backend

### `get_product_translation_field(producto_id, campo, lang)`
Obtiene un campo traducido de un producto específico.

### `get_category_translation(categoria, lang)`
Obtiene la traducción de una categoría.

### `translate_product_list(productos, lang)`
Traduce una lista completa de productos.

### `update_product_traductions(producto_id, traducciones)`
Actualiza las traducciones de un producto.

## 📈 Estadísticas Disponibles

### Productos
- Total de productos
- Productos con i18n
- Porcentaje de completado

### Categorías
- Total de categorías
- Traducciones disponibles

### Contenido
- Total de traducciones
- Traducciones por idioma

## 🎯 Próximos Pasos Recomendados

1. **Ejecutar la migración**:
   ```bash
   python database_migration_i18n.py migrate
   ```

2. **Agregar traducciones de productos**:
   - Usar el panel admin para agregar traducciones
   - Usar la API para actualizaciones masivas

3. **Traducir contenido estático**:
   - Agregar traducciones a `contenido_traducciones`
   - Usar la función `t()` en plantillas

4. **Testing**:
   - Probar cambio de idioma en frontend
   - Verificar traducciones de productos
   - Probar rutas API con diferentes idiomas

5. **Documentación para vendedores**:
   - Guía para agregar traducciones de productos
   - Cómo usar el panel de traducciones

## 🐛 Troubleshooting

### El selector de idioma no aparece
- Verificar que `ecomarket-i18n-complete.js` esté cargado
- Verificar que exista el elemento `.lang-switcher`

### Las traducciones no se aplican
- Verificar que los elementos tengan `data-i18n`
- Verificar que la clave exista en las traducciones
- Revisar la consola del navegador para errores

### Error en migración de base de datos
- Verificar que `data/ecomarket.db` exista
- Verificar permisos de escritura
- Usar `python database_migration_i18n.py status` para diagnóstico

### Productos no se traducen
- Verificar que las columnas de idioma existan
- Verificar que el parámetro `lang` se esté pasando
- Usar traducciones como fallback si están vacías

## 📚 Referencias

- [MDN - Internationalization](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Flask Internationalization](https://flask.palletsprojects.com/en/2.3.x/extensions/)
- [JSON Web Tokens (JWT)](https://jwt.io/)

---

**Versión**: 1.0  
**Fecha**: 2026-08-25  
**Idiomas**: 6 (es, en, pt, fr, de, it)  
**Estado**: ✅ Completado