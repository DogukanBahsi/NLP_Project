"""
summarizer.py — Extractive NLP Özetleyici (SummaryService)
===========================================================
Harici API gerektirmez; istatistiksel + kural tabanlı çalışır.

Son 100 yorumu analiz ederek 5 maddelik bir özet üretir:
  1. Genel duygu eğilimi
  2. Öne çıkan sorun ya da güçlü yön
  3. Risk / skor yorumu
  4. Kategori profili (çeşitlilik analizi)
  5. Stratejik öneri

Katman: NLP / Service
Bağımlı: dashboard_routes.py → GET /dashboard/nlp-summary
"""

from collections import Counter
from typing import Optional


# ─── Kategori Etiketleri ─────────────────────────────────────────────────────

CATEGORY_TR = {
    "temizlik":  "temizlik",
    "oda":       "oda konforu",
    "yemek":     "yemek / restoran",
    "resepsiyon":"resepsiyon / personel",
    "wifi":      "internet / Wi-Fi",
    "fiyat":     "fiyat-performans",
    "genel":     "genel hizmet",
}

MAX_REVIEWS   = 100   # analiz edilecek maksimum yorum sayısı
HIGH_RISK_THR = 60    # risk_score eşiği (0-100 ölçeği)


# ─── Ana Fonksiyon ────────────────────────────────────────────────────────────

def generate_hotel_summary(reviews: list, hotel_name: str = "Otel") -> dict:
    """
    Son MAX_REVIEWS yorumdan 5 maddelik özet üretir.
    Girdi: SQLAlchemy Review model nesnelerinin listesi.
    """
    if not reviews:
        return {
            "hotel_name":       hotel_name,
            "total_analyzed":   0,
            "summary_bullets":  ["Analiz için yeterli yorum bulunamadı."],
            "top_complaint":    None,
            "top_praise":       None,
            "avg_score":        0,
            "high_risk_count":  0,
            "sentiment_snapshot": {"pozitif": 0, "negatif": 0, "nötr": 0},
        }

    # ── Son MAX_REVIEWS yorumu tarihe göre sırala ──────────────────────────────
    def _sort_key(r):
        dt = getattr(r, "review_date", None) or getattr(r, "created_at", None)
        return dt.isoformat() if dt else "0000"

    recent = sorted(reviews, key=_sort_key, reverse=True)[:MAX_REVIEWS]
    total  = len(recent)

    pos = [r for r in recent if getattr(r, "sentiment", None) == "pozitif"]
    neg = [r for r in recent if getattr(r, "sentiment", None) == "negatif"]
    neu = [r for r in recent if getattr(r, "sentiment", None) == "nötr"]

    pos_pct = round(len(pos) / total * 100) if total else 0
    neg_pct = round(len(neg) / total * 100) if total else 0

    neg_cats = [r.issue_category for r in neg if getattr(r, "issue_category", None)]
    pos_cats = [r.issue_category for r in pos if getattr(r, "issue_category", None)]
    all_cats = [r.issue_category for r in recent if getattr(r, "issue_category", None)]

    top_complaint = Counter(neg_cats).most_common(1)[0][0] if neg_cats else None
    top_praise    = Counter(pos_cats).most_common(1)[0][0] if pos_cats else None

    scores = [r.satisfaction_score for r in recent
              if getattr(r, "satisfaction_score", None) is not None]
    avg_score = round(sum(scores) / len(scores) / 10.0, 1) if scores else 0

    high_risk = [r for r in recent
                 if getattr(r, "risk_score", None) and r.risk_score > HIGH_RISK_THR]

    # ── Madde 1 — Genel duygu eğilimi ─────────────────────────────────────────
    if pos_pct >= 65:
        b1 = (
            f"Son {total} yorumun %{pos_pct}'i olumlu — misafir memnuniyeti "
            f"genel olarak yüksek seyrediyor."
        )
    elif neg_pct >= 50:
        b1 = (
            f"Son {total} yorumun %{neg_pct}'i olumsuz — otelin hizmet kalitesi "
            f"ciddi iyileştirme gerektiriyor."
        )
    else:
        b1 = (
            f"Son {total} yorumda karma bir memnuniyet tablosu görülüyor "
            f"(Olumlu %{pos_pct} / Olumsuz %{neg_pct})."
        )

    # ── Madde 2 — Öne çıkan sorun ya da güçlü yön ─────────────────────────────
    if top_complaint:
        readable = CATEGORY_TR.get(top_complaint, top_complaint)
        b2 = (
            f"En sık şikayet edilen alan '{readable}' — bu kategorideki "
            f"iyileştirmeler genel skoru belirgin biçimde yükseltebilir."
        )
    elif top_praise:
        readable = CATEGORY_TR.get(top_praise, top_praise)
        b2 = (
            f"Misafirler en çok '{readable}' konusundaki memnuniyetlerini "
            f"vurguluyor; bu güçlü yön pazarlamada ön plana çıkarılabilir."
        )
    else:
        b2 = "Belirgin bir kategori trendi tespit edilemedi; daha fazla veri birikimi önerilir."

    # ── Madde 3 — Risk / skor yorumu ──────────────────────────────────────────
    if len(high_risk) >= 3:
        b3 = (
            f"{len(high_risk)} yorum yüksek risk skoru taşıyor — bu yorumlar "
            f"itibar yönetimi açısından öncelikli ele alınmalı."
        )
    elif avg_score > 0:
        perf = "sektör ortalamasının üzerinde" if avg_score >= 7.0 else "gelişim alanı olan"
        b3 = (
            f"Genel memnuniyet skoru {avg_score}/10 ile {perf} bir konumda; "
            f"düzenli analiz takibi önerilir."
        )
    else:
        b3 = "Yeterli puan verisi henüz birikmemiş — skor takibi için daha fazla analiz gerekiyor."

    # ── Madde 4 — Kategori profili (çeşitlilik analizi) ───────────────────────
    if all_cats:
        cat_counts   = Counter(all_cats)
        unique_cats  = len(cat_counts)
        top_cat, top_cnt = cat_counts.most_common(1)[0]
        concentration = round(top_cnt / len(all_cats) * 100)

        if unique_cats <= 2:
            b4 = (
                f"Şikayetler yalnızca {unique_cats} kategoride yoğunlaşmış "
                f"(%{concentration} oranla '{CATEGORY_TR.get(top_cat,top_cat)}' başı çekiyor) — "
                f"odaklanmış bir iyileştirme paketi yüksek etki yaratır."
            )
        elif unique_cats >= 5:
            b4 = (
                f"Şikayetler {unique_cats} farklı kategoriye dağılmış — "
                f"bu tablo sistemsel bir hizmet kalitesi sorununa işaret ediyor; "
                f"çok departmanlı bir denetim planı gerekebilir."
            )
        else:
            b4 = (
                f"Yorumlar {unique_cats} kategoride dağılım gösteriyor; "
                f"'{CATEGORY_TR.get(top_cat,top_cat)}' %{concentration} ile öne çıkıyor. "
                f"Öncelik sırası bu dağılıma göre belirlenebilir."
            )
    else:
        b4 = "Kategori verisi yetersiz — yorumlara kategori etiketi atandıkça bu analiz zenginleşecek."

    # ── Madde 5 — Stratejik öneri ──────────────────────────────────────────────
    if neg_pct >= 60:
        b5 = (
            "Acil aksiyon: Olumsuz yorum oranı kritik eşiği aştı. "
            "Müşteri şikayetlerine 48 saat içinde yanıt verilmesi, "
            "kök neden analizi yapılması ve kamuya açık bir iyileştirme duyurusu yapılması önerilir."
        )
    elif len(high_risk) >= 5:
        b5 = (
            f"{len(high_risk)} yüksek riskli yorum platformlarda itibar kaybına yol açabilir. "
            "Yanıt ekibine öncelikli atama yapılması ve sosyal medya takibinin artırılması önerilir."
        )
    elif avg_score >= 8.0 and pos_pct >= 65:
        b5 = (
            "Güçlü konumu korumak için tutarlılık kritik. "
            "Başarılı misafir deneyimlerini teşvik programlarıyla pekiştirin, "
            "olumlu yorumları pazarlama kanallarında öne çıkarın."
        )
    elif avg_score > 0 and avg_score < 6.0:
        b5 = (
            f"Memnuniyet skoru ({avg_score}/10) hedefin altında. "
            "Kısa vadede öncelikli kategorilerde servis standardı yükseltilmeli; "
            "orta vadede personel eğitimi ve süreç revizyonu planlanmalıdır."
        )
    else:
        b5 = (
            "Düzenli analiz döngüsü sürdürülmeli: haftalık yorum takibi, "
            "aylık kategori raporlaması ve çeyreklik trend karşılaştırması ile "
            "veri odaklı karar alma kültürü pekiştirilebilir."
        )

    return {
        "hotel_name":      hotel_name,
        "total_analyzed":  total,
        "summary_bullets": [b1, b2, b3, b4, b5],
        "top_complaint":   top_complaint,
        "top_praise":      top_praise,
        "avg_score":       avg_score,
        "high_risk_count": len(high_risk),
        "sentiment_snapshot": {
            "pozitif": len(pos),
            "negatif": len(neg),
            "nötr":    len(neu),
        },
    }
