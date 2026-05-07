import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import pandas as pd
import numpy as np

from main import api

client = TestClient(api)

def test_analyze_invalid_ticker_validation():
    """Test Pydantic validation for ticker format (min 2, max 15, alphanumeric)."""
    # Too short
    response = client.post("/api/analyze", json={"ticker": "A"})
    assert response.status_code == 422
    
    # Too long
    response = client.post("/api/analyze", json={"ticker": "THIS_IS_A_VERY_LONG_TICKER"})
    assert response.status_code == 422
    
    # Invalid characters
    response = client.post("/api/analyze", json={"ticker": "BTC!@#"})
    assert response.status_code == 422

@patch("src.api.routes.analysis.fetch_and_analyze_data")
def test_analyze_valid_ticker(mock_fetch):
    """Test successful analysis route."""
    # Mock return: pattern, df, peaks, troughs, pattern_points, dynamic_conf
    df = pd.DataFrame({'Close': [100, 105, 110]}, index=['2026-01-01', '2026-01-02', '2026-01-03'])
    mock_fetch.return_value = ("trend", df, np.array([1]), np.array([0]), [], 0.5)
    
    response = client.post("/api/analyze", json={"ticker": "BTC-USDT"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["ticker"] == "BTC-USDT"
    assert data["pattern"] == "trend"
    
@patch("src.api.routes.analysis.fetch_and_analyze_data")
def test_analyze_rate_limit(mock_fetch):
    """Test slowapi rate limiting (20/minute)."""
    df = pd.DataFrame({'Close': [100, 105, 110]}, index=['2026-01-01', '2026-01-02', '2026-01-03'])
    mock_fetch.return_value = ("trend", df, np.array([1]), np.array([0]), [], 0.5)
    
    # Send 20 requests
    for _ in range(20):
        client.post("/api/analyze", json={"ticker": "ETH-USDT"})
        
    # The 21st request should be rate-limited
    response = client.post("/api/analyze", json={"ticker": "ETH-USDT"})
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.text
