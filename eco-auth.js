/**
 * eco-auth.js — Sistema de autenticación simulado EcoMarket
 * 
 * Funcionalidades:
 *   - Login/Logout simulado con localStorage
 *   - Navbar dinámico: muestra perfil cuando hay sesión
 *   - Protección de rutas (redirige a login si no hay sesión)
 *   - Datos de usuario persistente
 *   - Eventos personalizados para integración
 *   - Integración con gamificación (login streak)
 *
 * Incluir: <script src="eco-auth.js"></script>
 * (Debe ir ANTES de otros scripts que dependan del usuario)
 */
const EcoAuth = (() => {
  const KEY = 'eco_user';
  const GUEST_KEY = 'eco_guest_cart';

  // ── Usuario por defecto para demo ──────────────────────
  const DEMO_USER = {
    id: 'user_001',
    name: 'María García',
    email: 'maria@ecomarket.com',
    avatar: 'M',
    avatarColor: '#2e7d32',
    role: 'user',
    memberSince: '2026-01-15',
    stats: {
      purchases: 4,
      publications: 2,
      reviews: 3
    }
  };

  // ── Gestión de sesión ──────────────────────────────────
  const getUser = () => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      return data && data.email ? data : null;
    } catch { return null; }
  };

  const isLoggedIn = () => getUser() !== null;

  const login = (email, password, remember = false) => {
    // Simulación: cualquier email con contraseña de 6+ caracteres funciona
    if (!email || !password || password.length < 6) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    const user = {
      ...DEMO_USER,
      email,
      name: email.split('@')[0].replace(/[^a-zA-Záéíóúñ\s]/g, ' ').trim() || 'Usuario',
      avatar: (email[0] || 'U').toUpperCase(),
      lastLogin: new Date().toISOString()
    };

    localStorage.setItem(KEY, JSON.stringify(user));
    _dispatch();
    _updateNavbar();

    // Gamificación: login streak
    if (window.EcoGamification) {
      EcoGamification.checkLoginStreak();
      EcoGamification.addPoints('login_streak');
    }

    // Notificación
    if (window.EcoNotifications) {
      EcoNotifications.add(
        '👋 ¡Bienvenido de vuelta!',
        `Has iniciado sesión como ${user.name}`,
        { type: 'success', icon: '🌿', timeout: 5000 }
      );
    }

    return { success: true, user };
  };

  const register = (data) => {
    const { name, email, password } = data;
    if (!name || !email || !password || password.length < 6) {
      return { success: false, error: 'Datos inválidos' };
    }

    const user = {
      id: 'user_' + Date.now().toString(36),
      name,
      email,
      avatar: (name[0] || 'U').toUpperCase(),
      avatarColor: ['#2e7d32', '#1565c0', '#6a1b9a', '#e65100'][Math.floor(Math.random() * 4)],
      role: 'user',
      memberSince: new Date().toISOString().split('T')[0],
      stats: { purchases: 0, publications: 0, reviews: 0 },
      lastLogin: new Date().toISOString()
    };

    localStorage.setItem(KEY, JSON.stringify(user));
    _dispatch();
    _updateNavbar();

    if (window.EcoGamification) {
      EcoGamification.addPoints('purchase', { co2: 0.5 });
    }

    return { success: true, user };
  };

  const logout = () => {
    // Guardar carrito antes de cerrar sesión
    _saveGuestCart();
    localStorage.removeItem(KEY);
    _dispatch();
    _updateNavbar();

    if (window.EcoToast) {
      EcoToast.info('👋 Sesión cerrada. ¡Hasta pronto!');
    }
  };

  // ── Carrito de invitado ────────────────────────────────
  const _saveGuestCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('ecomarket_cart') || '[]');
      if (cart.length > 0) {
        localStorage.setItem(GUEST_KEY, JSON.stringify(cart));
      }
    } catch {}
  };

  const restoreGuestCart = () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
      if (guestCart.length > 0) {
        localStorage.setItem('ecomarket_cart', JSON.stringify(guestCart));
        localStorage.removeItem(GUEST_KEY);
        if (window.EcoCart) window.EcoCart.getCount(); // Forzar actualización
      }
    } catch {}
  };

  // ── Navbar dinámico ────────────────────────────────────
  const _updateNavbar = () => {
    const user = getUser();
    const loggedIn = user !== null;

    // Actualizar todos los navbars en la página
    document.querySelectorAll('[data-eco-nav]').forEach(nav => {
      const loginArea = nav.querySelector('[data-eco-login-area]');
      const profileArea = nav.querySelector('[data-eco-profile-area]');

      if (loginArea) loginArea.style.display = loggedIn ? 'none' : '';
      if (profileArea) profileArea.style.display = loggedIn ? '' : 'none';

      // Actualizar datos del perfil
      if (loggedIn && profileArea) {
        const nameEl = profileArea.querySelector('[data-eco-user-name]');
        const avatarEl = profileArea.querySelector('[data-eco-user-avatar]');
        const emailEl = profileArea.querySelector('[data-eco-user-email]');

        if (nameEl) nameEl.textContent = user.name;
        if (avatarEl) {
          avatarEl.textContent = user.avatar;
          avatarEl.style.background = user.avatarColor;
        }
        if (emailEl) emailEl.textContent = user.email;
      }
    });

    // También actualizar elementos sueltos
    document.querySelectorAll('[data-eco-show-logged]').forEach(el => {
      el.style.display = loggedIn ? '' : 'none';
    });
    document.querySelectorAll('[data-eco-show-guest]').forEach(el => {
      el.style.display = loggedIn ? 'none' : '';
    });
  };

  // ── Protección de rutas ────────────────────────────────
  const requireAuth = (redirectTo = 'login.html') => {
    if (!isLoggedIn()) {
      // Guardar la página actual para redirigir después del login
      sessionStorage.setItem('eco_redirect_after_login', window.location.href);
      window.location.href = redirectTo;
      return false;
    }
    return true;
  };

  const getRedirectAfterLogin = () => {
    const redirect = sessionStorage.getItem('eco_redirect_after_login');
    sessionStorage.removeItem('eco_redirect_after_login');
    return redirect || 'index.html';
  };

  // ── Eventos ────────────────────────────────────────────
  const _dispatch = () => {
    const user = getUser();
    window.dispatchEvent(new CustomEvent('eco-auth:change', {
      detail: { user, loggedIn: user !== null }
    }));
  };

  // ── Inicialización ────────────────────────────────────
  const init = () => {
    _updateNavbar();

    // Si hay sesión, restaurar carrito de invitado
    if (isLoggedIn()) {
      restoreGuestCart();
    }

    // Escuchar cambios de auth
    window.addEventListener('eco-auth:change', _updateNavbar);
  };

  // Auto-inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getUser,
    isLoggedIn,
    login,
    register,
    logout,
    requireAuth,
    getRedirectAfterLogin,
    restoreGuestCart
  };
})();

window.EcoAuth = EcoAuth;