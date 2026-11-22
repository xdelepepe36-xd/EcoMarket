# -*- coding: utf-8 -*-
"""Agrega pagesI18n al diccionario i18n y lo fusiona en init()."""
import io

PATH = r"C:\Users\millo\Desktop\EcoMarket\static\ecomarket-i18n-complete.js"

T = {
# ---- detalle producto ----
"pd.reviews": ["reseñas","reviews","avaliações","avis","Bewertungen","recensioni"],
"pd.views": ["vistas","views","visualizações","vues","Aufrufe","visualizzazioni"],
"pd.free_shipping_lima": ["Envío gratis en Lima","Free shipping in Lima","Envio grátis em Lima","Livraison gratuite à Lima","Kostenloser Versand in Lima","Spedizione gratuita a Lima"],
"pd.in_stock": ["en stock","in stock","em estoque","en stock","auf Lager","disponibile"],
"pd.out_of_stock": ["Agotado","Out of stock","Esgotado","Épuisé","Ausverkauft","Esaurito"],
"pd.new": ["Nuevo","New","Novo","Nouveau","Neu","Nuovo"],
"pd.used": ["Usado","Used","Usado","Occasion","Gebraucht","Usato"],
"pd.sold_by": ["Vendido por","Sold by","Vendido por","Vendu par","Verkauft von","Venduto da"],
"pd.products_published": ["producto(s) publicado(s)","product(s) listed","produto(s) publicado(s)","produit(s) publié(s)","Produkt(e) inseriert","prodotto/i pubblicato/i"],
"pd.benefit_material": ["♻️ Material sostenible","♻️ Sustainable material","♻️ Material sustentável","♻️ Matériau durable","♻️ Nachhaltiges Material","♻️ Materiale sostenibile"],
"pd.benefit_shipping": ["🚚 Envío rápido disponible","🚚 Fast shipping available","🚚 Envio rápido disponível","🚚 Livraison rapide disponible","🚚 Schneller Versand verfügbar","🚚 Spedizione rapida disponibile"],
"pd.benefit_returns": ["🔄 Devoluciones gratis","🔄 Free returns","🔄 Devoluções grátis","🔄 Retours gratuits","🔄 Kostenlose Rückgabe","🔄 Resi gratuiti"],
"pd.tab_desc": ["Descripción","Description","Descrição","Description","Beschreibung","Descrizione"],
"pd.tab_specs": ["Especificaciones","Specifications","Especificações","Spécifications","Spezifikationen","Specifiche"],
"pd.tab_shipping": ["Envío y devoluciones","Shipping & returns","Envio e devoluções","Livraison et retours","Versand & Rückgabe","Spedizione e resi"],
"pd.tab_reviews": ["Reseñas","Reviews","Avaliações","Avis","Bewertungen","Recensioni"],
"pd.desc_title": ["Descripción del producto","Product description","Descrição do produto","Description du produit","Produktbeschreibung","Descrizione del prodotto"],
"pd.specs_title": ["Especificaciones técnicas","Technical specifications","Especificações técnicas","Spécifications techniques","Technische Daten","Specifiche tecniche"],
"pd.no_specs": ["No hay especificaciones detalladas para este producto.","No detailed specifications for this product.","Não há especificações detalhadas para este produto.","Aucune spécification détaillée pour ce produit.","Keine detaillierten Spezifikationen für dieses Produkt.","Nessuna specifica dettagliata per questo prodotto."],
"pd.shipping_title": ["Envío y devoluciones","Shipping & returns","Envio e devoluções","Livraison et retours","Versand & Rückgabe","Spedizione e resi"],
"pd.ship_fast": ["Envío rápido","Fast shipping","Envio rápido","Livraison rapide","Schneller Versand","Spedizione rapida"],
"pd.ship_fast_desc": ["Entrega en 2-4 días hábiles en Lima Metropolitana.","Delivery in 2-4 business days in metropolitan Lima.","Entrega em 2-4 dias úteis na região metropolitana de Lima.","Livraison en 2-4 jours ouvrables dans le Grand Lima.","Lieferung in 2-4 Werktagen im Großraum Lima.","Consegna in 2-4 giorni lavorativi nell'area metropolitana di Lima."],
"pd.ship_peru": ["En todo el Perú","All over Peru","Em todo o Peru","Dans tout le Pérou","In ganz Peru","In tutto il Perù"],
"pd.ship_peru_desc": ["Envíos a nivel nacional con empresas de confianza.","Nationwide shipping with trusted carriers.","Envios a nível nacional com empresas de confiança.","Livraison nationale avec des transporteurs de confiance.","Nationaler Versand mit vertrauenswürdigen Partnern.","Spedizioni nazionali con corrieri affidabili."],
"pd.returns_free": ["Devoluciones gratis","Free returns","Devoluções grátis","Retours gratuits","Kostenlose Rückgabe","Resi gratuiti"],
"pd.returns_free_desc": ["30 días para devolver tu producto sin costo.","30 days to return your product at no cost.","30 dias para devolver seu produto sem custo.","30 jours pour retourner votre produit gratuitement.","30 Tage Rückgaberecht kostenlos.","30 giorni per restituire il prodotto senza costi."],
"pd.reviews_title": ["Reseñas y valoraciones","Reviews & ratings","Avaliações e opiniões","Avis et notes","Bewertungen & Rezensionen","Recensioni e valutazioni"],
"pd.review_count": ["reseña(s)","review(s)","avaliação(ões)","avis","Bewertung(en)","recensione/i"],
"pd.write_review": ["✍️ Escribe una reseña","✍️ Write a review","✍️ Escreva uma avaliação","✍️ Écrire un avis","✍️ Bewertung schreiben","✍️ Scrivi una recensione"],
"pd.review_placeholder": ["Comparte tu experiencia...","Share your experience...","Compartilhe sua experiência...","Partagez votre expérience...","Teile deine Erfahrung...","Condividi la tua esperienza..."],
"pd.send_review": ["Enviar reseña","Submit review","Enviar avaliação","Envoyer l'avis","Bewertung senden","Invia recensione"],
"pd.no_reviews": ["No hay reseñas aún. ¡Sé el primero en opinar!","No reviews yet. Be the first to share your opinion!","Ainda não há avaliações. Seja o primeiro a opinar!","Pas encore d'avis. Soyez le premier à donner votre avis !","Noch keine Bewertungen. Sei der Erste, der seine Meinung teilt!","Ancora nessuna recensione. Sii il primo a dare la tua opinione!"],
"pd.related": ["🔄 Productos relacionados","🔄 Related products","🔄 Produtos relacionados","🔄 Produits similaires","🔄 Ähnliche Produkte","🔄 Prodotti correlati"],
# ---- soporte ----
"sup.title": ["Soporte al Cliente","Customer Support","Suporte ao Cliente","Support Client","Kundensupport","Assistenza Clienti"],
"sup.create_ticket": ["Crear Ticket","Create Ticket","Criar Ticket","Créer un ticket","Ticket erstellen","Crea ticket"],
"sup.subject": ["Asunto","Subject","Assunto","Sujet","Betreff","Oggetto"],
"sup.priority": ["Prioridad","Priority","Prioridade","Priorité","Priorität","Priorità"],
"sup.low": ["Baja","Low","Baixa","Basse","Niedrig","Bassa"],
"sup.medium": ["Media","Medium","Média","Moyenne","Mittel","Media"],
"sup.high": ["Alta","High","Alta","Haute","Hoch","Alta"],
"sup.urgent": ["Urgente","Urgent","Urgente","Urgent","Dringend","Urgente"],
"sup.description": ["Descripción","Description","Descrição","Description","Beschreibung","Descrizione"],
"sup.send": ["Enviar Ticket","Submit Ticket","Enviar Ticket","Envoyer le ticket","Ticket senden","Invia ticket"],
"sup.my_tickets": ["Mis Tickets","My Tickets","Meus Tickets","Mes tickets","Meine Tickets","I miei ticket"],
"sup.loading": ["Cargando tickets...","Loading tickets...","Carregando tickets...","Chargement des tickets...","Tickets werden geladen...","Caricamento ticket..."],
# ---- confirmación ----
"conf.title": ["¡Pedido confirmado!","Order confirmed!","Pedido confirmado!","Commande confirmée !","Bestellung bestätigt!","Ordine confermato!"],
"conf.order": ["Pedido","Order","Pedido","Commande","Bestellung","Ordine"],
"conf.shipping": ["Envío","Shipping","Envio","Livraison","Versand","Spedizione"],
"conf.free_shipping": ["Gratis 🎉","Free 🎉","Grátis 🎉","Gratuit 🎉","Kostenlos 🎉","Gratis 🎉"],
"conf.discount": ["Descuento","Discount","Desconto","Remise","Rabatt","Sconto"],
"conf.total": ["Total","Total","Total","Total","Gesamt","Totale"],
"conf.step1": ["Pedido recibido","Order received","Pedido recebido","Commande reçue","Bestellung erhalten","Ordine ricevuto"],
"conf.step2": ["Confirmado","Confirmed","Confirmado","Confirmée","Bestätigt","Confermato"],
"conf.step3": ["Enviado","Shipped","Enviado","Expédiée","Versendet","Spedito"],
"conf.step4": ["Entregado","Delivered","Entregue","Livrée","Zugestellt","Consegnato"],
"conf.cancelled": ["Este pedido fue cancelado.","This order was cancelled.","Este pedido foi cancelado.","Cette commande a été annulée.","Diese Bestellung wurde storniert.","Questo ordine è stato annullato."],
"conf.no_order": ["No se encontró información del pedido.","No order information found.","Nenhuma informação do pedido encontrada.","Aucune information de commande trouvée.","Keine Bestellinformationen gefunden.","Nessuna informazione sull'ordine trovata."],
"conf.continue": ["Seguir comprando","Keep shopping","Continuar comprando","Continuer mes achats","Weiter einkaufen","Continua lo shopping"],
"conf.my_orders": ["Mis pedidos","My orders","Meus pedidos","Mes commandes","Meine Bestellungen","I miei ordini"],
# ---- impacto ----
"imp2.hero_title": ["Impacto ecológico real","Real ecological impact","Impacto ecológico real","Impact écologique réel","Echter ökologischer Einfluss","Impatto ecologico reale"],
"imp2.hero_desc": ["En EcoMarket transformamos el consumo con productos sostenibles, reducción de residuos y un mercado más justo.","At EcoMarket we transform consumption with sustainable products, waste reduction and a fairer market.","Na EcoMarket transformamos o consumo com produtos sustentáveis, redução de resíduos e um mercado mais justo.","Chez EcoMarket, nous transformons la consommation avec des produits durables, la réduction des déchets et un marché plus équitable.","Bei EcoMarket verwandeln wir den Konsum mit nachhaltigen Produkten, Abfallreduktion und einem gerechteren Markt.","Su EcoMarket trasformiamo i consumi con prodotti sostenibili, riduzione dei rifiuti e un mercato più equo."],
"imp2.stat_products": ["Productos ecológicos","Eco-friendly products","Produtos ecológicos","Produits écologiques","Öko-Produkte","Prodotti ecologici"],
"imp2.stat_categories": ["Categorías","Categories","Categorias","Catégories","Kategorien","Categorie"],
"imp2.stat_users": ["Usuarios","Users","Usuários","Utilisateurs","Benutzer","Utenti"],
"imp2.stat_reviews": ["Reseñas","Reviews","Avaliações","Avis","Bewertungen","Recensioni"],
"imp2.stat_orders": ["Pedidos","Orders","Pedidos","Commandes","Bestellungen","Ordini"],
"imp2.stat_visits": ["Visitas","Visits","Visitas","Visites","Besuche","Visite"],
"imp2.plastic_title": ["Reducción de plástico","Plastic reduction","Redução de plástico","Réduction du plastique","Plastreduktion","Riduzione della plastica"],
"imp2.plastic_desc": ["Más del 75% de los productos destacados son reutilizables o biodegradables, ayudando a disminuir plásticos de un solo uso.","Over 75% of featured products are reusable or biodegradable, helping reduce single-use plastics.","Mais de 75% dos produtos em destaque são reutilizáveis ou biodegradáveis, ajudando a diminuir plásticos de uso único.","Plus de 75 % des produits en vedette sont réutilisables ou biodégradables, aidant à réduire les plastiques à usage unique.","Über 75 % der vorgestellten Produkte sind wiederverwendbar oder biologisch abbaubar und helfen, Einwegplastik zu reduzieren.","Oltre il 75% dei prodotti in evidenza è riutilizzabile o biodegradabile, aiutando a ridurre la plastica monouso."],
"imp2.plastic_label": ["76% de reducción estimada","76% estimated reduction","76% de redução estimada","76 % de réduction estimée","76 % geschätzte Reduktion","76% di riduzione stimata"],
"imp2.fair_title": ["Comercio justo","Fair trade","Comércio justo","Commerce équitable","Fairer Handel","Commercio equo"],
"imp2.fair_desc": ["Apoyamos creadores locales y materiales responsables para garantizar un impacto social positivo.","We support local creators and responsible materials to ensure a positive social impact.","Apoiamos criadores locais e materiais responsáveis para garantir um impacto social positivo.","Nous soutenons les créateurs locaux et les matériaux responsables pour garantir un impact social positif.","Wir unterstützen lokale Hersteller und verantwortungsvolle Materialien für positive soziale Auswirkungen.","Sosteniamo creatori locali e materiali responsabili per garantire un impatto sociale positivo."],
"imp2.fair_label": ["82% de productos con origen responsable","82% of products with responsible sourcing","82% dos produtos com origem responsável","82 % des produits à l'origine responsable","82 % der Produkte mit verantwortungsvoller Herkunft","82% di prodotti a origine responsabile"],
"imp2.energy_title": ["Energía limpia","Clean energy","Energia limpa","Énergie propre","Saubere Energie","Energia pulita"],
"imp2.energy_desc": ["Diseño eficiente y servidores ligeros ayudan a reducir el consumo energético de la plataforma.","Efficient design and lightweight servers help reduce the platform's energy consumption.","Design eficiente e servidores leves ajudam a reduzir o consumo de energia da plataforma.","Un design efficace et des serveurs légers aident à réduire la consommation d'énergie de la plateforme.","Effizientes Design und leichte Server helfen, den Energieverbrauch der Plattform zu senken.","Design efficiente e server leggeri aiutano a ridurre il consumo energetico della piattaforma."],
"imp2.energy_label": ["69% de huella energética reducida","69% reduced energy footprint","69% de pegada energética reduzida","69 % d'empreinte énergétique réduite","69 % reduzierter ökologischer Fußabdruck","69% di impronta energetica ridotta"],
"imp2.stats_tag": ["Estadísticas en tiempo real","Real-time statistics","Estatísticas em tempo real","Statistiques en temps réel","Echtzeit-Statistiken","Statistiche in tempo reale"],
"imp2.stats_title": ["Nuestro impacto ambiental detallado","Our detailed environmental impact","Nosso impacto ambiental detalhado","Notre impact environnemental détaillé","Unser detaillierter Umwelteinfluss","Il nostro impatto ambientale dettagliato"],
"imp2.waste_title": ["Reducción de residuos por categoría","Waste reduction by category","Redução de resíduos por categoria","Réduction des déchets par catégorie","Abfallreduktion nach Kategorie","Riduzione dei rifiuti per categoria"],
"imp2.cat_plastic": ["Plástico","Plastic","Plástico","Plastique","Plastik","Plastica"],
"imp2.cat_paper": ["Papel","Paper","Papel","Papier","Papier","Carta"],
"imp2.cat_metal": ["Metal","Metal","Metal","Métal","Metall","Metallo"],
"imp2.cat_organic": ["Orgánico","Organic","Orgânico","Organique","Bio","Biologico"],
"imp2.community_title": ["Crecimiento de la comunidad","Community growth","Crescimento da comunidade","Croissance de la communauté","Community-Wachstum","Crescita della comunità"],
"imp2.legend_new": ["Nuevos (45%)","New (45%)","Novos (45%)","Nouveaux (45 %)","Neu (45 %)","Nuovi (45%)"],
"imp2.legend_active": ["Activos (35%)","Active (35%)","Ativos (35%)","Actifs (35 %)","Aktiv (35 %)","Attivi (35%)"],
"imp2.legend_returning": ["Recurrentes (20%)","Returning (20%)","Recorrentes (20%)","Récurrents (20 %)","Wiederkehrend (20 %)","Ricorrenti (20%)"],
"imp2.commitment_title": ["Nuestro compromiso","Our commitment","Nosso compromisso","Notre engagement","Unser Engagement","Il nostro impegno"],
"imp2.commitment_desc": ["EcoMarket combina productos inteligentes, diseño accesible y una experiencia pensada para cuidar al planeta.","EcoMarket combines smart products, accessible design and an experience designed to care for the planet.","A EcoMarket combina produtos inteligentes, design acessível e uma experiência pensada para cuidar do planeta.","EcoMarket combine des produits intelligents, un design accessible et une expérience pensée pour protéger la planète.","EcoMarket verbindet smarte Produkte, barrierefreies Design und ein Erlebnis zum Schutz des Planeten.","EcoMarket combina prodotti intelligenti, design accessibile e un'esperienza pensata per prendersi cura del pianeta."],
"imp2.transparency_title": ["Transparencia ambiental","Environmental transparency","Transparência ambiental","Transparence environnementale","Umwelttransparenz","Trasparenza ambientale"],
"imp2.transparency_desc": ["Cada producto muestra su categoría, descripción clara y un enfoque dirigido a la sostenibilidad.","Every product shows its category, clear description and a sustainability-focused approach.","Cada produto mostra sua categoria, descrição clara e um foco voltado à sustentabilidade.","Chaque produit affiche sa catégorie, une description claire et une approche axée sur la durabilité.","Jedes Produkt zeigt seine Kategorie, eine klare Beschreibung und einen auf Nachhaltigkeit ausgerichteten Ansatz.","Ogni prodotto mostra la sua categoria, una descrizione chiara e un approccio orientato alla sostenibilità."],
"imp2.ui_title": ["Interfaz cuidada","Carefully crafted interface","Interface cuidada","Interface soignée","Gepflegte Oberfläche","Interfaccia curata"],
"imp2.ui_desc": ["Fondos suaves, gradientes delicados y sombras sutiles hacen que navegar sea cómodo y atractivo.","Soft backgrounds, delicate gradients and subtle shadows make browsing comfortable and attractive.","Fundos suaves, gradientes delicados e sombras sutis tornam a navegação confortável e atraente.","Des arrière-plans doux, des dégradés délicats et des ombres subtiles rendent la navigation confortable et attrayante.","Sanfte Hintergründe, zarte Verläufe und subtile Schatten machen das Surfen komfortabel und attraktiv.","Sfondi delicati, gradienti raffinati e ombre sottili rendono la navigazione confortevole e attraente."],
"imp2.dark_title": ["Modo oscuro","Dark mode","Modo escuro","Mode sombre","Dunkelmodus","Modalità scura"],
"imp2.dark_desc": ["Activa el modo nocturno para trabajar con menos fatiga visual y conservar una atmósfera elegante.","Enable night mode to work with less eye strain and keep an elegant atmosphere.","Ative o modo noturno para trabalhar com menos fadiga visual e manter uma atmosfera elegante.","Activez le mode nuit pour travailler avec moins de fatigue oculaire et conserver une atmosphère élégante.","Aktiviere den Nachtmodus, um mit weniger Ermüdung zu arbeiten und eine elegante Atmosphäre zu bewahren.","Attiva la modalità notte per lavorare con meno affaticamento visivo e mantenere un'atmosfera elegante."],
}

langs = ["es","en","pt","fr","de","it"]
lines = ["    pagesI18n: {"]
for key, vals in T.items():
    lines.append("        '%s': {" % key)
    for lang, v in zip(langs, vals):
        esc = v.replace("\\","\\\\").replace("'","\\'")
        lines.append("            '%s': '%s'," % (lang, esc))
    lines.append("        },")
lines.append("    },")
block = "\n".join(lines) + "\n"

s = io.open(PATH, encoding="utf-8").read()
marker = "    init() {\n        for (const lang in this.homeI18n) {"
assert marker in s, "marker not found"
s = s.replace(marker, block + "\n    init() {\n        for (const lang in this.homeI18n) {", 1)
old_loop = """        for (const lang in this.homeI18n) {
            this.translations[lang] = Object.assign({}, this.translations[lang], this.homeI18n[lang]);
        }"""
new_loop = old_loop + """
        for (const lang in this.pagesI18n) {
            this.translations[lang] = Object.assign({}, this.translations[lang], this.pagesI18n[lang]);
        }"""
assert old_loop in s
s = s.replace(old_loop, new_loop, 1)
io.open(PATH, "w", encoding="utf-8", newline="\n").write(s)
print("pagesI18n keys:", len(T))
