import pymysql

def run_migration():
    conn = pymysql.connect(host='localhost', user='root', password='', db='StayHuila', charset='utf8mb4')
    cur = conn.cursor()
    
    print("Iniciando migración de estados de reservas...")
    
    steps = [
        # 1. Ampliar temporalmente el ENUM para permitir todos los valores viejos y nuevos
        ("ALTER TABLE reservas MODIFY COLUMN estado ENUM('pendiente', 'confirmada', 'checkin', 'checkout', 'cancelada', 'completada', 'pendiente_pago', 'check_in') DEFAULT 'pendiente_pago'",
         "Ampliación de ENUM en reservas.estado"),
        
        # 2. Migrar registros existentes a la nueva nomenclatura
        ("UPDATE reservas SET estado = 'pendiente_pago' WHERE estado = 'pendiente'",
         "Migración de 'pendiente' a 'pendiente_pago'"),
        
        ("UPDATE reservas SET estado = 'check_in' WHERE estado = 'checkin'",
         "Migración de 'checkin' a 'check_in'"),
        
        ("UPDATE reservas SET estado = 'completada' WHERE estado = 'checkout'",
         "Migración de 'checkout' a 'completada'"),
        
        # 3. Restringir el ENUM a los 5 estados definitivos solicitados por el usuario
        ("ALTER TABLE reservas MODIFY COLUMN estado ENUM('pendiente_pago', 'confirmada', 'check_in', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente_pago'",
         "Restricción de ENUM en reservas.estado a nuevos estados oficiales"),
    ]
    
    try:
        for sql, label in steps:
            try:
                cur.execute(sql)
                print(f"OK: {label} (filas afectadas: {cur.rowcount})")
            except Exception as e:
                print(f"ERROR en {label}: {e}")
                raise e
        conn.commit()
        print("MIGRACIÓN DE RESERVAS FINALIZADA CON ÉXITO")
    except Exception as e:
        conn.rollback()
        print(f"MIGRACIÓN FALLIDA: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
