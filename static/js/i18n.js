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
        'booking.max_prefix':'Máx.','booking.guests_lower':'huéspedes',
        'booking.repair_msg':'Este hospedaje se encuentra actualmente en reparación o mantenimiento. Las reservas están deshabilitadas temporalmente.',
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
        'booking.max_prefix':'Max.','booking.guests_lower':'guests',
        'booking.repair_msg':'This lodging is currently under repair or maintenance. Bookings are temporarily disabled.',
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
        'booking.reserve':'Reservar','booking.reserve_disabled':'Reservar (Deshabilitado)',
        'booking.no_charge':'Nada será cobrado ainda','booking.nights':'noites','booking.service_fee':'Taxa de serviço',
        'booking.total':'Total','booking.max_guests':'Máx. {n} hóspedes',
        'booking.max_prefix':'Máx.','booking.guests_lower':'hóspedes',
        'booking.repair_msg':'Esta hospedagem está em manutenção. As reservas estão temporariamente desativadas.',
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
        'booking.max_prefix':'Max.','booking.guests_lower':'voyageurs',
        'booking.repair_msg':'Ce logement est en cours de réparation. Les réservations sont temporairement désactivées.',
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
        'booking.max_prefix':'Max.','booking.guests_lower':'ospiti',
        'booking.repair_msg':'Questo alloggio è attualmente in manutenzione. Le prenotazioni sono temporaneamente disabilitate.',
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
        this.translateDynamic();
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

        // 3. Legacy TEXT map for hard-coded Spanish text
        const legacyMap = TEXT[this.current] || {};
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, label, strong, li').forEach(el => {
            if (el.closest('[data-i18n]') || el.closest('[data-i18n-dynamic]')) return;
            const text = el.textContent.trim();
            if (legacyMap[text] && el.children.length === 0) {
                el.textContent = legacyMap[text];
            }
        });
    },

    async translateDynamic() {
        if (this.current === 'es') {
            // Restaurar textos originales
            document.querySelectorAll('[data-i18n-original]').forEach(el => {
                if (el.dataset.i18nOriginal) {
                    el.textContent = el.dataset.i18nOriginal;
                    delete el.dataset.i18nOriginal;
                }
            });
            return;
        }

        const elements = Array.from(document.querySelectorAll('[data-i18n-dynamic]'));
        if (!elements.length) return;

        const texts = [];
        const elems = [];
        elements.forEach(el => {
            // Preservar original si aún no se ha guardado
            if (!el.dataset.i18nOriginal) {
                el.dataset.i18nOriginal = el.textContent;
            }
            const original = el.dataset.i18nOriginal;
            if (original && original.trim()) {
                texts.push(original.trim());
                elems.push(el);
            }
        });

        if (!texts.length) return;

        // Evitar traducir si ya están traducidos (evita loops)
        const alreadyTranslated = elems.every(el => el.dataset.i18nTranslated === this.current);
        if (alreadyTranslated) return;

        try {
            const resp = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: texts, lang: this.current })
            });
            const data = await resp.json();
            if (data.success && data.translations) {
                data.translations.forEach((t, i) => {
                    if (elems[i]) {
                        elems[i].textContent = t;
                        elems[i].dataset.i18nTranslated = this.current;
                    }
                });
            }
        } catch (e) {
            console.warn('[i18n] translateDynamic failed:', e);
        }
    },

    updateSelector() {
        const lang = LANGUAGES[this.current];
        const label = document.getElementById('lang-label');
        if (label) label.textContent = `${lang.flag} ${this.current.toUpperCase()}`;
    },

    init() {
        document.documentElement.lang = this.current;
        this.apply();
        this.translateDynamic();
        this.updateSelector();
    }
};
window.I18n = I18n;

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

document.addEventListener('click', closeLangDropdown);

/* Extra coverage for legacy templates that still have hard-coded Spanish text. */
(function enhanceLegacyI18n() {
    const TEXT = {
        en: {
            'Hospedajes':'Lodgings','Experiencias':'Experiences','Comunidad':'Community','Panel Anfitrion':'Host Panel','Panel Anfitrión':'Host Panel',
            'Mi Perfil':'My Profile','Mis Reservas':'My Bookings','Mis Favoritos':'My Favorites','Cerrar Sesión':'Log Out','Iniciar Sesión':'Log In',
            'Limpiar filtros':'Clear filters','Ver detalles':'See details','Ver todos':'See all','Buscar':'Search','Guardar':'Save','Compartir':'Share',
            'Hospedajes en el Huila':'Lodgings in Huila','Experiencias en el Huila':'Experiences in Huila','Resultados de búsqueda':'Search results','Inicio':'Home',
            'Categorías':'Categories','Todos':'All','Hospedajes':'Lodgings','Finca':'Farm','Cabaña':'Cabin','Glamping':'Glamping','Habitación privada':'Private room',
            'Hotel boutique':'Boutique hotel','Casa entera':'Entire house','Aventura':'Adventure','Cultural':'Cultural','Gastronomía':'Gastronomy','Naturaleza':'Nature',
            'Deportes':'Sports','Bienestar':'Wellness','Arte':'Art','Noche':'Night','Ubicación':'Location','Cerca de ti':'Near you',
            'Mis Puntos':'My Points','Puntos StayHuila':'StayHuila Points','Clic para ver tus puntos':'Click to view your points',
            'Información Personal':'Personal Information','Datos Básicos':'Basic Info','Cambiar Contraseña':'Change Password','Nombre(s)':'First name',
            'Apellidos':'Last name','Correo Electrónico':'Email Address','Teléfono':'Phone','Nueva Contraseña':'New Password','Confirmar Contraseña':'Confirm Password',
            'Guardar Cambios':'Save Changes','Cambiar foto':'Change photo','Eliminar foto':'Delete photo','Cerrar':'Close','Canjear':'Redeem','Canjear puntos':'Redeem points',
            'Cómo ganar puntos':'How to earn points','Niveles':'Levels','Tu nivel actual':'Your current level','Registrarse':'Sign up','Confirmar reserva':'Confirm booking',
            'Completar estadía':'Complete stay','Dejar reseña':'Leave review','Descuento básico':'Basic discount','Descuento avanzado':'Advanced discount',
            'Descuento premium':'Premium discount','Válido en próxima reserva':'Valid on next booking','MEJOR VALOR':'BEST VALUE','descuento disponible':'discount available',
            'Confirma y paga':'Confirm and pay','Revisa los detalles antes de confirmar tu reserva':'Review the details before confirming your booking','Tu viaje':'Your trip',
            'LLEGADA':'CHECK-IN','SALIDA':'CHECK-OUT','HUÉSPEDES':'GUESTS','Método de pago':'Payment method','Tarjeta':'Card','Efectivo':'Cash',
            'Débito/Crédito':'Debit/Credit','Transferencia':'Transfer','Al llegar':'On arrival','NÚMERO DE TARJETA':'CARD NUMBER','NOMBRE EN LA TARJETA':'NAME ON CARD',
            'VENCIMIENTO':'EXPIRY','Notas para el anfitrión':'Notes for host','Pago 100% seguro y cifrado':'100% secure encrypted payment',
            'Tarifa de servicio':'Service fee','Total COP':'Total COP','Resumen de pago':'Payment summary','Subtotal':'Subtotal','Descuento':'Discount',
            '¡Reserva Confirmada! 🎉':'Booking confirmed! 🎉','¡Reserva Pre-confirmada! ⏳':'Booking pre-confirmed! ⏳','Reserva Cancelada o Expirada ❌':'Booking cancelled or expired ❌',
            'Tu aventura en el Huila está a punto de comenzar':'Your Huila adventure is about to begin',
            'Completa tu pago dentro de los próximos 10 minutos para asegurar tus fechas.':'Complete your payment within the next 10 minutes to secure your dates.',
            'Esta reserva ha expirado por falta de pago o ha sido cancelada.':'This booking expired due to missing payment or was cancelled.',
            'HORA CHECK-IN':'CHECK-IN TIME','HORA ENTRADA':'ENTRY TIME','INSTRUCCIONES DE LLEGADA':'ARRIVAL INSTRUCTIONS','TU ANFITRIÓN':'YOUR HOST',
            'Realiza la transferencia':'Make the transfer','Verificación de pago':'Payment verification','Guarda tu código de reserva':'Save your booking code',
            'Contacta al anfitrión (opcional)':'Contact the host (optional)','Haz check-in el día de llegada':'Check in on arrival day',
            'Comunidad StayHuila':'StayHuila Community','Comparte tus aventuras':'Share your adventures','¡Únete a la charla!':'Join the conversation!',
            'Comparte fotos y recomendaciones del Huila con viajeros como tú.':'Share photos and recommendations from Huila with travelers like you.',
            'Publicar':'Post','Cargando publicaciones...':'Loading posts...','Tendencias':'Trending','reseñas':'reviews',
            'Lo que ofrece este lugar':'What this place offers','Mostrar más':'Show more','Mostrar menos':'Show less','Ver todas las fotos':'See all photos',
            'SuperAnfitrión':'SuperHost','Reservar':'Reserve','Reservar (Deshabilitado)':'Reserve (Disabled)','No se te cobrará nada aún':'You will not be charged yet',
            'noche':'night','noches':'nights','por persona':'per person','Sostenible':'Sustainable','En reparación':'Under maintenance',
            'No se encontraron resultados para esta categoría.':'No results were found for this category.',
            'persona':'person','personas':'people','día':'day','días':'days','noche':'night','noches':'nights','huésped':'guest','huéspedes':'guests','huesped':'guest','huespedes':'guests',
            '/ persona':'/ person','/ noche':'/ night','por persona':'per person'
        },
        pt: {
            'Hospedajes':'Hospedagens','Experiencias':'Experiências','Comunidad':'Comunidade','Panel Anfitrion':'Painel do Anfitrião','Panel Anfitrión':'Painel do Anfitrião',
            'Mi Perfil':'Meu Perfil','Mis Reservas':'Minhas Reservas','Mis Favoritos':'Meus Favoritos','Cerrar Sesión':'Sair','Iniciar Sesión':'Entrar',
            'Limpiar filtros':'Limpar filtros','Ver detalles':'Ver detalhes','Ver todos':'Ver todos','Buscar':'Buscar','Guardar':'Salvar','Compartir':'Compartilhar',
            'Hospedajes en el Huila':'Hospedagens no Huila','Experiencias en el Huila':'Experiências no Huila','Resultados de búsqueda':'Resultados da busca','Inicio':'Início',
            'Categorías':'Categorias','Todos':'Todos','Mis Puntos':'Meus Pontos','Información Personal':'Informações Pessoais','Datos Básicos':'Dados Básicos',
            'Cambiar Contraseña':'Alterar Senha','Nombre(s)':'Nome','Apellidos':'Sobrenome','Correo Electrónico':'E-mail','Teléfono':'Telefone',
            'Nueva Contraseña':'Nova Senha','Confirmar Contraseña':'Confirmar Senha','Guardar Cambios':'Salvar Alterações','Cambiar foto':'Alterar foto',
            'Eliminar foto':'Excluir foto','Cerrar':'Fechar','Canjear':'Resgatar','Canjear puntos':'Resgatar pontos','Confirma y paga':'Confirme e pague',
            'Tu viaje':'Sua viagem','LLEGADA':'CHEGADA','SALIDA':'SAÍDA','HUÉSPEDES':'HÓSPEDES','Método de pago':'Método de pagamento',
            'Tarjeta':'Cartão','Efectivo':'Dinheiro','Débito/Crédito':'Débito/Crédito','Transferencia':'Transferência','Al llegar':'Ao chegar',
            'Notas para el anfitrión':'Notas para o anfitrião','Tarifa de servicio':'Taxa de serviço','Resumen de pago':'Resumo do pagamento',
            'Comunidad StayHuila':'Comunidade StayHuila','Publicar':'Publicar','Cargando publicaciones...':'Carregando publicações...',
            'Lo que ofrece este lugar':'O que este lugar oferece','Mostrar más':'Mostrar mais','Mostrar menos':'Mostrar menos','Reservar':'Reservar',
            'No se te cobrará nada aún':'Nada será cobrado ainda','noche':'noite','noches':'noites','por persona':'por pessoa','Sostenible':'Sustentável','En reparación':'Em manutenção',
            'persona':'pessoa','personas':'pessoas','día':'dia','días':'dias','noche':'noite','noches':'noites','huésped':'hóspede','huéspedes':'hóspedes','huesped':'hóspede','huespedes':'hóspedes',
            '/ persona':'/ pessoa','/ noche':'/ noite','por persona':'por pessoa'
        },
        fr: {
            'Hospedajes':'Hébergements','Experiencias':'Expériences','Comunidad':'Communauté','Panel Anfitrion':"Tableau de l'hôte",'Panel Anfitrión':"Tableau de l'hôte",
            'Mi Perfil':'Mon Profil','Mis Reservas':'Mes Réservations','Mis Favoritos':'Mes Favoris','Cerrar Sesión':'Se déconnecter','Iniciar Sesión':'Se connecter',
            'Limpiar filtros':'Effacer les filtres','Ver detalles':'Voir les détails','Ver todos':'Tout voir','Buscar':'Rechercher','Guardar':'Enregistrer','Compartir':'Partager',
            'Hospedajes en el Huila':'Hébergements au Huila','Experiencias en el Huila':'Expériences au Huila','Resultados de búsqueda':'Résultats de recherche','Inicio':'Accueil',
            'Categorías':'Catégories','Todos':'Tous','Mis Puntos':'Mes Points','Información Personal':'Informations Personnelles','Datos Básicos':'Informations de base',
            'Cambiar Contraseña':'Changer le mot de passe','Nombre(s)':'Prénom','Apellidos':'Nom','Correo Electrónico':'E-mail','Teléfono':'Téléphone',
            'Nueva Contraseña':'Nouveau mot de passe','Confirmar Contraseña':'Confirmer le mot de passe','Guardar Cambios':'Enregistrer','Cambiar foto':'Changer la photo',
            'Eliminar foto':'Supprimer la photo','Cerrar':'Fermer','Canjear':'Échanger','Canjear puntos':'Échanger des points','Confirma y paga':'Confirmer et payer',
            'Tu viaje':'Votre voyage','LLEGADA':'ARRIVÉE','SALIDA':'DÉPART','HUÉSPEDES':'VOYAGEURS','Método de pago':'Méthode de paiement',
            'Tarjeta':'Carte','Efectivo':'Espèces','Débito/Crédito':'Débit/Crédit','Transferencia':'Virement','Al llegar':"À l'arrivée",
            'Notas para el anfitrión':"Notes pour l'hôte",'Tarifa de servicio':'Frais de service','Resumen de pago':'Résumé du paiement',
            'Comunidad StayHuila':'Communauté StayHuila','Publicar':'Publier','Cargando publicaciones...':'Chargement des publications...',
            'Lo que ofrece este lugar':'Ce que propose ce lieu','Mostrar más':'Afficher plus','Mostrar menos':'Afficher moins','Reservar':'Réserver',
            'No se te cobrará nada aún':'Aucun frais pour le moment','noche':'nuit','noches':'nuits','por persona':'par personne','Sostenible':'Durable','En reparación':'En maintenance',
            'persona':'personne','personas':'personnes','día':'jour','días':'jours','noche':'nuit','noches':'nuits','huésped':'voyageur','huéspedes':'voyageurs','huesped':'voyageur','huespedes':'voyageurs',
            '/ persona':'/ personne','/ noche':'/ nuit','por persona':'par personne'
        },
        it: {
            'Hospedajes':'Alloggi','Experiencias':'Esperienze','Comunidad':'Comunità','Panel Anfitrion':'Pannello Host','Panel Anfitrión':'Pannello Host',
            'Mi Perfil':'Il Mio Profilo','Mis Reservas':'Le Mie Prenotazioni','Mis Favoritos':'I Miei Preferiti','Cerrar Sesión':'Esci','Iniciar Sesión':'Accedi',
            'Limpiar filtros':'Cancella filtri','Ver detalles':'Vedi dettagli','Ver todos':'Vedi tutti','Buscar':'Cerca','Guardar':'Salva','Compartir':'Condividi',
            'Hospedajes en el Huila':'Alloggi nel Huila','Experiencias en el Huila':'Esperienze nel Huila','Resultados de búsqueda':'Risultati di ricerca','Inicio':'Home',
            'Categorías':'Categorie','Todos':'Tutti','Mis Puntos':'I Miei Punti','Información Personal':'Informazioni Personali','Datos Básicos':'Dati di Base',
            'Cambiar Contraseña':'Cambia Password','Nombre(s)':'Nome','Apellidos':'Cognome','Correo Electrónico':'E-mail','Teléfono':'Telefono',
            'Nueva Contraseña':'Nuova Password','Confirmar Contraseña':'Conferma Password','Guardar Cambios':'Salva Modifiche','Cambiar foto':'Cambia foto',
            'Eliminar foto':'Elimina foto','Cerrar':'Chiudi','Canjear':'Riscatta','Canjear puntos':'Riscatta punti','Confirma y paga':'Conferma e paga',
            'Tu viaje':'Il tuo viaggio','LLEGADA':'ARRIVO','SALIDA':'PARTENZA','HUÉSPEDES':'OSPITI','Método de pago':'Metodo di pagamento',
            'Tarjeta':'Carta','Efectivo':'Contanti','Débito/Crédito':'Debito/Credito','Transferencia':'Bonifico','Al llegar':"All'arrivo",
            'Notas para el anfitrión':'Note per host','Tarifa de servicio':'Commissione di servizio','Resumen de pago':'Riepilogo pagamento',
            'Comunidad StayHuila':'Comunità StayHuila','Publicar':'Pubblica','Cargando publicaciones...':'Caricamento pubblicazioni...',
            'Lo que ofrece este lugar':'Cosa offre questo posto','Mostrar más':'Mostra altro','Mostrar menos':'Mostra meno','Reservar':'Prenota',
            'No se te cobrará nada aún':'Non ti verrà addebitato nulla ancora','noche':'notte','noches':'notti','por persona':'a persona','Sostenible':'Sostenibile','En reparación':'In manutenzione',
            'persona':'persona','personas':'persone','día':'giorno','días':'giorni','noche':'notte','noches':'notti','huésped':'ospite','huéspedes':'ospiti','huesped':'ospite','huespedes':'ospiti',
            '/ persona':'/ persona','/ noche':'/ notte','por persona':'a persona'
        }
    };

    const ATTR = {
        en: {'Ver mis puntos':'View my points','Municipio, nombre o tipo...':'Municipality, name or type...','🔍  Municipio, nombre o tipo...':'🔍  Municipality, name or type...','Ej. Aventura en Tatacoa...':'E.g. Adventure in Tatacoa...','¿Cuántos?':'How many?','Mínimo 6 caracteres':'Minimum 6 characters','Repite la nueva contraseña':'Repeat the new password','Como aparece en la tarjeta':'As shown on the card','¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':'Approximate arrival time? Any special need? Celebrating something?','Buscar hospedaje o experiencia...':'Search lodging or experience...','Escribe tu búsqueda...':'Type your search...','Búsqueda por voz':'Voice search','El correo no se puede cambiar':'Email cannot be changed'},
        pt: {'Ver mis puntos':'Ver meus pontos','Municipio, nombre o tipo...':'Município, nome ou tipo...','🔍  Municipio, nombre o tipo...':'🔍  Município, nome ou tipo...','Ej. Aventura en Tatacoa...':'Ex. Aventura no Tatacoa...','¿Cuántos?':'Quantos?','Mínimo 6 caracteres':'Mínimo 6 caracteres','Repite la nueva contraseña':'Repita a nova senha','Como aparece en la tarjeta':'Como aparece no cartão','¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':'Hora aproximada de chegada? Alguma necessidade especial? Está comemorando algo?','Buscar hospedaje o experiencia...':'Buscar hospedagem ou experiência...','Escribe tu búsqueda...':'Digite sua busca...','Búsqueda por voz':'Busca por voz','El correo no se puede cambiar':'O e-mail não pode ser alterado'},
        fr: {'Ver mis puntos':'Voir mes points','Municipio, nombre o tipo...':'Commune, nom ou type...','🔍  Municipio, nombre o tipo...':'🔍  Commune, nom ou type...','Ej. Aventura en Tatacoa...':'Ex. Aventure à Tatacoa...','¿Cuántos?':'Combien ?','Mínimo 6 caracteres':'Minimum 6 caractères','Repite la nueva contraseña':'Répétez le nouveau mot de passe','Como aparece en la tarjeta':'Comme indiqué sur la carte','¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':"Heure d'arrivée approximative ? Besoin particulier ? Vous célébrez quelque chose ?",'Buscar hospedaje o experiencia...':'Rechercher un hébergement ou une expérience...','Escribe tu búsqueda...':'Tapez votre recherche...','Búsqueda por voz':'Recherche vocale','El correo no se puede cambiar':"L'e-mail ne peut pas être modifié"},
        it: {'Ver mis puntos':'Vedi i miei punti','Municipio, nombre o tipo...':'Comune, nome o tipo...','🔍  Municipio, nombre o tipo...':'🔍  Comune, nome o tipo...','Ej. Aventura en Tatacoa...':'Es. Avventura nel Tatacoa...','¿Cuántos?':'Quanti?','Mínimo 6 caracteres':'Minimo 6 caratteri','Repite la nueva contraseña':'Ripeti la nuova password','Como aparece en la tarjeta':'Come appare sulla carta','¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':'Orario di arrivo approssimativo? Esigenze speciali? Festeggi qualcosa?','Buscar hospedaje o experiencia...':'Cerca alloggio o esperienza...','Escribe tu búsqueda...':'Scrivi la tua ricerca...','Búsqueda por voz':'Ricerca vocale','El correo no se puede cambiar':"L'e-mail non può essere modificata"}
    };
    Object.assign(ATTR.en, {'¿Cómo fue tu experiencia en este lugar?':'How was your experience in this place?'});
    Object.assign(ATTR.pt, {'¿Cómo fue tu experiencia en este lugar?':'Como foi sua experiência neste lugar?'});
    Object.assign(ATTR.fr, {'¿Cómo fue tu experiencia en este lugar?':'Comment s’est passée votre expérience dans ce lieu ?'});
    Object.assign(ATTR.it, {'¿Cómo fue tu experiencia en este lugar?':'Com’è stata la tua experiencia in questo posto?'});

    const TITLES = {
        en: {'Todos los Hospedajes':'All Lodgings','Todas las Experiencias':'All Experiences','Hospedajes Auténticos':'Authentic Lodgings','Mi Perfil':'My Profile','Mis Favoritos':'My Favorites','Comunidad':'Community','Completar Reserva':'Complete Booking'},
        pt: {'Todos los Hospedajes':'Todas as Hospedagens','Todas las Experiencias':'Todas as Experiências','Hospedajes Auténticos':'Hospedagens Autênticas','Mi Perfil':'Meu Perfil','Mis Favoritos':'Meus Favoritos','Comunidad':'Comunidade','Completar Reserva':'Completar Reserva'},
        fr: {'Todos los Hospedajes':'Tous les Hébergements','Todas las Experiencias':'Toutes les Expériences','Hospedajes Auténticos':'Hébergements Authentiques','Mi Perfil':'Mon Profil','Mis Favoritos':'Mes Favoris','Comunidad':'Communauté','Completar Reserva':'Finaliser la Réservation'},
        it: {'Todos los Hospedajes':'Tutti gli Alloggi','Todas las Experiencias':'Tutte le Esperienze','Hospedajes Auténticos':'Alloggi Autentici','Mi Perfil':'Il Mio Profilo','Mis Favoritos':'I Miei Preferiti','Comunidad':'Comunità','Completar Reserva':'Completa Prenotazione'}
    };
    Object.assign(TEXT.en, {
        'Limpieza':'Cleanliness','Comunicación':'Communication','Ubicación':'Location','Relación calidad-precio':'Value for money',
        'También te puede interesar':'You may also be interested','Otros hospedajes disponibles en el Huila':'Other available lodgings in Huila',
        'Ya dejaste tu reseña':'You already left your review','Solo se permite una reseña por publicación. ¡Gracias por tu opinión!':'Only one review is allowed per listing. Thank you for your opinion!',
        'Anfitrión':'Host','Contactar':'Contact','Selecciona tus fechas':'Select your dates','Añade fechas para ver el precio exacto':'Add dates to see the exact price',
        '¿Dónde está?':'Where is it?','La dirección exacta se comparte tras la reserva.':'The exact address is shared after booking.',
        'Sé el primero en dejar una reseña.':'Be the first to leave a review.','Deja tu reseña':'Leave your review','Calificación general:':'Overall rating:',
        'Publicar reseña':'Post review','Inicia sesión para dejar una reseña.':'Log in to leave a review.','Iniciar sesión':'Log in',
        'Esta es tu publicación':'This is your listing','Los anfitriones no pueden reservar sus propios hospedajes.':'Hosts cannot book their own lodgings.',
        'Ir al panel':'Go to dashboard','Eres el anfitrión de esta publicación':'You are the host of this listing','No puedes dejarte reseñas propias.':'You cannot review your own listing.',
        'Auto check-in con caja de llaves.':'Self check-in with lockbox.','Fue buen hospedaje':'It was a good lodging'
    });
    Object.assign(TEXT.en, {
        'Una finca donde vivirás los mejores momento de tu vida y compartirás momento en familia y con tus amigos de la mejor manera':'A farm where you will live some of the best moments of your life and share time with family and friends in the best way.',
        'Cocina equipada':'Equipped kitchen','Piscina':'Pool','Mayo':'May','Junio':'June','Julio':'July','Agosto':'August','Septiembre':'September','Octubre':'October','Noviembre':'November','Diciembre':'December','Enero':'January','Febrero':'February','Marzo':'March','Abril':'April'
    });
    Object.assign(TEXT.pt, {
        'Limpieza':'Limpeza','Comunicación':'Comunicação','Ubicación':'Localização','Relación calidad-precio':'Custo-benefício',
        'También te puede interesar':'Você também pode se interessar','Otros hospedajes disponibles no Huila':'Outras hospedagens disponíveis no Huila',
        'Ya dejaste tu reseña':'Você já deixou sua avaliação','Solo se permite una reseña por publicación. ¡Gracias por tu opinión!':'Só é permitida uma avaliação por publicação. Obrigado pela sua opinião!',
        'Anfitrión':'Anfitrião','Contactar':'Contactar','Selecciona tus fechas':'Selecione suas datas','Añade fechas para ver el precio exacto':'Adicione datas para ver o preço exato',
        '¿Dónde está?':'Onde fica?','La dirección exacta se comparte tras la reserva.':'O endereço exato é compartilhado após a reserva.',
        'Sé el primero en dejar una reseña.':'Seja o primeiro a deixar uma avaliação.','Deja tu reseña':'Deixe sua avaliação','Calificación general:':'Avaliação geral:',
        'Publicar reseña':'Publicar avaliação','Inicia sesión para dejar una reseña.':'Entre para deixar uma avaliação.','Iniciar sesión':'Entrar'
    });
    Object.assign(TEXT.pt, {
        'Una finca donde vivirás los mejores momento de tu vida y compartirás momento en familia y con tus amigos de la mejor manera':'Uma fazenda onde você viverá alguns dos melhores momentos da sua vida e compartilhará momentos com família e amigos da melhor maneira.',
        'Cocina equipada':'Cozinha equipada','Piscina':'Piscina','Mayo':'Maio','Junio':'Junho','Julio':'Julho','Agosto':'Agosto','Septiembre':'Setembro','Octubre':'Outubro','Noviembre':'Novembro','Diciembre':'Dezembro','Enero':'Janeiro','Febrero':'Fevereiro','Marzo':'Março','Abril':'Abril'
    });
    Object.assign(TEXT.fr, {
        'Limpieza':'Propreté','Comunicación':'Communication','Ubicación':'Emplacement','Relación calidad-precio':'Rapport qualité-prix',
        'También te puede interesar':'Vous pourriez aussi aimer','Otros hospedajes disponibles en el Huila':'Autres hébergements disponibles au Huila',
        'Ya dejaste tu reseña':'Vous avez déjà laissé votre avis','Solo se permite una reseña por publicación. ¡Gracias por tu opinión!':'Un seul avis est autorisé par annonce. Merci pour votre opinion !',
        'Anfitrión':'Hôte','Contactar':'Contacter','Selecciona tus fechas':'Sélectionnez vos dates','Añade fechas para ver el precio exacto':'Ajoutez des dates pour voir le prix exact',
        '¿Dónde está?':'Où est-ce ?','La dirección exacta se comparte tras la reserva.':"L'adresse exacte est partagée après la réservation.",
        'Sé el primero en dejar una reseña.':'Soyez le premier à laisser un avis.','Deja tu reseña':'Laissez votre avis','Calificación general:':'Note générale :',
        'Publicar reseña':'Publier un avis','Inicia sesión para dejar una reseña.':'Connectez-vous pour laisser un avis.','Iniciar sesión':'Se connecter'
    });
    Object.assign(TEXT.fr, {
        'Una finca donde vivirás los mejores momento de tu vida y compartirás momento en familia y con tus amigos de la mejor manera':'Une ferme où vous vivrez certains des meilleurs moments de votre vie et partagerez du temps avec votre famille et vos amis de la meilleure façon.',
        'Cocina equipada':'Cuisine équipée','Piscina':'Piscine','Mayo':'Mai','Junio':'Juin','Julio':'Juillet','Agosto':'Août','Septiembre':'Septembre','Octubre':'Octobre','Noviembre':'Novembre','Diciembre':'Décembre','Enero':'Janvier','Febrero':'Février','Marzo':'Mars','Abril':'Avril'
    });

    const ORIGINAL_TEXT = new WeakMap();
    const TRACKED_TEXT_NODES = new Set();
    const ORIGINAL_TITLE = document.title;

    let observer = null;
    let lastLang = lang();
    const requestedTexts = new Set();
    const pendingTexts = new Set();
    let translateTimeout = null;

    function lang() {
        return (window.I18n && I18n.current) || localStorage.getItem('sh_lang') || 'es';
    }

    function normalizedText(value) {
        return (value || '').trim().replace(/\s+/g, ' ');
    }

    function preserveSpaces(original, translated) {
        const startMatch = original.match(/^\s*/);
        const endMatch = original.match(/\s*$/);
        return (startMatch ? startMatch[0] : '') + translated + (endMatch ? endMatch[0] : '');
    }

    function isTranslatable(text) {
        if (!text) return false;
        const normalized = normalizedText(text);
        if (!normalized) return false;
        if (/^[0-9\s.,$%&()\-+/*:;!?#@|]+$/.test(normalized)) return false;
        if (normalized.length <= 1) return false;
        return true;
    }

    function getLangCache(code) {
        try {
            const cached = localStorage.getItem(`sh_trans_${code}`);
            return cached ? JSON.parse(cached) : {};
        } catch (e) {
            return {};
        }
    }

    function setLangCache(code, cache) {
        try {
            localStorage.setItem(`sh_trans_${code}`, JSON.stringify(cache));
        } catch (e) {}
    }

    function getLocalTranslation(key, code) {
        const dict = TEXT[code] || {};
        const normKey = key.trim().toLowerCase().replace(/\s+/g, ' ');
        if (dict[key]) return dict[key];
        
        let found = null;
        for (const [k, v] of Object.entries(dict)) {
            if (k.toLowerCase().replace(/\s+/g, ' ') === normKey) {
                found = v;
                break;
            }
        }
        if (found) {
            if (key[0] === key[0].toUpperCase()) {
                return found[0].toUpperCase() + found.slice(1);
            }
            return found;
        }
        return null;
    }

    function getLocalAttrTranslation(key, code) {
        const attrDict = ATTR[code] || {};
        const normKey = key.trim().toLowerCase().replace(/\s+/g, ' ');
        if (attrDict[key]) return attrDict[key];
        
        for (const [k, v] of Object.entries(attrDict)) {
            if (k.toLowerCase().replace(/\s+/g, ' ') === normKey) {
                return v;
            }
        }
        return null;
    }

    function queueTranslation(text) {
        const key = normalizedText(text);
        if (!key || !isTranslatable(key)) return;
        if (requestedTexts.has(key)) return;

        requestedTexts.add(key);
        pendingTexts.add(key);

        if (translateTimeout) clearTimeout(translateTimeout);
        translateTimeout = setTimeout(() => {
            flushTranslations();
        }, 300);
    }

    async function flushTranslations() {
        const code = lang();
        if (code === 'es') {
            pendingTexts.clear();
            return;
        }
        const textsToTranslate = Array.from(pendingTexts);
        pendingTexts.clear();

        if (textsToTranslate.length === 0) return;

        const chunks = [];
        for (let i = 0; i < textsToTranslate.length; i += 50) {
            chunks.push(textsToTranslate.slice(i, i + 50));
        }

        const cache = getLangCache(code);

        try {
            await Promise.all(chunks.map(async (chunk) => {
                try {
                    const response = await fetch('/api/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ texts: chunk, lang: code })
                    });
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    const resData = await response.json();
                    if (resData.success && Array.isArray(resData.translations)) {
                        chunk.forEach((txt, idx) => {
                            const trans = resData.translations[idx];
                            if (trans) {
                                cache[txt] = trans;
                            }
                        });
                    }
                } catch (err) {
                    console.error('[TRANSLATE ERROR]', err);
                }
            }));

            setLangCache(code, cache);

            if (observer) observer.disconnect();
            applyLegacyTranslations();
            if (observer) observer.observe(document.body, { childList: true, subtree: true });

        } catch (e) {
            console.error('[FLUSH ERROR]', e);
        }
    }

    function applyLegacyTranslations(root = document.body) {
        const code = lang();
        if (!root) return;

        if (code !== lastLang) {
            lastLang = code;
            requestedTexts.clear();
            pendingTexts.clear();
            if (translateTimeout) clearTimeout(translateTimeout);
        }

        if (code === 'es') {
            TRACKED_TEXT_NODES.forEach(node => {
                if (!node.isConnected) {
                    TRACKED_TEXT_NODES.delete(node);
                    return;
                }
                if (ORIGINAL_TEXT.has(node)) node.nodeValue = ORIGINAL_TEXT.get(node);
            });
            document.querySelectorAll('[data-i18n-original-placeholder],[data-i18n-original-title],[data-i18n-original-aria-label]').forEach(el => {
                ['placeholder','title','aria-label'].forEach(attr => {
                    const storeAttr = `data-i18n-original-${attr}`;
                    if (el.hasAttribute(storeAttr)) el.setAttribute(attr, el.getAttribute(storeAttr));
                });
            });
            document.title = ORIGINAL_TITLE;
            return;
        }

        const cache = getLangCache(code);
        const skip = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE','SVG','CANVAS','IFRAME']);
        
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || skip.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
                if (parent.closest('[data-no-i18n]') || parent.closest('[data-i18n]') || parent.closest('.language-selector') || parent.closest('.lang-dropdown')) return NodeFilter.FILTER_REJECT;
                return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        
        nodes.forEach(node => {
            if (!ORIGINAL_TEXT.has(node)) {
                ORIGINAL_TEXT.set(node, node.nodeValue);
                TRACKED_TEXT_NODES.add(node);
            }
            const original = ORIGINAL_TEXT.get(node);
            const key = normalizedText(original);
            
            // Check for local regex matches first!
            let matchedLocal = false;
            let m = key.match(/Se han encontrado (\d+) hospedaje[s]? para tu estadía\./i);
            if (m) {
                const n = m[1];
                node.nodeValue = preserveSpaces(original, {
                    en: `Found ${n} lodging${n === '1' ? '' : 's'} for your stay.`,
                    pt: `Foram encontradas ${n} hospedagem${n === '1' ? '' : 's'} para sua estadia.`,
                    fr: `${n} hébergement${n === '1' ? '' : 's'} trouvé${n === '1' ? '' : 's'} pour votre séjour.`,
                    it: `${n} alloggi per il tuo soggiorno.`
                }[code]);
                matchedLocal = true;
            }
            if (!matchedLocal) {
                m = key.match(/Se han encontrado (\d+) experiencias para tu aventura\./i);
                if (m) {
                    const n = m[1];
                    node.nodeValue = preserveSpaces(original, {
                        en: `Found ${n} experience${n === '1' ? '' : 's'} for your adventure.`,
                        pt: `Foram encontradas ${n} experiências para sua aventura.`,
                        fr: `${n} expérience${n === '1' ? '' : 's'} trouvée${n === '1' ? '' : 's'} pour votre aventure.`,
                        it: `${n} experiencias per la tua avventura.`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/Anfitrión desde (\d{4})/i);
                if (m) {
                    node.nodeValue = preserveSpaces(original, {
                        en: `Host since ${m[1]}`,
                        pt: `Anfitrião desde ${m[1]}`,
                        fr: `Hôte depuis ${m[1]}`,
                        it: `Host dal ${m[1]}`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^(\d+)\s+reseñas$/i);
                if (m) {
                    const n = m[1];
                    node.nodeValue = preserveSpaces(original, {
                        en: `${n} review${n === '1' ? '' : 's'}`,
                        pt: `${n} avaliação${n === '1' ? '' : 's'}`,
                        fr: `${n} avis`,
                        it: `${n} recension${n === '1' ? 'e' : 'i'}`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^([\d.]+)\s+·\s+(\d+)\s+reseñas$/i);
                if (m) {
                    const n = m[2];
                    node.nodeValue = preserveSpaces(original, {
                        en: `${m[1]} · ${n} review${n === '1' ? '' : 's'}`,
                        pt: `${m[1]} · ${n} avaliação${n === '1' ? '' : 's'}`,
                        fr: `${m[1]} · ${n} avis`,
                        it: `${m[1]} · ${n} recension${n === '1' ? 'e' : 'i'}`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^·\s+(\d+)\s+reseñas$/i);
                if (m) {
                    const n = m[1];
                    node.nodeValue = preserveSpaces(original, {
                        en: `· ${n} review${n === '1' ? '' : 's'}`,
                        pt: `· ${n} avaliação${n === '1' ? '' : 's'}`,
                        fr: `· ${n} avis`,
                        it: `· ${n} recension${n === '1' ? 'e' : 'i'}`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^(Mínimo|Máximo|Máx\.)\s+(\d+)\s+noche[s]?$/i);
                if (m) {
                    const n = m[2];
                    const prefix = m[1].toLowerCase();
                    const transPrefix = {
                        en: prefix.startsWith('mín') ? 'Minimum' : 'Maximum',
                        pt: prefix.startsWith('mín') ? 'Mínimo' : 'Máximo',
                        fr: prefix.startsWith('mín') ? 'Minimum' : 'Maximum',
                        it: prefix.startsWith('mín') ? 'Minimo' : 'Massimo'
                    }[code];
                    node.nodeValue = preserveSpaces(original, `${transPrefix} ${n} ${n === '1' ? {en:'night',pt:'noite',fr:'nuit',it:'notte'}[code] : {en:'nights',pt:'noites',fr:'nuits',it:'notti'}[code]}`);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^(Máx\.|Máximo)\s+(\d+)\s+huésped[es]?$/i);
                if (m) {
                    const n = m[2];
                    const transPrefix = { en: 'Max.', pt: 'Máx.', fr: 'Max.', it: 'Max.' }[code];
                    const transGuests = {
                        en: n === '1' ? 'guest' : 'guests',
                        pt: n === '1' ? 'hóspede' : 'hóspedes',
                        fr: n === '1' ? 'voyageur' : 'voyageurs',
                        it: n === '1' ? 'ospite' : 'ospiti'
                    }[code];
                    node.nodeValue = preserveSpaces(original, `${transPrefix} ${n} ${transGuests}`);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^(\d+)\s+reseñas\s+\(Anfitrión\)$/i);
                if (m) {
                    const n = m[1];
                    node.nodeValue = preserveSpaces(original, {
                        en: `${n} review${n === '1' ? '' : 's'} (Host)`,
                        pt: `${n} avaliação${n === '1' ? '' : 's'} (Anfitrião)`,
                        fr: `${n} avis (Hôte)`,
                        it: `${n} recension${n === '1' ? 'e' : 'i'} (Host)`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^\((\d+)\s+reseñas\)$/i);
                if (m) {
                    const n = m[1];
                    node.nodeValue = preserveSpaces(original, {
                        en: `(${n} review${n === '1' ? '' : 's'})`,
                        pt: `(${n} avaliação${n === '1' ? '' : 's'})`,
                        fr: `(${n} avis)`,
                        it: `(${n} recension${n === '1' ? 'e' : 'i'})`
                    }[code]);
                    matchedLocal = true;
                }
            }
            if (!matchedLocal) {
                m = key.match(/^\$([\d.]+)\s*×\s*(\d+)\s+(persona|personas)\s*×\s*(\d+)\s+(día|días|noche|noches)$/i);
                if (m) {
                    const price = m[1];
                    const count1 = m[2];
                    const count2 = m[4];
                    const type2 = m[5].toLowerCase();
                    
                    const type1Trans = {
                        en: count1 === '1' ? 'person' : 'people',
                        pt: count1 === '1' ? 'pessoa' : 'pessoas',
                        fr: count1 === '1' ? 'personne' : 'personnes',
                        it: count1 === '1' ? 'persona' : 'persone'
                    }[code];
                    
                    let type2Trans = '';
                    if (type2.startsWith('d')) {
                        type2Trans = {
                            en: count2 === '1' ? 'day' : 'days',
                            pt: count2 === '1' ? 'dia' : 'dias',
                            fr: count2 === '1' ? 'jour' : 'jours',
                            it: count2 === '1' ? 'giorno' : 'giorni'
                        }[code];
                    } else {
                        type2Trans = {
                            en: count2 === '1' ? 'night' : 'nights',
                            pt: count2 === '1' ? 'noite' : 'noites',
                            fr: count2 === '1' ? 'nuit' : 'nuits',
                            it: count2 === '1' ? 'notte' : 'notti'
                        }[code];
                    }
                    node.nodeValue = preserveSpaces(original, `$${price} × ${count1} ${type1Trans} × ${count2} ${type2Trans}`);
                    matchedLocal = true;
                }
            }

            if (matchedLocal) return;

            const localTrans = getLocalTranslation(key, code);
            if (localTrans) {
                node.nodeValue = preserveSpaces(original, localTrans);
            } else {
                if (cache[key]) {
                    node.nodeValue = preserveSpaces(original, cache[key]);
                } else {
                    queueTranslation(original);
                }
            }
        });

        root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
            if (el.closest('[data-no-i18n]') || el.closest('[data-i18n]') || el.closest('.language-selector') || el.closest('.lang-dropdown')) return;
            ['placeholder','title','aria-label'].forEach(attr => {
                const storeAttr = `data-i18n-original-${attr}`;
                if (!el.hasAttribute(storeAttr)) el.setAttribute(storeAttr, el.getAttribute(attr) || '');
                const value = el.getAttribute(storeAttr);
                if (!value) return;
                const key = normalizedText(value);
                const localTrans = getLocalAttrTranslation(key, code);
                if (localTrans) {
                    el.setAttribute(attr, localTrans);
                } else {
                    if (cache[key]) {
                        el.setAttribute(attr, cache[key]);
                    } else {
                        queueTranslation(value);
                    }
                }
            });
        });

        let translatedTitle = ORIGINAL_TITLE;
        let foundStaticTitle = false;
        Object.entries(TITLES[code] || {}).forEach(([from, to]) => {
            if (translatedTitle.includes(from)) {
                translatedTitle = translatedTitle.replace(from, to);
                foundStaticTitle = true;
            }
        });
        if (foundStaticTitle) {
            document.title = translatedTitle;
        } else {
            const titleKey = normalizedText(ORIGINAL_TITLE);
            if (cache[titleKey]) {
                document.title = cache[titleKey];
            } else {
                queueTranslation(ORIGINAL_TITLE);
            }
        }

        document.querySelectorAll('.lang-label').forEach(el => {
            const l = LANGUAGES[code];
            if (l) el.textContent = `${l.flag} ${code.toUpperCase()}`;
        });
    }

    const baseApply = I18n.apply.bind(I18n);
    I18n.apply = function patchedApply() {
        baseApply();
        applyLegacyTranslations();
    };

    // Hook window.showToast to translate toast messages instantly
    const originalShowToast = window.showToast;
    if (typeof originalShowToast === 'function') {
        window.showToast = function(message, type) {
            const code = lang();
            if (code === 'es') {
                return originalShowToast(message, type);
            }
            const normKey = normalizedText(message);
            const localTrans = getLocalTranslation(normKey, code);
            if (localTrans) {
                return originalShowToast(localTrans, type);
            }
            const cache = getLangCache(code);
            if (cache[normKey]) {
                return originalShowToast(cache[normKey], type);
            }
            queueTranslation(message);
            return originalShowToast(message, type);
        };
    }

    function initLegacyObserver() {
        applyLegacyTranslations();
        observer = new MutationObserver(mutations => {
            if (lang() === 'es') return;
            if (observer) observer.disconnect();
            
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    applyLegacyTranslations(node);
                } else if (node.nodeType === Node.TEXT_NODE) {
                    applyLegacyTranslations(node.parentElement || document.body);
                }
            }));
            
            if (observer) observer.observe(document.body, { childList: true, subtree: true });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLegacyObserver);
    } else {
        initLegacyObserver();
    }
})();

// Animation
const _s = document.createElement('style');
_s.textContent = `
    @keyframes fadeInDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    #lang-btn:hover{background:rgba(0,0,0,0.06)!important}
`;
document.head.appendChild(_s);

/* ── Init ───────────────────────────────────────────────── */
function runInit() {
    buildLangDropdown();
    I18n.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
} else {
    runInit();
}
