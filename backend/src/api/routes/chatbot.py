import os
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from groq import Groq

# Kullanıcı yetkilendirmesi için (İsteğe bağlı, herkese açık da yapılabilir ama auth projede var)
# Eğer chatbotu sadece login olanlar kullansın isterseniz bunu açın:
# from src.auth.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None  # İleride "hangi hisseye bakıyor" bilgisini göndermek için

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
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
            "Cevaplarını çok uzatma, kolay okunabilir yap. "
            "Asla kesin yatırım tavsiyesi verme, gerekirse 'Bu bir yatırım tavsiyesi değildir, "
            "kendi araştırmanızı yapınız' şeklinde uyar."
        )

        if request.context:
            system_prompt += f"\n\nKullanıcının şu an incelediği bağlam/sembol: {request.context}"
            
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            model="llama-3.1-8b-instant", # Groq üzerindeki hızlı model
            temperature=0.5,
            max_tokens=500,
        )
        
        bot_response = chat_completion.choices[0].message.content
        return {"response": bot_response}
        
    except Exception as e:
        logger.error(f"Chatbot API hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="Asistan şu anda yanıt veremiyor, lütfen daha sonra tekrar deneyin.")
