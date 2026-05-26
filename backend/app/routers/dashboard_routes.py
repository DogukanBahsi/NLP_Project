from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict
import json

from app.database import get_db
from app import models
from app.nlp.action_planner import generate_action_plan

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.delete("/hotel/{hotel_id}")
def delete_hotel(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if hotel:
        db.query(models.Review).filter(models.Review.hotel_id == hotel_id).delete()
        db.delete(hotel)
        db.commit()
        return {"message": "Otel ve yorumları başarıyla silindi."}
    return {"message": "Otel bulunamadı."}


@router.get("/summary")
def get_dashboard_summary(
    hotel_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = db.query(
        func.count(models.Review.id).label("total"),
        func.avg(models.Review.satisfaction_score).label("avg_score"),
        func.sum(case((models.Review.sentiment == "pozitif", 1), else_=0)).label("pos"),
        func.sum(case((models.Review.sentiment == "negatif", 1), else_=0)).label("neg"),
        func.sum(case((models.Review.sentiment == "nötr", 1), else_=0)).label("neu"),
    )
    if hotel_id is not None:
        q = q.filter(models.Review.hotel_id == hotel_id)
    agg = q.one()

    total_reviews = agg.total or 0
    if total_reviews == 0:
        return empty_dashboard_response()

    average_satisfaction_score = round((agg.avg_score or 0) / 10.0, 2)

    sentiment_distribution = {
        "pozitif": agg.pos or 0,
        "negatif": agg.neg or 0,
        "nötr": agg.neu or 0,
    }

    cat_q = db.query(
        models.Review.issue_category,
        func.count(models.Review.id).label("cnt"),
    )
    if hotel_id is not None:
        cat_q = cat_q.filter(models.Review.hotel_id == hotel_id)
    category_rows = (
        cat_q
        .group_by(models.Review.issue_category)
        .order_by(func.count(models.Review.id).desc())
        .limit(5)
        .all()
    )
    top_issue_categories = [
        {"category": row.issue_category or "genel", "count": row.cnt}
        for row in category_rows
    ]

    risk_q = db.query(models.Review)
    if hotel_id is not None:
        risk_q = risk_q.filter(models.Review.hotel_id == hotel_id)
    high_risk_reviews = [
        {
            "id": r.id,
            "hotel_id": r.hotel_id,
            "comment": r.comment,
            "sentiment": r.sentiment,
            "issue_category": r.issue_category,
            "risk_score": round(r.risk_score / 10.0, 2) if r.risk_score is not None else None,
            "action_suggestion": r.action_suggestion,
            "source": r.source,
        }
        for r in risk_q.order_by(models.Review.risk_score.desc()).limit(5).all()
    ]

    weekly_action_plan = generate_weekly_action_plan(top_issue_categories)
    action_plan = generate_action_plan(
        top_issue_categories=top_issue_categories,
        total_negative=sentiment_distribution["negatif"],
    )
    source_analysis = generate_source_analysis(db, hotel_id)

    selected_hotel = None
    if hotel_id is not None:
        hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
        if hotel:
            selected_hotel = {"id": hotel.id, "name": hotel.name}

    all_hotels = db.query(models.Hotel).all()
    analyzed_hotels = [{"id": h.id, "name": h.name} for h in all_hotels]

    return {
        "selected_hotel": selected_hotel,
        "analyzed_hotels": analyzed_hotels,
        "total_reviews": total_reviews,
        "average_satisfaction_score": average_satisfaction_score,
        "sentiment_distribution": sentiment_distribution,
        "top_issue_categories": top_issue_categories,
        "high_risk_reviews": high_risk_reviews,
        "weekly_action_plan": weekly_action_plan,
        "action_plan": action_plan,
        "source_analysis": source_analysis,
    }


@router.get("/hotel-summary")
def get_hotel_summary(hotel_id: int, db: Session = Depends(get_db)):
    return get_dashboard_summary(hotel_id=hotel_id, db=db)


def empty_dashboard_response():
    return {
        "selected_hotel": None,
        "analyzed_hotels": [],
        "total_reviews": 0,
        "average_satisfaction_score": 0,
        "sentiment_distribution": {"pozitif": 0, "negatif": 0, "nötr": 0},
        "top_issue_categories": [],
        "high_risk_reviews": [],
        "weekly_action_plan": "Henüz analiz edilecek yorum bulunmuyor.",
        "action_plan": [],
        "source_analysis": [],
    }


def generate_source_analysis(db: Session, hotel_id: Optional[int] = None):
    q = db.query(
        models.Review.source,
        func.count(models.Review.id).label("total"),
        func.avg(models.Review.satisfaction_score).label("avg_score"),
        func.sum(case((models.Review.sentiment == "pozitif", 1), else_=0)).label("positive"),
        func.sum(case((models.Review.sentiment == "negatif", 1), else_=0)).label("negative"),
        func.sum(case((models.Review.sentiment == "nötr", 1), else_=0)).label("neutral"),
    )
    if hotel_id is not None:
        q = q.filter(models.Review.hotel_id == hotel_id)
    rows = q.group_by(models.Review.source).all()

    return [
        {
            "source": row.source or "unknown",
            "total_reviews": row.total,
            "average_score": round((row.avg_score or 0) / 10.0, 2),
            "positive": row.positive or 0,
            "negative": row.negative or 0,
            "neutral": row.neutral or 0,
        }
        for row in rows
    ]


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


@router.get("/trend")
def get_trend_data(
    hotel_id: Optional[int] = None,
    group_by: str = "monthly",
    time_range: str = "all",
    db: Session = Depends(get_db)
):
    query = db.query(models.Review)

    if hotel_id is not None:
        query = query.filter(models.Review.hotel_id == hotel_id)

    cutoff_map = {
        "last_week":  datetime.utcnow() - timedelta(days=7),
        "last_month": datetime.utcnow() - timedelta(days=30),
        "last_year":  datetime.utcnow() - timedelta(days=365),
    }
    cutoff = cutoff_map.get(time_range)

    if cutoff:
        query = query.filter(
            func.coalesce(models.Review.review_date, models.Review.created_at) >= cutoff
        )

    reviews = query.all()
    groups = defaultdict(lambda: {
        "total": 0, "positive": 0, "negative": 0, "neutral": 0,
        "score_sum": 0.0, "score_count": 0
    })

    for review in reviews:
        date = review.review_date or review.created_at
        if date is None:
            continue

        if group_by == "daily":
            period = date.strftime("%Y-%m-%d")
        elif group_by == "weekly":
            period = date.strftime("%Y-W%W")
        else:
            period = date.strftime("%Y-%m")

        g = groups[period]
        g["total"] += 1

        if review.sentiment == "pozitif":
            g["positive"] += 1
        elif review.sentiment == "negatif":
            g["negative"] += 1
        elif review.sentiment == "nötr":
            g["neutral"] += 1

        if review.satisfaction_score is not None:
            g["score_sum"] += review.satisfaction_score
            g["score_count"] += 1

    result = []
    for period in sorted(groups.keys()):
        g = groups[period]
        avg = round(g["score_sum"] / g["score_count"] / 10.0, 2) if g["score_count"] > 0 else 0
        result.append({
            "period": period,
            "total": g["total"],
            "positive": g["positive"],
            "negative": g["negative"],
            "neutral": g["neutral"],
            "avg_score": avg,
        })

    return result


@router.get("/reviews")
def get_reviews_table(
    hotel_id: Optional[int] = None,
    search: Optional[str] = None,
    sentiment: Optional[str] = None,
    page: int = 1,
    page_size: int = 15,
    db: Session = Depends(get_db)
):
    base = db.query(models.Review)

    if hotel_id is not None:
        base = base.filter(models.Review.hotel_id == hotel_id)
    if search and search.strip():
        base = base.filter(models.Review.comment.ilike(f"%{search.strip()}%"))
    if sentiment and sentiment.strip():
        base = base.filter(models.Review.sentiment == sentiment.strip())

    total = base.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    reviews = (
        base
        .options(joinedload(models.Review.hotel))
        .order_by(models.Review.risk_score.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []
    for review in reviews:
        hotel_name = review.hotel.name if review.hotel else "Bilinmeyen Otel"
        items.append({
            "id": review.id,
            "hotel_name": hotel_name,
            "comment": review.comment,
            "sentiment": review.sentiment or "nötr",
            "risk_score": round(review.risk_score / 10.0, 2) if review.risk_score is not None else None,
            "satisfaction_score": round(review.satisfaction_score / 10.0, 2) if review.satisfaction_score is not None else None,
            "issue_category": review.issue_category or "genel",
            "review_date": review.review_date.strftime("%d.%m.%Y") if review.review_date else None,
            "created_at": review.created_at.strftime("%d.%m.%Y") if review.created_at else None,
            "source": review.source or "manual",
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items,
    }


@router.get("/model-metrics")
def get_model_metrics():
    metrics_path = "app/ml_models/metrics.json"
    try:
        with open(metrics_path, "r", encoding="utf-8") as file:
            metrics = json.load(file)
        return metrics
    except Exception as e:
        return {"error": "metrics.json okunamadı", "details": str(e)}
