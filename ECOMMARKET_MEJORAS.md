# Plan de Mejoras - EcoMarket Professional

## Problemas Identificados

### 1. ICONOGRAFÍA INCONSISTENTE
- **index.html**: Mezcla emoji (🏠💧🪥🌿🥗👕) con Bootstrap Icons
- **checkout.html**: Usa emoji 💳📱 en métodos de pago
- **contacto.html**: Mezcla iconos sin consistencia
- **admin.html**: Tabla sin iconos en acciones

### 2. ESPACIOS VACÍOS Y ESTRUCTURA
- **index.html**: CSS inline excesivo produce espacios inconsistentes
- **checkout.html**: Grid 1fr 360px sin responsive en mobile
- **detalle-producto.html**: Grid reseñas 280px 1fr sin media query

### 3. COLORES INCONSISTENTES
- Hardcoded colors en múltiples archivos
- Mezcla de var(--verde) con #2e7d32 directo
- Fondos blancos vs var(--blanco) mezclados

### 4. RESPONSIVE INCOMPLETO
- index.html: 6 columnas categorías necesita mejora
- checkout.html necesita colapsar a 1 columna en mobile
- Varias páginas sin @media queries específicas

### 5. ANIMACIONES
- Solo index.html tiene animación pulse inline
- Otras páginas sin micro-interacciones
- Falta smooth scroll en algunos elementos

### 6. JAVASCRIPT
- Redundancia entre eco-*.js y js/*.js
- Algunos IDs no coinciden entre HTML y JS (ecoMiniCart vs cart badge)
- Falta inicialización consistente

## Plan de Acción

### Fase 1: CSS Unificado
- [ ] Crear eco-professional.css con:
  - Variables CSS centralizadas
  - Clases reutilizables
  - Animaciones globales
  - Componentes consistentes

### Fase 2: Corregir HTMLs
- [ ] index.html: Reemplazar emoji por Bootstrap Icons
- [ ] checkout.html: Mejorar responsive
- [ ] contacto.html: Añadir iconos consistentes
- [ ] admin.html: Mejorar tabla con iconos
- [ ] Todas: Eliminar estilos inline innecesarios

### Fase 3: Mejorar JS
- [ ] Unificar eco-cart.js con static/cart.js
- [ ] Corregir IDs inconsistentes
- [ ] Añadir validaciones

### Fase 4: Testing
- [ ] Verificar Flask funciona
- [ ] Probar responsive en diferentes tamaños
- [ ] Verificar iconografía
- [ ] Probar animaciones

## Prioridades
1. ALTA: Iconografía inconsistente (afecta imagen profesional)
2. ALTA: Espacios vacíos y estructura
3. MEDIA: Responsive incompleto
4. MEDIA: Colores inconsistentes
5. BAJA: Animaciones (no crítico)
6. BAJA: JS redundante