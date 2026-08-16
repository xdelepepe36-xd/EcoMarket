#!/usr/bin/env bash
# ============================================================
#  EcoMarket - Inicio en produccion con Gunicorn
# ============================================================
set -euo pipefail

if [ ! -d "venv" ]; then
    echo "No existe venv. Ejecuta primero: bash scripts/setup.sh"
    exit 1
fi

source venv/bin/activate
export PYTHONIOENCODING=utf-8

PORT="${PORT:-8000}"
WORKERS="${WORKERS:-2}"
BIND="${BIND:-0.0.0.0:$PORT}"

echo "Iniciando EcoMarket en $BIND (workers=$WORKERS)"
exec gunicorn -w "$WORKERS" -b "$BIND" -t 120 app:app