import sys
sys.stdout.reconfigure(encoding="utf-8")
from playwright.sync_api import sync_playwright

URL = "https://chatgpt.com/s/m_6b0269aedc6c8191a74461bcf0ec9825"
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto(URL, wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(8000)
    for i in range(8):
        pg.mouse.wheel(0, 2500)
        pg.wait_for_timeout(900)
    txt = pg.evaluate("() => document.body.innerText")
    with open("chatgpt_share.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    print("chars:", len(txt))
    # screenshots de la pagina completa por si hay imagenes del diseno
    pg.screenshot(path="chatgpt_share.png", full_page=True)
    imgs = pg.evaluate("() => [...document.querySelectorAll('img')].map(i => i.src).filter(s => s && !s.includes('avatar') && !s.includes('oaiusercontent'))")
    print("external imgs:", imgs[:10])
    # artifacts/canvas
    frames = pg.evaluate("() => [...document.querySelectorAll('iframe')].map(f => f.src)")
    print("iframes:", frames)
    b.close()
