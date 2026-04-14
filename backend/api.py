import sys
import os
import uvicorn
import pandas as pd
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# stdout encoding ayarı
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# DB ve modeller
from src.database.db import (
    get_user_analysis, save_analysis, create_tables, 
    add_ticker_favorite, remove_ticker_favorite, get_user_ticker_favorites
)
from src.auth.router import router as auth_router
from src.auth.deps import get_user_from_token
from src.auth.security import decode_access_token
from src.detection.ml_classifier import classifier
from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal

# Auth
_optional_bearer = HTTPBearer(auto_error=False)

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer)):
    if not credentials:
        return None
    return decode_access_token(credentials.credentials)

api = FastAPI(title="AI Trading Signal System API")

# CORS
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth yönlendirmeleri
api.include_router(auth_router, prefix="/api/auth", tags=["auth"])

# DB Init
create_tables()

@api.get("/")
async def root():
    return {"status": "running"}

class AnalyzeRequest(BaseModel):
    ticker: str

@api.post("/api/analyze")
async def analyze_ticker(request: AnalyzeRequest, user=Depends(get_optional_user)):
    """Canlı analiz."""
    pattern, df, peaks, troughs, pattern_points, dynamic_conf = fetch_and_analyze_data(request.ticker)
    
    if pattern == "error":
        raise HTTPException(status_code=400, detail="Analiz hatası.")

    # Sinyal üret
    current_price = float(df['Close'].iloc[-1])
    res = generate_signal(
        pattern=pattern, 
        dynamic_conf=dynamic_conf, 
        current_price=current_price, 
        prices=df['Close'].values, 
        pattern_points=pattern_points
    )
    signal = res['signal']
    conf = res['confidence']
    entry = res.get('entry')
    target = res.get('target')
    stop = res.get('stop')
        
    # Kayıt
    if user:
        try:
            save_analysis(
                u_id=user['user_id'],
                p_id=pattern,
                s_id=signal,
                conf=conf,
                entry=entry,
                target=target,
                stop=stop,
                risk=res.get('risk', 'Medium')
            )
        except Exception as e:
            print(f"DB Hatası: {e}")

    return {
        "success": True,
        "ticker": request.ticker.upper(),
        "pattern": pattern,
        "signal": signal,
        "confidence": conf,
        "entry": float(entry) if entry else None,
        "target": float(target) if target else None,
        "stop": float(stop) if stop else None,
        "chart_data": [{"Date": str(d), "Close": float(p)} for d, p in zip(df.index, df['Close'])],
        "peaks": [int(i) for i in peaks.tolist()],
        "troughs": [int(i) for i in troughs.tolist()],
        "pattern_points": [int(i) for i in pattern_points]
    }

@api.get("/api/history")
async def get_history(user=Depends(get_user_from_token)):
    """Analiz geçmişi."""
    rows = get_user_analysis(user.get('user_id'))
    return {
        "success": True, 
        "data": [
            {
                "id": r[0], "pattern": r[2], "signal": r[3], 
                "confidence": r[4], "entry": r[5], "target": r[6], 
                "stop_loss": r[7], "date": r[10]
            } for r in rows
        ]
    }

@api.post("/api/detect-image")
async def detect_image(file: UploadFile = File(...)):
    """Görsel analizi."""
    try:
        data = await file.read()
        pattern, confidence = classifier.predict(data)
        return {"pattern": pattern, "confidence": confidence, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/api/favorites/ticker")
async def get_favs(user=Depends(get_user_from_token)):
    return {"success": True, "favorites": get_user_ticker_favorites(user['user_id'])}

class ToggleFavRequest(BaseModel):
    ticker: str

@api.post("/api/favorites/ticker/toggle")
async def toggle_fav(request: ToggleFavRequest, user=Depends(get_user_from_token)):
    favs = get_user_ticker_favorites(user['user_id'])
    ticker = request.ticker.upper()
    if ticker in favs:
        remove_ticker_favorite(user['user_id'], ticker)
        return {"success": True, "status": "removed"}
    add_ticker_favorite(user['user_id'], ticker)
    return {"success": True, "status": "added"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Server starting on port {port}...")
    uvicorn.run("api:api", host="0.0.0.0", port=port, reload=True)
