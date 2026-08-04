"""Migrate existing plain-text passwords to hashed passwords"""
import sqlite3
from werkzeug.security import generate_password_hash
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'ecomarket.db')

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

# Check if passwords are already hashed
users = conn.execute('SELECT id, password FROM usuarios').fetchall()
migrated = 0
for user in users:
    pwd = user['password']
    # Check if it's already a hash (starts with pbkdf2: or scrypt:)
    if not pwd.startswith('pbkdf2:') and not pwd.startswith('scrypt:'):
        hashed = generate_password_hash(pwd)
        conn.execute('UPDATE usuarios SET password = ? WHERE id = ?', (hashed, user['id']))
        migrated += 1

conn.commit()
conn.close()
print(f"[OK] Migrated {migrated} passwords to hashed format")

# Now remove the old root HTML files since templates/ is the canonical location
root_html_files = ['404.html', 'admin.html', 'carrito.html', 'catalogo.html', 'checkout.html', 
                   'confirmacion.html', 'contacto.html', 'detalle-producto.html', 'favoritos.html',
                   'impacto.html', 'index.html', 'login.html', 'perfil.html', 'productos.html',
                   'publicar.html', 'registro.html']
for f in root_html_files:
    path = os.path.join(os.path.dirname(__file__), f)
    if os.path.exists(path):
        os.remove(path)
        print(f"[DEL] Removed duplicate: {f}")

print("[DONE] Migration complete!")
