from fastapi import APIRouter

from app import schemas
from app.nlp.analyzer import analyze_sentiment

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)


@router.post("/analyze-text")
def analyze_text(request: schemas.TextAnalysisRequest):
    if request.model_type not in ["ml", "bert"]:
        return {
            "error": "model_type sadece 'ml' veya 'bert' olabilir."
        }

    result = analyze_sentiment(
        comment=request.comment,
        model_type=request.model_type
    )

    return {
        "comment": request.comment,
        "model_type": request.model_type,
        "analysis": result
    }