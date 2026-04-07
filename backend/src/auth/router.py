from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.database.db import get_user_by_username, create_user, get_user_by_id, update_user_profile, update_user_password, get_connection
from src.auth.security import verify_password, get_password_hash, create_access_token
from src.auth.deps import get_user_from_token

router = APIRouter(tags=["auth"])

class UserRegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    username: str
    password: str

class ProfileUpdateRequest(BaseModel):
    email: str
    avatar: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/register")
def register(user: UserRegisterRequest):
    if get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış.")
    
    hashed_pwd = get_password_hash(user.password)
    if not create_user(user.username, user.email, hashed_pwd):
        raise HTTPException(status_code=500, detail="Kayıt sırasında bir hata oluştu.")
        
    return {"success": True, "message": "Kayıt başarılı, giriş yapabilirsiniz."}

@router.post("/login")
def login(user: UserLoginRequest):
    row = get_user_by_username(user.username)
    if not row or not verify_password(user.password, row[3]):
        raise HTTPException(status_code=401, detail="Hatalı kullanıcı adı veya şifre.")
    
    # Token payload: sub (username), user_id, role
    access_token = create_access_token(data={"sub": user.username, "user_id": row[0], "role": row[4]})
    return {
        "success": True, 
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user.username,
        "user_id": row[0]
    }

@router.get("/me")
def get_me(user=Depends(get_user_from_token)):
    user_id = user.get("user_id")
    profile = get_user_by_id(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return {"success": True, "user": profile}

@router.post("/update-profile")
def update_profile(request: ProfileUpdateRequest, user=Depends(get_user_from_token)):
    user_id = user.get("user_id")
    if not update_user_profile(user_id, request.email, request.avatar):
        raise HTTPException(status_code=500, detail="Profil güncellenirken hata oluştu.")
    return {"success": True, "message": "Profil güncellendi.", "avatar": request.avatar}

@router.post("/change-password")
def change_password(request: PasswordChangeRequest, user=Depends(get_user_from_token)):
    user_id = user.get("user_id")
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not verify_password(request.current_password, row[0]):
        raise HTTPException(status_code=400, detail="Mevcut şifreniz hatalı.")
    
    new_hashed = get_password_hash(request.new_password)
    if not update_user_password(user_id, new_hashed):
        raise HTTPException(status_code=500, detail="Şifre güncellenirken hata oluştu.")
    return {"success": True, "message": "Şifre başarıyla değiştirildi."}
