import pymysql, sys

conn = pymysql.connect(host='localhost', user='root', password='', db='stayhuila', charset='utf8mb4')
cur = conn.cursor()

steps = [
    # 1. Columna eliminado en hospedajes
    ("ALTER TABLE hospedajes ADD COLUMN eliminado TINYINT(1) NOT NULL DEFAULT 0",
     "hospedajes.eliminado agregado"),
    # 2. Columna eliminado en experiencias
    ("ALTER TABLE experiencias ADD COLUMN eliminado TINYINT(1) NOT NULL DEFAULT 0",
     "experiencias.eliminado agregado"),
    # 3. Migrar estado reparacion -> deshabilitada
    ("UPDATE hospedajes SET estado='deshabilitada' WHERE estado='reparacion'",
     "hospedajes: reparacion->deshabilitada"),
    ("UPDATE experiencias SET estado='deshabilitada' WHERE estado='reparacion'",
     "experiencias: reparacion->deshabilitada"),
    # 4. Actualizar ENUM hospedajes
    ("ALTER TABLE hospedajes MODIFY COLUMN estado ENUM('abierta','deshabilitada') NOT NULL DEFAULT 'abierta'",
     "hospedajes.estado ENUM actualizado"),
    # 5. Actualizar ENUM experiencias
    ("ALTER TABLE experiencias MODIFY COLUMN estado ENUM('abierta','deshabilitada') NOT NULL DEFAULT 'abierta'",
     "experiencias.estado ENUM actualizado"),
]

try:
    for sql, label in steps:
        try:
            cur.execute(sql)
            print(f"OK: {label} (rows: {cur.rowcount})")
        except Exception as e:
            print(f"INFO {label}: {e}")
    conn.commit()
    print("MIGRACION COMPLETA")
except Exception as e:
    conn.rollback()
    print(f"ERROR GENERAL: {e}")
finally:
    cur.close()
    conn.close()
