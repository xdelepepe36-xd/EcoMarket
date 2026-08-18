// Mega Menu - Menú megamenú avanzado
class EcoMegaMenu {
    constructor() {
        this.init();
    }

    init() {
        this.createMegaMenu();
        this.addHoverEffects();
        this.addMobileMenu();
        this.addSearchInMenu();
    }

    createMegaMenu() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const megaMenu = document.createElement('div');
        megaMenu.className = 'mega-menu';
        megaMenu.innerHTML = `
            <div class="mega-menu-content">
                <div class="mega-menu-column">
                    <h4>🌱 Productos</h4>
                    <ul>
                        <li><a href="/productos?categoria=Accesorios">Accesorios</a></li>
                        <li><a href="/productos?categoria=Alimentación">Alimentación</a></li>
                        <li><a href="/productos?categoria=Higiene">Higiene</a></li>
                        <li><a href="/productos?categoria=Hogar">Hogar</a></li>
                    </ul>
                </div>
                <div class="mega-menu-column">
                    <h4>🏠 Categorías</h4>
                    <ul>
                        <li><a href="/productos?categoria=Jardín">Jardín</a></li>
                        <li><a href="/productos?categoria=Ropa">Ropa</a></li>
                        <li><a href="/productos?categoria=Tecnología">Tecnología</a></li>
                        <li><a href="/productos?categoria=Deportes">Deportes</a></li>
                    </ul>
                </div>
                <div class="mega-menu-column">
                    <h4>⭐ Destacados</h4>
                    <ul>
                        <li><a href="/productos?orden=populares">Más populares</a></li>
                        <li><a href="/productos?orden=nuevos">Nuevos productos</a></li>
                        <li><a href="/productos?orden=ofertas">Ofertas</a></li>
                        <li><a href="/productos?orden=valorados">Mejor valorados</a></li>
                    </ul>
                </div>
                <div class="mega-menu-column">
                    <h4>🎯 Servicios</h4>
                    <ul>
                        <li><a href="/publicar">Vender productos</a></li>
                        <li><a href="/impacto">Calcular impacto</a></li>
                        <li><a href="/favoritos">Mis favoritos</a></li>
                        <li><a href="/carrito">Mi carrito</a></li>
                    </ul>
                </div>
            </div>
        `;

        const productosLink = nav.querySelector('a[href="/productos"]');
        if (productosLink) {
            productosLink.addEventListener('mouseenter', () => {
                megaMenu.style.display = 'block';
            });
            productosLink.addEventListener('mouseleave', () => {
                megaMenu.style.display = 'none';
            });
        }

        nav.appendChild(megaMenu);
    }

    addHoverEffects() {
        const menuItems = document.querySelectorAll('.mega-menu ul li a');
        menuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(10px)';
                item.style.color = '#2ecc71';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
                item.style.color = '';
            });
        });
    }

    addMobileMenu() {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        
        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(mobileToggle);
            
            mobileToggle.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
            });
        }
    }

    addSearchInMenu() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const searchBox = document.createElement('div');
        searchBox.className = 'menu-search';
        searchBox.innerHTML = `
            <input type="text" placeholder="Buscar productos...">
            <button>🔍</button>
        `;

        nav.appendChild(searchBox);

        searchBox.querySelector('button').addEventListener('click', () => {
            const query = searchBox.querySelector('input').value;
            if (query) {
                window.location.href = `/productos?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoMegaMenu();
});