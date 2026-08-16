# Contribuyendo a EcoMarket

¡Gracias por querer mejorar EcoMarket! 🌱 Aquí las pautas para aportar.

## Flujo sugerido

1. Haz un **fork** y crea una rama: `git checkout -b mejora/nombre-descriptivo`
2. Implementa tu cambio **con pruebas**.
3. Ejecuta la batería de pruebas:
   ```bash
   pip install -r requirements-dev.txt
   python -m pytest tests/ -v          # tests unitarios
   python scripts/test_backend.py      # tests de integración del backend
   ```
4. Haz commit con mensajes claros y haz pull request.

## Código de conducta breve

- Se amable y respetuoso.
- La documentación y los mensajes de commit cuentan.
- No subas archivos generados (venv/, __pycache__/, .db) — está en `.gitignore`.

## Reglas de estilo

- Python: PEP 8, 100 columnas (ver `.editorconfig`, `pyproject.toml`).
- JavaScript: Prettier (`.prettierrc`).
- Nuevos textos de UI: deben pasar por el sistema i18n (`data-i18n` en las
  plantillas y claves en `static/eco-i18n.js` para ES y EN).

## Reportar bugs

Usa issues de GitHub describiendo:
1. Pasos para reproducir.
2. Comportamiento esperado vs actual.
3. Captura de pantalla/consola si es posible.