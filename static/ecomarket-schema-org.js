/**
 * EcoMarket - Schema.org JSON-LD Generator
 * Genera metadatos estructurados para SEO
 */

const EcoMarketSchema = {
    /**
     * Genera JSON-LD para la organización
     */
    generateOrganization: function() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "EcoMarket",
            "url": "https://ecomarket.onrender.com",
            "logo": "https://ecomarket.onrender.com/static/assets/logo.png",
            "description": "Marketplace ecológico donde puedes comprar, vender y dar una segunda vida a productos sostenibles y reciclados.",
            "sameAs": [
                "https://facebook.com/ecomarket",
                "https://twitter.com/ecomarket",
                "https://instagram.com/ecomarket"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+51-999-888-777",
                "contactType": "customer service",
                "email": "hola@ecomarket.com",
                "availableLanguage": ["Spanish", "English"]
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Principal 123",
                "addressLocality": "Lima",
                "addressRegion": "Lima",
                "postalCode": "LIMA01",
                "addressCountry": "PE"
            }
        };
    },

    /**
     * Genera JSON-LD para WebSite
     */
    generateWebSite: function() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "EcoMarket",
            "url": "https://ecomarket.onrender.com",
            "description": "Marketplace ecológico - Compra y vende productos sostenibles",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ecomarket.onrender.com/productos?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };
    },

    /**
     * Genera JSON-LD para un producto
     */
    generateProduct: function(producto) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": producto.nombre,
            "description": producto.descripcion,
            "image": producto.imagen,
            "url": `https://ecomarket.onrender.com/producto/${producto.id}`,
            "sku": producto.id.toString(),
            "offers": {
                "@type": "Offer",
                "price": producto.precio,
                "priceCurrency": "PEN",
                "availability": producto.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": "EcoMarket"
                }
            },
            "category": producto.categoria,
            "aggregateRating": producto.promedio_calificacion ? {
                "@type": "AggregateRating",
                "ratingValue": producto.promedio_calificacion,
                "reviewCount": producto.total_resenas || 0
            } : undefined,
            "ecoScore": producto.eco_score ? {
                "@type": "Rating",
                "ratingValue": producto.eco_score,
                "bestRating": "10",
                "worstRating": "1"
            } : undefined
        };
    },

    /**
     * Genera JSON-LD para lista de productos
     */
    generateProductList: function(productos) {
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": productos.map((producto, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Product",
                    "name": producto.nombre,
                    "url": `https://ecomarket.onrender.com/producto/${producto.id}`,
                    "image": producto.imagen,
                    "offers": {
                        "@type": "Offer",
                        "price": producto.precio,
                        "priceCurrency": "PEN"
                    }
                }
            }))
        };
    },

    /**
     * Genera JSON-LD para BreadcrumbList
     */
    generateBreadcrumbList: function(breadcrumbs) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": crumb.url
            }))
        };
    },

    /**
     * Genera JSON-LD para Reseña
     */
    generateReview: function(review) {
        return {
            "@context": "https://schema.org",
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": review.usuario_nombre
            },
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.calificacion,
                "bestRating": "5",
                "worstRating": "1"
            },
            "reviewBody": review.comentario,
            "datePublished": review.fecha
        };
    },

    /**
     * Genera JSON-LD para FAQPage
     */
    generateFAQPage: function(preguntas) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": preguntas.map(pregunta => ({
                "@type": "Question",
                "name": pregunta.pregunta,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": pregunta.respuesta
                }
            }))
        };
    },

    /**
     * Genera JSON-LD para LocalBusiness
     */
    generateLocalBusiness: function() {
        return {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "EcoMarket",
            "image": "https://ecomarket.onrender.com/static/assets/logo.png",
            "telephone": "+51-999-888-777",
            "email": "hola@ecomarket.com",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Principal 123",
                "addressLocality": "Lima",
                "addressRegion": "Lima",
                "postalCode": "LIMA01",
                "addressCountry": "PE"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-12.0464",
                "longitude": "-77.0428"
            },
            "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ],
                "opens": "09:00",
                "closes": "18:00"
            },
            "priceRange": "$$"
        };
    },

    /**
     * Inserta JSON-LD en el DOM
     */
    insertJSONLD: function(schema) {
        // Eliminar schema anterior si existe
        const existing = document.getElementById('schema-jsonld');
        if (existing) {
            existing.remove();
        }

        // Crear script
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'schema-jsonld';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    },

    /**
     * Inicializa Schema.org en la página actual
     */
    init: function() {
        // WebSite schema (todas las páginas)
        this.insertJSONLD(this.generateWebSite());

        // Organization schema (homepage)
        if (window.location.pathname === '/' || window.location.pathname === '/index') {
            this.insertJSONLD(this.generateOrganization());
            this.insertJSONLD(this.generateLocalBusiness());
        }

        // Product schema (página de producto)
        const productoElement = document.querySelector('[data-producto]');
        if (productoElement) {
            const producto = JSON.parse(productoElement.dataset.producto);
            this.insertJSONLD(this.generateProduct(producto));
        }

        // ProductList schema (página de productos)
        const productosElement = document.querySelector('[data-productos]');
        if (productosElement) {
            const productos = JSON.parse(productosElement.dataset.productos);
            this.insertJSONLD(this.generateProductList(productos));
        }

        // Breadcrumb schema
        const breadcrumbsElement = document.querySelector('[data-breadcrumbs]');
        if (breadcrumbsElement) {
            const breadcrumbs = JSON.parse(breadcrumbsElement.dataset.breadcrumbs);
            this.insertJSONLD(this.generateBreadcrumbList(breadcrumbs));
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoMarketSchema.init());
} else {
    EcoMarketSchema.init();
}
