import asyncio
import asyncio
from dotenv import load_dotenv  
import os                      
from contextlib import asynccontextmanager

load_dotenv() 
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers import (
    hotel_routes,
    review_routes,
    dashboard_routes,
    analysis_routes,
    report_routes,
    external_sources_routes,
    external_ratings_routes,
    auth_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)

    from app.nlp.bert_analyzer import TurkishBertAnalyzer
    bert = TurkishBertAnalyzer()
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, bert.initialize)
    except Exception as exc:
        print(f"BERT yuklenemedi — ML fallback aktif: {exc}")

    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    print("HotelReviewAI API kapatiliyor.")


app = FastAPI(
    title="HotelReviewAI",
    description="NLP Tabanlı Otel Yorum Analizi ve Yönetici Karar Destek Sistemi",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(hotel_routes.router)
app.include_router(review_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(analysis_routes.router)
app.include_router(report_routes.router)
app.include_router(external_sources_routes.router)
app.include_router(external_ratings_routes.router)


@app.get("/")
def home():
    return {"message": "HotelReviewAI API calisiyor."}


@app.get("/health")
def health():
    from app.nlp.bert_analyzer import TurkishBertAnalyzer
    return {
        "status": "ok",
        "bert_ready": TurkishBertAnalyzer().is_ready,
    }
