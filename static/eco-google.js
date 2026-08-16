/**
 * eco-google.js — Inicio de sesión con Google (Google Identity Services)
 *
 * - Carga la librería GIS y renderiza un botón "Continuar con Google" en
 *   cualquier elemento con el atributo [data-eco-google-btn].
 * - Si NO hay un GOOGLE_CLIENT_ID configurado (p. ej. en desarrollo local),
 *   muestra un fallback visual e informa al usuario de que la integración
 *   requiere configuración.
 * - Al obtener la credencial, la envía por POST a /auth/google para que el
 *   backend la verifique contra Google y cree/valide la sesión.
 *
 * Configuración: definir GOOGLE_CLIENT_ID como variable de entorno en el
 * servidor (Recursos -> Google Cloud Console -> Credenciales -> OAuth 2.0).
 */
const EcoGoogle = (() => {
  const CLIENT_ID = (window.ECOMARKET_GOOGLE_CLIENT_ID || '').trim();
  const CONTAINER_SELECTOR = '[data-eco-google-btn]';
  // Para desplegarlo en producción debes añadir tu dominio a los orígenes
  // autorizados en Google Cloud Console (Authorized JavaScript origins).
  let scriptLoaded = false;

  const _t = (key) =>
    window.EcoI18n && typeof window.EcoI18n.t === 'function'
      ? window.EcoI18n.t(key, {}, key)
      : key;

  // ── Fallback cuando no hay Client ID ──
  const _renderFallback = (container) => {
    container.innerHTML = `
      <button type="button" class="eco-google-btn" disabled title="${_t('auth.google_need_config')}">
        <svg class="eco-google-svg" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.5 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.5 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.4 39.6 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C36.9 36.7 44 31.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        <span>${_t('auth.google_signin')}</span>
      </button>
      <small class="eco-google-note">${_t('auth.google_need_config')}</small>
    `;
    return container;
  };

  // ── Cargar librería GIS ──
  const _loadGis = () =>
    new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
      document.head.appendChild(s);
    });

  const init = async () => {
    const containers = document.querySelectorAll(CONTAINER_SELECTOR);
    if (!containers.length) return;

    if (!CLIENT_ID) {
      containers.forEach(_renderFallback);
      return;
    }

    try {
      await _loadGis();
      scriptLoaded = true;
    } catch (_e) {
      containers.forEach(_renderFallback);
      return;
    }

    const handleCredential = (response) => {
      if (!response || !response.credential) return;
      const btn = document.querySelector('.eco-google-submitting');
      try {
        if (btn) btn.disabled = true;
        fetch('/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              window.location.href = d.redirigir || '/';
            } else {
              if (btn) btn.disabled = false;
              alert(d.error || 'Error al iniciar sesión con Google.');
            }
          })
          .catch(() => {
            if (btn) btn.disabled = false;
            alert('Error de conexión al iniciar sesión con Google.');
          });
      } catch (_e) {
        if (btn) btn.disabled = false;
      }
    };

    let tokenClient = null;
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'openid email profile',
        callback: (_resp) => {
          // Con GIS (login) usamos el flujo de id_token a través de One Tap.
        }
      });
    } catch (_e) { /* require client_id y cliente HTTP válido */ }

    // Renderizar botón en cada contenedor
    containers.forEach((container) => {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'eco-google-render';
      container.appendChild(wrapper);
      try {
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: false,
          ux_mode: 'popup'
        });
        google.accounts.id.renderButton(wrapper, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: container.clientWidth || 320
        });
      } catch (_e) {
        _renderFallback(container);
      }
    });
  };

  const isReady = () => scriptLoaded && !!CLIENT_ID;
  const getClientId = () => CLIENT_ID;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, isReady, getClientId };
})();

window.EcoGoogle = EcoGoogle;