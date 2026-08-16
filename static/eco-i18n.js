/**
 * eco-i18n.js - Sistema de internacionalización para EcoMarket
 * Soporte multi-idioma (Español/English) con detección automática
 */
const EcoI18n = (() => {
  const STORAGE_KEY = 'eco_lang';
  
  const TRANSLATIONS = {
    es: {
      // Global
      'app.name': 'EcoMarket',
      'app.desc': 'Marketplace ecológico donde puedes comprar, vender y dar una segunda vida a productos reciclados y sostenibles.',
      'loading': 'Cargando...',
      'search': 'Buscar productos...',
      'view_all': 'Ver todos',
      'view_more': 'Ver más',
      'add_cart': 'Agregar al carrito',
      'add_fav': 'Agregar a favoritos',
      'remove_fav': 'Quitar de favoritos',
      'share': 'Compartir',
      'back': 'Volver',
      'save': 'Guardar',
      'cancel': 'Cancelar',
      'delete': 'Eliminar',
      'confirm': 'Confirmar',
      'close': 'Cerrar',
      'learn_more': 'Saber más',
      
      // Navbar
      'nav.home': 'Inicio',
      'nav.products': 'Productos',
      'nav.catalog': 'Catálogo',
      'nav.favorites': 'Favoritos',
      'nav.cart': 'Carrito',
      'nav.impact': 'Impacto',
      'nav.contact': 'Contacto',
      'nav.publish': 'Publicar',
      'nav.login': 'Ingresar',
      'nav.register': 'Registrarse',
      'nav.profile': 'Mi perfil',
      'nav.admin': 'Admin',
      'nav.logout': 'Cerrar sesión',
      'back_to_top': 'Volver arriba',
      
      // Hero
      'hero.badge': 'Marketplace 100% ecológico',
      'hero.title': 'Compra y vende productos sostenibles',
      'hero.subtitle': 'Descubre miles de productos ecológicos de vendedores comprometidos con el planeta.',
      'hero.explore': 'Explorar productos',
      'hero.publish': 'Publicar gratis',
      'hero.families': 'Familias impactadas',
      'hero.products': 'Productos eco',
      'hero.plastic': 'Plástico evitado',
      'hero.trust.shipping': 'Envío gratis',
      'hero.trust.payment': 'Pago seguro',
      'hero.trust.returns': 'Devoluciones fáciles',
      'hero.trust.delivery': 'Entrega rápida',
      
      // Categories
      'categories.title': 'Categorías populares',
      'categories.explore': 'Explora',
      'categories.view_all': 'Ver todas',
      'explore.tag': 'Explora',
      'featured.tag': 'Destacados',
      'featured.title': 'Más vendidos esta semana',
      'featured.view_catalog': 'Ver catálogo',
      'cta.title': '¿Tienes productos ecológicos?',
      'cta.desc': 'Publica gratis y llega a miles de compradores comprometidos con el planeta.',
      'cta.publish_now': 'Publicar ahora',
      'cta.create_account': 'Crear cuenta gratis',
      'cta.feature.no_commission': 'Sin comisión los primeros 3 meses',
      'cta.feature.dashboard': 'Panel de vendedor completo',
      'cta.feature.payments': 'Pagos seguros y rápidos',
      'cta.feature.support': 'Soporte 7 días a la semana',
      
      // Products
      'products.title': 'Catálogo de productos',
      'products.desc': 'Descubre artículos ecológicos.',
      'products.featured': 'Destacados',
      'products.bestsellers': 'Más vendidos esta semana',
      'products.related': 'Productos relacionados',
      'products.similar': 'Productos similares',
      'products.recommended': 'Productos recomendados',
      'products.new': 'Productos nuevos',
      'products.popular': 'Productos populares',
      'products.no_results': 'Sin resultados',
      'products.no_results_title': 'Sin resultados',
      'products.no_results_desc': 'Intenta con otros filtros o términos de búsqueda.',
      'products.showing': 'Mostrando',
      'products.available': 'disponible(s)',
      'products.stock': 'Stock',
      'products.views': 'vistas',
      'products.sold_by': 'Vendido por',
      'products.condition_new': 'Nuevo',
      'products.condition_used': 'Usado',
      'products.out_of_stock': 'Agotado',
      'products.in_stock': 'en stock',
      'products.discount': 'DESCUENTO',
      'products.filter_all': 'Todas',
      'products.filter': 'Filtrar',
      'products.clear': 'Limpiar',
      'products.price_label': 'Precio:',
      'products.price_min': 'Mín',
      'products.price_max': 'Máx',
      'products.search_placeholder': 'Buscar productos...',
      'products.publish': 'Publicar',
      'products.sort_newest': 'Más nuevos',
      'products.sort_popular': 'Más populares',
      'products.sort_cheapest': 'Menor precio',
      'products.sort_expensive': 'Mayor precio',
      'products.sort_best_rated': 'Mejor valorados',
      'products.page': 'Página',
      'products.of': 'de',
      'products.previous': 'Anterior',
      'products.next': 'Siguiente',
      'products.items': 'producto(s)',
      'products.add_to_cart': 'Carrito',
      'products.view_more': 'Ver más',
      'products.count': '{count} producto(s) disponible(s).',
      'products.order.new': '📅 Más nuevos',
      'products.order.popular': '🔥 Más populares',
      'products.order.cheap': '💰 Menor precio',
      'products.order.expensive': '💎 Mayor precio',
      'products.order.rated': '⭐ Mejor valorados',
      'pagination.prev': 'Anterior',
      'pagination.next': 'Siguiente',
      'pagination.page_info': 'Página',
      'pagination.of': 'de',
      
      // Reviews
      'reviews.title': 'Reseñas y valoraciones',
      'reviews.write': 'Escribe una reseña',
      'reviews.send': 'Enviar reseña',
      'reviews.no_reviews': 'No hay reseñas aún. ¡Sé el primero en opinar!',
      'reviews.rating': 'rating',
      'reviews.comment_placeholder': 'Comparte tu experiencia...',
      
      // Cart
      'cart.title': 'Carrito de compras',
      'cart.desc': 'Guarda productos para comprar después y controla tu selección desde una sola página.',
      'cart.summary': 'Resumen',
      'cart.items': 'Productos',
      'cart.subtotal': 'Subtotal',
      'cart.shipping': 'Envío',
      'cart.discount': 'Descuento',
      'cart.empty': 'Tu carrito está vacío',
      'cart.empty_desc': 'Agrega productos ecológicos para empezar a comprar.',
      'cart.checkout': 'Proceder al pago',
      'cart.checkout_button': 'Proceder al pago',
      'cart.view_full': 'Ver carrito completo',
      'cart.empty_state': 'Tu carrito está vacío',
      'cart.total': 'Total',
      'cart.total_short': 'Total',
      'cart.remove': 'Eliminar',
      'cart.quantity': 'Cantidad',
      'cart.note': 'El carrito se guarda localmente en tu navegador.',
      'cart.explore': 'Explorar productos',
      
      // Checkout
      'checkout.title': 'Finalizar compra',
      'checkout.name': 'Nombre completo',
      'checkout.email': 'Correo electrónico',
      'checkout.email_placeholder': 'tu@email.com',
      'checkout.address': 'Dirección de envío',
      'checkout.address_placeholder': 'Av. Principal 123',
      'checkout.payment': 'Método de pago',
      'checkout.place_order': 'Confirmar pedido',
      'checkout.coupon': '¿Tienes un cupón?',
      'checkout.coupon_placeholder': 'Ingresa tu código',
      'checkout.apply_coupon': 'Aplicar cupón',
      'checkout.apply': 'Aplicar',
      'checkout.order_summary': 'Resumen del pedido',
      'checkout.subtotal': 'Subtotal',
      'checkout.discount': 'Descuento',
      'checkout.shipping': 'Envío',
      'checkout.free': 'Gratis',
      'checkout.step_cart': 'Carrito',
      'checkout.step_payment': 'Pago',
      'checkout.step_confirm': 'Confirmación',
      'checkout.shipping_info': 'Datos de envío',
      'checkout.first_name': 'Nombre',
      'checkout.first_name_placeholder': 'Tu nombre',
      'checkout.last_name': 'Apellido',
      'checkout.last_name_placeholder': 'Tu apellido',
      'checkout.phone': 'Teléfono',
      'checkout.phone_placeholder': 'Número de contacto',
      'checkout.city': 'Ciudad',
      'checkout.city_placeholder': 'Tu ciudad',
      'checkout.postal_code': 'Código postal',
      'checkout.postal_placeholder': 'Código postal',
      'checkout.payment_methods': 'Método de pago',
      'checkout.your_order': 'Tu pedido',
      'checkout.pay': 'Pagar S/. ',
      'checkout.total': 'Total',
      'checkout.eco_note': 'Esta compra evita plástico y ahorra agua. 🌱',
      'checkout.required_fields': 'Completa todos los campos obligatorios',
      'payment.card': 'Tarjeta crédito/débito',
      'payment.card_brands': 'Visa, Mastercard, Amex',
      'payment.yape': 'Yape / Plin',
      'payment.instant': 'Pago instantáneo',
      'payment.bank': 'Transferencia bancaria',
      'payment.bank_list': 'BCP, Interbank, BBVA',
      
      // Contact
      'contact.title': 'Contacto',
      'contact.desc': '¿Tienes dudas o quieres publicar en EcoMarket? Escríbenos y te responderemos pronto.',
      'contact.available': 'Estamos disponibles',
      'contact.available_desc': 'Envía tu mensaje y un agente de soporte te contactará dentro de las siguientes 24 horas.',
      'contact.card_email': 'Email',
      'contact.card_email_value': 'hola@ecomarket.com',
      'contact.card_phone': 'Teléfono',
      'contact.card_phone_value': '+51 999 888 777',
      'contact.card_hours': 'Horario',
      'contact.card_hours_value': 'Lun - Sáb: 9am - 6pm',
      'contact.form_name': 'Nombre',
      'contact.form_name_placeholder': 'Tu nombre',
      'contact.form_email': 'Email',
      'contact.form_email_placeholder': 'tu@email.com',
      'contact.form_message': 'Mensaje',
      'contact.form_message_placeholder': 'Cuéntanos cómo podemos ayudarte',
      'contact.send_button': 'Enviar mensaje',
      'contact.success': 'Mensaje enviado. Nos pondremos en contacto pronto.',
      
      // Auth
      'auth.login_title': 'Iniciar sesión',
      'auth.register_title': 'Crear cuenta',
      'auth.fullname': 'Nombre completo',
      'auth.fullname_placeholder': 'Tu nombre completo',
      'auth.email': 'Correo electrónico',
      'auth.email_placeholder': 'tu@correo.com',
      'auth.password': 'Contraseña',
      'auth.password_placeholder': 'Tu contraseña',
      'auth.password_hint': 'Mínimo 6 caracteres',
      'auth.password_confirm': 'Confirmar contraseña',
      'auth.password_confirm_placeholder': 'Repite tu contraseña',
      'auth.register_desc': 'Únete a la comunidad ecológica más grande del Perú.',
      'auth.login_desc': 'Accede a tu cuenta para comprar y vender productos ecológicos.',
      'auth.login_button': 'Ingresar',
      'auth.register_button': 'Crear cuenta',
      'auth.name': 'Nombre completo',
      'auth.login_btn': 'Ingresar',
      'auth.register_btn': 'Registrarse',
      'auth.no_account': '¿No tienes cuenta?',
      'auth.have_account': '¿Ya tienes cuenta?',
      'auth.forgot': '¿Olvidaste tu contraseña?',
      'auth.login_success': '¡Bienvenido',
      'auth.register_success': '¡Cuenta creada! Bienvenido',
      'auth.logout_success': 'Sesión cerrada correctamente.',
      'auth.wrong': 'Correo o contraseña incorrectos.',
      'auth.or': 'o',
      'auth.first_name': 'Nombre',
      'auth.first_name_placeholder': 'María',
      'auth.last_name': 'Apellidos',
      'auth.last_name_placeholder': 'García López',
      'auth.phone': 'Teléfono',
      'auth.phone_placeholder': '+51 999 999 999',
      'auth.city': 'Ciudad',
      'auth.city_placeholder': 'Lima',
      'auth.password_strength_hint': 'Mínimo 8 caracteres, letras y números',
      'auth.google_signin': 'Continuar con Google',
      'auth.google_need_config': 'La integración con Google requiere configurar GOOGLE_CLIENT_ID en el servidor.',
      'auth.very_weak': 'Muy débil',
      'auth.weak': 'Débil',
      'auth.fair': 'Aceptable',
      'auth.strong': 'Fuerte',
      'auth.very_strong': 'Muy fuerte',
      'auth.invalid_email': 'Ingresa un correo válido.',
      'auth.invalid_name': 'Solo letras, mínimo 2 caracteres.',
      'auth.invalid_required': 'Campo obligatorio.',
      'checkout.invalid_address': 'Dirección completa (calle y número).',
      'checkout.invalid_phone': 'Teléfono inválido (7-15 dígitos).',
      'checkout.invalid_city': 'Ingresa tu ciudad.',
      
      // Profile
      'profile.title': 'Mi Panel',
      'profile.welcome': 'Bienvenido',
      'profile.publish': 'Publicar producto',
      'profile.logout': 'Cerrar sesión',
      'profile.products': 'Publicaciones',
      'profile.favorites': 'Favoritos',
      'profile.reviews': 'Reseñas recibidas',
      'profile.sales': 'Ventas',
      'profile.value': 'Valor productos',
      'profile.stats.publications': 'Publicaciones',
      'profile.stats.favorites': 'Favoritos',
      'profile.stats.reviews': 'Reseñas recibidas',
      'profile.stats.sales': 'Ventas',
      'profile.stats.value': 'Valor productos',
      'profile.my_products': 'Mis productos',
      'profile.my_favorites': 'Mis favoritos',
      'profile.my_reviews': 'Mis reseñas',
      'profile.my_orders': 'Mis pedidos',
      'profile.settings': 'Configuración',
      'profile.tab_products': 'Mis productos',
      'profile.tab_favorites': 'Favoritos',
      'profile.tab_reviews': 'Mis reseñas',
      'profile.tab_orders': 'Pedidos',
      'profile.tab_settings': 'Configuración',
      'profile.followers': 'Seguidores',
      'profile.following': 'Siguiendo',
      'profile.xp': 'XP',
      'profile.bio': 'Biografía',
      'profile.bio_placeholder': 'Cuéntanos sobre ti...',
      'profile.update': 'Actualizar perfil',
      'profile.change_password': 'Cambiar contraseña',
      'profile.current_password': 'Contraseña actual',
      'profile.new_password': 'Nueva contraseña',
      'profile.confirm_password': 'Confirmar contraseña',
      'profile.save_changes': 'Guardar cambios',
      'profile.no_products': 'No has publicado productos',
      'profile.no_products_desc': 'Publica tu primer producto y empieza a vender.',
      'profile.no_favorites': 'No tienes favoritos',
      'profile.no_favorites_desc': 'Explora productos y guarda tus favoritos.',
      'profile.no_reviews': 'No has escrito reseñas',
      'profile.no_reviews_desc': 'Compra productos y comparte tu experiencia.',
      'profile.no_orders': 'Sin pedidos aún',
      'profile.no_orders_desc': 'Tus compras aparecerán aquí.',
      
      // Impact
      'impact.title': 'Nuestro Impacto',
      'impact.real': 'Impacto real',
      'impact.title_main': 'Cada compra cuenta',
      'impact.desc': 'En EcoMarket medimos el impacto ambiental de cada transacción.',
      'impact.desc_full': 'En EcoMarket medimos el impacto ambiental de cada transacción. Juntos estamos construyendo un futuro más sostenible.',
      'impact.view_full': 'Ver nuestro impacto completo',
      'impact.trees': 'Árboles equivalentes salvados',
      'impact.water': 'Litros de agua ahorrados',
      'impact.plastic': 'Kg de plástico evitados',
      'impact.families': 'Familias impactadas',
      'impact.products': 'Productos',
      'impact.categories': 'Categorías',
      'impact.reviews': 'Reseñas',
      'impact.users': 'Usuarios',
      'impact.visits': 'Visitas',
      'impact.orders': 'Pedidos',
      
      // Footer
      'footer.navigation': 'Navegación',
      'footer.account': 'Cuenta',
      'footer.legal': 'Legal',
      'footer.contact': 'Contacto',
      'footer.description': 'Marketplace ecológico donde puedes comprar, vender y dar una segunda vida a productos reciclados y sostenibles.',
      'footer.cart': 'Mi carrito',
      'footer.profile': 'Mi perfil',
      'footer.publish': 'Publicar producto',
      'footer.logout': 'Cerrar sesión',
      'footer.login': 'Iniciar sesión',
      'footer.register': 'Registrarse',
      'footer.terms': 'Términos y condiciones',
      'footer.privacy': 'Política de privacidad',
      'footer.email': 'hola@ecomarket.com',
      'footer.phone': '+51 999 888 777',
      'footer.location': 'Lima, Perú',
      'footer.hours': 'Lun - Sáb: 9am - 6pm',
      'footer.copyright': '© 2026 EcoMarket — Todos los derechos reservados.',
      'footer.rights': 'Todos los derechos reservados.',
      'footer.made_with': 'Hecho con',
      'footer.for_planet': 'para el planeta',
      'footer.schedule': 'Lun - Sáb: 9am - 6pm',
      'notifications.title': 'Notificaciones',
      'notifications.read_all': 'Leer todo',
      'notifications.clear': 'Limpiar',
      'notifications.empty': 'Sin notificaciones',
      'notifications.empty_desc': 'Aquí aparecerán tus notificaciones',
      'notifications.more': '+{count} notificaciones más',
      'notifications.footer': 'EcoMarket - Notificaciones',
      'cart.mini_title': 'Mi carrito',

      // Publicar (formulario)
      'publicar.title': '📦 Publicar producto',
      'publicar.edit_title': '✏️ Editar producto',
      'publicar.subtitle': 'Completa el formulario para publicar tu producto ecológico.',
      'publicar.edit_subtitle': 'Modifica los datos de tu producto.',
      'publicar.name_label': 'Nombre del producto',
      'publicar.category_label': 'Categoría',
      'publicar.select_category': 'Seleccionar...',
      'publicar.price_label': 'Precio (S/.)',
      'publicar.stock_label': 'Stock',
      'publicar.condition_label': 'Condición',
      'publicar.condition_new': 'Nuevo',
      'publicar.condition_used': 'Usado',
      'publicar.description_label': 'Descripción',
      'publicar.description_placeholder': 'Describe tu producto: materiales, beneficios, impacto ambiental...',
      'publicar.specs_label': 'Especificaciones técnicas',
      'publicar.specs_placeholder': 'Formato:\nClave: Valor (una por línea)',
      'publicar.specs_hint': 'Escribe cada especificación en una línea con formato "clave: valor"',
      'publicar.main_image': 'Imagen principal del producto',
      'publicar.gallery': 'Imágenes adicionales (galería)',
      'publicar.publish_btn': 'Publicar producto',
      'publicar.save_btn': 'Guardar cambios',
      'publicar.cancel': 'Cancelar',
      'publicar.upload_hint': 'PNG, JPG, WebP hasta 5MB',
      'publicar.click_to_upload': 'Haz clic para subir una imagen',
      'publicar.click_to_upload_multiple': 'Haz clic para subir varias imágenes',
      'publicar.choose_multiple': 'Puedes seleccionar múltiples archivos',
      'publicar.placeholder_name': 'Ej: Botella reutilizable de acero',
      'publicar.placeholder_price': '0.00',
      'publicar.placeholder_specs': 'Formato:\nClave: Valor (una por línea)',
      
      // Errors
      'error.404_title': 'Página no encontrada',
      'error.404_desc': 'La página que buscas no existe o ha sido movida.',
      'error.404_tip': '¡No te preocupes, vuelve al inicio y sigue explorando!',
      'error.500_title': 'Error del servidor',
      'error.500_desc': 'Algo salió mal en nuestro servidor.',
      'error.go_home': 'Volver al inicio',
      'error.view_products': 'Ver productos',
      'error.contact_support': 'Contactar soporte',
      'error.tip': 'Consejo: usa la búsqueda para encontrar lo que necesitas',
      'auto.admin.30': 'Reseñas',
      'auto.confirmacion.10': 'Gracias por confiar en EcoMarket. Tu pedido ha sido registrado y será procesado en las próximas horas.',
      // EcoScore      'ecoscore.title': 'EcoScore',
      'ecoscore.excellent': 'Excelente',
      'ecoscore.good': 'Bueno',
      'ecoscore.regular': 'Regular',
      'ecoscore.desc': 'Impacto ambiental del producto',
      
      // Tags
      'tag.new': 'NUEVO',
      'tag.offer': 'OFERTA',
      'tag.popular': 'POPULAR',
      'tag.eco': 'ECO',
      'tag.last_units': 'ÚLTIMOS',
      
      // Chat
      'chat.title': 'EcoBot',
      'chat.subtitle': 'Asistente ecológico',
      'chat.placeholder': 'Escribe un mensaje...',
      'chat.greeting': '🌱 ¡Hola! Soy EcoBot, tu asistente ecológico. ¿En qué puedo ayudarte?',
      
      // Cookie consent
      'cookie.text': 'Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra política de cookies.',
      'cookie.accept': 'Aceptar',
      
      // Community
      'community.tag': 'Comunidad',
      'community.title': 'Lo que dice nuestra comunidad',
      'community.review_1': '"Desde que compro en EcoMarket siento que mis decisiones de consumo realmente importan. Los productos son increíbles."',
      'community.review_2': '"Publiqué mis productos artesanales y en un mes ya tenía 20 ventas. La plataforma es muy fácil de usar."',
      'community.review_3': '"Me encanta que puedo ver el impacto real de cada compra. Es motivador saber que estoy ayudando al planeta."',
      'community.name_1': 'María García',
      'community.name_2': 'Carlos López',
      'community.name_3': 'Ana Torres',
      'community.city_1': 'Lima, Perú',
      'community.city_2': 'Bogotá, Colombia',
      'community.city_3': 'Santiago, Chile',

      // Language
      'lang.es': 'Español',
      'lang.en': 'English',
      'lang.select': 'Idioma',
    },
    
    en: {
      // Global
      'app.name': 'EcoMarket',
      'app.desc': 'Eco-friendly marketplace where you can buy, sell and give a second life to recycled and sustainable products.',
      'loading': 'Loading...',
      'search': 'Search products...',
      'view_all': 'View all',
      'view_more': 'View more',
      'add_cart': 'Add to cart',
      'add_fav': 'Add to favorites',
      'remove_fav': 'Remove from favorites',
      'share': 'Share',
      'back': 'Back',
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'confirm': 'Confirm',
      'close': 'Close',
      'learn_more': 'Learn more',
      
      // Navbar
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.catalog': 'Catalog',
      'nav.favorites': 'Favorites',
      'nav.cart': 'Cart',
      'nav.impact': 'Impact',
      'nav.contact': 'Contact',
      'nav.publish': 'Publish',
      'nav.login': 'Sign in',
      'nav.register': 'Sign up',
      'nav.profile': 'My profile',
      'nav.admin': 'Admin',
      'nav.logout': 'Logout',
      'back_to_top': 'Back to top',
      
      // Hero
      'hero.badge': '100% eco-friendly Marketplace',
      'hero.title': 'Buy and sell sustainable products',
      'hero.subtitle': 'Discover thousands of eco-friendly products from sellers committed to the planet.',
      'hero.explore': 'Explore products',
      'hero.publish': 'Publish for free',
      'hero.families': 'Families impacted',
      'hero.products': 'Eco products',
      'hero.plastic': 'Plastic avoided',
      'hero.trust.shipping': 'Free shipping',
      'hero.trust.payment': 'Secure payment',
      'hero.trust.returns': 'Easy returns',
      'hero.trust.delivery': 'Fast delivery',
      
      // Categories
      'categories.title': 'Popular categories',
      'categories.explore': 'Explore',
      'categories.view_all': 'View all',
      'explore.tag': 'Explore',
      'featured.tag': 'Featured',
      'featured.title': 'Best sellers this week',
      'featured.view_catalog': 'View catalog',
      'cta.title': 'Do you have eco products?',
      'cta.desc': 'Publish for free and reach thousands of buyers committed to the planet.',
      'cta.publish_now': 'Publish now',
      'cta.create_account': 'Create free account',
      'cta.feature.no_commission': 'No commission for the first 3 months',
      'cta.feature.dashboard': 'Full seller dashboard',
      'cta.feature.payments': 'Secure and fast payments',
      'cta.feature.support': 'Support 7 days a week',
      
      // Products
      'products.title': 'Product catalog',
      'products.desc': 'Discover eco-friendly products.',
      'products.featured': 'Featured',
      'products.bestsellers': 'Best sellers this week',
      'products.related': 'Related products',
      'products.similar': 'Similar products',
      'products.recommended': 'Recommended products',
      'products.new': 'New products',
      'products.popular': 'Popular products',
      'products.no_results': 'No results',
      'products.no_results_title': 'No results',
      'products.no_results_desc': 'Try different filters or search terms.',
      'products.showing': 'Showing',
      'products.available': 'available',
      'products.stock': 'Stock',
      'products.views': 'views',
      'products.sold_by': 'Sold by',
      'products.condition_new': 'New',
      'products.condition_used': 'Used',
      'products.out_of_stock': 'Out of stock',
      'products.in_stock': 'in stock',
      'products.discount': 'DISCOUNT',
      'products.filter_all': 'All',
      'products.filter': 'Filter',
      'products.clear': 'Clear',
      'products.price_label': 'Price:',
      'products.price_min': 'Min',
      'products.price_max': 'Max',
      'products.search_placeholder': 'Search products...',
      'products.publish': 'Publish',
      'products.sort_newest': 'Newest',
      'products.sort_popular': 'Most popular',
      'products.sort_cheapest': 'Lowest price',
      'products.sort_expensive': 'Highest price',
      'products.sort_best_rated': 'Best rated',
      'products.page': 'Page',
      'products.of': 'of',
      'products.previous': 'Previous',
      'products.next': 'Next',
      'products.items': 'product(s)',
      'products.add_to_cart': 'Cart',
      'products.view_more': 'View more',
      'products.count': '{count} product(s) available.',
      'products.order.new': '📅 Newest',
      'products.order.popular': '🔥 Most popular',
      'products.order.cheap': '💰 Lowest price',
      'products.order.expensive': '💎 Highest price',
      'products.order.rated': '⭐ Best rated',
      'pagination.prev': 'Previous',
      'pagination.next': 'Next',
      'pagination.page_info': 'Page',
      'pagination.of': 'of',
      
      // Reviews
      'reviews.title': 'Reviews & Ratings',
      'reviews.write': 'Write a review',
      'reviews.send': 'Send review',
      'reviews.no_reviews': 'No reviews yet. Be the first to review!',
      'reviews.rating': 'rating',
      'reviews.comment_placeholder': 'Share your experience...',
      'reviews.stars': 'stars',
      'reviews.helpful': 'Helpful',
      'reviews.not_helpful': 'Not helpful',
      'reviews.report': 'Report',
      'reviews.verified': 'Verified purchase',
      
      // Cart
      'cart.title': 'Shopping cart',
      'cart.desc': 'Save products to buy later and manage your selection from one page.',
      'cart.summary': 'Summary',
      'cart.items': 'Products',
      'cart.subtotal': 'Subtotal',
      'cart.shipping': 'Shipping',
      'cart.total': 'Total',
      'cart.checkout': 'Proceed to checkout',
      'cart.empty': 'Your cart is empty',
      'cart.empty_desc': 'Add products to start shopping',
      'cart.continue_shopping': 'Continue shopping',
      'cart.remove': 'Remove',
      'cart.quantity': 'Quantity',
      'cart.update': 'Update',
      'cart.save': 'Save for later',
      'cart.coupon': 'Coupon code',
      'cart.apply_coupon': 'Apply coupon',
      'cart.remove_coupon': 'Remove coupon',
      'cart.savings': 'You save',
      
      // Checkout
      'checkout.title': 'Checkout',
      'checkout.shipping_info': 'Shipping information',
      'checkout.payment_info': 'Payment information',
      'checkout.order_summary': 'Order summary',
      'checkout.complete_order': 'Complete order',
      'checkout.first_name': 'First name',
      'checkout.last_name': 'Last name',
      'checkout.email': 'Email',
      'checkout.phone': 'Phone',
      'checkout.address': 'Address',
      'checkout.city': 'City',
      'checkout.country': 'Country',
      'checkout.payment_method': 'Payment method',
      'checkout.card': 'Credit/Debit card',
      'checkout.yape': 'Yape/Plin',
      'checkout.transfer': 'Bank transfer',
      'checkout.terms': 'I agree to the terms and conditions',
      'checkout.privacy': 'Privacy policy',
      
      // Auth
      'auth.login_title': 'Sign in',
      'auth.register_title': 'Create account',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.remember': 'Remember me',
      'auth.forgot_password': 'Forgot password?',
      'auth.no_account': "Don't have an account?",
      'auth.have_account': 'Already have an account?',
      'auth.create_account': 'Create account',
      'auth.sign_in': 'Sign in',
      'auth.google_login': 'Sign in with Google',
      'auth.google_register': 'Register with Google',
      
      // Profile
      'profile.title': 'My profile',
      'profile.edit': 'Edit profile',
      'profile.settings': 'Settings',
      'profile.orders': 'My orders',
      'profile.sales': 'My sales',
      'profile.favorites': 'My favorites',
      'profile.reviews': 'My reviews',
      'profile.xp': 'XP',
      'profile.level': 'Level',
      'profile.logout': 'Logout',
      'profile.save_changes': 'Save changes',
      'profile.change_password': 'Change password',
      'profile.current_password': 'Current password',
      'profile.new_password': 'New password',
      'profile.confirm_password': 'Confirm password',
      
      // Publish
      'publish.title': 'Publish product',
      'publish.product_name': 'Product name',
      'publish.description': 'Description',
      'publish.price': 'Price',
      'publish.category': 'Category',
      'publish.condition': 'Condition',
      'publish.condition_new': 'New',
      'publish.condition_used': 'Used',
      'publish.images': 'Images',
      'publish.upload': 'Upload images',
      'publish.max_images': 'Maximum 5 images',
      'publish.stock': 'Stock',
      'publish.publish': 'Publish',
      'publish.success': 'Product published successfully!',
      'publish.required': 'Required field',
      
      // Contact
      'contact.title': 'Contact us',
      'contact.name': 'Your name',
      'contact.email': 'Your email',
      'contact.message': 'Message',
      'contact.send': 'Send message',
      'contact.subject': 'Subject',
      'contact.success': 'Message sent successfully!',
      
      // Footer
      'footer.about': 'About us',
      'footer.help': 'Help',
      'footer.privacy': 'Privacy policy',
      'footer.terms': 'Terms of service',
      'footer.contact': 'Contact',
      'footer.copyright': '© 2024 EcoMarket. All rights reserved.',
      
      // Errors
      'error.404_title': 'Page not found',
      'error.404_desc': 'The page you are looking for does not exist or has been moved.',
      'error.404_tip': 'Don\'t worry, go back to home and keep exploring!',
      'error.500_title': 'Server error',
      'error.500_desc': 'Something went wrong on our server.',
      'error.go_home': 'Go to home',
      'error.view_products': 'View products',
      'error.contact_support': 'Contact support',
      'error.tip': 'Tip: use the search to find what you need',
      
      // EcoScore
      'ecoscore.title': 'EcoScore',
      'ecoscore.excellent': 'Excellent',
      'ecoscore.good': 'Good',
      'ecoscore.regular': 'Regular',
      'ecoscore.desc': 'Environmental impact of the product',
      
      // Tags
      'tag.new': 'NEW',
      'tag.offer': 'OFFER',
      'tag.popular': 'POPULAR',
      'tag.eco': 'ECO',
      'tag.last_units': 'LAST UNITS',
      
      // Chat
      'chat.title': 'EcoBot',
      'chat.subtitle': 'Eco assistant',
      'chat.placeholder': 'Type a message...',
      'chat.greeting': '🌱 Hi! I am EcoBot, your eco assistant. How can I help you?',
      
      // Cookie consent
      'cookie.text': 'We use cookies to improve your experience. By continuing, you accept our cookie policy.',
      'cookie.accept': 'Accept',
      
      // Community
      'community.tag': 'Community',
      'community.title': 'What our community says',
      'community.review_1': '"Since I shop at EcoMarket I feel that my consumption decisions really matter. The products are amazing."',
      'community.review_2': '"I published my artisan products and in a month I already had 20 sales. The platform is very easy to use."',
      'community.review_3': '"I love that I can see the real impact of each purchase. It\'s motivating to know I\'m helping the planet."',
      'community.name_1': 'María García',
      'community.name_2': 'Carlos López',
      'community.name_3': 'Ana Torres',
      'community.city_1': 'Lima, Peru',
      'community.city_2': 'Bogotá, Colombia',
      'community.city_3': 'Santiago, Chile',

      // Language
      'lang.es': 'Español',
      'lang.en': 'English',
      'lang.select': 'Language',
      
      // Product Categories
      'category.all': 'All',
      'category.home': 'Home',
      'category.accessories': 'Accessories',
      'category.hygiene': 'Hygiene',
      'category.garden': 'Garden',
      'category.food': 'Food',
      'category.clothing': 'Clothing',
      
      // Impact
      'impact.title': 'Your environmental impact',
      'impact.co2_saved': 'CO₂ saved',
      'impact.plastic_avoided': 'Plastic avoided',
      'impact.trees_planted': 'Trees planted',
      'impact.water_saved': 'Water saved',
      
      // Comparison
      'compare.title': 'Compare products',
      'compare.add': 'Add to compare',
      'compare.remove': 'Remove',
      'compare.clear': 'Clear all',
      'compare.similar': 'Similar',
      'compare.different': 'Different',
      'compare.best': 'Best option',
      
      // Notifications
      'notification.new_order': 'New order',
      'notification.order_shipped': 'Order shipped',
      'notification.order_delivered': 'Order delivered',
      'notification.new_review': 'New review',
      'notification.promotion': 'New promotion',
      'notification.message': 'New message',
      
      // Wishlist
      'wishlist.title': 'My wishlist',
      'wishlist.add': 'Add to wishlist',
      'wishlist.remove': 'Remove from wishlist',
      'wishlist.empty': 'Your wishlist is empty',
      'wishlist.share': 'Share wishlist',
      
      // Search
      'search.title': 'Search results',
      'search.no_results': 'No results found',
      'search.suggestions': 'Suggestions',
      'search.recent': 'Recent searches',
      'search.clear_history': 'Clear history',
      
      // Filters
      'filter.title': 'Filters',
      'filter.price_range': 'Price range',
      'filter.category': 'Category',
      'filter.condition': 'Condition',
      'filter.rating': 'Rating',
      'filter.availability': 'Availability',
      'filter.in_stock': 'In stock',
      'filter.out_of_stock': 'Out of stock',
      'filter.apply': 'Apply filters',
      'filter.reset': 'Reset filters',
      
      // Loading
      'loading.products': 'Loading products...',
      'loading.profile': 'Loading profile...',
      'loading.orders': 'Loading orders...',
      'loading.cart': 'Loading cart...',
      
      // Success messages
      'success.added_to_cart': 'Added to cart',
      'success.added_to_favorites': 'Added to favorites',
      'success.removed_from_favorites': 'Removed from favorites',
      'success.product_published': 'Product published',
      'success.profile_updated': 'Profile updated',
      'success.order_placed': 'Order placed successfully',
      
      // Warning messages
      'warning.stock_low': 'Low stock',
      'warning.stock_out': 'Out of stock',
      'warning.login_required': 'Login required',
      
      // Info messages
      'info.free_shipping': 'Free shipping',
      'info.shipping_info': 'Shipping information',
      'info.return_policy': 'Return policy',
      
      // Social
      'social.facebook': 'Facebook',
      'social.instagram': 'Instagram',
      'social.twitter': 'Twitter',
      'social.youtube': 'YouTube',
      'social.tiktok': 'TikTok',
      
      // Accessibility
      'a11y.skip_to_content': 'Skip to content',
      'a11y.open_menu': 'Open menu',
      'a11y.close_menu': 'Close menu',
      'a11y.search': 'Search',
      'a11y.open_cart': 'Open cart',
      'a11y.open_notifications': 'Open notifications',
      'a11y.open_profile': 'Open profile',
    }
      'cart.discount': 'Discount',
      'cart.empty': 'Your cart is empty',
      'cart.empty_desc': 'Add eco-friendly products to start shopping.',
      'cart.checkout': 'Proceed to checkout',
      'cart.checkout_button': 'Proceed to checkout',
      'cart.view_full': 'View cart',
      'cart.empty_state': 'Your cart is empty',
      'cart.total': 'Total',
      'cart.total_short': 'Total',
      'cart.remove': 'Remove',
      'cart.quantity': 'Quantity',
      'cart.note': 'The cart is saved locally in your browser.',
      'cart.explore': 'Explore products',
      
      // Checkout
      'checkout.title': 'Checkout',
      'checkout.name': 'Full name',
      'checkout.email': 'Email address',
      'checkout.email_placeholder': 'you@email.com',
      'checkout.address': 'Shipping address',
      'checkout.address_placeholder': 'Main Ave 123',
      'checkout.payment': 'Payment method',
      'checkout.place_order': 'Place order',
      'checkout.coupon': 'Have a coupon?',
      'checkout.coupon_placeholder': 'Enter your code',
      'checkout.apply_coupon': 'Apply coupon',
      'checkout.apply': 'Apply',
      'checkout.order_summary': 'Order summary',
      'checkout.subtotal': 'Subtotal',
      'checkout.discount': 'Discount',
      'checkout.shipping': 'Shipping',
      'checkout.free': 'Free',
      'checkout.step_cart': 'Cart',
      'checkout.step_payment': 'Payment',
      'checkout.step_confirm': 'Confirmation',
      'checkout.shipping_info': 'Shipping info',
      'checkout.first_name': 'First name',
      'checkout.first_name_placeholder': 'Your name',
      'checkout.last_name': 'Last name',
      'checkout.last_name_placeholder': 'Your last name',
      'checkout.phone': 'Phone',
      'checkout.phone_placeholder': 'Contact number',
      'checkout.city': 'City',
      'checkout.city_placeholder': 'Your city',
      'checkout.postal_code': 'Postal code',
      'checkout.postal_placeholder': 'Postal code',
      'checkout.payment_methods': 'Payment method',
      'checkout.your_order': 'Your order',
      'checkout.pay': 'Pay S/. ',
      'checkout.total': 'Total',
      'checkout.eco_note': 'This purchase avoids plastic and saves water. 🌱',
      'checkout.required_fields': 'Please complete all required fields',
      'payment.card': 'Credit/debit card',
      'payment.card_brands': 'Visa, Mastercard, Amex',
      'payment.yape': 'Yape / Plin',
      'payment.instant': 'Instant payment',
      'payment.bank': 'Bank transfer',
      'payment.bank_list': 'BCP, Interbank, BBVA',
      
      // Contact
      'contact.title': 'Contact',
      'contact.desc': 'Do you have questions or want to publish on EcoMarket? Write to us and we will get back to you soon.',
      'contact.available': 'We are available',
      'contact.available_desc': 'Send your message and a support agent will contact you within the next 24 hours.',
      'contact.card_email': 'Email',
      'contact.card_email_value': 'hello@ecomarket.com',
      'contact.card_phone': 'Phone',
      'contact.card_phone_value': '+51 999 888 777',
      'contact.card_hours': 'Hours',
      'contact.card_hours_value': 'Mon - Sat: 9am - 6pm',
      'contact.form_name': 'Name',
      'contact.form_name_placeholder': 'Your name',
      'contact.form_email': 'Email',
      'contact.form_email_placeholder': 'you@email.com',
      'contact.form_message': 'Message',
      'contact.form_message_placeholder': 'Tell us how we can help',
      'contact.send_button': 'Send message',
      'contact.success': 'Message sent. We will contact you soon.',
      
      // Auth
      'auth.login_title': 'Sign in',
      'auth.register_title': 'Create account',
      'auth.fullname': 'Full name',
      'auth.fullname_placeholder': 'Your full name',
      'auth.email': 'Email address',
      'auth.email_placeholder': 'you@email.com',
      'auth.password': 'Password',
      'auth.password_placeholder': 'Your password',
      'auth.password_hint': 'Minimum 6 characters',
      'auth.password_confirm': 'Confirm password',
      'auth.password_confirm_placeholder': 'Repeat your password',
      'auth.register_desc': 'Join the largest eco community in Peru.',
      'auth.login_desc': 'Access your account to buy and sell eco products.',
      'auth.login_button': 'Sign in',
      'auth.register_button': 'Create account',
      'auth.name': 'Full name',
      'auth.login_btn': 'Sign in',
      'auth.register_btn': 'Sign up',
      'auth.no_account': "Don't have an account?",
      'auth.have_account': 'Already have an account?',
      'auth.forgot': 'Forgot your password?',
      'auth.login_success': 'Welcome',
      'auth.register_success': 'Account created! Welcome',
      'auth.logout_success': 'Logged out successfully.',
      'auth.wrong': 'Incorrect email or password.',
      'auth.or': 'or',
      'auth.first_name': 'First name',
      'auth.first_name_placeholder': 'Maria',
      'auth.last_name': 'Last name',
      'auth.last_name_placeholder': 'Garcia Lopez',
      'auth.phone': 'Phone',
      'auth.phone_placeholder': '+51 999 999 999',
      'auth.city': 'City',
      'auth.city_placeholder': 'Lima',
      'auth.password_strength_hint': 'Min 8 characters, letters and numbers',
      'auth.google_signin': 'Continue with Google',
      'auth.google_need_config': 'Google integration requires setting GOOGLE_CLIENT_ID on the server.',
      'auth.very_weak': 'Very weak',
      'auth.weak': 'Weak',
      'auth.fair': 'Fair',
      'auth.strong': 'Strong',
      'auth.very_strong': 'Very strong',
      'auth.invalid_email': 'Enter a valid email.',
      'auth.invalid_name': 'Letters only, minimum 2 characters.',
      'auth.invalid_required': 'Required field.',
      'checkout.invalid_address': 'Full address (street and number).',
      'checkout.invalid_phone': 'Invalid phone (7-15 digits).',
      'checkout.invalid_city': 'Enter your city.',
      
      // Profile
      'profile.title': 'My Dashboard',
      'profile.welcome': 'Welcome',
      'profile.publish': 'Publish product',
      'profile.logout': 'Log out',
      'profile.products': 'Posts',
      'profile.favorites': 'Favorites',
      'profile.reviews': 'Reviews received',
      'profile.sales': 'Sales',
      'profile.value': 'Product value',
      'profile.stats.publications': 'Publications',
      'profile.stats.favorites': 'Favorites',
      'profile.stats.reviews': 'Reviews received',
      'profile.stats.sales': 'Sales',
      'profile.stats.value': 'Product value',
      'profile.my_products': 'My products',
      'profile.my_favorites': 'My favorites',
      'profile.my_reviews': 'My reviews',
      'profile.my_orders': 'My orders',
      'profile.settings': 'Settings',
      'profile.tab_products': 'My products',
      'profile.tab_favorites': 'Favorites',
      'profile.tab_reviews': 'My reviews',
      'profile.tab_orders': 'Orders',
      'profile.tab_settings': 'Settings',
      'profile.followers': 'Followers',
      'profile.following': 'Following',
      'profile.xp': 'XP',
      'profile.bio': 'Biography',
      'profile.bio_placeholder': 'Tell us about yourself...',
      'profile.update': 'Update profile',
      'profile.change_password': 'Change password',
      'profile.current_password': 'Current password',
      'profile.new_password': 'New password',
      'profile.confirm_password': 'Confirm password',
      'profile.save_changes': 'Save changes',
      'profile.no_products': 'No products published yet',
      'profile.no_products_desc': 'Publish your first product and start selling.',
      'profile.no_favorites': 'No favorites yet',
      'profile.no_favorites_desc': 'Explore products and save your favorites.',
      'profile.no_reviews': 'No reviews written yet',
      'profile.no_reviews_desc': 'Buy products and share your experience.',
      'profile.no_orders': 'No orders yet',
      'profile.no_orders_desc': 'Your purchases will appear here.',
      
      // Impact
      'impact.title': 'Our Impact',
      'impact.real': 'Real impact',
      'impact.title_main': 'Every purchase matters',
      'impact.desc': 'At EcoMarket we measure the environmental impact of each transaction.',
      'impact.desc_full': 'At EcoMarket we measure the environmental impact of each transaction. Together we are building a more sustainable future.',
      'impact.view_full': 'View our full impact',
      'impact.trees': 'Equivalent trees saved',
      'impact.water': 'Liters of water saved',
      'impact.plastic': 'Kg of plastic avoided',
      'impact.families': 'Families impacted',
      'impact.products': 'Products',
      'impact.categories': 'Categories',
      'impact.reviews': 'Reviews',
      'impact.users': 'Users',
      'impact.visits': 'Visits',
      'impact.orders': 'Orders',
      
      // Footer
      'footer.navigation': 'Navigation',
      'footer.account': 'Account',
      'footer.legal': 'Legal',
      'footer.contact': 'Contact',
      'footer.description': 'Eco-marketplace where you can buy, sell and give a second life to recycled and sustainable products.',
      'footer.cart': 'My cart',
      'footer.profile': 'My profile',
      'footer.publish': 'Publish product',
      'footer.logout': 'Log out',
      'footer.login': 'Log in',
      'footer.register': 'Sign up',
      'footer.terms': 'Terms and conditions',
      'footer.privacy': 'Privacy policy',
      'footer.email': 'hola@ecomarket.com',
      'footer.phone': '+51 999 888 777',
      'footer.location': 'Lima, Peru',
      'footer.hours': 'Mon - Sat: 9am - 6pm',
      'footer.copyright': '© 2026 EcoMarket — All rights reserved.',
      'footer.rights': 'All rights reserved.',
      'footer.made_with': 'Made with',
      'footer.for_planet': 'for the planet',
      'footer.schedule': 'Mon - Sat: 9am - 6pm',
      'notifications.title': 'Notifications',
      'notifications.read_all': 'Read all',
      'notifications.clear': 'Clear',
      'notifications.empty': 'No notifications',
      'notifications.empty_desc': 'Your notifications will appear here',
      'notifications.more': '+{count} more notifications',
      'notifications.footer': 'EcoMarket - Notifications',
      'cart.mini_title': 'My cart',

      // Publish (form)
      'publicar.title': '📦 Publish product',
      'publicar.edit_title': '✏️ Edit product',
      'publicar.subtitle': 'Fill the form to publish your eco-friendly product.',
      'publicar.edit_subtitle': 'Edit your product details.',
      'publicar.name_label': 'Product name',
      'publicar.category_label': 'Category',
      'publicar.select_category': 'Select...',
      'publicar.price_label': 'Price',
      'publicar.stock_label': 'Stock',
      'publicar.condition_label': 'Condition',
      'publicar.condition_new': 'New',
      'publicar.condition_used': 'Used',
      'publicar.description_label': 'Description',
      'publicar.description_placeholder': 'Describe your product: materials, benefits, environmental impact...',
      'publicar.specs_label': 'Technical specifications',
      'publicar.specs_placeholder': 'Format:\nKey: Value (one per line)',
      'publicar.specs_hint': 'Write each specification on its own line in the format "key: value"',
      'publicar.main_image': 'Main product image',
      'publicar.gallery': 'Additional images (gallery)',
      'publicar.publish_btn': 'Publish product',
      'publicar.save_btn': 'Save changes',
      'publicar.cancel': 'Cancel',
      'publicar.upload_hint': 'PNG, JPG, WebP up to 5MB',
      'publicar.click_to_upload': 'Click to upload an image',
      'publicar.click_to_upload_multiple': 'Click to upload multiple images',
      'publicar.choose_multiple': 'You can select multiple files',
      'publicar.placeholder_name': 'Eg: Reusable steel bottle',
      'publicar.placeholder_price': '0.00',
      'publicar.placeholder_specs': 'Format:\nKey: Value (one per line)',
      
      // Errors
      'error.404_title': 'Page not found',
      'error.404_desc': 'The page you are looking for does not exist or has been moved.',
      'error.404_tip': "Don't worry, go back home and keep exploring!",
      'error.500_title': 'Server error',
      'error.500_desc': 'Something went wrong on our server.',
      'error.go_home': 'Go home',
      'error.view_products': 'View products',
      'error.contact_support': 'Contact support',
      'error.tip': 'Tip: use search to find what you need',
      'auto.admin.30': 'Reviews',
      'auto.confirmacion.10': 'Thanks for trusting EcoMarket. Your order has been registered and will be processed in the next few hours.',
      // EcoScore      'ecoscore.title': 'EcoScore',
      'ecoscore.excellent': 'Excellent',
      'ecoscore.good': 'Good',
      'ecoscore.regular': 'Regular',
      'ecoscore.desc': 'Product environmental impact',
      
      // Tags
      'tag.new': 'NEW',
      'tag.offer': 'OFFER',
      'tag.popular': 'POPULAR',
      'tag.eco': 'ECO',
      'tag.last_units': 'LAST UNITS',
      
      // Chat
      'chat.title': 'EcoBot',
      'chat.subtitle': 'Eco assistant',
      'chat.placeholder': 'Type a message...',
      'chat.greeting': '🌱 Hi! I am EcoBot, your eco assistant. How can I help you?',
      
      // Cookie consent
      'cookie.text': 'We use cookies to improve your experience. By continuing, you accept our cookie policy.',
      'cookie.accept': 'Accept',
      
      // Community
      'community.tag': 'Community',
      'community.title': 'What our community says',
      'community.review_1': '"Since I started shopping at EcoMarket, I feel like my consumption choices really matter. The products are amazing."',
      'community.review_2': '"I published my handmade products and within a month I had 20 sales. The platform is very easy to use."',
      'community.review_3': '"I love that I can see the real impact of each purchase. It is motivating to know I am helping the planet."',
      'community.name_1': 'María García',
      'community.name_2': 'Carlos López',
      'community.name_3': 'Ana Torres',
      'community.city_1': 'Lima, Peru',
      'community.city_2': 'Bogotá, Colombia',
      'community.city_3': 'Santiago, Chile',

      // Language
      'lang.es': 'Spanish',
      'lang.en': 'English',
      'lang.select': 'Language',
    }
  };

  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage issues in restricted contexts.
    }
  };

  const getLang = () => {
      const stored = readStorage(STORAGE_KEY, '');
      if (stored === 'en' || stored === 'es') return stored;
      return (navigator.language && navigator.language.startsWith('en')) ? 'en' : 'es';
    };

  const setLang = (lang) => {
    const nextLang = (lang === 'en' || lang === 'es') ? lang : 'es';
    writeStorage(STORAGE_KEY, nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dataset.lang = nextLang;
    applyTranslations();
    document.querySelectorAll('[data-eco-lang-btn]').forEach(btn => {
      const active = btn.dataset.lang === nextLang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.style.background = active ? 'var(--verde)' : 'transparent';
      btn.style.color = active ? '#fff' : 'var(--texto)';
    });
    window.dispatchEvent(new CustomEvent('eco:langchange', { detail: nextLang }));

    // Sincronizar idioma con el servidor (mensajes flash y errores API)
    try {
      fetch('/api/set_lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: nextLang })
      }).catch(() => {});
    } catch (_e) { /* offline / sin contexto */ }
  };

  const t = (key, params = {}, fallback = '') => {
    const lang = getLang();
    let text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['es']?.[key] || fallback || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const fallback = el.textContent?.trim() || key;
      el.textContent = t(key, {}, fallback);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const fallback = el.getAttribute('placeholder') || '';
      el.placeholder = t(el.dataset.i18nPlaceholder, {}, fallback);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const fallback = el.getAttribute('title') || '';
      el.title = t(el.dataset.i18nTitle, {}, fallback);
    });
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const fallback = el.value || '';
      el.value = t(el.dataset.i18nValue, {}, fallback);
    });
  };

  const init = () => {
    const lang = getLang();
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    document.documentElement.dataset.lang = lang;

    // Add language switcher to navbar
    const header = document.querySelector('.header-actions');
    // Solo crear botones si no existen
    if (header && !header.querySelector('[data-eco-lang-btn]')) {
      const switcher = document.createElement('div');
      switcher.id = 'langSwitcher';
      switcher.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid rgba(46,125,50,0.15);background:var(--surface);';
      switcher.innerHTML = `
        <button type="button" data-eco-lang-btn data-lang="es" aria-label="Español" aria-pressed="${lang === 'es'}" style="width:34px;height:34px;border:none;border-radius:999px;background:${lang === 'es' ? 'var(--verde)' : 'transparent'};color:${lang === 'es' ? '#fff' : 'var(--texto)'};cursor:pointer;font-weight:700;">ES</button>
        <button type="button" data-eco-lang-btn data-lang="en" aria-label="English" aria-pressed="${lang === 'en'}" style="width:34px;height:34px;border:none;border-radius:999px;background:${lang === 'en' ? 'var(--verde)' : 'transparent'};color:${lang === 'en' ? '#fff' : 'var(--texto)'};cursor:pointer;font-weight:700;">EN</button>
      `;
      header.insertBefore(switcher, header.firstChild);
    }

    // Agregar event listeners a todos los botones de idioma
    document.querySelectorAll('[data-eco-lang-btn]').forEach(btn => {
      // Remover listeners existentes para evitar duplicados
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', () => setLang(newBtn.dataset.lang));
    });

    applyTranslations();
  };

  const toggleLang = () => {
    const current = getLang();
    setLang(current === 'es' ? 'en' : 'es');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { t, getLang, setLang, toggleLang, applyTranslations };
})();

window.EcoI18n = EcoI18n;