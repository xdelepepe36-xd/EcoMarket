# Changelog

Todas las mejoras notables del proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [4.0.0] — 2026-08-16

### Añadido
- 🤖 **IA estilo ChatGPT** (`/api/chat`): respuestas con datos reales de la BD,
  bilingüe (ES/EN), peticiones de productos por categoría/cantidad/precio.
- 🔐 **Inicio de sesión con Google** (`GOOGLE_CLIENT_ID` + `/auth/google`).
- 🧾 **Validación robusta** de registro, login y checkout (email, nombre,
  dirección calle+número, teléfono, contraseña con política de fuerza).
- 🌙 **5 temas** (Claro, Oscuro, Noche AMOLED, Sepia, Alto contraste) con
  transiciones y `color-scheme`.
- 🌐 **Servidor bilingüe**: mensajes flash y errores JSON traducidos vía
  `/api/set_lang` (ES/EN).
- 📦 **Catálogo ampliado** a 65 productos con imágenes específicas y seed aditivo.
- 🛠️ Nuevos archivos: `Makefile`, `.env.example`, `Dockerfile`,
  `docker-compose.yml`, `gunicorn.conf.py`, CI de GitHub Actions,
  utilidades C++ en `tools/`, scripts de setup/start, tests con pytest,
  documentación (`docs/`).

### Corregido
- `/productos` daba **500** (Row sin `.get()`).
- `eco-dark.css` no se cargaba en `base.html`.
- Checkout fallaba si un item no traía `nombre` (KeyError).
- Métodos de pago desalineados entre frontend y backend.

## [3.0.0] — 2026-07-29

Versión original auditada: 17/20 con 20 errores corregidos y 40 mejoras.
Ver `REPORTE_AUDITORIA.md`.