import os, sys

filepath = 'static/eco-reviews-advanced.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find destroy() method and everything after the class closing brace
destroy_idx = content.find("destroy() {")
# Find the end of destroy() method body
destroy_end_marker = "    }\n}"
# Find the class closing brace (the } after destroy's closing })
class_end = content.find("}\n}", destroy_idx)

# Keep everything up to and including the class closing brace
before = content[:class_end + 1]

after = """

window.EcoReviews = EcoReviews;
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Buscar contenedores de reviews
    const reviewContainers = document.querySelectorAll('[data-eco-reviews]');
    reviewContainers.forEach(container => {
        if (window.EcoReviews) {
            new window.EcoReviews({
                ...container.dataset
            });
        }
    });
});
"""

new_content = before + after
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Fixed eco-reviews-advanced.js")
