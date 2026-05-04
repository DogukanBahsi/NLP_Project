from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers import hotel_routes, review_routes, dashboard_routes, analysis_routes, report_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HotelReviewAI",
    description="NLP Tabanlı Otel Yorum Analizi ve Yönetici Karar Destek Sistemi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hotel_routes.router)
app.include_router(review_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(analysis_routes.router)
app.include_router(report_routes.router)


@app.get("/")
def home():
    return {
        "message": "HotelReviewAI API çalışıyor."
    }