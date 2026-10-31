# 📚 EcoMarket API Documentation

## 📋 Información General

**Base URL**: `https://ecomarket.onrender.com`  
**Versión**: 4.0 Professional  
**Formato**: JSON  
**Autenticación**: Session-based (cookies)

---

## 🔐 Autenticación

### Login
```http
POST /login
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=******
```

**Response**:
```json
{
  "success": true,
  "redirect": "/perfil"
}
```

### Logout
```http
POST /logout
```

**Response**:
```json
{
  "success": true,
  "redirect": "/"
}
```

---

## 📦 Productos

### Obtener todos los productos
```http
GET /api/productos
```

**Query Parameters**:
- `categoria` (opcional): Filtrar por categoría
- `pagina` (opcional): Número de página (default: 1)
- `limite` (opcional): Items por página (default: 12)

**Response**:
```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Jabón Ecológico",
      "categoria": "Higiene",
      "precio": 12.50,
      "descripcion": "Jabón natural con aceites esenciales",
      "imagen": "https://...",
      "stock": 50,
      "eco_score": 9,
      "vendedor": {
        "id": 1,
        "nombre": "Juan Pérez"
      }
    }
  ],
  "total": 223,
  "pagina": 1,
  "paginas": 19
}
```

### Obtener producto por ID
```http
GET /api/productos/<id>
```

**Response**:
```json
{
  "id": 1,
  "nombre": "Jabón Ecológico",
  "categoria": "Higiene",
  "precio": 12.50,
  "descripcion": "Jabón natural con aceites esenciales",
  "imagen": "https://...",
  "imagen_thumb": "https://...",
  "stock": 50,
  "eco_score": 9,
  "condicion": "nuevo",
  "etiquetas": "jabon,ecologico,natural",
  "vendedor": {
    "id": 1,
    "nombre": "Juan Pérez",
    "avatar": "https://...",
    "rango": "Semilla 🌱"
  },
  "creado": "2026-10-28T10:00:00",
  "vistas": 42
}
```

### Buscar productos
```http
GET /api/semantico/search?q=jabon
```

**Query Parameters**:
- `q` (requerido): Término de búsqueda
- `categoria` (opcional): Filtrar por categoría
- `limite` (opcional): Máximo de resultados (default: 10)

**Response**:
```json
{
  "resultados": [
    {
      "id": 1,
      "nombre": "Jabón Ecológico",
      "puntuacion": 0.95,
      "categoria": "Higiene"
    }
  ],
  "total": 5
}
```

---

## 🏷️ Categorías

### Obtener todas las categorías
```http
GET /api/categorias
```

**Response**:
```json
{
  "categorias": [
    {
      "nombre": "Higiene",
      "count": 20,
      "icono": "bi-droplet"
    },
    {
      "nombre": "Hogar",
      "count": 20,
      "icono": "bi-house"
    }
  ]
}
```

---

## ❤️ Favoritos

### Agregar a favoritos
```http
POST /api/favoritos
Content-Type: application/json

{
  "producto_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Producto agregado a favoritos"
}
```

### Eliminar de favoritos
```http
DELETE /api/favoritos/<producto_id>
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Producto eliminado de favoritos"
}
```

### Obtener favoritos del usuario
```http
GET /api/favoritos
```

**Response**:
```json
{
  "favoritos": [
    {
      "id": 1,
      "producto": {
        "id": 1,
        "nombre": "Jabón Ecológico",
        "precio": 12.50,
        "imagen": "https://..."
      },
      "fecha_agregado": "2026-10-28T10:00:00"
    }
  ]
}
```

---

## 🛒 Carrito

### Agregar al carrito
```http
POST /api/carrito
Content-Type: application/json

{
  "producto_id": 1,
  "cantidad": 2
}
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Producto agregado al carrito",
  "total_items": 5
}
```

### Actualizar cantidad
```http
PUT /api/carrito/<producto_id>
Content-Type: application/json

{
  "cantidad": 3
}
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Cantidad actualizada"
}
```

### Eliminar del carrito
```http
DELETE /api/carrito/<producto_id>
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Producto eliminado del carrito"
}
```

### Obtener carrito
```http
GET /api/carrito
```

**Response**:
```json
{
  "items": [
    {
      "producto_id": 1,
      "producto": {
        "id": 1,
        "nombre": "Jabón Ecológico",
        "precio": 12.50,
        "imagen": "https://..."
      },
      "cantidad": 2,
      "subtotal": 25.00
    }
  ],
  "total": 25.00,
  "total_items": 2
}
```

---

## ⭐ Reseñas

### Agregar reseña
```http
POST /api/resenas
Content-Type: application/json

{
  "producto_id": 1,
  "rating": 5,
  "comentario": "Excelente producto"
}
```

**Response**:
```json
{
  "success": true,
  "mensaje": "Reseña agregada exitosamente"
}
```

### Obtener reseñas de producto
```http
GET /api/resenas/<producto_id>
```

**Response**:
```json
{
  "resenas": [
    {
      "id": 1,
      "usuario": {
        "id": 1,
        "nombre": "Juan Pérez",
        "avatar": "https://..."
      },
      "rating": 5,
      "comentario": "Excelente producto",
      "fecha": "2026-10-28T10:00:00",
      "votos_útiles": 3
    }
  ],
  "promedio": 4.5,
  "total": 10
}
```

---

## 🌍 Internacionalización

### Obtener traducciones
```http
GET /api/i18n/translations?lang=es
```

**Query Parameters**:
- `lang` (opcional): Código de idioma (default: es)

**Response**:
```json
{
  "lang": "es",
  "translations": {
    "inicio": "Inicio",
    "productos": "Productos",
    "favoritos": "Favoritos",
    "carrito": "Carrito"
  }
}
```

---

## 📊 Analytics

### Track evento
```http
POST /api/analytics/track
Content-Type: application/json

{
  "evento": "product_view",
  "datos": {
    "producto_id": 1,
    "categoria": "Higiene"
  }
}
```

**Response**:
```json
{
  "success": true
}
```

---

## 🔔 Notificaciones

### Obtener notificaciones
```http
GET /api/notificaciones
```

**Response**:
```json
{
  "notificaciones": [
    {
      "id": 1,
      "tipo": "venta",
      "mensaje": "Vendiste un producto",
      "leida": false,
      "fecha": "2026-10-28T10:00:00"
    }
  ],
  "no_leidas": 3
}
```

### Marcar como leída
```http
PUT /api/notificaciones/<id>/leer
```

**Response**:
```json
{
  "success": true
}
```

---

## 🎮 Gamificación

### Obtener perfil de gamificación
```http
GET /api/usuario/<id>/gamificacion
```

**Response**:
```json
{
  "xp": 1250,
  "nivel": 5,
  "rango": "Arbol 🌳",
  "badges": [
    {
      "id": 1,
      "nombre": "Primera Venta",
      "icono": "bi-trophy",
      "descripcion": "Realizaste tu primera venta"
    }
  ],
  "misiones": [
    {
      "id": 1,
      "nombre": "Vendedor Activo",
      "progreso": 3,
      "objetivo": 5,
      "recompensa": 100
    }
  ]
}
```

---

## 🏆 Leaderboard

### Obtener leaderboard
```http
GET /api/leaderboard
```

**Query Parameters**:
- `tipo` (opcional): vendedores | compradores (default: vendedores)
- `limite` (opcional): Máximo de resultados (default: 10)

**Response**:
```json
{
  "leaderboard": [
    {
      "posicion": 1,
      "usuario": {
        "id": 1,
        "nombre": "Juan Pérez",
        "avatar": "https://..."
      },
      "puntos": 5000,
      "nivel": 10
    }
  ]
}
```

---

## 💰 Cupones

### Obtener cupones disponibles
```http
GET /api/cupones/disponibles
```

**Response**:
```json
{
  "cupones": [
    {
      "codigo": "ECO10",
      "descuento": 10,
      "tipo": "porcentaje",
      "minimo": 50.00,
      "expira": "2026-12-31"
    }
  ]
}
```

### Aplicar cupón
```http
POST /api/cupones/aplicar
Content-Type: application/json

{
  "codigo": "ECO10"
}
```

**Response**:
```json
{
  "success": true,
  "descuento": 10.00,
  "total_nuevo": 45.00
}
```

---

## ❌ Errores

### Formato de error
```json
{
  "error": {
    "codigo": "NOT_FOUND",
    "mensaje": "Producto no encontrado",
    "detalles": {}
  }
}
```

### Códigos de error
- `BAD_REQUEST` (400): Solicitud inválida
- `UNAUTHORIZED` (401): No autenticado
- `FORBIDDEN` (403): No autorizado
- `NOT_FOUND` (404): Recurso no encontrado
- `CONFLICT` (409): Conflicto (ej: producto ya en favoritos)
- `INTERNAL_ERROR` (500): Error del servidor

---

## 📡 Rate Limiting

- **Usuarios autenticados**: 100 requests/min
- **Usuarios no autenticados**: 30 requests/min

Headers de rate limiting:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1630000000
```

---

## 🔒 Seguridad

- Todas las rutas de usuario requieren autenticación
- Validación de inputs en todas las rutas
- Sanitización de datos para prevenir XSS
- Protección CSRF en todas las rutas POST
- Rate limiting por IP y usuario

---

## 📝 Versionado

### v4.0 (2026-10-28)
- Nueva API de gamificación
- Nueva API de leaderboard
- Nueva API de cupones
- Mejoras en búsqueda semántica
- Optimización de respuestas

### v3.0 (2026-09-01)
- API de reseñas
- API de favoritos
- API de carrito
- API de productos
- Internacionalización

---

**Última actualización**: 2026-10-28  
**Contacto**: hola@ecomarket.com  
**Documentación**: https://ecomarket.onrender.com/api/docs