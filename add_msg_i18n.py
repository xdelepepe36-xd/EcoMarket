# -*- coding: utf-8 -*-
import io, re

path = r'static/ecomarket-i18n-complete.js'
src = io.open(path, encoding='utf-8').read()

NAV = {
'es': "Mensajes", 'en': "Messages", 'pt': "Mensagens", 'fr': "Messages", 'de': "Nachrichten", 'it': "Messaggi"
}
MSG = {
'es': {"msg.title":"Mensajes","msg.subtitle":"Conversaciones privadas con compradores y vendedores.","msg.empty":"Selecciona una conversación para ver los mensajes","msg.no_chats":"No tienes conversaciones todavía","msg.general":"Conversación general","msg.placeholder":"Escribe un mensaje...","common.cancel":"Cancelar","pd.msg_title":"Escribir al vendedor","pd.msg_placeholder":"Escribe tu mensaje...","pd.msg_send":"Enviar"},
'en': {"msg.title":"Messages","msg.subtitle":"Private chats with buyers and sellers.","msg.empty":"Select a conversation to view messages","msg.no_chats":"You have no conversations yet","msg.general":"General conversation","msg.placeholder":"Type a message...","common.cancel":"Cancel","pd.msg_title":"Message the seller","pd.msg_placeholder":"Write your message...","pd.msg_send":"Send"},
'pt': {"msg.title":"Mensagens","msg.subtitle":"Conversas privadas com compradores e vendedores.","msg.empty":"Selecione uma conversa para ver as mensagens","msg.no_chats":"Você ainda não tem conversas","msg.general":"Conversa geral","msg.placeholder":"Escreva uma mensagem...","common.cancel":"Cancelar","pd.msg_title":"Escrever ao vendedor","pd.msg_placeholder":"Escreva sua mensagem...","pd.msg_send":"Enviar"},
'fr': {"msg.title":"Messages","msg.subtitle":"Discussions privées avec acheteurs et vendeurs.","msg.empty":"Sélectionnez une conversation pour voir les messages","msg.no_chats":"Vous n'avez pas encore de conversations","msg.general":"Conversation générale","msg.placeholder":"Écrivez un message...","common.cancel":"Annuler","pd.msg_title":"Écrire au vendeur","pd.msg_placeholder":"Écrivez votre message...","pd.msg_send":"Envoyer"},
'de': {"msg.title":"Nachrichten","msg.subtitle":"Private Unterhaltungen mit Käufern und Verkäufern.","msg.empty":"Wähle eine Unterhaltung, um Nachrichten zu sehen","msg.no_chats":"Du hast noch keine Unterhaltungen","msg.general":"Allgemeine Unterhaltung","msg.placeholder":"Nachricht schreiben...","common.cancel":"Abbrechen","pd.msg_title":"Verkäufer anschreiben","pd.msg_placeholder":"Schreibe deine Nachricht...","pd.msg_send":"Senden"},
'it': {"msg.title":"Messaggi","msg.subtitle":"Chat private con acquirenti e venditori.","msg.empty":"Seleziona una conversazione per vedere i messaggi","msg.no_chats":"Non hai ancora conversazioni","msg.general":"Conversazione generale","msg.placeholder":"Scrivi un messaggio...","common.cancel":"Annulla","pd.msg_title":"Scrivi al venditore","pd.msg_placeholder":"Scrivi il tuo messaggio...","pd.msg_send":"Invia"},
}
langs = ['es','en','pt','fr','de','it']

# 1) nav.messages después de cada 'nav.profile'
positions = [m.start() for m in re.finditer(r"'nav\.profile':", src)]
assert len(positions) == 6, len(positions)
for i in range(5,-1,-1):
    pos = positions[i]; eol = src.index('\n', pos)
    indent = re.match(r'\s*', src[src.rfind('\n',0,pos)+1:pos]).group(0)
    src = src[:eol+1] + f"{indent}'nav.messages': '{NAV[langs[i]]}',\n" + src[eol+1:]

# 2) msg.* + pd.msg_* después de cada 'pd.contact_seller'
positions = [m.start() for m in re.finditer(r"'pd\.contact_seller':", src)]
assert len(positions) == 6, len(positions)
for i in range(5,-1,-1):
    pos = positions[i]; eol = src.index('\n', pos)
    indent = re.match(r'\s*', src[src.rfind('\n',0,pos)+1:pos]).group(0)
    block = ''.join(f"{indent}'{k}': '{v.replace(chr(39), chr(92)+chr(39))}',\n" for k,v in MSG[langs[i]].items())
    src = src[:eol+1] + block + src[eol+1:]

io.open(path,'w',encoding='utf-8').write(src)
print('ok')
