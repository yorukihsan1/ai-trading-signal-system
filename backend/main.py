import sys
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# stdout encoding ayarı
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# DB
from src.database.db import create_tables

# Routers
from src.auth.router import router as auth_router
from src.api.routes.analysis import router as analysis_router
from src.api.routes.favorites import router as favorites_router
from src.api.routes.history import router as history_router

api = FastAPI(title="AI Trading Signal System API")

# CORS
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Init
create_tables()

# Auth yönlendirmeleri
api.include_router(auth_router, prefix="/api/auth", tags=["auth"])
# Diğer modüller
api.include_router(analysis_router)
api.include_router(favorites_router)
api.include_router(history_router)

@api.get("/")
async def root():
    return {"status": "running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Server starting on port {port}...")
    uvicorn.run("main:api", host="0.0.0.0", port=port, reload=True)
