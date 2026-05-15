-- ============================================================================
-- migrate_estados.sql — Migración de estados de publicaciones | StayHuila
-- ============================================================================
-- Ejecutar UNA SOLA VEZ en la base de datos MySQL.
-- Implementa soft-delete con columna `eliminado` (tinyint) y reemplaza
-- el estado 'reparacion' por 'deshabilitada'.
--
-- SEGURO: No elimina ningún registro ni dato histórico.
-- ============================================================================

-- ── 1. Agregar columna eliminado a hospedajes (soft delete) ──────────────────
--    eliminado = 0 → publicación existe (normal)
--    eliminado = 1 → publicación fue dada de baja lógicamente (no se borra)
ALTER TABLE hospedajes
    ADD COLUMN IF NOT EXISTS eliminado TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Soft delete: 1 = eliminada lógicamente, historial conservado';

-- ── 2. Agregar columna eliminado a experiencias ──────────────────────────────
ALTER TABLE experiencias
    ADD COLUMN IF NOT EXISTS eliminado TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Soft delete: 1 = eliminada lógicamente, historial conservado';

-- ── 3. Migrar registros con estado 'reparacion' → 'deshabilitada' ────────────
--    Preserva el significado semántico correcto del nuevo estado.
UPDATE hospedajes
    SET estado = 'deshabilitada'
    WHERE estado = 'reparacion';

UPDATE experiencias
    SET estado = 'deshabilitada'
    WHERE estado = 'reparacion';

-- ── 4. Modificar ENUM de la columna estado en hospedajes ────────────────────
--    Reemplaza 'reparacion' por 'deshabilitada' en los valores permitidos.
ALTER TABLE hospedajes
    MODIFY COLUMN estado ENUM('abierta', 'deshabilitada') NOT NULL DEFAULT 'abierta'
    COMMENT 'abierta = disponible, deshabilitada = no acepta nuevas reservas';

-- ── 5. Modificar ENUM de la columna estado en experiencias ──────────────────
ALTER TABLE experiencias
    MODIFY COLUMN estado ENUM('abierta', 'deshabilitada') NOT NULL DEFAULT 'abierta'
    COMMENT 'abierta = disponible, deshabilitada = no acepta nuevas reservas';

-- ── 6. Índices para consultas de rendimiento ────────────────────────────────
--    Mejora el performance de los filtros WHERE activo=1 AND eliminado=0
CREATE INDEX IF NOT EXISTS idx_hospedajes_activo_eliminado
    ON hospedajes (activo, eliminado);

CREATE INDEX IF NOT EXISTS idx_experiencias_activo_eliminado
    ON experiencias (activo, eliminado);

-- ── Verificar resultado ──────────────────────────────────────────────────────
SELECT 'hospedajes' as tabla, estado, eliminado, COUNT(*) as total
    FROM hospedajes GROUP BY estado, eliminado
UNION ALL
SELECT 'experiencias', estado, eliminado, COUNT(*)
    FROM experiencias GROUP BY estado, eliminado;
