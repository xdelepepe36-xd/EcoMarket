/**
 * Tests para utilidades JavaScript
 */

// Mock del DOM para tests
class MockElement {
    constructor(tag = 'div') {
        this.tagName = tag;
        this.id = '';
        this.className = '';
        this.attributes = {};
        this.children = [];
        this.textContent = '';
        this.style = {};
        this.parentNode = null;
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
    }

    classList = {
        add: (cls) => { this.className += ` ${cls}`; },
        remove: (cls) => { this.className = this.className.replace(cls, ''); },
        contains: (cls) => this.className.includes(cls),
        toggle: (cls) => { 
            if (this.className.includes(cls)) {
                this.className = this.className.replace(cls, '');
                return false;
            } else {
                this.className += ` ${cls}`;
                return true;
            }
        }
    };
}

// Mock localStorage
const mockLocalStorage = {
    storage: {},
    getItem: function(key) {
        return this.storage[key] || null;
    },
    setItem: function(key, value) {
        this.storage[key] = value;
    },
    removeItem: function(key) {
        delete this.storage[key];
    },
    clear: function() {
        this.storage = {};
    }
};

// ==========================================
// Test Suite
// ==========================================
class TestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('🧪 Running tests...\n');

        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.log(`❌ ${test.name}`);
                console.log(`   ${error.message}`);
            }
        }

        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertTrue(value, message = '') {
        if (!value) {
            throw new Error(message || `Expected true, got ${value}`);
        }
    }

    assertFalse(value, message = '') {
        if (value) {
            throw new Error(message || `Expected false, got ${value}`);
        }
    }
}

// ==========================================
// Tests de utilidades
// ==========================================
const suite = new TestSuite();

// Test formatPrice
suite.test('formatPrice should format currency correctly', () => {
    const result = formatPrice(1234.56);
    suite.assertTrue(result.includes('1,234.56'), 'Should include formatted number');
});

// Test formatNumber
suite.test('formatNumber should format with separators', () => {
    const result = formatNumber(1234567);
    suite.assertEqual(result, '1,234,567', 'Should format with thousand separators');
});

// Test isValidEmail
suite.test('isValidEmail should validate email addresses', () => {
    suite.assertTrue(isValidEmail('test@example.com'), 'Valid email should pass');
    suite.assertFalse(isValidEmail('invalid'), 'Invalid email should fail');
    suite.assertFalse(isValidEmail('test@'), 'Incomplete email should fail');
});

// Test isValidPhone
suite.test('isValidPhone should validate phone numbers', () => {
    suite.assertTrue(isValidPhone('1234567890'), 'Valid phone should pass');
    suite.assertTrue(isValidPhone('+51 123 456 7890'), 'Phone with separators should pass');
    suite.assertFalse(isValidPhone('123'), 'Too short phone should fail');
});

// Test truncateText
suite.test('truncateText should truncate long text', () => {
    const result = truncateText('This is a very long text that should be truncated', 20);
    suite.assertTrue(result.length <= 23, 'Should be truncated with ellipsis');
    suite.assertTrue(result.includes('...'), 'Should include ellipsis');
});

// Test capitalize
suite.test('capitalize should capitalize first letter', () => {
    suite.assertEqual(capitalize('hello'), 'Hello', 'Should capitalize first letter');
    suite.assertEqual(capitalize('HELLO'), 'Hello', 'Should lowercase rest');
});

// Test slugify
suite.test('slugify should convert text to slug', () => {
    suite.assertEqual(slugify('Hello World'), 'hello-world', 'Should replace spaces with hyphens');
    suite.assertEqual(slugify('¡Hola!'), 'hola', 'Should remove special characters');
});

// Test localStorage functions
suite.test('saveToLocalStorage should save data', () => {
    const data = { test: 'value' };
    const result = saveToLocalStorage('test_key', data);
    suite.assertTrue(result, 'Should return true on success');
    suite.assertEqual(mockLocalStorage.getItem('test_key'), JSON.stringify(data), 'Should save correctly');
});

suite.test('getFromLocalStorage should retrieve data', () => {
    mockLocalStorage.setItem('test_key', JSON.stringify({ test: 'value' }));
    const result = getFromLocalStorage('test_key');
    suite.assertEqual(result.test, 'value', 'Should retrieve parsed data');
});

suite.test('removeFromLocalStorage should remove data', () => {
    mockLocalStorage.setItem('test_key', 'value');
    removeFromLocalStorage('test_key');
    suite.assertEqual(mockLocalStorage.getItem('test_key'), null, 'Should remove data');
});

// Test array utilities
suite.test('uniqueArray should remove duplicates', () => {
    const result = uniqueArray([1, 2, 2, 3, 3, 3]);
    suite.assertEqual(result.length, 3, 'Should remove duplicates');
});

suite.test('shuffleArray should shuffle array', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    suite.assertTrue(result.length === original.length, 'Should maintain length');
    suite.assertTrue(JSON.stringify(result) !== JSON.stringify(original), 'Should change order');
});

suite.test('chunkArray should split array', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2);
    suite.assertEqual(result.length, 3, 'Should create correct number of chunks');
    suite.assertEqual(result[0].length, 2, 'First chunk should have 2 items');
});

suite.test('sortByProperty should sort by property', () => {
    const data = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
    ];
    const result = sortByProperty(data, 'age');
    suite.assertEqual(result[0].age, 25, 'Should sort by age ascending');
});

// Test object utilities
suite.test('deepClone should create deep copy', () => {
    const original = { a: 1, b: { c: 2 } };
    const clone = deepClone(original);
    clone.b.c = 3;
    suite.assertEqual(original.b.c, 2, 'Original should not be affected');
});

suite.test('mergeObjects should merge objects', () => {
    const result = mergeObjects({ a: 1 }, { b: 2 });
    suite.assertEqual(result.a, 1, 'Should include first object properties');
    suite.assertEqual(result.b, 2, 'Should include second object properties');
});

// Test color utilities
suite.test('hexToRgb should convert hex to RGB', () => {
    const result = hexToRgb('#ff0000');
    suite.assertEqual(result.r, 255, 'Should convert red component');
    suite.assertEqual(result.g, 0, 'Should convert green component');
    suite.assertEqual(result.b, 0, 'Should convert blue component');
});

suite.test('rgbToHex should convert RGB to hex', () => {
    const result = rgbToHex(255, 0, 0);
    suite.assertEqual(result, '#ff0000', 'Should convert to hex');
});

suite.test('randomColor should generate valid hex color', () => {
    const result = randomColor();
    suite.assertTrue(result.startsWith('#'), 'Should start with #');
    suite.assertEqual(result.length, 7, 'Should be 7 characters long');
});

// Test device utilities
suite.test('isMobile should detect mobile', () => {
    // Mock user agent
    const originalUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
    });
    
    const result = isMobile();
    suite.assertTrue(result, 'Should detect iPhone as mobile');
    
    // Restore
    Object.defineProperty(navigator, 'userAgent', {
        value: originalUA,
        configurable: true
    });
});

// Test throttle
suite.test('throttle should limit function calls', () => {
    let callCount = 0;
    const throttledFn = throttle(() => { callCount++; }, 100);
    
    throttledFn();
    throttledFn();
    throttledFn();
    
    suite.assertEqual(callCount, 1, 'Should only call once within throttle period');
});

// Test debounce
suite.test('debounce should delay function calls', () => {
    let callCount = 0;
    const debouncedFn = debounce(() => { callCount++; }, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    suite.assertEqual(callCount, 0, 'Should not call immediately');
});

// ==========================================
// Funciones a testear (deben estar importadas)
// ==========================================
// Estas funciones asumen que están disponibles en el entorno
// En un caso real, se importarían desde utils.js

function formatPrice(price) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(price);
}

function formatNumber(number) {
    return new Intl.NumberFormat('es-PE').format(number);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-()+]/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}

function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

function saveToLocalStorage(key, value) {
    try {
        mockLocalStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = mockLocalStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        mockLocalStorage.removeItem(key);
        return true;
    } catch (error) {
        return false;
    }
}

function uniqueArray(array) {
    return [...new Set(array)];
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function sortByProperty(array, property, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function mergeObjects(...objects) {
    return Object.assign({}, ...objects);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ==========================================
// Ejecutar tests
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, suite };
} else {
    suite.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}