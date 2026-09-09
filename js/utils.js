/**
 * EcoMarket - Utilidades JavaScript
 * Funciones helper reutilizables
 */

// ==========================================
// Utilidades de formato
// ==========================================

/**
 * Formatea precio a moneda local
 */
function formatPrice(price, currency = 'PEN') {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(price);
}

/**
 * Formatea número con separadores de miles
 */
function formatNumber(number) {
    return new Intl.NumberFormat('es-PE').format(number);
}

/**
 * Formatea fecha relativa (hace X tiempo)
 */
function formatRelativeDate(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`;
    return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
}

/**
 * Formatea fecha completa
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('es-PE', { ...defaultOptions, ...options }).format(new Date(date));
}

/**
 * Trunca texto con ellipsis
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitaliza primera letra
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Slugify texto para URLs
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// ==========================================
// Utilidades de validación
// ==========================================

/**
 * Valida email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(email);
}

/**
 * Valida teléfono
 */
function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-()+]/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}

/**
 * Valida URL
 */
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Valida que un número esté en rango
 */
function isInRange(value, min, max) {
    return value >= min && value <= max;
}

// ==========================================
// Utilidades de almacenamiento
// ==========================================

/**
 * Guarda en localStorage con manejo de errores
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Obtiene de localStorage con manejo de errores
 */
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Elimina de localStorage
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

/**
 * Limpia todo localStorage
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}

// ==========================================
// Utilidades de DOM
// ==========================================

/**
 * Selecciona elemento con manejo de errores
 */
function $(selector) {
    return document.querySelector(selector);
}

/**
 * Selecciona múltiples elementos
 */
function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
}

/**
 * Crea elemento con atributos
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });
    
    return element;
}

/**
 * Añade clase con delay
 */
function addClassWithDelay(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.add(className);
    }, delay);
}

/**
 * Remueve clase con delay
 */
function removeClassWithDelay(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.remove(className);
    }, delay);
}

/**
 * Toggle clase
 */
function toggleClass(element, className, force) {
    return element.classList.toggle(className, force);
}

// ==========================================
// Utilidades de eventos
// ==========================================

/**
 * Event delegation
 */
function delegate(parent, selector, event, handler) {
    parent.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e);
        }
    });
}

/**
 * Throttle function
 */
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/**
 * Debounce function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Espera un tiempo específico
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// Utilidades de arrays
// ==========================================

/**
 * Elimina duplicados de array
 */
function uniqueArray(array) {
    return [...new Set(array)];
}

/**
 * Shuffle array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Chunk array en grupos
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Ordena array por propiedad
 */
function sortByProperty(array, property, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

// ==========================================
// Utilidades de objetos
// ==========================================

/**
 * Clona objeto profundamente
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objetos
 */
function mergeObjects(...objects) {
    return Object.assign({}, ...objects);
}

/**
 * Obtiene valor de objeto por path
 */
function getByPath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Establece valor en objeto por path
 */
function setByPath(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
    target[last] = value;
}

// ==========================================
// Utilidades de colores
// ==========================================

/**
 * Convierte hex a RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convierte RGB a hex
 */
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Genera color aleatorio
 */
function randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// ==========================================
// Utilidades de cookies
// ==========================================

/**
 * Establece cookie
 */
function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

/**
 * Obtiene cookie
 */
function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

/**
 * Elimina cookie
 */
function deleteCookie(name) {
    setCookie(name, '', -1);
}

// ==========================================
// Utilidades de URL
// ==========================================

/**
 * Obtiene parámetros de URL
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}

/**
 * Establece parámetro de URL
 */
function setUrlParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

/**
 * Elimina parámetro de URL
 */
function removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

// ==========================================
// Utilidades de dispositivo
// ==========================================

/**
 * Detecta si es móvil
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detecta si es tablet
 */
function isTablet() {
    return /iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth >= 768;
}

/**
 * Detecta si es desktop
 */
function isDesktop() {
    return !isMobile() && !isTablet();
}

/**
 * Obtiene tipo de dispositivo
 */
function getDeviceType() {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
}

// ==========================================
// Utilidades de notificaciones
// ==========================================

/**
 * Muestra notificación toast
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = createElement('div', {
        className: `toast toast-${type}`,
        role: 'alert'
    }, [message]);
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Solicita notificaciones del navegador
 */
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

/**
 * Muestra notificación del navegador
 */
function showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatPrice,
        formatNumber,
        formatRelativeDate,
        formatDate,
        truncateText,
        capitalize,
        slugify,
        isValidEmail,
        isValidPhone,
        isValidURL,
        isInRange,
        saveToLocalStorage,
        getFromLocalStorage,
        removeFromLocalStorage,
        clearLocalStorage,
        $,
        $$,
        createElement,
        addClassWithDelay,
        removeClassWithDelay,
        toggleClass,
        delegate,
        throttle,
        debounce,
        sleep,
        uniqueArray,
        shuffleArray,
        chunkArray,
        sortByProperty,
        deepClone,
        mergeObjects,
        getByPath,
        setByPath,
        hexToRgb,
        rgbToHex,
        randomColor,
        setCookie,
        getCookie,
        deleteCookie,
        getUrlParams,
        setUrlParam,
        removeUrlParam,
        isMobile,
        isTablet,
        isDesktop,
        getDeviceType,
        showToast,
        requestNotificationPermission,
        showBrowserNotification
    };
}