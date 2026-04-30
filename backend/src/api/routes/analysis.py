import pandas as pd
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel

from src.database.db import save_analysis
from src.auth.deps import get_optional_user
from src.detection.ml_classifier import classifier
from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal

router = APIRouter(prefix="/api", tags=["analysis"])

class AnalyzeRequest(BaseModel):
    ticker: str

@router.post("/analyze")
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
                symbol=request.ticker.upper(),
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

@router.post("/detect-image")
async def detect_image(file: UploadFile = File(...)):
    """Görsel analizi."""
    try:
        data = await file.read()
        pattern, confidence = classifier.predict(data)
        return {"pattern": pattern, "confidence": confidence, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
