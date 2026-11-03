# 🚀 Guía de Uso - Mejoras Adicionales EcoMarket v3.2

## 📁 Estructura de Mejoras

Todos los sistemas adicionales están organizados en la carpeta `mejoras-adicionales/`:

```
mejoras-adicionales/
├── stripe_payments.py              # Pagos con Stripe
├── api_rest.py                      # API REST documentada
├── courier_integration.py           # Integración couriers
├── email_notifier.py                # Notificaciones por email
├── recommendation_system.py         # Recomendaciones
├── quality_control.py               # Control de calidad
├── support_system.py                # Soporte al cliente
├── inventory_system.py              # Gestión de inventario
├── abuse_report_system.py           # Reportes de abuso
├── return_system.py                 # Devoluciones
├── newsletter_system.py             # Newsletter
├── social_integration.py            # Redes sociales
├── flash_sales.py                   # Flash sales
├── geolocation_system.py            # Geolocalización
├── price_comparator.py              # Comparador de precios
├── ai_description_generator.py      # AI para descripciones
├── auction_system.py                # Sistema de subastas
├── mercadopago_integration.py       # Mercado Pago
├── ecomarket-verificacion-vendedores.js
├── ecomarket-reviews-fotos.js
├── ecomarket-analytics-visual.js
├── ecomarket-favoritos-colecciones.js
├── ecomarket-chat-historial.js
├── busqueda-avanzada.js
└── sw-offline.js                    # Service Worker offline
```

## 🔧 Integración Manual

### 1. Sistema de Pagos Reales (Stripe)

**Configuración:**
```python
from mejoras_adicionales.stripe_payments import StripePaymentSystem

stripe = StripePaymentSystem()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
```

**Uso:**
```python
# Crear intento de pago
intent = stripe.crear_intent_pago(100.00, "Producto X")

# Confirmar pago
estado = stripe.confirmar_pago(payment_intent_id)
```

**Variables de entorno necesarias:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLIC_KEY`

---

### 2. Sistema de Búsqueda Avanzada

**Integración en HTML:**
```html
<input type="text" id="busqueda-input" placeholder="Buscar productos...">
<div id="sugerencias-busqueda"></div>
<div id="historial-busqueda"></div>
```

**Ya integrado en `templates/base.html`**

---

### 3. Sistema de Calidad de Productos

**Uso:**
```python
from mejoras_adicionales.quality_control import QualityControlSystem

qc = QualityControlSystem()
producto = {
    'nombre': 'Botella ecológica',
    'descripcion': 'Botella de bambú...',
    'precio': 35.00,
    'imagenes': ['foto1.jpg']
}

validacion = qc.validar_producto(producto)
if validacion['valido']:
    print("Producto válido")
else:
    print("Errores:", validacion['errores'])
```

---

### 4. Sistema de Soporte al Cliente

**Uso:**
```python
from mejoras_adicionales.support_system import SupportSystem

support = SupportSystem()
ticket = support.crear_ticket(
    usuario_id=1,
    asunto="Problema con pedido",
    descripcion="No llegó mi pedido",
    prioridad="alta"
)
```

---

### 5. Sistema de Gestión de Inventario

**Uso:**
```python
from mejoras_adicionales.inventory_system import InventorySystem

inventory = InventorySystem()
inventory.actualizar_stock(producto_id=1, cantidad=10)
stock = inventory.obtener_stock(producto_id=1)
```

---

### 6. Sistema de Reportes de Abuso

**Uso:**
```python
from mejoras_adicionales.abuse_report_system import AbuseReportSystem

abuse = AbuseReportSystem()
reporte = abuse.crear_reporte(
    usuario_id=1,
    reportado_id=2,
    tipo='producto_inapropiado',
    descripcion='Contenido ofensivo'
)
```

---

### 7. Sistema de Devoluciones

**Uso:**
```python
from mejoras_adicionales.return_system import ReturnSystem

returns = ReturnSystem()
devolucion = returns.crear_solicitud_devolucion(
    pedido_id=123,
    producto_id=456,
    usuario_id=1,
    razon='producto_defectuoso',
    descripcion='Llegó roto'
)
```

---

### 8. Sistema de Newsletter

**Uso:**
```python
from mejoras_adicionales.newsletter_system import NewsletterSystem

newsletter = NewsletterSystem()
newsletter.suscribir('usuario@email.com', 'Juan', ['ofertas', 'nuevos'])
campana = newsletter.crear_campana('Ofertas Semanales', '<html>...</html>')
```

---

### 9. Integración Redes Sociales

**Uso:**
```python
from mejoras_adicionales.social_integration import SocialIntegration

social = SocialIntegration()
url_auth = social.obtener_url_auth('facebook', 'https://ecomarket.com/callback')
url_compartir = social.compartir_producto('facebook', 'https://ecomarket.com/p/1', 'Botella', 'Ecológica')
```

---

### 10. Sistema de Flash Sales

**Uso:**
```python
from mejoras_adicionales.flash_sales import FlashSaleSystem

flash = FlashSaleSystem()
oferta = flash.crear_oferta(
    producto_id=1,
    descuento=30,  # 30% de descuento
    fecha_inicio=datetime.now(),
    duracion_horas=24
)
```

---

### 11. Sistema de Geolocalización

**Uso:**
```python
from mejoras_adicionales.geolocation_system import GeolocationSystem

geo = GeolocationSystem()
geo.registrar_ubicacion(usuario_id=1, latitud=-12.0464, longitud=-77.0428, direccion="Lima")
vendedores_cercanos = geo.buscar_vendedores_cercanos(usuario_id=1, radio_km=10)
```

---

### 12. Comparador de Precios Externo

**Uso:**
```python
from mejoras_adicionales.price_comparator import PriceComparator

comparator = PriceComparator()
comparaciones = comparator.comparar_precio("Botella", 35.00)
mejor_precio = comparator.obtener_mejor_precio("Botella")
```

---

### 13. AI para Generar Descripciones

**Uso:**
```python
from mejoras_adicionales.ai_description_generator import AIDescriptionGenerator

ai = AIDescriptionGenerator()
producto = {'nombre': 'Botella', 'categoria': 'Higiene', 'precio': 35.00}
descripcion = ai.generar_descripcion(producto)
```

---

### 14. Sistema de Subastas

**Uso:**
```python
from mejoras_adicionales.auction_system import AuctionSystem

auction = AuctionSystem()
subasta = auction.crear_subasta(producto_id=1, vendedor_id=2, precio_base=100, duracion_horas=24)
auction.iniciar_subasta(subasta_id=1)
auction.hacer_puja(subasta_id=1, usuario_id=3, monto=150)
```

---

### 15. Integración Mercado Pago

**Uso:**
```python
from mejoras_adicionales.mercadopago_integration import MercadoPagoIntegration

mp = MercadoPagoIntegration()
preferencia = mp.crear_preferencia_pago([{'title': 'Producto', 'quantity': 1, 'unit_price': 100}], {'email': 'user@email.com'})
```

---

## 🎨 Integración Frontend

Los siguientes scripts JS ya están integrados en `templates/base.html`:

1. **ecomarket-verificacion-vendedores.js** - Verificación de vendedores
2. **ecomarket-reviews-fotos.js** - Reviews con fotos
3. **ecomarket-analytics-visual.js** - Dashboard visual
4. **ecomarket-favoritos-colecciones.js** - Favoritos con colecciones
5. **ecomarket-chat-historial.js** - Chat con historial
6. **busqueda-avanzada.js** - Búsqueda avanzada
7. **sw-offline.js** - Service Worker offline

## 🔒 Seguridad

**Importante:** Los sistemas usan variables de entorno. Configura antes de usar:

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLIC_KEY=pk_live_xxx
SMTP_SERVER=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password
FACEBOOK_APP_ID=xxx
GOOGLE_CLIENT_ID=xxx
```

## 📊 Estadísticas

- **33 mejoras** implementadas
- **15 sistemas Python**
- **7 módulos JavaScript**
- **1 Service Worker**
- **Total: 23 archivos de código**

## 🚀 Próximos Pasos

1. Configurar variables de entorno
2. Integrar rutas API en `app.py`
3. Crear templates para nuevas funcionalidades
4. Pruebas de integración
5. Despliegue en producción

## 📞 Soporte

Para más información, consulta el README.md principal.
