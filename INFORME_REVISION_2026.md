# Informe de Revisión y Mejoras — EcoMarket (2026)

> Revisión a profundidad del sitio en vivo (`https://ecomarket-19.onrender.com/`) y del código
> del repositorio. Se detectaron mecánicas rotas, se corrigieron las de mayor impacto y se
> dejaron documentadas las siguientes fases de mejora.

---

## 1. Contexto

La plataforma es un marketplace ecológico (Flask + SQLite + JavaScript plano). El renderizado
servidor funciona bien (catálogo, filtros, login, CSRF, recálculo de precios desde la BD). El
grueso de los fallos estaban en **mecánicas JavaScript** y en **widgets "enterprise" que llamaban
a endpoints inexistentes (404)**.

---

## 2. Fallos detectados y estado

| # | Fallo | Tipo | Severidad | Estado |
|---|-------|------|-----------|--------|
| 1 | Mini-carrito flotante FALSO (3 items $44.99, botón con alert) duplicado en todas las páginas | Visual/interacción | 🔴 Alta | ✅ Corregido |
| 2 | Botón "Volver arriba" nunca aparecía (`window.scrollY` inexistente) | Visual/funcional | 🔴 Alta | ✅ Corregido |
| 3 | Comparador de productos → `/api/compare` (404) | Funcional | 🔴 Alta | ✅ Corregido |
| 4 | Recomendaciones IA → `/api/recommendations` (404) | Funcional | 🟠 Media | ✅ Corregido |
| 5 | Banners → `/api/banners/activos` (404) | Funcional | 🟠 Media | ✅ Corregido |
| 6 | Cupones disponibles → `/api/cupones/disponibles` (404) | Funcional | 🟠 Media | ✅ Corregido |
| 7 | Voto de reseñas → `/api/reviews/vote` (404) | Funcional | 🟠 Media | ✅ Corregido |
| 8 | Wishlist smart → `/api/recomendaciones/wishlist` (404) | Funcional | 🟠 Media | ✅ Corregido |
| 9 | Sync offline PWA → `/api/cart/sync` y `/api/reviews` (404) | Funcional | 🟡 Baja | ✅ Corregido |
| 10 | Cupones del front no aplicados por el backend en el pedido (total inconsistente) | Lógica de compra | 🟠 Media | ✅ Corregido |
| 11 | Redirect de login apuntaba a `perfil.html` (estático) en vez de `/perfil` | Navegación | 🟡 Baja | ✅ Corregido |

---

## 2. Qué se corrigió (detalle técnico)

### `app.py` — endpoints nuevos
- `GET /api/recommendations` → `{"products":[...]}` (IA + comparador).
- `POST /api/compare` (ids) → `{"products":[...]}`.
- `GET /api/banners/activos` → banners activos.
- `GET /api/cupones/disponibles` → cupones vigentes.
- `GET /api/recomendaciones/wishlist` → lista para el wishlist smart.
- `POST /api/reviews/vote` (login) → voto de reseñas; **nueva tabla `resena_votos`**.
- `POST /api/reviews` y `POST /api/cart/sync` → sincronización offline del PWA.
- Helper `_producto_api_json()` que unifica el formato de producto que esperan los widgets.
- Seed de cupones **idempotente** (`INSERT OR IGNORE`) e incluye **ECO50**.

### `templates/checkout.html` + `app.py` — cupones unificados
- El checkout ahora envía `coupon: EcoCart.getAppliedCoupon()`.
- El backend valida el cupón (mínimo, caducidad, usos, tipo %) y **aplica el descuento al total
  del pedido**. El número del pedido coincide con el total que ve el usuario.

### `js/login.js`
- Redirigió correctamente a la ruta `/perfil` tras el login.

> Nota: estos cambios son "no romper": los widgets avanzados ya no fallan en silencio; además los
> endpoints quedan listos para que las features que los usan funcionen.

---

## 3. Mejoras adicionales posibles

### Mecánicas (funcionalidad)
- [ ] **Pasarela de pago real** (Stripe / Mercado Pago / Yape). Hoy el checkout guarda el pedido
      pero no cobra.
- [ ] **Carrito persistente por usuario** (tabla `carrito` en BD) en vez de solo `localStorage`,
      para sincronizar entre dispositivos.
- [ ] **Precio de envío calculado en el backend** y reflejado en el pedido (hoy es solo del cliente).
- [ ] **Estado y seguimiento de pedido** (pendiente / pagado / enviado / entregado) con notificación.
- [ ] **Devoluciones** completas: solicitud, aprobación y reembolso.
- [ ] **Valoraciones con fotos** y verificación de "compra verificada".
- [ ] **Notificaciones por email** (confirmación de pedido, envío, cupón ganado).
- [ ] **PWA sincronizado completo** (login + carrito multicars dispositivo).

### Diseño / UI
- [ ] Unificar la **duplicación de estilos** (CSS "enterprise" vs `eco-market.css`) para reducir
      el peso de arranque.
- [ ] **Carga diferida (lazy)** de los ~100 scripts decorativos y CSS para mejorar el rendimiento.
- [ ] **Imágenes con `srcset`/dimensiones explícitas** para mejor LCP.
- [ ] **Accesibilidad**: focos visibles, ARIA en cards, contraste AA en modo oscuro.

### Funciones/negocio
- [ ] Panel de vendedor con **ventas, reseñas y métricas de impacto** (ya hay `eco-dashboard-stats`).
- [ ] **Plan de fidelidad**: puntos eco canjeables (ya están los módulos; falta recalcular con BD).
- [ ] **Comparador** con tabla lado a lado y exportación.
- [ ] Google Login funcional (falta configurar `GOOGLE_CLIENT_ID` en el entorno de Render).
- [ ] Respuestas de IA del `/api/chat` conectadas a filtros reales del catálogo.

---

## 4. Estado de despliegue

- Los cambios están confirmados en el repositorio local con mensaje descriptivo (ver `git log`).
- **Para publicar**: hacer push (un commit a la rama principal dispara el rebuild de Render).
  Al arrancar, `init_db` crea `resena_votos` automáticamente; no hace falta migración manual.
- **Recomendado probar en el despliegue**: agregar a carrito, checkout con cupón (p.ej. `ECO10` o
  `BIENVENIDO`), comparador, banner, voto de reseña.

---

*Generado por revisión asistida. Fecha: 2026-08-19.*
### `templates/base.html`
- Se retiró `eco-mini-cart.css` y `eco-mini-cart.js` (el widget falso con datos hardcodeados).
- Se reescribió el script de `#backToTop` para detectar el scroll correctamente
  (`document.documentElement.scrollTop` con fallback) y con guard de null.

### `static/eco-ux.js` y `static/polish.js`
- Nuevo helper `getScrollY()` reutilizable y `window.scrollY` reemplazado por lectura válida.
- `eco-ux` ya no crea un segundo botón si `#backToTop` ya existe (evita duplicados).