# 🤖 Guía para Agentes de Desarrollo - EcoMarket

## 📋 Información del Proyecto

**Nombre:** EcoMarket v3.2  
**Tipo:** Marketplace ecológico  
**Stack:** Python Flask + SQLite + Vanilla JavaScript  
**Estado:** 🟢 Activo y en desarrollo

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
EcoMarket/
├── app.py                    # Aplicación principal Flask
├── requirements.txt          # Dependencias Python
├── requirements-test.txt     # Dependencias de testing
├── static/                  # Archivos estáticos
│   ├── ecomarket-*.js      # Módulos JavaScript
│   ├── ecomarket-*.css     # Estilos CSS
│   ├── accessibility.css   # WCAG 2.1 AA compliance
│   └── images/             # Imágenes estáticas
├── templates/               # Plantillas Jinja2
├── tests/                  # Tests unitarios
├── scripts/                # Scripts de utilidad
└── .devin/                # Configuración de Devin
```

## 🔧 Comandos de Desarrollo

### Instalación y Setup
```bash
# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt
pip install -r requirements-test.txt  # Opcional

# Ejecutar aplicación
python app.py
```

### Testing
```bash
# Ejecutar todos los tests
pytest tests/

# Ejecutar con cobertura
pytest tests/ --cov=app --cov-report=html

# Tests específicos
pytest tests/test_app.py::TestEcoMarketApp::test_index_route
```

### Scripts de Utilidad
```bash
# Comprimir assets estáticos
python scripts/compress_assets.py

# Verificar dependencias
pip-check
```

## 🎯 Funcionalidades Principales

### Backend (app.py)
- **Rutas principales:** index, productos, login, registro, carrito, favoritos
- **API REST:** productos, categorías, búsqueda, filtros
- **Sistema de usuarios:** registro, login, logout, perfil
- **Base de datos:** SQLite con índices optimizados
- **Seguridad:** validación de inputs, sanitización, logging
- **Caché:** sistema de caché en memoria con decorator @cached

### Frontend (JavaScript)
- **ecomarket-consolidated.js:** Funcionalidades principales
- **ecomarket-comments.js:** Sistema de comentarios
- **ecomarket-compare.js:** Comparador de productos
- **ecomarket-payments.js:** Integración de pagos
- **ecomarket-social.js:** Redes sociales
- **ecommerce-analytics.js:** Sistema de analytics
- **ecomarket-ultimate.js:** Funcionalidades premium
- **ecomarket-extra.js:** Funcionalidades extra

### Estilos (CSS)
- **ecomarket-consolidated.css:** Estilos principales
- **ecomarket-themes-enhanced.css:** Sistema de temas
- **ecomarket-advanced-features.css:** Características avanzadas
- **accessibility.css:** WCAG 2.1 AA compliance

## 🔒 Seguridad

### Validaciones Implementadas
- `sanitize_string()`: Sanitización de inputs
- `validate_email()`: Validación de emails
- `validate_password()`: Validación de contraseñas
- `validate_url()`: Validación de URLs
- `validate_file_upload()`: Validación de uploads

### Base de Datos
- Índices optimizados en tablas principales
- Conexiones con manejo de errores try/except/finally
- Rollback automático en caso de errores

### Logging
- Sistema de logging profesional (archivo + consola)
- Niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Formato estructurado con timestamps

## ♿ Accesibilidad

### WCAG 2.1 AA
- Skip navigation para screen readers
- Focus visible mejorado
- Soporte para `prefers-reduced-motion`
- Soporte para `prefers-contrast`
- Touch targets optimizados (44px mínimo)
- Marcadores ARIA y landmarks
- Estados de formulario accesibles

## 📊 Analytics

### Eventos Trackeados
- `page_view` - Navegación entre páginas
- `product_view` - Visualización de productos
- `add_to_cart` - Agregar productos al carrito
- `purchase` - Completar compras
- `search` - Búsquedas de productos
- `filter` - Aplicación de filtros
- `error` - Errores de la aplicación

### Integraciones
- Google Analytics (gtag)
- Mixpanel (SDK)
- Hotjar (SDK)
- Analytics local (localStorage)

## 💳 Pagos

### Stripe
- Acepta tarjetas de crédito/débito
- Procesamiento seguro
- Configuración: STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY

### PayPal
- Pago con cuenta PayPal
- Checkout express
- Configuración: PAYPAL_CLIENT_ID

## 📱 Redes Sociales

### Compartir
- Facebook, Twitter, Instagram, WhatsApp, LinkedIn, Pinterest
- Botones de compartir en tarjetas de producto

### Login Social
- Facebook OAuth
- Google OAuth
- Configuración: FACEBOOK_APP_ID, GOOGLE_CLIENT_ID

## 🧪 Testing

### Tests Implementados
- `TestEcoMarketApp`: Tests de rutas principales
- `TestSecurityFunctions`: Tests de validaciones
- `TestDatabaseFunctions`: Tests de base de datos
- `TestAPIEndpoints`: Tests de API
- `TestUserAuthentication`: Tests de autenticación
- `TestProductOperations`: Tests de productos
- `TestCartOperations`: Tests de carrito
- `TestPerformanceMetrics`: Tests de rendimiento

## 🚀 Despliegue

### Variables de Entorno
```env
DATABASE_URL=sqlite:///ecomarket.db
STRIPE_PUBLIC_KEY=tu_stripe_public_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
PAYPAL_CLIENT_ID=tu_paypal_client_id
GOOGLE_ANALYTICS_ID=tu_ga_id
MIXPANEL_TOKEN=tu_mixpanel_token
HOTJAR_ID=tu_hotjar_id
FACEBOOK_APP_ID=tu_facebook_app_id
GOOGLE_CLIENT_ID=tu_google_client_id
SECRET_KEY=tu_secret_key_seguro
```

### Plataforma
- **Despliegue actual:** Render
- **Servidor:** gunicorn
- **Base de datos:** SQLite

## 📝 Convenciones de Código

### Python
- PEP 8 compliance
- Type hints cuando sea apropiado
- Docstrings para funciones principales
- Imports ordenados (stdlib, third-party, local)

### JavaScript
- Vanilla JavaScript (no frameworks)
- ES6+ features
- Modularización con objetos globales
- Manejo de errores con try/catch
- Event delegation cuando sea posible

### CSS
- Variables CSS para theming
- BEM naming convention
- Responsive design first
- Mobile-first approach

## 🐛 Debugging

### Problemas Comunes
1. **Error de base de datos:** Verificar que SQLite esté instalado
2. **Error de dependencias:** Ejecutar `pip install -r requirements.txt`
3. **Error de permisos:** Verificar permisos de archivos
4. **Error de puerto:** Cambiar puerto en app.py

### Logging
- Logs guardados en `ecomarket.log`
- Niveles de logging configurables
- Estructura JSON para parsing

## 🎨 Design System

### Colores
- `--verde`: #2e7d32 (Color principal)
- `--azul`: #1976d2 (Color secundario)
- `--naranja`: #f57c00 (Color de acento)
- Variables CSS para theming dinámico

### Tipografía
- Fuente principal: Poppins (Google Fonts)
- Sistema de escalas responsive
- Soporte para fuentes de sistema

### Componentes
- Sistema de componentes modulares
- Variables CSS para personalización
- Soporte para modo oscuro

## 🔄 Ciclo de Desarrollo

1. **Feature Development**
   - Crear rama feature/xyz
   - Implementar funcionalidad
   - Escribir tests
   - Documentar cambios

2. **Testing**
   - Ejecutar suite de tests
   - Verificar cobertura (>80%)
   - Tests manuales si es necesario

3. **Code Review**
   - Revisar código por seguridad
   - Verificar accesibilidad
   - Revisar performance

4. **Deployment**
   - Merge a main
   - Ejecutar tests
   - Deploy a producción
   - Monitorear logs

## 📞 Soporte

### Recursos
- Documentación: README.md
- Issues: GitHub Issues
- Email: support@ecomarket.com

### Skills de Devin
- `ecomarket-setup`: Configuración y optimización
- `plan`: Planificación de tareas
- `research`: Exploración de código

## 🎯 Objetivos Futuros

- [ ] Sistema de notificaciones push
- [ ] Chat en tiempo real
- [ ] Sistema de recomendaciones ML
- [ ] App móvil React Native
- [ ] Gamificación avanzada
- [ ] Marketplace de servicios

---

**Última actualización:** 2026-09-01  
**Versión:** 3.2  
**Mantenedor:** Equipo de Desarrollo EcoMarket