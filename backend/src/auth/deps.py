from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.auth.security import decode_access_token

security = HTTPBearer()

def get_user_from_token(auth: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token.")
    return payload # contains user_id, username
