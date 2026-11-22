"""Descarga fotos reales únicas por categoría desde Openverse (API pública)."""
import urllib.request, urllib.parse, json, os, sqlite3, time, sys

sys.stdout.reconfigure(encoding='utf-8')

KEYWORDS = {
    'Hogar': 'eco friendly home interior',
    'Accesorios': 'eco friendly accessories',
    'Higiene': 'natural cosmetics soap',
    'Jardín': 'organic gardening plants',
    'Alimentación': 'healthy organic food',
    'Ropa': 'sustainable fashion clothing',
    'Tecnología': 'eco friendly gadgets',
    'Deportes': 'eco sports equipment',
    'Juguetes': 'eco friendly toys',
    'Arte': 'art supplies painting',
    'Mascotas': 'pet supplies dog cat',
    'Bebés': 'baby eco products',
    'Libros': 'books reading',
    'Papelería': 'stationery notebook',
    'Música': 'musical instruments',
    'Electrodomésticos': 'home appliances kitchen',
    'Herramientas': 'tools workshop',
    'Muebles': 'furniture wooden',
}
OUT = 'static/assets/photos/prod'
os.makedirs(OUT, exist_ok=True)

def api(q, page=1):
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({
        'q': q, 'page_size': 20, 'page': page, 'license_type': 'all'})
    req = urllib.request.Request(url, headers={'User-Agent': 'EcoMarket/1.0'})
    return json.loads(urllib.request.urlopen(req, timeout=20).read())

def good_url(u):
    return u and u.lower().split('?')[0].endswith(('.jpg', '.jpeg'))

con = sqlite3.connect('data/ecomarket.db'); con.row_factory = sqlite3.Row
cats = [r[0] for r in con.execute('SELECT DISTINCT categoria FROM productos')]
per_cat = {}
for cat in cats:
    kw = KEYWORDS.get(cat, cat)
    imgs = []
    try:
        d = api(kw)
        for it in d.get('results', []):
            u = it.get('url') or ''
            if good_url(u):
                imgs.append(u)
            if len(imgs) >= 20: break
    except Exception as e:
        print('API fail', cat, e)
    per_cat[cat] = imgs
    print(cat, len(imgs))
    time.sleep(1.5)

json.dump(per_cat, open('cat_photo_urls.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('urls guardadas')
