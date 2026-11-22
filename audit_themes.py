# Auditoria de temas: encuentra elementos con fondo claro en temas oscuros
from playwright.sync_api import sync_playwright
import json

URL = 'http://localhost:5000/'
THEMES = ['dark', 'nature', 'ocean', 'midnight', 'rose']

JS = """
() => {
    const bad = [];
    const all = document.querySelectorAll('body *');
    for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width < 30 || r.height < 20) continue;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
        const m = bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        if (!m) continue;
        const [r1,g,b] = [+m[1],+m[2],+m[3]];
        const lum = 0.2126*r1 + 0.7152*g + 0.0722*b;
        if (lum > 200) {
            bad.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className||'').toString().slice(0,60),
                id: el.id || '',
                bg,
                text: (el.textContent||'').trim().slice(0,40)
            });
            if (bad.length > 15) break;
        }
    }
    return bad;
}
"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':1440,'height':900})
    for theme in THEMES:
        pg.goto(URL)
        pg.evaluate(f"localStorage.setItem('ecomarket-theme','{theme}')")
        pg.reload()
        pg.wait_for_timeout(800)
        res = pg.evaluate(JS)
        print(f"\n=== {theme} ===")
        for x in res[:12]:
            print(f"  {x['tag']}.{x['cls'][:40]} bg={x['bg']} '{x['text'][:30]}'")
        if not res: print("  (limpio)")
    b.close()
