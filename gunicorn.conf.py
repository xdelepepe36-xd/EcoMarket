# ─────────────────────────────────────────────────────────────
#  gunicorn.conf.py — configuración de Gunicorn (producción)
# ─────────────────────────────────────────────────────────────
import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get('WORKERS', multiprocessing.cpu_count() * 2 + 1))
timeout = 120
threads = 2
worker_class = 'gthread'

accesslog = '-'
errorlog = '-'
loglevel = os.environ.get('GUNICORN_LOG_LEVEL', 'info')

# Preload de la app para arranque más rápido
preload_app = True