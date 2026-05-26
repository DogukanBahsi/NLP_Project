import threading
from transformers import pipeline as hf_pipeline

MODEL_NAME = "savasy/bert-base-turkish-sentiment-cased"


class TurkishBertAnalyzer:
    """
    Thread-safe Singleton. Uygulama boyunca model RAM'e bir kez yüklenir.
    lifespan event'inden initialize() çağrılarak ısındırılır.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = super().__new__(cls)
                    instance._pipeline = None
                    instance._ready = False
                    cls._instance = instance
        return cls._instance

    def initialize(self):
        """Modeli RAM'e yükler. Zaten yüklendiyse tekrar çalışmaz."""
        if self._ready:
            return
        print(f"BERTurk yükleniyor: {MODEL_NAME} ...")
        self._pipeline = hf_pipeline(
            "text-classification",
            model=MODEL_NAME,
            tokenizer=MODEL_NAME,
            truncation=True,
            max_length=512,
        )
        self._ready = True
        print("BERTurk basariyla yuklendi.")

    @property
    def is_ready(self) -> bool:
        return self._ready

    def analyze(self, text: str) -> dict:
        """
        Metni analiz eder. positive/negative binary çıktısını Türkçe etikete
        ve güven skoruna dönüştürür. Güven < 0.60 ise nötr kabul edilir.
        """
        if not self._ready or self._pipeline is None:
            raise RuntimeError("BERTurk henüz hazır değil")

        result = self._pipeline(text[:512])[0]
        label = result["label"].lower()       # "positive" | "negative"
        confidence = round(float(result["score"]), 3)

        if label == "positive":
            sentiment = "pozitif" if confidence >= 0.60 else "nötr"
        else:
            sentiment = "negatif" if confidence >= 0.60 else "nötr"

        stars = _label_to_stars(sentiment, confidence)
        return {"sentiment": sentiment, "confidence": confidence, "stars": stars}


def _label_to_stars(sentiment: str, confidence: float) -> float:
    if sentiment == "pozitif":
        return round(3.5 + confidence * 1.5, 2)
    elif sentiment == "negatif":
        return round(2.5 - confidence * 1.5, 2)
    return 3.0


# ── Geriye dönük uyumluluk için eski serbest fonksiyon arayüzü ───────────────
def analyze_with_bert(comment: str) -> dict:
    analyzer = TurkishBertAnalyzer()
    if not analyzer.is_ready:
        raise RuntimeError("BERTurk yüklenmedi — lifespan henüz çalışmadı")
    return analyzer.analyze(comment)
