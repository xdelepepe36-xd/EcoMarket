#!/usr/bin/env python3
"""
Find candidate lines in templates that contain Spanish characters and are not annotated with data-i18n.
Usage: python scripts/find_i18n_candidates.py
Prints filename:lineno and a short preview.
"""
import os
import re

TEMPLATES_DIR = 'templates'
SPANISH_RE = re.compile(r'[áéíóúñÁÉÍÓÚÑ]')
TAG_TEXT_RE = re.compile(r'<([a-zA-Z0-9-_]+)([^>]*)>([^<\n]{1,200}?)</\1>')
DATA_I18N_RE = re.compile(r'data-i18n=')


def is_annotated(attrs):
    return 'data-i18n' in attrs


def scan_file(path):
    candidates = []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for i, line in enumerate(f, start=1):
            if not SPANISH_RE.search(line):
                continue
            for m in TAG_TEXT_RE.finditer(line):
                tag, attrs, inner = m.groups()
                if SPANISH_RE.search(inner) and 'data-i18n' not in attrs:
                    preview = inner.strip()
                    if len(preview) > 80:
                        preview = preview[:77] + '...'
                    candidates.append((i, tag, preview, line.strip()))
    return candidates


def main():
    root = TEMPLATES_DIR
    all_candidates = {}
    for dirpath, dirs, files in os.walk(root):
        for fn in files:
            if not fn.endswith('.html'):
                continue
            p = os.path.join(dirpath, fn)
            c = scan_file(p)
            if c:
                all_candidates[p] = c
    if not all_candidates:
        print('No candidates found')
        return
    print('Found i18n candidates (file:lineno tag "preview"):\n')
    for fn, items in sorted(all_candidates.items()):
        print(fn)
        for (lineno, tag, preview, line) in items:
            print(f"  {lineno}: <{tag}> '{preview}'")
        print()

if __name__ == '__main__':
    main()
