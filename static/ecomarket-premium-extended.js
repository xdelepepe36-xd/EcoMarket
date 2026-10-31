/*
   EcoMarket Premium Extended JavaScript
   Funcionalidades premium extendidas
   Author: EcoMarket Team
   Version: 4.0
*/

// ─────────────────────────────────────────────────────────────
// SELECTOR DE IDIOMA
// ─────────────────────────────────────────────────────────────

class LanguageSelector {
    constructor() {
        this.currentLang = localStorage.getItem('ecomarket_lang') || 'es';
        this.init();
    }

    init() {
        this.setupSelector();
        this.applyLanguage(this.currentLang);
    }

    setupSelector() {
        const selector = document.querySelector('.lang-selector');
        if (!selector) return;

        const options = selector.querySelectorAll('.lang-option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('ecomarket_lang', lang);
        this.applyLanguage(lang);
        
        // Fetch translations from API
        fetch(`/api/i18n/translations?lang=${lang}`)
            .then(response => response.json())
            .then(translations => {
                this.updatePageTranslations(translations);
            })
            .catch(error => console.error('Error loading translations:', error));
    }

    applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.body.dataset.lang = lang;
    }

    updatePageTranslations(translations) {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }
}

// ─────────────────────────────────────────────────────────────
// MODO OSCURO PREMIUM
// ─────────────────────────────────────────────────────────────

class DarkModeToggle {
    constructor() {
        this.isDark = localStorage.getItem('ecomarket_dark_mode') === 'true';
        this.init();
    }

    init() {
        this.setupToggle();
        this.applyTheme();
    }

    setupToggle() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.isDark = !this.isDark;
        localStorage.setItem('ecomarket_dark_mode', this.isDark);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
        
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.innerHTML = this.isDark ? '☀️' : '🌙';
        }
    }
}

// ─────────────────────────────────────────────────────────────
// ANIMACIONES SCROLL REVEAL
// ─────────────────────────────────────────────────────────────

class ScrollReveal {
    constructor() {
        this.init();
    }

    init() {
        this.setupObserver();
    }

    setupObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, options);

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            observer.observe(el);
        });
    }
}

// ─────────────────────────────────────────────────────────────
// PARALLAX EFFECT
// ─────────────────────────────────────────────────────────────

class ParallaxEffect {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallax();
    }

    setupParallax() {
        const parallaxSections = document.querySelectorAll('.parallax-section');
        
        window.addEventListener('scroll', () => {
            parallaxSections.forEach(section => {
                const bg = section.querySelector('.parallax-bg');
                if (!bg) return;

                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                bg.style.transform = `translateY(${rate}px)`;
            });
        });
    }
}

// ─────────────────────────────────────────────────────────────
// BÚSQUEDA CON AUTOCOMPLETADO
// ─────────────────────────────────────────────────────────────

class SearchAutocomplete {
    constructor() {
        this.searchContainer = document.querySelector('.search-container');
        this.searchInput = document.querySelector('.search-input');
        this.autocomplete = document.querySelector('.search-autocomplete');
        this.debounceTimer = null;
        this.init();
    }

    init() {
        if (!this.searchInput) return;

        this.setupListeners();
    }

    setupListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.length > 2) {
                this.showAutocomplete();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.searchContainer.contains(e.target)) {
                this.hideAutocomplete();
            }
        });
    }

    handleInput(value) {
        clearTimeout(this.debounceTimer);
        
        if (value.length < 2) {
            this.hideAutocomplete();
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.fetchSuggestions(value);
        }, 300);
    }

    async fetchSuggestions(query) {
        try {
            const response = await fetch(`/api/semantic/search?q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            this.renderSuggestions(data.results);
            this.showAutocomplete();
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    renderSuggestions(products) {
        if (!products || products.length === 0) {
            this.autocomplete.innerHTML = '<div class="search-result">No results found</div>';
            return;
        }

        this.autocomplete.innerHTML = products.map(product => `
            <div class="search-result" data-product-id="${product.id}">
                <img src="${product.imagen || '/static/images/default-product.jpg'}" alt="${product.nombre}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-name">${product.nombre}</div>
                    <div class="search-result-category">${product.categoria}</div>
                </div>
                <div class="search-result-price">S/ ${product.precio}</div>
            </div>
        `).join('');

        // Add click handlers
        this.autocomplete.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const productId = result.dataset.productId;
                window.location.href = `/producto/${productId}`;
            });
        });
    }

    showAutocomplete() {
        this.autocomplete.classList.add('active');
    }

    hideAutocomplete() {
        this.autocomplete.classList.remove('active');
    }
}

// ─────────────────────────────────────────────────────────────
// CHAT EN TIEMPO REAL
// ─────────────────────────────────────────────────────────────

class ChatWidget {
    constructor() {
        this.chatWidget = document.querySelector('.chat-widget');
        this.chatButton = document.querySelector('.chat-button');
        this.chatContainer = document.querySelector('.chat-container');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.chatButton) return;

        this.setupListeners();
        this.connectWebSocket();
    }

    setupListeners() {
        this.chatButton.addEventListener('click', () => {
            this.toggleChat();
        });

        const closeBtn = document.querySelector('.chat-header-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        const sendBtn = document.querySelector('.chat-send');
        const input = document.querySelector('.chat-input');
        
        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage(input.value);
                input.value = '';
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(input.value);
                    input.value = '';
                }
            });
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatContainer.classList.toggle('active', this.isOpen);
    }

    connectWebSocket() {
        // In production, connect to actual WebSocket server
        // For now, we'll simulate it
        console.log('WebSocket connection ready');
    }

    sendMessage(message) {
        if (!message.trim()) return;

        this.addMessage(message, 'sent');

        // Simulate response
        setTimeout(() => {
            this.addMessage('Thanks for your message! Our team will respond shortly.', 'received');
        }, 1000);
    }

    addMessage(message, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${type}`;
        messageEl.innerHTML = `
            <div class="chat-message-bubble">${message}</div>
        `;
        
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ─────────────────────────────────────────────────────────────
// GAMIFICACIÓN - SISTEMA DE BADGES
// ─────────────────────────────────────────────────────────────

class GamificationSystem {
    constructor() {
        this.userId = document.body.dataset.userId;
        this.userData = null;
        this.init();
    }

    async init() {
        if (!this.userId) return;

        await this.loadUserData();
        this.renderGamification();
    }

    async loadUserData() {
        try {
            const response = await fetch(`/api/usuario/${this.userId}/gamificacion`);
            this.userData = await response.json();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    renderGamification() {
        if (!this.userData) return;

        this.renderLevel();
        this.renderBadges();
        this.renderMissions();
    }

    renderLevel() {
        const levelName = document.querySelector('.level-name');
        const progressBar = document.querySelector('.level-progress-bar');
        
        if (levelName && this.userData.nivel) {
            levelName.textContent = this.userData.rango || `Level ${this.userData.nivel}`;
        }

        if (progressBar && this.userData.xp) {
            const progress = (this.userData.xp % 100);
            progressBar.style.width = `${progress}%`;
        }
    }

    renderBadges() {
        const badgesGrid = document.querySelector('.badges-grid');
        if (!badgesGrid || !this.userData.badges) return;

        badgesGrid.innerHTML = this.userData.badges.map(badge => `
            <div class="badge-item ${badge.unlocked ? '' : 'locked'}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `).join('');
    }

    renderMissions() {
        const missionsGrid = document.querySelector('.missions-grid');
        if (!missionsGrid) return;

        // Render sample missions
        const missions = [
            { icon: '🛒', title: 'Buy 5 eco products', description: 'Purchase 5 eco-friendly items', reward: '+50 XP', progress: 60 },
            { icon: '⭐', title: 'Leave 3 reviews', description: 'Review 3 products', reward: '+30 XP', progress: 33 },
            { icon: '🔄', title: 'Refer a friend', description: 'Invite a friend to join', reward: '+100 XP', progress: 0 }
        ];

        missionsGrid.innerHTML = missions.map(mission => `
            <div class="mission-card">
                <div class="mission-icon">${mission.icon}</div>
                <div class="mission-title">${mission.title}</div>
                <div class="mission-description">${mission.description}</div>
                <div class="mission-reward">${mission.reward}</div>
                <div class="mission-progress">
                    <div class="mission-progress-bar">
                        <div class="mission-progress-fill" style="width: ${mission.progress}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ─────────────────────────────────────────────────────────────
// CHECKOUT PREMIUM MULTI-STEP
// ─────────────────────────────────────────────────────────────

class PremiumCheckout {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.init();
    }

    init() {
        this.setupStepNavigation();
        this.renderCurrentStep();
    }

    setupStepNavigation() {
        const nextBtn = document.querySelector('.checkout-next');
        const prevBtn = document.querySelector('.checkout-prev');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.renderCurrentStep();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderCurrentStep();
        }
    }

    renderCurrentStep() {
        // Update step indicators
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Show current section
        document.querySelectorAll('.checkout-section').forEach((section, index) => {
            section.classList.remove('active');
            if (index + 1 === this.currentStep) {
                section.classList.add('active');
            }
        });

        // Update buttons
        const prevBtn = document.querySelector('.checkout-prev');
        const nextBtn = document.querySelector('.checkout-next');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        }

        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Place Order' : 'Next';
        }
    }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD ANALYTICS PREMIUM
// ─────────────────────────────────────────────────────────────

class AnalyticsDashboard {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadAnalytics();
        this.renderCharts();
    }

    async loadAnalytics() {
        try {
            const response = await fetch('/api/analytics/funnel');
            this.analytics = await response.json();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    renderCharts() {
        // Update analytics cards
        const cards = document.querySelectorAll('.analytics-card');
        if (cards.length > 0 && this.analytics) {
            // Update card values with real data
            cards.forEach(card => {
                const valueEl = card.querySelector('.analytics-card-value');
                if (valueEl) {
                    // Update with actual analytics data
                }
            });
        }
    }
}

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all premium features
    new LanguageSelector();
    new DarkModeToggle();
    new ScrollReveal();
    new ParallaxEffect();
    new SearchAutocomplete();
    new ChatWidget();
    new GamificationSystem();
    new PremiumCheckout();
    new AnalyticsDashboard();
});