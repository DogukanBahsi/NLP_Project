import json
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, classification_report


DATA_PATH = "data/training_reviews.csv"
MODEL_PATH = "app/ml_models/sentiment_model.pkl"
VECTORIZER_PATH = "app/ml_models/tfidf_vectorizer.pkl"
METRICS_PATH = "app/ml_models/metrics.json"


def train_model():
    df = pd.read_csv(DATA_PATH)

    X = df["comment"]
    y = df["label"]

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=5000
    )

    X_vectorized = vectorizer.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_vectorized,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = LogisticRegression(
        max_iter=1000
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")

    report = classification_report(y_test, y_pred)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    metrics = {
        "model_name": "TF-IDF + Logistic Regression",
        "accuracy": round(accuracy, 3),
        "f1_score": round(f1, 3),
        "classification_report": report
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as file:
        json.dump(metrics, file, ensure_ascii=False, indent=4)

    print("Model başarıyla eğitildi.")
    print("Accuracy:", round(accuracy, 3))
    print("F1-score:", round(f1, 3))
    print(report)


if __name__ == "__main__":
    train_model()