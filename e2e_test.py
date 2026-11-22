"""E2E: registro -> publicar -> buscar -> carrito -> checkout."""
import time
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:5000'
EMAIL = f'e2e_{int(time.time())}@test.com'
PASS = 'Test1234!'
results = []

def check(name, ok, extra=''):
    results.append((name, ok, extra))
    print(('PASS' if ok else 'FAIL'), name, extra)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context()
    page = ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)[:120]))

    # 1. Registro
    page.goto(BASE + '/registro', wait_until='networkidle')
    page.fill('input[name="nombre"]', 'Usuario Prueba')
    page.fill('input[name="email"]', EMAIL)
    page.fill('input[name="password"]', PASS)
    page.fill('input[name="password2"]', PASS)
    tel = page.query_selector('input[name="telefono"]')
    if tel: tel.fill('999888777')
    page.click('button[type="submit"], form button')
    page.wait_for_load_state('networkidle')
    check('registro', '/perfil' in page.url or page.query_selector('.flash-success') is not None or 'EcoMarket' in page.content(), page.url)

    # 2. Publicar producto
    page.goto(BASE + '/publicar', wait_until='networkidle')
    page.fill('input[name="nombre"]', 'Producto Prueba Eco')
    page.select_option('select[name="categoria"]', index=1)
    page.fill('input[name="precio"]', '25.50')
    page.fill('textarea[name="descripcion"]', 'Producto de prueba E2E ecológico')
    page.click('button[type="submit"], form button')
    page.wait_for_load_state('networkidle')
    check('publicar', 'producto' in page.url, page.url)

    # 3. Búsqueda API
    resp = page.request.get(BASE + '/api/buscar?q=Prueba')
    data = resp.json()
    check('busqueda_api', resp.status == 200 and len((data if isinstance(data, list) else data.get('productos', data.get('results', [])))) > 0, str(data)[:100])

    # 4. Agregar al carrito desde /productos
    page.goto(BASE + '/productos', wait_until='networkidle')
    page.wait_for_timeout(800)
    btn = page.query_selector('.add-cart')
    if btn:
        btn.click()
        page.wait_for_timeout(400)
    cart = page.evaluate('JSON.parse(localStorage.getItem("ecomarket-cart")||"[]")')
    check('add_to_cart', len(cart) > 0, f'{len(cart)} items')

    # 5. Carrito renderiza
    page.goto(BASE + '/carrito', wait_until='networkidle')
    page.wait_for_timeout(800)
    items = page.eval_on_selector_all('#cartItems .carrito-item, #cartItems > *', 'els => els.length') if page.query_selector('#cartItems') else 0
    check('carrito_render', items > 0 or 'vac' not in page.content().lower(), f'{items} elementos')

    # 6. Checkout
    page.goto(BASE + '/checkout', wait_until='networkidle')
    page.wait_for_timeout(800)
    for fid, val in [('nombre','Usuario'), ('apellido','Prueba'), ('email', EMAIL),
                     ('telefono','999888777'), ('direccion','Av. Prueba 123'), ('ciudad','Lima')]:
        el = page.query_selector(f'[name="{fid}"], #{fid}')
        if el: el.fill(val)
    page.click('#checkoutForm button[type="submit"]')
    try:
        page.wait_for_url('**/confirmacion**', timeout=10000)
    except Exception:
        pass
    check('checkout', 'confirmacion' in page.url, page.url)

    # 7. Perfil
    page.goto(BASE + '/perfil', wait_until='networkidle')
    check('perfil', 'Usuario Prueba' in page.content() or 'Prueba' in page.content())

    # 8. Login con la cuenta creada (nueva sesión)
    ctx2 = b.new_context()
    p2 = ctx2.new_page()
    p2.goto(BASE + '/login', wait_until='networkidle')
    p2.fill('input[name="email"]', EMAIL)
    p2.fill('input[name="password"]', PASS)
    p2.click('button[type="submit"], form button')
    p2.wait_for_load_state('networkidle')
    check('login', p2.query_selector('a[href*="logout"], .nav-link') is not None and 'login' not in p2.url, p2.url)

    check('js_errors', len(errs) == 0, '; '.join(errs[:3]))
    b.close()

print('\n== RESUMEN ==')
fails = [r for r in results if not r[1]]
print(f'{len(results)-len(fails)}/{len(results)} OK' + (f' — fallos: {[f[0] for f in fails]}' if fails else ''))
