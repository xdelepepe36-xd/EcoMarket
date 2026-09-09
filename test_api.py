import os, tempfile, sys
os.environ['DATABASE_URL'] = tempfile.mktemp(suffix='.db')
from app import app, init_db
init_db()
c = app.test_client()

r1 = c.get('/api/productos/destacados')
print(f'GET /api/productos/destacados: {r1.status_code} products={len(r1.get_json().get("products", []))}')

r2 = c.get('/api/categorias')
print(f'GET /api/categorias: {r2.status_code} categorias={r2.get_json()}')

# Also test all previously checked routes still work
routes = ['/', '/productos', '/producto/1', '/login', '/registro', '/carrito']
for r in routes:
    resp = c.get(r)
    print(f'GET {r}: {resp.status_code}')
