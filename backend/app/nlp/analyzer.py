from app.nlp.bert_analyzer import analyze_with_bert
import os
import joblib

from app.nlp.category_detector import detect_issue_category


MODEL_PATH = "app/ml_models/sentiment_model.pkl"
VECTORIZER_PATH = "app/ml_models/tfidf_vectorizer.pkl"


model = None
vectorizer = None


def load_model():
    global model, vectorizer

    if model is None and os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)

    if vectorizer is None and os.path.exists(VECTORIZER_PATH):
        vectorizer = joblib.load(VECTORIZER_PATH)


def analyze_sentiment(comment: str, model_type: str = "ml") -> dict:
    load_model()

    if model_type == "bert":
        bert_result = analyze_with_bert(comment)

        sentiment = bert_result["sentiment"]
        confidence = bert_result["confidence"]

        if sentiment == "pozitif":
            satisfaction_score = 70 + confidence * 30
        elif sentiment == "negatif":
            satisfaction_score = 40 - confidence * 30
        else:
            satisfaction_score = 50 + confidence * 10

        satisfaction_score = round(max(0, min(100, satisfaction_score)), 2)

        issue_category = detect_issue_category(comment)
        risk_score = round(100 - satisfaction_score, 2)

        action_suggestion = generate_action_suggestion(
            sentiment=sentiment,
            issue_category=issue_category,
            risk_score=risk_score
        )

        return {
            "model_used": "BERT",
            "sentiment": sentiment,
            "confidence": confidence,
            "satisfaction_score": satisfaction_score,
            "issue_category": issue_category,
            "risk_score": risk_score,
            "action_suggestion": action_suggestion
        }

    if model is not None and vectorizer is not None:
        result = analyze_with_ml_model(comment)
        result["model_used"] = "TF-IDF + Logistic Regression"
        return result

    result = analyze_with_rules(comment)
    result["model_used"] = "Rule Based"
    return result


def analyze_with_ml_model(comment: str) -> dict:
    comment_vector = vectorizer.transform([comment])

    sentiment = model.predict(comment_vector)[0]

    probabilities = model.predict_proba(comment_vector)[0]
    confidence = max(probabilities)

    if sentiment == "pozitif":
        satisfaction_score = 70 + confidence * 30
    elif sentiment == "negatif":
        satisfaction_score = 40 - confidence * 30
    else:
        satisfaction_score = 50 + confidence * 10

    satisfaction_score = round(max(0, min(100, satisfaction_score)), 2)

    issue_category = detect_issue_category(comment)
    risk_score = round(100 - satisfaction_score, 2)

    action_suggestion = generate_action_suggestion(
        sentiment=sentiment,
        issue_category=issue_category,
        risk_score=risk_score
    )

    return {
        "sentiment": sentiment,
        "satisfaction_score": satisfaction_score,
        "issue_category": issue_category,
        "risk_score": risk_score,
        "action_suggestion": action_suggestion
    }


def analyze_with_rules(comment: str) -> dict:
    text = comment.lower()

    positive_words = ["güzel", "harika", "mükemmel", "temiz", "iyi", "memnun", "rahat", "lezzetli"]
    negative_words = ["kötü", "berbat", "kirli", "pis", "ilgisiz", "yavaş", "pahalı", "rezalet"]

    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)

    if positive_count > negative_count:
        sentiment = "pozitif"
        satisfaction_score = 85
    elif negative_count > positive_count:
        sentiment = "negatif"
        satisfaction_score = 30
    else:
        sentiment = "nötr"
        satisfaction_score = 60

    issue_category = detect_issue_category(comment)
    risk_score = 100 - satisfaction_score

    return {
        "sentiment": sentiment,
        "satisfaction_score": satisfaction_score,
        "issue_category": issue_category,
        "risk_score": risk_score,
        "action_suggestion": generate_action_suggestion(sentiment, issue_category, risk_score)
    }


def generate_action_suggestion(sentiment: str, issue_category: str, risk_score: float) -> str:
    if sentiment == "pozitif":
        return "Misafir memnuniyeti olumlu. Benzer hizmet kalitesi korunmalı."

    if issue_category == "temizlik":
        return "Kat hizmetleri ve oda temizlik süreçleri kontrol edilmeli."

    if issue_category == "resepsiyon":
        return "Resepsiyon personeli için iletişim ve misafir karşılama süreci gözden geçirilmeli."

    if issue_category == "oda":
        return "Oda konforu, teknik ekipmanlar ve ses yalıtımı kontrol edilmeli."

    if issue_category == "yemek":
        return "Kahvaltı, restoran kalitesi ve yemek servis süreci değerlendirilmelidir."

    if issue_category == "wifi":
        return "İnternet altyapısı ve oda bazlı Wi-Fi çekim gücü kontrol edilmelidir."

    if issue_category == "fiyat":
        return "Fiyat-performans algısı analiz edilmeli ve kampanya seçenekleri değerlendirilmeli."

    if risk_score >= 70:
        return "Bu yorum yüksek risklidir. Yönetici tarafından acil incelenmelidir."

    return "Yorum genel olarak incelenmeli ve hizmet kalitesi takip edilmelidir."