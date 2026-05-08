from flask_bcrypt import generate_password_hash
import pymysql

h = generate_password_hash('admin123').decode('utf-8')
print("Hash generado:", h)
print("Longitud:", len(h))

con = pymysql.connect(host='localhost', user='root', password='', database='StayHuila')
with con.cursor() as cur:
    cur.execute("UPDATE usuarios SET password_hash=%s WHERE id IN (1,2,3)", (h,))
    print("Filas actualizadas:", cur.rowcount)
    con.commit()
    cur.execute("SELECT id,email,LEFT(password_hash,10) as prev FROM usuarios")
    for row in cur.fetchall():
        print(row)
con.close()
print("Listo!")
