/**
 * eco-effects.js - Efectos visuales premium para EcoMarket
 * Partículas, hojas cayendo, confeti, contadores animados, typing effect
 */
const EcoEffects = (() => {
  // ============================================================
  // 1. PARTÍCULAS FLOTANTES (Fondo dinámico)
  // ============================================================
  const initParticles = () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'ecoParticles';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.3';
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.shape = Math.random() > 0.5 ? 'circle' : 'leaf';
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#4caf50';
        if (this.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size * 1.5, this.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    animate();
  };

  // ============================================================
  // 2. CONTADORES ANIMADOS (Count-up)
  // ============================================================
  const initCounters = () => {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      const target = parseInt(el.dataset.countTo) || 0;
      const suffix = el.dataset.countSuffix || '';
      const duration = parseInt(el.dataset.countDuration) || 2000;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(el);
            const start = performance.now();
            const animate = (now) => {
              const progress = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(eased * target);
              el.textContent = current.toLocaleString() + suffix;
              if (progress < 1) requestAnimationFrame(animate);
              else el.textContent = target.toLocaleString() + suffix;
            };
            requestAnimationFrame(animate);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(el);
    });
  };

  // ============================================================
  // 3. TYPING EFFECT (Hero section)
  // ============================================================
  const initTypingEffect = () => {
    const el = document.querySelector('[data-typing]');
    if (!el) return;
    const text = el.dataset.typing;
    const speed = parseInt(el.dataset.typingSpeed) || 50;
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.unobserve(el);
        setTimeout(type, 500);
      }
    });
    observer.observe(el);
  };

  // ============================================================
  // 4. CONFETTI (Para logros/eventos)
  // ============================================================
  const showConfetti = () => {
    const colors = ['#2e7d32', '#4caf50', '#a5d6a7', '#f59e0b', '#e53935', '#1565c0', '#6a1b9a'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden';
    document.body.appendChild(container);

    for (let i = 0; i < 100; i++) {
      const piece = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 5;
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = Math.random() * 2 + 2;
      
      piece.style.cssText = `
        position:absolute;top:-20px;left:${left}%;width:${size}px;height:${size * 0.6}px;
        background:${color};border-radius:2px;
        animation:confettiFall ${duration}s ease-in ${delay}s forwards;
        transform:rotate(${Math.random() * 360}deg);
      `;
      container.appendChild(piece);
    }

    // Add keyframes
    if (!document.getElementById('confettiStyle')) {
      const style = document.createElement('style');
      style.id = 'confettiStyle';
      style.textContent = `
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => container.remove(), 5000);
  };

  // ============================================================
  // 5. HOJAS CAYENDO (Decoración eco)
  // ============================================================
  const initFallingLeaves = () => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;opacity:0.15';
    document.body.prepend(container);

    const leaves = ['🌿', '🍃', '🌱', '☘️', '🍀'];
    for (let i = 0; i < 15; i++) {
      const leaf = document.createElement('div');
      leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = Math.random() * 10 + 10;
      const size = Math.random() * 20 + 14;
      
      leaf.style.cssText = `
        position:absolute;top:-30px;left:${left}%;font-size:${size}px;
        animation:leafFall ${duration}s linear ${delay}s infinite;
        transform:rotate(${Math.random() * 360}deg);
      `;
      container.appendChild(leaf);
    }

    if (!document.getElementById('leafStyle')) {
      const style = document.createElement('style');
      style.id = 'leafStyle';
      style.textContent = `
        @keyframes leafFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) translateX(100px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ============================================================
  // 6. PRODUCT ZOOM (Lupa en imágenes)
  // ============================================================
  const initProductZoom = () => {
    document.querySelectorAll('[data-zoom]').forEach(container => {
      const img = container.querySelector('img');
      if (!img) return;
      
      container.style.cursor = 'zoom-in';
      container.style.overflow = 'hidden';
      
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = 'scale(2)';
      });
      
      container.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    });
  };

  // ============================================================
  // 7. TESTIMONIAL CAROUSEL (Auto-rotating)
  // ============================================================
  const initTestimonialCarousel = () => {
    const container = document.querySelector('[data-carousel]');
    if (!container) return;
    const items = container.querySelectorAll('.testimonio-card, [data-carousel-item]');
    if (items.length < 2) return;

    let current = 0;
    const show = (index) => {
      items.forEach((item, i) => {
        item.style.display = i === index ? 'block' : 'none';
        item.style.animation = i === index ? 'fadeInUp 0.5s ease' : '';
      });
    };

    // Hide all but first
    items.forEach((item, i) => { item.style.display = i === 0 ? 'block' : 'none'; });

    setInterval(() => {
      current = (current + 1) % items.length;
      show(current);
    }, 5000);
  };

  // ============================================================
  // 8. PRICE ANIMATION (Pulse en descuentos)
  // ============================================================
  const initPriceAnimations = () => {
    document.querySelectorAll('.producto-descuento, [data-discount]').forEach(el => {
      el.style.animation = 'discountPulse 2s ease-in-out infinite';
    });

    if (!document.getElementById('discountStyle')) {
      const style = document.createElement('style');
      style.id = 'discountStyle';
      style.textContent = `
        @keyframes discountPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ============================================================
  // 9. PROGRESS BAR ANIMATION
  // ============================================================
  const initProgressBars = () => {
    document.querySelectorAll('[data-progress]').forEach(bar => {
      const target = parseInt(bar.dataset.progress) || 0;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.unobserve(bar);
          bar.style.width = '0%';
          setTimeout(() => { bar.style.width = target + '%'; }, 200);
        }
      });
      observer.observe(bar);
    });
  };

  // ============================================================
  // 10. TOOLTIP MODERNO
  // ============================================================
  const initTooltips = () => {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.textContent = el.dataset.tooltip;
        tooltip.style.cssText = `
          position:fixed;padding:6px 12px;background:#1f2a21;color:#fff;
          border-radius:8px;font-size:0.78rem;font-weight:500;z-index:99999;
          pointer-events:none;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.2);
        `;
        tooltip.id = 'eco-tooltip';
        document.body.appendChild(tooltip);
        const rect = el.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
      });
      el.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('eco-tooltip');
        if (tooltip) tooltip.remove();
      });
    });
  };

  // ============================================================
  // INIT
  // ============================================================
  const init = () => {
    // Only init particles on non-mobile for performance
    if (window.innerWidth > 768) {
      initParticles();
      initFallingLeaves();
    }
    initCounters();
    initTypingEffect();
    initProductZoom();
    initTestimonialCarousel();
    initPriceAnimations();
    initProgressBars();
    initTooltips();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { showConfetti };
})();

window.EcoEffects = EcoEffects;