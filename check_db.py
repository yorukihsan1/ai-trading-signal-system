import sqlite3

conn = sqlite3.connect("trading.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM analysis")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()