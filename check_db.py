import os
import pymysql
from dotenv import load_dotenv
load_dotenv()

DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = int(os.environ.get('DB_PORT', '3306'))
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'StayHuila')

DB = dict(
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

c = pymysql.connect(**DB)
try:
    with c.cursor() as cur:
        cur.execute("DESCRIBE hospedajes")
        print("HOSPEDAJES:")
        for r in cur.fetchall():
            print(f"  {r['Field']}: {r['Type']}")
        
        cur.execute("DESCRIBE experiencias")
        print("\nEXPERIENCIAS:")
        for r in cur.fetchall():
            print(f"  {r['Field']}: {r['Type']}")
finally:
    c.close()
