import sys
import os
import sqlite3
import pytest
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.database.db import get_connection, create_tables

# Testlerde gerçek db yerine memory (RAM) veritabanı kullanmak best practice'dir.
# Anlatım/Staj uyumu için db.py'nin DB_NAME değişkenini test ortamına göre ezmeliyiz
# ama şimdilik mevcut create/fetch fonksiyonlarının exception atıp atmadığını test edelim.

def test_create_tables_runs_without_error():
    # Sadece fonksiyonun çalışıp crash olmadığını (try-except'in işlediğini) test ediyoruz.
    try:
        create_tables()
        success = True
    except Exception:
        success = False
    assert success == True

def test_get_connection():
    conn = get_connection()
    assert isinstance(conn, sqlite3.Connection)
    conn.close()
