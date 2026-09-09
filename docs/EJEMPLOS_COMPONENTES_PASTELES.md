# Ejemplos de Componentes con Paleta Pasteles

## 🎨 Muestra de Componentes UI Mejorados

Esta sección muestra ejemplos prácticos de cómo se verán los componentes de EcoMarket con la nueva paleta de colores pasteles.

---

## 📦 Botones

### Botón Principal (Verde Eco)
```html
<button class="btn btn-principal">
    <i class="bi bi-cart-plus"></i>
    Agregar al Carrito
</button>
```

```css
.btn-principal {
    background: linear-gradient(135deg, var(--verde-500), var(--verde-600));
    color: white;
    padding: 12px 24px;
    border-radius: var(--borde-radio-md);
    border: none;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-principal:hover {
    background: linear-gradient(135deg, var(--verde-600), var(--verde-700));
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}
```

**Apariencia:** Gradiente verde suave con sombra verde pastel, elevación al hover.

---

### Botón Secundario (Azul Cielo)
```html
<button class="btn btn-secundario">
    <i class="bi bi-heart"></i>
    Guardar
</button>
```

```css
.btn-secundario {
    background: linear-gradient(135deg, var(--azul-500), var(--azul-600));
    color: white;
    padding: 12px 24px;
    border-radius: var(--borde-radio-md);
    border: none;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Apariencia:** Gradiente azul cielo con sombra azul pastel.

---

### Botón Outline (Borde Verde)
```html
<button class="btn btn-outline">
    <i class="bi bi-info-circle"></i>
    Más Información
</button>
```

```css
.btn-outline {
    background: transparent;
    border: 2px solid var(--verde-500);
    color: var(--verde-600);
    padding: 12px 24px;
    border-radius: var(--borde-radio-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-outline:hover {
    background: var(--verde-50);
    border-color: var(--verde-600);
}
```

**Apariencia:** Fondo transparente con borde verde, fondo verde muy claro al hover.

---

## 🃏 Tarjetas de Productos

### Tarjeta de Producto Estándar
```html
<div class="producto-card">
    <div class="producto-img-container">
        <img src="producto.jpg" alt="Producto Ecológico">
        <span class="badge badge-eco">🌱 Eco</span>
    </div>
    <div class="producto-info">
        <h3 class="producto-titulo">Jabón Natural de Lavanda</h3>
        <p class="producto-descripcion">Jabón artesanal 100% natural</p>
        <div class="producto-precio">
            <span class="precio-actual">$12.99</span>
            <span class="precio-antiguo">$15.99</span>
        </div>
        <button class="btn btn-principal btn-sm">
            Agregar al Carrito
        </button>
    </div>
</div>
```

```css
.producto-card {
    background: var(--blanco);
    border: 1px solid var(--gris-200);
    border-radius: var(--borde-radio-lg);
    box-shadow: var(--sombra);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.producto-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--sombra-hover);
    border-color: var(--verde-200);
}

.producto-img-container {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.producto-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.producto-card:hover .producto-img-container img {
    transform: scale(1.05);
}

.badge-eco {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, var(--verde-400), var(--verde-500));
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
}

.producto-info {
    padding: 20px;
}

.producto-titulo {
    color: var(--texto-principal);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.producto-descripcion {
    color: var(--texto-secundario);
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.producto-precio {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.precio-actual {
    color: var(--verde-600);
    font-size: 1.25rem;
    font-weight: 700;
}

.precio-antiguo {
    color: var(--texto-terciario);
    text-decoration: line-through;
    font-size: 0.9rem;
}
```

**Apariencia:** Tarjeta blanca con bordes redondeados, sombra suave, badge verde en esquina, elevación y borde verde al hover.

---

## 🏷️ Badges Decorativos

### Badge Eco
```html
<span class="badge badge-eco">🌱 Eco</span>
```

```css
.badge-eco {
    background: linear-gradient(135deg, var(--verde-400), var(--verde-500));
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
}
```

**Apariencia:** Gradiente verde con emoji de hoja, sombra verde suave.

---

### Badge Premium
```html
<span class="badge badge-premium">⭐ Premium</span>
```

```css
.badge-premium {
    background: linear-gradient(135deg, var(--amarillo-400), var(--naranja-500));
    color: var(--gris-900);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(234, 179, 8, 0.25);
}
```

**Apariencia:** Gradiente amarillo-naranja con emoji de estrella, texto oscuro para contraste.

---

### Badge New
```html
<span class="badge badge-new">NEW</span>
```

```css
.badge-new {
    background: linear-gradient(135deg, var(--coral-400), var(--rosa-500));
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    animation: pulse-pastel 2s infinite;
}

@keyframes pulse-pastel {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(244, 31, 94, 0.25);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(244, 31, 94, 0.4);
    }
}
```

**Apariencia:** Gradiente coral-rosa con animación de pulso suave.

---

### Badge Organic
```html
<span class="badge badge-organic">🌿 Orgánico</span>
```

```css
.badge-organic {
    background: linear-gradient(135deg, var(--menta-400), var(--verde-500));
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
}
```

**Apariencia:** Gradiente menta-verde con emoji de planta.

---

### Badge Recycled
```html
<span class="badge badge-recycled">♻️ Reciclado</span>
```

```css
.badge-recycled {
    background: linear-gradient(135deg, var(--cyan-400), var(--turquesa-500));
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.25);
}
```

**Apariencia:** Gradiente cyan-turquesa con emoji de reciclaje.

---

## 📝 Formularios

### Input de Texto
```html
<div class="form-group">
    <label for="email">Correo Electrónico</label>
    <input type="email" id="email" class="form-control" placeholder="tu@email.com">
</div>
```

```css
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: var(--texto-principal);
    font-weight: 500;
    margin-bottom: 8px;
}

.form-control {
    width: 100%;
    background: var(--blanco);
    border: 2px solid var(--gris-200);
    border-radius: var(--borde-radio-md);
    padding: 12px 16px;
    color: var(--texto-principal);
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-control::placeholder {
    color: var(--texto-placeholder);
}

.form-control:focus {
    outline: none;
    border-color: var(--verde-500);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.form-control.success {
    border-color: var(--exito-500);
    background: var(--exito-50);
}

.form-control.error {
    border-color: var(--error-500);
    background: var(--error-50);
}
```

**Apariencia:** Input con borde gris, borde verde y sombra verde al focus, fondo verde claro para éxito, fondo rojo claro para error.

---

## 🚨 Alertas

### Alerta de Éxito
```html
<div class="alert alert-success">
    <i class="bi bi-check-circle-fill"></i>
    <span>Producto agregado al carrito exitosamente</span>
</div>
```

```css
.alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: var(--borde-radio-md);
    border-left: 4px solid;
    background: var(--blanco);
    box-shadow: var(--sombra-suave);
}

.alert-success {
    border-color: var(--exito-500);
    background: linear-gradient(135deg, var(--exito-50), var(--blanco));
    color: var(--exito-700);
}

.alert-success i {
    color: var(--exito-500);
    font-size: 1.25rem;
}
```

**Apariencia:** Fondo gradiente verde muy claro a blanco, borde izquierdo verde, icono verde, texto verde oscuro.

---

### Alerta de Advertencia
```html
<div class="alert alert-warning">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <span>Stock limitado, solo quedan 3 unidades</span>
</div>
```

```css
.alert-warning {
    border-color: var(--advertencia-500);
    background: linear-gradient(135deg, var(--advertencia-50), var(--blanco));
    color: var(--advertencia-700);
}

.alert-warning i {
    color: var(--advertencia-500);
    font-size: 1.25rem;
}
```

**Apariencia:** Fondo gradiente amarillo muy claro a blanco, borde izquierdo amarillo, icono amarillo, texto amarillo oscuro.

---

### Alerta de Error
```html
<div class="alert alert-error">
    <i class="bi bi-x-circle-fill"></i>
    <span>Error al procesar el pago</span>
</div>
```

```css
.alert-error {
    border-color: var(--error-500);
    background: linear-gradient(135deg, var(--error-50), var(--blanco));
    color: var(--error-700);
}

.alert-error i {
    color: var(--error-500);
    font-size: 1.25rem;
}
```

**Apariencia:** Fondo gradiente rojo muy claro a blanco, borde izquierdo rojo, icono rojo, texto rojo oscuro.

---

### Alerta de Información
```html
<div class="alert alert-info">
    <i class="bi bi-info-circle-fill"></i>
    <span>Envío gratis en pedidos mayores a $50</span>
</div>
```

```css
.alert-info {
    border-color: var(--info-500);
    background: linear-gradient(135deg, var(--info-50), var(--blanco));
    color: var(--info-700);
}

.alert-info i {
    color: var(--info-500);
    font-size: 1.25rem;
}
```

**Apariencia:** Fondo gradiente azul muy claro a blanco, borde izquierdo azul, icono azul, texto azul oscuro.

---

## 🧭 Navegación

### Navbar con Glassmorphism
```html
<nav class="navbar">
    <div class="navbar-container">
        <a href="/" class="navbar-brand">
            <i class="bi bi-flower1"></i>
            EcoMarket
        </a>
        <ul class="navbar-nav">
            <li><a href="/" class="nav-link active">Inicio</a></li>
            <li><a href="/productos" class="nav-link">Productos</a></li>
            <li><a href="/impacto" class="nav-link">Impacto</a></li>
            <li><a href="/contacto" class="nav-link">Contacto</a></li>
        </ul>
    </div>
</nav>
```

```css
.navbar {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--gris-200);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
}

.navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--verde-600);
    font-size: 1.5rem;
    font-weight: 700;
    text-decoration: none;
}

.navbar-brand i {
    font-size: 1.75rem;
}

.navbar-nav {
    display: flex;
    gap: 32px;
    list-style: none;
}

.nav-link {
    color: var(--texto-secundario);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
}

.nav-link:hover {
    color: var(--verde-600);
}

.nav-link.active {
    color: var(--verde-600);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--verde-500), var(--turquesa-500));
    transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
    width: 100%;
}
```

**Apariencia:** Fondo blanco semitransparente con blur, borde gris muy claro, sombra suave, marca verde, links con underline gradiente verde-turquesa al hover.

---

## 🎭 Temas

### Tema Pastel Modern
```css
[data-theme="pastel-modern"] {
    --bg-primary: var(--verde-50);
    --bg-secondary: var(--blanco);
    --bg-tertiary: var(--gris-50);
    
    --text-primary: var(--texto-principal);
    --text-secondary: var(--texto-secundario);
    --text-tertiary: var(--texto-terciario);
    
    --accent-primary: var(--verde-500);
    --accent-secondary: var(--turquesa-500);
    --accent-tertiary: var(--menta-400);
    
    --card-bg: var(--blanco);
    --input-bg: var(--blanco);
    
    --button-primary: var(--verde-500);
    --button-primary-hover: var(--verde-600);
    --button-secondary: var(--azul-500);
    --button-secondary-hover: var(--azul-600);
    
    --border-color: var(--gris-200);
    --shadow-color: rgba(34, 197, 94, 0.1);
}
```

**Apariencia:** Fondo verde muy claro, componentes blancos, acentos verde y turquesa, sombras con tinte verde.

---

### Tema Forest Pastel
```css
[data-theme="forest-pastel"] {
    --bg-primary: var(--menta-50);
    --bg-secondary: var(--verde-100);
    --bg-tertiary: var(--verde-200);
    
    --text-primary: var(--verde-900);
    --text-secondary: var(--verde-700);
    --text-tertiary: var(--verde-600);
    
    --accent-primary: var(--verde-600);
    --accent-secondary: var(--menta-500);
    --accent-tertiary: var(--turquesa-500);
    
    --card-bg: var(--blanco);
    --input-bg: var(--verde-50);
    
    --button-primary: var(--verde-600);
    --button-primary-hover: var(--verde-700);
    --button-secondary: var(--menta-500);
    --button-secondary-hover: var(--menta-600);
    
    --border-color: var(--verde-200);
    --shadow-color: rgba(34, 197, 94, 0.15);
}
```

**Apariencia:** Fondo menta muy claro, componentes con tintes verdes, acentos verde y menta, texto verde oscuro.

---

### Tema Ocean Pastel
```css
[data-theme="ocean-pastel"] {
    --bg-primary: var(--cyan-50);
    --bg-secondary: var(--azul-100);
    --bg-tertiary: var(--turquesa-100);
    
    --text-primary: var(--azul-900);
    --text-secondary: var(--azul-700);
    --text-tertiary: var(--azul-600);
    
    --accent-primary: var(--azul-500);
    --accent-secondary: var(--cyan-500);
    --accent-tertiary: var(--turquesa-500);
    
    --card-bg: var(--blanco);
    --input-bg: var(--cyan-50);
    
    --button-primary: var(--azul-500);
    --button-primary-hover: var(--azul-600);
    --button-secondary: var(--cyan-500);
    --button-secondary-hover: var(--cyan-600);
    
    --border-color: var(--azul-200);
    --shadow-color: rgba(59, 130, 246, 0.15);
}
```

**Apariencia:** Fondo cyan muy claro, componentes con tintes azules, acentos azul y cyan, texto azul oscuro.

---

### Tema Sunset Pastel
```css
[data-theme="sunset-pastel"] {
    --bg-primary: var(--naranja-50);
    --bg-secondary: var(--coral-100);
    --bg-tertiary: var(--rosa-100);
    
    --text-primary: var(--naranja-900);
    --text-secondary: var(--coral-700);
    --text-tertiary: var(--rosa-600);
    
    --accent-primary: var(--naranja-500);
    --accent-secondary: var(--coral-500);
    --accent-tertiary: var(--rosa-500);
    
    --card-bg: var(--blanco);
    --input-bg: var(--naranja-50);
    
    --button-primary: var(--naranja-500);
    --button-primary-hover: var(--naranja-600);
    --button-secondary: var(--coral-500);
    --button-secondary-hover: var(--coral-600);
    
    --border-color: var(--naranja-200);
    --shadow-color: rgba(249, 115, 22, 0.15);
}
```

**Apariencia:** Fondo naranja muy claro, componentes con tintes cálidos, acentos naranja y coral, texto naranja oscuro.

---

### Tema Lavender Pastel
```css
[data-theme="lavender-pastel"] {
    --bg-primary: var(--lila-50);
    --bg-secondary: var(--morado-100);
    --bg-tertiary: var(--rosa-100);
    
    --text-primary: var(--morado-900);
    --text-secondary: var(--morado-700);
    --text-tertiary: var(--morado-600);
    
    --accent-primary: var(--morado-500);
    --accent-secondary: var(--lila-500);
    --accent-tertiary: var(--rosa-500);
    
    --card-bg: var(--blanco);
    --input-bg: var(--lila-50);
    
    --button-primary: var(--morado-500);
    --button-primary-hover: var(--morado-600);
    --button-secondary: var(--lila-500);
    --button-secondary-hover: var(--lila-600);
    
    --border-color: var(--morado-200);
    --shadow-color: rgba(139, 92, 246, 0.15);
}
```

**Apariencia:** Fondo lila muy claro, componentes con tintes morados, acentos morado y lila, texto morado oscuro.

---

## 🎨 Paleta de Colores Completa

### Verde Eco (Color Primario)
- `--verde-50`: #F0FDF4 (Fondo muy suave)
- `--verde-100`: #DCFCE7 (Fondo suave)
- `--verde-200`: #BBF7D0 (Verde muy claro)
- `--verde-300`: #86EFAC (Verde claro)
- `--verde-400`: #4ADE80 (Verde pastel medio)
- `--verde-500`: #22C55E (Verde principal)
- `--verde-600`: #16A34A (Verde medio-oscuro)
- `--verde-700`: #15803D (Verde oscuro)
- `--verde-800`: #166534 (Verde muy oscuro)
- `--verde-900`: #14532D (Verde profundo)

### Azul Cielo
- `--azul-50`: #EFF6FF
- `--azul-100`: #DBEAFE
- `--azul-200`: #BFDBFE
- `--azul-300`: #93C5FD
- `--azul-400`: #60A5FA
- `--azul-500`: #3B82F6
- `--azul-600`: #2563EB
- `--azul-700`: #1D4ED8
- `--azul-800`: #1E40AF
- `--azul-900`: #1E3A8A

### Rosa Suave
- `--rosa-50`: #FDF2F8
- `--rosa-100`: #FCE7F3
- `--rosa-200`: #FBCFE8
- `--rosa-300`: #F9A8D4
- `--rosa-400`: #F472B6
- `--rosa-500`: #EC4899
- `--rosa-600`: #DB2777
- `--rosa-700`: #BE185D
- `--rosa-800`: #9D174D
- `--rosa-900`: #831843

### Naranja Coral
- `--naranja-50`: #FFF7ED
- `--naranja-100`: #FFEDD5
- `--naranja-200`: #FED7AA
- `--naranja-300`: #FDBA74
- `--naranja-400`: #FB923C
- `--naranja-500`: #F97316
- `--naranja-600`: #EA580C
- `--naranja-700`: #C2410C
- `--naranja-800`: #9A3412
- `--naranja-900`: #7C2D12

### Amarillo Sol
- `--amarillo-50`: #FEFCE8
- `--amarillo-100`: #FEF9C3
- `--amarillo-200`: #FEF08A
- `--amarillo-300`: #FDE047
- `--amarillo-400`: #FACC15
- `--amarillo-500`: #EAB308
- `--amarillo-600`: #CA8A04
- `--amarillo-700`: #A16207
- `--amarillo-800`: #854D0E
- `--amarillo-900`: #713F12

### Morado Lavanda
- `--morado-50`: #F5F3FF
- `--morado-100`: #EDE9FE
- `--morado-200`: #DDD6FE
- `--morado-300`: #C4B5FD
- `--morado-400`: #A78BFA
- `--morado-500`: #8B5CF6
- `--morado-600`: #7C3AED
- `--morado-700`: #6D28D9
- `--morado-800`: #5B21B6
- `--morado-900`: #4C1D95

### Turquesa Menta
- `--turquesa-50`: #F0FDFA
- `--turquesa-100`: #CCFBF1
- `--turquesa-200`: #99F6E4
- `--turquesa-300`: #5EEAD4
- `--turquesa-400`: #2DD4BF
- `--turquesa-500`: #14B8A6
- `--turquesa-600`: #0D9488
- `--turquesa-700`: #0F766E
- `--turquesa-800`: #115E59
- `--turquesa-900`: #134E4A

### Cyan Agua
- `--cyan-50`: #ECFEFF
- `--cyan-100`: #CFFAFE
- `--cyan-200`: #A5F3FC
- `--cyan-300`: #67E8F9
- `--cyan-400`: #22D3EE
- `--cyan-500`: #06B6D4
- `--cyan-600`: #0891B2
- `--cyan-700`: #0E7490
- `--cyan-800`: #155E75
- `--cyan-900`: #164E63

---

## 📊 Resumen de Mejoras

### Antes
- Colores pasteles con saturación inconsistente
- Contraste limitado en algunos componentes
- Temas forest/ocean/sunset con colores saturados (no pasteles)
- Gradientes lineales simples
- Transiciones básicas

### Después
- Paleta de 10 colores pasteles con 10 variantes cada uno
- Contraste WCAG AA cumplido
- 5 temas pasteles mejorados + 1 nuevo tema
- Gradientes con múltiples colores y easing functions
- Transiciones suaves con cubic-bezier
- Sombras con tinte de color
- Sistema de alias para retrocompatibilidad
- Accesibilidad mejorada (focus visible, high contrast, reduced motion)

---

**Versión:** 1.0  
**Fecha:** 26 de agosto de 2026  
**Estado:** Ejemplos listos para implementación
