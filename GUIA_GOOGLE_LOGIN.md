# 🔐 Guía: Iniciar sesión con Google en EcoMarket

Pasos para activar el botón **"Continuar con Google"** en tu proyecto.

> **¿Lo usas solo de forma local o sin credenciales?** No pasa nada: el botón
> se muestra deshabilitado con un mensaje explicativo hasta que configures
> tu `GOOGLE_CLIENT_ID`.

---

## 1. Crear un proyecto en Google Cloud Console

1. Ve a <https://console.cloud.google.com>
2. Crea un **Nuevo Proyecto** (o usa uno existente).
3. Activa la API **"Identity Services API"** (ya viene activa en proyectos nuevos).

## 2. Crear las credenciales OAuth 2.0

1. Menú: **APIs y servicios → Credenciales**.
2. Clic en **+ Crear credenciales → ID de cliente de OAuth**.
3. Tipo de aplicación: **Aplicación web**.
4. En **Orígenes de JavaScript autorizados** añade:
   - `http://localhost:5000`
   - `https://tu-dominio.onrender.com` (en producción)
5. Clic en **Crear**.
6. Copia el **ID de cliente** (algo así: `xxxx.apps.googleusercontent.com`).

## 3. Configurar la variable de entorno

En el servidor (Render, Railway, etc.) o en tu `.env`:

```
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Localmente en PowerShell:

```powershell
$env:GOOGLE_CLIENT_ID="xxxxxxxx.apps.googleusercontent.com"
python app.py
```

## 4. ¿Cómo funciona?

1. El usuario pulsa **"Continuar con Google"** (`static/eco-google.js`).
2. Google devuelve un **ID token (JWT)**.
3. El frontend lo envía a `POST /auth/google`.
4. El backend verifica el token contra `https://oauth2.googleapis.com/tokeninfo`.
5. Si es válido, **crea o vincula la cuenta** (por email o `google_id`) e inicia sesión.

---

## ⚠️ Notas de seguridad

- El token **siempre se verifica en el servidor**, nunca se confía en el cliente.
- El backend guarda `google_id` (índice único) y marca `email_verificado = 1`.
- Las cuentas con email de Google pero que ya existían por contraseña se **vinculan automáticamente**.

## ❓ Preguntas frecuentes

**¿Por qué aparece el botón deshabilitado?**
Porque falta `GOOGLE_CLIENT_ID` en el entorno. Configúralo y recarga.

**¿Dónde encuentro el Client ID en Render?**
Render → tu Web Service → **Environment → Environment Variables** → añade `GOOGLE_CLIENT_ID`.