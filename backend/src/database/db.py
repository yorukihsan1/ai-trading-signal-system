import sqlite3

DB_NAME = "trading.db"

def get_connection():
    return sqlite3.connect(DB_NAME)

def create_tables():
    """Tabloları ilklendirir."""
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
        
        # Avatar sütunu var mı kontrol et (migration)
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
        print(f"DB Hatası: {e}")
    finally:
        conn.close()

def create_user(username, email, hashed, role="user"):
    conn = get_connection()
    try:
        conn.execute("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", (username, email, hashed, role))
        conn.commit()
        return True
    except: return False
    finally: conn.close()

def get_user_by_username(username):
    conn = get_connection()
    try:
        return conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    except: return None
    finally: conn.close()

def save_analysis(u_id, p_id, s_id, conf, entry=None, target=None, stop=None, risk=None):
    conn = get_connection()
    try:
        conn.execute("""
            INSERT INTO analysis (user_id, pattern_id, signal_id, confidence, entry_price, target_price, stop_loss, risk_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (u_id, p_id, s_id, conf, entry, target, stop, risk))
        conn.commit()
    except Exception as e:
        print(f"Save Error: {e}")
    finally: conn.close()

def get_user_analysis(u_id):
    """Kullanıcıya özel analiz geçmişini döner."""
    conn = get_connection()
    try:
        return conn.execute("SELECT * FROM analysis WHERE user_id = ? ORDER BY id DESC", (u_id,)).fetchall()
    except: return []
    finally: conn.close()

def add_ticker_favorite(u_id, symbol):
    conn = get_connection()
    try:
        conn.execute("INSERT OR IGNORE INTO user_favorites (user_id, symbol) VALUES (?, ?)", (u_id, symbol.upper()))
        conn.commit()
        return True
    except: return False
    finally: conn.close()

def remove_ticker_favorite(u_id, symbol):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM user_favorites WHERE user_id = ? AND symbol = ?", (u_id, symbol.upper()))
        conn.commit()
        return True
    except: return False
    finally: conn.close()

def get_user_ticker_favorites(u_id):
    conn = get_connection()
    try:
        rows = conn.execute("SELECT symbol FROM user_favorites WHERE user_id = ? ORDER BY id DESC", (u_id,)).fetchall()
        return [r[0] for r in rows]
    except: return []
    finally: conn.close()

def get_user_by_id(u_id):
    conn = get_connection()
    try:
        row = conn.execute("SELECT id, username, email, role, avatar FROM users WHERE id = ?", (u_id,)).fetchone()
        return {"id": row[0], "username": row[1], "email": row[2], "role": row[3], "avatar": row[4]} if row else None
    except: return None
    finally: conn.close()

def update_user_profile(u_id, email, avatar):
    conn = get_connection()
    try:
        conn.execute("UPDATE users SET email = ?, avatar = ? WHERE id = ?", (email, avatar, u_id))
        conn.commit()
        return True
    except: return False
    finally: conn.close()

def update_user_password(u_id, hashed):
    conn = get_connection()
    try:
        conn.execute("UPDATE users SET password = ? WHERE id = ?", (hashed, u_id))
        conn.commit()
        return True
    except: return False
    finally: conn.close()