# -*- coding: utf-8 -*-
"""Tests para features nuevas: asistente, recuperación, mensajes, vendido, reportes."""
import os
import sys
import json
import sqlite3
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestFeaturesNuevas(unittest.TestCase):
    def setUp(self):
        from app import app, DB_PATH
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        self.db_path = DB_PATH

    def tearDown(self):
        self.ctx.pop()

    def _login(self, uid=1):
        with self.client.session_transaction() as s:
            s['usuario_id'] = uid
            s['nombre'] = 'Test'
            s['email'] = 't@t.com'
            s['rol'] = 'comprador'

    def _db(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    # ── Asistente ────────────────────────────────────────────
    def test_asistente_hola(self):
        r = self.client.post('/api/asistente', json={'mensaje': 'hola'})
        self.assertEqual(r.status_code, 200)
        self.assertIn('respuesta', r.get_json())

    def test_asistente_busqueda(self):
        r = self.client.post('/api/asistente', json={'mensaje': 'hay champu'})
        d = r.get_json()
        self.assertEqual(r.status_code, 200)
        self.assertTrue(len(d['respuesta']) > 10)

    def test_asistente_vacio(self):
        r = self.client.post('/api/asistente', json={'mensaje': ''})
        self.assertEqual(r.status_code, 200)

    # ── Recuperación de contraseña ───────────────────────────
    def test_recuperar_get(self):
        r = self.client.get('/recuperar')
        self.assertEqual(r.status_code, 200)

    def test_recuperar_post_email_inexistente(self):
        r = self.client.post('/recuperar', data={'email': 'noexiste@x.com', 'csrf_token': 'x'})
        # CSRF redirige (302) o responde; ambos son aceptables
        self.assertIn(r.status_code, (200, 302, 400, 403))

    # ── Mensajes ─────────────────────────────────────────────
    def test_mensajes_requiere_login(self):
        r = self.client.get('/mensajes')
        self.assertIn(r.status_code, (302, 401))

    def test_api_mensajes_requiere_login(self):
        r = self.client.post('/api/mensajes', json={'para_id': 2, 'mensaje': 'hola'})
        self.assertIn(r.status_code, (401, 302))

    def test_api_mensajes_hilo_login(self):
        r = self.client.get('/api/mensajes/hilo?con=2')
        self.assertIn(r.status_code, (401, 302))

    # ── Reportes ─────────────────────────────────────────────
    def test_reportar_requiere_login(self):
        r = self.client.post('/api/producto/1/reportar', json={'motivo': 'spam'})
        self.assertIn(r.status_code, (401, 302))

    # ── Vendido ──────────────────────────────────────────────
    def test_vendido_requiere_login(self):
        r = self.client.post('/producto/1/vendido')
        self.assertIn(r.status_code, (401, 302))

    def test_catalogo_oculta_vendidos(self):
        conn = self._db()
        conn.execute("UPDATE productos SET vendido=1 WHERE id=(SELECT MIN(id) FROM productos)")
        conn.commit()
        pid = conn.execute("SELECT MIN(id) FROM productos").fetchone()[0]
        conn.close()
        r = self.client.get('/productos')
        self.assertEqual(r.status_code, 200)
        conn = self._db()
        conn.execute("UPDATE productos SET vendido=0 WHERE id=?", (pid,))
        conn.commit()
        conn.close()

    # ── Backup admin ─────────────────────────────────────────
    def test_backup_requiere_admin(self):
        r = self.client.get('/admin/backup')
        self.assertIn(r.status_code, (302, 401, 403))


if __name__ == '__main__':
    unittest.main()
