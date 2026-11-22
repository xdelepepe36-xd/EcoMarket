"""Busca imagen específica por producto (nombre traducido) en Openverse."""
import urllib.request, urllib.parse, json, os, sqlite3, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from es_en_map import ES_EN, GENERIC

CAT_EN = {
 'Hogar':'home','Accesorios':'accessories','Higiene':'hygiene','Jardín':'garden',
 'Alimentación':'food','Ropa':'clothing','Tecnología':'tech','Deportes':'sports',
 'Juguetes':'toys','Arte':'art','Mascotas':'pets','Bebés':'baby','Libros':'books',
 'Papelería':'stationery','Música':'music','Electrodomésticos':'appliances',
 'Herramientas':'tools','Muebles':'furniture'}

OUT='static/assets/photos/prod'; os.makedirs(OUT,exist_ok=True)
HDR={'User-Agent':'EcoMarket/1.0 (research)'}
DL_HDR={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Referer':'https://www.flickr.com/'}

def api(q):
    url='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'page_size':4,'license_type':'all'})
    return json.loads(urllib.request.urlopen(urllib.request.Request(url,headers=HDR),timeout=20).read())

con=sqlite3.connect('data/ecomarket.db'); con.row_factory=sqlite3.Row
prods=con.execute('SELECT id,nombre,categoria FROM productos ORDER BY id').fetchall()
ok=fail=keep=0
for n,p in enumerate(prods):
    fn=f'{OUT}/prod_{p["id"]}.jpg'
    first=(p['nombre'].split() or [''])[0].lower().strip('.,')
    en=ES_EN.get(first)
    if not en:
        keep+=1; continue
    q=en if en not in GENERIC else f"{en} {CAT_EN.get(p['categoria'],'')}"
    try:
        d=api(q)
        url=None
        for r in d.get('results',[]):
            u=r.get('url') or ''
            if u.lower().split('?')[0].endswith(('.jpg','.jpeg')) and 'logo' not in (r.get('title') or '').lower():
                url=u; break
        if not url: keep+=1; continue
        data=urllib.request.urlopen(urllib.request.Request(url,headers=DL_HDR),timeout=20).read()
        if len(data)<8000: keep+=1; continue
        open(fn,'wb').write(data); ok+=1
        if ok%20==0: print('ok',ok,'/',n+1)
        time.sleep(0.35)
    except Exception as e:
        keep+=1
        time.sleep(1.0)
print('reemplazadas:',ok,'conservadas:',keep)
con.close()
