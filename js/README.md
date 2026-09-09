# EcoMarket JavaScript

Esta carpeta contiene archivos JavaScript adicionales para el proyecto EcoMarket.

## Archivos

### api-client.js
Cliente HTTP unificado para comunicarse con el backend. Incluye:
- Clase `EcoMarketAPI` para hacer peticiones HTTP
- Métodos: GET, POST, PUT, DELETE, PATCH, upload
- Manejo de errores centralizado
- Headers por defecto y personalizados
- Endpoints predefinidos de EcoMarket
- Soporte para FormData (subida de archivos)

**Uso básico:**
```javascript
const api = new EcoMarketAPI();
const productos = await api.get('/api/productos');
const producto = await api.post('/api/productos', { nombre: 'Producto X' });
```

### utils.js
Utilidades JavaScript reutilizables. Incluye:

#### Formato
- `formatPrice()` - Formatea precios a moneda local
- `formatNumber()` - Formatea números con separadores
- `formatRelativeDate()` - Fechas relativas (hace X tiempo)
- `formatDate()` - Fechas completas
- `truncateText()` - Trunca texto con ellipsis
- `capitalize()` - Capitaliza primera letra
- `slugify()` - Convierte texto a slug para URLs

#### Validación
- `isValidEmail()` - Valida emails
- `isValidPhone()` - Valida teléfonos
- `isValidURL()` - Valida URLs
- `isInRange()` - Valida rangos numéricos

#### Almacenamiento
- `saveToLocalStorage()` - Guarda en localStorage
- `getFromLocalStorage()` - Obtiene de localStorage
- `removeFromLocalStorage()` - Elimina de localStorage
- `clearLocalStorage()` - Limpia localStorage

#### DOM
- `$()` - Selector abreviado
- `$$()` - Selector múltiple
- `createElement()` - Crea elementos con atributos
- `addClassWithDelay()` - Añade clase con delay
- `removeClassWithDelay()` - Remueve clase con delay
- `toggleClass()` - Toggle de clases

#### Eventos
- `delegate()` - Event delegation
- `throttle()` - Throttle function
- `debounce()` - Debounce function
- `sleep()` - Promesa de espera

#### Arrays/Objetos
- `uniqueArray()` - Elimina duplicados
- `shuffleArray()` - Mezcla array
- `chunkArray()` - Divide array en grupos
- `sortByProperty()` - Ordena por propiedad
- `deepClone()` - Clona objetos profundamente
- `mergeObjects()` - Merge de objetos

#### Colores
- `hexToRgb()` - Convierte hex a RGB
- `rgbToHex()` - Convierte RGB a hex
- `randomColor()` - Color aleatorio

#### Cookies/URL
- `setCookie()`, `getCookie()`, `deleteCookie()`
- `getUrlParams()`, `setUrlParam()`, `removeUrlParam()`

#### Dispositivo
- `isMobile()`, `isTablet()`, `isDesktop()`
- `getDeviceType()`

#### Notificaciones
- `showToast()` - Muestra toast notification
- `requestNotificationPermission()` - Permisos navegador
- `showBrowserNotification()` - Notificaciones nativas

### analytics.js
Sistema de análisis y tracking. Incluye:
- Clase `EcoMarketAnalytics` para tracking
- Tracking de page views
- Tracking de clicks
- Tracking de scroll depth
- Eventos personalizados (carrito, favoritos, búsqueda, checkout)
- Tracking de errores
- Tracking de performance
- Soporte offline (localStorage)
- Configurable y extensible

**Uso básico:**
```javascript
// El sistema se inicializa automáticamente
// Para eventos personalizados:
analytics.trackCustomEvent('button_click', { buttonId: 'submit' });
```

### forms.js
Sistema de formularios y validación. Incluye:

#### FormValidator
- Clase para validar formularios
- Validación en blur, input y submit
- Reglas personalizadas
- Mensajes de error
- Soporte para validaciones asíncronas

**Uso básico:**
```javascript
const validator = new FormValidator('#myForm');
validator.addValidator('email', {
    required: true,
    email: true,
    messages: {
        required: 'El email es obligatorio',
        email: 'Email inválido'
    }
});
```

#### Utilidades de formularios
- `setupPasswordStrength()` - Medidor de fuerza de contraseña
- `setupPhoneMask()` - Máscara de teléfono
- `setupCurrencyMask()` - Máscara de moneda
- `setupAddressAutocomplete()` - Autocomplete direcciones
- `setupFileUpload()` - Subida con preview
- `setupTagsInput()` - Input de tags
- `setupStarRating()` - Rating con estrellas
- `serializeForm()` - Serializa formulario a objeto
- `deserializeForm()` - Deserializa objeto a formulario

### config.js
Configuración centralizada de la aplicación. Incluye:
- Objeto `EcoMarketConfig` con toda la configuración
- Configuración de app, imágenes, carrito, búsqueda, etc.
- Función `getConfig(path)` para obtener valores
- Función `setConfig(path, value)` para establecer valores (dev)
- Validación de configuración
- Detección automática de entorno
- Detección de preferencias del sistema

**Uso básico:**
```javascript
const apiUrl = getConfig('app.apiUrl');
const maxFileSize = getConfig('images.maxFileSize');
const theme = getConfig('themes.defaultTheme');
```

## Integración

Para usar estos archivos en tu proyecto, agrégalos antes del cierre del `</body>`:

```html
<script src="/js/config.js"></script>
<script src="/js/utils.js"></script>
<script src="/js/api-client.js"></script>
<script src="/js/forms.js"></script>
<script src="/js/analytics.js"></script>
```

## Dependencias

- **config.js** debe cargarse primero (dependencia de otros archivos)
- **utils.js** se recomienda cargar segundo (usado por otros archivos)
- Los demás archivos pueden cargarse en cualquier orden

## Características

- **Modularidad**: Cada archivo es independiente y puede usarse por separado
- **Compatibilidad**: Soporte para ES6+ y navegadores modernos
- **TypeScript-ready**: Estructura que facilita la migración a TypeScript
- **Testing-friendly**: Código estructurado para facilitar unit tests
- **Performance**: Optimizado para rendimiento
- **Accesibilidad**: Consideraciones de accesibilidad incluidas

## Best Practices

1. **Configuración**: Siempre usar `getConfig()` para acceder a la configuración
2. **API**: Usar el cliente API para todas las peticiones HTTP
3. **Utilidades**: Reutilizar funciones de utils.js antes de crear nuevas
4. **Forms**: Usar FormValidator para validación de formularios
5. **Analytics**: El sistema se inicializa automáticamente, solo añadir eventos personalizados

## Extensiones

Para añadir nueva funcionalidad:
1. Crear un nuevo archivo siguiendo el patrón existente
2. Documentar claramente el API público
3. Incluir ejemplos de uso
4. Considerar migración a módulos ES6 en el futuro
5. Añadir tests unitarios si es posible