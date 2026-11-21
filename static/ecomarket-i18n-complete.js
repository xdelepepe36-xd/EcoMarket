/**
 * EcoMarket - Sistema de Internacionalización Completo
 * Sistema multiidioma avanzado para productos y toda la aplicación
 */

const EcoI18n = {
    // Idiomas disponibles
    languages: {
        es: {
            name: 'Español',
            flag: '🇪🇸',
            nativeName: 'Español'
        },
        en: {
            name: 'English',
            flag: '🇬🇧',
            nativeName: 'English'
        },
        pt: {
            name: 'Português',
            flag: '🇧🇷',
            nativeName: 'Português'
        },
        fr: {
            name: 'Français',
            flag: '🇫🇷',
            nativeName: 'Français'
        },
        de: {
            name: 'Deutsch',
            flag: '🇩🇪',
            nativeName: 'Deutsch'
        },
        it: {
            name: 'Italiano',
            flag: '🇮🇹',
            nativeName: 'Italiano'
        }
    },
    
    // Estado actual
    currentLang: 'es',
    
    // Sistema de traducciones completo
    translations: {
        es: {
            // Navegación
            'nav.home': 'Inicio',
            'nav.products': 'Productos',
            'nav.favorites': 'Favoritos',
            'nav.cart': 'Carrito',
            'nav.impact': 'Impacto',
            'nav.contact': 'Contacto',
            'nav.publish': 'Publicar',
            'nav.profile': 'Mi perfil',
            'nav.admin': 'Admin',
            'nav.logout': 'Cerrar sesión',
            'nav.login': 'Ingresar',
            'nav.register': 'Registrarse',
            'nav.catalog': 'Catálogo',
            
            // Banner
            'banner.badge': '🔥 Oferta especial',
            'banner.title': '¡Compra ecológico y ahorra!',
            'banner.description': 'Productos sostenibles con hasta 30% de descuento en tu primera compra',
            'banner.cta': 'Ver ofertas',
            
            // Hero
            'hero.badge': 'Marketplace 100% ecológico',
            'hero.title': 'Compra y vende productos sostenibles',
            'hero.subtitle': 'Descubre miles de productos ecológicos de vendedores comprometidos con el planeta. Cada compra genera un impacto positivo real.',
            'hero.explore': 'Explorar productos',
            'hero.publish': 'Publicar gratis',
            'hero.trust.shipping': 'Envío gratis',
            'hero.trust.payment': 'Pago seguro',
            'hero.trust.returns': 'Devoluciones fáciles',
            'hero.trust.delivery': 'Entrega rápida',
            'hero.families': 'Familias impactadas',
            'hero.products': 'Productos eco',
            'hero.plastic': 'Plástico evitado',
            
            // Categorías
            'explore.tag': 'Explora',
            'categories.title': 'Categorías populares',
            'categories.view_all': 'Ver todos',
            'category.hogar': 'Hogar',
            'category.accesorios': 'Accesorios',
            'category.higiene': 'Higiene',
            'category.jardin': 'Jardín',
            'category.alimentacion': 'Alimentación',
            'category.ropa': 'Ropa',
            'category.description.hogar': 'Productos para el hogar sostenible',
            'category.description.accesorios': 'Accesorios ecológicos',
            'category.description.higiene': 'Productos de higiene natural',
            'category.description.jardin': 'Artículos de jardinería ecológica',
            'category.description.alimentacion': 'Alimentos orgánicos y naturales',
            'category.description.ropa': 'Ropa sostenible y textiles ecológicos',
            
            // Recomendados
            'recommended.tag': 'Recomendados para ti',
            'recommended.title': 'Basado en tu interés ecológico',
            'recommended.view_more': 'Ver más',
            
            // Destacados
            'featured.tag': 'Destacados',
            'featured.title': 'Más vendidos esta semana',
            'featured.view_catalog': 'Ver catálogo completo',
            
            // Impacto
            'impact.real': 'Impacto real',
            'impact.title_main': 'Cada compra cuenta',
            'impact.desc_full': 'En EcoMarket medimos el impacto ambiental de cada transacción. Juntos estamos construyendo un futuro más sostenible.',
            'impact.view_full': 'Ver nuestro impacto completo',
            'impact.trees': 'Árboles equivalentes salvados',
            'impact.water': 'Litros de agua ahorrados',
            'impact.plastic': 'Kg de plástico evitados',
            'impact.families': 'Familias impactadas',
            
            // CTA
            'cta.title': '¿Tienes productos ecológicos?',
            'cta.desc': 'Publica gratis y llega a miles de compradores comprometidos con el planeta.',
            'cta.publish_now': 'Publicar ahora',
            'cta.create_account': 'Crear cuenta gratis',
            'cta.feature.no_commission': 'Sin comisión los primeros 3 meses',
            'cta.feature.dashboard': 'Panel de vendedor completo',
            'cta.feature.payments': 'Pagos seguros y rápidos',
            'cta.feature.support': 'Soporte 7 días a la semana',
            
            // Comunidad
            'community.tag': 'Comunidad',
            'community.title': 'Lo que dice nuestra comunidad',
            'community.review_1': '"Desde que compro en EcoMarket siento que mis decisiones de consumo realmente importan. Los productos son increíbles."',
            'community.review_2': '"Publiqué mis productos artesanales y en un mes ya tenía 20 ventas. La plataforma es muy fácil de usar."',
            'community.review_3': '"Me encanta que puedo ver el impacto real de cada compra. Es motivador saber que estoy ayudando al planeta."',
            'community.name_1': 'María García',
            'community.city_1': 'Lima, Perú',
            'community.name_2': 'Carlos López',
            'community.city_2': 'Bogotá, Colombia',
            'community.name_3': 'Ana Torres',
            'community.city_3': 'Santiago, Chile',
            
            // Footer
            'footer.description': 'Marketplace ecológico donde puedes comprar, vender y dar una segunda vida a productos reciclados y sostenibles.',
            'footer.navigation': 'Navegación',
            'footer.account': 'Cuenta',
            'footer.legal': 'Legal',
            'footer.contact': 'Contacto',
            'footer.email': 'hola@ecomarket.com',
            'footer.phone': '+51 999 888 777',
            'footer.location': 'Lima, Perú',
            'footer.hours': 'Lun - Sáb: 9am - 6pm',
            'footer.terms': 'Términos y condiciones',
            'footer.privacy': 'Política de privacidad',
            'footer.profile': 'Mi perfil',
            'footer.publish': 'Publicar producto',
            'footer.logout': 'Cerrar sesión',
            'footer.login': 'Iniciar sesión',
            'footer.register': 'Registrarse',
            'footer.cart': 'Mi carrito',
            'footer.copyright': '© 2026 EcoMarket — Todos los derechos reservados.',
            'footer.made_with': 'Hecho con ❤️ para el planeta',
            
            // Productos
            'products.title': 'Catálogo de productos',
            'products.desc': 'Descubre artículos ecológicos.',
            'products.count': 'producto(s) disponible(s).',
            'products.publish': 'Publicar',
            'products.search_placeholder': 'Buscar productos...',
            'products.order.new': '📅 Más nuevos',
            'products.order.popular': '🔥 Más populares',
            'products.order.cheap': '💰 Menor precio',
            'products.order.expensive': '💎 Mayor precio',
            'products.order.rated': '⭐ Mejor valorados',
            'products.price_label': 'Precio:',
            'products.price_min': 'Mín',
            'products.price_max': 'Máx',
            'products.filter': 'Filtrar',
            'products.clear': 'Limpiar',
            'products.filter_all': 'Todas',
            'products.showing': 'Mostrando',
            'products.items': 'producto(s)',
            'products.no_results_title': 'Sin resultados',
            'products.no_results_desc': 'Intenta con otros filtros o términos de búsqueda.',
            'products.add_to_cart': 'Carrito',
            'products.view_more': 'Ver más',
            'products.stock.available': 'En stock',
            'products.stock.out': 'Agotado',
            'products.condition.new': 'Nuevo',
            'products.condition.used': 'Usado',
            'products.eco_score': 'Eco-Score',
            'products.seller': 'Vendedor',
            'products.shipping': 'Envío',
            'products.free_shipping': 'Envío gratis',
            
            // Detalle de producto
            'product.detail.add_to_cart': 'Agregar al carrito',
            'product.detail.buy_now': 'Comprar ahora',
            'product.detail.add_to_favorites': 'Agregar a favoritos',
            'product.detail.share': 'Compartir',
            'product.detail.description': 'Descripción',
            'product.detail.specifications': 'Especificaciones',
            'product.detail.reviews': 'Reseñas',
            'product.detail.seller_info': 'Información del vendedor',
            'product.detail.related_products': 'Productos relacionados',
            'product.detail.ask_question': 'Hacer una pregunta',
            'product.detail.report': 'Reportar producto',
            
            // Carrito
            'cart.title': 'Mi Carrito',
            'cart.empty': 'Tu carrito está vacío',
            'cart.continue_shopping': 'Continuar comprando',
            'cart.proceed_checkout': 'Proceder al pago',
            'cart.total': 'Total',
            'cart.subtotal': 'Subtotal',
            'cart.shipping': 'Envío',
            'cart.tax': 'Impuestos',
            'cart.remove': 'Eliminar',
            'cart.quantity': 'Cantidad',
            'cart.update': 'Actualizar',
            'cart.item_added': 'Producto agregado al carrito',
            'cart.item_removed': 'Producto eliminado del carrito',
            
            // Favoritos
            'favorites.title': 'Tus favoritos',
            'favorites.description': 'Guarda los productos que más te interesan y vuelve a ellos cuando quieras.',
            'favorites.empty': 'No tienes productos en favoritos',
            'favorites.empty_title': 'Aún no tienes favoritos',
            'favorites.empty_desc': 'Marca productos como favoritos desde el catálogo para encontrarlos aquí.',
            'favorites.explore': 'Explorar productos',
            'favorites.add': 'Agregar a favoritos',
            'favorites.remove': 'Eliminar de favoritos',
            'favorites.share': 'Compartir lista',
            
            // Perfil
            'profile.title': 'Mi Panel',
            'profile.welcome': 'Bienvenido,',
            'profile.publish': 'Publicar producto',
            'profile.logout': 'Cerrar sesión',
            'profile.followers': 'Seguidores',
            'profile.following': 'Siguiendo',
            'profile.xp': 'Puntos',
            'profile.stats.publications': 'Publicaciones',
            'profile.stats.favorites': 'Favoritos',
            'profile.stats.reviews': 'Reseñas recibidas',
            'profile.stats.sales': 'Ventas',
            'profile.edit': 'Editar perfil',
            'profile.settings': 'Configuración',
            'profile.notifications': 'Notificaciones',
            'profile.orders': 'Mis pedidos',
            'profile.no_products': 'Aún no has publicado productos',
            'profile.no_products_desc': 'Publica tu primer producto y comienza a vender.',
            'profile.no_favorites': 'Aún no tienes favoritos',
            'profile.no_favorites_desc': 'Explora productos y guarda tus favoritos.',
            'profile.no_reviews': 'Aún no has escrito reseñas',
            'profile.no_reviews_desc': 'Compra productos y comparte tu experiencia.',
            'profile.no_orders': 'Aún no tienes pedidos',
            'profile.no_orders_desc': 'Tus compras aparecerán aquí.',
            'profile.tab_products': 'Mis productos',
            'profile.tab_favorites': 'Favoritos',
            'profile.tab_reviews': 'Mis reseñas',
            'profile.tab_orders': 'Pedidos',
            'profile.tab_settings': 'Configuración',
            
            // Login/Registro
            'login.title': 'Iniciar Sesión',
            'login.email': 'Correo electrónico',
            'login.password': 'Contraseña',
            'login.remember': 'Recordarme',
            'login.forgot_password': '¿Olvidaste tu contraseña?',
            'login.no_account': '¿No tienes cuenta?',
            'login.register': 'Regístrate',
            'login.submit': 'Ingresar',
            
            'register.title': 'Crear Cuenta',
            'register.name': 'Nombre completo',
            'register.email': 'Correo electrónico',
            'register.password': 'Contraseña',
            'register.confirm_password': 'Confirmar contraseña',
            'register.accept_terms': 'Acepto los términos y condiciones',
            'register.has_account': '¿Ya tienes cuenta?',
            'register.login': 'Inicia sesión',
            'register.submit': 'Registrarse',
            
            // Publicar producto
            'publish.title': 'Publicar Producto',
            'publish.product_name': 'Nombre del producto',
            'publish.category': 'Categoría',
            'publish.price': 'Precio',
            'publish.description': 'Descripción',
            'publish.condition': 'Condición',
            'publish.stock': 'Stock',
            'publish.images': 'Imágenes',
            'publish.eco_score': 'Eco-Score',
            'publish.location': 'Ubicación',
            'publish.submit': 'Publicar',
            'publish.preview': 'Vista previa',
            
            // Admin
            'admin.title': 'Panel Administrativo',
            'admin.dashboard': 'Dashboard',
            'admin.users': 'Usuarios',
            'admin.products': 'Productos',
            'admin.orders': 'Pedidos',
            'admin.reports': 'Reportes',
            'admin.settings': 'Configuración',
            'admin.reviews': 'Reseñas',
            
            // Reviews
            'reviews.title': 'Reseñas',
            'reviews.write': 'Escribir una reseña',
            'reviews.rating': 'Calificación',
            'reviews.comment': 'Comentario',
            'reviews.submit': 'Enviar reseña',
            'reviews.helpful': 'Útil',
            'reviews.report': 'Reportar',
            'reviews.no_reviews': 'Aún no hay reseñas',
            
            // Contacto
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
            
            // Checkout
            'checkout.title': 'Finalizar Compra',
            'checkout.shipping_address': 'Dirección de envío',
            'checkout.payment_method': 'Método de pago',
            'checkout.order_summary': 'Resumen del pedido',
            'checkout.place_order': 'Realizar pedido',
            'checkout.card_number': 'Número de tarjeta',
            'checkout.card_expiry': 'Fecha de expiración',
            'checkout.card_cvc': 'CVC',
            'checkout.success': '¡Pedido realizado con éxito!',
            'confirmation.success_message': 'Gracias por confiar en EcoMarket. Tu pedido ha sido registrado y será procesado en las próximas horas.',
            
            // Comparar
            'compare.title': 'Comparar productos',
            'compare.description': 'Selecciona hasta 4 productos para comparar lado a lado o por puntuación.',
            'compare.add': 'Añadir',
            'compare.clear': 'Limpiar',
            'compare.side_by_side': 'Lado a lado',
            'compare.by_score': 'Por puntuación',
            
            // Publicar
            'publicar.choose_multiple': 'Puedes seleccionar múltiples archivos',
            'publicar.publish_btn': 'Publicar producto',
            
            // Mensajes de error/éxito
            'error.required_field': 'Este campo es requerido',
            'error.invalid_email': 'Correo electrónico inválido',
            'error.invalid_password': 'Contraseña inválida',
            'error.password_mismatch': 'Las contraseñas no coinciden',
            'error.network': 'Error de conexión',
            'error.server': 'Error del servidor',
            'error.404_title': 'Página no encontrada',
            'error.404_desc': 'La página que buscas no existe o ha sido movida.',
            'error.404_tip': '¡No te preocupes, vuelve al inicio y sigue explorando!',
            'error.tip': 'Consejo: usa el buscador para encontrar lo que necesitas.',
            'error.go_home': 'Volver al inicio',
            'error.view_products': 'Ver productos',
            'error.contact_support': 'Contactar soporte',
            'error.500_title': 'Error del servidor',
            'error.500_desc': 'Algo salió mal en nuestro servidor.',
            'error.500_retry': 'Estamos trabajando para solucionarlo. ¡Vuelve a intentarlo!',
            'success.updated': 'Actualizado correctamente',
            'success.saved': 'Guardado correctamente',
            'success.deleted': 'Eliminado correctamente',
            
            // Formatos
            'currency': 'S/',
            'date_format': 'DD/MM/YYYY',
            'time_format': 'HH:mm'
        },
        
        en: {
            // Navigation
            'nav.home': 'Home',
            'nav.products': 'Products',
            'nav.favorites': 'Favorites',
            'nav.cart': 'Cart',
            'nav.impact': 'Impact',
            'nav.contact': 'Contact',
            'nav.publish': 'Publish',
            'nav.profile': 'My profile',
            'nav.admin': 'Admin',
            'nav.logout': 'Logout',
            'nav.login': 'Login',
            'nav.register': 'Register',
            'nav.catalog': 'Catalog',
            
            // Banner
            'banner.badge': '🔥 Special offer',
            'banner.title': 'Buy eco-friendly and save!',
            'banner.description': 'Sustainable products with up to 30% discount on your first purchase',
            'banner.cta': 'View offers',
            
            // Hero
            'hero.badge': '100% Eco-friendly Marketplace',
            'hero.title': 'Buy and sell sustainable products',
            'hero.subtitle': 'Discover thousands of eco-friendly products from sellers committed to the planet. Every purchase makes a real positive impact.',
            'hero.explore': 'Explore products',
            'hero.publish': 'Publish for free',
            'hero.trust.shipping': 'Free shipping',
            'hero.trust.payment': 'Secure payment',
            'hero.trust.returns': 'Easy returns',
            'hero.trust.delivery': 'Fast delivery',
            'hero.families': 'Families impacted',
            'hero.products': 'Eco products',
            'hero.plastic': 'Plastic avoided',
            
            // Categories
            'explore.tag': 'Explore',
            'categories.title': 'Popular categories',
            'categories.view_all': 'View all',
            'category.hogar': 'Home',
            'category.accesorios': 'Accessories',
            'category.higiene': 'Hygiene',
            'category.jardin': 'Garden',
            'category.alimentacion': 'Food',
            'category.ropa': 'Clothing',
            'category.description.hogar': 'Sustainable home products',
            'category.description.accesorios': 'Eco-friendly accessories',
            'category.description.higiene': 'Natural hygiene products',
            'category.description.jardin': 'Eco-friendly gardening items',
            'category.description.alimentacion': 'Organic and natural foods',
            'category.description.ropa': 'Sustainable clothing and eco textiles',
            
            // Recommended
            'recommended.tag': 'Recommended for you',
            'recommended.title': 'Based on your eco interest',
            'recommended.view_more': 'View more',
            
            // Featured
            'featured.tag': 'Featured',
            'featured.title': 'Best sellers this week',
            'featured.view_catalog': 'View full catalog',
            
            // Impact
            'impact.real': 'Real impact',
            'impact.title_main': 'Every purchase counts',
            'impact.desc_full': 'At EcoMarket we measure the environmental impact of every transaction. Together we are building a more sustainable future.',
            'impact.view_full': 'View our full impact',
            'impact.trees': 'Equivalent trees saved',
            'impact.water': 'Liters of water saved',
            'impact.plastic': 'Kg of plastic avoided',
            'impact.families': 'Families impacted',
            
            // CTA
            'cta.title': 'Do you have eco-friendly products?',
            'cta.desc': 'Publish for free and reach thousands of buyers committed to the planet.',
            'cta.publish_now': 'Publish now',
            'cta.create_account': 'Create free account',
            'cta.feature.no_commission': 'No commission for first 3 months',
            'cta.feature.dashboard': 'Complete seller dashboard',
            'cta.feature.payments': 'Secure and fast payments',
            'cta.feature.support': 'Support 7 days a week',
            
            // Community
            'community.tag': 'Community',
            'community.title': 'What our community says',
            'community.review_1': '"Since I started shopping at EcoMarket I feel like my consumption choices really matter. The products are amazing."',
            'community.review_2': '"I published my handmade products and in a month I already had 20 sales. The platform is very easy to use."',
            'community.review_3': '"I love that I can see the real impact of each purchase. It\'s motivating to know I\'m helping the planet."',
            'community.name_1': 'María García',
            'community.city_1': 'Lima, Peru',
            'community.name_2': 'Carlos López',
            'community.city_2': 'Bogotá, Colombia',
            'community.name_3': 'Ana Torres',
            'community.city_3': 'Santiago, Chile',
            
            // Footer
            'footer.description': 'Eco-friendly marketplace where you can buy, sell and give a second life to recycled and sustainable products.',
            'footer.navigation': 'Navigation',
            'footer.account': 'Account',
            'footer.legal': 'Legal',
            'footer.contact': 'Contact',
            'footer.email': 'hello@ecomarket.com',
            'footer.phone': '+51 999 888 777',
            'footer.location': 'Lima, Peru',
            'footer.hours': 'Mon - Sat: 9am - 6pm',
            'footer.terms': 'Terms and conditions',
            'footer.privacy': 'Privacy policy',
            'footer.profile': 'My profile',
            'footer.publish': 'Publish product',
            'footer.logout': 'Logout',
            'footer.login': 'Login',
            'footer.register': 'Register',
            'footer.cart': 'My cart',
            'footer.copyright': '© 2026 EcoMarket — All rights reserved.',
            'footer.made_with': 'Made with ❤️ for the planet',
            
            // Products
            'products.title': 'Product catalog',
            'products.desc': 'Discover eco-friendly items.',
            'products.count': 'product(s) available.',
            'products.publish': 'Publish',
            'products.search_placeholder': 'Search products...',
            'products.order.new': '📅 Newest',
            'products.order.popular': '🔥 Most popular',
            'products.order.cheap': '💰 Lowest price',
            'products.order.expensive': '💎 Highest price',
            'products.order.rated': '⭐ Best rated',
            'products.price_label': 'Price:',
            'products.price_min': 'Min',
            'products.price_max': 'Max',
            'products.filter': 'Filter',
            'products.clear': 'Clear',
            'products.filter_all': 'All',
            'products.showing': 'Showing',
            'products.items': 'product(s)',
            'products.no_results_title': 'No results',
            'products.no_results_desc': 'Try with other filters or search terms.',
            'products.add_to_cart': 'Cart',
            'products.view_more': 'View more',
            'products.stock.available': 'In stock',
            'products.stock.out': 'Out of stock',
            'products.condition.new': 'New',
            'products.condition.used': 'Used',
            'products.eco_score': 'Eco-Score',
            'products.seller': 'Seller',
            'products.shipping': 'Shipping',
            'products.free_shipping': 'Free shipping',
            
            // Product detail
            'product.detail.add_to_cart': 'Add to cart',
            'product.detail.buy_now': 'Buy now',
            'product.detail.add_to_favorites': 'Add to favorites',
            'product.detail.share': 'Share',
            'product.detail.description': 'Description',
            'product.detail.specifications': 'Specifications',
            'product.detail.reviews': 'Reviews',
            'product.detail.seller_info': 'Seller information',
            'product.detail.related_products': 'Related products',
            'product.detail.ask_question': 'Ask a question',
            'product.detail.report': 'Report product',
            
            // Cart
            'cart.title': 'My Cart',
            'cart.empty': 'Your cart is empty',
            'cart.continue_shopping': 'Continue shopping',
            'cart.proceed_checkout': 'Proceed to checkout',
            'cart.total': 'Total',
            'cart.subtotal': 'Subtotal',
            'cart.shipping': 'Shipping',
            'cart.tax': 'Tax',
            'cart.remove': 'Remove',
            'cart.quantity': 'Quantity',
            'cart.update': 'Update',
            'cart.item_added': 'Product added to cart',
            'cart.item_removed': 'Product removed from cart',
            
            // Favorites
            'favorites.title': 'My Favorites',
            'favorites.description': 'Save the products you are most interested in and come back to them whenever you want.',
            'favorites.empty': 'You have no favorite products',
            'favorites.empty_title': 'No favorites yet',
            'favorites.empty_desc': 'Mark products as favorites from the catalog to find them here.',
            'favorites.explore': 'Explore products',
            'favorites.add': 'Add to favorites',
            'favorites.remove': 'Remove from favorites',
            'favorites.share': 'Share list',
            
            // Profile
            'profile.title': 'My Dashboard',
            'profile.welcome': 'Welcome,',
            'profile.publish': 'Publish product',
            'profile.logout': 'Logout',
            'profile.followers': 'Followers',
            'profile.following': 'Following',
            'profile.xp': 'Points',
            'profile.stats.publications': 'Publications',
            'profile.stats.favorites': 'Favorites',
            'profile.stats.reviews': 'Reviews received',
            'profile.stats.sales': 'Sales',
            'profile.edit': 'Edit profile',
            'profile.settings': 'Settings',
            'profile.notifications': 'Notifications',
            'profile.orders': 'My orders',
            'profile.no_products': 'No products published yet',
            'profile.no_products_desc': 'Publish your first product and start selling.',
            'profile.no_favorites': 'No favorites yet',
            'profile.no_favorites_desc': 'Explore products and save your favorites.',
            'profile.no_reviews': 'No reviews written yet',
            'profile.no_reviews_desc': 'Buy products and share your experience.',
            'profile.no_orders': 'No orders yet',
            'profile.no_orders_desc': 'Your purchases will appear here.',
            'profile.tab_products': 'My products',
            'profile.tab_favorites': 'Favorites',
            'profile.tab_reviews': 'My reviews',
            'profile.tab_orders': 'Orders',
            'profile.tab_settings': 'Settings',
            
            // Login/Register
            'login.title': 'Sign In',
            'login.email': 'Email address',
            'login.password': 'Password',
            'login.remember': 'Remember me',
            'login.forgot_password': 'Forgot your password?',
            'login.no_account': 'Don\'t have an account?',
            'login.register': 'Sign up',
            'login.submit': 'Sign in',
            
            'register.title': 'Create Account',
            'register.name': 'Full name',
            'register.email': 'Email address',
            'register.password': 'Password',
            'register.confirm_password': 'Confirm password',
            'register.accept_terms': 'I accept the terms and conditions',
            'register.has_account': 'Already have an account?',
            'register.login': 'Sign in',
            'register.submit': 'Sign up',
            
            // Publish product
            'publish.title': 'Publish Product',
            'publish.product_name': 'Product name',
            'publish.category': 'Category',
            'publish.price': 'Price',
            'publish.description': 'Description',
            'publish.condition': 'Condition',
            'publish.stock': 'Stock',
            'publish.images': 'Images',
            'publish.eco_score': 'Eco-Score',
            'publish.location': 'Location',
            'publish.submit': 'Publish',
            'publish.preview': 'Preview',
            
            // Admin
            'admin.title': 'Admin Dashboard',
            'admin.dashboard': 'Dashboard',
            'admin.users': 'Users',
            'admin.products': 'Products',
            'admin.orders': 'Orders',
            'admin.reports': 'Reports',
            'admin.settings': 'Settings',
            'admin.reviews': 'Reviews',
            
            // Reviews
            'reviews.title': 'Reviews',
            'reviews.write': 'Write a review',
            'reviews.rating': 'Rating',
            'reviews.comment': 'Comment',
            'reviews.submit': 'Submit review',
            'reviews.helpful': 'Helpful',
            'reviews.report': 'Report',
            'reviews.no_reviews': 'No reviews yet',
            
            // Contact
            'contact.title': 'Contact',
            'contact.desc': 'Have questions or want to publish on EcoMarket? Write to us and we will respond soon.',
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
            'contact.form_email_placeholder': 'your@email.com',
            'contact.form_message': 'Message',
            'contact.form_message_placeholder': 'Tell us how we can help you',
            'contact.send_button': 'Send message',
            'contact.success': 'Message sent. We will contact you soon.',
            
            // Checkout
            'checkout.title': 'Checkout',
            'checkout.shipping_address': 'Shipping address',
            'checkout.payment_method': 'Payment method',
            'checkout.order_summary': 'Order summary',
            'checkout.place_order': 'Place order',
            'checkout.card_number': 'Card number',
            'checkout.card_expiry': 'Expiry date',
            'checkout.card_cvc': 'CVC',
            'checkout.success': 'Order placed successfully!',
            'confirmation.success_message': 'Thank you for trusting EcoMarket. Your order has been registered and will be processed in the next few hours.',
            
            // Compare
            'compare.title': 'Compare products',
            'compare.description': 'Select up to 4 products to compare side by side or by score.',
            'compare.add': 'Add',
            'compare.clear': 'Clear',
            'compare.side_by_side': 'Side by side',
            'compare.by_score': 'By score',
            
            // Publish
            'publicar.choose_multiple': 'You can select multiple files',
            'publicar.publish_btn': 'Publish product',
            
            // Error/Success messages
            'error.required_field': 'This field is required',
            'error.invalid_email': 'Invalid email address',
            'error.invalid_password': 'Invalid password',
            'error.password_mismatch': 'Passwords do not match',
            'error.network': 'Connection error',
            'error.server': 'Server error',
            'error.404_title': 'Page not found',
            'error.404_desc': 'The page you are looking for does not exist or has been moved.',
            'error.404_tip': 'Don\'t worry, go back to the homepage and keep exploring!',
            'error.tip': 'Tip: use search to find what you need.',
            'error.go_home': 'Go back to homepage',
            'error.view_products': 'View products',
            'error.contact_support': 'Contact support',
            'error.500_title': 'Server error',
            'error.500_desc': 'Something went wrong on our server.',
            'error.500_retry': 'We are working to fix it. Please try again!',
            'success.updated': 'Updated successfully',
            'success.saved': 'Saved successfully',
            'success.deleted': 'Deleted successfully',
            
            // Formats
            'currency': '$',
            'date_format': 'MM/DD/YYYY',
            'time_format': 'HH:mm'
        },
        
        pt: {
            // Navegação
            'nav.home': 'Início',
            'nav.products': 'Produtos',
            'nav.favorites': 'Favoritos',
            'nav.cart': 'Carrinho',
            'nav.impact': 'Impacto',
            'nav.contact': 'Contato',
            'nav.publish': 'Publicar',
            'nav.profile': 'Meu perfil',
            'nav.admin': 'Admin',
            'nav.logout': 'Sair',
            'nav.login': 'Entrar',
            'nav.register': 'Registrar',
            'nav.catalog': 'Catálogo',
            
            // Banner
            'banner.badge': '🔥 Oferta especial',
            'banner.title': 'Compre ecológico e economize!',
            'banner.description': 'Produtos sustentáveis com até 30% de desconto na primeira compra',
            'banner.cta': 'Ver ofertas',
            
            // Hero
            'hero.badge': 'Marketplace 100% ecológico',
            'hero.title': 'Compre e venda produtos sustentáveis',
            'hero.subtitle': 'Descubra milhares de produtos ecológicos de vendedores comprometidos com o planeta. Cada compra gera um impacto positivo real.',
            'hero.explore': 'Explorar produtos',
            'hero.publish': 'Publicar grátis',
            'hero.trust.shipping': 'Frete grátis',
            'hero.trust.payment': 'Pagamento seguro',
            'hero.trust.returns': 'Devoluções fáceis',
            'hero.trust.delivery': 'Entrega rápida',
            'hero.families': 'Famílias impactadas',
            'hero.products': 'Produtos ecológicos',
            'hero.plastic': 'Plástico evitado',
            
            // Categorias
            'explore.tag': 'Explorar',
            'categories.title': 'Categorias populares',
            'categories.view_all': 'Ver todos',
            'category.hogar': 'Lar',
            'category.accesorios': 'Acessórios',
            'category.higiene': 'Higiene',
            'category.jardin': 'Jardim',
            'category.alimentacion': 'Alimentação',
            'category.ropa': 'Roupa',
            'category.description.hogar': 'Produtos para lar sustentável',
            'category.description.accesorios': 'Acessórios ecológicos',
            'category.description.higiene': 'Produtos de higiene natural',
            'category.description.jardin': 'Artigos de jardinagem ecológica',
            'category.description.alimentacao': 'Alimentos orgânicos e naturais',
            'category.description.ropa': 'Roupa sustentável e têxteis ecológicos',
            
            // Produtos
            'products.title': 'Catálogo de produtos',
            'products.desc': 'Descubra artigos ecológicos.',
            'products.count': 'produto(s) disponível(is).',
            'products.publish': 'Publicar',
            'products.search_placeholder': 'Buscar produtos...',
            'products.order.new': '📅 Mais recentes',
            'products.order.popular': '🔥 Mais populares',
            'products.order.cheap': '💰 Menor preço',
            'products.order.expensive': '💎 Maior preço',
            'products.order.rated': '⭐ Melhor avaliados',
            'products.price_label': 'Preço:',
            'products.price_min': 'Mín',
            'products.price_max': 'Máx',
            'products.filter': 'Filtrar',
            'products.clear': 'Limpar',
            'products.filter_all': 'Todos',
            'products.showing': 'Mostrando',
            'products.items': 'produto(s)',
            'products.no_results_title': 'Sem resultados',
            'products.no_results_desc': 'Tente com outros filtros ou termos de busca.',
            'products.add_to_cart': 'Carrinho',
            'products.view_more': 'Ver mais',
            'products.stock.available': 'Em estoque',
            'products.stock.out': 'Esgotado',
            'products.condition.new': 'Novo',
            'products.condition.used': 'Usado',
            'products.eco_score': 'Eco-Score',
            'products.seller': 'Vendedor',
            'products.shipping': 'Envio',
            'products.free_shipping': 'Frete grátis',
            
            // Formatos
            'currency': 'R$',
            'date_format': 'DD/MM/YYYY',
            'time_format': 'HH:mm'
        },
        
        fr: {
            // Navigation
            'nav.home': 'Accueil',
            'nav.products': 'Produits',
            'nav.favorites': 'Favoris',
            'nav.cart': 'Panier',
            'nav.impact': 'Impact',
            'nav.contact': 'Contact',
            'nav.publish': 'Publier',
            'nav.profile': 'Mon profil',
            'nav.admin': 'Admin',
            'nav.logout': 'Déconnexion',
            'nav.login': 'Connexion',
            'nav.register': 'S\'inscrire',
            'nav.catalog': 'Catalogue',
            
            // Categories
            'categories.title': 'Catégories populaires',
            'category.hogar': 'Maison',
            'category.accesorios': 'Accessoires',
            'category.higiene': 'Hygiène',
            'category.jardin': 'Jardin',
            'category.alimentacion': 'Alimentation',
            'category.ropa': 'Vêtements',
            
            // Products
            'products.title': 'Catalogue de produits',
            'products.search_placeholder': 'Rechercher des produits...',
            'products.add_to_cart': 'Panier',
            'products.stock.available': 'En stock',
            'products.stock.out': 'Épuisé',
            
            // Formatos
            'currency': '€',
            'date_format': 'DD/MM/YYYY',
            'time_format': 'HH:mm'
        },
        
        de: {
            // Navigation
            'nav.home': 'Startseite',
            'nav.products': 'Produkte',
            'nav.favorites': 'Favoriten',
            'nav.cart': 'Warenkorb',
            'nav.impact': 'Auswirkung',
            'nav.contact': 'Kontakt',
            'nav.publish': 'Veröffentlichen',
            'nav.profile': 'Mein Profil',
            'nav.admin': 'Admin',
            'nav.logout': 'Abmelden',
            'nav.login': 'Anmelden',
            'nav.register': 'Registrieren',
            'nav.catalog': 'Katalog',
            
            // Categories
            'categories.title': 'Beliebte Kategorien',
            'category.hogar': 'Haushalt',
            'category.accesorios': 'Zubehör',
            'category.higiene': 'Hygiene',
            'category.jardin': 'Garten',
            'category.alimentacion': 'Lebensmittel',
            'category.ropa': 'Kleidung',
            
            // Products
            'products.title': 'Produktkatalog',
            'products.search_placeholder': 'Produkte suchen...',
            'products.add_to_cart': 'Warenkorb',
            'products.stock.available': 'Auf Lager',
            'products.stock.out': 'Ausverkauft',
            
            // Formatos
            'currency': '€',
            'date_format': 'DD.MM.YYYY',
            'time_format': 'HH:mm'
        },
        
        it: {
            // Navigation
            'nav.home': 'Home',
            'nav.products': 'Prodotti',
            'nav.favorites': 'Preferiti',
            'nav.cart': 'Carrello',
            'nav.impact': 'Impatto',
            'nav.contact': 'Contatto',
            'nav.publish': 'Pubblica',
            'nav.profile': 'Il mio profilo',
            'nav.admin': 'Admin',
            'nav.logout': 'Esci',
            'nav.login': 'Accedi',
            'nav.register': 'Registrati',
            'nav.catalog': 'Catalogo',
            
            // Categories
            'categories.title': 'Categorie popolari',
            'category.hogar': 'Casa',
            'category.accesorios': 'Accessori',
            'category.higiene': 'Igiene',
            'category.jardin': 'Giardino',
            'category.alimentacion': 'Alimentazione',
            'category.ropa': 'Abbigliamento',
            
            // Products
            'products.title': 'Catalogo prodotti',
            'products.search_placeholder': 'Cerca prodotti...',
            'products.add_to_cart': 'Carrello',
            'products.stock.available': 'Disponibile',
            'products.stock.out': 'Esaurito',
            
            // Formatos
            'currency': '€',
            'date_format': 'DD/MM/YYYY',
            'time_format': 'HH:mm'
        }
    },

    // Textos de la página de inicio (secciones extensas sin clave previa)
    homeI18n: {
        es: {
            'home.search_placeholder': 'Buscar productos ecológicos...',
            'home.search_button': 'Buscar',
            'home.stat_products': 'Productos',
            'home.stat_categories': 'Categorías',
            'home.stat_users': 'Usuarios',
            'home.categories_subtitle': 'Explora nuestra variedad de productos sostenibles',
            'home.featured_title': 'Productos destacados',
            'home.featured_subtitle': 'Los más vendidos esta semana',
            'home.product_available': 'Disponible',
            'home.view_details': 'Ver detalles',
            'home.how_title': '¿Cómo funciona EcoMarket?',
            'home.how_subtitle': 'Comprar y vender productos sostenibles nunca fue tan fácil',
            'home.how1_title': 'Regístrate gratis',
            'home.how1_desc': 'Crea tu cuenta en segundos y empieza a explorar productos ecológicos.',
            'home.how2_title': 'Explora productos',
            'home.how2_desc': 'Encuentra artículos sostenibles que se adapten a tu estilo de vida.',
            'home.how3_title': 'Compra segura',
            'home.how3_desc': 'Paga de forma segura y recibe tus productos en casa.',
            'home.how4_title': 'Impacto real',
            'home.how4_desc': 'Cada compra contribuye a reducir residuos y proteger el planeta.',
            'home.benefits_title': 'Beneficios para todos',
            'home.benefits_subtitle': 'Tanto compradores como vendedores ganan en EcoMarket',
            'home.buyers_title': 'Para compradores',
            'home.buyers1': 'Productos verificados y de calidad',
            'home.buyers2': 'Pagos seguros y protegidos',
            'home.buyers3': 'Envíos confiables y rápidos',
            'home.buyers4': 'Soporte 24/7',
            'home.sellers_title': 'Para vendedores',
            'home.sellers1': 'Publica productos gratis',
            'home.sellers2': 'Comisiones bajas',
            'home.sellers3': 'Panel de control completo',
            'home.sellers4': 'Alcance a miles de compradores',
            'home.impact_title': 'Nuestro impacto ambiental',
            'home.impact_subtitle': 'Cifras reales de nuestro compromiso con el planeta',
            'home.testimonials_title': 'Lo que dicen nuestros usuarios',
            'home.testimonials_subtitle': 'Experiencias reales de nuestra comunidad',
            'home.test1_text': '"Desde que compro en EcoMarket siento que mis decisiones de consumo realmente importan. Los productos son increíbles."',
            'home.test1_name': 'María García',
            'home.test1_city': 'Lima, Perú',
            'home.test2_text': '"Publiqué mis productos artesanales y en un mes ya tenía 20 ventas. La plataforma es muy fácil de usar."',
            'home.test2_name': 'Carlos López',
            'home.test2_city': 'Bogotá, Colombia',
            'home.test3_text': '"Me encanta que puedo ver el impacto real de cada compra. Es motivador saber que estoy ayudando al planeta."',
            'home.test3_name': 'Ana Torres',
            'home.test3_city': 'Santiago, Chile',
            'home.faq_title': 'Preguntas frecuentes',
            'home.faq_subtitle': 'Todo lo que necesitas saber sobre EcoMarket',
            'home.faq1_q': '¿Es gratis registrarse?',
            'home.faq1_a': 'Sí, el registro es completamente gratuito para compradores y vendedores.',
            'home.faq2_q': '¿Cómo protegen mis pagos?',
            'home.faq2_a': 'Utilizamos sistemas de pago seguros con encriptación SSL y protecciones anti-fraude.',
            'home.faq3_q': '¿Puedo devolver un producto?',
            'home.faq3_a': 'Sí, ofrecemos una política de devoluciones de 30 días para productos que no cumplan con lo esperado.',
            'home.faq4_q': '¿Cómo verifican a los vendedores?',
            'home.faq4_a': 'Implementamos un sistema de verificación en varios niveles para garantizar la confianza.'
        },
        en: {
            'home.search_placeholder': 'Search eco-friendly products...',
            'home.search_button': 'Search',
            'home.stat_products': 'Products',
            'home.stat_categories': 'Categories',
            'home.stat_users': 'Users',
            'home.categories_subtitle': 'Explore our range of sustainable products',
            'home.featured_title': 'Featured products',
            'home.featured_subtitle': 'Best sellers this week',
            'home.product_available': 'Available',
            'home.view_details': 'View details',
            'home.how_title': 'How does EcoMarket work?',
            'home.how_subtitle': 'Buying and selling sustainable products has never been easier',
            'home.how1_title': 'Sign up for free',
            'home.how1_desc': 'Create your account in seconds and start exploring eco-friendly products.',
            'home.how2_title': 'Explore products',
            'home.how2_desc': 'Find sustainable items that fit your lifestyle.',
            'home.how3_title': 'Shop safely',
            'home.how3_desc': 'Pay securely and receive your products at home.',
            'home.how4_title': 'Real impact',
            'home.how4_desc': 'Every purchase helps reduce waste and protect the planet.',
            'home.benefits_title': 'Benefits for everyone',
            'home.benefits_subtitle': 'Both buyers and sellers win on EcoMarket',
            'home.buyers_title': 'For buyers',
            'home.buyers1': 'Verified quality products',
            'home.buyers2': 'Secure and protected payments',
            'home.buyers3': 'Reliable and fast shipping',
            'home.buyers4': '24/7 support',
            'home.sellers_title': 'For sellers',
            'home.sellers1': 'List products for free',
            'home.sellers2': 'Low commissions',
            'home.sellers3': 'Full control panel',
            'home.sellers4': 'Reach thousands of buyers',
            'home.impact_title': 'Our environmental impact',
            'home.impact_subtitle': 'Real figures from our commitment to the planet',
            'home.testimonials_title': 'What our users say',
            'home.testimonials_subtitle': 'Real experiences from our community',
            'home.test1_text': '"Since I started shopping on EcoMarket I feel my consumption choices really matter. The products are amazing."',
            'home.test1_name': 'María García',
            'home.test1_city': 'Lima, Peru',
            'home.test2_text': '"I listed my handmade products and within a month I had 20 sales. The platform is very easy to use."',
            'home.test2_name': 'Carlos López',
            'home.test2_city': 'Bogotá, Colombia',
            'home.test3_text': '"I love being able to see the real impact of every purchase. It is motivating to know I am helping the planet."',
            'home.test3_name': 'Ana Torres',
            'home.test3_city': 'Santiago, Chile',
            'home.faq_title': 'Frequently asked questions',
            'home.faq_subtitle': 'Everything you need to know about EcoMarket',
            'home.faq1_q': 'Is it free to sign up?',
            'home.faq1_a': 'Yes, registration is completely free for buyers and sellers.',
            'home.faq2_q': 'How do you protect my payments?',
            'home.faq2_a': 'We use secure payment systems with SSL encryption and anti-fraud protection.',
            'home.faq3_q': 'Can I return a product?',
            'home.faq3_a': 'Yes, we offer a 30-day return policy for products that do not meet expectations.',
            'home.faq4_q': 'How do you verify sellers?',
            'home.faq4_a': 'We implement a multi-level verification system to ensure trust.'
        },
        pt: {
            'home.search_placeholder': 'Buscar produtos ecológicos...',
            'home.search_button': 'Buscar',
            'home.stat_products': 'Produtos',
            'home.stat_categories': 'Categorias',
            'home.stat_users': 'Usuários',
            'home.categories_subtitle': 'Explore nossa variedade de produtos sustentáveis',
            'home.featured_title': 'Produtos em destaque',
            'home.featured_subtitle': 'Os mais vendidos desta semana',
            'home.product_available': 'Disponível',
            'home.view_details': 'Ver detalhes',
            'home.how_title': 'Como funciona o EcoMarket?',
            'home.how_subtitle': 'Comprar e vender produtos sustentáveis nunca foi tão fácil',
            'home.how1_title': 'Cadastre-se grátis',
            'home.how1_desc': 'Crie sua conta em segundos e comece a explorar produtos ecológicos.',
            'home.how2_title': 'Explore produtos',
            'home.how2_desc': 'Encontre artigos sustentáveis que combinam com seu estilo de vida.',
            'home.how3_title': 'Compra segura',
            'home.how3_desc': 'Pague com segurança e receba seus produtos em casa.',
            'home.how4_title': 'Impacto real',
            'home.how4_desc': 'Cada compra contribui para reduzir resíduos e proteger o planeta.',
            'home.benefits_title': 'Benefícios para todos',
            'home.benefits_subtitle': 'Compradores e vendedores ganham no EcoMarket',
            'home.buyers_title': 'Para compradores',
            'home.buyers1': 'Produtos verificados e de qualidade',
            'home.buyers2': 'Pagamentos seguros e protegidos',
            'home.buyers3': 'Envios confiáveis e rápidos',
            'home.buyers4': 'Suporte 24/7',
            'home.sellers_title': 'Para vendedores',
            'home.sellers1': 'Publique produtos grátis',
            'home.sellers2': 'Comissões baixas',
            'home.sellers3': 'Painel de controle completo',
            'home.sellers4': 'Alcance a milhares de compradores',
            'home.impact_title': 'Nosso impacto ambiental',
            'home.impact_subtitle': 'Números reais do nosso compromisso com o planeta',
            'home.testimonials_title': 'O que dizem nossos usuários',
            'home.testimonials_subtitle': 'Experiências reais da nossa comunidade',
            'home.test1_text': '"Desde que compro no EcoMarket sinto que minhas decisões de consumo realmente importam. Os produtos são incríveis."',
            'home.test1_name': 'María García',
            'home.test1_city': 'Lima, Peru',
            'home.test2_text': '"Publiquei meus produtos artesanais e em um mês já tinha 20 vendas. A plataforma é muito fácil de usar."',
            'home.test2_name': 'Carlos López',
            'home.test2_city': 'Bogotá, Colômbia',
            'home.test3_text': '"Adoro poder ver o impacto real de cada compra. É motivador saber que estou ajudando o planeta."',
            'home.test3_name': 'Ana Torres',
            'home.test3_city': 'Santiago, Chile',
            'home.faq_title': 'Perguntas frequentes',
            'home.faq_subtitle': 'Tudo o que você precisa saber sobre o EcoMarket',
            'home.faq1_q': 'É grátis se registrar?',
            'home.faq1_a': 'Sim, o registro é completamente gratuito para compradores e vendedores.',
            'home.faq2_q': 'Como vocês protegem meus pagamentos?',
            'home.faq2_a': 'Usamos sistemas de pagamento seguros com criptografia SSL e proteções antifraude.',
            'home.faq3_q': 'Posso devolver um produto?',
            'home.faq3_a': 'Sim, oferecemos uma política de devolução de 30 dias para produtos que não atendam ao esperado.',
            'home.faq4_q': 'Como vocês verificam os vendedores?',
            'home.faq4_a': 'Implementamos um sistema de verificação em vários níveis para garantir a confiança.'
        },
        fr: {
            'home.search_placeholder': 'Rechercher des produits écologiques...',
            'home.search_button': 'Rechercher',
            'home.stat_products': 'Produits',
            'home.stat_categories': 'Catégories',
            'home.stat_users': 'Utilisateurs',
            'home.categories_subtitle': 'Explorez notre gamme de produits durables',
            'home.featured_title': 'Produits en vedette',
            'home.featured_subtitle': 'Les plus vendus cette semaine',
            'home.product_available': 'Disponible',
            'home.view_details': 'Voir les détails',
            'home.how_title': 'Comment fonctionne EcoMarket ?',
            'home.how_subtitle': 'Acheter et vendre des produits durables n\'a jamais été aussi facile',
            'home.how1_title': 'Inscrivez-vous gratuitement',
            'home.how1_desc': 'Créez votre compte en quelques secondes et commencez à explorer des produits écologiques.',
            'home.how2_title': 'Explorez les produits',
            'home.how2_desc': 'Trouvez des articles durables adaptés à votre style de vie.',
            'home.how3_title': 'Achetez en toute sécurité',
            'home.how3_desc': 'Payez en toute sécurité et recevez vos produits à domicile.',
            'home.how4_title': 'Impact réel',
            'home.how4_desc': 'Chaque achat contribue à réduire les déchets et à protéger la planète.',
            'home.benefits_title': 'Des avantages pour tous',
            'home.benefits_subtitle': 'Acheteurs et vendeurs gagnent sur EcoMarket',
            'home.buyers_title': 'Pour les acheteurs',
            'home.buyers1': 'Produits vérifiés et de qualité',
            'home.buyers2': 'Paiements sécurisés et protégés',
            'home.buyers3': 'Livraisons fiables et rapides',
            'home.buyers4': 'Support 24/7',
            'home.sellers_title': 'Pour les vendeurs',
            'home.sellers1': 'Publiez des produits gratuitement',
            'home.sellers2': 'Commissions basses',
            'home.sellers3': 'Panneau de contrôle complet',
            'home.sellers4': 'Portée vers des milliers d\'acheteurs',
            'home.impact_title': 'Notre impact environnemental',
            'home.impact_subtitle': 'Chiffres réels de notre engagement pour la planète',
            'home.testimonials_title': 'Ce que disent nos utilisateurs',
            'home.testimonials_subtitle': 'Expériences réelles de notre communauté',
            'home.test1_text': '"Depuis que j\'achète sur EcoMarket, je sens que mes choix de consommation comptent vraiment. Les produits sont incroyables."',
            'home.test1_name': 'María García',
            'home.test1_city': 'Lima, Pérou',
            'home.test2_text': '"J\'ai publié mes produits artisanaux et en un mois j\'avais déjà 20 ventes. La plateforme est très facile à utiliser."',
            'home.test2_name': 'Carlos López',
            'home.test2_city': 'Bogotá, Colombie',
            'home.test3_text': '"J\'adore pouvoir voir l\'impact réel de chaque achat. C\'est motivant de savoir que j\'aide la planète."',
            'home.test3_name': 'Ana Torres',
            'home.test3_city': 'Santiago, Chili',
            'home.faq_title': 'Questions fréquentes',
            'home.faq_subtitle': 'Tout ce que vous devez savoir sur EcoMarket',
            'home.faq1_q': 'L\'inscription est-elle gratuite ?',
            'home.faq1_a': 'Oui, l\'inscription est entièrement gratuite pour les acheteurs et les vendeurs.',
            'home.faq2_q': 'Comment protégez-vous mes paiements ?',
            'home.faq2_a': 'Nous utilisons des systèmes de paiement sécurisés avec chiffrement SSL et protections anti-fraude.',
            'home.faq3_q': 'Puis-je retourner un produit ?',
            'home.faq3_a': 'Oui, nous offrons une politique de retour de 30 jours pour les produits qui ne répondent pas aux attentes.',
            'home.faq4_q': 'Comment vérifiez-vous les vendeurs ?',
            'home.faq4_a': 'Nous mettons en œuvre un système de vérification multi-niveaux pour garantir la confiance.'
        },
        de: {
            'home.search_placeholder': 'Ökologische Produkte suchen...',
            'home.search_button': 'Suchen',
            'home.stat_products': 'Produkte',
            'home.stat_categories': 'Kategorien',
            'home.stat_users': 'Nutzer',
            'home.categories_subtitle': 'Entdecke unsere Auswahl an nachhaltigen Produkten',
            'home.featured_title': 'Empfohlene Produkte',
            'home.featured_subtitle': 'Die meistverkauften dieser Woche',
            'home.product_available': 'Verfügbar',
            'home.view_details': 'Details ansehen',
            'home.how_title': 'Wie funktioniert EcoMarket?',
            'home.how_subtitle': 'Nachhaltige Produkte kaufen und verkaufen war noch nie so einfach',
            'home.how1_title': 'Kostenlos registrieren',
            'home.how1_desc': 'Erstelle dein Konto in Sekunden und beginne mit der Suche nach ökologischen Produkten.',
            'home.how2_title': 'Produkte entdecken',
            'home.how2_desc': 'Finde nachhaltige Artikel, die zu deinem Lebensstil passen.',
            'home.how3_title': 'Sicher einkaufen',
            'home.how3_desc': 'Beahle sicher und erhalte deine Produkte zu Hause.',
            'home.how4_title': 'Echter Impact',
            'home.how4_desc': 'Jeder Kauf trägt dazu bei, Abfall zu reduzieren und den Planeten zu schützen.',
            'home.benefits_title': 'Vorteile für alle',
            'home.benefits_subtitle': 'Käufer und Verkäufer profitieren auf EcoMarket',
            'home.buyers_title': 'Für Käufer',
            'home.buyers1': 'Verifizierte Qualitätsprodukte',
            'home.buyers2': 'Sichere und geschützte Zahlungen',
            'home.buyers3': 'Zuverlässiger und schneller Versand',
            'home.buyers4': '24/7 Support',
            'home.sellers_title': 'Für Verkäufer',
            'home.sellers1': 'Produkte kostenlos inserieren',
            'home.sellers2': 'Niedrige Provisionen',
            'home.sellers3': 'Vollständiges Kontrollpanel',
            'home.sellers4': 'Reichweite zu tausenden Käufern',
            'home.impact_title': 'Unser Umweltauswirkungen',
            'home.impact_subtitle': 'Echte Zahlen unseres Engagements für den Planeten',
            'home.testimonials_title': 'Was unsere Nutzer sagen',
            'home.testimonials_subtitle': 'Echte Erfahrungen aus unserer Community',
            'home.test1_text': '"Seit ich auf EcoMarket einkaufe, fühle ich, dass meine Kaufentscheidungen wirklich wichtig sind. Die Produkte sind unglaublich."',
            'home.test1_name': 'María García',
            'home.test1_city': 'Lima, Peru',
            'home.test2_text': '"Ich habe meine Handwerksprodukte inseriert und hatte nach einem Monat bereits 20 Verkäufe. Die Plattform ist sehr einfach zu bedienen."',
            'home.test2_name': 'Carlos López',
            'home.test2_city': 'Bogotá, Kolumbien',
            'home.test3_text': '"Ich liebe es, die echte Wirkung jedes Kaufs sehen zu können. Es ist motivierend zu wissen, dass ich dem Planeten helfe."',
            'home.test3_name': 'Ana Torres',
            'home.test3_city': 'Santiago, Chile',
            'home.faq_title': 'Häufig gestellte Fragen',
            'home.faq_subtitle': 'Alles, was du über EcoMarket wissen musst',
            'home.faq1_q': 'Ist die Registrierung kostenlos?',
            'home.faq1_a': 'Ja, die Registrierung ist für Käufer und Verkäufer völlig kostenlos.',
            'home.faq2_q': 'Wie schützen Sie meine Zahlungen?',
            'home.faq2_a': 'Wir verwenden sichere Zahlungssysteme mit SSL-Verschlüsselung und Anti-Betrugsschutz.',
            'home.faq3_q': 'Kann ich ein Produkt zurückgeben?',
            'home.faq3_a': 'Ja, wir bieten eine 30-tägige Rückgaberichtlinie für Produkte, die nicht den Erwartungen entsprechen.',
            'home.faq4_q': 'Wie überprüfen Sie die Verkäufer?',
            'home.faq4_a': 'Wir implementieren ein mehrstufiges Verifizierungssystem, um Vertrauen zu gewährleisten.'
        },
        it: {
            'home.search_placeholder': 'Cerca prodotti ecologici...',
            'home.search_button': 'Cerca',
            'home.stat_products': 'Prodotti',
            'home.stat_categories': 'Categorie',
            'home.stat_users': 'Utenti',
            'home.categories_subtitle': 'Esplora la nostra gamma di prodotti sostenibili',
            'home.featured_title': 'Prodotti in evidenza',
            'home.featured_subtitle': 'I più venduti questa settimana',
            'home.product_available': 'Disponibile',
            'home.view_details': 'Vedi dettagli',
            'home.how_title': 'Come funziona EcoMarket?',
            'home.how_subtitle': 'Comprare e vendere prodotti sostenibili non è mai stato così facile',
            'home.how1_title': 'Registrati gratis',
            'home.how1_desc': 'Crea il tuo account in pochi secondi e inizia a esplorare prodotti ecologici.',
            'home.how2_title': 'Esplora i prodotti',
            'home.how2_desc': 'Trova articoli sostenibili adatti al tuo stile di vita.',
            'home.how3_title': 'Acquista in sicurezza',
            'home.how3_desc': 'Paga in modo sicuro e ricevi i tuoi prodotti a casa.',
            'home.how4_title': 'Impatto reale',
            'home.how4_desc': 'Ogni acquisto contribuisce a ridurre i rifiuti e proteggere il pianeta.',
            'home.benefits_title': 'Vantaggi per tutti',
            'home.benefits_subtitle': 'Sia acquirenti che venditori guadagnano su EcoMarket',
            'home.buyers_title': 'Per gli acquirenti',
            'home.buyers1': 'Prodotti verificati e di qualità',
            'home.buyers2': 'Pagamenti sicuri e protetti',
            'home.buyers3': 'Spedizioni affidabili e veloci',
            'home.buyers4': 'Supporto 24/7',
            'home.sellers_title': 'Per i venditori',
            'home.sellers1': 'Pubblica prodotti gratis',
            'home.sellers2': 'Commissioni basse',
            'home.sellers3': 'Pannello di controllo completo',
            'home.sellers4': 'Portata a migliaia di acquirenti',
            'home.impact_title': 'Il nostro impatto ambientale',
            'home.impact_subtitle': 'Cifre reali del nostro impegno per il pianeta',
            'home.testimonials_title': 'Cosa dicono i nostri utenti',
            'home.testimonials_subtitle': 'Esperienze reali della nostra community',
            'home.test1_text': '"Da quando acquisto su EcoMarket sento che le mie scelte di consumo contano davvero. I prodotti sono incredibili."',
            'home.test1_name': 'María García',
            'home.test1_city': 'Lima, Perù',
            'home.test2_text': '"Ho pubblicato i miei prodotti artigianali e in un mese avevo già 20 vendite. La piattaforma è molto facile da usare."',
            'home.test2_name': 'Carlos López',
            'home.test2_city': 'Bogotá, Colombia',
            'home.test3_text': '"Adoro poter vedere l\'impatto reale di ogni acquisto. È motivante sapere che sto aiutando il pianeta."',
            'home.test3_name': 'Ana Torres',
            'home.test3_city': 'Santiago, Cile',
            'home.faq_title': 'Domande frequenti',
            'home.faq_subtitle': 'Tutto ciò che devi sapere su EcoMarket',
            'home.faq1_q': 'La registrazione è gratuita?',
            'home.faq1_a': 'Sì, la registrazione è completamente gratuita per acquirenti e venditori.',
            'home.faq2_q': 'Come proteggete i miei pagamenti?',
            'home.faq2_a': 'Utilizziamo sistemi di pagamento sicuri con crittografia SSL e protezioni antifrode.',
            'home.faq3_q': 'Posso restituire un prodotto?',
            'home.faq3_a': 'Sì, offriamo una politica di reso di 30 giorni per i prodotti che non soddisfano le aspettative.',
            'home.faq4_q': 'Come verificate i venditori?',
            'home.faq4_a': 'Implementiamo un sistema di verifica multilivello per garantire la fiducia.'
        }
    },
    
    init() {
        for (const lang in this.homeI18n) {
            this.translations[lang] = Object.assign({}, this.translations[lang], this.homeI18n[lang]);
        }
        this.currentLang = localStorage.getItem('ecomarket-lang') || 'es';

        this.initLanguageSelector();
        this.initAutoDetect();
        this.translatePage();
        this.initProductTranslations();
    },
    
    // Inicializar selector de idioma mejorado
    initLanguageSelector() {
        const langContainer = document.querySelector('.lang-switcher');
        if (!langContainer) return;
        
        // Limpiar selector existente
        langContainer.innerHTML = '';
        
        // Crear selector mejorado
        const dropdown = document.createElement('div');
        dropdown.className = 'lang-dropdown';
        dropdown.innerHTML = `
            <button class="lang-dropdown-btn" id="langDropdownBtn" aria-label="Select language">
                <span class="lang-flag">${this.languages[this.currentLang].flag}</span>
                <span class="lang-name">${this.languages[this.currentLang].nativeName}</span>
                <i class="bi bi-chevron-down"></i>
            </button>
            <div class="lang-dropdown-menu" id="langDropdownMenu">
                ${Object.entries(this.languages).map(([code, lang]) => `
                    <button class="lang-option ${code === this.currentLang ? 'active' : ''}" 
                            data-lang="${code}"
                            aria-label="${lang.name}">
                        <span class="lang-flag">${lang.flag}</span>
                        <span class="lang-name">${lang.nativeName}</span>
                        ${code === this.currentLang ? '<i class="bi bi-check"></i>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
        
        langContainer.appendChild(dropdown);
        
        // Event listeners
        const dropdownBtn = dropdown.querySelector('#langDropdownBtn');
        const dropdownMenu = dropdown.querySelector('#langDropdownMenu');
        
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });
        
        dropdown.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                this.setLanguage(lang);
                
                // Actualizar estado activo
                dropdown.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Actualizar botón
                dropdownBtn.querySelector('.lang-flag').textContent = this.languages[lang].flag;
                dropdownBtn.querySelector('.lang-name').textContent = this.languages[lang].nativeName;
            });
        });
    },
    
    // Detectar idioma automáticamente
    initAutoDetect() {
        const browserLang = navigator.language.split('-')[0];
        if (this.languages[browserLang] && !localStorage.getItem('ecomarket-lang')) {
            this.setLanguage(browserLang);
        }
    },
    
    // Establecer idioma
    setLanguage(lang) {
        if (!this.languages[lang]) {
            console.warn(`Language "${lang}" not supported`);
            return;
        }
        
        this.currentLang = lang;
        localStorage.setItem('ecomarket-lang', lang);
        document.documentElement.lang = lang;
        
        // Traducir página
        this.translatePage();
        
        // Traducir productos
        this.translateProducts();
        
        // Actualizar atributo para RTL si es necesario
        document.documentElement.dir = this.isRTL(lang) ? 'rtl' : 'ltr';
        
        // Disparar evento
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },
    
    // Verificar si es RTL
    isRTL(lang) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(lang);
    },
    
    // Traducir página completa
    translatePage() {
        // Traducir elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        // Traducir placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            const translation = this.getTranslation(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
        
        // Traducir atributos
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrName = element.dataset.i18nAttr;
            const key = element.dataset.i18n;
            const translation = this.getTranslation(key);
            if (translation) {
                element.setAttribute(attrName, translation);
            }
        });
        
        // Traducir títulos
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.dataset.i18nTitle;
            const translation = this.getTranslation(key);
            if (translation) {
                element.title = translation;
            }
        });
    },
    
    // Traducir productos
    translateProducts() {
        document.querySelectorAll('[data-category]').forEach(element => {
            const category = element.dataset.category;
            const translation = this.getCategoryTranslation(category);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        document.querySelectorAll('[data-product-name]').forEach(element => {
            const productId = element.dataset.productId;
            const translation = this.getProductTranslation(productId, 'nombre');
            if (translation) {
                element.textContent = translation;
            }
        });
        
        document.querySelectorAll('[data-product-desc]').forEach(element => {
            const productId = element.dataset.productId;
            const translation = this.getProductTranslation(productId, 'descripcion');
            if (translation) {
                element.textContent = translation;
            }
        });
    },
    
    // Obtener traducción
    getTranslation(key) {
        return this.translations[this.currentLang][key] || this.translations['es'][key] || key;
    },
    
    // Obtener traducción de categoría
    getCategoryTranslation(category) {
        const key = `category.${category.toLowerCase()}`;
        return this.getTranslation(key);
    },
    
    // Obtener traducción de producto
    getProductTranslation(productId, field) {
        // Implementar para obtener traducciones de productos del servidor
        const translations = JSON.parse(localStorage.getItem('ecomarket_product_translations') || '{}');
        const productTranslations = translations[productId] || {};
        return productTranslations[`${field}_${this.currentLang}`] || null;
    },
    
    // Inicializar traducciones de productos
    initProductTranslations() {
        // Cargar traducciones de productos del servidor
        this.loadProductTranslations();
    },
    
    // Cargar traducciones de productos del servidor
    async loadProductTranslations() {
        try {
            const response = await fetch('/api/productos/traducciones');
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('ecomarket_product_translations', JSON.stringify(data.traducciones));
                this.translateProducts();
            }
        } catch (error) {
            console.error('Error loading product translations:', error);
        }
    },
    
    // Función helper para traducir texto
    t(key, params = {}) {
        let translation = this.getTranslation(key);
        
        // Reemplazar parámetros
        Object.entries(params).forEach(([param, value]) => {
            translation = translation.replace(`{${param}}`, value);
        });
        
        return translation;
    },
    
    // Obtener idiomas disponibles
    getAvailableLanguages() {
        return Object.keys(this.languages);
    },
    
    // Obtener información de idioma actual
    getCurrentLanguageInfo() {
        return this.languages[this.currentLang];
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoI18n.init());
} else {
    EcoI18n.init();
}

// Exponer globalmente
window.EcoI18n = EcoI18n;