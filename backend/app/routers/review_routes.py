from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd

from app.database import get_db
from app import models, schemas
from app.nlp.analyzer import analyze_sentiment

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.post("/", response_model=schemas.ReviewResponse)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == review.hotel_id).first()

    if hotel is None:
        raise HTTPException(status_code=404, detail="Otel bulunamadı")

    star_rating = int(review.rating) if review.rating is not None else None
    analysis = analyze_sentiment(review.comment, star_rating=star_rating)

    new_review = models.Review(
        hotel_id=review.hotel_id,
        source=review.source,
        reviewer_name=review.reviewer_name,
        rating=review.rating,
        comment=review.comment,

        sentiment=analysis["sentiment"],
        satisfaction_score=analysis["satisfaction_score"],
        issue_category=analysis["issue_category"],
        risk_score=analysis["risk_score"],
        action_suggestion=analysis["action_suggestion"]
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@router.get("/", response_model=List[schemas.ReviewResponse])
def get_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).all()


@router.get("/hotel/{hotel_id}", response_model=List[schemas.ReviewResponse])
def get_reviews_by_hotel(hotel_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.hotel_id == hotel_id).all()


@router.post("/upload-csv")
def upload_csv(
    hotel_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()

    if hotel is None:
        raise HTTPException(status_code=404, detail="Otel bulunamadı")

    df = pd.read_csv(file.file)

    inserted_count = 0

    for _, row in df.iterrows():
        comment = str(row.get("comment", ""))
        rating = row.get("rating", None)
        reviewer_name = row.get("reviewer_name", None)

        if not comment:
            continue

        csv_star = int(rating) if rating is not None and pd.notna(rating) else None
        analysis = analyze_sentiment(comment, star_rating=csv_star)

        new_review = models.Review(
            hotel_id=hotel_id,
            source="csv",
            reviewer_name=reviewer_name,
            rating=rating,
            comment=comment,

            sentiment=analysis["sentiment"],
            satisfaction_score=analysis["satisfaction_score"],
            issue_category=analysis["issue_category"],
            risk_score=analysis["risk_score"],
            action_suggestion=analysis["action_suggestion"]
        )

        db.add(new_review)
        inserted_count += 1

    db.commit()

    return {
        "message": f"{inserted_count} yorum başarıyla yüklendi ve analiz edildi."
    }

@router.post("/upload-multi-source-csv")
def upload_multi_source_csv(
    hotel_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()

    if hotel is None:
        raise HTTPException(status_code=404, detail="Otel bulunamadı")

    df = pd.read_csv(file.file)

    required_columns = ["source", "comment"]

    for column in required_columns:
        if column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"CSV dosyasında '{column}' sütunu bulunmalı."
            )

    inserted_count = 0
    source_counts = {}

    for _, row in df.iterrows():
        source = str(row.get("source", "unknown"))
        comment = str(row.get("comment", ""))
        rating = row.get("rating", None)
        reviewer_name = row.get("reviewer_name", None)

        if not comment or comment == "nan":
            continue

        multi_star = int(rating) if rating is not None and pd.notna(rating) else None
        analysis = analyze_sentiment(comment, star_rating=multi_star)

        new_review = models.Review(
            hotel_id=hotel_id,
            source=source,
            reviewer_name=reviewer_name,
            rating=rating,
            comment=comment,
            sentiment=analysis["sentiment"],
            satisfaction_score=analysis["satisfaction_score"],
            issue_category=analysis["issue_category"],
            risk_score=analysis["risk_score"],
            action_suggestion=analysis["action_suggestion"]
        )

        db.add(new_review)
        inserted_count += 1

        if source not in source_counts:
            source_counts[source] = 0

        source_counts[source] += 1

    db.commit()

    return {
        "message": f"{inserted_count} çoklu kaynak yorumu başarıyla yüklendi ve analiz edildi.",
        "source_counts": source_counts
    }