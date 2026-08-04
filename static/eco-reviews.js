/**
 * eco-reviews.js - Sistema de reseñas avanzado para EcoMarket
 * Maneja reseñas, valoraciones y comentarios de productos
 */
const EcoReviews = (() => {
  const init = () => {
    // Inicializar sistema de estrellas interactivas
    document.querySelectorAll('[data-review-stars]').forEach(container => {
      const rating = parseInt(container.dataset.rating) || 0;
      const interactive = container.dataset.interactive === 'true';
      renderStars(container, rating, interactive);
    });
  };

  const renderStars = (container, rating, interactive = false, onChange = null) => {
    container.innerHTML = '';
    container.style.cssText = 'display:flex;gap:3px;font-size:1.4rem';
    
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.innerHTML = i <= rating ? '★' : '☆';
      star.style.cssText = `color:${i <= rating ? '#f59e0b' : '#ddd'};cursor:${interactive ? 'pointer' : 'default'};transition:all 0.2s;user-select:none`;
      if (interactive) {
        star.addEventListener('click', () => {
          renderStars(container, i, true, onChange);
          if (onChange) onChange(i);
        });
        star.addEventListener('mouseenter', () => { star.style.transform = 'scale(1.3)'; });
        star.addEventListener('mouseleave', () => { star.style.transform = 'scale(1)'; });
      }
      container.appendChild(star);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { renderStars };
})();

window.EcoReviews = EcoReviews;