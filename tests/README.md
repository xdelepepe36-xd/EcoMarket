# Sistema de Testing - EcoMarket

## Estructura de Tests

### Test Básicos (`test_app_basic.py`)
Tests de funcionalidad principal y componentes esenciales de la aplicación.

## Categorías de Tests

### 1. Tests de Rutas
- **TestIndexRoute**: Verifica que la página principal cargue correctamente
- **TestProductosRoute**: Verifica que la página de productos funcione
- **TestLoginRoute**: Verifica el formulario de login
- **TestRegistroRoute**: Verifica el formulario de registro
- **TestContactoRoute**: Verifica la página de contacto
- **Test404Route**: Verifica el manejo de errores 404

### 2. Tests de Base de Datos
- **TestDatabaseConnection**: Verifica la conexión a SQLite
- **TestDatabaseTables**: Verifica que todas las tablas existan

### 3. Tests de API
- **TestApiFavoritosUnauthorized**: Verifica protección de API de favoritos
- **TestApiRecomendacionesUnauthorized**: Verifica protección de API de recomendaciones

### 4. Tests de Funcionalidad
- **TestBusquedaProductos**: Verifica búsqueda de productos
- **TestFiltroCategoria**: Verifica filtros por categoría
- **TestOrdenamientoProductos**: Verifica diferentes ordenamientos

### 5. Tests de Seguridad
- **TestCsrfProtection**: Verifica protección CSRF
- **TestSqlInjectionProtection**: Verifica protección contra inyección SQL
- **TestXssProtection**: Verifica protección contra XSS

### 6. Tests de Validación
- **TestEmailValidation**: Verifica validación de emails
- **TestPasswordValidation**: Verifica validación de contraseñas

## Ejecutar Tests

### Ejecutar todos los tests:
```bash
python -m pytest tests/test_app_basic.py -v
```

### Ejecutar tests específicos:
```bash
python -m pytest tests/test_app_basic.py::TestEcoMarketBasic::test_index_route -v
```

### Ejecutar con cobertura:
```bash
python -m pytest tests/test_app_basic.py --cov=app --cov-report=html
```

### Ejecutar con unittest:
```bash
python tests/test_app_basic.py
```

## Próximos Tests a Implementar

### Tests de Integración
- Test de flujo completo de compra
- Test de registro y login
- Test de publicación de productos
- Test de sistema de favoritos

### Tests de Performance
- Test de tiempo de respuesta
- Test de carga de base de datos
- Test de renderizado de templates

### Tests de Accesibilidad
- Test de contraste de colores
- Test de navegación por teclado
- Test de screen readers

## Convenciones

### Nomenclatura
- Los nombres de tests deben ser descriptivos
- Usar snake_case para nombres de funciones
- Usar CamelCase para nombres de clases

### Estructura
- Cada test debe ser independiente
- Usar setUp y tearDown para preparación
- Un test por funcionalidad

### Assertions
- Usar assertions específicos (assertEqual, assertIn, etc.)
- Mensajes de error descriptivos
- Verificar tanto éxito como fallos esperados

## Cobertura Objetivo

- **Mínimo**: 70% de cobertura
- **Ideal**: 80% de cobertura
- **Excelente**: 90%+ de cobertura

## Integración CI/CD

Los tests deberían ejecutarse automáticamente en:
- Cada commit
- Cada pull request
- Antes de despliegue a producción

## Mantenimiento

- Actualizar tests cuando se agreguen nuevas funcionalidades
- Revisar tests fallidos regularmente
- Mantener tests actualizados con cambios en código