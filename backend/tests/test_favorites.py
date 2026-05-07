import pytest
from fastapi.testclient import TestClient
from main import api
from src.database.db import create_tables, get_connection

client = TestClient(api)

@pytest.fixture(autouse=True)
def setup_db():
    create_tables()
    # Temiz bir veritabanı için ilgili tabloları temizle
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_favorites")
    cursor.execute("DELETE FROM users")
    conn.commit()
    conn.close()
    yield

def get_auth_token():
    client.post("/api/auth/register", json={
        "username": "favuser",
        "email": "fav@example.com",
        "password": "password123"
    })
    res = client.post("/api/auth/login", json={
        "username": "favuser",
        "password": "password123"
    })
    return res.json()["access_token"]

def test_get_favorites_empty():
    token = get_auth_token()
    response = client.get("/api/favorites/ticker", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["favorites"] == []

def test_toggle_favorite_add():
    token = get_auth_token()
    response = client.post("/api/favorites/ticker/toggle", 
        json={"ticker": "BTCUSDT"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["status"] == "added"
    
    # Verify it was added
    res_get = client.get("/api/favorites/ticker", headers={"Authorization": f"Bearer {token}"})
    assert "BTCUSDT" in res_get.json()["favorites"]

def test_toggle_favorite_remove():
    token = get_auth_token()
    # First add it
    client.post("/api/favorites/ticker/toggle", 
        json={"ticker": "ETHUSDT"},
        headers={"Authorization": f"Bearer {token}"}
    )
    # Then remove it
    response = client.post("/api/favorites/ticker/toggle", 
        json={"ticker": "ETHUSDT"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "removed"
    
    # Verify it was removed
    res_get = client.get("/api/favorites/ticker", headers={"Authorization": f"Bearer {token}"})
    assert "ETHUSDT" not in res_get.json()["favorites"]
