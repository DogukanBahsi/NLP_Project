"""
external_ratings_routes.py
Tripadvisor, Booking.com, Expedia vb. platform puanları için CRUD.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.services.serpapi_service import get_platform_ratings

router = APIRouter(prefix="/hotels", tags=["External Ratings"])

# ── Bilinen platform metadata'sı ─────────────────────────────────────────────
PLATFORM_META = {
    "tripadvisor": {"label": "TripAdvisor", "color": "#00AA6C", "max": 5.0,  "icon": "TA"},
    "booking":     {"label": "Booking.com", "color": "#003580", "max": 10.0, "icon": "B"},
    "expedia":     {"label": "Expedia",     "color": "#00355F", "max": 10.0, "icon": "E"},
    "zenhotels":   {"label": "ZenHotels",   "color": "#E31A2D", "max": 10.0, "icon": "Z"},
    "hotels_com":  {"label": "Hotels.com",  "color": "#D4001C", "max": 10.0, "icon": "H"},
    "google_maps": {"label": "Google Maps", "color": "#4285F4", "max": 5.0,  "icon": "G"},
    "agoda":       {"label": "Agoda",       "color": "#5B2D8E", "max": 10.0, "icon": "A"},
    "other":       {"label": "Diğer",       "color": "#64748B", "max": 10.0, "icon": "?"},
}


class ExternalRatingIn(BaseModel):
    platform:     str
    rating:       Optional[float] = None
    max_rating:   Optional[float] = None
    review_count: Optional[int]   = None
    url:          Optional[str]   = None


# ── GET ───────────────────────────────────────────────────────────────────────
@router.get("/{hotel_id}/external-ratings")
def get_external_ratings(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.get(models.Hotel, hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Otel bulunamadı")

    rows = (
        db.query(models.ExternalRating)
        .filter(models.ExternalRating.hotel_id == hotel_id)
        .order_by(models.ExternalRating.platform)
        .all()
    )
    return [_serialize(r) for r in rows]


# ── POST (ekle veya güncelle — upsert) ───────────────────────────────────────
@router.post("/{hotel_id}/external-ratings")
def upsert_external_rating(
    hotel_id: int,
    body: ExternalRatingIn,
    db: Session = Depends(get_db),
):
    hotel = db.get(models.Hotel, hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Otel bulunamadı")

    key = body.platform.lower().strip()
    row = (
        db.query(models.ExternalRating)
        .filter(
            models.ExternalRating.hotel_id == hotel_id,
            models.ExternalRating.platform == key,
        )
        .first()
    )

    # max_rating belirtilmemişse meta'dan al
    meta_max = PLATFORM_META.get(key, {}).get("max", 10.0)
    effective_max = body.max_rating if body.max_rating is not None else meta_max

    if row:
        row.rating       = body.rating
        row.max_rating   = effective_max
        row.review_count = body.review_count
        row.url          = body.url
        row.updated_at   = datetime.utcnow()
    else:
        row = models.ExternalRating(
            hotel_id     = hotel_id,
            platform     = key,
            rating       = body.rating,
            max_rating   = effective_max,
            review_count = body.review_count,
            url          = body.url,
        )
        db.add(row)

    db.commit()
    db.refresh(row)
    return _serialize(row)


# ── DELETE ────────────────────────────────────────────────────────────────────
@router.delete("/{hotel_id}/external-ratings/{platform}")
def delete_external_rating(hotel_id: int, platform: str, db: Session = Depends(get_db)):
    row = (
        db.query(models.ExternalRating)
        .filter(
            models.ExternalRating.hotel_id == hotel_id,
            models.ExternalRating.platform == platform.lower(),
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    db.delete(row)
    db.commit()
    return {"ok": True}


# ── POST /auto-fetch (otomatik platform puanı çek) ────────────────────────────
@router.post("/{hotel_id}/fetch-platform-ratings")
def auto_fetch_ratings(hotel_id: int, db: Session = Depends(get_db)):
    """Google arama ile platform puanlarını otomatik çek ve kaydet."""
    hotel = db.get(models.Hotel, hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Otel bulunamadı")

    platform_data = get_platform_ratings(hotel.name)
    saved = []

    for platform_key, info in platform_data.items():
        existing = (
            db.query(models.ExternalRating)
            .filter(
                models.ExternalRating.hotel_id == hotel_id,
                models.ExternalRating.platform == platform_key,
            )
            .first()
        )
        if existing:
            existing.rating       = info["rating"]
            existing.max_rating   = info["max_rating"]
            existing.review_count = info["review_count"]
            existing.url          = info["url"]
            existing.updated_at   = datetime.utcnow()
        else:
            db.add(models.ExternalRating(
                hotel_id     = hotel_id,
                platform     = platform_key,
                rating       = info["rating"],
                max_rating   = info["max_rating"],
                review_count = info["review_count"],
                url          = info["url"],
            ))
        saved.append(platform_key)

    db.commit()
    rows = (
        db.query(models.ExternalRating)
        .filter(models.ExternalRating.hotel_id == hotel_id)
        .order_by(models.ExternalRating.platform)
        .all()
    )
    return {
        "saved_count": len(saved),
        "saved_platforms": saved,
        "ratings": [_serialize(r) for r in rows],
    }


# ── GET /platforms (platform listesi + meta) ──────────────────────────────────
@router.get("/external-ratings/platforms")
def list_platforms():
    return [
        {"key": k, **v}
        for k, v in PLATFORM_META.items()
    ]


# ── Yardımcı ──────────────────────────────────────────────────────────────────
def _serialize(r: models.ExternalRating) -> dict:
    meta = PLATFORM_META.get(r.platform, {"label": r.platform, "color": "#64748B", "max": 10.0, "icon": "?"})
    return {
        "id":           r.id,
        "hotel_id":     r.hotel_id,
        "platform":     r.platform,
        "label":        meta["label"],
        "color":        meta["color"],
        "icon":         meta["icon"],
        "max_rating":   r.max_rating or meta["max"],
        "rating":       r.rating,
        "review_count": r.review_count,
        "url":          r.url,
        "updated_at":   r.updated_at.isoformat() if r.updated_at else None,
    }
