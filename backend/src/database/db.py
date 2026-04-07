import sqlite3

DB_NAME = "trading.db"

def get_connection():
    return sqlite3.connect(DB_NAME)

def create_tables():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            email TEXT,
            password TEXT,
            role TEXT,
            avatar TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Schema migration: handles existing databases without avatar column
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT 'user'")
        except:
            pass

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

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            symbol TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, symbol),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """)

        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Database table creation failed: {e}")
    finally:
        conn.close()

def create_user(username, email, hashed_password, role="user"):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO users (username, email, password, role, avatar)
        VALUES (?, ?, ?, ?, ?)
        """, (username, email, hashed_password, role, 'user'))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()

def get_user_by_username(username):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        return cursor.fetchone()
    except sqlite3.Error:
        return None
    finally:
        conn.close()

def save_analysis(user_id, pattern_id, signal_id, confidence, entry_price=None, target_price=None, stop_loss=None, risk_level=None):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO analysis (user_id, pattern_id, signal_id, confidence, entry_price, target_price, stop_loss, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, pattern_id, signal_id, confidence, entry_price, target_price, stop_loss, risk_level))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Failed to save analysis: {e}")
    finally:
        conn.close()

def get_all_analysis(user_id=None):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("SELECT * FROM analysis WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("SELECT * FROM analysis")
        return cursor.fetchall()
    except sqlite3.Error:
        return []
    finally:
        conn.close()

def add_ticker_favorite(user_id, symbol):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT OR IGNORE INTO user_favorites (user_id, symbol) VALUES (?, ?)", (user_id, symbol.upper()))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()

def remove_ticker_favorite(user_id, symbol):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_favorites WHERE user_id = ? AND symbol = ?", (user_id, symbol.upper()))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()

def get_user_ticker_favorites(user_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT symbol FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        return [row[0] for row in rows]
    except sqlite3.Error:
        return []
    finally:
        conn.close()

def get_user_by_id(user_id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, role, avatar FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return {"id": row[0], "username": row[1], "email": row[2], "role": row[3], "avatar": row[4]}
        return None
    except sqlite3.Error:
        return None
    finally:
        conn.close()

def update_user_profile(user_id, email, avatar):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET email = ?, avatar = ? WHERE id = ?", (email, avatar, user_id))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()

def update_user_password(user_id, hashed_password):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()