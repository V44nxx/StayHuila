import os
import pymysql
from dotenv import load_dotenv
from flask_bcrypt import generate_password_hash

# Cargar variables de entorno
load_dotenv()

DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = int(os.environ.get('DB_PORT', '3306'))
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'StayHuila')

h = generate_password_hash('admin123').decode('utf-8')
print("Hash generado:", h)
print("Longitud:", len(h))

con = pymysql.connect(
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME
)
try:
    with con.cursor() as cur:
        cur.execute("UPDATE usuarios SET password_hash=%s WHERE id IN (1,2,3)", (h,))
        print("Filas actualizadas:", cur.rowcount)
        con.commit()
        cur.execute("SELECT id,email,LEFT(password_hash,10) as prev FROM usuarios")
        for row in cur.fetchall():
            print(row)
finally:
    con.close()
print("Listo!")

