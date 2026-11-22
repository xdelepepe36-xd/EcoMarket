/* EcoMarket — animación "vuelo" al carrito */
(function () {
    'use strict';
    function cartIcon() {
        return document.querySelector('.cart-icon, .nav-cart, a[href*="carrito"] i, .header a[href*="carrito"]');
    }
    function fly(imgSrc, fromEl) {
        const icon = cartIcon();
        if (!icon || !imgSrc) return;
        const r = fromEl.getBoundingClientRect();
        const c = icon.getBoundingClientRect();
        const ghost = document.createElement('div');
        ghost.className = 'fly-ghost';
        ghost.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;width:56px;height:56px;' +
            'border-radius:14px;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.3);' +
            'left:' + (r.left + r.width / 2 - 28) + 'px;top:' + (r.top + r.height / 2 - 28) + 'px;';
        const img = document.createElement('img');
        img.src = imgSrc; img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        ghost.appendChild(img);
        document.body.appendChild(ghost);
        const dx = c.left + c.width / 2 - (r.left + r.width / 2);
        const dy = c.top + c.height / 2 - (r.top + r.height / 2);
        ghost.animate([
            { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
            { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 60) + 'px) scale(.7) rotate(10deg)', opacity: 1, offset: .6 },
            { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.15) rotate(-8deg)', opacity: .9 }
        ], { duration: 750, easing: 'cubic-bezier(.5,-0.2,.4,1)' }).onfinish = function () {
            ghost.remove();
            icon.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 350 });
        };
    }
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-cart, .btn-add-cart, [data-add-cart], .product-card .btn-card');
        if (!btn) return;
        setTimeout(function () {
            const card = btn.closest('.product-card, article, .detalle-info, .carrito-item');
            const img = card ? card.querySelector('img') : null;
            let src = img ? img.src : '';
            if (!src && btn.dataset.productoImagen) src = btn.dataset.productoImagen;
            if (src && !src.startsWith('http') && !src.startsWith('/')) src = '/static/' + src;
            if (src) fly(src, btn);
        }, 120);
    }, true);
})();
