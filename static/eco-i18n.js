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
      
      // Hero
      'hero.badge': 'Marketplace 100% ecológico',
      'hero.title': 'Compra y vende productos sostenibles',
      'hero.subtitle': 'Descubre miles de productos ecológicos de vendedores comprometidos con el planeta.',
      'hero.explore': 'Explorar productos',
      'hero.publish': 'Publicar gratis',
      'hero.families': 'Familias impactadas',
      'hero.products': 'Productos eco',
      'hero.plastic': 'Plástico evitado',
      
      // Categories
      'categories.title': 'Categorías populares',
      'categories.explore': 'Explora',
      
      // Products
      'products.title': 'Catálogo de productos',
      'products.featured': 'Destacados',
      'products.bestsellers': 'Más vendidos esta semana',
      'products.related': 'Productos relacionados',
      'products.similar': 'Productos similares',
      'products.recommended': 'Productos recomendados',
      'products.new': 'Productos nuevos',
      'products.popular': 'Productos populares',
      'products.no_results': 'Sin resultados',
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
      'products.sort_newest': 'Más nuevos',
      'products.sort_popular': 'Más populares',
      'products.sort_cheapest': 'Menor precio',
      'products.sort_expensive': 'Mayor precio',
      'products.sort_best_rated': 'Mejor valorados',
      'products.page': 'Página',
      'products.of': 'de',
      'products.previous': 'Anterior',
      'products.next': 'Siguiente',
      
      // Reviews
      'reviews.title': 'Reseñas y valoraciones',
      'reviews.write': 'Escribe una reseña',
      'reviews.send': 'Enviar reseña',
      'reviews.no_reviews': 'No hay reseñas aún. ¡Sé el primero en opinar!',
      'reviews.rating': 'rating',
      'reviews.comment_placeholder': 'Comparte tu experiencia...',
      
      // Cart
      'cart.title': 'Carrito de compras',
      'cart.empty': 'Tu carrito está vacío',
      'cart.empty_desc': 'Agrega productos ecológicos para empezar a comprar.',
      'cart.checkout': 'Proceder al pago',
      'cart.total': 'Total',
      'cart.remove': 'Eliminar',
      'cart.quantity': 'Cantidad',
      
      // Checkout
      'checkout.title': 'Finalizar compra',
      'checkout.name': 'Nombre completo',
      'checkout.email': 'Correo electrónico',
      'checkout.address': 'Dirección de envío',
      'checkout.payment': 'Método de pago',
      'checkout.place_order': 'Confirmar pedido',
      'checkout.coupon': '¿Tienes un cupón?',
      'checkout.apply': 'Aplicar',
      'checkout.order_summary': 'Resumen del pedido',
      'checkout.subtotal': 'Subtotal',
      'checkout.discount': 'Descuento',
      'checkout.shipping': 'Envío',
      'checkout.free': 'Gratis',
      
      // Auth
      'auth.login_title': 'Iniciar sesión',
      'auth.register_title': 'Crear cuenta',
      'auth.email': 'Correo electrónico',
      'auth.password': 'Contraseña',
      'auth.password2': 'Confirmar contraseña',
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
      
      // Profile
      'profile.title': 'Mi Panel',
      'profile.welcome': 'Bienvenido',
      'profile.products': 'Publicaciones',
      'profile.favorites': 'Favoritos',
      'profile.reviews': 'Reseñas recibidas',
      'profile.sales': 'Ventas',
      'profile.value': 'Valor productos',
      'profile.my_products': 'Mis productos',
      'profile.my_favorites': 'Mis favoritos',
      'profile.my_reviews': 'Mis reseñas',
      'profile.my_orders': 'Mis pedidos',
      'profile.settings': 'Configuración',
      'profile.followers': 'Seguidores',
      'profile.following': 'Siguiendo',
      'profile.xp': 'XP',
      'profile.bio': 'Biografía',
      'profile.update': 'Actualizar perfil',
      'profile.change_password': 'Cambiar contraseña',
      'profile.current_password': 'Contraseña actual',
      'profile.new_password': 'Nueva contraseña',
      'profile.confirm_password': 'Confirmar contraseña',
      'profile.save_changes': 'Guardar cambios',
      'profile.no_products': 'No has publicado productos',
      'profile.no_favorites': 'No tienes favoritos',
      'profile.no_reviews': 'No has escrito reseñas',
      'profile.no_orders': 'Sin pedidos aún',
      
      // Impact
      'impact.title': 'Nuestro Impacto',
      'impact.real': 'Impacto real',
      'impact.desc': 'En EcoMarket medimos el impacto ambiental de cada transacción.',
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
      'footer.rights': 'Todos los derechos reservados.',
      'footer.made_with': 'Hecho con',
      'footer.for_planet': 'para el planeta',
      'footer.schedule': 'Lun - Sáb: 9am - 6pm',
      
      // Errors
      'error.404_title': 'Página no encontrada',
      'error.404_desc': 'La página que buscas no existe o ha sido movida.',
      'error.500_title': 'Error del servidor',
      'error.500_desc': 'Algo salió mal en nuestro servidor.',
      'error.go_home': 'Volver al inicio',
      'error.view_products': 'Ver productos',
      'error.contact_support': 'Contactar soporte',
      
      // EcoScore
      'ecoscore.title': 'EcoScore',
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
      
      // Hero
      'hero.badge': '100% eco-friendly Marketplace',
      'hero.title': 'Buy and sell sustainable products',
      'hero.subtitle': 'Discover thousands of eco-friendly products from sellers committed to the planet.',
      'hero.explore': 'Explore products',
      'hero.publish': 'Publish for free',
      'hero.families': 'Families impacted',
      'hero.products': 'Eco products',
      'hero.plastic': 'Plastic avoided',
      
      // Categories
      'categories.title': 'Popular categories',
      'categories.explore': 'Explore',
      
      // Products
      'products.title': 'Product catalog',
      'products.featured': 'Featured',
      'products.bestsellers': 'Best sellers this week',
      'products.related': 'Related products',
      'products.similar': 'Similar products',
      'products.recommended': 'Recommended products',
      'products.new': 'New products',
      'products.popular': 'Popular products',
      'products.no_results': 'No results',
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
      'products.sort_newest': 'Newest',
      'products.sort_popular': 'Most popular',
      'products.sort_cheapest': 'Lowest price',
      'products.sort_expensive': 'Highest price',
      'products.sort_best_rated': 'Best rated',
      'products.page': 'Page',
      'products.of': 'of',
      'products.previous': 'Previous',
      'products.next': 'Next',
      
      // Reviews
      'reviews.title': 'Reviews & Ratings',
      'reviews.write': 'Write a review',
      'reviews.send': 'Send review',
      'reviews.no_reviews': 'No reviews yet. Be the first to review!',
      'reviews.rating': 'rating',
      'reviews.comment_placeholder': 'Share your experience...',
      
      // Cart
      'cart.title': 'Shopping cart',
      'cart.empty': 'Your cart is empty',
      'cart.empty_desc': 'Add eco-friendly products to start shopping.',
      'cart.checkout': 'Proceed to checkout',
      'cart.total': 'Total',
      'cart.remove': 'Remove',
      'cart.quantity': 'Quantity',
      
      // Checkout
      'checkout.title': 'Checkout',
      'checkout.name': 'Full name',
      'checkout.email': 'Email address',
      'checkout.address': 'Shipping address',
      'checkout.payment': 'Payment method',
      'checkout.place_order': 'Place order',
      'checkout.coupon': 'Have a coupon?',
      'checkout.apply': 'Apply',
      'checkout.order_summary': 'Order summary',
      'checkout.subtotal': 'Subtotal',
      'checkout.discount': 'Discount',
      'checkout.shipping': 'Shipping',
      'checkout.free': 'Free',
      
      // Auth
      'auth.login_title': 'Sign in',
      'auth.register_title': 'Create account',
      'auth.email': 'Email address',
      'auth.password': 'Password',
      'auth.password2': 'Confirm password',
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
      
      // Profile
      'profile.title': 'My Dashboard',
      'profile.welcome': 'Welcome',
      'profile.products': 'Products',
      'profile.favorites': 'Favorites',
      'profile.reviews': 'Reviews received',
      'profile.sales': 'Sales',
      'profile.value': 'Product value',
      'profile.my_products': 'My products',
      'profile.my_favorites': 'My favorites',
      'profile.my_reviews': 'My reviews',
      'profile.my_orders': 'My orders',
      'profile.settings': 'Settings',
      'profile.followers': 'Followers',
      'profile.following': 'Following',
      'profile.xp': 'XP',
      'profile.bio': 'Biography',
      'profile.update': 'Update profile',
      'profile.change_password': 'Change password',
      'profile.current_password': 'Current password',
      'profile.new_password': 'New password',
      'profile.confirm_password': 'Confirm password',
      'profile.save_changes': 'Save changes',
      'profile.no_products': 'No products published yet',
      'profile.no_favorites': 'No favorites yet',
      'profile.no_reviews': 'No reviews written yet',
      'profile.no_orders': 'No orders yet',
      
      // Impact
      'impact.title': 'Our Impact',
      'impact.real': 'Real impact',
      'impact.desc': 'At EcoMarket we measure the environmental impact of each transaction.',
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
      'footer.rights': 'All rights reserved.',
      'footer.made_with': 'Made with',
      'footer.for_planet': 'for the planet',
      'footer.schedule': 'Mon - Sat: 9am - 6pm',
      
      // Errors
      'error.404_title': 'Page not found',
      'error.404_desc': 'The page you are looking for does not exist or has been moved.',
      'error.500_title': 'Server error',
      'error.500_desc': 'Something went wrong on our server.',
      'error.go_home': 'Go home',
      'error.view_products': 'View products',
      'error.contact_support': 'Contact support',
      
      // EcoScore
      'ecoscore.title': 'EcoScore',
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
      
      // Language
      'lang.es': 'Spanish',
      'lang.en': 'English',
      'lang.select': 'Language',
    }
  };

  const getLang = () => {
    return localStorage.getItem(STORAGE_KEY) || navigator.language?.startsWith('en') ? 'en' : 'es';
  };

  const setLang = (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    applyTranslations();
    window.dispatchEvent(new CustomEvent('eco:langchange', { detail: lang }));
  };

  const t = (key, params = {}) => {
    const lang = getLang();
    let text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['es']?.[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      el.value = t(el.dataset.i18nValue);
    });
  };

  const init = () => {
    const lang = getLang();
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    
    // Add language switcher to navbar
    const header = document.querySelector('.header-actions');
    if (header && !document.getElementById('langSwitcher')) {
      const switcher = document.createElement('div');
      switcher.id = 'langSwitcher';
      switcher.style.cssText = 'position:relative;display:inline-block';
      switcher.innerHTML = `
        <button onclick="EcoI18n.toggleLang()" style="width:44px;height:44px;border-radius:999px;border:1px solid rgba(46,125,50,0.18);background:var(--surface);color:var(--texto);cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;transition:all 0.2s" title="${t('lang.select')}">
          ${getLang() === 'en' ? 'EN' : 'ES'}
        </button>
      `;
      header.insertBefore(switcher, header.firstChild);
    }

    applyTranslations();
  };

  const toggleLang = () => {
    const current = getLang();
    setLang(current === 'es' ? 'en' : 'es');
    // Update button text
    const btn = document.querySelector('#langSwitcher button');
    if (btn) btn.textContent = getLang() === 'en' ? 'EN' : 'ES';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { t, getLang, setLang, toggleLang, applyTranslations };
})();

window.EcoI18n = EcoI18n;