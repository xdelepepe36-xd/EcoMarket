#!/usr/bin/env bash
# ============================================================
#  EcoMarket - Configuracion inicial (Linux/macOS/Render)
# ============================================================
set -euo pipefail

echo "[1/3] Creando entorno virtual..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "[2/3] Instalando dependencias..."
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "[3/3] Preparando .env (si no existe)..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   -> Crea .env y pega tu GOOGLE_CLIENT_ID si lo tienes."
fi

echo ""
echo "✔ Configuracion lista."
echo "   Ejecuta:  source venv/bin/activate && python app.py"
echo "   o en modo produccion:  gunicorn app:app"