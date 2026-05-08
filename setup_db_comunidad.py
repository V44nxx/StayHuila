import pymysql

DB = dict(host='localhost', user='root', password='', database='StayHuila', charset='utf8mb4')

def setup_community_tables():
    c = pymysql.connect(**DB)
    try:
        with c.cursor() as cur:
            # Crear tabla posts
            cur.execute("""
            CREATE TABLE IF NOT EXISTS comunidad_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                contenido TEXT NOT NULL,
                imagen_url VARCHAR(255),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                likes_count INT DEFAULT 0,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            # Crear tabla comentarios
            cur.execute("""
            CREATE TABLE IF NOT EXISTS comunidad_comentarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                usuario_id INT NOT NULL,
                contenido TEXT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES comunidad_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            # Crear tabla likes para evitar duplicados
            cur.execute("""
            CREATE TABLE IF NOT EXISTS comunidad_likes (
                post_id INT NOT NULL,
                usuario_id INT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (post_id, usuario_id),
                FOREIGN KEY (post_id) REFERENCES comunidad_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
        c.commit()
        print("Tablas de comunidad creadas correctamente.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        c.close()

if __name__ == '__main__':
    setup_community_tables()
