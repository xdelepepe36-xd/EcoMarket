/**
 * EcoMarket FINAL - JavaScript Unificado
 * Versión FINAL - Marketplace ecológico profesional
 * Consolidación de funcionalidades JavaScript principales
 */

// ════════════════════════════════════════════════════════════
// 1. UTILIDADES GLOBALES
// ════════════════════════════════════════════════════════════

const EcoMarket = {
    // Versión
    version: 'FINAL-1.0',
    
    // Configuración
    config: {
        apiBase: '/api',
        currency: 'S/',
        itemsPerPage: 12
    },
    
    // Estado global
    state: {
        theme: localStorage.getItem('ecomarket-theme') || 'light',
        lang: localStorage.getItem('ecomarket-lang') || 'es',
        user: null
    },
    
    // Todos los temas disponibles
    themes: ['light', 'dark', 'sepia', 'nature', 'ocean', 'midnight', 'rose', 'high-contrast'],
    
    // Inicialización
    init() {
        this.initTheme();
        this.initLang();
        this.initSplashScreen();
        this.initNavbar();
        this.initScrollEffects();
        this.initAnimations();
    },
    
    // ── Theme Toggle ───────────────────────────────────────
    initTheme() {
        const themeToggle = document.querySelector('[data-theme-switcher]');
        if (!themeToggle) {
            // Crear theme toggle si no existe
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'theme-toggle';
                toggleBtn.setAttribute('data-theme-switcher', '');
                toggleBtn.setAttribute('aria-label', 'Cambiar tema');
                toggleBtn.setAttribute('title', 'Cambiar tema');
                toggleBtn.innerHTML = this.getThemeIcon(this.state.theme);
                headerActions.insertBefore(toggleBtn, headerActions.firstChild);
                
                toggleBtn.addEventListener('click', () => this.toggleTheme());
            }
        }
        
        // Aplicar tema guardado
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.updateThemeIcon();
    },
    
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.state.theme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.state.theme = this.themes[nextIndex];
        document.documentElement.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('ecomarket-theme', this.state.theme);
        this.updateThemeIcon();
    },
    
    getThemeIcon(theme) {
        const icons = {
            'light': '<i class="bi bi-sun"></i>',
            'dark': '<i class="bi bi-moon"></i>',
            'sepia': '<i class="bi bi-book"></i>',
            'nature': '<i class="bi bi-tree"></i>',
            'ocean': '<i class="bi bi-water"></i>',
            'midnight': '<i class="bi bi-stars"></i>',
            'rose': '<i class="bi bi-heart"></i>',
            'high-contrast': '<i class="bi bi-eye"></i>'
        };
        return icons[theme] || '<i class="bi bi-palette"></i>';
    },
    
    updateThemeIcon() {
        const toggleBtn = document.querySelector('[data-theme-switcher]');
        if (toggleBtn) {
            toggleBtn.innerHTML = this.getThemeIcon(this.state.theme);
            toggleBtn.setAttribute('title', `Tema actual: ${this.state.theme}`);
        }
    },
    
    // ── Language Toggle ─────────────────────────────────────
    initLang() {
        const langBtns = document.querySelectorAll('[data-eco-lang-btn]');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLang(lang);
            });
        });
        
        // Aplicar idioma guardado
        this.setLang(this.state.lang, false);
    },
    
    setLang(lang, save = true) {
        this.state.lang = lang;
        if (save) {
            localStorage.setItem('ecomarket-lang', lang);
        }
        
        // Actualizar botones
        document.querySelectorAll('[data-eco-lang-btn]').forEach(btn => {
            btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
            btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang);
        });
        
        // Actualizar textos (si hay traducciones disponibles)
        this.updateTranslations(lang);
    },
    
    updateTranslations(lang) {
        // Sistema completo de traducciones
        const translations = {
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
                
                // Paginación
                'pagination.prev': 'Anterior',
                'pagination.next': 'Siguiente',
                'pagination.page_info': 'Página',
                'pagination.of': 'de',
                
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
                
                // Perfil
                'profile.title': 'Mi Panel',
                'profile.welcome': 'Bienvenido,',
                'profile.publish': 'Publicar producto',
                'profile.logout': 'Cerrar sesión',
                'profile.followers': 'Followers',
                'profile.following': 'Following',
                'profile.xp': 'XP',
                'profile.stats.publications': 'Publicaciones',
                'profile.stats.favorites': 'Favoritos',
                'profile.stats.reviews': 'Reseñas recibidas',
                'profile.stats.sales': 'Ventas'
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
                'products.no_results_desc': 'Try other filters or search terms.',
                'products.add_to_cart': 'Cart',
                'products.view_more': 'View more',
                
                // Pagination
                'pagination.prev': 'Previous',
                'pagination.next': 'Next',
                'pagination.page_info': 'Page',
                'pagination.of': 'of',
                
                // Contact
                'contact.title': 'Contact',
                'contact.desc': 'Do you have questions or want to publish on EcoMarket? Write to us and we will respond soon.',
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
                
                // Profile
                'profile.title': 'My Dashboard',
                'profile.welcome': 'Welcome,',
                'profile.publish': 'Publish product',
                'profile.logout': 'Logout',
                'profile.followers': 'Followers',
                'profile.following': 'Following',
                'profile.xp': 'XP',
                'profile.stats.publications': 'Publications',
                'profile.stats.favorites': 'Favorites',
                'profile.stats.reviews': 'Reviews received',
                'profile.stats.sales': 'Sales'
            }
        };
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        // Actualizar placeholders también
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
    },
    
    // ── Splash Screen ───────────────────────────────────────
    initSplashScreen() {
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            // Ocultar splash screen inmediatamente sin animación
            splashScreen.style.display = 'none';
        }
    },
    
    // ── Navbar ─────────────────────────────────────────────
    initNavbar() {
        const navToggle = document.getElementById('navToggle');
        const navbar = document.getElementById('navbar');
        
        if (navToggle && navbar) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navbar.classList.toggle('active');
            });
            
            // Cerrar menú al hacer clic en un enlace
            navbar.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navbar.classList.remove('active');
                });
            });
        }
        
        // Efecto de scroll en header
        const header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
    },
    
    // ── Scroll Effects ───────────────────────────────────────
    initScrollEffects() {
        // Animación de elementos al hacer scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in', 'slide-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observar secciones y tarjetas
        document.querySelectorAll('.section, .producto-card, .categoria-card, .impacto-card-item').forEach(el => {
            observer.observe(el);
        });
    },
    
    // ── Animations ───────────────────────────────────────────
    initAnimations() {
        // Animaciones suaves para hover effects
        document.querySelectorAll('.producto-card, .categoria-card, .impacto-card-item').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // Colores de tema en productos según categoría
        this.applyCategoryColors();
    },
    
    applyCategoryColors() {
        const categoryColors = {
            'Hogar': '#2e7d32',
            'Accesorios': '#1565c0',
            'Higiene': '#0097a7',
            'Jardín': '#4caf50',
            'Alimentación': '#ff9800',
            'Ropa': '#e91e63',
            'default': '#2e7d32'
        };
        
        document.querySelectorAll('.producto-card').forEach(card => {
            const categoriaEl = card.querySelector('.producto-categoria');
            if (categoriaEl) {
                const categoria = categoriaEl.textContent.trim();
                const color = categoryColors[categoria] || categoryColors.default;
                categoriaEl.style.color = color;
            }
        });
    }
};

// ════════════════════════════════════════════════════════════
// 2. SISTEMA DE CARRITO
// ════════════════════════════════════════════════════════════

const EcoCart = {
    items: [],
    
    init() {
        this.loadFromStorage();
        this.updateBadge();
        this.bindEvents();
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('ecomarket-cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
    },
    
    saveToStorage() {
        localStorage.setItem('ecomarket-cart', JSON.stringify(this.items));
        this.updateBadge();
        this.dispatchUpdate();
    },
    
    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                category: product.category,
                qty: 1
            });
        }
        
        this.saveToStorage();
        this.showNotification('Producto agregado al carrito', 'success');
    },
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToStorage();
    },
    
    updateQty(id, qty) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (qty <= 0) {
                this.removeItem(id);
            } else {
                item.qty = qty;
                this.saveToStorage();
            }
        }
    },
    
    getSummary() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const shipping = subtotal > 100 ? 0 : 15;
        const discount = 0; // Se puede implementar lógica de descuentos
        const total = subtotal + shipping - discount;
        
        return {
            items: this.items,
            count: this.items.reduce((sum, item) => sum + item.qty, 0),
            subtotal,
            shipping,
            discount,
            total
        };
    },
    
    updateBadge() {
        const badge = document.getElementById('cartCount');
        if (badge) {
            const count = this.items.reduce((sum, item) => sum + item.qty, 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    },
    
    dispatchUpdate() {
        window.dispatchEvent(new CustomEvent('ecocart:update'));
    },
    
    bindEvents() {
        // Botones de agregar al carrito
        document.querySelectorAll('.add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = {
                    id: btn.getAttribute('data-producto-id'),
                    name: btn.getAttribute('data-producto-nombre'),
                    price: btn.getAttribute('data-producto-precio'),
                    image: btn.getAttribute('data-producto-imagen'),
                    category: btn.getAttribute('data-producto-categoria')
                };
                
                this.addItem(product);
                
                // Animación del botón
                btn.classList.add('scale-in');
                setTimeout(() => btn.classList.remove('scale-in'), 300);
            });
        });
    },
    
    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `eco-toast eco-toast-${type}`;
        toast.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ════════════════════════════════════════════════════════════
// 3. SISTEMA DE FAVORITOS
// ════════════════════════════════════════════════════════════

const EcoFavorites = {
    items: [],
    
    init() {
        this.loadFromStorage();
        this.bindEvents();
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('ecomarket-favorites');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
    },
    
    saveToStorage() {
        localStorage.setItem('ecomarket-favorites', JSON.stringify(this.items));
    },
    
    add(productId) {
        if (!this.items.includes(productId)) {
            this.items.push(productId);
            this.saveToStorage();
            this.showNotification('Agregado a favoritos', 'success');
        }
    },
    
    remove(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.saveToStorage();
        this.showNotification('Eliminado de favoritos', 'info');
    },
    
    toggle(productId) {
        if (this.items.includes(productId)) {
            this.remove(productId);
            return false;
        } else {
            this.add(productId);
            return true;
        }
    },
    
    isFavorite(productId) {
        return this.items.includes(productId);
    },
    
    bindEvents() {
        // Botones de favoritos
        document.querySelectorAll('.add-favorite').forEach(btn => {
            const productId = btn.getAttribute('data-producto-id');
            
            // Actualizar estado inicial
            if (this.isFavorite(productId)) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
            }
            
            btn.addEventListener('click', () => {
                const isNowFavorite = this.toggle(productId);
                btn.classList.toggle('active', isNowFavorite);
                btn.innerHTML = isNowFavorite ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
            });
        });
    },
    
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `eco-toast eco-toast-${type}`;
        toast.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ════════════════════════════════════════════════════════════
// 4. SISTEMA DE BÚSQUEDA
// ════════════════════════════════════════════════════════════

const EcoSearch = {
    init() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimer;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimer);
                const query = e.target.value.trim();
                
                if (query.length >= 2) {
                    searchTimer = setTimeout(() => {
                        this.fetchSuggestions(query);
                    }, 300);
                } else {
                    this.hideSuggestions();
                }
            });
            
            // Ocultar sugerencias al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.catalog-search-wrap')) {
                    this.hideSuggestions();
                }
            });
        }
    },
    
    async fetchSuggestions(query) {
        try {
            const response = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.showSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.hideSuggestions();
        }
    },
    
    showSuggestions(products) {
        const container = document.getElementById('searchSuggestions');
        if (!container || products.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        container.innerHTML = products.map(p => `
            <a href="/producto/${p.id}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;text-decoration:none;color:var(--texto);border-bottom:1px solid rgba(46,125,50,0.06);transition:background 0.2s">
                <span style="font-size:1.3rem">📦</span>
                <div style="flex:1;min-width:0">
                    <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.nombre}</div>
                    <div style="font-size:0.75rem;color:var(--texto-sec)">${p.categoria} · S/. ${parseFloat(p.precio).toFixed(2)}</div>
                </div>
                <i class="bi bi-arrow-right" style="color:var(--verde)"></i>
            </a>
        `).join('');
        
        container.style.display = 'block';
    },
    
    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'none';
        }
    }
};

// ════════════════════════════════════════════════════════════
// 13. SISTEMA DE REVIEWS CON FOTOS
// ════════════════════════════════════════════════════════════

const EcoReviews = {
    reviews: [],
    
    init() {
        this.loadReviews();
        this.bindEvents();
    },
    
    loadReviews() {
        const saved = localStorage.getItem('ecomarket-reviews');
        if (saved) {
            try {
                this.reviews = JSON.parse(saved);
            } catch (e) {
                this.reviews = [];
            }
        }
    },
    
    saveReviews() {
        localStorage.setItem('ecomarket-reviews', JSON.stringify(this.reviews));
    },
    
    addReview(productId, rating, comment, photos = []) {
        const newReview = {
            id: Date.now(),
            productId: productId,
            rating: rating,
            comment: comment,
            photos: photos,
            date: new Date().toISOString(),
            helpful: 0,
            verified: false
        };
        
        this.reviews.push(newReview);
        this.saveReviews();
        window.showToast('Reseña publicada', 'success');
        
        // Gamificación: puntos por reseña
        EcoGamification.addPoints(15, 'Reseña publicada');
    },
    
    markHelpful(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.helpful++;
            this.saveReviews();
            window.showToast('¡Gracias por tu feedback!', 'success');
        }
    },
    
    getProductReviews(productId) {
        return this.reviews.filter(r => r.productId === productId);
    },
    
    getProductAverageRating(productId) {
        const productReviews = this.getProductReviews(productId);
        if (productReviews.length === 0) return 0;
        
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / productReviews.length).toFixed(1);
    },
    
    bindEvents() {
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productId = reviewForm.dataset.productId;
                const rating = parseInt(document.getElementById('reviewRating').value);
                const comment = document.getElementById('reviewComment').value;
                const photos = this.getSelectedPhotos();
                
                if (rating > 0 && comment.trim()) {
                    this.addReview(productId, rating, comment, photos);
                    reviewForm.reset();
                }
            });
        }
    },
    
    getSelectedPhotos() {
        const photoInputs = document.querySelectorAll('.review-photo:checked');
        return Array.from(photoInputs).map(input => input.value);
    }
};

// ════════════════════════════════════════════════════════════
// 14. SISTEMA DE VALORACIÓN DE VENDEDORES
// ════════════════════════════════════════════════════════════

const EcoSellerRating = {
    sellers: {},
    
    init() {
        this.loadSellers();
        this.calculateRatings();
    },
    
    loadSellers() {
        const saved = localStorage.getItem('ecomarket-sellers');
        if (saved) {
            try {
                this.sellers = JSON.parse(saved);
            } catch (e) {
                this.sellers = {};
            }
        }
    },
    
    saveSellers() {
        localStorage.setItem('ecomarket-sellers', JSON.stringify(this.sellers));
    },
    
    addSale(sellerId, amount) {
        if (!this.sellers[sellerId]) {
            this.sellers[sellerId] = {
                totalSales: 0,
                totalOrders: 0,
                rating: 5.0,
                reviews: 0
            };
        }
        
        this.sellers[sellerId].totalSales += amount;
        this.sellers[sellerId].totalOrders++;
        this.saveSellers();
    },
    
    addSellerReview(sellerId, rating) {
        if (!this.sellers[sellerId]) {
            this.sellers[sellerId] = {
                totalSales: 0,
                totalOrders: 0,
                rating: 5.0,
                reviews: 0
            };
        }
        
        const seller = this.sellers[sellerId];
        seller.reviews++;
        
        // Calcular nuevo promedio
        const currentTotal = seller.rating * (seller.reviews - 1);
        seller.rating = ((currentTotal + rating) / seller.reviews).toFixed(1);
        
        this.saveSellers();
    },
    
    getSellerRating(sellerId) {
        return this.sellers[sellerId]?.rating || 5.0;
    },
    
    getSellerBadge(sellerId) {
        const rating = this.getSellerRating(sellerId);
        if (rating >= 4.8) return '⭐⭐⭐⭐⭐ Vendedor destacado';
        if (rating >= 4.5) return '⭐⭐⭐⭐ Excelente';
        if (rating >= 4.0) return '⭐⭐⭐ Bueno';
        if (rating >= 3.5) return '⭐⭐ Regular';
        return '⭐ Nuevo';
    },
    
    calculateRatings() {
        // Recalcular ratings basado en reviews
        Object.keys(this.sellers).forEach(sellerId => {
            const seller = this.sellers[sellerId];
            if (seller.reviews > 0) {
                // Ya calculado en addSellerReview
            }
        });
    }
};

// ════════════════════════════════════════════════════════════
// 15. CALCULADORA DE IMPACTO AMBIENTAL
// ════════════════════════════════════════════════════════════

const EcoImpactCalculator = {
    factors: {
        // CO2 evitado por cada compra
        co2PerPurchase: 2.5,
        // Agua ahorrada por cada compra
        waterPerPurchase: 50,
        // Plástico evitado por cada compra
        plasticPerPurchase: 0.5,
        // Árboles equivalentes por 100 compras
        treesPer100Purchases: 1
    },
    
    calculatePurchaseImpact(purchases) {
        return {
            co2Avoided: (purchases * this.factors.co2PerPurchase).toFixed(1),
            waterSaved: (purchases * this.factors.waterPerPurchase),
            plasticAvoided: (purchases * this.factors.plasticPerPurchase).toFixed(1),
            treesEquivalent: Math.floor(purchases / 100)
        };
    },
    
    calculateProductImpact(product) {
        let impact = {
            co2: 0,
            water: 0,
            plastic: 0
        };
        
        // Impacto según categoría
        const categoryImpact = {
            'Hogar': { co2: 3.0, water: 40, plastic: 0.8 },
            'Accesorios': { co2: 1.5, water: 20, plastic: 0.3 },
            'Higiene': { co2: 2.0, water: 60, plastic: 0.4 },
            'Jardín': { co2: 5.0, water: 100, plastic: 0.2 },
            'Alimentación': { co2: 2.5, water: 30, plastic: 0.6 },
            'Ropa': { co2: 4.0, water: 80, plastic: 0.5 }
        };
        
        const categoryImpactFactor = categoryImpact[product.category] || categoryImpact['Hogar'];
        
        impact.co2 = categoryImpactFactor.co2;
        impact.water = categoryImpactFactor.water;
        impact.plastic = categoryImpactFactor.plastic;
        
        // Bonus por condición
        if (product.condition === 'usado') {
            impact.co2 *= 1.5;
            impact.water *= 1.3;
            impact.plastic *= 2.0;
        }
        
        return impact;
    },
    
    formatImpact(impact) {
        return {
            co2: `${impact.co2} kg CO₂`,
            water: `${impact.water} L agua`,
            plastic: `${impact.plastic} kg plástico`
        };
    }
};

// ════════════════════════════════════════════════════════════
// 16. SISTEMA DE REFERIDOS CON RECOMPENSAS
// ════════════════════════════════════════════════════════════

const EcoReferrals = {
    referrals: [],
    referralCode: '',
    rewardPerReferral: 50, // EcoPuntos
    
    init() {
        this.loadReferrals();
        this.generateReferralCode();
        this.bindEvents();
    },
    
    loadReferrals() {
        const saved = localStorage.getItem('ecomarket-referrals');
        if (saved) {
            try {
                this.referrals = JSON.parse(saved);
            } catch (e) {
                this.referrals = [];
            }
        }
        
        const savedCode = localStorage.getItem('ecomarket-referral-code');
        if (savedCode) {
            this.referralCode = savedCode;
        }
    },
    
    saveReferrals() {
        localStorage.setItem('ecomarket-referrals', JSON.stringify(this.referrals));
    },
    
    generateReferralCode() {
        if (!this.referralCode) {
            this.referralCode = 'ECO' + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('ecomarket-referral-code', this.referralCode);
        }
    },
    
    addReferral(referrerId, referredEmail) {
        const newReferral = {
            id: Date.now(),
            referrerId: referrerId,
            referredEmail: referredEmail,
            date: new Date().toISOString(),
            status: 'pending',
            rewardGiven: false
        };
        
        this.referrals.push(newReferral);
        this.saveReferrals();
    },
    
    confirmReferral(referralId) {
        const referral = this.referrals.find(r => r.id === referralId);
        if (referral && !referral.rewardGiven) {
            referral.status = 'confirmed';
            referral.rewardGiven = true;
            referral.confirmedDate = new Date().toISOString();
            
            this.saveReferrals();
            
            // Dar recompensa al referidor
            EcoGamification.addPoints(this.rewardPerReferral, 'Referido exitoso');
            
            window.showToast(`¡Has ganado ${this.rewardPerReferral} EcoPuntos!`, 'success');
        }
    },
    
    getReferralStats(userId) {
        const userReferrals = this.referrals.filter(r => r.referrerId === userId);
        return {
            total: userReferrals.length,
            pending: userReferrals.filter(r => r.status === 'pending').length,
            confirmed: userReferrals.filter(r => r.status === 'confirmed').length,
            totalEarnings: userReferrals.filter(r => r.rewardGiven).length * this.rewardPerReferral
        };
    },
    
    bindEvents() {
        const referralLink = document.getElementById('referralLink');
        if (referralLink && this.referralCode) {
            referralLink.value = window.location.origin + '?ref=' + this.referralCode;
        }
        
        const copyReferralBtn = document.getElementById('copyReferral');
        if (copyReferralBtn) {
            copyReferralBtn.addEventListener('click', () => {
                referralLink.select();
                document.execCommand('copy');
                window.showToast('Enlace copiado', 'success');
            });
        }
    }
};

// ════════════════════════════════════════════════════════════
// 17. BUSCADOR AVANZADO CON FILTROS MÚLTIPLES
// ════════════════════════════════════════════════════════════

const EcoAdvancedSearch = {
    filters: {
        category: '',
        minPrice: null,
        maxPrice: null,
        condition: '',
        rating: null,
        sortBy: 'newest'
    },
    
    init() {
        this.bindEvents();
        this.loadSavedFilters();
    },
    
    loadSavedFilters() {
        const saved = localStorage.getItem('ecomarket-search-filters');
        if (saved) {
            try {
                this.filters = JSON.parse(saved);
                this.applyFilters();
            } catch (e) {
                this.filters = {
                    category: '',
                    minPrice: null,
                    maxPrice: null,
                    condition: '',
                    rating: null,
                    sortBy: 'newest'
                };
            }
        }
    },
    
    saveFilters() {
        localStorage.setItem('ecomarket-search-filters', JSON.stringify(this.filters));
    },
    
    setFilter(key, value) {
        this.filters[key] = value;
        this.saveFilters();
        this.applyFilters();
    },
    
    clearFilters() {
        this.filters = {
            category: '',
            minPrice: null,
            maxPrice: null,
            condition: '',
            rating: null,
            sortBy: 'newest'
        };
        this.saveFilters();
        this.applyFilters();
    },
    
    applyFilters() {
        // Filtrar productos visibles
        const productCards = document.querySelectorAll('.producto-card');
        
        productCards.forEach(card => {
            const product = this.getProductData(card);
            if (this.matchesFilters(product)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Actualizar UI de filtros
        this.updateFilterUI();
    },
    
    getProductData(card) {
        return {
            category: card.querySelector('.producto-categoria')?.textContent || '',
            price: parseFloat(card.querySelector('.producto-precio')?.textContent.replace('S/.', '')) || 0,
            condition: card.querySelector('.badge')?.textContent?.toLowerCase() || '',
            rating: parseFloat(card.querySelector('.producto-rating span')?.textContent) || 0
        };
    },
    
    matchesFilters(product) {
        // Filtro de categoría
        if (this.filters.category && product.category !== this.filters.category) {
            return false;
        }
        
        // Filtro de precio
        if (this.filters.minPrice && product.price < this.filters.minPrice) {
            return false;
        }
        if (this.filters.maxPrice && product.price > this.filters.maxPrice) {
            return false;
        }
        
        // Filtro de condición
        if (this.filters.condition && !product.condition.includes(this.filters.condition)) {
            return false;
        }
        
        // Filtro de rating
        if (this.filters.rating && product.rating < this.filters.rating) {
            return false;
        }
        
        return true;
    },
    
    updateFilterUI() {
        // Actualizar estado de los selectores
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) {
            categorySelect.value = this.filters.category;
        }
        
        const minPriceInput = document.getElementById('minPrice');
        if (minPriceInput) {
            minPriceInput.value = this.filters.minPrice || '';
        }
        
        const maxPriceInput = document.getElementById('maxPrice');
        if (maxPriceInput) {
            maxPriceInput.value = this.filters.maxPrice || '';
        }
    },
    
    bindEvents() {
        // Event listeners para filtros
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.setFilter('category', e.target.value);
        });
        
        document.getElementById('minPrice')?.addEventListener('input', (e) => {
            this.setFilter('minPrice', parseFloat(e.target.value) || null);
        });
        
        document.getElementById('maxPrice')?.addEventListener('input', (e) => {
            this.setFilter('maxPrice', parseFloat(e.target.value) || null);
        });
        
        document.getElementById('conditionFilter')?.addEventListener('change', (e) => {
            this.setFilter('condition', e.target.value);
        });
        
        document.getElementById('ratingFilter')?.addEventListener('change', (e) => {
            this.setFilter('rating', parseFloat(e.target.value) || null);
        });
        
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.setFilter('sortBy', e.target.value);
        });
        
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearFilters();
        });
    }
};

// ════════════════════════════════════════════════════════════
// 18. SISTEMA DE DESAFÍOS ECOLÓGICOS
// ════════════════════════════════════════════════════════════

const EcoChallenges = {
    challenges: [
        {
            id: 'first-purchase',
            title: 'Primera compra',
            description: 'Realiza tu primera compra en EcoMarket',
            points: 50,
            icon: '🛒',
            completed: false
        },
        {
            id: 'three-purchases',
            title: 'Tres compras',
            description: 'Realiza 3 compras en EcoMarket',
            points: 100,
            icon: '🎯',
            completed: false
        },
        {
            id: 'five-favorites',
            title: 'Cinco favoritos',
            description: 'Agrega 5 productos a favoritos',
            points: 30,
            icon: '❤️',
            completed: false
        },
        {
            id: 'first-review',
            title: 'Primera reseña',
            description: 'Deja tu primera reseña',
            points: 25,
            icon: '⭐',
            completed: false
        },
        {
            id: 'publish-product',
            title: 'Publica un producto',
            description: 'Publica tu primer producto ecológico',
            points: 75,
            icon: '📦',
            completed: false
        },
        {
            id: 'invite-friend',
            title: 'Invita un amigo',
            description: 'Invita a un amigo a unirse a EcoMarket',
            points: 40,
            icon: '👥',
            completed: false
        }
    ],
    
    userProgress: {},
    
    init() {
        this.loadProgress();
        this.checkChallenges();
        this.bindEvents();
    },
    
    loadProgress() {
        const saved = localStorage.getItem('ecomarket-challenges');
        if (saved) {
            try {
                this.userProgress = JSON.parse(saved);
            } catch (e) {
                this.userProgress = {};
            }
        }
    },
    
    saveProgress() {
        localStorage.setItem('ecomarket-challenges', JSON.stringify(this.userProgress));
    },
    
    completeChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (challenge && !challenge.completed) {
            challenge.completed = true;
            this.userProgress[challengeId] = {
                completed: true,
                completedAt: new Date().toISOString()
            };
            
            this.saveProgress();
            EcoGamification.addPoints(challenge.points, `Desafío: ${challenge.title}`);
            
            window.showToast(`¡Desafío completado! +${challenge.points} EcoPuntos`, 'success');
        }
    },
    
    checkChallenges() {
        // Verificar si los desafíos están completos
        const cart = EcoCart.getSummary();
        
        // Desafío: primera compra
        if (cart.items.length > 0 && !this.challenges[0].completed) {
            // Este se completa cuando se realiza el checkout
        }
        
        // Desafío: tres compras
        const purchases = parseInt(localStorage.getItem('ecomarket-total-purchases') || 0);
        if (purchases >= 3 && !this.challenges[1].completed) {
            this.completeChallenge('three-purchases');
        }
        
        // Desafío: cinco favoritos
        const favorites = EcoFavorites.items.length;
        if (favorites >= 5 && !this.challenges[2].completed) {
            this.completeChallenge('five-favorites');
        }
        
        // Desafío: primera reseña
        const reviews = EcoReviews.reviews.length;
        if (reviews >= 1 && !this.challenges[3].completed) {
            this.completeChallenge('first-review');
        }
    },
    
    getChallengeProgress() {
        return this.challenges.map(challenge => ({
            ...challenge,
            progress: this.userProgress[challenge.id] ? 100 : 0
        }));
    },
    
    bindEvents() {
        // Eventos para verificar progreso
        document.addEventListener('ecocart:update', () => this.checkChallenges());
        document.addEventListener('ecofavorites:update', () => this.checkChallenges());
    }
};
// ════════════════════════════════════════════════════════════

const EcoCompare = {
    products: [],
    maxProducts: 3,
    
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateUI();
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('ecomarket-compare');
        if (saved) {
            try {
                this.products = JSON.parse(saved);
            } catch (e) {
                this.products = [];
            }
        }
    },
    
    saveToStorage() {
        localStorage.setItem('ecomarket-compare', JSON.stringify(this.products));
        this.updateUI();
    },
    
    addProduct(product) {
        if (this.products.length >= this.maxProducts) {
            this.showNotification('Máximo 3 productos para comparar', 'error');
            return false;
        }
        
        if (this.products.find(p => p.id === product.id)) {
            this.showNotification('El producto ya está en comparación', 'info');
            return false;
        }
        
        this.products.push(product);
        this.saveToStorage();
        this.showNotification('Producto agregado a comparación', 'success');
        return true;
    },
    
    removeProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToStorage();
        this.showNotification('Producto eliminado de comparación', 'info');
    },
    
    clearAll() {
        this.products = [];
        this.saveToStorage();
        this.showNotification('Comparación limpiada', 'info');
    },
    
    getComparison() {
        return this.products;
    },
    
    bindEvents() {
        // Botones de comparación
        document.querySelectorAll('.add-compare').forEach(btn => {
            const product = {
                id: btn.getAttribute('data-producto-id'),
                name: btn.getAttribute('data-producto-nombre'),
                price: btn.getAttribute('data-producto-precio'),
                category: btn.getAttribute('data-producto-categoria'),
                image: btn.getAttribute('data-producto-imagen'),
                condition: btn.getAttribute('data-producto-condicion') || 'Nuevo',
                rating: btn.getAttribute('data-producto-rating') || '5.0'
            };
            
            btn.addEventListener('click', () => this.addProduct(product));
        });
    },
    
    updateUI() {
        const compareBadge = document.getElementById('compareCount');
        if (compareBadge) {
            compareBadge.textContent = this.products.length;
            compareBadge.style.display = this.products.length > 0 ? 'inline-flex' : 'none';
        }
        
        // Actualizar estado de botones
        document.querySelectorAll('.add-compare').forEach(btn => {
            const productId = btn.getAttribute('data-producto-id');
            const isInCompare = this.products.find(p => p.id === productId);
            
            if (isInCompare) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="bi bi-check-lg"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="bi bi-arrows-angle-expand"></i>';
            }
        });
    },
    
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `eco-toast eco-toast-${type}`;
        toast.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ════════════════════════════════════════════════════════════
// 7. SISTEMA DE CUPONES Y DESCUENTOS
// ════════════════════════════════════════════════════════════

const EcoCoupons = {
    coupons: [],
    
    init() {
        this.loadCoupons();
        this.bindEvents();
    },
    
    loadCoupons() {
        // Cupones disponibles (en producción vendrían del servidor)
        this.coupons = [
            { code: 'ECO10', discount: 10, type: 'percentage', minAmount: 50, description: '10% de descuento en compras mayores a S/.50' },
            { code: 'VERDE20', discount: 20, type: 'percentage', minAmount: 100, description: '20% de descuento en compras mayores a S/.100' },
            { code: 'PLANETA', discount: 15, type: 'fixed', minAmount: 80, description: 'S/.15 de descuento en compras mayores a S/.80' },
            { code: 'BIENVENIDO', discount: 25, type: 'percentage', minAmount: 0, description: '25% de descuento para nuevos usuarios' }
        ];
    },
    
    validateCoupon(code, cartTotal) {
        const coupon = this.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        
        if (!coupon) {
            return { valid: false, message: 'Cupón no encontrado' };
        }
        
        if (cartTotal < coupon.minAmount) {
            return { valid: false, message: `Mínimo de compra: S/.${coupon.minAmount}` };
        }
        
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = cartTotal * (coupon.discount / 100);
        } else {
            discount = coupon.discount;
        }
        
        return {
            valid: true,
            discount: discount,
            finalTotal: cartTotal - discount,
            message: `¡Cupón aplicado! Ahorras S/.${discount.toFixed(2)}`
        };
    },
    
    bindEvents() {
        const couponInput = document.getElementById('couponCode');
        const applyBtn = document.getElementById('applyCoupon');
        
        if (couponInput && applyBtn) {
            applyBtn.addEventListener('click', () => {
                const code = couponInput.value.trim();
                const cartTotal = parseFloat(document.getElementById('cartSubtotal')?.textContent.replace('S/.', '') || 0);
                
                const result = this.validateCoupon(code, cartTotal);
                
                if (result.valid) {
                    document.getElementById('discountAmount').textContent = `S/.${result.discount.toFixed(2)}`;
                    document.getElementById('cartTotal').textContent = `S/.${result.finalTotal.toFixed(2)}`;
                    window.showToast(result.message, 'success');
                } else {
                    window.showToast(result.message, 'error');
                }
            });
        }
    }
};

// ════════════════════════════════════════════════════════════
// 8. SISTEMA DE PREGUNTAS Y RESPUESTAS
// ════════════════════════════════════════════════════════════

const EcoQA = {
    questions: [],
    
    init() {
        this.loadQuestions();
        this.bindEvents();
    },
    
    loadQuestions() {
        const saved = localStorage.getItem('ecomarket-questions');
        if (saved) {
            try {
                this.questions = JSON.parse(saved);
            } catch (e) {
                this.questions = [];
            }
        }
    },
    
    saveQuestions() {
        localStorage.setItem('ecomarket-questions', JSON.stringify(this.questions));
    },
    
    addQuestion(productId, question) {
        const newQuestion = {
            id: Date.now(),
            productId: productId,
            question: question,
            answer: null,
            date: new Date().toISOString()
        };
        
        this.questions.push(newQuestion);
        this.saveQuestions();
        window.showToast('Pregunta enviada al vendedor', 'success');
    },
    
    addAnswer(questionId, answer) {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.answer = answer;
            question.answerDate = new Date().toISOString();
            this.saveQuestions();
            window.showToast('Respuesta enviada', 'success');
        }
    },
    
    getProductQuestions(productId) {
        return this.questions.filter(q => q.productId === productId);
    },
    
    bindEvents() {
        const questionForm = document.getElementById('questionForm');
        if (questionForm) {
            questionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productId = questionForm.dataset.productId;
                const question = document.getElementById('questionText').value;
                
                if (question.trim()) {
                    this.addQuestion(productId, question);
                    questionForm.reset();
                }
            });
        }
    }
};

// ════════════════════════════════════════════════════════════
// 9. SISTEMA DE NOTIFICACIONES PUSH
// ════════════════════════════════════════════════════════════

const EcoNotifications = {
    enabled: false,
    permission: 'default',
    
    init() {
        this.checkPermission();
        this.bindEvents();
    },
    
    checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    },
    
    requestPermission() {
        if ('Notification' in window && this.permission === 'default') {
            Notification.requestPermission().then(permission => {
                this.permission = permission;
                if (permission === 'granted') {
                    this.enabled = true;
                    window.showToast('Notificaciones activadas', 'success');
                }
            });
        }
    },
    
    sendNotification(title, body, icon = '🌱') {
        if (this.enabled && 'Notification' in window) {
            new Notification(title, {
                body: body,
                icon: icon,
                badge: '🌱'
            });
        }
    },
    
    bindEvents() {
        const enableBtn = document.getElementById('enableNotifications');
        if (enableBtn) {
            enableBtn.addEventListener('click', () => this.requestPermission());
        }
    }
};

// ════════════════════════════════════════════════════════════
// 10. SISTEMA DE RECOMENDACIONES PERSONALIZADAS
// ════════════════════════════════════════════════════════════

const EcoRecommendations = {
    userPreferences: {},
    
    init() {
        this.loadPreferences();
        this.trackBehavior();
    },
    
    loadPreferences() {
        const saved = localStorage.getItem('ecomarket-preferences');
        if (saved) {
            try {
                this.userPreferences = JSON.parse(saved);
            } catch (e) {
                this.userPreferences = {};
            }
        }
    },
    
    savePreferences() {
        localStorage.setItem('ecomarket-preferences', JSON.stringify(this.userPreferences));
    },
    
    trackBehavior() {
        // Rastrear clics en categorías
        document.querySelectorAll('.categoria-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.querySelector('strong').textContent;
                this.userPreferences.categories = this.userPreferences.categories || {};
                this.userPreferences.categories[category] = (this.userPreferences.categories[category] || 0) + 1;
                this.savePreferences();
            });
        });
        
        // Rastrear productos vistos
        document.querySelectorAll('.producto-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.querySelector('.producto-categoria').textContent;
                this.userPreferences.lastViewed = category;
                this.savePreferences();
            });
        });
    },
    
    getRecommendations(allProducts) {
        if (!this.userPreferences.categories) {
            return allProducts.slice(0, 4);
        }
        
        // Encontrar categorías más visitadas
        const sortedCategories = Object.entries(this.userPreferences.categories)
            .sort((a, b) => b[1] - a[1])
            .map(c => c[0]);
        
        // Recomendar productos de categorías populares
        const recommended = allProducts.filter(p => 
            sortedCategories.includes(p.categoria)
        ).slice(0, 4);
        
        // Si no hay suficientes, completar con productos aleatorios
        if (recommended.length < 4) {
            const remaining = allProducts.filter(p => 
                !recommended.includes(p)
            ).slice(0, 4 - recommended.length);
            recommended.push(...remaining);
        }
        
        return recommended;
    }
};

// ════════════════════════════════════════════════════════════
// 11. SISTEMA DE WISHLIST CON ALERTAS DE PRECIO
// ════════════════════════════════════════════════════════════

const EcoWishlist = {
    items: [],
    
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.checkPriceAlerts();
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('ecomarket-wishlist');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
    },
    
    saveToStorage() {
        localStorage.setItem('ecomarket-wishlist', JSON.stringify(this.items));
    },
    
    addItem(product, targetPrice = null) {
        if (this.items.find(item => item.id === product.id)) {
            window.showToast('El producto ya está en tu wishlist', 'info');
            return false;
        }
        
        this.items.push({
            ...product,
            targetPrice: targetPrice,
            addedDate: new Date().toISOString()
        });
        
        this.saveToStorage();
        window.showToast('Agregado a wishlist', 'success');
        return true;
    },
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToStorage();
        window.showToast('Eliminado de wishlist', 'info');
    },
    
    setPriceAlert(id, targetPrice) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.targetPrice = targetPrice;
            this.saveToStorage();
            window.showToast('Alerta de precio configurada', 'success');
        }
    },
    
    checkPriceAlerts() {
        // Verificar si algún producto bajó al precio deseado
        this.items.forEach(item => {
            if (item.targetPrice && item.price <= item.targetPrice) {
                window.showToast(`¡${item.name} está a tu precio deseado!`, 'success');
            }
        });
    },
    
    bindEvents() {
        document.querySelectorAll('.add-wishlist').forEach(btn => {
            const product = {
                id: btn.getAttribute('data-producto-id'),
                name: btn.getAttribute('data-producto-nombre'),
                price: parseFloat(btn.getAttribute('data-producto-precio')),
                category: btn.getAttribute('data-producto-categoria'),
                image: btn.getAttribute('data-producto-imagen')
            };
            
            btn.addEventListener('click', () => this.addItem(product));
        });
    }
};

// ════════════════════════════════════════════════════════════
// 12. SISTEMA DE SEGUIMIENTO DE PEDIDOS
// ════════════════════════════════════════════════════════════

const EcoOrderTracking = {
    orders: [],
    
    init() {
        this.loadOrders();
        this.bindEvents();
    },
    
    loadOrders() {
        const saved = localStorage.getItem('ecomarket-orders');
        if (saved) {
            try {
                this.orders = JSON.parse(saved);
            } catch (e) {
                this.orders = [];
            }
        }
    },
    
    saveOrders() {
        localStorage.setItem('ecomarket-orders', JSON.stringify(this.orders));
    },
    
    addOrder(order) {
        const newOrder = {
            id: 'ORD-' + Date.now(),
            ...order,
            status: 'pending',
            statusHistory: [
                { status: 'pending', date: new Date().toISOString(), message: 'Pedido recibido' }
            ],
            createdAt: new Date().toISOString()
        };
        
        this.orders.push(newOrder);
        this.saveOrders();
        window.showToast('Pedido creado con éxito', 'success');
        return newOrder.id;
    },
    
    updateOrderStatus(orderId, status, message) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.statusHistory.push({
                status: status,
                date: new Date().toISOString(),
                message: message
            });
            this.saveOrders();
            window.showToast(`Estado actualizado: ${status}`, 'success');
        }
    },
    
    getOrderStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        return order ? order.statusHistory : [];
    },
    
    getUserOrders() {
        return this.orders;
    },
    
    bindEvents() {
        // Eventos de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const cart = EcoCart.getSummary();
                const order = {
                    items: cart.items,
                    subtotal: cart.subtotal,
                    shipping: cart.shipping,
                    total: cart.total,
                    customer: {
                        name: document.getElementById('customerName').value,
                        email: document.getElementById('customerEmail').value,
                        address: document.getElementById('customerAddress').value
                    }
                };
                
                this.addOrder(order);
                EcoCart.items = [];
                EcoCart.saveToStorage();
                
                // Redirigir a confirmación
                window.location.href = '/confirmacion';
            });
        }
    }
};

const EcoGamification = {
    points: 0,
    level: 1,
    badges: [],
    
    init() {
        this.loadProgress();
        this.updateUI();
    },
    
    loadProgress() {
        const saved = localStorage.getItem('ecomarket-gamification');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.points = data.points || 0;
                this.level = data.level || 1;
                this.badges = data.badges || [];
            } catch (e) {
                // Empezar desde cero
            }
        }
    },
    
    saveProgress() {
        localStorage.setItem('ecomarket-gamification', JSON.stringify({
            points: this.points,
            level: this.level,
            badges: this.badges
        }));
        this.updateUI();
    },
    
    addPoints(amount, reason) {
        this.points += amount;
        this.checkLevelUp();
        this.saveProgress();
        this.showNotification(`+${amount} EcoPuntos: ${reason}`, 'success');
    },
    
    checkLevelUp() {
        const newLevel = Math.floor(this.points / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showNotification(`¡Nivel ${this.level} alcanzado! 🎉`, 'success');
            this.unlockBadge(`level-${this.level}`);
        }
    },
    
    unlockBadge(badgeId) {
        if (!this.badges.includes(badgeId)) {
            this.badges.push(badgeId);
            this.showNotification(`¡Insignia desbloqueada! 🏆`, 'success');
        }
    },
    
    updateUI() {
        // Actualizar puntos en el perfil si existe
        const pointsEl = document.querySelector('[data-eco-points]');
        if (pointsEl) {
            pointsEl.textContent = this.points;
        }
        
        // Actualizar nivel
        const levelEl = document.querySelector('[data-eco-level]');
        if (levelEl) {
            levelEl.textContent = this.level;
        }
    },
    
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `eco-toast eco-toast-${type}`;
        toast.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ════════════════════════════════════════════════════════════
// 6. UTILIDADES DE FORMULARIOS
// ════════════════════════════════════════════════════════════

const EcoForms = {
    init() {
        this.initValidation();
        this.initPasswordStrength();
    },
    
    initValidation() {
        const forms = document.querySelectorAll('form[data-eco-validate]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    },
    
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('[data-validate]');
        
        inputs.forEach(input => {
            const validation = input.getAttribute('data-validate');
            let valid = true;
            
            if (validation === 'email') {
                valid = this.validateEmail(input.value);
            } else if (validation === 'required') {
                valid = input.value.trim() !== '';
            } else if (validation === 'password') {
                valid = this.validatePassword(input.value);
            }
            
            if (!valid) {
                isValid = false;
                input.classList.add('eco-invalid');
                input.classList.remove('eco-valid');
            } else {
                input.classList.remove('eco-invalid');
                input.classList.add('eco-valid');
            }
        });
        
        return isValid;
    },
    
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    validatePassword(password) {
        return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
    },
    
    initPasswordStrength() {
        const passwordInputs = document.querySelectorAll('input[type="password"][data-strength-meter]');
        passwordInputs.forEach(input => {
            const meter = document.createElement('div');
            meter.className = 'password-meter';
            meter.innerHTML = `
                <div class="password-meter-bar"><div></div></div>
                <small></small>
            `;
            input.parentNode.insertBefore(meter, input.nextSibling);
            
            input.addEventListener('input', () => {
                this.updatePasswordStrength(input, meter);
            });
        });
    },
    
    updatePasswordStrength(input, meter) {
        const password = input.value;
        const bar = meter.querySelector('.password-meter-bar > div');
        const text = meter.querySelector('small');
        
        let strength = 0;
        let label = '';
        
        if (password.length === 0) {
            strength = 0;
            label = '';
        } else if (password.length < 8) {
            strength = 25;
            label = 'Débil';
        } else if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
            strength = 50;
            label = 'Media';
        } else if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            strength = 75;
            label = 'Fuerte';
        } else {
            strength = 100;
            label = 'Muy fuerte';
        }
        
        bar.style.width = `${strength}%`;
        bar.style.background = strength < 50 ? '#e53935' : strength < 75 ? '#f59e0b' : '#2e7d32';
        text.textContent = label;
    }
};

// ════════════════════════════════════════════════════════════
// 7. ANIMACIONES Y EFECTOS
// ════════════════════════════════════════════════════════════

const EcoAnimations = {
    init() {
        this.initCounters();
        this.initProgressBars();
    },
    
    initCounters() {
        const counters = document.querySelectorAll('[data-animate-counter]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    },
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-animate-counter'));
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, duration / steps);
    },
    
    initProgressBars() {
        const bars = document.querySelectorAll('[data-animate-progress]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target.getAttribute('data-animate-progress');
                    entry.target.style.width = `${target}%`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        bars.forEach(bar => {
            bar.style.width = '0%';
            bar.style.transition = 'width 1s ease';
            observer.observe(bar);
        });
    }
};

// ════════════════════════════════════════════════════════════
// 19. ANIMACIONES DE SCROLL
// ════════════════════════════════════════════════════════════

const EcoScrollAnimations = {
    init() {
        this.initScrollReveal();
        this.initScrollProgress();
        this.initSmoothScroll();
    },
    
    initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observar elementos con clase reveal-on-scroll
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Observar elementos con clase fade-on-scroll
        document.querySelectorAll('.fade-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Observar elementos con clase scale-on-scroll
        document.querySelectorAll('.scale-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },
    
    initScrollProgress() {
        // Crear barra de progreso de scroll
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.width = '0%';
        document.body.appendChild(progressBar);
        
        // Actualizar barra de progreso al hacer scroll
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    },
    
    initSmoothScroll() {
        // Smooth scroll para enlaces ancla
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

// ════════════════════════════════════════════════════════════
// 20. SISTEMA DE SKELETONS DE CARGA
// ════════════════════════════════════════════════════════════

const EcoSkeletons = {
    showSkeletons(container, type = 'card') {
        const skeletonHTML = this.getSkeletonHTML(type);
        container.innerHTML = skeletonHTML;
    },
    
    getSkeletonHTML(type) {
        switch(type) {
            case 'card':
                return `
                    <div class="skeleton skeleton-card">
                        <div class="skeleton skeleton-header"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text skeleton-text-short"></div>
                        <div class="skeleton skeleton-button"></div>
                    </div>
                `;
            case 'product':
                return `
                    <div class="skeleton skeleton-product-card">
                        <div class="skeleton skeleton-product-image"></div>
                        <div class="skeleton-product-info">
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text skeleton-text-short"></div>
                            <div class="skeleton skeleton-button"></div>
                        </div>
                    </div>
                `;
            case 'list':
                return `
                    <div class="skeleton skeleton-card">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text skeleton-text-short"></div>
                    </div>
                `;
            default:
                return '<div class="skeleton"></div>';
        }
    },
    
    hideSkeletons(container, content) {
        container.innerHTML = content;
    }
};

// ════════════════════════════════════════════════════════════
// 22. SISTEMA DE TOAST NOTIFICATIONS MEJORADO
// ════════════════════════════════════════════════════════════

const EcoToast = {
    container: null,
    
    init() {
        this.createContainer();
    },
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },
    
    show(title, message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'bi-check-circle',
            error: 'bi-x-circle',
            warning: 'bi-exclamation-triangle',
            info: 'bi-info-circle'
        };
        
        toast.innerHTML = `
            <i class="bi ${icons[type] || icons.info}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
            <div class="toast-progress" style="width: 100%"></div>
        `;
        
        this.container.appendChild(toast);
        
        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Animación de progreso
        setTimeout(() => {
            const progress = toast.querySelector('.toast-progress');
            if (progress) {
                progress.style.width = '0%';
                progress.style.transition = `width ${duration}ms linear`;
            }
        }, 10);
        
        // Cerrar automáticamente
        const autoClose = setTimeout(() => this.close(toast), duration);
        
        // Cerrar al hacer click en X
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoClose);
            this.close(toast);
        });
        
        // Cerrar al hacer click en toast
        toast.addEventListener('click', () => {
            clearTimeout(autoClose);
            this.close(toast);
        });
    },
    
    close(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    },
    
    success(title, message) {
        this.show(title, message, 'success');
    },
    
    error(title, message) {
        this.show(title, message, 'error');
    },
    
    warning(title, message) {
        this.show(title, message, 'warning');
    },
    
    info(title, message) {
        this.show(title, message, 'info');
    }
};

// ════════════════════════════════════════════════════════════
// 23. MODAL DE PRODUCTO RÁPIDO
// ════════════════════════════════════════════════════════════

const EcoQuickView = {
    overlay: null,
    modal: null,
    
    init() {
        this.createModal();
        this.bindEvents();
    },
    
    createModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Vista Rápida</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="quick-view-modal">
                        <div class="quick-view-image">
                            <img src="" alt="Producto">
                        </div>
                        <div class="quick-view-info">
                            <h3 class="product-name"></h3>
                            <div class="quick-view-price"></div>
                            <div class="quick-view-description"></div>
                            <div class="product-rating"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secundario close-modal">Cerrar</button>
                    <button class="btn-principal add-to-cart">Agregar al Carrito</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
        this.modal = this.overlay.querySelector('.modal');
    },
    
    open(product) {
        const img = this.modal.querySelector('.quick-view-image img');
        const name = this.modal.querySelector('.product-name');
        const price = this.modal.querySelector('.quick-view-price');
        const description = this.modal.querySelector('.quick-view-description');
        
        img.src = product.image || '';
        name.textContent = product.name || '';
        price.textContent = product.price ? `S/. ${parseFloat(product.price).toFixed(2)}` : '';
        description.textContent = product.description || '';
        
        this.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        this.overlay.classList.remove('show');
        document.body.style.overflow = '';
    },
    
    bindEvents() {
        this.overlay.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.overlay.querySelector('.close-modal').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
                this.close();
            }
        });
    }
};

// ════════════════════════════════════════════════════════════
// 24. EFECTOS DE RIPPLE
// ════════════════════════════════════════════════════════════

const EcoRipple = {
    init() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.ripple-btn, .btn-principal, .btn-secundario, .btn-pastel, .producto-action-btn, .modal-close');
            if (button) {
                this.createRipple(e, button);
            }
        });
    },
    
    createRipple(event, button) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
};

// ════════════════════════════════════════════════════════════
// 25. BÚSQUEDA CON HISTORIAL
// ════════════════════════════════════════════════════════════

const EcoSearchHistory = {
    history: [],
    maxHistory: 10,
    
    init() {
        this.loadHistory();
        this.bindEvents();
    },
    
    loadHistory() {
        const saved = localStorage.getItem('ecomarket-search-history');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
            } catch (e) {
                this.history = [];
            }
        }
    },
    
    saveHistory() {
        localStorage.setItem('ecomarket-search-history', JSON.stringify(this.history));
    },
    
    addSearch(query) {
        if (!query.trim()) return;
        
        // Eliminar si ya existe
        this.history = this.history.filter(item => item !== query);
        
        // Agregar al inicio
        this.history.unshift(query);
        
        // Limitar a maxHistory
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }
        
        this.saveHistory();
    },
    
    removeSearch(query) {
        this.history = this.history.filter(item => item !== query);
        this.saveHistory();
    },
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
    },
    
    getHistory() {
        return this.history;
    },
    
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('change', (e) => {
                this.addSearch(e.target.value);
            });
        }
    }
};

// ════════════════════════════════════════════════════════════
// 26. INICIALIZACIÓN FINAL CON MANEJO DE ERRORES
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inicializar módulos básicos que están definidos
        EcoMarket.init();
        EcoCart.init();
        EcoFavorites.init();
        EcoSearch.init();
        
        // Inicializar módulos avanzados que están definidos
        EcoCompare.init();
        EcoCoupons.init();
        EcoQA.init();
        EcoNotifications.init();
        EcoRecommendations.init();
        EcoWishlist.init();
        EcoOrderTracking.init();
        
        // Inicializar módulos adicionales que están definidos
        EcoReviews.init();
        EcoSellerRating.init();
        EcoImpactCalculator.init();
        EcoReferrals.init();
        EcoAdvancedSearch.init();
        EcoChallenges.init();
        
        // Inicializar nuevas mejoras que están definidas
        EcoScrollAnimations.init();
        EcoToast.init();
        EcoQuickView.init();
        EcoRipple.init();
        EcoSearchHistory.init();
        
        // Reemplazar showToast con EcoToast
        window.showToast = (message, type = 'info') => {
            try {
                const titles = {
                    success: 'Éxito',
                    error: 'Error',
                    warning: 'Advertencia',
                    info: 'Información'
                };
                EcoToast.show(titles[type] || titles.info, message, type);
            } catch (e) {
                console.error('Error en showToast:', e);
            }
        };
        
        // Exponer al scope global para uso en plantillas
        window.EcoMarket = EcoMarket;
        window.EcoCart = EcoCart;
        window.EcoFavorites = EcoFavorites;
        window.EcoCompare = EcoCompare;
        window.EcoCoupons = EcoCoupons;
        window.EcoQA = EcoQA;
        window.EcoNotifications = EcoNotifications;
        window.EcoRecommendations = EcoRecommendations;
        window.EcoWishlist = EcoWishlist;
        window.EcoOrderTracking = EcoOrderTracking;
        window.EcoReviews = EcoReviews;
        window.EcoSellerRating = EcoSellerRating;
        window.EcoImpactCalculator = EcoImpactCalculator;
        window.EcoReferrals = EcoReferrals;
        window.EcoAdvancedSearch = EcoAdvancedSearch;
        window.EcoChallenges = EcoChallenges;
        window.EcoScrollAnimations = EcoScrollAnimations;
        window.EcoToast = EcoToast;
        window.EcoQuickView = EcoQuickView;
        window.EcoRipple = EcoRipple;
        window.EcoSearchHistory = EcoSearchHistory;
        
        console.log('EcoMarket inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar EcoMarket:', error);
        // Mostrar error en la página si es posible
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;padding:16px;text-align:center;z-index:99999;font-family:sans-serif;';
        errorDiv.textContent = 'Error al cargar EcoMarket. Por favor recarga la pagina.';
        document.body.appendChild(errorDiv);
    }
});

// Manejo global de errores
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no manejada:', event.reason);
});

// ════════════════════════════════════════════════════════════
// FIN DEL JAVASCRIPT UNIFICADO ECOMARKET FINAL
// ════════════════════════════════════════════════════════════