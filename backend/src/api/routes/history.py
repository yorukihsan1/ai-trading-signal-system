from fastapi import APIRouter, Depends

from src.database.db import get_user_analysis
from src.auth.deps import get_user_from_token

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("")
async def get_history(user=Depends(get_user_from_token)):
    """Analiz geçmişi."""
    rows = get_user_analysis(user.get('user_id'))
    return {
        "success": True, 
        "data": [
            {
                "id": r[0], "pattern": r[1], "signal": r[2], 
                "confidence": r[3], "entry": r[4], "target": r[5], 
                "stop_loss": r[6], "date": r[7], "symbol": r[8]
            } for r in rows
        ]
    }
