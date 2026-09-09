import os, re
import esprima

STATIC_DIR = 'static'
js_files = sorted([f for f in os.listdir(STATIC_DIR) if f.endswith('.js')])
errors = []
for jf in js_files:
    fpath = os.path.join(STATIC_DIR, jf)
    with open(fpath, encoding='utf-8', errors='replace') as f:
        content = f.read()
    try:
        esprima.parseScript(content)
    except Exception as e:
        msg = str(e)
        errors.append((jf, msg))
        print(f'SYNTAX ERROR in {jf}: {msg}')

if not errors:
    print(f'All {len(js_files)} JS files parsed successfully with esprima. No syntax errors.')
else:
    print(f'\n{len(errors)} JS files have syntax errors.')