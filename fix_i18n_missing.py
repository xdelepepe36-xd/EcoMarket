# -*- coding: utf-8 -*-
"""Agrega aliases i18n + traducciones faltantes y blinda getTranslation."""
import io

P = r"C:\Users\millo\Desktop\EcoMarket\static\ecomarket-i18n-complete.js"
s = io.open(P, encoding="utf-8", newline="").read()

# ---------- 1) aliases: clave faltante -> clave existente ----------
ALIASES = {
    # auth -> login/register
    "auth.email": "login.email",
    "auth.password": "login.password",
    "auth.login_title": "login.title",
    "auth.login_button": "login.submit",
    "auth.no_account": "login.no_account",
    "auth.register_button": "login.register",
    "auth.have_account": "register.has_account",
    "auth.register_title": "register.title",
    "auth.password_confirm": "register.confirm_password",
    # cart -> cart
    "cart.checkout_button": "cart.proceed_checkout",
    "cart.explore": "cart.continue_shopping",
    # checkout -> existentes
    "checkout.email": "login.email",
    "checkout.shipping_info": "checkout.shipping_address",
    "checkout.payment_methods": "checkout.payment_method",
    "checkout.subtotal": "cart.subtotal",
    "checkout.total": "cart.total",
    "checkout.shipping": "cart.shipping",
    "checkout.your_order": "checkout.order_summary",
    "checkout.pay": "checkout.place_order",
    # publicar -> publish/pd
    "publicar.title": "publish.title",
    "publicar.publish_btn": "publish.submit",
    "publicar.category_label": "publish.category",
    "publicar.condition_label": "publish.condition",
    "publicar.condition_new": "pd.new",
    "publicar.condition_used": "pd.used",
    "publicar.description_label": "publish.description",
    "publicar.location_label": "publish.location",
    "publicar.name_label": "publish.product_name",
    "publicar.price_label": "publish.price",
    "publicar.stock_label": "publish.stock",
    "publicar.specs_label": "pd.specs_title",
}

# ---------- 2) nuevas traducciones: key -> [es,en,pt,fr,de,it] ----------
NEW = {
"add_cart": ["Agregar al carrito","Add to cart","Adicionar ao carrinho","Ajouter au panier","In den Warenkorb","Aggiungi al carrello"],
"share": ["Compartir","Share","Compartilhar","Partager","Teilen","Condividi"],
"back_to_top": ["Volver arriba","Back to top","Voltar ao topo","Retour en haut","Nach oben","Torna su"],
"auth.login_desc": ["Inicia sesión para continuar","Sign in to continue","Entre para continuar","Connectez-vous pour continuer","Melde dich an, um fortzufahren","Accedi per continuare"],
"auth.register_desc": ["Crea tu cuenta gratis","Create your free account","Crie sua conta grátis","Créez votre compte gratuit","Erstelle dein kostenloses Konto","Crea il tuo account gratuito"],
"auth.or": ["o","or","ou","ou","oder","o"],
"auth.first_name": ["Nombre","First name","Nome","Prénom","Vorname","Nome"],
"auth.last_name": ["Apellido","Last name","Sobrenome","Nom","Nachname","Cognome"],
"auth.phone": ["Teléfono","Phone","Telefone","Téléphone","Telefon","Telefono"],
"auth.city": ["Ciudad","City","Cidade","Ville","Stadt","Città"],
"auth.email_placeholder": ["tu@correo.com","you@email.com","seu@email.com","votre@email.com","deine@email.com","tua@email.com"],
"auth.password_placeholder": ["Tu contraseña","Your password","Sua senha","Votre mot de passe","Dein Passwort","La tua password"],
"auth.password_confirm_placeholder": ["Repite tu contraseña","Repeat your password","Repita sua senha","Répétez votre mot de passe","Wiederhole dein Passwort","Ripeti la password"],
"auth.first_name_placeholder": ["Juan","John","João","Jean","Max","Mario"],
"auth.last_name_placeholder": ["Pérez","Smith","Silva","Martin","Müller","Rossi"],
"auth.phone_placeholder": ["+51 999 999 999","+1 555 000 0000","+55 11 99999-9999","+33 6 00 00 00 00","+49 170 0000000","+39 333 000 0000"],
"auth.city_placeholder": ["Lima","Lima","São Paulo","Paris","Berlin","Roma"],
"auth.password_strength_hint": ["Mínimo 8 caracteres","At least 8 characters","Mínimo 8 caracteres","8 caractères minimum","Mindestens 8 Zeichen","Almeno 8 caratteri"],
"cart.desc": ["Revisa los artículos en tu carrito","Review the items in your cart","Revise os itens do seu carrinho","Vérifiez les articles de votre panier","Überprüfe die Artikel in deinem Warenkorb","Controlla gli articoli nel carrello"],
"cart.summary": ["Resumen","Summary","Resumo","Récapitulatif","Zusammenfassung","Riepilogo"],
"cart.items": ["artículos","items","itens","articles","Artikel","articoli"],
"cart.discount": ["Descuento","Discount","Desconto","Remise","Rabatt","Sconto"],
"cart.note": ["¿Algo más? Déjanos una nota","Anything else? Leave us a note","Algo mais? Deixe uma nota","Autre chose ? Laissez-nous un mot","Noch etwas? Hinterlasse uns eine Nachricht","Qualcos'altro? Lasciaci un messaggio"],
"checkout.step_cart": ["Carrito","Cart","Carrinho","Panier","Warenkorb","Carrello"],
"checkout.step_payment": ["Pago","Payment","Pagamento","Paiement","Zahlung","Pagamento"],
"checkout.step_confirm": ["Confirmación","Confirmation","Confirmação","Confirmation","Bestätigung","Conferma"],
"checkout.first_name": ["Nombre","First name","Nome","Prénom","Vorname","Nome"],
"checkout.last_name": ["Apellido","Last name","Sobrenome","Nom","Nachname","Cognome"],
"checkout.phone": ["Teléfono","Phone","Telefone","Téléphone","Telefon","Telefono"],
"checkout.address": ["Dirección","Address","Endereço","Adresse","Adresse","Indirizzo"],
"checkout.city": ["Ciudad","City","Cidade","Ville","Stadt","Città"],
"checkout.postal_code": ["Código postal","Postal code","CEP","Code postal","PLZ","CAP"],
"checkout.apply_coupon": ["Aplicar cupón","Apply coupon","Aplicar cupom","Appliquer le code","Gutschein anwenden","Applica coupon"],
"checkout.coupon_placeholder": ["Código de cupón","Coupon code","Código do cupom","Code promo","Gutscheincode","Codice coupon"],
"checkout.eco_note": ["Los pedidos con productos ecológicos tienen prioridad de envío","Orders with eco products get shipping priority","Pedidos com produtos ecológicos têm prioridade no envio","Les commandes avec des produits écologiques sont prioritaires","Bestellungen mit Öko-Produkten werden bevorzugt versendet","Gli ordini con prodotti ecologici hanno priorità di spedizione"],
"checkout.first_name_placeholder": ["Juan","John","João","Jean","Max","Mario"],
"checkout.last_name_placeholder": ["Pérez","Smith","Silva","Martin","Müller","Rossi"],
"checkout.email_placeholder": ["tu@correo.com","you@email.com","seu@email.com","votre@email.com","deine@email.com","tua@email.com"],
"checkout.phone_placeholder": ["+51 999 999 999","+1 555 000 0000","+55 11 99999-9999","+33 6 00 00 00 00","+49 170 0000000","+39 333 000 0000"],
"checkout.address_placeholder": ["Av. Ejemplo 123","123 Example Ave","Av. Exemplo 123","123 rue Exemple","Musterstraße 123","Via Esempio 123"],
"checkout.city_placeholder": ["Lima","Lima","São Paulo","Paris","Berlin","Roma"],
"checkout.postal_placeholder": ["15001","10001","01310-100","75001","10115","00100"],
"products.location_label": ["Ubicación","Location","Localização","Emplacement","Standort","Posizione"],
"products.location_placeholder": ["Ciudad o región","City or region","Cidade ou região","Ville ou région","Stadt oder Region","Città o regione"],
"pagination.next": ["Siguiente","Next","Próximo","Suivant","Weiter","Avanti"],
"pagination.prev": ["Anterior","Previous","Anterior","Précédent","Zurück","Indietro"],
"pagination.of": ["de","of","de","sur","von","di"],
"pagination.page_info": ["Página","Page","Página","Page","Seite","Pagina"],
"payment.card": ["Tarjeta","Card","Cartão","Carte","Karte","Carta"],
"payment.yape": ["Yape","Yape","Yape","Yape","Yape","Yape"],
"payment.bank": ["Transferencia","Bank transfer","Transferência","Virement","Überweisung","Bonifico"],
"payment.instant": ["Pago instantáneo","Instant payment","Pagamento instantâneo","Paiement instantané","Sofortzahlung","Pagamento istantaneo"],
"payment.card_brands": ["Visa, Mastercard, Amex","Visa, Mastercard, Amex","Visa, Mastercard, Amex","Visa, Mastercard, Amex","Visa, Mastercard, Amex","Visa, Mastercard, Amex"],
"payment.bank_list": ["Banco de la Nación, BCP, Interbank","Banco de la Nación, BCP, Interbank","Banco do Brasil, Itaú, Bradesco","BNP, Crédit Agricole, Société Générale","Deutsche Bank, Commerzbank, Sparkasse","Intesa Sanpaolo, UniCredit, BPM"],
"profile.bio_placeholder": ["Cuéntanos sobre ti...","Tell us about you...","Conte-nos sobre você...","Parlez-nous de vous...","Erzähl uns von dir...","Raccontaci di te..."],
"profile.stats.value": ["Valor productos","Products value","Valor dos produtos","Valeur des produits","Produktwert","Valore prodotti"],
"publicar.subtitle": ["Comparte productos ecológicos con la comunidad","Share eco products with the community","Compartilhe produtos ecológicos com a comunidade","Partagez des produits écologiques avec la communauté","Teile Öko-Produkte mit der Community","Condividi prodotti ecologici con la community"],
"publicar.edit_subtitle": ["Actualiza la información de tu producto","Update your product information","Atualize as informações do seu produto","Mettez à jour les informations de votre produit","Aktualisiere die Informationen deines Produkts","Aggiorna le informazioni del tuo prodotto"],
"publicar.edit_title": ["Editar producto","Edit product","Editar produto","Modifier le produit","Produkt bearbeiten","Modifica prodotto"],
"publicar.save_btn": ["Guardar cambios","Save changes","Salvar alterações","Enregistrer","Änderungen speichern","Salva modifiche"],
"publicar.cancel": ["Cancelar","Cancel","Cancelar","Annuler","Abbrechen","Annulla"],
"publicar.gallery": ["Galería","Gallery","Galeria","Galerie","Galerie","Galleria"],
"publicar.main_image": ["Imagen principal","Main image","Imagem principal","Image principale","Hauptbild","Immagine principale"],
"publicar.click_to_upload": ["Haz clic para subir","Click to upload","Clique para enviar","Cliquez pour téléverser","Zum Hochladen klicken","Clicca per caricare"],
"publicar.click_to_upload_multiple": ["Haz clic para subir varias imágenes","Click to upload multiple images","Clique para enviar várias imagens","Cliquez pour téléverser plusieurs images","Klicken, um mehrere Bilder hochzuladen","Clicca per caricare più immagini"],
"publicar.description_placeholder": ["Describe tu producto: materiales, uso, beneficios ecológicos...","Describe your product: materials, use, eco benefits...","Descreva seu produto: materiais, uso, benefícios ecológicos...","Décrivez votre produit : matériaux, utilisation, avantages écologiques...","Beschreibe dein Produkt: Materialien, Nutzung, Öko-Vorteile...","Descrivi il tuo prodotto: materiali, uso, vantaggi ecologici..."],
"publicar.location_hint": ["Ej: Lima, Perú","E.g.: Lima, Peru","Ex.: São Paulo, Brasil","Ex : Paris, France","Z.B.: Berlin, Deutschland","Es.: Roma, Italia"],
"publicar.select_category": ["Selecciona una categoría","Select a category","Selecione uma categoria","Sélectionnez une catégorie","Wähle eine Kategorie","Seleziona una categoria"],
"publicar.specs_hint": ["Material, tamaño, peso, origen...","Material, size, weight, origin...","Material, tamanho, peso, origem...","Matériau, taille, poids, origine...","Material, Größe, Gewicht, Herkunft...","Materiale, dimensioni, peso, origine..."],
"publicar.specs_placeholder": ["Ej: Algodón orgánico, 500ml","E.g.: Organic cotton, 500ml","Ex.: Algodão orgânico, 500ml","Ex : Coton bio, 500ml","Z.B.: Bio-Baumwolle, 500ml","Es.: Cotone bio, 500ml"],
"publicar.upload_hint": ["PNG, JPG hasta 5MB","PNG, JPG up to 5MB","PNG, JPG até 5MB","PNG, JPG jusqu'à 5 Mo","PNG, JPG bis 5MB","PNG, JPG fino a 5MB"],
"publicar.placeholder_name": ["Ej: Botella de acero inoxidable","E.g.: Stainless steel bottle","Ex.: Garrafa de aço inox","Ex : Bouteille en inox","Z.B.: Edelstahlflasche","Es.: Bottiglia in acciaio inox"],
"publicar.placeholder_price": ["0.00","0.00","0,00","0,00","0,00","0,00"],
"publicar.placeholder_location": ["Lima, Perú","Lima, Peru","São Paulo, Brasil","Paris, France","Berlin, Deutschland","Roma, Italia"],
}

langs = ["es","en","pt","fr","de","it"]

# ---------- 3) insertar extraI18n antes de init() ----------
lines = ["    extraI18n: {"]
for l in langs:
    lines.append("        %s: {" % l)
    for key, vals in NEW.items():
        v = vals[langs.index(l)]
        esc = v.replace("\\","\\\\").replace("'","\\'")
        lines.append("            '%s': '%s'," % (key, esc))
    lines.append("        },")
lines.append("    },")
lines.append("    aliases: {")
for k, src in ALIASES.items():
    lines.append("        '%s': '%s'," % (k, src))
lines.append("    },")
block = "\n".join(lines) + "\n"

marker = "    init() {\n        for (const lang in this.homeI18n) {"
assert marker in s, "marker init no encontrado"
s = s.replace(marker, block + "\n" + marker, 1)

# ---------- 4) merge extraI18n en init ----------
old_loop = """        for (const lang in this.pagesI18n) {
            this.translations[lang] = Object.assign({}, this.translations[lang], this.pagesI18n[lang]);
        }"""
new_loop = old_loop + """
        for (const lang in this.extraI18n) {
            this.translations[lang] = Object.assign({}, this.translations[lang], this.extraI18n[lang]);
        }"""
assert old_loop in s
s = s.replace(old_loop, new_loop, 1)

# ---------- 5) getTranslation: alias + null fallback ----------
old_gt = """    getTranslation(key) {
        return this.translations[this.currentLang][key] || this.translations['es'][key] || key;
    },"""
new_gt = """    getTranslation(key) {
        const resolved = this.aliases[key] || key;
        return this.translations[this.currentLang][resolved] || this.translations['es'][resolved] || null;
    },"""
assert old_gt in s
s = s.replace(old_gt, new_gt, 1)

# ---------- 6) t() tolera null ----------
old_t = """        let translation = this.getTranslation(key);
        
        // Reemplazar parámetros"""
new_t = """        let translation = this.getTranslation(key) || key;
        
        // Reemplazar parámetros"""
assert old_t in s
s = s.replace(old_t, new_t, 1)

io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("aliases:", len(ALIASES), "new keys:", len(NEW))
