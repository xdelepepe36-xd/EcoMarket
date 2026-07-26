document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');

    if (navToggle && navbar) {
        navToggle.addEventListener('click', function () {
            navbar.classList.toggle('open');
            navToggle.classList.toggle('active');
        });
    }

    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filtro-btn');
    const productosGrid = document.getElementById('productosGrid');
    const productoCards = productosGrid ? Array.from(productosGrid.children) : [];

    function filterProductos() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const activeButton = document.querySelector('.filtro-btn.activo');
        const selectedCategory = activeButton ? activeButton.dataset.categoria : 'Todas';

        productoCards.forEach((card) => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.categoria')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';

            const matchesQuery = query === '' || title.includes(query) || category.includes(query) || description.includes(query);
            const matchesCategory = selectedCategory === 'Todas' || category === selectedCategory.toLowerCase();

            card.style.display = matchesQuery && matchesCategory ? '' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterProductos();
            showNoResults();
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', function () {
            filterButtons.forEach((btn) => btn.classList.remove('activo'));
            button.classList.add('activo');
            filterProductos();
            showNoResults();
        });
    });

    function showNoResults() {
        const noResults = document.getElementById('noResultsMessage');
        if (!noResults) return;
        const anyVisible = productoCards.some((card) => getComputedStyle(card).display !== 'none');
        noResults.hidden = anyVisible;
    }

    filterProductos();
    showNoResults();

    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');

    if (contactForm && contactSuccess) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            contactSuccess.hidden = false;
            contactForm.reset();
            window.scrollTo({ top: contactForm.offsetTop - 80, behavior: 'smooth' });
        });
    }

    const imageInput = document.querySelector('input[name="imagen"]');
    const imagePreviewContainer = document.querySelector('.image-preview');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput && imagePreviewContainer && imagePreview) {
        imageInput.addEventListener('input', function () {
            const url = imageInput.value.trim();
            if (url) {
                imagePreview.src = url;
                imagePreviewContainer.hidden = false;
            } else {
                imagePreviewContainer.hidden = true;
            }
        });
    }

    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    const featuredSlider = document.getElementById('featuredSlider');
    const prevSlideBtn = document.getElementById('prevSlide');
    const nextSlideBtn = document.getElementById('nextSlide');
    const addCartButtons = document.querySelectorAll('.add-cart');

    if (addCartButtons.length) {
        const products = Array.from(addCartButtons).map((button) => ({
            id: button.dataset.productoId,
            nombre: button.dataset.productoNombre,
            categoria: button.dataset.productoCategoria,
            precio: parseFloat(button.dataset.productoPrecio || '0'),
            imagen: button.dataset.productoImagen,
        }));
        localStorage.setItem('EcoMarketProducts', JSON.stringify(products));
    }

    function scrollFeatured(amount) {
        if (!featuredSlider) return;
        featuredSlider.scrollBy({ left: amount, behavior: 'smooth' });
    }

    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', function () {
            scrollFeatured(-featuredSlider.offsetWidth * 0.7);
        });
    }

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', function () {
            scrollFeatured(featuredSlider.offsetWidth * 0.7);
        });
    }

    if (featuredSlider) {
        let autoSlide = setInterval(function () {
            scrollFeatured(featuredSlider.offsetWidth * 0.7);
        }, 7000);

        featuredSlider.addEventListener('mouseenter', function () {
            clearInterval(autoSlide);
        });

        featuredSlider.addEventListener('mouseleave', function () {
            autoSlide = setInterval(function () {
                scrollFeatured(featuredSlider.offsetWidth * 0.7);
            }, 7000);
        });
    }

    const fadeItems = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    fadeItems.forEach((item) => observer.observe(item));
});
