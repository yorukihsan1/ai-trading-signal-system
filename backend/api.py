from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uvicorn
import pandas as pd
import math
import numpy as np

from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal
from src.database.db import get_all_analysis, save_analysis, create_tables, add_ticker_favorite, remove_ticker_favorite, get_user_ticker_favorites
from src.auth.router import router as auth_router
from src.auth.deps import get_user_from_token, security, decode_access_token

app = FastAPI(title="AI Trading Signal System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")

optional_security = HTTPBearer(auto_error=False)

def get_optional_user(auth: HTTPAuthorizationCredentials = Depends(optional_security)):
    if auth is None: return None
    return decode_access_token(auth.credentials)

class AnalyzeRequest(BaseModel):
    ticker: str

def safe_isnan(val):
    if isinstance(val, float) and math.isnan(val):
        return None
    return val

@app.get("/")
def read_root():
    return {"message": "AI Trading Signal API is active"}

@app.post("/api/analyze")
def analyze_crypto(request: AnalyzeRequest, auth: HTTPAuthorizationCredentials = Depends(optional_security)):
    ticker_input = request.ticker.strip().upper()
    if not ticker_input:
        raise HTTPException(status_code=400, detail="Lütfen geçerli bir sembol girin.")
    
    try:
        pattern, df, peaks, troughs, pattern_points, dynamic_conf = fetch_and_analyze_data(ticker_input)
        
        if pattern == "error" or df is None:
            raise HTTPException(status_code=500, detail="Veri çekilemedi. Sembolü kontrol edin.")

        current_price = None
        prices = None
        if df is not None and not df.empty and 'Close' in df.columns:
            last_close = df['Close'].iloc[-1]
            if not math.isnan(last_close):
                current_price = float(last_close)
            prices = df['Close'].values

        result = generate_signal(pattern, dynamic_conf, current_price, prices, pattern_points)
        
        # Signal / Pattern Mappings
        sig_map = {"BUY": 1, "SELL": 2, "HOLD": 3, "BREAKOUT": 4}
        pat_map = {"triangle": 1, "double_top": 2, "head_shoulders": 3}
        
        t_signal_id = sig_map.get(str(result.get("signal", "HOLD")).upper(), 3)
        t_pattern_id = pat_map.get(str(pattern).lower(), 1)
        
        user_info = get_optional_user(auth)
        current_user_id = user_info.get("user_id", 0) if user_info else 0
        
        save_analysis(
            user_id=current_user_id,
            pattern_id=t_pattern_id, 
            signal_id=t_signal_id,
            confidence=result["confidence"],
            entry_price=result.get("entry"),
            target_price=result.get("target"),
            stop_loss=result.get("stop"),
            risk_level=result.get("risk")
        )
        
        # Prepare Chart Data
        df_reset = df.reset_index()
        date_col = 'Date' if 'Date' in df_reset.columns else 'Datetime'
        if date_col in df_reset.columns:
            df_reset[date_col] = df_reset[date_col].astype(str)
            
        chart_data = df_reset.to_dict(orient="records")
        for row in chart_data:
            for k, v in row.items():
                if isinstance(v, float) and math.isnan(v):
                    row[k] = None

        return {
            "success": True,
            "ticker": ticker_input,
            "pattern": pattern,
            "signal": result["signal"],
            "confidence": result["confidence"],
            "entry": result.get("entry"),
            "target": result.get("target"),
            "stop": result.get("stop"),
            "risk": result.get("risk"),
            "chart_data": chart_data,
            "peaks": [int(p) for p in peaks],
            "troughs": [int(t) for t in troughs],
            "pattern_points": [int(p) for p in pattern_points]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history(user=Depends(get_user_from_token)):
    try:
        user_id = user.get("user_id")
        data = get_all_analysis(user_id=user_id)
        if not data:
            return {"success": True, "data": []}
            
        history_list = []
        pattern_map = {1: "Triangle", 2: "Double Top", 3: "Head & Shoulders"}
        signal_map = {1: "BUY", 2: "SELL", 3: "HOLD", 4: "BREAKOUT"}

        for row in data:
            history_list.append({
                "id": row[0],
                "user_id": row[1],
                "pattern": pattern_map.get(row[2], "Unknown"),
                "signal": signal_map.get(row[3], "Unknown"),
                "confidence": round(row[4], 2) if row[4] else 0,
                "entry": row[5],
                "target": row[6],
                "stop_loss": row[7],
                "risk": row[8],
                "type": row[9],
                "date": row[10]
            })
            
        history_list.sort(key=lambda x: x["id"], reverse=True)
        return {"success": True, "data": history_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/favorites/ticker")
def get_favorites(user=Depends(get_user_from_token)):
    user_id = user.get("user_id")
    syms = get_user_ticker_favorites(user_id)
    return {"success": True, "favorites": syms}

@app.post("/api/favorites/ticker/toggle")
def toggle_favorite(request: AnalyzeRequest, user=Depends(get_user_from_token)):
    user_id = user.get("user_id")
    ticker = request.ticker.strip().upper()
    
    current = get_user_ticker_favorites(user_id)
    if ticker in current:
        remove_ticker_favorite(user_id, ticker)
        return {"success": True, "status": "removed", "ticker": ticker}
    else:
        add_ticker_favorite(user_id, ticker)
        return {"success": True, "status": "added", "ticker": ticker}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
