"""Auditoría visual rápida: screenshots + errores de consola en páginas clave."""
import os
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:5000'
OUT = 'audit_shots'
os.makedirs(OUT, exist_ok=True)

PAGES = ['/', '/productos', '/login', '/registro', '/carrito']

def shoot(page, name, width, height):
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_viewport_size({'width': width, 'height': height})
    page.goto(BASE + name, wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(800)
    fname = f"{OUT}/{name.strip('/') or 'home'}_{width}.png".replace('/', '_')
    page.screenshot(path=fname, full_page=False)
    return errors

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h, tag in [(1366, 768, 'desktop'), (390, 844, 'mobile')]:
        ctx = browser.new_context(viewport={'width': w, 'height': h})
        page = ctx.new_page()
        for path in PAGES:
            errs = shoot(page, path, w, h)
            print(f"[{tag}] {path}: console_errors={len(errs)}")
            for e in errs[:5]:
                print('   -', e[:160])
        ctx.close()
    browser.close()
print('Screenshots en', OUT)
