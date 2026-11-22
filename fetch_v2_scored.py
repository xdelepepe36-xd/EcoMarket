"""Re-busca imagenes por producto usando el nombre COMPLETO traducido
 y elige el resultado cuya metadata (titulo/tags) mas coincide con el producto."""
import urllib.request, urllib.parse, json, os, sqlite3, sys, time, io, re, site
sys.stdout.reconfigure(encoding='utf-8')
# el shim local PIL/ del repo hace shadow a Pillow real; anteponer site-packages
for _p in reversed(site.getsitepackages()):
    sys.path.insert(0, _p)
import PIL  # noqa
assert 'site-packages' in PIL.__file__, PIL.__file__
from es_en_map import ES_EN, GENERIC

CAT_EN = {
 'Hogar':'home','Accesorios':'accessories','Higiene':'hygiene','Jardín':'garden','Jardín ':'garden',
 'Alimentación':'food','Ropa':'clothing','Tecnología':'tech','Deportes':'sports',
 'Juguetes':'toys','Arte':'art','Mascotas':'pets','Bebés':'baby','Libros':'books',
 'Papelería':'stationery','Música':'music','Electrodomésticos':'appliances',
 'Herramientas':'tools','Muebles':'furniture'}

OUT = 'static/assets/photos/prod'
HDR = {'User-Agent': 'EcoMarket/1.0 (research)'}
DL_HDR = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://www.flickr.com/'}

STOP = {'de','del','la','el','en','con','para','por','y','a','al','natural','naturales',
        'ecologico','ecologica','eco','premium','pack','set','kit','x','un','una','the'}

def tokens_en(nombre):
    out = []
    for w in re.split(r'[^\wáéíóúñü]+', nombre.lower()):
        w = w.strip()
        if not w or w in STOP or w in GENERIC:
            continue
        en = ES_EN.get(w)
        if en:
            out.append(en)
    return out

def api(q):
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode(
        {'q': q, 'page_size': 15, 'license_type': 'all'})
    last = None
    for attempt in range(4):
        try:
            return json.loads(urllib.request.urlopen(
                urllib.request.Request(url, headers=HDR), timeout=25).read())
        except Exception as e:
            last = e
            time.sleep(2 + attempt * 3)
    raise last

def meta_text(r):
    tags = r.get('tags') or []
    tag_names = []
    for t in tags:
        if isinstance(t, dict):
            tag_names.append(str(t.get('name') or t.get('title') or ''))
        else:
            tag_names.append(str(t))
    parts = [r.get('title') or '', ' '.join(tag_names),
             (r.get('creator') or '')]
    return ' '.join(parts).lower()

def score(r, kws, cat_en):
    t = meta_text(r)
    s = 0
    for k in kws:
        kk = k.lower()
        # frase completa o palabra clave contenido
        if kk in t:
            s += 3 if ' ' in kk else 1
    if cat_en and cat_en in t:
        s += 1
    return s

def lum(im):
    from PIL import Image
    s = im.convert('RGB').resize((40, 40))
    px = list(s.getdata())
    return sum(0.299*c[0] + 0.587*c[1] + 0.114*c[2] for c in px) / len(px)

def brighten(im):
    from PIL import Image, ImageEnhance, ImageOps
    if lum(im) >= 110:
        return im
    im = ImageEnhance.Brightness(im).enhance(1.35)
    im = ImageEnhance.Color(im).enhance(1.1)
    return ImageOps.autocontrast(im, cutoff=1)

con = sqlite3.connect('data/ecomarket.db'); con.row_factory = sqlite3.Row
prods = con.execute('SELECT id,nombre,categoria FROM productos ORDER BY id').fetchall()

replaced = kept = noscore = errors = 0
for i, p in enumerate(prods):
    kws = tokens_en(p['nombre'])
    if not kws:
        kept += 1; continue
    cat_en = CAT_EN.get((p['categoria'] or '').strip(), '')
    q = ' '.join(kws[:4])
    try:
        results = api(q).get('results', [])
    except Exception as e:
        errors += 1; print('api err', p['id'], e); time.sleep(1); continue
    # elegir el candidato con mejor puntaje de metadata
    cands = []
    for r in results:
        u = r.get('url') or ''
        if not u.lower().split('?')[0].endswith(('.jpg', '.jpeg')):
            continue
        sc = score(r, kws, cat_en)
        if sc > 0:
            cands.append((sc, u, r))
    cands.sort(key=lambda x: -x[0])
    done = False
    last_err = ''
    for sc, u, r in cands[:3]:
        try:
            data = urllib.request.urlopen(
                urllib.request.Request(u, headers=DL_HDR), timeout=15).read()
            if len(data) < 8000:
                last_err = 'img pequeña'; continue
            from PIL import Image
            import io as _io
            im = Image.open(_io.BytesIO(data)).convert('RGB')
            if im.width < 300:
                last_err = 'img angosta'; continue
            im = brighten(im)
            im.thumbnail((1024, 1024))
            fn = f'{OUT}/prod_{p["id"]}.jpg'
            im.save(fn, 'JPEG', quality=88)
            replaced += 1
            print(f'  #{p["id"]} {p["nombre"][:30]} -> score {sc} lum ok', flush=True)
            done = True
            break
        except Exception as e:
            last_err = f'{type(e).__name__} {str(e)[:50]}'
            continue
    if not done:
        if not cands:
            noscore += 1
            print(f'  #{p["id"]} {p["nombre"][:30]} -> sin candidato', flush=True)
        else:
            kept += 1
            print(f'  #{p["id"]} {p["nombre"][:30]} -> falló: {last_err}', flush=True)
    if (i + 1) % 10 == 0 or i < 3:
        print(f'{i+1}/{len(prods)} reempl:{replaced} keep:{kept} noscore:{noscore} err:{errors}', flush=True)
    time.sleep(0.2)

print('LISTO reempl:', replaced, 'keep:', kept, 'noscore:', noscore, 'err:', errors)
con.close()
