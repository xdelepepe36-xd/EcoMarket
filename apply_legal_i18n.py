# -*- coding: utf-8 -*-
"""i18n para terminos.html y privacidad.html."""
import io

BASE = r"C:\Users\millo\Desktop\EcoMarket"
TPL = BASE + r"\templates"
JS = BASE + r"\static\ecomarket-i18n-complete.js"

EDITS = {
"terminos.html": [
    ('<h2 class="section-title">📋 Términos y Condiciones</h2>',
     '<h2 class="section-title">📋 <span data-i18n="terms.title">Términos y Condiciones</span></h2>'),
    ('<p style="color:var(--texto-sec);margin-bottom:32px">Última actualización: Julio 2026</p>',
     '<p style="color:var(--texto-sec);margin-bottom:32px"><span data-i18n="terms.updated">Última actualización: Julio 2026</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">1. Aceptación de términos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s1_title">1. Aceptación de términos</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Al acceder y utilizar EcoMarket, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, no debes usar la plataforma.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s1_text">Al acceder y utilizar EcoMarket, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, no debes usar la plataforma.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">2. Registro de cuenta</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s2_title">2. Registro de cuenta</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Para publicar productos, debes crear una cuenta proporcionando información veraz. Eres responsable de mantener la confidencialidad de tu contraseña.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s2_text">Para publicar productos, debes crear una cuenta proporcionando información veraz. Eres responsable de mantener la confidencialidad de tu contraseña.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">3. Publicación de productos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s3_title">3. Publicación de productos</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Los productos publicados deben ser ecológicos, sostenibles o reciclados. EcoMarket se reserva el derecho de eliminar productos que no cumplan con estos criterios.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s3_text">Los productos publicados deben ser ecológicos, sostenibles o reciclados. EcoMarket se reserva el derecho de eliminar productos que no cumplan con estos criterios.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">4. Compras y pagos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s4_title">4. Compras y pagos</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Los precios están en soles peruanos (S/.). El pago se realiza directamente entre comprador y vendedor. EcoMarket no procesa pagos directamente.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s4_text">Los precios están en soles peruanos (S/.). El pago se realiza directamente entre comprador y vendedor. EcoMarket no procesa pagos directamente.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">5. Envíos y devoluciones</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s5_title">5. Envíos y devoluciones</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Los envíos son responsabilidad del vendedor. Las devoluciones deben gestionarse directamente entre las partes. EcoMarket recomienda acordar términos claros antes de cada transacción.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s5_text">Los envíos son responsabilidad del vendedor. Las devoluciones deben gestionarse directamente entre las partes. EcoMarket recomienda acordar términos claros antes de cada transacción.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">6. Privacidad de datos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s6_title">6. Privacidad de datos</span></h3>'),
    ('Protegemos tus datos personales. No compartimos tu información con terceros sin tu consentimiento explícito. Ver nuestra <a href="{{ url_for(\'privacidad\') }}" style="color:var(--verde)">Política de Privacidad</a>.',
     '<span data-i18n="terms.s6_text">Protegemos tus datos personales. No compartimos tu información con terceros sin tu consentimiento explícito. Ver nuestra</span> <a href="{{ url_for(\'privacidad\') }}" style="color:var(--verde)" data-i18n="terms.privacy_link">Política de Privacidad</a>.'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">7. Conducta del usuario</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s7_title">7. Conducta del usuario</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Está prohibido publicar contenido falso, engañoso o ilegal. Los usuarios deben tratar a otros con respeto. El incumplimiento puede resultar en la suspensión de la cuenta.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s7_text">Está prohibido publicar contenido falso, engañoso o ilegal. Los usuarios deben tratar a otros con respeto. El incumplimiento puede resultar en la suspensión de la cuenta.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">8. Modificaciones</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s8_title">8. Modificaciones</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">EcoMarket puede modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="terms.s8_text">EcoMarket puede modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">9. Contacto</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s9_title">9. Contacto</span></h3>'),
    ('Para consultas sobre estos términos, contáctanos en <a href="mailto:hola@ecomarket.com" style="color:var(--verde)">hola@ecomarket.com</a>.',
     '<span data-i18n="terms.s9_text">Para consultas sobre estos términos, contáctanos en</span> <a href="mailto:hola@ecomarket.com" style="color:var(--verde)">hola@ecomarket.com</a>.'),
],
"privacidad.html": [
    ('<h2 class="section-title">🔒 Política de Privacidad</h2>',
     '<h2 class="section-title">🔒 <span data-i18n="priv.title">Política de Privacidad</span></h2>'),
    ('<p style="color:var(--texto-sec);margin-bottom:32px">Última actualización: Julio 2026</p>',
     '<p style="color:var(--texto-sec);margin-bottom:32px"><span data-i18n="terms.updated">Última actualización: Julio 2026</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">1. Información que recopilamos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="priv.s1_title">1. Información que recopilamos</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Recopilamos información que nos proporcionas al registrarte: nombre, correo electrónico y contraseña. También recopilamos datos de navegación como páginas visitadas y productos vistos.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="priv.s1_text">Recopilamos información que nos proporcionas al registrarte: nombre, correo electrónico y contraseña. También recopilamos datos de navegación como páginas visitadas y productos vistos.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">2. Uso de la información</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="priv.s2_title">2. Uso de la información</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Usamos tu información para: procesar tus pedidos, mejorar la plataforma, enviar notificaciones relevantes y personalizar tu experiencia de compra.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="priv.s2_text">Usamos tu información para: procesar tus pedidos, mejorar la plataforma, enviar notificaciones relevantes y personalizar tu experiencia de compra.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">3. Protección de datos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="priv.s3_title">3. Protección de datos</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="priv.s3_text">Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">4. Cookies</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="priv.s4_title">4. Cookies</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Utilizamos cookies esenciales para el funcionamiento de la plataforma. No usamos cookies de rastreo de terceros sin tu consentimiento.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="priv.s4_text">Utilizamos cookies esenciales para el funcionamiento de la plataforma. No usamos cookies de rastreo de terceros sin tu consentimiento.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">5. Tus derechos</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="priv.s5_title">5. Tus derechos</span></h3>'),
    ('<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px">Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento desde tu perfil. También puedes solicitar la exportación de tus datos.</p>',
     '<p style="color:var(--texto-sec);line-height:1.8;margin-bottom:24px"><span data-i18n="priv.s5_text">Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento desde tu perfil. También puedes solicitar la exportación de tus datos.</span></p>'),
    ('<h3 style="color:var(--verde);margin-bottom:12px">6. Contacto</h3>',
     '<h3 style="color:var(--verde);margin-bottom:12px"><span data-i18n="terms.s9_title">6. Contacto</span></h3>'),
    ('Para consultas sobre privacidad, escríbenos a <a href="mailto:privacidad@ecomarket.com" style="color:var(--verde)">privacidad@ecomarket.com</a>.',
     '<span data-i18n="priv.s6_text">Para consultas sobre privacidad, escríbenos a</span> <a href="mailto:privacidad@ecomarket.com" style="color:var(--verde)">privacidad@ecomarket.com</a>.'),
],
}

applied = missed = 0
for fname, pairs in EDITS.items():
    path = TPL + "\\" + fname
    s = io.open(path, encoding="utf-8").read()
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new, 1); applied += 1
        else:
            print("MISS", fname, old[:70]); missed += 1
    io.open(path, "w", encoding="utf-8", newline="\n").write(s)
print("applied:", applied, "missed:", missed)
