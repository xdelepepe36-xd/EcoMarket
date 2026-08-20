# Informe de Mejoras — EcoMarket (2026)

> Informe final del trabajo realizado sobre el sitio `https://ecomarket-19.onrender.com/`.
> Resume la revisión, las correcciones y las mejoras de funcionalidad implementadas, y el estado
> para su publicación en producción (Render).

---

## 1. Resumen

- **Antes:** el renderizado servidor y el catálogo funcionaban, pero varios widgets "enterprise"
  llamaban a endpoints inexistentes (404), había un mini-carrito falso con datos inventados en
  cada página, y la lógica de cupones/checkout era inconsistente entre front y backend.
- **Después:** se corrigieron los fallos visibles, se añadieron los endpoints que faltaban y se
  añadieron mejoras funcionales de pedidos (estado/seguimiento, envío real, compra verificada,
  panel de vendedor).

---

## 2. Correcciones (fase 1)

### 2.1 Visuales / UI
- **Mini-carrito falso eliminado** (`eco-mini-cart.js` + `eco-mini-cart.css`): mostraba 3
  productos ficticios ($44.99) y el botón solo hacía `alert`. Se quitó de `base.html`.
- **Botón "volver arriba" reparado:** se detecta el scroll correctamente (antes `window.scrollY`
  siempre daba `undefined`) y `eco-ux` ya no crea un botón duplicado.

### 2.2 Endpoints nuevos (`app.py`)
| Endpoint | Función |
|---|---|
| `GET /api/recommendations` | Recomendaciones e IA |
| `POST /api/compare` | Comparador de productos |
| `GET /api/banners/activos` | Banners rotativos |
| `GET /api/cupones/disponibles` | Cupones vigentes (incluye `ECO50`) |
| `GET /api/recomendaciones/wishlist` | Wishlist smart |
| `POST /api/reviews/vote` | Voto de reseñas (tabla `resena_votos`) |
| `POST /api/reviews` y `POST /api/cart/sync` | Sync offline (PWA) |

### 2.3 Cupones y checkout coherentes
- El front envía el cupón aplicado y el **backend valida y aplica el descuento** al total del pedido.
- Los totales mostrados y guardados coinciden.

---

## 3. Mejoras de funcionalidad (fase 2)

1. **Envío real calculado en el servidor** (gratis ≥ S/.150; si no S/.12; cupón `ENVIOFREE`
   lo exime). Nuevas columnas: `pedidos.envio`, `pedidos.descuento`.
2. **Estado y seguimiento de pedido**:
   - Confirmación con datos reales (ítems, envío, descuento, total) y timeline.
   - Admin cambia estado (`/admin/pedido/<id>/estado`) y se notifica al cliente.
   - Estados: `pendiente → confirmado → pagado → enviado → entregado` (o `cancelado`).
3. **Valoración con "compra verificada"**: el backend marca `resenas.compra_verificada` cuando el
   usuario realmente compró el producto.
4. **Panel del vendedor**: `/perfil` muestra "Mis ventas" (pedidos con tus productos, estado,
   subtotal y comprador).

---

## 4. Validación realizada

- `python -m py_compile app.py` → OK.
- Plantillas Jinja2 compiladas sin errores.
- Smoke test (BD temporal): `/`, `/productos`, `/api/recommendations`, `/api/cupones/disponibles`,
  `/api/banners/activos`, `/api/recomendaciones/wishlist`, `POST /api/compare` → respuestas OK.
- Las migraciones añaden `envio`, `descuento`, `compra_verificada` y la tabla `resena_votos`
  automáticamente al arrancar.

---

## 5. Estado de despliegue

- Los commits están en la rama **`main`** lista para publicar en GitHub.
- Como Render despliega desde git, **al hacer push se reconstruye** el servicio y la app crea
  solas las tablas/columnas nuevas.
- Tras el push, conviene probar: agregar al carrito → checkout con cupón (`ECO10`, `BIENVENIDO`,
  `ENVIOFREE`) → confirmación → cambiar estado desde /admin → ver "Mis ventas" en el perfil.

---

## 6. Pendientes (requieren credenciales o más alcance)

- [ ] Pasarela de pago real (Stripe / Mercado Pago / Yape) → requiere keys.
- [ ] Email automático (SMTP) → requiere credenciales de correo.
- [ ] Google Login configurado → requiere `GOOGLE_CLIENT_ID` en Render.
- [ ] Carrito persistente en BD sincronizado multi-dispositivo.
- [ ] Devoluciones completas (solicitud → aprobación → reembolso).
- [ ] Fidelidad con puntos eco canjeables.
- [ ] Optimización de carga (lazy de los ~100 scripts decorativos).

---

*Generado por revisión asistida — Fase 1 (correcciones) y Fase 2 (mejoras funcionales). Fecha: 2026-08-19.*