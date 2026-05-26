from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.nlp.analyzer import analyze_sentiment

from app.services.serpapi_service import (
    search_google_maps_hotels,
    get_google_maps_reviews
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


import dateparser
from datetime import datetime

@router.post("/serpapi/import-reviews")
def serpapi_import_reviews(
    hotel_name: str,
    data_id: str,
    max_reviews: int = 100,
    google_rating: float = None,
    db: Session = Depends(get_db)
):
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
            google_rating=google_rating
        )
        db.add(hotel)
        db.commit()
        db.refresh(hotel)
    elif google_rating is not None:
        hotel.google_rating = google_rating
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

    return {
        "message": f"{inserted_count} yeni yorum eklendi, {skipped_count} yorum atlandı.",
        "hotel_id": hotel.id,
        "hotel_name": hotel.name,
        "requested_max_reviews": max_reviews,
        "received_reviews": len(reviews),
        "inserted_count": inserted_count,
        "skipped_count": skipped_count
    }