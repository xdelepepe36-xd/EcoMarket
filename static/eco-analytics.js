/**
 * eco-analytics.js - Sistema de analíticas para EcoMarket
 * Rastrea visitas, eventos y comportamiento de usuarios
 */
const EcoAnalytics = (() => {
  const EVENTS_KEY = 'eco_analytics_events';
  
  const track = (event, data = {}) => {
    try {
      const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
      events.push({
        event,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId: document.body.dataset.userId || ''
      });
      if (events.length > 200) events.splice(0, events.length - 200);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) { /* silent fail */ }
  };

  const getEvents = (limit = 50) => {
    try {
      const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
      return events.slice(-limit).reverse();
    } catch { return []; }
  };

  const getPageViews = () => {
    return getEvents().filter(e => e.event === 'page_view').length;
  };

  const init = () => {
    track('page_view', { title: document.title });
    
    // Track clicks on product cards
    document.querySelectorAll('.producto-card, [data-track-product]').forEach(el => {
      el.addEventListener('click', () => {
        track('product_click', { 
          productId: el.dataset.productId || el.closest('[data-product-id]')?.dataset.productId || 'unknown'
        });
      });
    });

    // Track add to cart
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-cart, [data-track-cart]');
      if (btn) {
        track('add_to_cart', {
          productId: btn.dataset.productoId || btn.dataset.productId || 'unknown',
          productName: btn.dataset.productoNombre || ''
        });
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { track, getEvents, getPageViews };
})();

window.EcoAnalytics = EcoAnalytics;