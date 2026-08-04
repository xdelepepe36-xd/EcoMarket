# Plan de Mejoras Integral - EcoMarket

## Problemas Identificados

### Fase 1: CSS (Prioridad Alta)
- [ ] Demasiados archivos CSS (style.css, eco-professional.css, eco-nav.css, eco-dark.css, animations.css, notifications.css, modal.css, polish.css, + css/*.css)
- [ ] 484 líneas de CSS inline en index.html
- [ ] Colores hardcodeados mezclados con variables CSS
- [ ] Duplicación de estilos entre archivos

### Fase 2: JavaScript (Prioridad Alta)
- [ ] 30+ archivos JS cargados en base.html (muchas peticiones HTTP)
- [ ] Redundancia: eco-cart.js + cart.js, eco-favorites.js + favorites.js, eco-theme.js + theme.js, etc.
- [ ] Archivos duplicados en root (eco-*.js) y static/eco-*.js

### Fase 3: Templates (Prioridad Media)
- [ ] Iconos inconsistentes (emoji vs Bootstrap Icons)
- [ ] Falta de loading states y skeleton screens
- [ ] Falta de validación visual en formularios
- [ ] Responsive mejorable en algunas páginas

### Fase 4: Backend (Prioridad Media)
- [ ] Falta de protección CSRF
- [ ] Falta rate limiting
- [ ] Admin hardcodeado por email específico
- [ ] Mejorar validación de datos

### Fase 5: PWA & Performance (Prioridad Media)
- [ ] Service worker básico necesita mejora
- [ ] Falta lazy loading de imágenes
- [ ] Manifest.json minimalista

### Fase 6: Accesibilidad & SEO (Prioridad Baja)
- [ ] Faltan ARIA labels
- [ ] Faltan meta tags de Open Graph
- [ ] Falta structured data (JSON-LD)