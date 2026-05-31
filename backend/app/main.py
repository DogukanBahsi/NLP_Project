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

    # DISABLE_BERT=true ise (production/hafif mod) BERT yüklenmez
    if os.getenv("DISABLE_BERT", "false").lower() != "true":
        from app.nlp.bert_analyzer import TurkishBertAnalyzer
        bert = TurkishBertAnalyzer()
        try:
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, bert.initialize)
        except Exception as exc:
            print(f"BERT yuklenemedi — ML fallback aktif: {exc}")
    else:
        print("BERT devre disi (DISABLE_BERT=true) — ML fallback aktif.")

    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    print("HotelReviewAI API kapatiliyor.")


app = FastAPI(
    title="HotelReviewAI",
    description="NLP Tabanlı Otel Yorum Analizi ve Yönetici Karar Destek Sistemi",
    version="2.0.0",
    lifespan=lifespan,
)

# Production'da ALLOWED_ORIGINS env var ile kısıtlanır, local'de herkese açık
_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in _origins_env.split(",")] if _origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
