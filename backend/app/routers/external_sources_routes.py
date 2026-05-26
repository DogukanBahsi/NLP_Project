from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.nlp.analyzer import analyze_sentiment

import dateparser
from datetime import datetime

from app.services.serpapi_service import (
    search_google_maps_hotels,
    get_google_maps_reviews,
    get_platform_ratings,
)

router = APIRouter(
    prefix="/external",
    tags=["External Sources"]
)


@router.get("/serpapi/search-hotels")
def serpapi_search_hotels(query: str):
    results = search_google_maps_hotels(query)

    return {
        "query": query,
        "results": results
    }

@router.post("/serpapi/import-reviews")
def serpapi_import_reviews(
    hotel_name: str,
    data_id: str,
    max_reviews: int = 100,
    google_rating: float = None,
    latitude: float = None,
    longitude: float = None,
    place_id: str = None,
    address: str = None,
    db: Session = Depends(get_db)
):
    # ── data_id doğrulaması ──────────────────────────────────────────────────
    # S3 organik fallback sonuçlarında data_id = None / "null" / "" gelir.
    # Bu durumda google_maps_reviews çağrısı yapamayz; kullanıcıya net mesaj ver.
    _INVALID_IDS = {"", "null", "None", "undefined", "none"}
    if not data_id or data_id.strip() in _INVALID_IDS:
        print(f"[IMPORT] data_id geçersiz: {data_id!r} → import iptal", flush=True)
        return {
            "message": (
                "Bu otel için yorum çekilemiyor çünkü Google Maps kaydı bulunamadı. "
                "Lütfen arama sonuçlarından doğrudan Google Maps'te listelenen bir otel seçin."
            ),
            "hotel_id": None,
            "hotel_name": hotel_name,
            "requested_max_reviews": max_reviews,
            "received_reviews": 0,
            "inserted_count": 0,
            "skipped_count": 0,
        }
    # ────────────────────────────────────────────────────────────────────────

    reviews = get_google_maps_reviews(
        data_id=data_id,
        max_reviews=max_reviews
    )

    hotel = db.query(models.Hotel).filter(models.Hotel.name == hotel_name).first()

    if hotel is None:
        hotel = models.Hotel(
            name=hotel_name,
            city=None,
            country=None,
            google_rating=google_rating,
            place_id=place_id,
            latitude=latitude,
            longitude=longitude,
            address=address,
        )
        db.add(hotel)
        db.commit()
        db.refresh(hotel)
    else:
        # Mevcut oteli güncelle
        if google_rating is not None: hotel.google_rating = google_rating
        if place_id  is not None:     hotel.place_id      = place_id
        if latitude  is not None:     hotel.latitude      = latitude
        if longitude is not None:     hotel.longitude     = longitude
        if address   is not None:     hotel.address       = address
        db.commit()

    inserted_count = 0
    skipped_count = 0

    for review in reviews:
        comment = review.get("comment")

        if not comment:
            skipped_count += 1
            continue

        existing_review = db.query(models.Review).filter(
            models.Review.hotel_id == hotel.id,
            models.Review.comment == comment,
            models.Review.source == "serpapi"
        ).first()

        if existing_review:
            skipped_count += 1
            continue

        # Duygu Analizi (Yıldız puanı desteğiyle)
        analysis = analyze_sentiment(comment, star_rating=review.get("rating"))
        
        # Parse date
        raw_date = review.get("date")
        parsed_date = None
        if raw_date:
            parsed_date = dateparser.parse(raw_date)
            if not parsed_date:
                # Fallback or manual parsing if dateparser fails
                pass

        new_review = models.Review(
            hotel_id=hotel.id,
            source="serpapi",
            reviewer_name=review.get("reviewer_name"),
            rating=review.get("rating"),
            comment=comment,
            sentiment=analysis["sentiment"],
            satisfaction_score=analysis["satisfaction_score"],
            issue_category=analysis["issue_category"],
            risk_score=analysis["risk_score"],
            action_suggestion=analysis["action_suggestion"],
            review_date=parsed_date,
            review_date_raw=raw_date
        )

        db.add(new_review)
        inserted_count += 1

    db.commit()

    # ── Dış platform puanlarını otomatik çek ve kaydet ───────────────────────
    platform_count = 0
    try:
        platform_data = get_platform_ratings(hotel_name)
        for platform_key, info in platform_data.items():
            existing = (
                db.query(models.ExternalRating)
                .filter(
                    models.ExternalRating.hotel_id == hotel.id,
                    models.ExternalRating.platform == platform_key,
                )
                .first()
            )
            if existing:
                # Zaten varsa güncelle
                existing.rating       = info["rating"]
                existing.max_rating   = info["max_rating"]
                existing.review_count = info["review_count"]
                existing.url          = info["url"]
                existing.updated_at   = datetime.utcnow()
            else:
                db.add(models.ExternalRating(
                    hotel_id     = hotel.id,
                    platform     = platform_key,
                    rating       = info["rating"],
                    max_rating   = info["max_rating"],
                    review_count = info["review_count"],
                    url          = info["url"],
                ))
            platform_count += 1
        if platform_count:
            db.commit()
            print(f"[IMPORT] {platform_count} platform puani kaydedildi", flush=True)
    except Exception as exc:
        print(f"[IMPORT] Platform puanlari cekilemedi: {exc}", flush=True)
    # ────────────────────────────────────────────────────────────────────────

    return {
        "message": f"{inserted_count} yeni yorum eklendi, {skipped_count} yorum atlandı.",
        "hotel_id": hotel.id,
        "hotel_name": hotel.name,
        "requested_max_reviews": max_reviews,
        "received_reviews": len(reviews),
        "inserted_count": inserted_count,
        "skipped_count": skipped_count,
        "platform_ratings_found": platform_count,
    }