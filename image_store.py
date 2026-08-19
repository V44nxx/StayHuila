"""
image_store.py — Sistema de Persistencia Definitiva de Imágenes en Base de Datos
StayHuila | Garantiza que las imágenes subidas nunca se pierdan tras commits o despliegues Docker.
"""

import os
import base64
import logging

logger = logging.getLogger('StayHuila.ImageStore')

def get_db_connection():
    """Obtiene una conexión a la base de datos MySQL usando variables de entorno de StayHuila."""
    import pymysql
    return pymysql.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', '3306')),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'StayHuila'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def ensure_store_table(cur=None):
    """Crea la tabla almacen_imagenes en MySQL si no existe."""
    sql = """
        CREATE TABLE IF NOT EXISTS almacen_imagenes (
            filename VARCHAR(255) PRIMARY KEY,
            contenido_base64 LONGTEXT NOT NULL,
            mime_type VARCHAR(50) DEFAULT 'image/webp',
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    if cur:
        cur.execute(sql)
    else:
        try:
            c = get_db_connection()
            try:
                with c.cursor() as cursor:
                    cursor.execute(sql)
                    c.commit()
            finally:
                c.close()
        except Exception as e:
            logger.warning(f"No se pudo asegurar tabla almacen_imagenes: {e}")

def guardar_imagen_bd(filename: str, file_path: str, mime_type: str = None) -> bool:
    """
    Guarda una copia binaria base64 de la imagen en MySQL.
    Si el contenedor de Docker se reinicia o se reconstruye tras un commit,
    la imagen se regenerará automáticamente desde MySQL.
    """
    if not filename or not file_path or not os.path.isfile(file_path):
        return False

    safe_name = os.path.basename(filename)

    if not mime_type:
        ext = safe_name.rsplit('.', 1)[-1].lower() if '.' in safe_name else 'webp'
        mime_type = f"image/{ext}" if ext != 'jpg' else 'image/jpeg'

    try:
        with open(file_path, 'rb') as f:
            raw_bytes = f.read()

        if not raw_bytes:
            return False

        b64_content = base64.b64encode(raw_bytes).decode('utf-8')

        c = get_db_connection()
        try:
            with c.cursor() as cur:
                ensure_store_table(cur)
                cur.execute("""
                    INSERT INTO almacen_imagenes (filename, contenido_base64, mime_type, fecha_creacion)
                    VALUES (%s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE contenido_base64=%s, mime_type=%s, fecha_creacion=NOW();
                """, (safe_name, b64_content, mime_type, b64_content, mime_type))
                c.commit()
            logger.info(f"Imagen '{safe_name}' respaldada con éxito en BD MySQL ({len(raw_bytes)} bytes).")
            return True
        finally:
            c.close()
    except Exception as e:
        logger.error(f"Error guardando imagen '{safe_name}' en BD: {e}")
        return False

def restaurar_imagen_bd(filename: str, upload_dir: str) -> bool:
    """
    Restaura una imagen faltante en disco leyéndola desde la base de datos MySQL.
    Escribe el archivo a disco y retorna True si tuvo éxito.
    """
    if not filename or not upload_dir:
        return False

    safe_name = os.path.basename(filename)
    target_path = os.path.join(upload_dir, safe_name)

    try:
        c = get_db_connection()
        try:
            with c.cursor() as cur:
                ensure_store_table(cur)
                cur.execute("SELECT contenido_base64 FROM almacen_imagenes WHERE filename = %s", (safe_name,))
                row = cur.fetchone()
                if row and row.get('contenido_base64'):
                    raw_bytes = base64.b64decode(row['contenido_base64'])
                    os.makedirs(upload_dir, exist_ok=True)
                    with open(target_path, 'wb') as f:
                        f.write(raw_bytes)
                    logger.info(f"Imagen '{safe_name}' restaurada exitosamente desde BD a disco.")
                    return True
        finally:
            c.close()
    except Exception as e:
        logger.error(f"Error restaurando imagen '{safe_name}' desde BD: {e}")

    return False

def restaurar_todas_imagenes_bd(upload_dir: str):
    """
    Al iniciar la aplicación, restaura todas las imágenes almacenadas en BD
    hacia la carpeta static/uploads/ si no están en disco.
    """
    try:
        c = get_db_connection()
        try:
            with c.cursor() as cur:
                ensure_store_table(cur)
                cur.execute("SELECT filename, contenido_base64 FROM almacen_imagenes")
                rows = cur.fetchall()
                os.makedirs(upload_dir, exist_ok=True)
                restauradas = 0
                for row in rows:
                    fname = row.get('filename')
                    b64 = row.get('contenido_base64')
                    if fname and b64:
                        dest = os.path.join(upload_dir, os.path.basename(fname))
                        if not os.path.isfile(dest):
                            try:
                                with open(dest, 'wb') as f:
                                    f.write(base64.b64decode(b64))
                                restauradas += 1
                            except Exception:
                                pass
                if restauradas > 0:
                    logger.info(f"Se restauraron {restauradas} imágenes desde MySQL a disco.")
        finally:
            c.close()
    except Exception as e:
        logger.warning(f"Error al sincronizar imágenes de BD al inicio: {e}")
