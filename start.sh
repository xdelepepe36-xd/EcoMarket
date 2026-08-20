#!/bin/bash
set -e

# Inicializar base de datos
python -c "from app import init_db; init_db(); print('Base de datos inicializada')"

# Iniciar aplicación
exec gunicorn -w 2 -b 0.0.0.0:8000 -t 120 app:app