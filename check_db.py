import pymysql

DB = dict(host='localhost', user='root', password='', database='StayHuila', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

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
