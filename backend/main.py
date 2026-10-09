from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .database import init_db
from .routers import chat, features

settings = get_settings()
app = FastAPI(title="AgriMitra API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aggrimitra-1yrb.vercel.app",
        "http://localhost:5173",
        settings.frontend_origin,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat.router); app.include_router(features.router)

@app.on_event("startup")
def startup(): init_db()

@app.get("/health")
def health(): return {"status": "ok", "service": "agrimitra", "groq_configured": bool(settings.groq_api_key)}
