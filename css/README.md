# EcoMarket CSS

Esta carpeta contiene archivos CSS adicionales para el proyecto EcoMarket.

## Archivos

### animations.css
Sistema de animaciones y transiciones optimizado. Incluye:
- Animaciones de entrada (fadeIn, slideIn, scaleIn)
- Animaciones de salida (fadeOut, scaleOut)
- Animaciones de interacción (pulse, shake, bounce)
- Transiciones suaves
- Efectos hover
- Loading animations
- Soporte para prefers-reduced-motion

### components.css
Componentes UI reutilizables. Incluye:
- Botones (primary, secondary, outline, danger, success)
- Tarjetas (card, product-card)
- Badges
- Modales
- Alerts
- Formularios
- Tables
- Progress bars
- Tooltips
- Avatares
- Spinners
- Dropdowns

### responsive.css
Diseño responsive con media queries. Incluye:
- Breakpoints para todos los tamaños de dispositivo
- Adaptaciones para móviles, tablets y desktops
- Orientación específica (portrait/landscape)
- Soporte para high DPI displays
- Estilos para impresión
- Preferencias de reduced motion
- Modo oscuro automático
- Touch devices
- Clases utilitarias responsive

## Uso

Para usar estos archivos en tu proyecto, agrégalos al `<head>` de tu HTML:

```html
<link rel="stylesheet" href="/css/animations.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/responsive.css">
```

## Variables CSS

Los archivos usan variables CSS personalizables definidas en :root:
- `--animation-fast`, `--animation-normal`, `--animation-slow`
- `--easing-smooth`, `--easing-bounce`
- `--btn-primary-bg`, `--btn-primary-hover`
- `--card-shadow`, `--card-shadow-hover`
- etc.

## Optimizaciones

- Prefijos de vendor automáticos (usar PostCSS en producción)
- Minificación recomendada para producción
- Soporte para navegadores modernos
- Fallbacks para navegadores antiguos

## Contribuir

Al añadir nuevos estilos:
1. Mantén consistencia con el sistema de diseño existente
2. Usa variables CSS cuando sea posible
3. Añade comentarios para estilos complejos
4. Incluye ejemplos de uso en comentarios
5. Considera accesibilidad y rendimiento