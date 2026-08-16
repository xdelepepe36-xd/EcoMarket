# 🔒 Política de Seguridad de EcoMarket

## Versiones soportadas

| Versión | Soportada |
|---------|-----------|
| 4.x     | ✅ |
| 3.x     | Solo parches críticos |

## Reportar una vulnerabilidad

**NO** abras un issue público para vulnerabilidades. Escríbenos a
`hola@ecomarket.com` con asunto `[SEGURIDAD]`:

1. Descripción del problema.
2. Pasos para reproducir.
3. Versión afectada.
4. Impacto potencial.

Se responderá en un plazo máximo de **7 días**. No divulgar la vulnerabilidad
públicamente hasta que se publique la corrección.

## Buenas prácticas aplicadas

- 🔐 Contraseñas con hash (`werkzeug.security`, PBKDF2).
- 🚫 Rate limiting en login: 5 intentos → bloqueo de 15 minutos.
- 🛡️ Decoradores `login_required` / `admin_required`.
- ✅ Validación server-side de emails, nombres, direcciones y teléfonos.
- 🖼️ Subida de imágenes con extensiones en lista blanca y límite de 5 MB.
- 🧑‍🤝‍🧑 Google Sign-In: el token se verifica en el servidor contra Google,
  nunca se confía en el cliente.

## Checklist al hacer deploy

- [ ] Cambia `SECRET_KEY` a un valor aleatorio (`secrets.token_hex(32)`).
- [ ] Usa HTTPS.
- [ ] Define `GOOGLE_CLIENT_ID` con orígenes autorizados correctos.
- [ ] No comitees `data/ecomarket.db` con datos reales.