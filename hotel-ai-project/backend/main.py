# ==============================
# IMPORTLAR
# ==============================
from fastapi import FastAPI
from sqlalchemy import text
from pydantic import BaseModel
from database.db import connect

# ==============================
# APP
# ==============================
app = FastAPI()

# ==============================
# MODEL (ÖNCE TANIMLANMALI)
# ==============================
class Review(BaseModel):
    hotel_id: int
    text: str

# ==============================
# NLP (SENTIMENT)
# ==============================
def analyze_sentiment(text_input):
    positive_words = ["good", "great", "clean", "nice", "perfect"]
    negative_words = ["bad", "dirty", "noisy", "terrible"]

    text_input = text_input.lower()

    for word in positive_words:
        if word in text_input:
            return "positive", 1

    for word in negative_words:
        if word in text_input:
            return "negative", 0

    return "neutral", 0

# ==============================
# ROUTES
# ==============================

# 🔹 Ana sayfa
@app.get("/")
def home():
    return {"message": "API çalışıyor 🚀"}

# 🔹 DB test
@app.get("/db-test")
def db_test():
    conn = connect()
    conn.close()
    return {"message": "DB bağlandı 🚀"}

# 🔹 Tüm yorumları getir
@app.get("/reviews")
def get_reviews():
    conn = connect()

    result = conn.execute(text("SELECT * FROM reviews"))
    reviews = [dict(row._mapping) for row in result]

    conn.close()
    return reviews

# 🔹 Yorum ekleme (POST)
@app.post("/add-review")
def add_review(review: Review):
    conn = connect()

    sentiment, score = analyze_sentiment(review.text)

    conn.execute(
        text("""
        INSERT INTO reviews (hotel_id, text, sentiment, score)
        VALUES (:hotel_id, :text, :sentiment, :score)
        """),
        {
            "hotel_id": review.hotel_id,
            "text": review.text,
            "sentiment": sentiment,
            "score": score
        }
    )

    conn.commit()
    conn.close()

    return {
        "message": "Yorum eklendi 🚀",
        "sentiment": sentiment,
        "score": score
    }

# 🔹 Dashboard (PRO LEVEL 🔥)
@app.get("/dashboard")
def dashboard():
    conn = connect()

    result = conn.execute(text("""
        SELECT 
            COUNT(*) as total_reviews,
            AVG(score) as avg_score,
            SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
            SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count
        FROM reviews
    """))

    data = dict(result.fetchone()._mapping)

    conn.close()
    return data