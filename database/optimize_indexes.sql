-- optimize_indexes.sql
-- Índices de rendimiento para StayHuila
-- ======================================================
-- Ejecutar en el servidor MySQL una sola vez:
--   mysql -u root -p StayHuila < optimize_indexes.sql
--
-- Son idempotentes: IF NOT EXISTS evita errores si ya existen.
-- InnoDB crea índices sin bloquear lecturas (ONLINE DDL).
-- ======================================================

USE StayHuila;

-- Hospedajes: filtro activo+eliminado+estado+verificado (home y listados)
CREATE INDEX IF NOT EXISTS idx_hosp_activo_estado
    ON hospedajes (activo, eliminado, estado, verificado);

-- Portada de hospedaje (JOIN en listados)
CREATE INDEX IF NOT EXISTS idx_hosp_img_portada
    ON hospedaje_imagenes (hospedaje_id, es_portada);

-- Experiencias: filtro activo+eliminado+estado+verificado
CREATE INDEX IF NOT EXISTS idx_exp_activo_estado
    ON experiencias (activo, eliminado, estado, verificado);

-- Portada de experiencia (JOIN en listados)
CREATE INDEX IF NOT EXISTS idx_exp_img_portada
    ON experiencia_imagenes (experiencia_id, es_portada);

-- Reseñas de hospedajes (COUNT + AVG en subquery)
CREATE INDEX IF NOT EXISTS idx_resenas_hosp
    ON resenas (hospedaje_id, tipo, publicada);

-- Reseñas de experiencias (COUNT + AVG en subquery)
CREATE INDEX IF NOT EXISTS idx_resenas_exp
    ON resenas (experiencia_id, tipo, publicada);

-- Disponibilidad: filtro por fechas en listado de hospedajes
CREATE INDEX IF NOT EXISTS idx_reservas_fechas
    ON reservas (estado, fecha_checkin, fecha_checkout, hospedaje_id);

-- Favoritos por usuario (home, favoritos page)
CREATE INDEX IF NOT EXISTS idx_favs_usuario
    ON favoritos (usuario_id, tipo);

-- Verificar todos los índices creados
SHOW INDEX FROM hospedajes WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM hospedaje_imagenes WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM experiencias WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM experiencia_imagenes WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM resenas WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM reservas WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM favoritos WHERE Key_name LIKE 'idx_%';
