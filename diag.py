from playwright.sync_api import sync_playwright
import time

p = sync_playwright().start()

browser = p.chromium.launch(headless=True)
page = browser.new_page()

page_errors = []

def handle_console(msg):
    if msg.type in ('error', 'warning'):
        page_errors.append((msg.type, msg.text))

def handle_pageerror(exc):
    stack = getattr(exc, 'stack', str(exc))
    page_errors.append(('pageerror', stack))

page.on('console', handle_console)
page.on('pageerror', handle_pageerror)

resp = page.goto('http://127.0.0.1:5560/', timeout=15000)
time.sleep(1)

print(f'GET /: HTTP {resp.status}')
# Count by type
from collections import Counter
type_counts = Counter(typ for typ, _ in page_errors)
print(f'Error type counts: {dict(type_counts)}')
print(f'Total: {len(page_errors)}')

# Show all unique errors
seen = set()
print('\n=== All unique errors ===')
for typ, text in page_errors:
    key = (typ, text[:100])
    if key in seen:
        continue
    seen.add(key)
    print(f'[{typ}] {text[:200]}')

browser.close()
p.stop()

all_errors = []
for path in pages:
    page = browser.new_page()
    page_errors = []
    resource_404 = []

    def handle_console(msg):
        if msg.type in ('error', 'warning'):
            page_errors.append((msg.type, msg.text))

    def handle_pageerror(exc):
        stack = getattr(exc, 'stack', str(exc))
        page_errors.append(('pageerror', stack))

    page.on('console', handle_console)
    page.on('pageerror', handle_pageerror)
    page.on('response', lambda r: resource_404.append(r.url) if r.status == 404 and r.request.resource_type == 'script' else None)

    try:
        resp = page.goto('http://127.0.0.1:5559' + path, timeout=15000)
        time.sleep(0.5)
        print(f'GET {path}: HTTP {resp.status}  errors={len(page_errors)}  404_scripts={len(resource_404)}')
        for typ, text in page_errors:
            all_errors.append((path, typ, text))
        for url in resource_404:
            all_errors.append((path, '404_script', url))
    except Exception as e:
        print(f'GET {path}: EXCEPTION -> {e}')
    page.close()

print(f'\n=== Unique errors ({len(all_errors)}) ===')
seen = set()
for path, typ, text in all_errors:
    key = (typ, text[:120])
    if key in seen:
        continue
    seen.add(key)
    print(f'[{typ}] {path}: {text[:300]}')

browser.close()
p.stop()

page = browser.new_page()
page_errors = []
resource_errors = []

def handle_console(msg):
    if msg.type in ('error', 'warning'):
        page_errors.append((msg.type, msg.text))

def handle_pageerror(exc):
    stack = getattr(exc, 'stack', str(exc))
    page_errors.append(('pageerror', stack))

page.on('console', handle_console)
page.on('pageerror', handle_pageerror)
page.on('response', lambda r: resource_errors.append(('response', r.url, r.status)) if r.status == 404 else None)

resp = page.goto('http://127.0.0.1:5558/producto/1', timeout=15000)
time.sleep(1)

print(f'GET /producto/1: HTTP {resp.status}')
print(f'\n=== Page errors ({len(page_errors)}) ===')
seen = set()
for typ, text in page_errors:
    key = text[:80]
    if key in seen:
        continue
    seen.add(key)
    print(f'[{typ}] {text[:500]}')
    print()

print(f'\n=== 404 resources ({len(resource_errors)}) ===')
for typ, url, status in resource_errors:
    print(f'[{typ}] {url} (status {status})')

browser.close()
p.stop()

all_errors = []
for path in pages:
    page = browser.new_page()
    page_errors = []
    page.on('console', lambda msg: page_errors.append((msg.type, msg.text)) if msg.type in ('error', 'warning') else None)
    page.on('pageerror', lambda exc: page_errors.append(('pageerror', str(exc))))

    try:
        resp = page.goto('http://127.0.0.1:5558' + path, timeout=15000)
        print(f'GET {path}: HTTP {resp.status}  errors={len(page_errors)}')
        for typ, text in page_errors:
            all_errors.append((path, typ, text))
    except Exception as e:
        print(f'GET {path}: EXCEPTION -> {e}')
    page.close()

print(f'\n=== Console errors ({len(all_errors)}) ===')
seen = set()
for path, typ, text in all_errors:
    key = (typ, text[:120])
    if key in seen:
        continue
    seen.add(key)
    print(f'[{typ}] {path}: {text[:400]}')

browser.close()
p.stop()
