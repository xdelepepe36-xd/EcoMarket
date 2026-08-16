# ─────────────────────────────────────────────────────────────
#  Dockerfile de EcoMarket (Flask + Gunicorn)
# ─────────────────────────────────────────────────────────────
FROM python:3.12-slim

# Variables de entorno por defecto
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Dependencias del sistema (Pillow necesita libjpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg-dev zlib1g-dev gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Crear carpeta de subidas (compatible con Render persistent disk)
RUN mkdir -p /app/static/uploads /app/data
ENV UPLOADS_DIR=/app/static/uploads \
    DATABASE_URL=/app/data/ecomarket.db

EXPOSE ${PORT}

CMD sh -c "gunicorn -w \${WORKERS:-2} -b 0.0.0.0:\${PORT} -t 120 app:app"