from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

import json
import os

from app.database import get_db
from app import models

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def get_dashboard_summary(
    hotel_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Review)

    if hotel_id is not None:
        query = query.filter(models.Review.hotel_id == hotel_id)

    reviews = query.all()

    if len(reviews) == 0:
        return {
            "total_reviews": 0,
            "average_satisfaction_score": 0,
            "sentiment_distribution": {
                "pozitif": 0,
                "negatif": 0,
                "nötr": 0
            },
            "top_issue_categories": [],
            "high_risk_reviews": [],
            "weekly_action_plan": "Henüz analiz edilecek yorum bulunmuyor."
        }

    total_reviews = len(reviews)

    average_satisfaction_score = sum(
        review.satisfaction_score or 0 for review in reviews
    ) / total_reviews

    sentiment_distribution = {
        "pozitif": 0,
        "negatif": 0,
        "nötr": 0
    }

    for review in reviews:
        if review.sentiment in sentiment_distribution:
            sentiment_distribution[review.sentiment] += 1

    category_counts = {}

    for review in reviews:
        category = review.issue_category or "genel"

        if category not in category_counts:
            category_counts[category] = 0

        category_counts[category] += 1

    top_issue_categories = sorted(
        category_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )

    top_issue_categories = [
        {
            "category": category,
            "count": count
        }
        for category, count in top_issue_categories[:5]
    ]

    high_risk_reviews_query = query.order_by(
        models.Review.risk_score.desc()
    ).limit(5).all()

    high_risk_reviews = []

    for review in high_risk_reviews_query:
        high_risk_reviews.append({
            "id": review.id,
            "comment": review.comment,
            "sentiment": review.sentiment,
            "issue_category": review.issue_category,
            "risk_score": review.risk_score,
            "action_suggestion": review.action_suggestion
        })

    weekly_action_plan = generate_weekly_action_plan(top_issue_categories)

    return {
        "total_reviews": total_reviews,
        "average_satisfaction_score": round(average_satisfaction_score, 2),
        "sentiment_distribution": sentiment_distribution,
        "top_issue_categories": top_issue_categories,
        "high_risk_reviews": high_risk_reviews,
        "weekly_action_plan": weekly_action_plan
    }


def generate_weekly_action_plan(top_issue_categories):
    if len(top_issue_categories) == 0:
        return "Bu hafta için belirgin bir problem alanı bulunmuyor."

    first_category = top_issue_categories[0]["category"]

    if first_category == "temizlik":
        return "Bu hafta temizlik süreçleri öncelikli olarak denetlenmeli."

    if first_category == "resepsiyon":
        return "Bu hafta resepsiyon ekibinin iletişim ve karşılama süreci gözden geçirilmeli."

    if first_category == "oda":
        return "Bu hafta oda konforu, klima, banyo ve teknik ekipmanlar kontrol edilmeli."

    if first_category == "yemek":
        return "Bu hafta kahvaltı ve restoran hizmet kalitesi analiz edilmeli."

    if first_category == "wifi":
        return "Bu hafta internet altyapısı ve oda bazlı Wi-Fi çekim gücü test edilmeli."

    if first_category == "fiyat":
        return "Bu hafta fiyat-performans algısı ve kampanya stratejileri değerlendirilmeli."

    return "Bu hafta genel misafir memnuniyeti yorumları detaylı incelenmeli."
    


@router.get("/model-metrics")
def get_model_metrics():
    metrics_path = "app/ml_models/metrics.json"

    try:
        with open(metrics_path, "r", encoding="utf-8") as file:
            metrics = json.load(file)

        return metrics

    except Exception as e:
        return {
            "error": "metrics.json okunamadı",
            "details": str(e)
        }