from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.database.db import get_user_ticker_favorites, remove_ticker_favorite, add_ticker_favorite
from src.auth.deps import get_user_from_token

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.get("/ticker")
async def get_favs(user=Depends(get_user_from_token)):
    return {"success": True, "favorites": get_user_ticker_favorites(user['user_id'])}

class ToggleFavRequest(BaseModel):
    ticker: str

@router.post("/ticker/toggle")
async def toggle_fav(request: ToggleFavRequest, user=Depends(get_user_from_token)):
    favs = get_user_ticker_favorites(user['user_id'])
    ticker = request.ticker.upper()
    if ticker in favs:
        remove_ticker_favorite(user['user_id'], ticker)
        return {"success": True, "status": "removed"}
    add_ticker_favorite(user['user_id'], ticker)
    return {"success": True, "status": "added"}
