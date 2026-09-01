/**
 * EcoMarket - Integración de Redes Sociales
 * Compartir contenido en redes sociales y login social
 */

const EcoSocial = {
    config: {
        facebookAppId: '',
        twitterConsumerKey: '',
        instagramClientId: '',
        tiktokClientId: ''
    },

    init() {
        try {
            this.loadConfig();
            this.setupSocialShare();
            this.setupSocialLogin();
            this.renderSocialButtons();
        } catch (error) {
            console.error('Error inicializando redes sociales:', error);
        }
    },

    loadConfig() {
        try {
            this.config.facebookAppId = window.FACEBOOK_APP_ID || '';
            this.config.twitterConsumerKey = window.TWITTER_CONSUMER_KEY || '';
            this.config.instagramClientId = window.INSTAGRAM_CLIENT_ID || '';
            this.config.tiktokClientId = window.TIKTOK_CLIENT_ID || '';
        } catch (error) {
            console.error('Error cargando configuración de redes sociales:', error);
        }
    },

    setupSocialShare() {
        // Configurar SDK de Facebook para compartir
        if (this.config.facebookAppId) {
            this.initFacebookSDK();
        }
    },

    initFacebookSDK() {
        try {
            window.fbAsyncInit = function() {
                FB.init({
                    appId: this.config.facebookAppId,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
            };

            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/es_LA/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        } catch (error) {
            console.error('Error inicializando Facebook SDK:', error);
        }
    },

    shareOnFacebook(url, title, description, image) {
        if (this.config.facebookAppId && typeof FB !== 'undefined') {
            FB.ui({
                method: 'share',
                href: url,
                title: title,
                description: description,
                picture: image
            }, function(response) {
                if (response && !response.error_message) {
                    if (window.EcoToast) {
                        EcoToast.show('Compartido', 'Producto compartido en Facebook', 'success');
                    }
                }
            });
        } else {
            // Fallback a compartir por URL
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    },

    shareOnTwitter(url, text) {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    },

    shareOnInstagram(url, caption) {
        // Instagram no tiene una API pública para compartir directamente
        // Mostramos instrucciones al usuario
        if (window.EcoToast) {
            EcoToast.show('Instrucciones', 'Descarga la imagen y compártela en Instagram', 'info');
        }
        
        // Opcional: descargar la imagen
        this.downloadImageForInstagram(url, caption);
    },

    shareOnTikTok(url, description) {
        // TikTok no tiene una API pública para compartir directamente
        // Mostramos instrucciones al usuario
        if (window.EcoToast) {
            EcoToast.show('Instrucciones', 'Usa la función de compartir de TikTok', 'info');
        }
    },

    shareOnWhatsApp(url, text) {
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(shareUrl, '_blank');
    },

    shareOnLinkedIn(url, title, description) {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    },

    shareOnPinterest(url, description, image) {
        const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}&media=${encodeURIComponent(image)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    },

    shareViaEmail(url, title, description) {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${description}\n\n${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    },

    downloadImageForInstagram(url, caption) {
        // Implementación para descargar imagen
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ecomarket-product.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    setupSocialLogin() {
        // Configurar botones de login social
        this.setupFacebookLogin();
        this.setupGoogleLogin();
    },

    setupFacebookLogin() {
        const fbLoginBtn = document.getElementById('facebook-login-btn');
        if (fbLoginBtn && this.config.facebookAppId) {
            fbLoginBtn.addEventListener('click', () => {
                this.loginWithFacebook();
            });
        }
    },

    loginWithFacebook() {
        if (typeof FB !== 'undefined') {
            FB.login(function(response) {
                if (response.authResponse) {
                    // Enviar token al backend
                    fetch('/api/facebook-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            access_token: response.authResponse.accessToken
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = '/perfil';
                        } else {
                            if (window.EcoToast) {
                                EcoToast.show('Error', 'Error en login con Facebook', 'error');
                            }
                        }
                    });
                }
            }, {scope: 'email,public_profile'});
        }
    },

    setupGoogleLogin() {
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                this.loginWithGoogle();
            });
        }
    },

    loginWithGoogle() {
        // Usar Google Identity Services
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: window.GOOGLE_CLIENT_ID,
                callback: this.handleGoogleCredentialResponse.bind(this)
            });
            
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    console.log('Google One Tap no se mostró');
                }
            });
        }
    },

    handleGoogleCredentialResponse(response) {
        fetch('/api/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                credential: response.credential
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/perfil';
            } else {
                if (window.EcoToast) {
                    EcoToast.show('Error', 'Error en login con Google', 'error');
                }
            }
        });
    },

    renderSocialButtons() {
        // Renderizar botones de compartir en tarjetas de producto
        this.renderProductShareButtons();
        this.renderSocialLoginButtons();
    },

    renderProductShareButtons() {
        const containers = document.querySelectorAll('.social-share-container');
        containers.forEach(container => {
            const productUrl = container.dataset.url || window.location.href;
            const productTitle = container.dataset.title || 'Producto EcoMarket';
            const productDescription = container.dataset.description || 'Mira este producto increíble en EcoMarket';
            const productImage = container.dataset.image || '';

            container.innerHTML = `
                <div class="social-share-buttons">
                    <button class="social-btn facebook" onclick="EcoSocial.shareOnFacebook('${productUrl}', '${productTitle}', '${productDescription}', '${productImage}')" title="Compartir en Facebook">
                        <i class="bi bi-facebook"></i>
                    </button>
                    <button class="social-btn twitter" onclick="EcoSocial.shareOnTwitter('${productUrl}', '${productTitle}')" title="Compartir en Twitter">
                        <i class="bi bi-twitter-x"></i>
                    </button>
                    <button class="social-btn instagram" onclick="EcoSocial.shareOnInstagram('${productImage}', '${productDescription}')" title="Compartir en Instagram">
                        <i class="bi bi-instagram"></i>
                    </button>
                    <button class="social-btn whatsapp" onclick="EcoSocial.shareOnWhatsApp('${productUrl}', '${productTitle}')" title="Compartir en WhatsApp">
                        <i class="bi bi-whatsapp"></i>
                    </button>
                    <button class="social-btn linkedin" onclick="EcoSocial.shareOnLinkedIn('${productUrl}', '${productTitle}', '${productDescription}')" title="Compartir en LinkedIn">
                        <i class="bi bi-linkedin"></i>
                    </button>
                    <button class="social-btn pinterest" onclick="EcoSocial.shareOnPinterest('${productUrl}', '${productDescription}', '${productImage}')" title="Compartir en Pinterest">
                        <i class="bi bi-pinterest"></i>
                    </button>
                    <button class="social-btn email" onclick="EcoSocial.shareViaEmail('${productUrl}', '${productTitle}', '${productDescription}')" title="Compartir por email">
                        <i class="bi bi-envelope"></i>
                    </button>
                </div>
            `;
        });
    },

    renderSocialLoginButtons() {
        const container = document.getElementById('social-login-buttons');
        if (!container) return;

        container.innerHTML = `
            <div class="social-login-buttons">
                <button id="facebook-login-btn" class="social-login-btn facebook">
                    <i class="bi bi-facebook"></i> Continuar con Facebook
                </button>
                <button id="google-login-btn" class="social-login-btn google">
                    <i class="bi bi-google"></i> Continuar con Google
                </button>
            </div>
        `;

        this.setupFacebookLogin();
        this.setupGoogleLogin();
    },

    generateShareLink(url, platform) {
        const platforms = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?url=${encodeURIComponent(url)}`,
            email: `mailto:?subject=Interesante&body=${encodeURIComponent(url)}`
        };

        return platforms[platform] || url;
    },

    copyShareLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            if (window.EcoToast) {
                EcoToast.show('Enlace copiado', 'El enlace ha sido copiado al portapapeles', 'success');
            }
        }).catch(err => {
            console.error('Error copiando enlace:', err);
            if (window.EcoToast) {
                EcoToast.show('Error', 'No se pudo copiar el enlace', 'error');
            }
        });
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoSocial.init());
} else {
    EcoSocial.init();
}

// Exponer globalmente
window.EcoSocial = EcoSocial;