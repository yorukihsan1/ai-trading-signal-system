import os
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from groq import Groq

from src.auth.deps import get_optional_user
from src.database.db import get_user_by_id

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., description="Kullanıcının gönderdiği mesaj (örn: RSI nedir?)")
    context: Optional[str] = Field(None, description="Opsiyonel olarak mevcut sayfa/ticker bağlamı (örn: BTCUSDT)")

class ChatResponse(BaseModel):
    response: str = Field(..., description="Yapay zeka asistanının verdiği yanıt")

@router.post(
    "/chat", 
    response_model=ChatResponse,
    summary="Yapay Zeka Asistanı ile Sohbet Et",
    description="Kullanıcının sorularını yanıtlamak için Groq tabanlı LLaMA 3 modeline istek atar. Kullanıcının rütbesini algılayarak dinamik persona uygular."
)
async def chat_with_assistant(request: ChatRequest, user_token=Depends(get_optional_user)):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY bulunamadı.")
        raise HTTPException(status_code=500, detail="Chatbot yapılandırması eksik (API Key). Lütfen sistem yöneticisi ile iletişime geçin.")
        
    try:
        client = Groq(api_key=api_key)
        
        system_prompt = (
            "Sen 'AI Trading Signal System' platformunun resmi sanal asistanısın. "
            "Kullanıcıların teknik analiz, finansal piyasalar, hisse senedi/kripto "
            "formasyonları (örn: İkili Tepe, Üçgen, RSI, MACD vs.) ile ilgili sorularına "
            "kısa, net, anlaşılır ve profesyonel bir dille Türkçe cevaplar verirsin. "
            "Eğer kullanıcı finans dışı bir soru sorarsa (örn: hava durumu, spor, yemek tarifi, günlük sohbet vs.) "
            "kibarca 'Ben sadece finansal analiz ve piyasa konularında yardımcı olmak için eğitildim.' diyerek reddet. "
            "Asla kesin yatırım tavsiyesi verme, gerekirse 'Bu bir yatırım tavsiyesi değildir, "
            "kendi araştırmanızı yapınız' şeklinde uyar."
        )

        user_rank = "Ziyaretçi"
        if user_token:
            user_data = get_user_by_id(user_token['user_id'])
            if user_data:
                user_rank = user_data.get('rank', 'Acemi')

        if user_rank in ["Balina", "Analiz Uzmanı"]:
            rank_persona = (
                f"\n\nKullanıcının rütbesi: {user_rank}. "
                "Bu kullanıcı piyasalarda oldukça deneyimli. "
                "Yanıtlarında doğrudan sadede gel, profesyonel bir finansal danışman gibi 'likidite, order block, "
                "R/R oranı, formasyon hedefleri' gibi ileri düzey terimleri kullanmaktan çekinme. "
                "Temel kavramları (RSI nedir gibi) açıklamana gerek yok, doğrudan analitik bilgi ver."
            )
        else:
            rank_persona = (
                f"\n\nKullanıcının rütbesi: {user_rank}. "
                "Bu kullanıcı finansal piyasalarda kendini geliştirmekte olan veya sisteme yeni katılmış biri. "
                "Yanıtlarını eğitici bir üslupla ver, karmaşık terimleri (RSI, MACD, Destek/Direnç vb.) kullanırken "
                "kısaca ne anlama geldiklerini bir benzetmeyle (analoji) veya çok basit bir dille açıkla. "
                "Mümkün olduğunca cesaretlendirici ol."
            )
            
        system_prompt += rank_persona

        if request.context:
            system_prompt += f"\n\nKullanıcının şu an incelediği bağlam/sembol: {request.context}"
            
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=500,
        )
        
        bot_response = chat_completion.choices[0].message.content
        return {"response": bot_response}
        
    except Exception as e:
        logger.error(f"Chatbot API hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="Asistan şu anda yanıt veremiyor, lütfen daha sonra tekrar deneyin.")
