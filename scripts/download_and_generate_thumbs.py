#!/usr/bin/env python3
"""
Download remote product images and generate thumbnails, updating the SQLite DB.
Usage: python scripts/download_and_generate_thumbs.py --db database.db [--dry-run] [--limit N]

Notes:
- Thumbnails are saved into static/uploads/ as JPEG with prefix thumb-<origname>.jpg
- The script updates imagen_thumb to the thumbnail path (static/uploads/thumb-...)
- It skips SVGs and already-thumbnailed rows.
"""
import argparse
import os
import sqlite3
import sys
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("Please install Pillow: pip install Pillow")
    sys.exit(1)

TMP_DIR = "static/uploads"
MAX_SIZE = (800, 800)

def slug_from_url(url):
    p = urlparse(url)
    name = os.path.basename(p.path)
    if not name:
        name = "image"
    return name


def create_thumbnail_from_file(src_path, dst_path, max_size=MAX_SIZE):
    try:
        if src_path.lower().endswith('.svg'):
            return False
        with Image.open(src_path) as im:
            im.convert('RGB')
            im.thumbnail(max_size, Image.LANCZOS)
            im.save(dst_path, 'JPEG', quality=85)
        return True
    except Exception as e:
        print("Error creating thumbnail:", e)
        try:
            if os.path.exists(dst_path):
                os.remove(dst_path)
        except Exception:
            pass
        return False


def download_file(url, dest_path):
    try:
        resp = requests.get(url, stream=True, timeout=20)
        resp.raise_for_status()
        with open(dest_path, 'wb') as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"Failed download {url}: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return False


def process_rows(conn, table, id_col, img_col, thumb_col, dry_run=False, limit=None):
    cur = conn.cursor()
    q = f"SELECT {id_col}, {img_col} FROM {table} WHERE {img_col} IS NOT NULL AND {img_col} != '' AND ({thumb_col} IS NULL OR {thumb_col} = '')"
    if limit:
        q += f" LIMIT {limit}"
    cur.execute(q)
    rows = cur.fetchall()
    created = 0
    skipped = 0
    for r in rows:
        _id, img = r
        if not img or not img.lower().startswith(('http://','https://')):
            skipped += 1
            continue
        name = slug_from_url(img)
        ext = os.path.splitext(name)[1].lower()
        if ext == '.svg':
            skipped += 1
            continue
        local_name = f"remote-{table}-{_id}{ext}"
        local_path = os.path.join(TMP_DIR, local_name)
        thumb_name = f"thumb-{table}-{_id}.jpg"
        thumb_path = os.path.join(TMP_DIR, thumb_name)
        if dry_run:
            print(f"[dry] would download {img} -> {local_path} and thumb -> {thumb_path}")
            created += 0
            continue
        print(f"Processing {_id}: {img}")
        ok = download_file(img, local_path)
        if not ok:
            skipped += 1
            continue
        ok = create_thumbnail_from_file(local_path, thumb_path)
        if not ok:
            skipped += 1
            try:
                os.remove(local_path)
            except Exception:
                pass
            continue
        # set DB field to static/uploads/<thumb_name>
        db_thumb = os.path.join('static','uploads', thumb_name).replace('\\','/')
        try:
            cur.execute(f"UPDATE {table} SET {thumb_col} = ? WHERE {id_col} = ?", (db_thumb, _id))
            conn.commit()
            created += 1
        except Exception as e:
            print(f"DB update failed for {_id}: {e}")
            skipped += 1
    return created, skipped


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', default='database.db', help='Path to SQLite DB')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--limit', type=int, default=None)
    args = parser.parse_args()

    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR, exist_ok=True)

    if not os.path.exists(args.db):
        print('DB not found at', args.db)
        sys.exit(1)

    conn = sqlite3.connect(args.db)

    # tables assumed from project: productos(id, imagen, imagen_thumb), producto_imagenes(id, imagen, imagen_thumb)
    total_created = 0
    total_skipped = 0
    c1, s1 = process_rows(conn, 'productos', 'id', 'imagen', 'imagen_thumb', dry_run=args.dry_run, limit=args.limit)
    c2, s2 = process_rows(conn, 'producto_imagenes', 'id', 'imagen', 'imagen_thumb', dry_run=args.dry_run, limit=args.limit)
    total_created = c1 + c2
    total_skipped = s1 + s2
    print(f"Done. created={total_created}, skipped={total_skipped}")

if __name__ == '__main__':
    main()
