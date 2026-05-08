-- ============================================================
-- StayHuila - Base de Datos Completa
-- Motor: MySQL 8.0 (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS StayHuila CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE StayHuila;

-- ============================================================
-- TABLA: usuarios
-- Almacena tanto huéspedes como anfitriones
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(500) DEFAULT NULL,
    tipo ENUM('huesped','anfitrion','admin') DEFAULT 'huesped',
    puntos_gamificacion INT DEFAULT 0,
    verificado TINYINT(1) DEFAULT 0,
    token_verificacion VARCHAR(100) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    idiomas VARCHAR(200) DEFAULT 'Español',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: anfitriones (extensión de usuarios con rol anfitrion)
-- ============================================================
CREATE TABLE IF NOT EXISTS anfitriones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    nombre_negocio VARCHAR(200) DEFAULT NULL,
    descripcion_negocio TEXT DEFAULT NULL,
    documento_identidad VARCHAR(50) DEFAULT NULL,
    rut VARCHAR(50) DEFAULT NULL,
    cuenta_bancaria VARCHAR(100) DEFAULT NULL,
    banco VARCHAR(100) DEFAULT NULL,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    super_anfitrion TINYINT(1) DEFAULT 0,
    fecha_verificacion DATE DEFAULT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: categorias
-- Tipos de hospedaje/experiencia
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    icono VARCHAR(50) DEFAULT 'ph-house',
    tipo ENUM('hospedaje','experiencia','ambos') DEFAULT 'ambos',
    descripcion TEXT DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: hospedajes
-- ============================================================
CREATE TABLE IF NOT EXISTS hospedajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anfitrion_id INT NOT NULL,
    categoria_id INT DEFAULT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('Cabaña','Finca','Glamping','Lodge','Casa','Habitación','Apartamento','Hostal') NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_corta VARCHAR(300) DEFAULT NULL,
    municipio VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) DEFAULT 'Huila',
    direccion_detalle VARCHAR(300) DEFAULT NULL,
    latitud DECIMAL(10,7) DEFAULT NULL,
    longitud DECIMAL(10,7) DEFAULT NULL,
    precio_noche DECIMAL(12,2) NOT NULL,
    precio_fin_semana DECIMAL(12,2) DEFAULT NULL,
    precio_semana DECIMAL(12,2) DEFAULT NULL,
    capacidad_max INT NOT NULL DEFAULT 2,
    num_habitaciones INT DEFAULT 1,
    num_banos INT DEFAULT 1,
    calificacion DECIMAL(3,2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    total_reservas INT DEFAULT 0,
    es_eco TINYINT(1) DEFAULT 0,
    activo TINYINT(1) DEFAULT 1,
    verificado TINYINT(1) DEFAULT 0,
    destacado TINYINT(1) DEFAULT 0,
    descuento_porcentaje INT DEFAULT 0,
    politica_cancelacion ENUM('flexible','moderada','estricta') DEFAULT 'moderada',
    hora_checkin TIME DEFAULT '15:00:00',
    hora_checkout TIME DEFAULT '11:00:00',
    instrucciones_llegada TEXT DEFAULT NULL,
    wifi_nombre VARCHAR(100) DEFAULT NULL,
    wifi_password VARCHAR(100) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anfitrion_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: hospedaje_imagenes
-- ============================================================
CREATE TABLE IF NOT EXISTS hospedaje_imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospedaje_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    descripcion VARCHAR(200) DEFAULT NULL,
    es_portada TINYINT(1) DEFAULT 0,
    orden INT DEFAULT 0,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: hospedaje_servicios (amenities)
-- ============================================================
CREATE TABLE IF NOT EXISTS hospedaje_servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospedaje_id INT NOT NULL,
    servicio ENUM(
        'wifi','piscina','estacionamiento','cocina','aire_acondicionado',
        'calefaccion','tv','lavadora','terraza','barbacoa','gym',
        'desayuno_incluido','mascotas','no_fumar','acceso_discapacitados',
        'caja_fuerte','toallas','kit_bienvenida','telescopio','kayak',
        'caballos','senderismo','tours_cafe','termales','jacuzzi'
    ) NOT NULL,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: hospedaje_disponibilidad
-- Bloqueos de calendario
-- ============================================================
CREATE TABLE IF NOT EXISTS hospedaje_disponibilidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospedaje_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo ENUM('reservado','bloqueado_anfitrion','mantenimiento') DEFAULT 'reservado',
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: experiencias
-- ============================================================
CREATE TABLE IF NOT EXISTS experiencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anfitrion_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('Aventura','Cultural','Gastronomía','Naturaleza','Deportes','Bienestar','Arte','Noche') NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_corta VARCHAR(300) DEFAULT NULL,
    municipio VARCHAR(100) NOT NULL,
    latitud DECIMAL(10,7) DEFAULT NULL,
    longitud DECIMAL(10,7) DEFAULT NULL,
    precio_persona DECIMAL(10,2) NOT NULL,
    duracion_horas DECIMAL(4,1) DEFAULT 2.0,
    capacidad_min INT DEFAULT 1,
    capacidad_max INT DEFAULT 10,
    idioma_ofrecido VARCHAR(100) DEFAULT 'Español',
    que_incluye TEXT DEFAULT NULL,
    que_traer TEXT DEFAULT NULL,
    nivel_dificultad ENUM('facil','moderado','dificil') DEFAULT 'facil',
    calificacion DECIMAL(3,2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    activo TINYINT(1) DEFAULT 1,
    verificado TINYINT(1) DEFAULT 0,
    destacado TINYINT(1) DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anfitrion_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: experiencia_imagenes
-- ============================================================
CREATE TABLE IF NOT EXISTS experiencia_imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiencia_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    es_portada TINYINT(1) DEFAULT 0,
    orden INT DEFAULT 0,
    FOREIGN KEY (experiencia_id) REFERENCES experiencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: experiencia_horarios
-- ============================================================
CREATE TABLE IF NOT EXISTS experiencia_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiencia_id INT NOT NULL,
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    FOREIGN KEY (experiencia_id) REFERENCES experiencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: reservas
-- Unifica reservas de hospedaje y experiencia
-- ============================================================
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
    usuario_id INT NOT NULL,
    tipo ENUM('hospedaje','experiencia') NOT NULL,
    hospedaje_id INT DEFAULT NULL,
    experiencia_id INT DEFAULT NULL,
    fecha_checkin DATE DEFAULT NULL,
    fecha_checkout DATE DEFAULT NULL,
    fecha_experiencia DATETIME DEFAULT NULL,
    num_huespedes INT NOT NULL DEFAULT 1,
    precio_base DECIMAL(12,2) NOT NULL,
    tarifa_servicio DECIMAL(12,2) DEFAULT 0.00,
    impuestos DECIMAL(12,2) DEFAULT 0.00,
    descuento DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    estado ENUM('pendiente','confirmada','checkin','checkout','cancelada','completada') DEFAULT 'pendiente',
    metodo_pago ENUM('tarjeta','nequi','daviplata','efectivo','transferencia') DEFAULT 'tarjeta',
    estado_pago ENUM('pendiente','procesando','pagado','fallido','reembolsado') DEFAULT 'pendiente',
    referencia_pago VARCHAR(100) DEFAULT NULL,
    notas_huesped TEXT DEFAULT NULL,
    notas_anfitrion TEXT DEFAULT NULL,
    fecha_checkin_real DATETIME DEFAULT NULL,
    fecha_checkout_real DATETIME DEFAULT NULL,
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion DATETIME DEFAULT NULL,
    fecha_cancelacion DATETIME DEFAULT NULL,
    motivo_cancelacion TEXT DEFAULT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE SET NULL,
    FOREIGN KEY (experiencia_id) REFERENCES experiencias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: resenas
-- ============================================================
CREATE TABLE IF NOT EXISTS resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reserva_id INT NOT NULL UNIQUE,
    usuario_id INT NOT NULL,
    tipo ENUM('hospedaje','experiencia') NOT NULL,
    hospedaje_id INT DEFAULT NULL,
    experiencia_id INT DEFAULT NULL,
    calificacion_general DECIMAL(2,1) NOT NULL,
    calificacion_limpieza DECIMAL(2,1) DEFAULT NULL,
    calificacion_ubicacion DECIMAL(2,1) DEFAULT NULL,
    calificacion_comunicacion DECIMAL(2,1) DEFAULT NULL,
    calificacion_valor DECIMAL(2,1) DEFAULT NULL,
    comentario TEXT DEFAULT NULL,
    respuesta_anfitrion TEXT DEFAULT NULL,
    fecha_resena DATETIME DEFAULT CURRENT_TIMESTAMP,
    publicada TINYINT(1) DEFAULT 1,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE SET NULL,
    FOREIGN KEY (experiencia_id) REFERENCES experiencias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: favoritos
-- ============================================================
CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('hospedaje','experiencia') NOT NULL,
    hospedaje_id INT DEFAULT NULL,
    experiencia_id INT DEFAULT NULL,
    fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_fav_hosp (usuario_id, hospedaje_id),
    UNIQUE KEY unique_fav_exp (usuario_id, experiencia_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE CASCADE,
    FOREIGN KEY (experiencia_id) REFERENCES experiencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: mensajes
-- Chat entre huésped y anfitrión
-- ============================================================
CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reserva_id INT DEFAULT NULL,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    leido TINYINT(1) DEFAULT 0,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: notificaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida TINYINT(1) DEFAULT 0,
    url_accion VARCHAR(300) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: pagos
-- Historial de transacciones
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reserva_id INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    tipo ENUM('cobro','reembolso') DEFAULT 'cobro',
    metodo ENUM('tarjeta','nequi','daviplata','efectivo','transferencia') NOT NULL,
    referencia_externa VARCHAR(200) DEFAULT NULL,
    datos_tarjeta JSON DEFAULT NULL,
    estado ENUM('pendiente','aprobado','rechazado','reembolsado') DEFAULT 'pendiente',
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

-- Categorías
INSERT INTO categorias (nombre, icono, tipo) VALUES
('Fincas Cafeteras', 'ph-coffee', 'hospedaje'),
('Sostenible & Eco', 'ph-leaf', 'hospedaje'),
('Desierto Tatacoa', 'ph-cactus', 'hospedaje'),
('Romántico', 'ph-heart', 'hospedaje'),
('Aventura', 'ph-person-simple-walk', 'experiencia'),
('Descanso Profundo', 'ph-bed', 'hospedaje'),
('Gastronomía', 'ph-fork-knife', 'experiencia'),
('Tours Culturales', 'ph-map-pin', 'experiencia');

-- Usuario anfitrión de prueba (password: admin123)
INSERT INTO usuarios (nombre, apellido, email, password_hash, tipo, verificado, puntos_gamificacion) VALUES
('Carlos', 'Andrade', 'carlos@stayhuila.com', 'pbkdf2:sha256:600000$abc$def', 'anfitrion', 1, 1250),
('María', 'González', 'maria@stayhuila.com', 'pbkdf2:sha256:600000$abc$def', 'anfitrion', 1, 890),
('Admin', 'StayHuila', 'admin@stayhuila.com', 'pbkdf2:sha256:600000$abc$def', 'admin', 1, 0);

-- Anfitriones
INSERT INTO anfitriones (usuario_id, nombre_negocio, super_anfitrion, calificacion_promedio) VALUES
(1, 'Fincas Huila Premium', 1, 4.97),
(2, 'Glamping Tatacoa', 0, 4.88);

-- Hospedajes de prueba
INSERT INTO hospedajes (anfitrion_id, categoria_id, nombre, tipo, descripcion, descripcion_corta, municipio, latitud, longitud, precio_noche, capacidad_max, num_habitaciones, num_banos, calificacion, total_resenas, es_eco, activo, verificado, destacado, descuento_porcentaje) VALUES
(1, 1, 'Cabaña en las Nubes', 'Cabaña', 'Espectacular cabaña ubicada entre las montañas de San Agustín con vista panorámica al valle arqueológico. Ideal para parejas o familias pequeñas.', 'Vista a la montaña • A 2km del parque arqueológico', 'San Agustín', 1.8833, -76.2667, 180000, 4, 2, 1, 4.98, 124, 0, 1, 1, 1, 15),
(1, 3, 'Glamping bajo las Estrellas', 'Glamping', 'Experiencia única de glamping en el corazón del Desierto de la Tatacoa. Disfruta del cielo más estrellado de Colombia con telescopio incluido.', 'Aire acondicionado • Telescopio • Desayuno', 'Villavieja', 3.2322, -75.1436, 220000, 2, 1, 1, 4.95, 89, 0, 1, 1, 1, 0),
(1, 2, 'Finca Cafetera Tradicional', 'Finca', 'Auténtica finca cafetera en Pitalito con tour de café incluido. Desayuno típico huilense preparado con productos de la finca.', 'Tour de café • Desayuno típico • Piscina', 'Pitalito', 1.8537, -76.0506, 150000, 8, 4, 2, 4.89, 201, 1, 1, 1, 0, 0),
(2, 6, 'Refugio frente al Río', 'Cabaña', 'Cabaña con acceso privado al Embalse de Betania. Kayak incluido. El lugar perfecto para conectar con la naturaleza.', 'Acceso al embalse • Kayak • Pesca', 'Yaguará', 2.6667, -75.3167, 250000, 6, 3, 2, 5.00, 42, 0, 1, 1, 0, 0),
(2, 2, 'Eco-Lodge La Cascada', 'Lodge', 'Eco-lodge de lujo con termales privados y servicio de masajes. Construido con materiales sostenibles, rodeado de naturaleza.', 'Termales privados • Masajes • Todo sostenible', 'Rivera', 2.7778, -75.2556, 300000, 4, 2, 2, 4.92, 56, 1, 1, 1, 1, 0),
(1, 4, 'Casa Colonial Centro Histórico', 'Casa', 'Preciosa casa colonial restaurada en el centro histórico de Garzón. Arquitectura del siglo XIX con todas las comodidades modernas.', 'Arquitectura colonial • Cerca a la plaza', 'Garzón', 2.1950, -75.6278, 120000, 6, 3, 2, 4.75, 18, 0, 1, 1, 0, 10);

-- Imágenes de hospedajes
INSERT INTO hospedaje_imagenes (hospedaje_id, url, es_portada, orden) VALUES
(1, 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?auto=format&fit=crop&q=80&w=800', 1, 0),
(1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800', 0, 1),
(2, 'https://images.unsplash.com/photo-1542315132-ce2bf3e5302f?auto=format&fit=crop&q=80&w=800', 1, 0),
(2, 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&q=80&w=800', 0, 1),
(3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', 1, 0),
(4, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800', 1, 0),
(5, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=800', 1, 0),
(6, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800', 1, 0);

-- Servicios de hospedajes
INSERT INTO hospedaje_servicios (hospedaje_id, servicio) VALUES
(1, 'wifi'), (1, 'cocina'), (1, 'terraza'), (1, 'senderismo'),
(2, 'aire_acondicionado'), (2, 'desayuno_incluido'), (2, 'telescopio'),
(3, 'wifi'), (3, 'cocina'), (3, 'desayuno_incluido'), (3, 'tours_cafe'), (3, 'piscina'),
(4, 'wifi'), (4, 'kayak'), (4, 'barbacoa'), (4, 'estacionamiento'),
(5, 'wifi'), (5, 'termales'), (5, 'masajes'), (5, 'jacuzzi'), (5, 'desayuno_incluido'),
(6, 'wifi'), (6, 'cocina'), (6, 'estacionamiento'), (6, 'tv');

-- Experiencias de prueba
INSERT INTO experiencias (anfitrion_id, nombre, tipo, descripcion, descripcion_corta, municipio, latitud, longitud, precio_persona, duracion_horas, capacidad_max, nivel_dificultad, calificacion, total_resenas, activo, verificado, destacado) VALUES
(1, 'Ruta del Café en Pitalito', 'Cultural', 'Recorre los cafetales, aprende el proceso del café de origen y degusta las mejores variedades huilenses con un experto caficultor.', 'Tour completo de café • Cata incluida', 'Pitalito', 1.8537, -76.0506, 85000, 4.0, 12, 'facil', 4.97, 87, 1, 1, 1),
(1, 'Observación Astronómica Tatacoa', 'Naturaleza', 'El cielo más estrellado de Colombia te espera. Telescopio profesional, guía astrofísico y chocolate caliente bajo el universo.', 'Telescopio profesional • Guía experto', 'Villavieja', 3.2322, -75.1436, 95000, 3.0, 8, 'facil', 5.00, 43, 1, 1, 1),
(2, 'Rafting en el Río Magdalena', 'Aventura', 'Adrenalina pura en los raudales del río más importante de Colombia. Equipo certificado y guías expertos en kayak y rafting.', 'Equipo incluido • Guías certificados', 'Neiva', 2.9273, -75.2819, 120000, 5.0, 10, 'moderado', 4.85, 62, 1, 1, 0),
(2, 'Cocina Huilense Auténtica', 'Gastronomía', 'Aprende a preparar asado huilense, bizcochos de achira y el famoso insulso con una familia local en su hogar tradicional.', 'Con familia local • Comida incluida', 'Neiva', 2.9273, -75.2819, 75000, 3.0, 6, 'facil', 4.90, 34, 1, 1, 0);

-- Imágenes de experiencias
INSERT INTO experiencia_imagenes (experiencia_id, url, es_portada) VALUES
(1, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', 1),
(2, 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&q=80&w=800', 1),
(3, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800', 1),
(4, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800', 1);
