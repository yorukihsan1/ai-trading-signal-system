import pandas as pd
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from src.utils.limiter import limiter
from src.database.db import save_analysis, update_analysis_feedback, get_top_successful_tickers
from src.auth.deps import get_optional_user, get_user_from_token
from src.detection.ml_classifier import classifier
from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal

router = APIRouter(prefix="/api", tags=["analysis"])

class AnalyzeRequest(BaseModel):
    ticker: str = Field(..., min_length=2, max_length=15, pattern=r'^[a-zA-Z0-9\-\/]+$')

@router.post(
    "/analyze",
    summary="Canlı Piyasa Analizi Başlat",
    description="Verilen Ticker sembolüne ait canlı verileri (Yahoo Finance) çeker, pattern tespiti yapar ve güven skorlarıyla birlikte Trading Signal döner."
)
@limiter.limit("20/minute")
async def analyze_ticker(request: Request, payload: AnalyzeRequest, user=Depends(get_optional_user)):
    try:
        pattern, df, peaks, troughs, pattern_points, dynamic_conf = fetch_and_analyze_data(payload.ticker)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Bir hata oluştu, lütfen daha sonra tekrar deneyin.")
    
    if pattern == "error":
        raise HTTPException(status_code=400, detail="Analiz hatası: Geçerli bir desen bulunamadı veya veri alınamadı.")

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
    analysis_id = None
    if user:
        try:
            analysis_id = save_analysis(
                u_id=user['user_id'],
                symbol=payload.ticker.upper(),
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
        "analysis_id": analysis_id,
        "ticker": payload.ticker.upper(),
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

@router.post(
    "/detect-image",
    summary="Görsel Üzerinden Formasyon Tespiti",
    description="Kullanıcı tarafından yüklenen borsa grafiği görseli (chart image) üzerinde derin öğrenme tabanlı resim sınıflandırma yapar ve formasyonu söyler."
)
@limiter.limit("10/minute")
async def detect_image(request: Request, file: UploadFile = File(...), user=Depends(get_optional_user)):
    try:
        data = await file.read()
        pattern, confidence = classifier.predict(data)
        
        if user and pattern not in ['none', 'model_not_initialized']:
            from src.database.db import increment_pattern_analysis_count
            increment_pattern_analysis_count(user['user_id'])
            
        return {"pattern": pattern, "confidence": confidence, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Görsel analizi sırasında bir hata oluştu.")


class FeedbackRequest(BaseModel):
    feedback: int = Field(..., description="1 for thumbs up, -1 for thumbs down")

@router.post(
    "/analyze/{analysis_id}/feedback",
    summary="Analiz Sonucuna Geri Bildirim Ver",
    description="Kullanıcının daha önce yaptığı spesifik bir analizi beğenip beğenmediğini (thumbs up / thumbs down) sisteme kaydeder."
)
@limiter.limit("30/minute")
async def submit_feedback(request: Request, analysis_id: int, payload: FeedbackRequest, user=Depends(get_user_from_token)):
    success = update_analysis_feedback(analysis_id, user['user_id'], payload.feedback)
    if not success:
        raise HTTPException(status_code=400, detail="Geri bildirim kaydedilemedi. Analiz bulunamadı veya yetkisiz işlem.")
    return {"success": True, "message": "Geri bildiriminiz için teşekkürler!"}

@router.get(
    "/leaderboard",
    summary="Liderlik Tablosunu Getir (Top Sinyaller)",
    description="Sistemde kullanıcılar tarafından onaylanmış (thumbs up) en yüksek başarı oranına sahip sembolleri getirir."
)
@limiter.limit("20/minute")
async def get_leaderboard(request: Request):
    try:
        top_tickers = get_top_successful_tickers(limit=10)
        return {"success": True, "leaderboard": top_tickers}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Liderlik tablosu alınamadı.")
