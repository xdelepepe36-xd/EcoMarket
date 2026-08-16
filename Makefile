# ————————————————————————————————————————————————————————————
#  EcoMarket — Makefile de tareas comunes
#  Uso:  make install   | make run   | make test | make seed ...
# ————————————————————————————————————————————————————————————

PYTHON   = python
PIP      = $(PYTHON) -m pip
FLASK    = $(PYTHON) app.py

.PHONY: help install run debug test seed products clean backup

help:
	@echo "Objetivos disponibles:"
	@echo "  make install   Instala dependencias (requirements.txt)"
	@echo "  make run       Inicia el servidor Flask (http://localhost:5000)"
	@echo "  make debug     Inicia Flask en modo depuracion"
	@echo "  make test      Ejecuta la bateria de pruebas del backend"
	@echo "  make seed      Recarga productos/cupones de ejemplo en la BD"
	@echo "  make products  Muestra estadisticas del catalogo (products.json)"
	@echo "  make backup    Copia de seguridad de la base de datos"

install:
	$(PIP) install -r requirements.txt

run:
	$(FLASK)

debug:
	FLASK_DEBUG=1 $(FLASK)

test:
	$(PYTHON) scripts/test_backend.py

seed:
	$(PYTHON) -c "import app; print('Seed aplicado (init_db)')"

products:
	$(PYTHON) -c "import json; d=json.load(open('data/products.json',encoding='utf-8')); print('Total productos:', len(d))"

backup:
	$(PYTHON) -c "import shutil; shutil.copy('data/ecomarket.db','data/ecomarket.backup.db'); print('Copia creada: data/ecomarket.backup.db')"