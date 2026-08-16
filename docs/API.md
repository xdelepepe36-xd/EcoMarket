# 📡 API de EcoMarket (REST)

Endpoints disponibles. Formato de respuesta: JSON.

## Autenticación y cuenta

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/login` | Formulario de inicio de sesión |
| POST | `/registro` | Formulario de registro |
| GET  | `/logout` | Cerrar sesión |
| POST | `/auth/google` | `{credential}` — inicia sesión con Google |
| POST | `/api/set_lang` | `{lang: "es"|"en"}` — idioma de la sesión |

## Catálogo y búsquedas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/buscar?q=` | Búsqueda con autocompletado |
| GET | `/productos` | Catálogo con filtros (categoría, orden, paginación) |
| GET | `/producto/<id>` | Detalle de producto |

## Carrito, cupones y compra

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/cupon/validar` | `{cupon}` — valida un cupón |
| POST | `/checkout` | `{nombre, apellido, email, telefono, direccion, ciudad, items, metodo_pago}` — crea el pedido (validado) |
| GET  | `/confirmacion?pedido_id=` | Confirmación del pedido |

## Perfil y dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard` | Estadísticas del vendedor (require login) |
| GET | `/api/admin/dashboard` | Estadísticas del admin |
| POST | `/api/usuario/<id>/seguir` | Seguir/dejar de seguir |
| POST | `/perfil/actualizar` | Actualizar datos de perfil |
| POST | `/perfil/cambiar_password` | Cambiar contraseña |

## IA

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/chat` | `{message}` — asiste con contexto real de la tienda (bilingüe). Respuesta: `{reply, lang, quick_replies}` |

### Ejemplo `/api/chat`

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "dame 3 productos de accesorios"}'
```

```json
{
  "reply": "🛒 **3 productos de Accesorios:**\n• Set de 4 Popotes de Acero — S/.19.00\n...",
  "lang": "es",
  "quick_replies": ["productos baratos", "Envíos", "Cupones", "Consejos eco", "Mi cuenta"]
}
```

## Códigos de estado

- `200` OK · `400` datos inválidos (con `campos` para errores por campo) ·
- `401` sin sesión · `404` no encontrado · `502` error al verificar Google.