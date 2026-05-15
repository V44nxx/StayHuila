/**
 * StayHuila — i18n Engine v2
 * Traduce automáticamente por href + data-i18n en todas las páginas
 */

const LANGUAGES = {
    es: { name: 'Español',   flag: '🇨🇴' },
    en: { name: 'English',   flag: '🇬🇧' },
    pt: { name: 'Português', flag: '🇧🇷' },
    fr: { name: 'Français',  flag: '🇫🇷' },
    it: { name: 'Italiano',  flag: '🇮🇹' },
};

const T = {
    es: {
        'nav.lodgings':'Hospedajes','nav.experiences':'Experiencias','nav.community':'Comunidad',
        'nav.host_panel':'Panel Anfitrión','nav.my_profile':'Mi Perfil','nav.my_bookings':'Mis Reservas',
        'nav.my_favorites':'Mis Favoritos','nav.logout':'Cerrar Sesión','nav.login':'Iniciar Sesión',
        'hero.title':'Descubre la esencia del Huila',
        'hero.subtitle':'Hospedajes rurales, fincas y cabañas mágicas recomendadas para ti',
        'hero.loc':'Ubicación / Experiencia','hero.checkin':'Llegada','hero.checkout':'Salida',
        'hero.guests':'Huéspedes','hero.loc_ph':'Ej. Aventura en Tatacoa...','hero.guests_ph':'¿Cuántos?',
        'cat.coffee':'Fincas Cafeteras','cat.eco':'Sostenible & Eco','cat.desert':'Desierto',
        'cat.romantic':'Romántico','cat.adventure':'Aventura','cat.rest':'Descanso Profundo','cat.nearby':'Cerca de ti',
        'listings.title':'Recomendaciones para ti','listings.subtitle':'Seleccionados especialmente según tus gustos',
        'listings.btn':'Ver detalles','map.show':'Mostrar Mapa','general.offline':'Disponible Offline',
        'general.night':'noche','general.per_person':'por persona','general.back_home':'Volver al inicio',
        'page.lodgings.h1':'Hospedajes en el Huila','page.exp.h1':'Experiencias en el Huila',
        'login.welcome':'Bienvenido de nuevo','login.sub':'Accede a tu cuenta para gestionar tus reservas',
        'login.email':'Correo electrónico','login.pw':'Contraseña','login.btn':'Iniciar Sesión',
        'login.no_acc':'¿No tienes cuenta?','login.create':'Crear cuenta gratis',
        'login.hero_title':'Vive la magia del Huila',
        'login.hero_sub':'Hospedajes auténticos, experiencias únicas y la calidez de nuestra gente',
        'login.feat1':'Reservas 100% seguras','login.feat2':'Anfitriones verificados',
        'login.feat3':'Gana puntos con cada reserva','login.feat4':'Soporte 24/7',
        'tab.login':'Iniciar Sesión','tab.register':'Registrarse',
        'reg.title':'Crear cuenta','reg.sub':'Únete a la comunidad StayHuila gratis','reg.btn':'Crear cuenta',
        'form.name':'Nombre','form.lastname':'Apellido','form.phone':'Teléfono',
        'form.email_ph':'tu@correo.com','form.pw_ph':'Tu contraseña','form.name_ph':'Tu nombre',
        'form.lastname_ph':'Tu apellido','form.phone_ph':'Ej. 310...','form.pw_reg_ph':'Mínimo 6 caracteres',
        'reg.agree':'Al registrarte aceptas nuestros','reg.terms':'Términos de uso',
        'login.next_alert':'Inicia sesión para completar tu reserva',
        'profile.title':'Información Personal','profile.sub':'Gestiona tus datos personales.',
        'profile.basic_data':'Datos Básicos','profile.change_pw':'Cambiar Contraseña',
        'profile.new_pw':'Nueva Contraseña','profile.confirm_pw':'Confirmar Contraseña',
        'profile.save':'Guardar Cambios','profile.points':'Puntos StayHuila',
        'profile.level_text':'Nivel Explorador. ¡Sigue viajando para alcanzar el nivel Aventurero!',
        'role.host':'Anfitrión','role.admin':'Administrador','role.guest':'Huésped',
        'reservas.title':'Mis Reservas',
        'filter.all':'Todas','filter.confirmed':'Confirmadas','filter.checkin':'En estadía',
        'filter.completed':'Completadas','filter.cancelled':'Canceladas',
        'status.confirmed':'Confirmada','status.checkin':'En estadía','status.completed':'Completada',
        'status.cancelled':'Cancelada','status.pending':'Pendiente',
        'status.repair':'En reparación','status.open':'Abierta',
        'bookings.new':'+ Nueva reserva','bookings.view':'Ver detalle','bookings.code':'Código',
        'bookings.empty_title':'Aún no tienes reservas',
        'bookings.empty_sub':'Explora los hospedajes del Huila y vive una experiencia única',
        'bookings.explore':'Explorar hospedajes',
        'booking.confirm':'Confirmar y pagar','booking.page_title':'Confirma y paga',
        'booking.page_sub':'Revisa los detalles antes de confirmar tu reserva',
        'booking.your_trip':'Tu viaje','booking.checkin':'LLEGADA','booking.checkout':'SALIDA',
        'booking.guests_label':'HUÉSPEDES','booking.payment_method':'Método de pago',
        'booking.notes':'Notas para el anfitrión','booking.secure':'Pago 100% seguro y cifrado',
        'payment.card':'Tarjeta','payment.cash':'Efectivo',
        'search.clear':'Limpiar filtros',
        'community.trending':'Tendencias','community.post_btn':'Publicar','community.reviews':'reseñas',
        'community.title':'Comunidad StayHuila','community.subtitle':'Comparte tus aventuras',
        'map.user_location':'Estás aquí',
        'detail.share':'Compartir','detail.save':'Guardar','detail.all_photos':'Ver todas las fotos',
        'detail.super_host':'SuperAnfitrión','detail.more':'Mostrar más','detail.less':'Mostrar menos',
        'detail.offers':'Lo que ofrece este lugar','detail.checkin_at':'Check-in a las','detail.checkout_at':'Checkout a las',
        'booking.reserve':'Reservar','booking.reserve_disabled':'Reservar (Deshabilitado)',
        'booking.no_charge':'No se te cobrará nada aún','booking.nights':'noches','booking.service_fee':'Tarifa de servicio',
        'booking.total':'Total','booking.max_guests':'Máx. {n} huéspedes',
        'booking.repair_msg':'Este hospedaje se encuentra actualmente en reparación o mantenimiento. Las reservas están deshabilitadas temporalmente.',
        'ai.sub':'Tu asistente de viajes','ai.ph':'Escribe tu búsqueda...',
    },
    en: {
        'nav.lodgings':'Lodgings','nav.experiences':'Experiences','nav.community':'Community',
        'nav.host_panel':'Host Panel','nav.my_profile':'My Profile','nav.my_bookings':'My Bookings',
        'nav.my_favorites':'My Favorites','nav.logout':'Log Out','nav.login':'Log In',
        'hero.title':'Discover the Essence of Huila',
        'hero.subtitle':'Rural lodgings, farms & magical cabins recommended for you',
        'hero.loc':'Location / Experience','hero.checkin':'Check-in','hero.checkout':'Check-out',
        'hero.guests':'Guests','hero.loc_ph':'E.g. Adventure in Tatacoa...','hero.guests_ph':'How many?',
        'cat.coffee':'Coffee Farms','cat.eco':'Sustainable & Eco','cat.desert':'Desert',
        'cat.romantic':'Romantic','cat.adventure':'Adventure','cat.rest':'Deep Rest','cat.nearby':'Near Me',
        'listings.title':'Recommendations for You','listings.subtitle':'Specially selected based on your preferences',
        'listings.btn':'See details','map.show':'Show Map','general.offline':'Available Offline',
        'general.night':'night','general.per_person':'per person','general.back_home':'Back to home',
        'page.lodgings.h1':'Lodgings in Huila','page.exp.h1':'Experiences in Huila',
        'login.welcome':'Welcome back','login.sub':'Access your account to manage your bookings',
        'login.email':'Email address','login.pw':'Password','login.btn':'Log In',
        'login.no_acc':"Don't have an account?",'login.create':'Create free account',
        'login.hero_title':'Live the Magic of Huila',
        'login.hero_sub':'Authentic lodgings, unique experiences and the warmth of our people',
        'login.feat1':'100% secure bookings','login.feat2':'Verified hosts',
        'login.feat3':'Earn points with every booking','login.feat4':'24/7 Support',
        'tab.login':'Log In','tab.register':'Sign Up',
        'reg.title':'Create account','reg.sub':'Join the StayHuila community for free','reg.btn':'Create account',
        'form.name':'First Name','form.lastname':'Last Name','form.phone':'Phone',
        'form.email_ph':'your@email.com','form.pw_ph':'Your password','form.name_ph':'Your name',
        'form.lastname_ph':'Your last name','form.phone_ph':'E.g. 310...','form.pw_reg_ph':'Min 6 characters',
        'reg.agree':'By signing up you agree to our','reg.terms':'Terms of use',
        'login.next_alert':'Log in to complete your booking',
        'profile.title':'Personal Information','profile.sub':'Manage your personal data.',
        'profile.basic_data':'Basic Info','profile.change_pw':'Change Password',
        'profile.new_pw':'New Password','profile.confirm_pw':'Confirm Password',
        'profile.save':'Save Changes','profile.points':'StayHuila Points',
        'profile.level_text':'Explorer Level. Keep traveling to reach Adventurer!',
        'role.host':'Host','role.admin':'Administrator','role.guest':'Guest',
        'reservas.title':'My Bookings',
        'filter.all':'All','filter.confirmed':'Confirmed','filter.checkin':'Staying',
        'filter.completed':'Completed','filter.cancelled':'Cancelled',
        'status.confirmed':'Confirmed','status.checkin':'Staying','status.completed':'Completed',
        'status.cancelled':'Cancelled','status.pending':'Pending',
        'status.repair':'Under Maintenance','status.open':'Open',
        'bookings.new':'+ New booking','bookings.view':'View detail','bookings.code':'Code',
        'bookings.empty_title':'No bookings yet',
        'bookings.empty_sub':'Explore Huila lodgings and live a unique experience',
        'bookings.explore':'Explore lodgings',
        'booking.confirm':'Confirm & Pay','booking.page_title':'Confirm & Pay',
        'booking.page_sub':'Review details before confirming your booking',
        'booking.your_trip':'Your trip','booking.checkin':'CHECK-IN','booking.checkout':'CHECK-OUT',
        'booking.guests_label':'GUESTS','booking.payment_method':'Payment method',
        'booking.notes':'Notes for host','booking.secure':'100% secure and encrypted payment',
        'payment.card':'Card','payment.cash':'Cash',
        'search.clear':'Clear filters',
        'community.trending':'Trending','community.post_btn':'Post','community.reviews':'reviews',
        'community.title':'StayHuila Community','community.subtitle':'Share your adventures',
        'map.user_location':'You are here',
        'detail.share':'Share','detail.save':'Save','detail.all_photos':'See all photos',
        'detail.super_host':'SuperHost','detail.more':'Show more','detail.less':'Show less',
        'detail.offers':'What this place offers','detail.checkin_at':'Check-in at','detail.checkout_at':'Checkout at',
        'booking.reserve':'Reserve','booking.reserve_disabled':'Reserve (Disabled)',
        'booking.no_charge':"You won't be charged yet",'booking.nights':'nights','booking.service_fee':'Service fee',
        'booking.total':'Total','booking.max_guests':'Max. {n} guests',
        'booking.repair_msg':'This lodging is currently under repair or maintenance. Bookings are temporarily disabled.',
        'ai.sub':'Your travel assistant','ai.ph':'Type your search...',
    },
    pt: {
        'nav.lodgings':'Hospedagens','nav.experiences':'Experiências','nav.community':'Comunidade',
        'nav.host_panel':'Painel do Anfitrião','nav.my_profile':'Meu Perfil','nav.my_bookings':'Minhas Reservas',
        'nav.my_favorites':'Meus Favoritos','nav.logout':'Sair','nav.login':'Entrar',
        'hero.title':'Descubra a Essência do Huila',
        'hero.subtitle':'Hospedagens rurais, fazendas e cabanas mágicas recomendadas para você',
        'hero.loc':'Localização / Experiência','hero.checkin':'Check-in','hero.checkout':'Check-out',
        'hero.guests':'Hóspedes','hero.loc_ph':'Ex. Aventura no Tatacoa...','hero.guests_ph':'Quantos?',
        'cat.coffee':'Fazendas de Café','cat.eco':'Sustentável & Eco','cat.desert':'Deserto',
        'cat.romantic':'Romântico','cat.adventure':'Aventura','cat.rest':'Descanso Profundo','cat.nearby':'Perto de Mim',
        'listings.title':'Recommandations para Você','listings.subtitle':'Selecionados especialmente para você',
        'listings.btn':'Ver detalhes','map.show':'Mostrar Mapa','general.offline':'Disponível Offline',
        'general.night':'noite','general.per_person':'por pessoa','general.back_home':'Voltar ao início',
        'page.lodgings.h1':'Hospedagens no Huila','page.exp.h1':'Experiências no Huila',
        'login.welcome':'Bem-vindo de volta','login.sub':'Acesse sua conta para gerenciar suas reservas',
        'login.email':'Endereço de e-mail','login.pw':'Senha','login.btn':'Entrar',
        'login.no_acc':'Não tem uma cuenta?','login.create':'Criar conta gratuita',
        'login.hero_title':'Viva a Magia do Huila',
        'login.hero_sub':'Hospedagens autênticas, experiências únicas e o calor do nosso povo',
        'login.feat1':'Reservas 100% seguras','login.feat2':'Anfitriões verificados',
        'login.feat3':'Ganhe pontos em cada reserva','login.feat4':'Suporte 24/7',
        'tab.login':'Entrar','tab.register':'Registrar',
        'reg.title':'Criar conta','reg.sub':'Junte-se à comunidade StayHuila','reg.btn':'Criar conta',
        'form.name':'Nome','form.lastname':'Sobrenome','form.phone':'Telefone',
        'form.email_ph':'seu@email.com','form.pw_ph':'Sua senha','form.name_ph':'Seu nome',
        'form.lastname_ph':'Seu sobrenome','form.phone_ph':'Ex. 310...','form.pw_reg_ph':'Mínimo 6 caracteres',
        'reg.agree':'Ao se registrar, você aceita nossos','reg.terms':'Termos de uso',
        'login.next_alert':'Faça login para concluir sua reserva',
        'profile.title':'Informações Pessoais','profile.sub':'Gerencie seus dados pessoais.',
        'profile.basic_data':'Dados Básicos','profile.change_pw':'Alterar Senha',
        'profile.new_pw':'Nova Senha','profile.confirm_pw':'Confirmar Senha',
        'profile.save':'Salvar Alterações','profile.points':'Pontos StayHuila',
        'profile.level_text':'Nível Explorador. Continue viajando para alcançar o nível Aventureiro!',
        'role.host':'Anfitrião','role.admin':'Administrador','role.guest':'Hóspede',
        'reservas.title':'Minhas Reservas',
        'filter.all':'Todas','filter.confirmed':'Confirmadas','filter.checkin':'Hospedado',
        'filter.completed':'Concluídas','filter.cancelled':'Canceladas',
        'status.confirmed':'Confirmada','status.checkin':'Hospedado','status.completed':'Concluída',
        'status.cancelled':'Cancelada','status.pending':'Pendente',
        'status.repair':'Em Manutenção','status.open':'Aberto',
        'bookings.new':'+ Nova reserva','bookings.view':'Ver detalhe','bookings.code':'Código',
        'bookings.empty_title':'Ainda não tem reservas',
        'bookings.empty_sub':'Explore as hospedagens do Huila e viva uma experiência única',
        'bookings.explore':'Explorar hospedagens',
        'booking.confirm':'Confirmar e pagar','booking.page_title':'Confirmar e pagar',
        'booking.page_sub':'Revise os detalhes antes de confirmar sua reserva',
        'booking.your_trip':'Sua viagem','booking.checkin':'CHEGADA','booking.checkout':'SAÍDA',
        'booking.guests_label':'HÓSPEDES','booking.payment_method':'Método de pagamento',
        'booking.notes':'Notas para o anfitrião','booking.secure':'Pagamento 100% seguro e criptografado',
        'payment.card':'Cartão','payment.cash':'Dinheiro',
        'search.clear':'Limpar filtros',
        'community.trending':'Tendências','community.post_btn':'Publicar','community.reviews':'avaliações',
        'community.title':'Comunidade StayHuila','community.subtitle':'Compartilhe suas aventuras',
        'map.user_location':'Você está aqui',
        'detail.share':'Compartilhar','detail.save':'Salvar','detail.all_photos':'Ver todas as fotos',
        'detail.super_host':'SuperAnfitrião','detail.more':'Mostrar mais','detail.less':'Mostrar menos',
        'detail.offers':'O que este lugar oferece','detail.checkin_at':'Check-in às','detail.checkout_at':'Checkout às',
        'booking.reserve':'Reservar','booking.reserve_disabled':'Reservar (Desabilitado)',
        'booking.no_charge':'Nada será cobrado ainda','booking.nights':'noites','booking.service_fee':'Taxa de serviço',
        'booking.total':'Total','booking.max_guests':'Máx. {n} hóspedes',
        'booking.repair_msg':'Esta hospedagem está em manutenção. As reservas estão temporariamente desativadas.',
        'ai.sub':'Seu assistente de viagens','ai.ph':'Digite sua busca...',
    },
    fr: {
        'nav.lodgings':'Hébergements','nav.experiences':'Expériences','nav.community':'Communauté',
        'nav.host_panel':"Tableau de l'hôte",'nav.my_profile':'Mon Profil','nav.my_bookings':'Mes Réservations',
        'nav.my_favorites':'Mes Favoris','nav.logout':'Se déconnecter','nav.login':'Se connecter',
        'hero.title':"Découvrez l'Essence du Huila",
        'hero.subtitle':'Hébergements ruraux, fermes et cabanes magiques recommandés pour vous',
        'hero.loc':'Lieu / Expérience','hero.checkin':'Arrivée','hero.checkout':'Départ',
        'hero.guests':'Voyageurs','hero.loc_ph':'Ex. Aventure à Tatacoa...','hero.guests_ph':'Combien ?',
        'cat.coffee':'Fermes à Café','cat.eco':'Durable & Éco','cat.desert':'Désert',
        'cat.romantic':'Romantique','cat.adventure':'Aventure','cat.rest':'Repos Profond','cat.nearby':'Près de Moi',
        'listings.title':'Recommandations pour Vous','listings.subtitle':'Sélectionnés spécialement pour vous',
        'listings.btn':'Voir les détails','map.show':'Afficher la Carte','general.offline':'Disponible Hors Ligne',
        'general.night':'nuit','general.per_person':'par personne','general.back_home':'Retour à l accueil',
        'page.lodgings.h1':'Hébergements à Huila','page.exp.h1':'Expériences à Huila',
        'login.welcome':'Bon retour','login.sub':'Accédez à votre compte pour gérer vos réservations',
        'login.email':'Adresse e-mail','login.pw':'Mot de passe','login.btn':'Se connecter',
        'login.no_acc':"Vous n'avez pas de compte ?",'login.create':'Créer un compte gratuit',
        'login.hero_title':'Vivez la Magie de Huila',
        'login.hero_sub':'Hébergements authentiques, expériences uniques et la chaleur de notre peuple',
        'login.feat1':'Réservations 100% sécurisées','login.feat2':'Hôtes vérifiés',
        'login.feat3':'Gagnez des points à chaque réservation','login.feat4':'Support 24/7',
        'tab.login':'Se connecter','tab.register':'S inscrire',
        'reg.title':'Créer un compte','reg.sub':'Rejoignez la communauté StayHuila','reg.btn':'Créer un compte',
        'form.name':'Prénom','form.lastname':'Nom','form.phone':'Téléphone',
        'form.email_ph':'votre@email.com','form.pw_ph':'Votre mot de passe','form.name_ph':'Votre prénom',
        'form.lastname_ph':'Votre nom','form.phone_ph':'Ex. 310...','form.pw_reg_ph':'Min 6 caractères',
        'reg.agree':'En vous inscrivant, vous acceptez nos','reg.terms':"Conditions d'utilisation",
        'login.next_alert':'Connectez-vous pour compléter votre réservation',
        'profile.title':'Informations Personnelles','profile.sub':'Gérez vos données personnelles.',
        'profile.basic_data':'Informations de base','profile.change_pw':'Changer le mot de passe',
        'profile.new_pw':'Nouveau mot de passe','profile.confirm_pw':'Confirmer le mot de passe',
        'profile.save':'Enregistrer les modifications','profile.points':'Points StayHuila',
        'profile.level_text':'Niveau Explorateur. Continuez à voyager pour atteindre le niveau Aventurier!',
        'role.host':'Hôte','role.admin':'Administrateur','role.guest':'Invité',
        'reservas.title':'Mes Réservations',
        'filter.all':'Toutes','filter.confirmed':'Confirmées','filter.checkin':'En séjour',
        'filter.completed':'Terminées','filter.cancelled':'Annulées',
        'status.confirmed':'Confirmée','status.checkin':'En séjour','status.completed':'Terminée',
        'status.cancelled':'Annulée','status.pending':'En attente',
        'status.repair':'En Maintenance','status.open':'Ouvert',
        'bookings.new':'+ Nouvelle réservation','bookings.view':'Voir détail','bookings.code':'Code',
        'bookings.empty_title':'Pas encore de réservations',
        'bookings.empty_sub':'Explorez les hébergements du Huila et vivez une expérience unique',
        'bookings.explore':'Explorer les hébergements',
        'booking.confirm':'Confirmer et payer','booking.page_title':'Confirmer et payer',
        'booking.page_sub':'Vérifiez les détails avant de confirmer votre réservation',
        'booking.your_trip':'Votre voyage','booking.checkin':'ARRIVÉE','booking.checkout':'DÉPART',
        'booking.guests_label':'VOYAGEURS','booking.payment_method':'Méthode de paiement',
        'booking.notes':'Notes pour l hôte','booking.secure':'Paiement 100% sécurisé et chiffré',
        'payment.card':'Carte','payment.cash':'Espèces',
        'search.clear':'Effacer filtres',
        'community.trending':'Tendances','community.post_btn':'Publier','community.reviews':'avis',
        'community.title':'Communauté StayHuila','community.subtitle':'Partagez vos aventures',
        'map.user_location':'Vous êtes ici',
        'detail.share':'Partager','detail.save':'Enregistrer','detail.all_photos':'Voir toutes les photos',
        'detail.super_host':'SuperHôte','detail.more':'En savoir plus','detail.less':'Afficher moins',
        'detail.offers':'Ce que propose ce logement','detail.checkin_at':'Arrivée à','detail.checkout_at':'Départ à',
        'booking.reserve':'Réserver','booking.reserve_disabled':'Réserver (Désactivé)',
        'booking.no_charge':'Aucun frais pour le moment','booking.nights':'nuits','booking.service_fee':'Frais de service',
        'booking.total':'Total','booking.max_guests':'Max. {n} voyageurs',
        'booking.repair_msg':'Ce logement est en cours de réparation. Les réservations sont temporairement désactivées.',
        'ai.sub':'Votre assistant voyage','ai.ph':'Tapez votre recherche...',
    },
    it: {
        'nav.lodgings':'Alloggi','nav.experiences':'Esperienze','nav.community':'Comunità',
        'nav.host_panel':'Pannello Ospitante','nav.my_profile':'Il Mio Profilo','nav.my_bookings':'Le Mie Prenotazioni',
        'nav.my_favorites':'I Miei Preferiti','nav.logout':'Esci','nav.login':'Accedi',
        'hero.title':"Scopri l'Essenza del Huila",
        'hero.subtitle':'Alloggi rurali, fattorie e baite magiche consigliate per te',
        'hero.loc':'Luogo / Esperienza','hero.checkin':'Arrivo','hero.checkout':'Partenza',
        'hero.guests':'Ospiti','hero.loc_ph':'Es. Avventura nel Tatacoa...','hero.guests_ph':'Quanti?',
        'cat.coffee':'Fattorie del Caffè','cat.eco':'Sostenibile & Eco','cat.desert':'Deserto',
        'cat.romantic':'Romantico','cat.adventure':'Avventura','cat.rest':'Riposo Profondo','cat.nearby':'Vicino a Me',
        'listings.title':'Raccomandazioni per Te','listings.subtitle':'Selezionati appositamente per te',
        'listings.btn':'Vedi dettagli','map.show':'Mostra Mappa','general.offline':'Disponible Offline',
        'general.night':'notte','general.per_person':'a persona','general.back_home':'Torna alla home',
        'page.lodgings.h1':'Alloggi nel Huila','page.exp.h1':'Esperienze nel Huila',
        'login.welcome':'Bentornato','login.sub':'Accedi al tuo account per gestire le tue prenotazioni',
        'login.email':'Indirizzo e-mail','login.pw':'Password','login.btn':'Accedi',
        'login.no_acc':'Non hai un account?','login.create':'Crea account gratuito',
        'login.hero_title':'Vivi la Magia del Huila',
        'login.hero_sub':'Alloggi autentici, esperienze uniche e il calore della nostra gente',
        'login.feat1':'Prenotazioni 100% sicure','login.feat2':'Host verificati',
        'login.feat3':'Guadagna punti ad ogni prenotazione','login.feat4':'Supporto 24/7',
        'tab.login':'Accedi','tab.register':'Registrati',
        'reg.title':'Crea account','reg.sub':'Unisciti alla comunità StayHuila','reg.btn':'Crea account',
        'form.name':'Nome','form.lastname':'Cognome','form.phone':'Telefono',
        'form.email_ph':'tuo@email.com','form.pw_ph':'Tua password','form.name_ph':'Tuo nome',
        'form.lastname_ph':'Tuo cognome','form.phone_ph':'Es. 310...','form.pw_reg_ph':'Minimo 6 caratteri',
        'reg.agree':'Registrandoti accetti i nostri','reg.terms':'Termini di utilizzo',
        'login.next_alert':'Accedi per completare la tua prenotazione',
        'profile.title':'Informazioni Personali','profile.sub':'Gestisci i tuoi dati personali.',
        'profile.basic_data':'Dati di Base','profile.change_pw':'Cambia Password',
        'profile.new_pw':'Nuova Password','profile.confirm_pw':'Conferma Password',
        'profile.save':'Salva Modifiche','profile.points':'Punti StayHuila',
        'profile.level_text':'Livello Esploratore. Continua a viaggiare per raggiungere il livello Avventuriero!',
        'role.host':'Ospitante','role.admin':'Amministratore','role.guest':'Ospite',
        'reservas.title':'Le Mie Prenotazioni',
        'filter.all':'Tutte','filter.confirmed':'Confermate','filter.checkin':'In soggiorno',
        'filter.completed':'Completate','filter.cancelled':'Cancellate',
        'status.confirmed':'Confermata','status.checkin':'In soggiorno','status.completed':'Completata',
        'status.cancelled':'Cancellata','status.pending':'In attesa',
        'status.repair':'In Manutenzione','status.open':'Aperto',
        'bookings.new':'+ Nuova prenotazione','bookings.view':'Vedi dettaglio','bookings.code':'Codice',
        'bookings.empty_title':'Ancora nessuna prenotazione',
        'bookings.empty_sub':"Esplora gli alloggi del Huila e vivi un'esperienza unica",
        'bookings.explore':'Esplora alloggi',
        'booking.confirm':'Conferma e paga','booking.page_title':'Conferma e paga',
        'booking.page_sub':'Controlla i dettagli prima di confermare la tua prenotazione',
        'booking.your_trip':'Il tuo viaggio','booking.checkin':'ARRIVO','booking.checkout':'PARTENZA',
        'booking.guests_label':'OSPITI','booking.payment_method':'Metodo di pagamento',
        'booking.notes':'Note per l ospitante','booking.secure':'Pagamento 100% sicuro e crittografato',
        'payment.card':'Carta','payment.cash':'Contanti',
        'search.clear':'Cancella filtri',
        'community.trending':'Tendenze','community.post_btn':'Pubblica','community.reviews':'recensioni',
        'community.title':'Comunità StayHuila','community.subtitle':'Condividi le tue avventure',
        'map.user_location':'Sei qui',
        'detail.share':'Condividi','detail.save':'Salva','detail.all_photos':'Vedi tutte le foto',
        'detail.super_host':'SuperHost','detail.more':'Mostra altro','detail.less':'Mostra meno',
        'detail.offers':'Cosa offre questo posto','detail.checkin_at':'Check-in alle','detail.checkout_at':'Checkout alle',
        'booking.reserve':'Prenota','booking.reserve_disabled':'Prenota (Disabilitato)',
        'booking.no_charge':'Non ti verrà addebitato nulla ancora','booking.nights':'notti','booking.service_fee':'Commissioni di servizio',
        'booking.total':'Totale','booking.max_guests':'Max. {n} ospiti',
        'booking.repair_msg':'Questo alloggio è attualmente in manutenzione. Le prenotazioni sono temporaneamente disabilitate.',
        'ai.sub':'Il tuo assistente di viaggio','ai.ph':'Scrivi la tua ricerca...',
    }
};

/* ── Auto-translate nav links by href ──────────────────── */
const NAV_HREF_MAP = {
    '/hospedajes': 'nav.lodgings',
    '/experiencias': 'nav.experiences',
    '/comunidad': 'nav.community',
    '/panel-anfitrion': 'nav.host_panel',
    '/perfil': 'nav.my_profile',
    '/mis-reservas': 'nav.my_bookings',
    '/favoritos': 'nav.my_favorites',
    '/logout': 'nav.logout',
    '/login': 'nav.login',
};

/* ── Engine ─────────────────────────────────────────────── */
const I18n = {
    current: localStorage.getItem('sh_lang') || 'es',

    t(key) {
        return (T[this.current] || T['es'])[key] || (T['es'][key] || key);
    },

    setLang(code) {
        if (!T[code]) return;
        this.current = code;
        localStorage.setItem('sh_lang', code);
        document.documentElement.lang = code;
        this.apply();
        this.updateSelector();
    },

    apply() {
        // 1. data-i18n attributes (text content)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = this.t(el.getAttribute('data-i18n'));
            const attr = el.getAttribute('data-i18n-attr');
            if (attr) el.setAttribute(attr, val);
            else el.textContent = val;
        });

        // 2. Nav links auto-translate by href
        Object.entries(NAV_HREF_MAP).forEach(([href, key]) => {
            document.querySelectorAll(`a[href="${href}"]`).forEach(el => {
                // Only update text nodes to preserve icons
                el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.textContent = ' ' + this.t(key);
                    }
                });
                // Update spans without data-i18n
                el.querySelectorAll('span:not([data-i18n])').forEach(span => {
                    if (span.textContent.trim()) span.textContent = this.t(key);
                });
            });
        });

        // 3. AI assistant placeholder & subtitle
        const aiInput = document.getElementById('ai-text-input');
        if (aiInput) aiInput.placeholder = this.t('ai.ph');
        document.querySelectorAll('.ai-header p').forEach(el => el.textContent = this.t('ai.sub'));
    },

    updateSelector() {
        const lang = LANGUAGES[this.current];
        const label = document.getElementById('lang-label');
        if (label) label.textContent = `${lang.flag} ${this.current.toUpperCase()}`;
    },

    init() {
        document.documentElement.lang = this.current;
        this.apply();
        this.updateSelector();
    }
};

/* ── Build Dropdown ─────────────────────────────────────── */
function buildLangDropdown() {
    const wrappers = document.querySelectorAll('.language-selector');
    if (wrappers.length === 0) return;

    const lang = LANGUAGES[I18n.current];
    const html = `
        <button class="lang-btn" onclick="toggleLangDropdown(event)" style="
            background:none;border:none;cursor:pointer;display:flex;align-items:center;
            gap:5px;font-weight:600;font-size:0.9rem;color:inherit;font-family:inherit;
            padding:4px 8px;border-radius:20px;transition:background 0.2s;">
            <i class="ph ph-globe" style="font-size:1.1rem;"></i>
            <span class="lang-label">${lang.flag} ${I18n.current.toUpperCase()}</span>
            <i class="ph ph-caret-down" style="font-size:0.75rem;opacity:0.7;"></i>
        </button>
        <div class="lang-dropdown" style="
            display:none;position:absolute;top:calc(100% + 8px);right:0;
            background:white;border-radius:16px;
            box-shadow:0 10px 40px rgba(0,0,0,0.15);padding:8px;
            min-width:190px;z-index:99999;
            border:1px solid rgba(0,0,0,0.08);animation:fadeInDown 0.2s ease;">
            ${Object.entries(LANGUAGES).map(([code, l]) => `
            <button onclick="I18n.setLang('${code}');closeLangDropdown();" style="
                display:flex;align-items:center;gap:10px;width:100%;
                padding:9px 14px;border:none;
                background:${I18n.current===code?'#f5f5f5':'transparent'};
                border-radius:10px;cursor:pointer;font-family:inherit;
                font-size:0.92rem;color:#1a1a1a;
                font-weight:${I18n.current===code?'700':'400'};
                text-align:left;transition:background 0.15s;"
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='${I18n.current===code?'#f5f5f5':'transparent'}'">
                <span style="font-size:1.3rem;">${l.flag}</span>
                <span>${l.name}</span>
                ${I18n.current===code?'<i class="ph-fill ph-check" style="margin-left:auto;color:#2C4A3B;"></i>':''}
            </button>`).join('')}
        </div>`;

    wrappers.forEach(wrapper => {
        wrapper.innerHTML = html;
        wrapper.style.position = 'relative';
    });
}

function toggleLangDropdown(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const dropdown = btn.nextElementSibling;
    
    // Close others
    document.querySelectorAll('.lang-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });

    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function closeLangDropdown() {
    document.querySelectorAll('.lang-dropdown').forEach(d => d.style.display = 'none');
    buildLangDropdown(); // Rebuild all to update checkmarks
}

document.addEventListener('click', () => {
    closeLangDropdown();
});

// Animation
const _s = document.createElement('style');
_s.textContent = `
    @keyframes fadeInDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    #lang-btn:hover{background:rgba(0,0,0,0.06)!important}
`;
document.head.appendChild(_s);

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    buildLangDropdown();
    I18n.init();
});
