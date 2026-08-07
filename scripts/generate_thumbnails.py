#!/usr/bin/env python3
"""Generador de miniaturas para EcoMarket.

Escanea las tablas `productos` y `producto_imagenes` buscando filas que no tengan
`imagen_thumb` pero sí una imagen local (no URL). Genera una miniatura JPEG en
static/uploads/ y actualiza la columna imagen_thumb con la ruta relativa
`uploads/<thumb_name>`.

Uso:
    python scripts/generate_thumbnails.py [--max-size N] [--dry-run]

Requiere Pillow instalada.
"""
import os
import sqlite3
import argparse
from PIL import Image

# Ajuste para ejecución desde repo root
BASE_DIR = os.path.dirname(os.path.dirname(__file__)) if os.path.basename(__file__) == 'generate_thumbnails.py' else os.path.dirname(__file__)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_PATH = os.environ.get('DATABASE_URL', os.path.join(BASE_DIR, 'data', 'ecomarket.db'))
UPLOAD_DIR = os.path.join(BASE_DIR, 'static', 'uploads')

os.makedirs(UPLOAD_DIR, exist_ok=True)


def create_thumb_for_file(src_rel, max_size=800):
    """Genera thumbnail JPEG para src_rel (ruta relativa tipo 'uploads/xxx.jpg').
    Devuelve la ruta relativa del thumbnail (ej. 'uploads/xxx_thumb.jpg') o '' si no se creó.
    """
    if not src_rel:
        return ''
    src_rel = src_rel.lstrip('/')
    # Ignorar URLs externas
    if src_rel.startswith('http://') or src_rel.startswith('https://'):
        return ''
    # Manejar rutas ya relativas a uploads/
    if src_rel.startswith('uploads/') or src_rel.startswith('static/uploads/'):
        # Normalizar a nombre de archivo dentro de uploads
        filename = os.path.basename(src_rel)
        src_path = os.path.join(UPLOAD_DIR, filename)
    else:
        # Si la ruta parece relativa al proyecto (ej: 'static/uploads/..')
        candidate = os.path.join(BASE_DIR, src_rel)
        if os.path.exists(candidate):
            src_path = candidate
            filename = os.path.basename(src_rel)
        else:
            # No podemos localizar el archivo
            return ''

    if not os.path.exists(src_path):
        return ''

    ext = os.path.splitext(src_path)[1].lower()
    if ext == '.svg':
        # No rasterizar SVGs
        return ''

    name_wo_ext = os.path.splitext(filename)[0]
    thumb_name = f"{name_wo_ext}_thumb.jpg"
    thumb_path = os.path.join(UPLOAD_DIR, thumb_name)

    try:
        with Image.open(src_path) as img:
            img = img.convert('RGB')
            img.thumbnail((max_size, max_size), Image.LANCZOS)
            img.save(thumb_path, optimize=True, quality=85)
        return f'uploads/{thumb_name}'
    except Exception:
        try:
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
        except Exception:
            pass
        return ''


def process(db_path, max_size=800, dry_run=False):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Productos
    productos = cur.execute("SELECT id, imagen, imagen_thumb FROM productos").fetchall()
    created = 0
    skipped = 0

    for p in productos:
        pid = p['id']
        imagen = p['imagen'] or ''
        imagen_thumb = p['imagen_thumb'] or ''
        if imagen_thumb:
            skipped += 1
            continue
        thumb_rel = create_thumb_for_file(imagen, max_size=max_size)
        if thumb_rel:
            created += 1
            if not dry_run:
                cur.execute('UPDATE productos SET imagen_thumb = ? WHERE id = ?', (thumb_rel, pid))
                conn.commit()
        else:
            skipped += 1

    # Imagenes de galería
    imgs = cur.execute('SELECT id, producto_id, imagen, imagen_thumb FROM producto_imagenes').fetchall()
    updated = 0
    for img in imgs:
        iid = img['id']
        imagen = img['imagen'] or ''
        imagen_thumb = img['imagen_thumb'] or ''
        if imagen_thumb:
            continue
        thumb_rel = create_thumb_for_file(imagen, max_size=max_size)
        if thumb_rel:
            updated += 1
            if not dry_run:
                cur.execute('UPDATE producto_imagenes SET imagen_thumb = ? WHERE id = ?', (thumb_rel, iid))
                conn.commit()

    conn.close()
    return {'productos_thumbs_created': created, 'producto_imagenes_thumbs_updated': updated, 'skipped': skipped}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Genera thumbnails para imágenes ya existentes en la BD')
    parser.add_argument('--max-size', type=int, default=800, help='Tamaño máximo del lado mayor de la miniatura (px)')
    parser.add_argument('--dry-run', action='store_true', help='No escribe cambios en la BD, solo simula')
    args = parser.parse_args()

    res = process(DB_PATH, max_size=args.max_size, dry_run=args.dry_run)
    print('Resultados:')
    print(res)
