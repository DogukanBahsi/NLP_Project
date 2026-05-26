import re
import os
import joblib
from app.nlp.bert_analyzer import analyze_with_bert
from app.nlp.category_detector import detect_issue_category

MODEL_PATH = "app/ml_models/sentiment_model.pkl"
VECTORIZER_PATH = "app/ml_models/tfidf_vectorizer.pkl"

model = None
vectorizer = None

# ── Türkçe Stopword Listesi ──────────────────────────────────────────────────
TURKISH_STOPWORDS = {
    "ve", "bir", "bu", "da", "de", "ile", "için", "mi", "mı", "mu", "mü",
    "ama", "fakat", "lakin", "çünkü", "ki", "ya", "ne", "veya", "hem",
    "ise", "bile", "dahi", "üstelik", "ayrıca", "yani", "ancak", "nasıl",
    "gibi", "kadar", "beri", "rağmen", "göre", "karşın", "diye", "olan",
    "şu", "o", "ben", "sen", "biz", "siz", "onlar", "bana", "sana",
    "var", "yok", "değil", "oldu", "olmuş", "olarak", "çok", "az", "en",
    "her", "hiç", "biraz", "oldukça", "gayet", "sadece", "artık",
    "zaten", "hatta", "maalesef", "neyse", "tabii", "evet", "hayır",
}

# ── Emoji Regex Deseni ───────────────────────────────────────────────────────
_EMOJI_RE = re.compile(
    "["
    u"\U0001F600-\U0001F64F"
    u"\U0001F300-\U0001F5FF"
    u"\U0001F680-\U0001F6FF"
    u"\U0001F1E0-\U0001F1FF"
    u"\U00002702-\U000027B0"
    u"\U000024C2-\U0001F251"
    u"\U0001F900-\U0001F9FF"
    u"\U00002600-\U000026FF"
    "]+",
    flags=re.UNICODE
)

# ── Türkçe Büyük/Küçük Harf Tablosu ─────────────────────────────────────────
_TR_UPPER_TO_LOWER = str.maketrans("İIĞÜŞÖÇ", "iığüşöç")


def normalize_turkish_case(text: str) -> str:
    """İ→i, I→ı gibi Türkçe özgü büyük harf dönüşümünü yapar."""
    return text.translate(_TR_UPPER_TO_LOWER).lower()


def preprocess_text(text: str) -> str:
    """
    Ham yorum metnini NLP için temizler:
    emoji → Türkçe lowercase → tekrarlanan harf → noktalama → stopword
    """
    if not text or not text.strip():
        return ""

    # 1. Emoji ve unicode sembol temizleme
    text = _EMOJI_RE.sub(" ", text)

    # 2. Türkçe karakter duyarlı lowercase (İ→i, I→ı)
    text = normalize_turkish_case(text)

    # 3. Tekrarlanan harfleri normalize et: "harikaaa" → "harikaa"
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)

    # 4. Noktalama ve özel karakterleri temizle (Türkçe harfler korunur)
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)

    # 5. Rakamları kaldır
    text = re.sub(r"\d+", " ", text)

    # 6. Stopword temizleme (2 karakterden kısa kelimeleri de at)
    words = [w for w in text.split() if w not in TURKISH_STOPWORDS and len(w) > 2]

    return " ".join(words).strip()


def load_model():
    global model, vectorizer
    if model is None and os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    if vectorizer is None and os.path.exists(VECTORIZER_PATH):
        vectorizer = joblib.load(VECTORIZER_PATH)


def _try_bert(comment: str):
    """
    BERTurk Singleton'ını çağırır.
    Model hazır değilse veya hata oluşursa None döner (ML fallback devreye girer).
    """
    try:
        from app.nlp.bert_analyzer import TurkishBertAnalyzer
        analyzer = TurkishBertAnalyzer()
        if not analyzer.is_ready:
            return None
        return analyzer.analyze(comment)
    except Exception:
        return None


def analyze_sentiment(comment: str, model_type: str = "hybrid", star_rating: int = None) -> dict:
    """
    Yorumu analiz eder. Öncelik zinciri:
      1. star_rating varsa → yıldız tabanlı (hız + güvenilirlik)
      2. BERTurk hazır ve confidence ≥ 0.60 → Türkçe fine-tuned BERT
      3. ML modeli (TF-IDF + Logistic Regression) → önişlenmiş metin
      4. Kural tabanlı fallback → ML model yüklenemezse
    """
    processed = preprocess_text(comment)

    if star_rating is not None:
        if star_rating >= 4:
            sentiment, stars = "pozitif", float(star_rating)
        elif star_rating <= 2:
            sentiment, stars = "negatif", float(star_rating)
        else:
            sentiment, stars = "nötr", float(star_rating)
        confidence = 1.0
        model_used = "star_rating"

    else:
        # 1. BERTurk dene (ham metin — BERT kendi tokenizer'ını kullanır)
        bert_result = _try_bert(comment)
        if bert_result is not None:
            sentiment  = bert_result["sentiment"]
            confidence = bert_result["confidence"]
            stars      = bert_result["stars"]
            model_used = "berturk"

        else:
            # 2. ML model fallback
            load_model()
            if model is not None and vectorizer is not None and processed:
                ml_result  = _analyze_with_ml_model(processed)
                sentiment  = ml_result["sentiment"]
                confidence = ml_result["confidence"]
                stars      = _sentiment_to_stars(sentiment, confidence)
                model_used = "tfidf_logreg"
            else:
                # 3. Kural tabanlı son çare
                rule_result = analyze_with_rules(processed or comment)
                sentiment   = rule_result["sentiment"]
                confidence  = 0.5
                stars       = _sentiment_to_stars(sentiment, confidence)
                model_used  = "rule_based"

    satisfaction_score = _compute_satisfaction(sentiment, stars, confidence)
    risk_score = round(100.0 - satisfaction_score, 2)
    issue_category = detect_issue_category(comment)

    action_suggestion = generate_action_suggestion(
        sentiment=sentiment,
        issue_category=issue_category,
        risk_score=risk_score
    )

    return {
        "model_used": model_used,
        "sentiment": sentiment,
        "confidence": round(confidence, 3),
        "satisfaction_score": satisfaction_score,
        "issue_category": issue_category,
        "risk_score": risk_score,
        "action_suggestion": action_suggestion,
        "stars": stars
    }


def _sentiment_to_stars(sentiment: str, confidence: float) -> float:
    """Duygu + güven skorundan tahmini yıldız üretir (1–5 arası)."""
    if sentiment == "pozitif":
        return round(3.5 + confidence * 1.5, 2)
    elif sentiment == "negatif":
        return round(2.5 - confidence * 1.5, 2)
    return 3.0


def _compute_satisfaction(sentiment: str, stars: float, confidence: float) -> float:
    """
    Memnuniyet skorunu 0–100 aralığında hesaplar.
    Hem sentiment/güven hem yıldız skorunu ağırlıklı ortalamada kullanır.
    """
    if sentiment == "pozitif":
        base = 60.0 + (confidence * 30.0)
    elif sentiment == "negatif":
        base = 40.0 - (confidence * 30.0)
    else:
        base = 45.0 + (confidence * 10.0)

    star_based = (stars - 1.0) * 20.0 if stars else base
    blended = (base * 0.6) + (star_based * 0.4)

    return round(max(0.0, min(100.0, blended)), 2)


def _analyze_with_ml_model(processed_comment: str) -> dict:
    """TF-IDF vektörize edilmiş metin üzerinde Logistic Regression çalıştırır."""
    comment_vector = vectorizer.transform([processed_comment])
    sentiment = model.predict(comment_vector)[0]
    probabilities = model.predict_proba(comment_vector)[0]
    confidence = float(max(probabilities))
    return {"sentiment": sentiment, "confidence": confidence}


def analyze_with_ml_model(comment: str) -> dict:
    """Dışarıdan çağrılabilen public ML analiz fonksiyonu."""
    load_model()
    processed = preprocess_text(comment)
    if not processed:
        return analyze_with_rules(comment)
    result = _analyze_with_ml_model(processed)
    sentiment = result["sentiment"]
    confidence = result["confidence"]
    stars = _sentiment_to_stars(sentiment, confidence)
    satisfaction_score = _compute_satisfaction(sentiment, stars, confidence)
    issue_category = detect_issue_category(comment)
    risk_score = round(100.0 - satisfaction_score, 2)
    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "satisfaction_score": satisfaction_score,
        "issue_category": issue_category,
        "risk_score": risk_score,
        "action_suggestion": generate_action_suggestion(sentiment, issue_category, risk_score)
    }


def analyze_with_rules(text: str) -> dict:
    """Kural tabanlı fallback: Türkçe pozitif/negatif kelime sayımı."""
    positive_words = [
        "güzel", "harika", "mükemmel", "temiz", "iyi", "memnun", "rahat",
        "lezzetli", "şahane", "muhteşem", "tatmin", "başarılı", "kaliteli",
        "konforlu", "ferah", "nezih", "ideal", "kusursuz", "beğen", "süper",
        "enfes", "sevdim", "tavsiye", "tekrar", "beğendim", "memnuniyetle",
    ]
    negative_words = [
        "kötü", "berbat", "kirli", "pis", "ilgisiz", "yavaş", "pahalı",
        "rezalet", "korkunç", "iğrenç", "sorunlu", "bozuk", "gürültülü",
        "yetersiz", "hayal kırıklığı", "şikayet", "problem", "hata", "eksik",
        "berbattı", "beğenmedim", "tavsiye etmem", "bir daha gelmem",
    ]
    pos = sum(1 for w in positive_words if w in text)
    neg = sum(1 for w in negative_words if w in text)

    if pos > neg:
        return {"sentiment": "pozitif"}
    elif neg > pos:
        return {"sentiment": "negatif"}
    return {"sentiment": "nötr"}


def generate_action_suggestion(sentiment: str, issue_category: str, risk_score: float) -> str:
    if sentiment == "pozitif":
        return "Misafir memnuniyeti olumlu. Benzer hizmet kalitesi korunmalı."

    suggestions = {
        "temizlik": "Kat hizmetleri ve oda temizlik süreçleri kontrol edilmeli.",
        "resepsiyon": "Resepsiyon personeli için iletişim ve misafir karşılama süreci gözden geçirilmeli.",
        "oda": "Oda konforu, teknik ekipmanlar ve ses yalıtımı kontrol edilmeli.",
        "yemek": "Kahvaltı, restoran kalitesi ve yemek servis süreci değerlendirilmelidir.",
        "wifi": "İnternet altyapısı ve oda bazlı Wi-Fi çekim gücü kontrol edilmelidir.",
        "fiyat": "Fiyat-performans algısı analiz edilmeli ve kampanya seçenekleri değerlendirilmeli.",
        "personel": "Personel eğitimi ve misafir iletişim protokolleri gözden geçirilmeli.",
        "konum": "Ulaşım bilgilendirmesi ve transfer hizmetleri iyileştirilmeli.",
        "gürültü": "Ses yalıtımı kontrol edilmeli, gürültü kaynaklarına karşı önlem alınmalı.",
        "havuz": "Havuz temizliği, güvenliği ve kullanım saatleri gözden geçirilmeli.",
        "spa": "Spa ve masaj hizmetleri kalitesi ile randevu süreci değerlendirilmeli.",
        "plaj": "Plaj temizliği ve misafir hizmetleri gözden geçirilmeli.",
        "otopark": "Otopark kapasitesi ve güvenlik önlemleri kontrol edilmeli.",
        "güvenlik": "Güvenlik protokolleri ve personel müdahale süreçleri incelenmeli.",
        "çocuk": "Çocuk aktiviteleri, güvenlik önlemleri ve aile hizmetleri değerlendirilmeli.",
    }

    base = suggestions.get(issue_category, "Yorum genel olarak incelenmeli ve hizmet kalitesi takip edilmelidir.")

    if risk_score >= 70:
        return f"ACİL: {base} Yönetici tarafından öncelikli incelenmeli."

    return base
