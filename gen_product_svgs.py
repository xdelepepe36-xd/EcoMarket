# -*- coding: utf-8 -*-
"""Genera SVG ilustrados únicos por producto (emoji por keyword + gradiente por categoría)."""
import sqlite3, os, re, html

DB = 'data/ecomarket.db'
OUT = 'static/assets/cats/prod'
os.makedirs(OUT, exist_ok=True)

GRADS = {
    'Hogar': ('#A1887F','#4E342E'), 'Accesorios': ('#F48FB1','#AD1457'),
    'Higiene': ('#80DEEA','#00838F'), 'Jardín': ('#81C784','#2E7D32'),
    'Alimentación': ('#FFAB91','#BF360C'), 'Ropa': ('#CE93D8','#6A1B9A'),
    'Tecnología': ('#90CAF9','#1565C0'), 'Bebés': ('#FFF59D','#F57F17'),
    'Juguetes': ('#FFCC80','#E65100'), 'Mascotas': ('#BCAAA4','#4E342E'),
    'Muebles': ('#D7CCC8','#5D4037'), 'Música': ('#F48FB1','#880E4F'),
    'Papelería': ('#A5D6A7','#1B5E20'), 'Deportes': ('#80CBC4','#004D40'),
    'Arte': ('#E1BEE7','#6A1B9A'), 'Electrodomésticos': ('#B0BEC5','#263238'),
    'Herramientas': ('#BDBDBD','#424242'),
}
DEFAULT_GRAD = ('#66BB6A', '#14532D')

KEYWORDS = [
    ('champu|shampoo|jabón|jabon|gel|crema|loción|locion|higiene|cepillo|pasta dental', '🧴'),
    ('camiseta|camisa|pantalón|pantalon|vestido|ropa|jean|chaqueta|buzo|short', '👕'),
    ('silla|mesa|escritorio|sofá|cama|mueble|estante|repisa', '🪑'),
    ('juguete|pelota|muñeco|muneco|lego|juego|rompecabezas', '🧸'),
    ('mascota|perro|gato|collar|correa|arena|pecera', '🐾'),
    ('libro|cuaderno|lapicero|lápiz|lapiz|papelería|papeleria|pluma|marcador|mochila', '📚'),
    ('instrumento|guitarra|teclado|batería|bateria|micrófono|microfono|auricular', '🎸'),
    ('pelota|deporte|bicicleta|manubrio|pesas|yoga|gym|fútbol|futbol', '⚽'),
    ('comida|alimento|café|cafe|té|te |pan |fruta|verdura|organico|orgánico|snack|galleta', '🥗'),
    ('planta|jardín|jardin|maceta|semilla|flor|suculenta|terraza', '🌱'),
    ('smartphone|celular|laptop|computadora|tablet|auricular|cargador|teclado|mouse|monitor|parlante|televisor', '📱'),
    ('cámara|camara|foto|selfie|dron', '📷'),
    ('música|musica|vinilo|cd|spotify', '🎵'),
    ('pintura|lienzo|acuarela|pincel|manualidades|arte|draw', '🎨'),
    ('herramienta|taladro|destornillador|martillo|tornillo|clavo|tubo|pintura pared', '🔧'),
    ('electrodoméstico|electrodomestico|licuadora|batidora|tostadora|plancha|ventilador|horno|microondas|refrigerador', '🔌'),
    ('bebe|bebé|pañal|panal|biberón|biberon|arrullo|mameluco', '🍼'),
    ('accesorio|collar|pulsera|anillo|aretes|bolso|cartera|gafas|reloj|mochila', '👜'),
    ('botella|termo|taza|vaso|cuchillo|tabla|ollas|sartén|sarten|olla', '🍳'),
]

def emoji_for(nombre):
    n = nombre.lower()
    for pat, em in KEYWORDS:
        if re.search(pat, n):
            return em
    return '🌿'

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT id, nombre, categoria, imagen FROM productos WHERE imagen LIKE '/static/assets/cats/%'").fetchall()
count = 0
for p in rows:
    cat = p['categoria'] or ''
    g1, g2 = GRADS.get(cat, DEFAULT_GRAD)
    em = emoji_for(p['nombre'])
    fname = f"prod_{p['id']}.svg"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="{g1}"/><stop offset="100%" stop-color="{g2}"/></linearGradient>
<radialGradient id="r" cx="0.7" cy="0.25" r="0.9">
<stop offset="0%" stop-color="rgba(255,255,255,.18)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#g)"/>
<rect width="400" height="300" fill="url(#r)"/>
<circle cx="340" cy="50" r="80" fill="rgba(255,255,255,.08)"/>
<circle cx="50" cy="260" r="100" fill="rgba(0,0,0,.08)"/>
<text x="200" y="185" font-size="110" text-anchor="middle">{em}</text>
<text x="200" y="262" font-family="Poppins,Arial,sans-serif" font-size="24" font-weight="700" fill="rgba(255,255,255,.9)" text-anchor="middle">{html.escape(p['nombre'][:28])}</text>
</svg>'''
    with open(os.path.join(OUT, fname), 'w', encoding='utf-8') as f:
        f.write(svg)
    conn.execute('UPDATE productos SET imagen = ? WHERE id = ?', (f'/static/assets/cats/prod/{fname}', p['id']))
    count += 1
conn.commit()
conn.close()
print(f'{count} productos con imagen ilustrada única')
