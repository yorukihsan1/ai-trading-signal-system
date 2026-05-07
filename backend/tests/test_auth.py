import pytest
from fastapi.testclient import TestClient
from main import api
from src.database.db import create_tables, get_connection

client = TestClient(api)

@pytest.fixture(autouse=True)
def setup_db():
    create_tables()
    # Temiz bir veritabanı için users tablosunu temizle
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users")
    conn.commit()
    conn.close()
    yield

def test_register_user():
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_register_duplicate_user():
    client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test2@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "zaten alınmış" in response.json()["detail"]

def test_login_success():
    client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post("/api/auth/login", json={
        "username": "wronguser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_me():
    client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    login_res = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["user"]["username"] == "testuser"
