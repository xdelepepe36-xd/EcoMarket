"""Descarga fotos únicas por producto desde URLs de Openverse."""
import urllib.request, json, os, sqlite3, sys, time
sys.stdout.reconfigure(encoding='utf-8')
urls=json.load(open('cat_photo_urls.json',encoding='utf-8'))
OUT='static/assets/photos/prod'; os.makedirs(OUT,exist_ok=True)
con=sqlite3.connect('data/ecomarket.db'); con.row_factory=sqlite3.Row
prods=con.execute('SELECT id,categoria FROM productos ORDER BY id').fetchall()
idx={}
ok=fail=skip=0
for p in prods:
    pool=urls.get(p['categoria'],[])
    if not pool: skip+=1; continue
    i=idx.get(p['categoria'],0); idx[p['categoria']]=i+1
    u=pool[i%len(pool)]
    fn=f"{OUT}/prod_{p['id']}.jpg"
    if os.path.exists(fn) and os.path.getsize(fn)>8000: skip+=1; continue
    try:
        req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Referer':'https://www.flickr.com/'})
        data=urllib.request.urlopen(req,timeout=20).read()
        if len(data)<8000: fail+=1; continue
        open(fn,'wb').write(data); ok+=1
        if ok%25==0: print('descargadas',ok)
        time.sleep(0.15)
    except Exception as e:
        fail+=1
print('ok:',ok,'fail:',fail,'skip:',skip)
con.close()
