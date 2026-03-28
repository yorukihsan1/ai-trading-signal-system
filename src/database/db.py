import sqlite3

DB_NAME = "trading.db"

def get_connection():
    return sqlite3.connect(DB_NAME)


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT,
        password TEXT,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        pattern_id INTEGER,
        signal_id INTEGER,
        confidence REAL,
        entry_price REAL,
        target_price REAL,
        stop_loss REAL,
        risk_level TEXT,
        analysis_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

def save_analysis(user_id, pattern_id, signal_id, confidence):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO analysis (user_id, pattern_id, signal_id, confidence)
    VALUES (?, ?, ?, ?)
    """, (user_id, pattern_id, signal_id, confidence))

    conn.commit()
    conn.close()

def get_all_analysis():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM analysis")
    rows = cursor.fetchall()

    conn.close()
    return rows