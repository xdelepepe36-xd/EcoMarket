# -*- coding: utf-8 -*-
import io, re

path = r'static/ecomarket-i18n-complete.js'
src = io.open(path, encoding='utf-8').read()

NEW = {
'es': """            'auth.forgot': '¿Olvidaste tu contraseña?',
            'auth.recover_title': 'Recuperar contraseña',
            'auth.recover_desc': 'Ingresa tu correo y te enviaremos un enlace para restablecerla.',
            'auth.recover_sent': 'Si el correo existe, recibirás un enlace de restablecimiento en los próximos minutos.',
            'auth.recover_button': 'Enviar enlace',
            'auth.remembered': '¿Recordaste tu contraseña?',
            'auth.reset_title': 'Nueva contraseña',
            'auth.reset_desc': 'Elige una contraseña segura para tu cuenta.',
            'auth.new_password': 'Nueva contraseña',
            'auth.confirm_password': 'Confirmar contraseña',
            'auth.reset_button': 'Guardar contraseña',
""",
'en': """            'auth.forgot': 'Forgot your password?',
            'auth.recover_title': 'Recover password',
            'auth.recover_desc': 'Enter your email and we will send you a reset link.',
            'auth.recover_sent': 'If the email exists, you will receive a reset link in the next few minutes.',
            'auth.recover_button': 'Send link',
            'auth.remembered': 'Remembered your password?',
            'auth.reset_title': 'New password',
            'auth.reset_desc': 'Choose a secure password for your account.',
            'auth.new_password': 'New password',
            'auth.confirm_password': 'Confirm password',
            'auth.reset_button': 'Save password',
""",
'pt': """            'auth.forgot': 'Esqueceu sua senha?',
            'auth.recover_title': 'Recuperar senha',
            'auth.recover_desc': 'Digite seu e-mail e enviaremos um link para redefini-la.',
            'auth.recover_sent': 'Se o e-mail existir, você receberá um link de redefinição em alguns minutos.',
            'auth.recover_button': 'Enviar link',
            'auth.remembered': 'Lembrou sua senha?',
            'auth.reset_title': 'Nova senha',
            'auth.reset_desc': 'Escolha uma senha segura para sua conta.',
            'auth.new_password': 'Nova senha',
            'auth.confirm_password': 'Confirmar senha',
            'auth.reset_button': 'Salvar senha',
""",
'fr': """            'auth.forgot': 'Mot de passe oublié ?',
            'auth.recover_title': 'Récupérer le mot de passe',
            'auth.recover_desc': 'Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.',
            'auth.recover_sent': 'Si l’e-mail existe, vous recevrez un lien de réinitialisation dans quelques minutes.',
            'auth.recover_button': 'Envoyer le lien',
            'auth.remembered': 'Vous vous souvenez de votre mot de passe ?',
            'auth.reset_title': 'Nouveau mot de passe',
            'auth.reset_desc': 'Choisissez un mot de passe sécurisé pour votre compte.',
            'auth.new_password': 'Nouveau mot de passe',
            'auth.confirm_password': 'Confirmer le mot de passe',
            'auth.reset_button': 'Enregistrer',
""",
'de': """            'auth.forgot': 'Passwort vergessen?',
            'auth.recover_title': 'Passwort wiederherstellen',
            'auth.recover_desc': 'Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen.',
            'auth.recover_sent': 'Falls die E-Mail existiert, erhältst du in wenigen Minuten einen Link.',
            'auth.recover_button': 'Link senden',
            'auth.remembered': 'Passwort wieder eingefallen?',
            'auth.reset_title': 'Neues Passwort',
            'auth.reset_desc': 'Wähle ein sicheres Passwort für dein Konto.',
            'auth.new_password': 'Neues Passwort',
            'auth.confirm_password': 'Passwort bestätigen',
            'auth.reset_button': 'Speichern',
""",
'it': """            'auth.forgot': 'Password dimenticata?',
            'auth.recover_title': 'Recupera password',
            'auth.recover_desc': 'Inserisci la tua email e ti invieremo un link per reimpostarla.',
            'auth.recover_sent': 'Se l’email esiste, riceverai un link di reimpostazione tra pochi minuti.',
            'auth.recover_button': 'Invia link',
            'auth.remembered': 'Ti sei ricordato della password?',
            'auth.reset_title': 'Nuova password',
            'auth.reset_desc': 'Scegli una password sicura per il tuo account.',
            'auth.new_password': 'Nuova password',
            'auth.confirm_password': 'Conferma password',
            'auth.reset_button': 'Salva password',
""",
}

count = 0
for lang, block in NEW.items():
    # insertar después de la línea 'auth.register_desc' dentro del bloque del idioma
    pattern = re.compile(r"(\n(\s+)'auth\.register_desc':[^\n]*\n)")
    # localizar la sección del idioma: buscar "        lang: {" — los bloques empiezan con 'es: {' etc en indentación
    # estrategia: encontrar ocurrencias de 'auth.register_desc' por orden es,en,pt,fr,de,it
    pass

# Los bloques de idioma aparecen en orden fijo; insertamos por posición de cada 'auth.register_desc'
positions = [m.start() for m in re.finditer(r"'auth\.register_desc':", src)]
langs = ['es', 'en', 'pt', 'fr', 'de', 'it']
assert len(positions) == 6, f'esperaba 6 bloques, hay {len(positions)}'
# insertar de atrás hacia adelante para no invalidar posiciones
for i in range(5, -1, -1):
    pos = positions[i]
    # fin de la línea actual
    eol = src.index('\n', pos)
    indent = re.match(r'\s*', src[src.rfind('\n', 0, pos) + 1:pos]).group(0)
    block = NEW[langs[i]]
    src = src[:eol + 1] + block + src[eol + 1:]
    count += 1

io.open(path, 'w', encoding='utf-8').write(src)
print('insertado en', count, 'bloques')
