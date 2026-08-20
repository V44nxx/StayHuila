/**
 * StayHuila — i18n Engine v3 (Ultra-Fast & Comprehensive Instant Translation)
 * Traduce de forma instantánea nombres de publicaciones, descripciones, amenidades,
 * fechas, filtros, navegación y elementos dinámicos en toda la plataforma.
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
        'nav.host_panel':'Panel Anfitrión','nav.host_cta':'Pon tu espacio en StayHuila',
        'nav.my_profile':'Mi Perfil','nav.my_bookings':'Mis Reservas',
        'nav.my_favorites':'Mis Favoritos','nav.logout':'Cerrar Sesión','nav.login':'Iniciar Sesión',
        'hero.title':'Descubre la esencia del Huila',
        'hero.subtitle':'Hospedajes rurales, fincas y cabañas mágicas recomendadas para ti',
        'hero.loc':'Ubicación / Experiencia','hero.checkin':'Llegada','hero.checkout':'Salida',
        'hero.guests':'Huéspedes','hero.loc_ph':'Ej. Aventura en Tatacoa...','hero.guests_ph':'¿Cuántos?',
        'cat.title':'Categorías','cat.all':'Todos','cat.finca':'Finca','cat.cabana':'Cabaña','cat.glamping':'Glamping',
        'cat.habitacion':'Habitación privada','cat.hotel_boutique':'Hotel boutique','cat.casa_entera':'Casa entera',
        'cat.aventura':'Aventura','cat.cultural':'Cultural','cat.gastronomia':'Gastronomía','cat.naturaleza':'Naturaleza',
        'cat.deportes':'Deportes','cat.bienestar':'Bienestar','cat.arte':'Arte','cat.ecoturismo':'Ecoturismo',
        'cat.coffee':'Fincas Cafeteras','cat.eco':'Sostenible & Eco','cat.desert':'Desierto',
        'cat.romantic':'Romántico','cat.adventure':'Aventura','cat.rest':'Descanso Profundo','cat.nearby':'Cerca de ti',
        'cat.location':'Ubicación',
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
        'booking.confirm':'Confirmar y pagar','booking.page_title':'Confirma y paga tu reserva',
        'booking.page_sub':'Revisa los detalles antes de confirmar tu reserva',
        'booking.your_trip':'Tu viaje','booking.checkin':'Llegada','booking.checkout':'Salida',
        'booking.guests_label':'Huéspedes','booking.payment_method':'Método de pago',
        'booking.notes':'Notas para el anfitrión','booking.secure':'Pago 100% seguro y cifrado',
        'payment.card':'Tarjeta','payment.cash':'Efectivo',
        'search.clear':'Limpiar filtros',
        'community.trending':'Tendencias','community.post_btn':'Publicar','community.reviews':'reseñas',
        'community.title':'Comunidad StayHuila','community.subtitle':'Comparte tus aventuras',
        'community.rec_hospedaje':'Hospedaje recomendado',
        'community.rec_experiencia':'Experiencia recomendada',
        'community.popular_places':'Lugares populares',
        'community.trends':'Tendencias en Huila',
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
        'nav.host_panel':'Host Panel','nav.host_cta':'List your space on StayHuila',
        'nav.my_profile':'My Profile','nav.my_bookings':'My Bookings',
        'nav.my_favorites':'My Favorites','nav.logout':'Log Out','nav.login':'Log In',
        'hero.title':'Discover the Essence of Huila',
        'hero.subtitle':'Rural lodgings, farms & magical cabins recommended for you',
        'hero.loc':'Location / Experience','hero.checkin':'Check-in','hero.checkout':'Check-out',
        'hero.guests':'Guests','hero.loc_ph':'E.g. Adventure in Tatacoa...','hero.guests_ph':'How many?',
        'cat.title':'Categories','cat.all':'All','cat.finca':'Farmstead','cat.cabana':'Cabin','cat.glamping':'Glamping',
        'cat.habitacion':'Private room','cat.hotel_boutique':'Boutique hotel','cat.casa_entera':'Entire house',
        'cat.aventura':'Adventure','cat.cultural':'Cultural','cat.gastronomia':'Gastronomy','cat.naturaleza':'Nature',
        'cat.deportes':'Sports','cat.bienestar':'Wellness','cat.arte':'Art','cat.ecoturismo':'Ecotourism',
        'cat.coffee':'Coffee Farms','cat.eco':'Sustainable & Eco','cat.desert':'Desert',
        'cat.romantic':'Romantic','cat.adventure':'Adventure','cat.rest':'Deep Rest','cat.nearby':'Near Me',
        'cat.location':'Location',
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
        'booking.confirm':'Confirm & Pay','booking.page_title':'Confirm and pay your booking',
        'booking.page_sub':'Review details before confirming your booking',
        'booking.your_trip':'Your trip','booking.checkin':'Check-in','booking.checkout':'Check-out',
        'booking.guests_label':'Guests','booking.payment_method':'Payment method',
        'booking.notes':'Notes for host','booking.secure':'100% secure and encrypted payment',
        'payment.card':'Card','payment.cash':'Cash',
        'search.clear':'Clear filters',
        'community.trending':'Trending','community.post_btn':'Post','community.reviews':'reviews',
        'community.title':'StayHuila Community','community.subtitle':'Share your adventures',
        'community.rec_hospedaje':'RECOMMENDED LODGING',
        'community.rec_experiencia':'RECOMMENDED EXPERIENCE',
        'community.popular_places':'Popular Locations',
        'community.trends':'Trends in Huila',
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
        'nav.host_panel':'Painel do Anfitrião','nav.host_cta':'Anuncie seu espaço no StayHuila',
        'nav.my_profile':'Meu Perfil','nav.my_bookings':'Minhas Reservas',
        'nav.my_favorites':'Meus Favoritos','nav.logout':'Sair','nav.login':'Entrar',
        'hero.title':'Descubra a Essência do Huila',
        'hero.subtitle':'Hospedagens rurais, fazendas e cabanas mágicas recomendadas para você',
        'hero.loc':'Localização / Experiência','hero.checkin':'Check-in','hero.checkout':'Check-out',
        'hero.guests':'Hóspedes','hero.loc_ph':'Ex. Aventura no Tatacoa...','hero.guests_ph':'Quantos?',
        'cat.title':'Categorias','cat.all':'Todos','cat.finca':'Fazenda','cat.cabana':'Cabana','cat.glamping':'Glamping',
        'cat.habitacion':'Quarto privado','cat.hotel_boutique':'Hotel boutique','cat.casa_entera':'Casa inteira',
        'cat.aventura':'Aventura','cat.cultural':'Cultural','cat.gastronomia':'Gastronomia','cat.naturaleza':'Natureza',
        'cat.deportes':'Esportes','cat.bienestar':'Bem-estar','cat.arte':'Arte','cat.ecoturismo':'Ecoturismo',
        'cat.coffee':'Fazendas de Café','cat.eco':'Sustentável & Eco','cat.desert':'Deserto',
        'cat.romantic':'Romântico','cat.adventure':'Aventura','cat.rest':'Descanso Profundo','cat.nearby':'Perto de Mim',
        'cat.location':'Localização',
        'listings.title':'Recomendações para Você','listings.subtitle':'Selecionados especialmente para você',
        'listings.btn':'Ver detalhes','map.show':'Mostrar Mapa','general.offline':'Disponível Offline',
        'general.night':'noite','general.per_person':'por pessoa','general.back_home':'Voltar ao início',
        'page.lodgings.h1':'Hospedagens no Huila','page.exp.h1':'Experiências no Huila',
        'login.welcome':'Bem-vindo de volta','login.sub':'Acesse sua conta para gerenciar suas reservas',
        'login.email':'Endereço de e-mail','login.pw':'Senha','login.btn':'Entrar',
        'login.no_acc':'Não tem uma conta?','login.create':'Criar conta gratuita',
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
        'booking.confirm':'Confirmar e pagar','booking.page_title':'Confirme e pague sua reserva',
        'booking.page_sub':'Revise os detalhes antes de confirmar sua reserva',
        'booking.your_trip':'Sua viagem','booking.checkin':'Chegada','booking.checkout':'Saída',
        'booking.guests_label':'Hóspedes','booking.payment_method':'Método de pagamento',
        'booking.notes':'Notas para o anfitrião','booking.secure':'Pagamento 100% seguro e criptografado',
        'payment.card':'Cartão','payment.cash':'Dinheiro',
        'search.clear':'Limpar filtros',
        'community.trending':'Tendências','community.post_btn':'Publicar','community.reviews':'avaliações',
        'community.title':'Comunidade StayHuila','community.subtitle':'Compartilhe suas aventuras',
        'community.rec_hospedaje':'HOSPEDAGEM RECOMENDADA',
        'community.rec_experiencia':'EXPERIÊNCIA RECOMENDADA',
        'community.popular_places':'Locais populares',
        'community.trends':'Tendências no Huila',
        'map.user_location':'Você está aqui',
        'detail.share':'Compartilhar','detail.save':'Salvar','detail.all_photos':'Ver todas as fotos',
        'detail.super_host':'SuperHost','detail.more':'Mostrar mais','detail.less':'Mostrar menos',
        'detail.offers':'O que este lugar oferece','detail.checkin_at':'Check-in às','detail.checkout_at':'Checkout às',
        'booking.reserve':'Reservar','booking.reserve_disabled':'Reservar (Deshabilitado)',
        'booking.no_charge':'Nada será cobrado ainda','booking.nights':'noites','booking.service_fee':'Taxa de serviço',
        'booking.total':'Total','booking.max_guests':'Máx. {n} hóspedes',
        'booking.max_prefix':'Máx.','booking.guests_lower':'hóspedes',
        'booking.repair_msg':'Esta hospedagem está em manutenção. As reservas estão temporariamente desativadas.',
    },
    fr: {
        'nav.lodgings':'Hébergements','nav.experiences':'Expériences','nav.community':'Communauté',
        'nav.host_panel':"Tableau de l'hôte",'nav.host_cta':'Publiez votre logement',
        'nav.my_profile':'Mon Profil','nav.my_bookings':'Mes Réservations',
        'nav.my_favorites':'Mes Favoris','nav.logout':'Se déconnecter','nav.login':'Se connecter',
        'hero.title':'Découvrez l\'essence du Huila',
        'hero.subtitle':'Hébergements ruraux, domaines et chalets magiques recommandés pour vous',
        'hero.loc':'Emplacement / Expérience','hero.checkin':'Arrivée','hero.checkout':'Départ',
        'hero.guests':'Voyageurs','hero.loc_ph':'Ex. Aventure à Tatacoa...','hero.guests_ph':'Combien ?',
        'cat.title':'Catégories','cat.all':'Tous','cat.finca':'Domaine','cat.cabana':'Chalet','cat.glamping':'Glamping',
        'cat.habitacion':'Chambre privée','cat.hotel_boutique':'Hôtel boutique','cat.casa_entera':'Maison entière',
        'cat.aventura':'Aventure','cat.cultural':'Culturel','cat.gastronomia':'Gastronomie','cat.naturaleza':'Nature',
        'cat.deportes':'Sports','cat.bienestar':'Bien-être','cat.arte':'Art','cat.ecoturismo':'Écotourisme',
        'cat.coffee':'Domaines Caféiers','cat.eco':'Durable & Éco','cat.desert':'Désert',
        'cat.romantic':'Romantique','cat.adventure':'Aventure','cat.rest':'Repos Profond','cat.nearby':'Près de vous',
        'cat.location':'Emplacement',
        'listings.title':'Recommandations pour vous','listings.subtitle':'Sélectionnés selon vos préférences',
        'listings.btn':'Voir les détails','map.show':'Afficher la Carte','general.offline':'Disponible Hors-Ligne',
        'general.night':'nuit','general.per_person':'par personne','general.back_home':'Retour à l\'accueil',
        'page.lodgings.h1':'Hébergements au Huila','page.exp.h1':'Expériences au Huila',
        'login.welcome':'Bienvenue à nouveau','login.sub':'Accédez à votre compte pour gérer vos réservations',
        'login.email':'Adresse e-mail','login.pw':'Mot de passe','login.btn':'Se connecter',
        'login.no_acc':"Vous n'avez pas de compte ?",'login.create':'Créer un compte gratuit',
        'login.hero_title':'Vivez la magie du Huila',
        'login.hero_sub':'Hébergements authentiques, expériences uniques et la chaleur de notre région',
        'login.feat1':'Réservations 100% sécurisées','login.feat2':'Hôtes vérifiés',
        'login.feat3':'Gagnez des points à chaque réservation','login.feat4':'Assistance 24/7',
        'tab.login':'Se connecter','tab.register':'S\'inscrire',
        'reg.title':'Créer un compte','reg.sub':'Rejoignez la communauté StayHuila gratuitement','reg.btn':'Créer un compte',
        'form.name':'Prénom','form.lastname':'Nom','form.phone':'Téléphone',
        'form.email_ph':'votre@email.com','form.pw_ph':'Votre mot de passe','form.name_ph':'Votre prénom',
        'form.lastname_ph':'Votre nom','form.phone_ph':'Ex. 310...','form.pw_reg_ph':'Minimum 6 caractères',
        'reg.agree':'En vous inscrivant, vous acceptez nos','reg.terms':'Conditions d\'utilisation',
        'login.next_alert':'Connectez-vous pour compléter votre réservation',
        'profile.title':'Informations Personnelles','profile.sub':'Gérez vos données personnelles.',
        'profile.basic_data':'Informations de base','profile.change_pw':'Changer le mot de passe',
        'profile.new_pw':'Nouveau mot de passe','profile.confirm_pw':'Confirmer le mot de passe',
        'profile.save':'Enregistrer les modifications','profile.points':'Points StayHuila',
        'profile.level_text':'Niveau Explorateur. Continuez à voyager pour atteindre le niveau Aventurier !',
        'role.host':'Hôte','role.admin':'Administrateur','role.guest':'Voyageur',
        'reservas.title':'Mes Réservations',
        'filter.all':'Toutes','filter.confirmed':'Confirmées','filter.checkin':'En séjour',
        'filter.completed':'Terminées','filter.cancelled':'Annulées',
        'status.confirmed':'Confirmée','status.checkin':'En séjour','status.completed':'Terminée',
        'status.cancelled':'Annulée','status.pending':'En attente',
        'status.repair':'En maintenance','status.open':'Ouvert',
        'bookings.new':'+ Nouvelle réservation','bookings.view':'Voir le détail','bookings.code':'Code',
        'bookings.empty_title':'Aucune réservation pour le moment',
        'bookings.empty_sub':'Explorez les hébergements du Huila et vivez une expérience unique',
        'bookings.explore':'Explorer les hébergements',
        'booking.confirm':'Confirmer et payer','booking.page_title':'Confirmez et payez votre réservation',
        'booking.page_sub':'Vérifiez les détails avant de confirmer votre réservation',
        'booking.your_trip':'Votre voyage','booking.checkin':'Arrivée','booking.checkout':'Départ',
        'booking.guests_label':'Voyageurs','booking.payment_method':'Méthode de paiement',
        'booking.notes':'Notes pour l\'hôte','booking.secure':'Paiement 100% sécurisé et crypté',
        'payment.card':'Carte','payment.cash':'Espèces',
        'search.clear':'Effacer les filtres',
        'community.trending':'Tendances','community.post_btn':'Publier','community.reviews':'avis',
        'community.title':'Communauté StayHuila','community.subtitle':'Partagez vos aventures',
        'community.rec_hospedaje':'HÉBERGEMENT RECOMMANDÉ',
        'community.rec_experiencia':'EXPÉRIENCE RECOMMANDÉE',
        'community.popular_places':'Lieux populaires',
        'community.trends':'Tendances au Huila',
        'map.user_location':'Vous êtes ici',
        'detail.share':'Partager','detail.save':'Enregistrer','detail.all_photos':'Voir toutes les photos',
        'detail.super_host':'SuperHost','detail.more':'Afficher plus','detail.less':'Afficher moins',
        'detail.offers':'Ce que propose ce lieu','detail.checkin_at':'Arrivée à','detail.checkout_at':'Départ à',
        'booking.reserve':'Réserver','booking.reserve_disabled':'Réserver (Désactivé)',
        'booking.no_charge':'Aucun frais pour le moment','booking.nights':'nuits','booking.service_fee':'Frais de service',
        'booking.total':'Total','booking.max_guests':'Max. {n} voyageurs',
        'booking.max_prefix':'Max.','booking.guests_lower':'voyageurs',
        'booking.repair_msg':'Cet hébergement est actuellement en maintenance. Les réservations sont temporairement suspendues.',
    },
    it: {
        'nav.lodgings':'Alloggi','nav.experiences':'Esperienze','nav.community':'Comunità',
        'nav.host_panel':'Pannello Host','nav.host_cta':'Pubblica il tuo spazio',
        'nav.my_profile':'Il Mio Profilo','nav.my_bookings':'Le Mie Prenotazioni',
        'nav.my_favorites':'I Miei Preferiti','nav.logout':'Esci','nav.login':'Accedi',
        'hero.title':'Scopri l\'essenza del Huila',
        'hero.subtitle':'Alloggi rurali, tenute e baite magiche consigliate per te',
        'hero.loc':'Posizione / Esperienza','hero.checkin':'Arrivo','hero.checkout':'Partenza',
        'hero.guests':'Ospiti','hero.loc_ph':'Es. Avventura a Tatacoa...','hero.guests_ph':'Quanti?',
        'cat.title':'Categorie','cat.all':'Tutti','cat.finca':'Tenuta','cat.cabana':'Baita','cat.glamping':'Glamping',
        'cat.habitacion':'Stanza privata','cat.hotel_boutique':'Boutique hotel','cat.casa_entera':'Intera casa',
        'cat.aventura':'Avventura','cat.cultural':'Culturale','cat.gastronomia':'Gastronomia','cat.naturaleza':'Natura',
        'cat.deportes':'Sport','cat.bienestar':'Benessere','cat.arte':'Arte','cat.ecoturismo':'Ecoturismo',
        'cat.coffee':'Aziende del Caffè','cat.eco':'Sostenibile & Eco','cat.desert':'Deserto',
        'cat.romantic':'Romantico','cat.adventure':'Avventura','cat.rest':'Riposo Profondo','cat.nearby':'Vicino a Te',
        'cat.location':'Posizione',
        'listings.title':'Consigliati per te','listings.subtitle':'Selezionati appositamente per te',
        'listings.btn':'Vedi dettagli','map.show':'Mostra Mappa','general.offline':'Disponibile Offline',
        'general.night':'notte','general.per_person':'a persona','general.back_home':'Torna alla home',
        'page.lodgings.h1':'Alloggi nel Huila','page.exp.h1':'Esperienze nel Huila',
        'login.welcome':'Bentornato','login.sub':'Accedi al tuo account per gestire le prenotazioni',
        'login.email':'Indirizzo email','login.pw':'Password','login.btn':'Accedi',
        'login.no_acc':'Non hai un account?','login.create':'Crea account gratuito',
        'login.hero_title':'Vivi la magia del Huila',
        'login.hero_sub':'Alloggi autentici, esperienze uniche e il calore della nostra terra',
        'login.feat1':'Prenotazioni sicure al 100%','login.feat2':'Host verificati',
        'login.feat3':'Guadagna punti con ogni prenotazione','login.feat4':'Assistenza 24/7',
        'tab.login':'Accedi','tab.register':'Registrati',
        'reg.title':'Crea account','reg.sub':'Unisciti alla comunità StayHuila gratuitamente','reg.btn':'Crea account',
        'form.name':'Nome','form.lastname':'Cognome','form.phone':'Telefono',
        'form.email_ph':'tua@email.com','form.pw_ph':'Tua password','form.name_ph':'Tuo nome',
        'form.lastname_ph':'Tuo cognome','form.phone_ph':'Es. 310...','form.pw_reg_ph':'Minimo 6 caratteri',
        'reg.agree':'Registrandoti accetti i nostri','reg.terms':'Termini di utilizzo',
        'login.next_alert':'Accedi per completare la tua prenotazione',
        'profile.title':'Informazioni Personali','profile.sub':'Gestisci i tuoi dati personali.',
        'profile.basic_data':'Dati di Base','profile.change_pw':'Cambia Password',
        'profile.new_pw':'Nuova Password','profile.confirm_pw':'Conferma Password',
        'profile.save':'Salva Modifiche','profile.points':'Punti StayHuila',
        'profile.level_text':'Livello Esploratore. Continua a viaggiare per raggiungere il livello Avventuriero!',
        'role.host':'Host','role.admin':'Administratore','role.guest':'Ospite',
        'reservas.title':'Le Mie Prenotazioni',
        'filter.all':'Tutte','filter.confirmed':'Confermate','filter.checkin':'In soggiorno',
        'filter.completed':'Completate','filter.cancelled':'Cancellate',
        'status.confirmed':'Confermata','status.checkin':'In soggiorno','status.completed':'Completata',
        'status.cancelled':'Cancellata','status.pending':'In attesa',
        'status.repair':'In Manutenzione','status.open':'Aperto',
        'bookings.new':'+ Nuova prenotazione','bookings.view':'Vedi dettaglio','bookings.code':'Codice',
        'bookings.empty_title':'Ancora nessuna prenotazione',
        'bookings.empty_sub':'Esplora gli alloggi del Huila e vivi un\'esperienza unica',
        'bookings.explore':'Esplora alloggi',
        'booking.confirm':'Conferma e paga','booking.page_title':'Conferma e paga la tua prenotazione',
        'booking.page_sub':'Controlla i dettagli prima di confermare la tua prenotazione',
        'booking.your_trip':'Il tuo viaggio','booking.checkin':'Arrivo','booking.checkout':'Partenza',
        'booking.guests_label':'Ospiti','booking.payment_method':'Metodo di pagamento',
        'booking.notes':'Note per host','booking.secure':'Pagamento 100% sicuro e crittografato',
        'payment.card':'Carta','payment.cash':'Contanti',
        'search.clear':'Cancella filtri',
        'community.trending':'Tendenze','community.post_btn':'Pubblica','community.reviews':'recensioni',
        'community.title':'Comunità StayHuila','community.subtitle':'Condividi le tue avventure',
        'community.rec_hospedaje':'ALLOGGIO CONSIGLIATO',
        'community.rec_experiencia':'ESPERIENZA CONSIGLIATA',
        'community.popular_places':'Luoghi popolari',
        'community.trends':'Tendenze nel Huila',
        'map.user_location':'Sei qui',
        'detail.share':'Condividi','detail.save':'Salva','detail.all_photos':'Vedi tutte le foto',
        'detail.super_host':'SuperHost','detail.more':'Mostra altro','detail.less':'Mostra meno',
        'detail.offers':'Cosa offre questo posto','detail.checkin_at':'Check-in alle','detail.checkout_at':'Checkout alle',
        'booking.reserve':'Prenota','booking.reserve_disabled':'Prenota (Disabilitato)',
        'booking.no_charge':'Non ti verrà addebitato nulla ancora','booking.nights':'notti','booking.service_fee':'Commissione di servizio',
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

/* ── Comprehensive Tourism, Amenities, Rules & Lexicon Map ─ */
const LEXICON = {
    en: {
        // Meses y Calendario
        'Enero': 'January', 'Febrero': 'February', 'Marzo': 'March', 'Abril': 'April',
        'Mayo': 'May', 'Junio': 'June', 'Julio': 'July', 'Agosto': 'August',
        'Septiembre': 'September', 'Octubre': 'October', 'Noviembre': 'November', 'Diciembre': 'December',
        'No disponible': 'Not available', 'Seleccionado': 'Selected', 'Hoy': 'Today',
        'Lun': 'Mon', 'Mar': 'Tue', 'Mié': 'Wed', 'Jue': 'Thu', 'Vie': 'Fri', 'Sáb': 'Sat', 'Dom': 'Sun',
        // Tipos de hospedaje y nombres
        'Hospedajes': 'Lodgings', 'Experiencias': 'Experiences', 'Comunidad': 'Community',
        'Hospedaje': 'Lodging', 'Experiencia': 'Experience', 'Panel Anfitrión': 'Host Panel',
        'Mi Perfil': 'My Profile', 'Mis Reservas': 'My Bookings', 'Mis Favoritos': 'My Favorites',
        'Cerrar Sesión': 'Log Out', 'Iniciar Sesión': 'Log In', 'Registrarse': 'Sign Up',
        'Finca': 'Farmstead', 'Cabaña': 'Cabin', 'Glamping': 'Glamping', 'Habitación privada': 'Private room',
        'Habitación compartida': 'Shared room', 'Hotel boutique': 'Boutique hotel', 'Casa entera': 'Entire house',
        'Casa de campo': 'Country house', 'Alojamiento rural': 'Rural lodging', 'Mirador': 'Viewpoint',
        'Posada': 'Inn', 'Ecolodge': 'Ecolodge', 'Hostal': 'Hostel',
        // Actividades, posts y tours
        'Show de DJ en el desierto': 'DJ Show in the Desert',
        'Show de DJ': 'DJ Show',
        'Show DJ': 'DJ Show',
        'Show DJ en Neiva': 'DJ Show in Neiva',
        'Show DJ En Neiva': 'DJ Show in Neiva',
        'Recolección de café': 'Coffee Harvesting',
        'Recoleccion de Cafe': 'Coffee Harvesting',
        'Recolección de Café': 'Coffee Harvesting',
        'Cosecha de café': 'Coffee Harvesting',
        'Cata de café': 'Coffee Tasting',
        'Visitar la mano del gigante': "Visit the Giant's Hand",
        'Mano del gigante': "Giant's Hand",
        'Mano del Gigante': "Giant's Hand",
        'Visitar': 'Visit', 'Visita a': 'Visit to',
        'Paseo a caballo': 'Horseback riding tour', 'Paseo en lancha': 'Boat tour', 'Cabalgata': 'Horseback riding',
        'Avistamiento de aves': 'Bird watching', 'Tour del café': 'Coffee tour', 'Ruta del café': 'Coffee route',
        'Caminata ecológica': 'Nature hike', 'Senderismo': 'Hiking', 'Pasadía': 'Day pass',
        'Tour astronómico': 'Astronomical tour', 'Aventura en el desierto': 'Desert adventure',
        'Desierto de la Tatacoa': 'Tatacoa Desert', 'Termales de Rivera': 'Rivera Hot Springs',
        'Represa de Betania': 'Betania Dam', 'Parque Arqueológico': 'Archaeological Park',
        // Comunidad & UI
        'Lugares populares': 'Popular Locations', 'Tendencias en Huila': 'Trends in Huila', 'Tendencia en Huila': 'Trend in Huila',
        'Recomendar un lugar': 'Recommend a place', 'Recomendar lugar': 'Recommend location', 'Foto': 'Photo',
        'Me gusta': 'Like', 'Comentar': 'Comment', 'Compartir': 'Share', 'Ver más →': 'See more →',
        'Hospedaje recomendado': 'RECOMMENDED LODGING', 'Experiencia recomendada': 'RECOMMENDED EXPERIENCE',
        'recomendación': 'recommendation', 'recomendaciones': 'recommendations',
        'Nivel Explorador': 'Explorer Level', 'Nivel Aventurero': 'Adventurer Level', 'Nivel Leyenda': 'Legend Level',
        '¡Sé el primero en publicar!': 'Be the first to post!',
        'Comparte una foto o recomendación del Huila.': 'Share a photo or recommendation from Huila.',
        'Explorar': 'Explore', 'Inicio': 'Home', 'Publicar': 'Post',
        'Pon tu espacio en StayHuila': 'List your space on StayHuila',
        // Amenidades y características
        'WiFi': 'WiFi', 'Piscina': 'Pool', 'Piscina privada': 'Private pool', 'Cocina equipada': 'Equipped kitchen',
        'Parqueadero gratuito': 'Free parking', 'Estacionamiento': 'Parking', 'Aire acondicionado': 'Air conditioning',
        'Se admiten mascotas': 'Pets allowed', 'Zona de trabajo': 'Workspace', 'Desayuno incluido': 'Breakfast included',
        'Telescopio': 'Telescope', 'Kayak incluido': 'Kayak included', 'Parrilla / BBQ': 'Grill / BBQ',
        'Termales privados': 'Private hot springs', 'Servicio de masajes': 'Massage service', 'Clases de yoga': 'Yoga classes',
        'Pesca deportiva': 'Sport fishing', 'Chimenea': 'Fireplace', 'Hamacas': 'Hammocks', 'TV': 'TV',
        'Lavadora': 'Washing machine', 'Patio interior': 'Courtyard', 'Tours guiados': 'Guided tours',
        'Vistas a la montaña': 'Mountain views', 'Vista al río': 'River view', 'Vista panorámica': 'Panoramic view',
        // Textos descriptivos frecuentes
        '100% Sostenible': '100% Sustainable', 'Sostenible': 'Sustainable', 'SuperAnfitrión': 'SuperHost',
        'En reparación': 'Under maintenance', 'Nuevo': 'New', 'Guardado': 'Saved', 'Guardar': 'Save',
        'Mostrar más': 'Show more', 'Mostrar menos': 'Show less', 'Ver todas las fotos': 'See all photos',
        'Lo que ofrece este lugar': 'What this place offers', 'Selecciona tus fechas': 'Select your dates',
        'Añade fechas para ver el precio exacto': 'Add dates to see the exact price', '¿Dónde está?': 'Where is it?',
        'La dirección exacta se comparte tras la reserva.': 'The exact address is shared after booking.',
        'Esta es tu publicación': 'This is your listing',
        'Los anfitriones no pueden reservar sus propios hospedajes.': 'Hosts cannot book their own lodgings.',
        'Los anfitriones no pueden reservar sus propias experiencias.': 'Hosts cannot book their own experiences.',
        'Ir al panel': 'Go to dashboard', 'Cancelación flexible': 'Flexible cancellation',
        'Cancelación moderada': 'Moderate cancellation', 'Cancelación estricta': 'Strict cancellation',
        'Cancela gratis hasta 24h antes de tu llegada.': 'Cancel free up to 24h before your arrival.',
        'Cancela gratis hasta 5 días antes de tu llegada.': 'Cancel free up to 5 days before your arrival.',
        'Cancela gratis hasta 14 días antes de tu llegada.': 'Cancel free up to 14 days before your arrival.',
        'Auto check-in con caja de llaves.': 'Self check-in with lockbox.',
        'FECHA DE LA ACTIVIDAD': 'ACTIVITY DATE', 'Selecciona un horario': 'Select a schedule',
        'Selecciona fecha': 'Select date', 'Reservar': 'Reserve', 'Reservar (Deshabilitado)': 'Reserve (Disabled)',
        'No se te cobrará nada aún': "You won't be charged yet", 'Tarifa de servicio': 'Service fee',
        'Total': 'Total', 'Descuento activo': 'Active discount',
        'personas': 'people', 'persona': 'person', 'huéspedes': 'guests', 'huésped': 'guest',
        'noches': 'nights', 'noche': 'night', 'habitaciones': 'bedrooms', 'habitación': 'bedroom',
        'camas': 'beds', 'cama': 'bed', 'baños': 'bathrooms', 'baño': 'bathroom', 'horas': 'hours', 'hora': 'hour',
        'reseñas': 'reviews', 'reseña': 'review', 'Anfitrión': 'Host', 'Contactar': 'Contact',
        'Limpieza': 'Cleanliness', 'Comunicación': 'Communication', 'Ubicación': 'Location',
        'Relación calidad-precio': 'Value for money', 'También te puede interesar': 'You may also be interested',
        'También te podría interesar': 'You might also like', 'Otros hospedajes disponibles en el Huila': 'Other available lodgings in Huila',
        'Deja tu reseña': 'Leave your review', 'Calificación general:': 'Overall rating:', 'Publicar reseña': 'Post review',
        'Nequi Negocios': 'Nequi Business', 'Enlace Directo': 'Direct Link',
        'Redirección segura al enlace oficial de pago de Nequi Negocios.': 'Secure redirection to the official Nequi payment link.'
    },
    pt: {
        'Enero': 'Janeiro', 'Febrero': 'Fevereiro', 'Marzo': 'Março', 'Abril': 'Abril',
        'Mayo': 'Maio', 'Junio': 'Junho', 'Julio': 'Julho', 'Agosto': 'Agosto',
        'Septiembre': 'Setembro', 'Octubre': 'Outubro', 'Noviembre': 'Novembro', 'Diciembre': 'Dezembro',
        'No disponible': 'Não disponível', 'Seleccionado': 'Selecionado', 'Hoy': 'Hoje',
        'Lun': 'Seg', 'Mar': 'Ter', 'Mié': 'Qua', 'Jue': 'Qui', 'Vie': 'Sex', 'Sáb': 'Sáb', 'Dom': 'Dom',
        // Tipos de hospedaje y nombres
        'Hospedajes': 'Hospedagens', 'Experiencias': 'Experiências', 'Comunidad': 'Comunidade',
        'Hospedaje': 'Hospedagem', 'Experiencia': 'Experiência', 'Panel Anfitrión': 'Painel do Anfitrião',
        'Mi Perfil': 'Meu Perfil', 'Mis Reservas': 'Minhas Reservas', 'Mis Favoritos': 'Meus Favoritos',
        'Cerrar Sesión': 'Sair', 'Iniciar Sesión': 'Entrar', 'Registrarse': 'Registrar',
        'Finca': 'Fazenda', 'Cabaña': 'Cabana', 'Glamping': 'Glamping', 'Habitación privada': 'Quarto privado',
        'Habitación compartida': 'Quarto compartilhado', 'Hotel boutique': 'Hotel boutique', 'Casa entera': 'Casa inteira',
        'Casa de campo': 'Casa de campo', 'Alojamiento rural': 'Alojamento rural', 'Mirador': 'Mirante',
        'Posada': 'Pousada', 'Ecolodge': 'Ecolodge', 'Hostal': 'Hostel',
        'Show de DJ en el desierto': 'Show de DJ no Deserto',
        'Show de DJ': 'Show de DJ',
        'Show DJ': 'Show de DJ',
        'Show DJ en Neiva': 'Show de DJ em Neiva',
        'Show DJ En Neiva': 'Show de DJ em Neiva',
        'Recolección de café': 'Colheita de Café',
        'Recoleccion de Cafe': 'Colheita de Café',
        'Recolección de Café': 'Colheita de Café',
        'Cosecha de café': 'Colheita de Café',
        'Cata de café': 'Degustação de Café',
        'Visitar la mano del gigante': 'Visitar a Mão do Gigante',
        'Mano del gigante': 'Mão do Gigante',
        'Mano del Gigante': 'Mão do Gigante',
        'Visitar': 'Visitar', 'Visita a': 'Visita a',
        'Paseo a caballo': 'Passeio a cavalo', 'Paseo en lancha': 'Passeio de barco', 'Cabalgata': 'Cavalgada',
        'Avistamiento de aves': 'Observação de aves', 'Tour del café': 'Tour do café', 'Ruta del café': 'Rota do café',
        'Caminata ecológica': 'Caminhada ecológica', 'Senderismo': 'Trilhas', 'Pasadía': 'Day use',
        'Tour astronómico': 'Tour astronômico', 'Aventura en el desierto': 'Aventura no deserto',
        'Desierto de la Tatacoa': 'Deserto da Tatacoa', 'Termales de Rivera': 'Termas de Rivera',
        'Represa de Betania': 'Represa de Betania', 'Parque Arqueológico': 'Parque Arqueológico',
        'Lugares populares': 'Locais populares', 'Tendencias en Huila': 'Tendências no Huila', 'Tendencia en Huila': 'Tendência no Huila',
        'Recomendar un lugar': 'Recomendar um lugar', 'Recomendar lugar': 'Recomendar local', 'Foto': 'Foto',
        'Me gusta': 'Curtir', 'Comentar': 'Comentar', 'Compartir': 'Compartilhar', 'Ver más →': 'Ver mais →',
        'Hospedaje recomendado': 'HOSPEDAGEM RECOMENDADA', 'Experiencia recomendada': 'EXPERIÊNCIA RECOMENDADA',
        'recomendación': 'recomendação', 'recomendaciones': 'recomendações',
        'Nivel Explorador': 'Nível Explorador', 'Nivel Aventurero': 'Nível Aventureiro', 'Nivel Leyenda': 'Nível Lenda',
        '¡Sé el primero en publicar!': 'Seja o primeiro a publicar!',
        'Comparte una foto o recomendación del Huila.': 'Compartilhe uma foto ou recomendação do Huila.',
        'Explorar': 'Explorar', 'Inicio': 'Início', 'Publicar': 'Publicar',
        'Pon tu espacio en StayHuila': 'Anuncie seu espaço no StayHuila',
        'WiFi': 'WiFi', 'Piscina': 'Piscina', 'Piscina privada': 'Piscina privativa', 'Cocina equipada': 'Cozinha equipada',
        'Parqueadero gratuito': 'Estacionamento gratuito', 'Estacionamiento': 'Estacionamento', 'Aire acondicionado': 'Ar condicionado',
        'Se admiten mascotas': 'Animais permitidos', 'Zona de trabajo': 'Espaço de trabalho', 'Desayuno incluido': 'Café da manhã incluído',
        'Telescopio': 'Telescópio', 'Kayak incluido': 'Kayak incluído', 'Parrilla / BBQ': 'Churrasqueira / BBQ',
        'Termales privados': 'Termas privadas', 'Servicio de masajes': 'Serviço de massagem', 'Clases de yoga': 'Aulas de yoga',
        'Pesca deportiva': 'Pesca esportiva', 'Chimenea': 'Lareira', 'Hamacas': 'Redes', 'TV': 'TV',
        'Lavadora': 'Máquina de lavar', 'Patio interior': 'Pátio interno', 'Tours guiados': 'Passeios guiados',
        'Vistas a la montaña': 'Vistas para a montanha', 'Vista al río': 'Vista para o rio', 'Vista panorámica': 'Vista panorâmica',
        '100% Sostenible': '100% Sustentável', 'Sostenible': 'Sustentável', 'SuperAnfitrión': 'SuperHost',
        'En reparación': 'Em manutenção', 'Nuevo': 'Novo', 'Guardado': 'Salvo', 'Guardar': 'Salvar',
        'Mostrar más': 'Mostrar mais', 'Mostrar menos': 'Mostrar menos', 'Ver todas las fotos': 'Ver todas as fotos',
        'Lo que ofrece este lugar': 'O que este lugar oferece', 'Selecciona tus fechas': 'Selecione suas datas',
        'Añade fechas para ver el precio exacto': 'Adicione datas para ver o preço exato', '¿Dónde está?': 'Onde fica?',
        'La dirección exacta se comparte tras la reserva.': 'O endereço exato é compartilhado após a reserva.',
        'Esta es tu publicación': 'Esta é a sua publicação',
        'Los anfitriones no pueden reservar sus propios hospedajes.': 'Anfitriões não podem reservar suas próprias hospedagens.',
        'Los anfitriones no pueden reservar sus propias experiencias.': 'Anfitriões não podem reservar suas próprias experiências.',
        'Ir al panel': 'Ir para o painel', 'Cancelación flexible': 'Cancelamento flexível',
        'Cancelación moderada': 'Cancelamento moderado', 'Cancelación estricta': 'Cancelamento rigoroso',
        'Cancela gratis hasta 24h antes de tu llegada.': 'Cancele grátis até 24h antes da sua chegada.',
        'Cancela gratis hasta 5 días antes de tu llegada.': 'Cancele grátis até 5 dias antes da sua chegada.',
        'Cancela gratis hasta 14 días antes de tu llegada.': 'Cancele grátis até 14 dias antes da sua chegada.',
        'Auto check-in con caja de llaves.': 'Self check-in com cofre de chaves.',
        'FECHA DE LA ACTIVIDAD': 'DATA DA ATIVIDADE', 'Selecciona un horario': 'Selecione um horário',
        'Selecciona fecha': 'Selecione a data', 'Reservar': 'Reservar', 'Reservar (Deshabilitado)': 'Reservar (Desabilitado)',
        'No se te cobrará nada aún': 'Nada será cobrado ainda', 'Tarifa de servicio': 'Taxa de serviço',
        'Total': 'Total', 'Descuento activo': 'Desconto ativo',
        'personas': 'pessoas', 'persona': 'pessoa', 'huéspedes': 'hóspedes', 'huésped': 'hóspede',
        'noches': 'noites', 'noche': 'noite', 'habitaciones': 'quartos', 'habitación': 'quarto',
        'camas': 'camas', 'cama': 'cama', 'baños': 'banheiros', 'baño': 'banheiro', 'horas': 'horas', 'hora': 'hora',
        'reseñas': 'avaliações', 'reseña': 'avaliação', 'Anfitrión': 'Anfitrião', 'Contactar': 'Contactar',
        'Limpieza': 'Limpeza', 'Comunicación': 'Comunicação', 'Ubicación': 'Localização',
        'Relación calidad-precio': 'Custo-benefício', 'También te puede interesar': 'Você também pode se interessar',
        'También te podría interesar': 'Você também pode gostar', 'Otros hospedajes disponibles en el Huila': 'Outras hospedagens disponíveis no Huila',
        'Deja tu reseña': 'Deixe sua avaliação', 'Calificación general:': 'Avaliação geral:', 'Publicar reseña': 'Publicar avaliação',
        'Nequi Negocios': 'Nequi Negócios', 'Enlace Directo': 'Link Direto',
        'Redirección segura al enlace oficial de pago de Nequi Negocios.': 'Redirecionamento seguro para o link de pagamento oficial do Nequi.'
    },
    fr: {
        'Enero': 'Janvier', 'Febrero': 'Février', 'Marzo': 'Mars', 'Abril': 'Avril',
        'Mayo': 'Mai', 'Junio': 'Juin', 'Julio': 'Juillet', 'Agosto': 'Août',
        'Septiembre': 'Septembre', 'Octubre': 'Octobre', 'Noviembre': 'Novembre', 'Diciembre': 'Décembre',
        'No disponible': 'Non disponible', 'Seleccionado': 'Sélectionné', 'Hoy': "Aujourd'hui",
        'Lun': 'Lun', 'Mar': 'Mar', 'Mié': 'Mer', 'Jue': 'Jeu', 'Vie': 'Ven', 'Sáb': 'Sam', 'Dom': 'Dim',
        // Tipos de hospedaje y nombres
        'Hospedajes': 'Hébergements', 'Experiencias': 'Expériences', 'Comunidad': 'Communauté',
        'Hospedaje': 'Hébergement', 'Experiencia': 'Expérience', 'Panel Anfitrión': "Tableau de l'hôte",
        'Mi Perfil': 'Mon Profil', 'Mis Reservas': 'Mes Réservations', 'Mis Favoritos': 'Mes Favoris',
        'Cerrar Sesión': 'Se déconnecter', 'Iniciar Sesión': 'Se connecter', 'Registrarse': "S'inscrire",
        'Finca': 'Domaine', 'Cabaña': 'Chalet', 'Glamping': 'Glamping', 'Habitación privada': 'Chambre privée',
        'Habitación compartida': 'Chambre partagée', 'Hotel boutique': 'Hôtel boutique', 'Casa entera': 'Maison entière',
        'Casa de campo': 'Maison de campagne', 'Alojamiento rural': 'Hébergement rural', 'Mirador': 'Belvédère',
        'Posada': 'Auberge', 'Ecolodge': 'Écolodge', 'Hostal': 'Auberge de jeunesse',
        'Show de DJ en el desierto': 'Spectacle DJ dans le Désert',
        'Show de DJ': 'Spectacle DJ',
        'Show DJ': 'Spectacle DJ',
        'Show DJ en Neiva': 'Spectacle DJ à Neiva',
        'Show DJ En Neiva': 'Spectacle DJ à Neiva',
        'Recolección de café': 'Récolte du Café',
        'Recoleccion de Cafe': 'Récolte du Café',
        'Recolección de Café': 'Récolte du Café',
        'Cosecha de café': 'Récolte du Café',
        'Cata de café': 'Dégustation de Café',
        'Visitar la mano del gigante': 'Visiter la Main du Géant',
        'Mano del gigante': 'Main du Géant',
        'Mano del Gigante': 'Main du Géant',
        'Visitar': 'Visiter', 'Visita a': 'Visite de',
        'Paseo a caballo': 'Balade à cheval', 'Paseo en lancha': 'Tour en bateau', 'Cabalgata': 'Randonnée équestre',
        'Avistamiento de aves': 'Observation des oiseaux', 'Tour del café': 'Tour du café', 'Ruta del café': 'Route du café',
        'Caminata ecológica': 'Randonnée écologique', 'Senderismo': 'Randonnée', 'Pasadía': 'Journée détente',
        'Tour astronómico': 'Tour astronomique', 'Aventura en el desierto': 'Aventure dans le désert',
        'Desierto de la Tatacoa': 'Désert de la Tatacoa', 'Termales de Rivera': 'Thermes de Rivera',
        'Represa de Betania': 'Barrage de Betania', 'Parque Arqueológico': 'Parc Archéologique',
        'Lugares populares': 'Lieux populaires', 'Tendencias en Huila': 'Tendances au Huila', 'Tendencia en Huila': 'Tendance au Huila',
        'Recomendar un lugar': 'Recommander un lieu', 'Recomendar lugar': 'Recommander un lieu', 'Foto': 'Photo',
        'Me gusta': "J'aime", 'Comentar': 'Commenter', 'Compartir': 'Partager', 'Ver más →': 'Voir plus →',
        'Hospedaje recomendado': 'HÉBERGEMENT RECOMMANDÉ', 'Experiencia recomendada': 'EXPÉRIENCE RECOMMANDÉE',
        'recomendación': 'recommandation', 'recomendaciones': 'recommandations',
        'Nivel Explorador': 'Niveau Explorateur', 'Nivel Aventurero': 'Niveau Aventurier', 'Nivel Leyenda': 'Niveau Légende',
        '¡Sé el primero en publicar!': 'Soyez le premier à publier !',
        'Comparte una foto o recomendación del Huila.': 'Partagez une photo ou recommandation du Huila.',
        'Explorar': 'Explorer', 'Inicio': 'Accueil', 'Publicar': 'Publier',
        'Pon tu espacio en StayHuila': 'Publiez votre logement',
        'WiFi': 'WiFi', 'Piscina': 'Piscine', 'Piscina privada': 'Piscine privée', 'Cocina equipada': 'Cuisine équipée',
        'Parqueadero gratuito': 'Parking gratuit', 'Estacionamiento': 'Parking', 'Aire acondicionado': 'Climatisation',
        'Se admiten mascotas': 'Animaux acceptés', 'Zona de trabajo': 'Espace de travail', 'Desayuno incluido': 'Petit-déjeuner inclus',
        'Telescopio': 'Télescope', 'Kayak incluido': 'Kayak inclus', 'Parrilla / BBQ': 'Grillade / BBQ',
        'Termales privados': 'Thermes privés', 'Servicio de masajes': 'Service de massage', 'Clases de yoga': 'Cours de yoga',
        'Pesca deportiva': 'Pêche sportive', 'Chimenea': 'Cheminée', 'Hamacas': 'Hamacs', 'TV': 'TV',
        'Lavadora': 'Machine à laver', 'Patio interior': 'Cour intérieure', 'Tours guiados': 'Visites guidées',
        'Vistas a la montaña': 'Vue sur la montagne', 'Vista al río': 'Vue sur la rivière', 'Vista panorámica': 'Vue panoramique',
        '100% Sostenible': '100% Durable', 'Sostenible': 'Durable', 'SuperAnfitrión': 'SuperHost',
        'En reparación': 'En maintenance', 'Nuevo': 'Nouveau', 'Guardado': 'Enregistré', 'Guardar': 'Enregistrer',
        'Mostrar más': 'Afficher plus', 'Mostrar menos': 'Afficher moins', 'Ver todas las fotos': 'Voir toutes les photos',
        'Lo que ofrece este lugar': 'Ce que propose ce lieu', 'Selecciona tus fechas': 'Sélectionnez vos dates',
        'Añade fechas para ver el precio exacto': 'Ajoutez des dates pour voir le prix exact', '¿Dónde está?': 'Où est-ce ?',
        'La dirección exacta se comparte tras la reserva.': "L'adresse exacte est partagée après la réservation.",
        'Esta es tu publicación': 'Ceci est votre annonce',
        'Los anfitriones no pueden reservar sus propios hospedajes.': 'Les hôtes ne peuvent pas réserver leurs propres hébergements.',
        'Los anfitriones no pueden reservar sus propias experiencias.': 'Les hôtes ne peuvent pas réserver leurs propres expériences.',
        'Ir al panel': 'Aller au tableau de bord', 'Cancelación flexible': 'Annulation flexible',
        'Cancelación moderada': 'Annulation modérée', 'Cancelación estricta': 'Annulation stricte',
        'Cancela gratis hasta 24h antes de tu llegada.': 'Annulation gratuite jusqu\'à 24h avant votre arrivée.',
        'Cancela gratis hasta 5 días antes de tu llegada.': 'Annulation gratuite jusqu\'à 5 jours avant votre arrivée.',
        'Cancela gratis hasta 14 días antes de tu llegada.': 'Annulation gratuite jusqu\'à 14 jours avant votre arrivée.',
        'Auto check-in con caja de llaves.': 'Arrivée autonome avec boîte à clés.',
        'FECHA DE LA ACTIVIDAD': "DATE DE L'ACTIVITÉ", 'Selecciona un horario': 'Sélectionnez un horaire',
        'Selecciona fecha': 'Sélectionner une date', 'Reservar': 'Réserver', 'Reservar (Deshabilitado)': 'Réserver (Désactivé)',
        'No se te cobrará nada aún': 'Aucun frais pour le moment', 'Tarifa de servicio': 'Frais de service',
        'Total': 'Total', 'Descuento activo': 'Remise active',
        'personas': 'personnes', 'persona': 'personne', 'huéspedes': 'voyageurs', 'huésped': 'voyageur',
        'noches': 'nuits', 'noche': 'nuit', 'habitaciones': 'chambres', 'habitación': 'chambre',
        'camas': 'lits', 'cama': 'lit', 'baños': 'salles de bain', 'baño': 'salle de bain', 'horas': 'heures', 'hora': 'heure',
        'reseñas': 'avis', 'reseña': 'avis', 'Anfitrión': 'Hôte', 'Contactar': 'Contacter',
        'Limpieza': 'Propreté', 'Comunicación': 'Communication', 'Ubicación': 'Emplacement',
        'Relación calidad-precio': 'Rapport qualité-prix', 'También te puede interesar': 'Vous pourriez aussi aimer',
        'También te podría interesar': 'Cela pourrait aussi vous intéresser', 'Otros hospedajes disponibles en el Huila': 'Autres hébergements disponibles au Huila',
        'Deja tu reseña': 'Laissez votre avis', 'Calificación general:': 'Note générale :', 'Publicar reseña': 'Publier un avis',
        'Nequi Negocios': 'Nequi Entreprise', 'Enlace Directo': 'Lien Direct',
        'Redirección segura al enlace oficial de pago de Nequi Negocios.': 'Redirection sécurisée vers le lien de paiement officiel Nequi.'
    },
    it: {
        'Enero': 'Gennaio', 'Febrero': 'Febbraio', 'Marzo': 'Marzo', 'Abril': 'Aprile',
        'Mayo': 'Maggio', 'Junio': 'Giugno', 'Julio': 'Luglio', 'Agosto': 'Agosto',
        'Septiembre': 'Settembre', 'Octubre': 'Ottobre', 'Noviembre': 'Novembre', 'Diciembre': 'Dicembre',
        'No disponible': 'Non disponibile', 'Seleccionado': 'Selezionato', 'Hoy': 'Oggi',
        'Lun': 'Lun', 'Mar': 'Mar', 'Mié': 'Mer', 'Jue': 'Gio', 'Vie': 'Ven', 'Sáb': 'Sab', 'Dom': 'Dom',
        // Tipos de hospedaje y nombres
        'Hospedajes': 'Alloggi', 'Experiencias': 'Esperienze', 'Comunidad': 'Comunità',
        'Hospedaje': 'Alloggio', 'Experiencia': 'Esperienza', 'Panel Anfitrión': 'Pannello Host',
        'Mi Perfil': 'Il Mio Profilo', 'Mis Reservas': 'Le Mie Prenotazioni', 'Mis Favoritos': 'I Miei Preferiti',
        'Cerrar Sesión': 'Esci', 'Iniciar Sesión': 'Accedi', 'Registrarse': 'Registrati',
        'Finca': 'Tenuta', 'Cabaña': 'Baita', 'Glamping': 'Glamping', 'Habitación privada': 'Stanza privata',
        'Habitación compartida': 'Stanza condivisa', 'Hotel boutique': 'Boutique hotel', 'Casa entera': 'Intera casa',
        'Casa de campo': 'Casa di campagna', 'Alojamiento rural': 'Alloggio rurale', 'Mirador': 'Belvedere',
        'Posada': 'Locanda', 'Ecolodge': 'Ecolodge', 'Hostal': 'Ostello',
        'Show de DJ en el desierto': 'DJ Show nel Deserto',
        'Show de DJ': 'DJ Show',
        'Show DJ': 'DJ Show',
        'Show DJ en Neiva': 'DJ Show a Neiva',
        'Show DJ En Neiva': 'DJ Show a Neiva',
        'Recolección de café': 'Raccolta del Caffè',
        'Recoleccion de Cafe': 'Raccolta del Caffè',
        'Recolección de Café': 'Raccolta del Caffè',
        'Cosecha de café': 'Raccolta del Caffè',
        'Cata de café': 'Degustazione di Caffè',
        'Visitar la mano del gigante': 'Visitare la Mano del Gigante',
        'Mano del gigante': 'Mano del Gigante',
        'Mano del Gigante': 'Mano del Gigante',
        'Visitar': 'Visitare', 'Visita a': 'Visita a',
        'Paseo a caballo': 'Passeggiata a cavallo', 'Paseo en lancha': 'Giro in barca', 'Cabalgata': 'Cavalcata',
        'Avistamiento de aves': 'Birdwatching', 'Tour del café': 'Tour del caffè', 'Ruta del café': 'Strada del caffè',
        'Caminata ecológica': 'Camminata ecologica', 'Senderismo': 'Trekking', 'Pasadía': 'Giornata relax',
        'Tour astronómico': 'Tour astronomico', 'Aventura en el desierto': 'Avventura nel deserto',
        'Desierto de la Tatacoa': 'Deserto del Tatacoa', 'Termales de Rivera': 'Terme di Rivera',
        'Represa de Betania': 'Diga di Betania', 'Parque Arqueológico': 'Parco Archeologico',
        'Lugares populares': 'Luoghi popolari', 'Tendencias en Huila': 'Tendenze nel Huila', 'Tendencia en Huila': 'Tendenza nel Huila',
        'Recomendar un lugar': 'Raccomanda un luogo', 'Recomendar lugar': 'Raccomanda luogo', 'Foto': 'Foto',
        'Me gusta': 'Mi piace', 'Comentar': 'Commenta', 'Compartir': 'Condividi', 'Ver más →': 'Vedi altro →',
        'Hospedaje recomendado': 'ALLOGGIO CONSIGLIATO', 'Experiencia recomendada': 'ESPERIENZA CONSIGLIATA',
        'recomendación': 'raccomandazione', 'recomendaciones': 'raccomandazioni',
        'Nivel Explorador': 'Livello Esploratore', 'Nivel Aventurero': 'Livello Avventuriero', 'Nivel Leyenda': 'Livello Leggenda',
        '¡Sé el primero en publicar!': 'Sii il primo a pubblicare!',
        'Comparte una foto o recomendación del Huila.': 'Condividi una foto o raccomandazione del Huila.',
        'Explorar': 'Esplora', 'Inicio': 'Home', 'Publicar': 'Pubblica',
        'Pon tu espacio en StayHuila': 'Pubblica il tuo spazio',
        'WiFi': 'WiFi', 'Piscina': 'Piscina', 'Piscina privada': 'Piscina privata', 'Cocina equipada': 'Cucina attrezzata',
        'Parqueadero gratuito': 'Parcheggio gratuito', 'Estacionamiento': 'Parcheggio', 'Aire acondicionado': 'Aria condizionata',
        'Se admiten mascotas': 'Animali ammessi', 'Zona de trabajo': 'Spazio di lavoro', 'Desayuno incluido': 'Colazione inclusa',
        'Telescopio': 'Telescopio', 'Kayak incluido': 'Kayak incluso', 'Parrilla / BBQ': 'Griglia / BBQ',
        'Termales privados': 'Terme private', 'Servicio de masajes': 'Servizio massaggi', 'Clases de yoga': 'Lezioni di yoga',
        'Pesca deportiva': 'Pesca sportiva', 'Chimenea': 'Camino', 'Hamacas': 'Amache', 'TV': 'TV',
        'Lavadora': 'Lavatrice', 'Patio interior': 'Cortile interno', 'Tours guiados': 'Tour guidati',
        'Vistas a la montaña': 'Vista sulle montagne', 'Vista al río': 'Vista sul fiume', 'Vista panorámica': 'Vista panoramica',
        '100% Sostenible': '100% Sostenibile', 'Sostenible': 'Sostenibile', 'SuperAnfitrión': 'SuperHost',
        'En reparación': 'In manutenzione', 'Nuevo': 'Nuovo', 'Guardado': 'Salvato', 'Guardar': 'Salva',
        'Mostrar más': 'Mostra altro', 'Mostrar menos': 'Mostra meno', 'Ver todas las fotos': 'Vedi tutte le foto',
        'Lo que ofrece este lugar': 'Cosa offre questo posto', 'Selecciona tus fechas': 'Seleziona le tue date',
        'Añade fechas para ver el precio exacto': 'Aggiungi date per vedere il prezzo esatto', '¿Dónde está?': 'Dove si trova?',
        'La dirección exacta se comparte tras la reserva.': "L'indirizzo esatto viene condiviso dopo la prenotazione.",
        'Esta es tu publicación': 'Questo è il tuo annuncio',
        'Los anfitriones no pueden reservar sus propios hospedajes.': 'Gli host non possono prenotare i propri alloggi.',
        'Los anfitriones no pueden reservar sus propias experiencias.': 'Gli host non possono prenotare le proprie esperienze.',
        'Ir al panel': 'Vai al pannello', 'Cancelación flexible': 'Cancellazione flessibile',
        'Cancelación moderada': 'Cancellazione moderata', 'Cancelación estricta': 'Cancellazione rigorosa',
        'Cancela gratis hasta 24h antes de tu llegada.': 'Cancella gratis fino a 24 ore prima dell\'arrivo.',
        'Cancela gratis hasta 5 días antes de tu llegada.': 'Cancella gratis fino a 5 giorni prima dell\'arrivo.',
        'Cancela gratis hasta 14 días antes de tu llegada.': 'Cancella gratis fino a 14 giorni prima dell\'arrivo.',
        'Auto check-in con caja de llaves.': 'Self check-in con cassetta di sicurezza.',
        'FECHA DE LA ACTIVIDAD': "DATA DELL'ATTIVITÀ", 'Selecciona un horario': 'Seleziona un orario',
        'Selecciona fecha': 'Seleziona data', 'Reservar': 'Prenota', 'Reservar (Deshabilitado)': 'Prenota (Disabilitato)',
        'No se te cobrará nada aún': 'Non ti verrà addebitato nulla ancora', 'Tarifa de servicio': 'Commissione di servizio',
        'Total': 'Totale', 'Descuento activo': 'Sconto attivo',
        'personas': 'persone', 'persona': 'persona', 'huéspedes': 'ospiti', 'huésped': 'ospite',
        'noches': 'notti', 'noche': 'notte', 'habitaciones': 'camere', 'habitación': 'camera',
        'camas': 'letti', 'cama': 'letto', 'baños': 'bagni', 'baño': 'bagno', 'horas': 'ore', 'hora': 'ora',
        'reseñas': 'recensioni', 'reseña': 'recensione', 'Anfitrión': 'Host', 'Contactar': 'Contatta',
        'Limpieza': 'Pulizia', 'Comunicación': 'Comunicazione', 'Ubicación': 'Posizione',
        'Relación calidad-precio': 'Rapporto qualità-prezzo', 'También te puede interesar': 'Potrebbe interessarti anche',
        'También te podría interesar': 'Ti potrebbe interessare anche', 'Otros hospedajes disponibles en el Huila': 'Altri alloggi disponibili nel Huila',
        'Deja tu reseña': 'Lascia la tua recensione', 'Calificación general:': 'Valutazione generale:', 'Publicar reseña': 'Pubblica recensione',
        'Nequi Negocios': 'Nequi Business', 'Enlace Directo': 'Link Diretto',
        'Redirección segura al enlace oficial de pago de Nequi Negocios.': 'Reindirizzamento sicuro al link di pagamento ufficiale Nequi.'
    }
};

const ATTR = {
    en: {
        'Ver mis puntos':'View my points','Municipio, nombre o tipo...':'Municipality, name or type...',
        '🔍  Municipio, nombre o tipo...':'🔍  Municipality, name or type...',
        'Buscar hospedajes, experiencias, cabañas, Tatacoa, café, show...':'Search lodgings, experiences, cabins, Tatacoa, coffee, show...',
        'Ej. Aventura en Tatacoa...':'E.g. Adventure in Tatacoa...','¿Cuántos?':'How many?',
        'Mínimo 6 caracteres':'Minimum 6 characters','Repite la nueva contraseña':'Repeat the new password',
        'Como aparece en la tarjeta':'As shown on the card',
        '¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':'Approximate arrival time? Any special request? Celebrating something?',
        'Buscar hospedaje o experiencia...':'Search lodging or experience...','Escribe tu búsqueda...':'Type your search...',
        'Escribe un comentario...':'Write a comment...',
        '¿Qué quieres compartir sobre el Huila,':'What do you want to share about Huila,',
        'Búsqueda por voz':'Voice search','El correo no se puede cambiar':'Email cannot be changed',
        '¿Cómo fue tu experiencia en este lugar?':'How was your experience in this place?'
    },
    pt: {
        'Ver mis puntos':'Ver meus pontos','Municipio, nombre o tipo...':'Município, nome ou tipo...',
        '🔍  Municipio, nombre o tipo...':'🔍  Município, nome ou tipo...',
        'Buscar hospedajes, experiencias, cabañas, Tatacoa, café, show...':'Buscar hospedagens, experiências, cabanas, Tatacoa, café, show...',
        'Ej. Aventura en Tatacoa...':'Ex. Aventura no Tatacoa...','¿Cuántos?':'Quantos?',
        'Mínimo 6 caracteres':'Mínimo 6 caracteres','Repite la nueva contraseña':'Repita a nova senha',
        'Como aparece en la tarjeta':'Como aparece no cartão',
        '¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':'Hora aproximada de chegada? Alguma necessidade especial? Está comemorando algo?',
        'Buscar hospedaje o experiencia...':'Buscar hospedagem ou experiência...','Escribe tu búsqueda...':'Digite sua busca...',
        'Escribe un comentario...':'Escreva um comentário...',
        '¿Qué quieres compartir sobre el Huila,':'O que você quer compartilhar sobre o Huila,',
        'Búsqueda por voz':'Busca por voz','El correo no se puede cambiar':'O e-mail não pode ser alterado',
        '¿Cómo fue tu experiencia en este lugar?':'Como foi sua experiência neste lugar?'
    },
    fr: {
        'Ver mis puntos':'Voir mes points','Municipio, nombre o tipo...':'Commune, nom ou type...',
        '🔍  Municipio, nombre o tipo...':'🔍  Commune, nom ou type...',
        'Buscar hospedajes, experiencias, cabañas, Tatacoa, café, show...':'Rechercher des hébergements, expériences, chalets, Tatacoa, café, spectacle...',
        'Ej. Aventura en Tatacoa...':'Ex. Aventure à Tatacoa...','¿Cuántos?':'Combien ?',
        'Mínimo 6 caracteres':'Minimum 6 caractères','Repite la nueva contraseña':'Répétez le nouveau mot de passe',
        'Como aparece en la tarjeta':'Comme indiqué sur la carte',
        '¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':"Heure d'arrivée approximative ? Demande particulière ? Vous célébrez quelque chose ?",
        'Buscar hospedaje o experiencia...':'Rechercher un hébergement ou une expérience...','Escribe tu búsqueda...':'Tapez votre recherche...',
        'Escribe un comentario...':'Écrire un commentaire...',
        '¿Qué quieres compartir sobre el Huila,':'Que voulez-vous partager sur le Huila,',
        'Búsqueda por voz':'Recherche vocale','El correo no se puede cambiar':"L'e-mail ne peut pas être modifié",
        '¿Cómo fue tu experiencia en este lugar?':'Comment s’est passée votre expérience dans ce lieu ?'
    },
    it: {
        'Ver mis puntos':'Vedi i miei punti','Municipio, nombre o tipo...':'Comune, nome o tipo...',
        '🔍  Municipio, nombre o tipo...':'🔍  Comune, nome o tipo...',
        'Buscar hospedajes, experiencias, cabañas, Tatacoa, café, show...':'Cerca alloggi, esperienze, baite, Tatacoa, caffè, spettacolo...',
        'Ej. Aventura en Tatacoa...':'Es. Avventura nel Tatacoa...','¿Cuántos?':'Quanti?',
        'Mínimo 6 caracteres':'Minimo 6 caratteri','Repite la nueva contraseña':'Ripeti la nuova password',
        'Como aparece en la tarjeta':'Come appare sulla carta',
        '¿Hora de llegada aproximada? ¿Alguna necesidad especial? ¿Celebras algo?':'Orario di arrivo approssimativo? Richieste speciali? Festeggi qualcosa?',
        'Buscar hospedaje o experiencia...':'Cerca alloggio o esperienza...','Escribe tu búsqueda...':'Scrivi la tua ricerca...',
        'Escribe un comentario...':'Scrivi un commento...',
        '¿Qué quieres compartir sobre el Huila,':'Cosa vuoi condividere sul Huila,',
        'Búsqueda por voz':'Ricerca vocale','El correo no se puede cambiar':"L'e-mail non può essere modificata",
        '¿Cómo fue tu experiencia en este lugar?':'Com’è stata la tua esperienza in questo posto?'
    }
};

const TITLES = {
    en: {'Todos los Hospedajes':'All Lodgings','Todas las Experiencias':'All Experiences','Hospedajes Auténticos':'Authentic Lodgings','Mi Perfil':'My Profile','Mis Favoritos':'My Favorites','Comunidad':'Community','Completar Reserva':'Complete Booking'},
    pt: {'Todos los Hospedajes':'Todas as Hospedagens','Todas las Experiencias':'Todas as Experiências','Hospedajes Auténticos':'Hospedagens Autênticas','Mi Perfil':'Meu Perfil','Mis Favoritos':'Meus Favoritos','Comunidad':'Comunidade','Completar Reserva':'Completar Reserva'},
    fr: {'Todos los Hospedajes':'Tous les Hébergements','Todas las Experiencias':'Toutes les Expériences','Hospedajes Auténticos':'Hébergements Authentiques','Mi Perfil':'Mon Profil','Mis Favoritos':'Mes Favoris','Comunidad':'Communauté','Completar Reserva':'Finaliser la Réservation'},
    it: {'Todos los Hospedajes':'Tutti gli Alloggi','Todas las Experiencias':'Tutte le Esperienze','Hospedajes Auténticos':'Alloggi Autentici','Mi Perfil':'Il Mio Profilo','Mis Favoritos':'I Miei Preferiti','Comunidad':'Comunità','Completar Reserva':'Completa Prenotazione'}
};

const CONNECTORS = {
    en: [
        [/\bcon piscina privada\b/gi, 'with private pool'],
        [/\bcon piscina\b/gi, 'with pool'],
        [/\bcon jacuzzi\b/gi, 'with jacuzzi'],
        [/\bcon vista panorámica\b/gi, 'with panoramic view'],
        [/\bcon vista al río\b/gi, 'with river view'],
        [/\bcon vista a la montaña\b/gi, 'with mountain view'],
        [/\bvistas a la montaña\b/gi, 'mountain views'],
        [/\ben el desierto\b/gi, 'in the desert'],
        [/\bcerca de la\b/gi, 'near the'],
        [/\bcerca del\b/gi, 'near the'],
        [/\bcerca de\b/gi, 'near'],
        [/\bfrente a la\b/gi, 'in front of the'],
        [/\bfrente al\b/gi, 'in front of the'],
        [/\bfrente a\b/gi, 'facing'],
        [/\ben medio de la naturaleza\b/gi, 'surrounded by nature'],
        [/\bideal para descansar\b/gi, 'ideal for relaxing'],
        [/\bpara toda la familia\b/gi, 'for the whole family'],
        [/\bclima cálido\b/gi, 'warm weather'],
        [/\bcampestre\b/gi, 'country'],
        [/\brural\b/gi, 'rural'],
        [/\bhermosa\b/gi, 'beautiful'],
        [/\bhermoso\b/gi, 'beautiful'],
        [/\bacogedora\b/gi, 'cozy'],
        [/\bacogedor\b/gi, 'cozy'],
        [/\bincreíble\b/gi, 'incredible'],
        [/\bespectacular\b/gi, 'spectacular'],
        [/\bmágico\b/gi, 'magical'],
        [/\bmágica\b/gi, 'magical'],
        [/\bprivada\b/gi, 'private'],
        [/\bprivado\b/gi, 'private'],
        [/\bcon\b/gi, 'with'],
        [/\ben\b/gi, 'in'],
        [/\bde\b/gi, 'of'],
        [/\bdel\b/gi, 'of the'],
        [/\by\b/gi, 'and'],
        [/\bpara\b/gi, 'for']
    ],
    pt: [
        [/\bcon piscina privada\b/gi, 'com piscina privativa'],
        [/\bcon piscina\b/gi, 'com piscina'],
        [/\bcon jacuzzi\b/gi, 'com jacuzzi'],
        [/\bcon vista panorámica\b/gi, 'com vista panorâmica'],
        [/\bcon vista al río\b/gi, 'com vista para o rio'],
        [/\bcon vista a la montaña\b/gi, 'com vista para a montanha'],
        [/\bvistas a la montaña\b/gi, 'vistas para a montanha'],
        [/\ben el desierto\b/gi, 'no deserto'],
        [/\bcerca de la\b/gi, 'perto da'],
        [/\bcerca del\b/gi, 'perto do'],
        [/\bcerca de\b/gi, 'perto de'],
        [/\ben medio de la naturaleza\b/gi, 'em meio à natureza'],
        [/\bideal para descansar\b/gi, 'ideal para descansar'],
        [/\bpara toda la familia\b/gi, 'para toda a família'],
        [/\bclima cálido\b/gi, 'clima quente'],
        [/\bcampestre\b/gi, 'campestre'],
        [/\bhermosa\b/gi, 'linda'],
        [/\bhermoso\b/gi, 'lindo'],
        [/\bacogedora\b/gi, 'aconchegante'],
        [/\bacogedor\b/gi, 'aconchegante'],
        [/\bprivada\b/gi, 'privativa'],
        [/\bprivado\b/gi, 'privativo'],
        [/\bcon\b/gi, 'com'],
        [/\ben\b/gi, 'em'],
        [/\bde\b/gi, 'de'],
        [/\bdel\b/gi, 'do'],
        [/\by\b/gi, 'e'],
        [/\bpara\b/gi, 'para']
    ],
    fr: [
        [/\bcon piscina privada\b/gi, 'avec piscine privée'],
        [/\bcon piscina\b/gi, 'avec piscine'],
        [/\bcon jacuzzi\b/gi, 'avec jacuzzi'],
        [/\bcon vista panorámica\b/gi, 'avec vue panoramique'],
        [/\bcon vista al río\b/gi, 'avec vue sur la rivière'],
        [/\bcon vista a la montaña\b/gi, 'avec vue sur la montagne'],
        [/\bvistas a la montaña\b/gi, 'vue sur la montagne'],
        [/\ben el desierto\b/gi, 'dans le désert'],
        [/\bcerca de la\b/gi, 'près de la'],
        [/\bcerca del\b/gi, 'près du'],
        [/\bcerca de\b/gi, 'près de'],
        [/\ben medio de la naturaleza\b/gi, 'en pleine nature'],
        [/\bideal para descansar\b/gi, 'idéal pour se reposer'],
        [/\bpara toda la familia\b/gi, 'pour toute la famille'],
        [/\bclima cálido\b/gi, 'climat chaud'],
        [/\bcampestre\b/gi, 'champêtre'],
        [/\bhermosa\b/gi, 'belle'],
        [/\bhermoso\b/gi, 'beau'],
        [/\bacogedora\b/gi, 'chaleureuse'],
        [/\bacogedor\b/gi, 'chaleureux'],
        [/\bprivada\b/gi, 'privée'],
        [/\bprivado\b/gi, 'privé'],
        [/\bcon\b/gi, 'avec'],
        [/\ben\b/gi, 'à'],
        [/\bde\b/gi, 'de'],
        [/\bdel\b/gi, 'du'],
        [/\by\b/gi, 'et'],
        [/\bpara\b/gi, 'pour']
    ],
    it: [
        [/\bcon piscina privada\b/gi, 'con piscina privata'],
        [/\bcon piscina\b/gi, 'con piscina'],
        [/\bcon jacuzzi\b/gi, 'con jacuzzi'],
        [/\bcon vista panorámica\b/gi, 'con vista panoramica'],
        [/\bcon vista al río\b/gi, 'con vista sul fiume'],
        [/\bcon vista a la montaña\b/gi, 'con vista sulle montagne'],
        [/\bvistas a la montaña\b/gi, 'vista sulle montagne'],
        [/\ben el desierto\b/gi, 'nel deserto'],
        [/\bcerca de la\b/gi, 'vicino alla'],
        [/\bcerca del\b/gi, 'vicino al'],
        [/\bcerca de\b/gi, 'vicino a'],
        [/\ben medio de la naturaleza\b/gi, 'immerso nella natura'],
        [/\bideal para descansar\b/gi, 'ideale per rilassarsi'],
        [/\bpara toda la familia\b/gi, 'per tutta la famiglia'],
        [/\bclima cálido\b/gi, 'clima caldo'],
        [/\bcampestre\b/gi, 'di campagna'],
        [/\bhermosa\b/gi, 'bellissima'],
        [/\bhermoso\b/gi, 'bellissimo'],
        [/\bacogedora\b/gi, 'accogliente'],
        [/\bacogedor\b/gi, 'accogliente'],
        [/\bprivada\b/gi, 'privata'],
        [/\bprivado\b/gi, 'privato'],
        [/\bcon\b/gi, 'con'],
        [/\ben\b/gi, 'a'],
        [/\bde\b/gi, 'di'],
        [/\bdel\b/gi, 'del'],
        [/\by\b/gi, 'e'],
        [/\bpara\b/gi, 'per']
    ]
};

function stripAccents(str) {
    return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/* ── Smart Instant Token/Phrasal Translator ───────────────── */
function smartInstantTranslate(text, code) {
    if (!text || code === 'es') return text;
    const dict = LEXICON[code] || {};
    const clean = text.trim();
    if (!clean) return text;

    // 1. Coincidencia exacta directa
    if (dict[clean]) return dict[clean];

    // 2. Coincidencia case-insensitive y diacrítico-insensible
    const stripped = stripAccents(clean);
    for (const [k, v] of Object.entries(dict)) {
        if (stripAccents(k) === stripped) {
            return v;
        }
    }

    // 3. Traducción inteligente de títulos compuestos y descripciones comunes
    let output = clean;
    let modified = false;

    // Reemplazo de frases clave primero (ordenadas por longitud decreciente para evitar colisiones)
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const k of sortedKeys) {
        if (k.length >= 3) {
            const strippedK = stripAccents(k);
            if (stripAccents(output).includes(strippedK)) {
                const regexPattern = k.split('').map(c => {
                    const low = c.toLowerCase();
                    if ('aeiouáéíóú'.includes(low)) {
                        return '[aáeéiíoóuúAÁEÉIÍOÓUÚ]';
                    }
                    return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }).join('');
                const regex = new RegExp(regexPattern, 'gi');
                if (regex.test(output)) {
                    output = output.replace(regex, (match) => {
                        modified = true;
                        const val = dict[k];
                        if (match[0] === match[0].toUpperCase() && val.length > 0) {
                            return val[0].toUpperCase() + val.slice(1);
                        }
                        return val;
                    });
                }
            }
        }
    }

    // 4. Reemplazo de conectores y descriptores gramaticales
    const connList = CONNECTORS[code] || [];
    for (const [regex, replacement] of connList) {
        if (regex.test(output)) {
            output = output.replace(regex, (match) => {
                modified = true;
                if (match[0] === match[0].toUpperCase() && replacement.length > 0) {
                    return replacement[0].toUpperCase() + replacement.slice(1);
                }
                return replacement;
            });
        }
    }

    return modified ? output : null;
}

/* ── Engine ─────────────────────────────────────────────── */
const ORIGINAL_TEXT = new WeakMap();
const TRACKED_TEXT_NODES = new Set();
const ORIGINAL_TITLE = document.title;

let observer = null;
let lastLang = localStorage.getItem('sh_lang') || 'es';
const requestedTexts = new Set();
const pendingTexts = new Set();
let translateTimeout = null;

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
    const norm = normalizedText(text);
    if (!norm) return false;
    if (/^[0-9\s.,$%&()\-+/*:;!?#@|]+$/.test(norm)) return false;
    if (norm.length <= 1) return false;
    return true;
}

const I18n = {
    current: localStorage.getItem('sh_lang') || 'es',

    t(key) {
        return (T[this.current] || T['es'])[key] || (T['es'][key] || key);
    },

    setLang(code) {
        if (!LANGUAGES[code]) return;
        this.current = code;
        localStorage.setItem('sh_lang', code);
        document.documentElement.lang = code;
        
        // Ejecución síncrona instantánea en todo el DOM
        this.apply();
        this.updateSelector();

        // Flush inmediato sin esperar debounce
        flushTranslations(true);
    },

    apply() {
        const code = this.current;

        // 1. Atributos data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = this.t(el.getAttribute('data-i18n'));
            const attr = el.getAttribute('data-i18n-attr');
            if (attr) el.setAttribute(attr, val);
            else el.textContent = val;
        });

        // 2. Links de navegación por href
        Object.entries(NAV_HREF_MAP).forEach(([href, key]) => {
            document.querySelectorAll(`a[href="${href}"]`).forEach(el => {
                let transKey = key;
                if (href === '/panel-anfitrion' && (el.classList.contains('host-nav-link') || el.textContent.includes('Pon tu espacio') || el.textContent.includes('List your space') || el.textContent.includes('Anuncie seu') || el.textContent.includes('Publiez') || el.textContent.includes('Pubblica'))) {
                    transKey = 'nav.host_cta';
                }
                const translated = this.t(transKey);
                el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.textContent = ' ' + translated;
                    }
                });
                el.querySelectorAll('span:not([data-i18n])').forEach(span => {
                    if (span.textContent.trim()) span.textContent = translated;
                });
            });
        });

        // 3. Aplicar traducciones a todos los nodos de texto y atributos
        applyAllTranslations(document.body, code);
    },

    updateSelector() {
        const l = LANGUAGES[this.current];
        document.querySelectorAll('.lang-label').forEach(el => {
            if (l) el.textContent = `${l.flag} ${this.current.toUpperCase()}`;
        });
    },

    init() {
        document.documentElement.lang = this.current;
        this.apply();
        this.updateSelector();
    }
};
window.I18n = I18n;

function applyAllTranslations(root = document.body, code = I18n.current) {
    if (!root) return;

    if (code === 'es') {
        // Restaurar originales al instante
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
            if (parent.closest('[data-no-i18n]') || parent.closest('.language-selector') || parent.closest('.lang-dropdown')) return NodeFilter.FILTER_REJECT;
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

        // Regex patterns de alta frecuencia
        let matched = false;
        let m = key.match(/Se han encontrado (\d+) hospedaje[s]? para tu estadía\./i);
        if (m) {
            const n = m[1];
            node.nodeValue = preserveSpaces(original, {
                en: `Found ${n} lodging${n === '1' ? '' : 's'} for your stay.`,
                pt: `Foram encontradas ${n} hospedagem${n === '1' ? '' : 's'} para sua estadia.`,
                fr: `${n} hébergement${n === '1' ? '' : 's'} trouvé${n === '1' ? '' : 's'} pour votre séjour.`,
                it: `${n} alloggi per il tuo soggiorno.`
            }[code]);
            matched = true;
        }
        if (!matched) {
            m = key.match(/Se han encontrado (\d+) experiencias para tu aventura\./i);
            if (m) {
                const n = m[1];
                node.nodeValue = preserveSpaces(original, {
                    en: `Found ${n} experience${n === '1' ? '' : 's'} for your adventure.`,
                    pt: `Foram encontradas ${n} experiências para sua aventura.`,
                    fr: `${n} expérience${n === '1' ? '' : 's'} trouvée${n === '1' ? '' : 's'} pour votre aventure.`,
                    it: `${n} esperienze per la tua avventura.`
                }[code]);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/Anfitrión desde (\d{4})/i);
            if (m) {
                node.nodeValue = preserveSpaces(original, {
                    en: `Host since ${m[1]}`, pt: `Anfitrião desde ${m[1]}`,
                    fr: `Hôte depuis ${m[1]}`, it: `Host dal ${m[1]}`
                }[code]);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^(\d+)\s+reseñas$/i);
            if (m) {
                const n = m[1];
                node.nodeValue = preserveSpaces(original, {
                    en: `${n} review${n === '1' ? '' : 's'}`, pt: `${n} avaliação${n === '1' ? '' : 's'}`,
                    fr: `${n} avis`, it: `${n} recension${n === '1' ? 'e' : 'i'}`
                }[code]);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^([\d.]+)\s+·\s+(\d+)\s+reseñas$/i);
            if (m) {
                const n = m[2];
                node.nodeValue = preserveSpaces(original, {
                    en: `${m[1]} · ${n} review${n === '1' ? '' : 's'}`, pt: `${m[1]} · ${n} avaliação${n === '1' ? '' : 's'}`,
                    fr: `${m[1]} · ${n} avis`, it: `${m[1]} · ${n} recension${n === '1' ? 'e' : 'i'}`
                }[code]);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^·\s+(\d+)\s+reseñas$/i);
            if (m) {
                const n = m[1];
                node.nodeValue = preserveSpaces(original, {
                    en: `· ${n} review${n === '1' ? '' : 's'}`, pt: `· ${n} avaliação${n === '1' ? '' : 's'}`,
                    fr: `· ${n} avis`, it: `· ${n} recension${n === '1' ? 'e' : 'i'}`
                }[code]);
                matched = true;
            }
        }
        if (!matched) {
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
                const unit = n === '1' ? {en:'night',pt:'noite',fr:'nuit',it:'notte'}[code] : {en:'nights',pt:'noites',fr:'nuits',it:'notti'}[code];
                node.nodeValue = preserveSpaces(original, `${transPrefix} ${n} ${unit}`);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^(Máx\.|Máximo)\s+(\d+)\s+(huésped|huéspedes|personas|persona)$/i);
            if (m) {
                const n = m[2];
                const transPrefix = { en: 'Max.', pt: 'Máx.', fr: 'Max.', it: 'Max.' }[code];
                const transGuests = {
                    en: n === '1' ? 'guest' : 'guests', pt: n === '1' ? 'hóspede' : 'hóspedes',
                    fr: n === '1' ? 'voyageur' : 'voyageurs', it: n === '1' ? 'ospite' : 'ospiti'
                }[code];
                node.nodeValue = preserveSpaces(original, `${transPrefix} ${n} ${transGuests}`);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^(\d+)\s+horas\s+·\s+(.+)$/i);
            if (m) {
                const h = m[1];
                const type = m[2].trim();
                const typeTrans = smartInstantTranslate(type, code) || type;
                const hUnit = { en: h === '1' ? 'hour' : 'hours', pt: h === '1' ? 'hora' : 'horas', fr: h === '1' ? 'heure' : 'heures', it: h === '1' ? 'ora' : 'ore' }[code];
                node.nodeValue = preserveSpaces(original, `${h} ${hUnit} · ${typeTrans}`);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^(\d+)\s+recomendaci[oó]n(es)?$/i);
            if (m) {
                const count = m[1];
                const unit = count === '1' ? { en:'recommendation', pt:'recomendação', fr:'recommandation', it:'raccomandazione' }[code] : { en:'recommendations', pt:'recomendações', fr:'recommandations', it:'raccomandazioni' }[code];
                node.nodeValue = preserveSpaces(original, `${count} ${unit}`);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^(\d+)\s+·\s+Tendencia en Huila$/i);
            if (m) {
                const rank = m[1];
                const tTrans = { en:'Trend in Huila', pt:'Tendência no Huila', fr:'Tendance au Huila', it:'Tendenza nel Huila' }[code];
                node.nodeValue = preserveSpaces(original, `${rank} · ${tTrans}`);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^\$([\d.]+)\s*COP\s+(noche|persona|por persona)$/i);
            if (m) {
                const price = m[1];
                const unit = m[2].toLowerCase();
                let unitTrans = '';
                if (unit === 'noche') unitTrans = { en: 'night', pt: 'noite', fr: 'nuit', it: 'notte' }[code];
                else unitTrans = { en: 'per person', pt: 'por pessoa', fr: 'par personne', it: 'a persona' }[code];
                node.nodeValue = preserveSpaces(original, `$${price} COP ${unitTrans}`);
                matched = true;
            }
        }
        if (!matched) {
            m = key.match(/^\$([\d.]+)\s*×\s*(\d+)\s+(persona|personas)\s*×\s*(\d+)\s+(día|días|noche|noches)$/i);
            if (m) {
                const price = m[1];
                const count1 = m[2];
                const count2 = m[4];
                const type2 = m[5].toLowerCase();
                const type1Trans = { en: count1 === '1' ? 'person' : 'people', pt: count1 === '1' ? 'pessoa' : 'pessoas', fr: count1 === '1' ? 'personne' : 'personnes', it: count1 === '1' ? 'persona' : 'persone' }[code];
                let type2Trans = '';
                if (type2.startsWith('d')) {
                    type2Trans = { en: count2 === '1' ? 'day' : 'days', pt: count2 === '1' ? 'dia' : 'dias', fr: count2 === '1' ? 'jour' : 'jours', it: count2 === '1' ? 'giorno' : 'giorni' }[code];
                } else {
                    type2Trans = { en: count2 === '1' ? 'night' : 'nights', pt: count2 === '1' ? 'noite' : 'noites', fr: count2 === '1' ? 'nuit' : 'nuits', it: count2 === '1' ? 'notte' : 'notti' }[code];
                }
                node.nodeValue = preserveSpaces(original, `$${price} × ${count1} ${type1Trans} × ${count2} ${type2Trans}`);
                matched = true;
            }
        }

        if (matched) return;

        // 4. Traductor instantáneo léxico/frases (nombres, títulos, descripciones)
        const instantTrans = smartInstantTranslate(key, code);
        if (instantTrans) {
            node.nodeValue = preserveSpaces(original, instantTrans);
            cache[key] = instantTrans;
            return;
        }

        // 5. Caché de traducciones previas
        if (cache[key]) {
            node.nodeValue = preserveSpaces(original, cache[key]);
            return;
        }

        // 6. Texto no reconocido -> poner en cola para traducción rápida en background
        queueTranslation(original);
    });

    // Traducir atributos (placeholder, title, aria-label)
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
        if (el.closest('[data-no-i18n]') || el.closest('.language-selector') || el.closest('.lang-dropdown')) return;
        ['placeholder','title','aria-label'].forEach(attr => {
            const storeAttr = `data-i18n-original-${attr}`;
            if (!el.hasAttribute(storeAttr)) el.setAttribute(storeAttr, el.getAttribute(attr) || '');
            const value = el.getAttribute(storeAttr);
            if (!value) return;
            const key = normalizedText(value);
            const attrDict = ATTR[code] || {};
            if (attrDict[key]) {
                el.setAttribute(attr, attrDict[key]);
            } else {
                const instantAttr = smartInstantTranslate(key, code);
                if (instantAttr) {
                    el.setAttribute(attr, instantAttr);
                } else if (cache[key]) {
                    el.setAttribute(attr, cache[key]);
                } else {
                    queueTranslation(value);
                }
            }
        });
    });

    // Traducir título del documento
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

    setLangCache(code, cache);
}

function queueTranslation(text) {
    const key = normalizedText(text);
    if (!key || !isTranslatable(key)) return;
    if (requestedTexts.has(key)) return;

    requestedTexts.add(key);
    pendingTexts.add(key);

    if (translateTimeout) clearTimeout(translateTimeout);
    translateTimeout = setTimeout(() => {
        flushTranslations(false);
    }, 150);
}

async function flushTranslations(immediate = false) {
    const code = I18n.current;
    if (code === 'es') {
        pendingTexts.clear();
        return;
    }
    const textsToTranslate = Array.from(pendingTexts);
    pendingTexts.clear();

    if (textsToTranslate.length === 0) return;

    const chunks = [];
    for (let i = 0; i < textsToTranslate.length; i += 40) {
        chunks.push(textsToTranslate.slice(i, i + 40));
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
                if (!response.ok) return;
                const resData = await response.json();
                if (resData.success && Array.isArray(resData.translations)) {
                    chunk.forEach((txt, idx) => {
                        const trans = resData.translations[idx];
                        if (trans) {
                            cache[txt] = trans;
                        }
                    });
                }
            } catch (err) {}
        }));

        setLangCache(code, cache);

        if (observer) observer.disconnect();
        applyAllTranslations(document.body, code);
        if (observer) observer.observe(document.body, { childList: true, subtree: true });

    } catch (e) {}
}

/* ── Hook Toast Messages ────────────────────────────────── */
const originalShowToast = window.showToast;
if (typeof originalShowToast === 'function') {
    window.showToast = function(message, type) {
        const code = I18n.current;
        if (code === 'es') return originalShowToast(message, type);
        const normKey = normalizedText(message);
        const trans = smartInstantTranslate(normKey, code);
        if (trans) return originalShowToast(trans, type);
        const cache = getLangCache(code);
        if (cache[normKey]) return originalShowToast(cache[normKey], type);
        queueTranslation(message);
        return originalShowToast(message, type);
    };
}

/* ── Observer for Dynamically Injected Nodes ────────────── */
function initObserver() {
    I18n.init();
    observer = new MutationObserver(mutations => {
        if (I18n.current === 'es') return;
        if (observer) observer.disconnect();
        
        mutations.forEach(m => m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                applyAllTranslations(node, I18n.current);
            } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                applyAllTranslations(node.parentElement, I18n.current);
            }
        }));
        
        if (observer) observer.observe(document.body, { childList: true, subtree: true });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

/* ── Build Dropdown ─────────────────────────────────────── */
function buildLangDropdown() {
    const wrappers = document.querySelectorAll('.language-selector');
    if (wrappers.length === 0) return;

    const lang = LANGUAGES[I18n.current] || LANGUAGES['es'];
    const html = `
        <button class="lang-btn" id="lang-btn" onclick="toggleLangDropdown(event)" style="
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
            <button type="button" onclick="I18n.setLang('${code}');closeLangDropdown();" style="
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
    
    document.querySelectorAll('.lang-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });

    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function closeLangDropdown() {
    document.querySelectorAll('.lang-dropdown').forEach(d => d.style.display = 'none');
    buildLangDropdown();
}

document.addEventListener('click', closeLangDropdown);

// Styles
const _s = document.createElement('style');
_s.textContent = `
    @keyframes fadeInDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    #lang-btn:hover{background:rgba(0,0,0,0.06)!important}
`;
document.head.appendChild(_s);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        buildLangDropdown();
        initObserver();
    });
} else {
    buildLangDropdown();
    initObserver();
}
