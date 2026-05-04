from transformers import pipeline

sentiment_pipeline = None


def load_bert_model():
    global sentiment_pipeline

    if sentiment_pipeline is None:
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )


def analyze_with_bert(comment: str) -> dict:
    load_bert_model()

    result = sentiment_pipeline(comment)[0]

    label = result["label"]
    confidence = result["score"]

    stars = int(label.split()[0])

    if stars >= 4:
        sentiment = "pozitif"
    elif stars <= 2:
        sentiment = "negatif"
    else:
        sentiment = "nötr"

    return {
        "sentiment": sentiment,
        "confidence": round(confidence, 3),
        "stars": stars
    }