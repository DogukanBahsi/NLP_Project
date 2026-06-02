"""
serpapi_service.py — SerpAPI veri çekme servisi  (v5)
======================================================
3 kademeli arama + konum farkındalığı + çok dilli yorum desteği

Düzeltmeler (v5):
  - _clean_for_maps(): Frontend'den gelen "Turkey"/"Türkiye" suffix temizlenir
    → google_maps engine'e temiz isim gider, organik fallback için orijinal kalır
  - _LOCATION_COORDS genişletildi: D Maris, Rixos, Hillside, Maxx Royal, vb.
    otel markası isimleri de artık koordinat eşleştirmesi yapar
  - _coords_for artık temizlenmiş query üzerinde çalışır

Düzeltmeler (v4):
  - Şehir/bölge bazlı koordinat tablosu eklendi (İstanbul, Hisarönü, Marmaris vb.)
  - get_google_maps_reviews'dan hl=tr kaldırıldı → tüm dillerdeki yorumlar gelir
  - Review metin çıkarımı genişletildi: snippet → extracted_snippet → text → response
  - data_id=None kontrolü eklendi
  - sort_by=qualityScore ile metin içeren yorumlar önce gelir
"""

import os
import re
import json
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

# ─── Yapılandırma ─────────────────────────────────────────────────────────────
SERPAPI_KEY      = os.getenv("SERPAPI_KEY",
                              "87cfc73249d31c6bd49f954179f61ff60d921ea21c99f60add4a06d302aa2a26")
SERPAPI_DEBUG    = os.getenv("SERPAPI_DEBUG", "true").lower() == "true"
SERPAPI_BASE_URL = "https://serpapi.com/search.json"

# ─── Şehir/Bölge → Koordinat Tablosu ─────────────────────────────────────────
# google_maps engine'i haritayı bu koordinata ortalar; doğruluk büyük ölçüde artar
# Hem şehir isimleri hem otel marka isimleri eşleştirilebilir.
_LOCATION_COORDS: dict[str, str] = {
    # ── Büyük şehirler ──────────────────────────────────────────────────
    "istanbul":     "@41.01,28.98,12z",
    "ankara":       "@39.93,32.86,12z",
    "izmir":        "@38.42,27.14,12z",
    "antalya":      "@36.89,30.70,12z",
    "trabzon":      "@41.00,39.72,12z",
    "bursa":        "@40.19,29.06,12z",
    "mugla":        "@37.22,28.36,11z",
    "muğla":        "@37.22,28.36,11z",
    # ── Tatil bölgeleri ─────────────────────────────────────────────────
    "marmaris":     "@36.85,28.27,13z",
    "hisaronu":     "@36.82,28.13,13z",
    "hisarönü":     "@36.82,28.13,13z",
    "datca":        "@36.73,27.69,12z",
    "datça":        "@36.73,27.69,12z",
    "fethiye":      "@36.62,29.11,12z",
    "oludeniz":     "@36.55,29.12,13z",
    "ölüdeniz":     "@36.55,29.12,13z",
    "bodrum":       "@37.03,27.43,12z",
    "kusadasi":     "@37.86,27.26,12z",
    "kuşadası":     "@37.86,27.26,12z",
    "alanya":       "@36.54,32.00,12z",
    "side":         "@36.77,31.39,13z",
    "belek":        "@36.86,31.06,12z",
    "kemer":        "@36.60,30.56,12z",
    "pamukkale":    "@37.92,29.12,12z",
    "kapadokya":    "@38.67,34.83,11z",
    "cappadocia":   "@38.67,34.83,11z",
    # ── Otel marka / özel isimler ────────────────────────────────────────
    # D-Hotel grubu
    "d maris":      "@36.82,28.13,13z",   # D Maris Bay → Hisarönü/Marmaris
    "dmaris":       "@36.82,28.13,13z",
    "d resort":     "@36.89,30.70,12z",   # D Resort → Antalya civarı
    "d hotel":      "@36.89,30.70,12z",
    # İstanbul otelleri
    "bosphorus":    "@41.01,28.98,12z",
    "bogazici":     "@41.01,28.98,12z",
    "swissotel":    "@41.01,28.98,12z",
    "princess":     "@40.87,29.38,13z",
    "hilton istanbul": "@41.01,28.98,12z",
    "four seasons istanbul": "@41.01,28.98,12z",
    # Antalya/Belek otelleri
    "rixos":        "@36.89,30.70,12z",
    "regnum":       "@36.86,31.06,12z",
    "gloria":       "@36.86,31.06,12z",
    "cornelia":     "@36.86,31.06,12z",
    "maxx royal":   "@36.86,31.06,12z",
    "maxxroyal":    "@36.86,31.06,12z",
    "titanic":      "@36.89,30.70,12z",
    "calista":      "@36.86,31.06,12z",
    "voyage":       "@36.86,31.06,12z",
    "ela":          "@36.86,31.06,12z",
    "papillon":     "@36.89,30.70,12z",
    "spice":        "@36.89,30.70,12z",
    # Fethiye/Ölüdeniz otelleri
    "hillside":     "@36.62,29.11,12z",
    "club med":     "@36.55,29.12,13z",
    "lykia":        "@36.62,29.11,12z",
    # Bodrum otelleri
    "kempinski":    "@37.03,27.43,12z",
    "mandarin":     "@37.03,27.43,12z",
    "edition bodrum": "@37.03,27.43,12z",
}
# Türkiye genel merkezi (hiçbir şehir/marka eşleşmezse)
_TURKEY_LL = "@39.0,35.0,7z"

# ─── Frontend'den gelen lokasyon suffix'lerini temizler ───────────────────────
# api.js `${query} Turkey` ekler; Maps araması için bu suffix gereksiz ve kafa karıştırıcı
_SUFFIX_RE = re.compile(
    r"\s+(turkey|t[uü]rkiye)\s*$",
    re.IGNORECASE,
)

logger = logging.getLogger("serpapi_service")
logging.basicConfig(level=logging.DEBUG)


# ═════════════════════════════════════════════════════════════════════════════
# YARDIMCI FONKSİYONLAR
# ═════════════════════════════════════════════════════════════════════════════

def _clean_for_maps(query: str) -> str:
    """
    Frontend'in eklediği 'Turkey', 'Türkiye' gibi suffix'leri temizler.
    Google Maps engine'e sadece otel/lokasyon adı gitmeli; gl/ll zaten Türkiye'yi belirtir.

    Örnekler:
        "D Maris Turkey"           → "D Maris"
        "Swissotel Istanbul Turkey"→ "Swissotel Istanbul"
        "Belek hotel Turkey"       → "Belek"
    """
    cleaned = _SUFFIX_RE.sub("", query).strip()
    if cleaned != query:
        print(f"[SERPAPI] Query temizlendi: {query!r} -> {cleaned!r}", flush=True)
    return cleaned


def _coords_for(query: str) -> str:
    """
    Query içinde bilinen şehir/bölge/marka adı varsa o koordinatı döndürür.
    Bulamazsa Türkiye genel merkezini kullanır.
    Önce uzun keyword'leri kontrol eder (kısa eşleşme false-positive riskini azaltır).
    """
    q = query.lower()
    # Uzundan kısaya sırala → "d maris" önce eşleşsin, sadece "d" değil
    sorted_coords = sorted(_LOCATION_COORDS.items(), key=lambda x: len(x[0]), reverse=True)
    for keyword, ll in sorted_coords:
        if keyword in q:
            print(f"[SERPAPI] Konum eslesti: '{keyword}' -> ll={ll}", flush=True)
            return ll
    print(f"[SERPAPI] Konum eslesmedi -> varsayilan ll={_TURKEY_LL}", flush=True)
    return _TURKEY_LL


def _extract_text(item: dict) -> str | None:
    """
    SerpAPI review objesinden yorum metnini çıkarır.
    Sırasıyla: snippet → extracted_snippet.original → text → response → None
    """
    text = (
        item.get("snippet")
        or (item.get("extracted_snippet") or {}).get("original")
        or item.get("text")
        or item.get("response")          # bazı API sürümlerinde
        or item.get("review_text")
    )
    if isinstance(text, str):
        cleaned = text.strip()
        return cleaned if cleaned else None
    return None


def _dump(label: str, data: dict) -> None:
    """Debug modunda ilk 4000 karakteri basar (ASCII-safe, Windows CP1254 uyumlu)."""
    if not SERPAPI_DEBUG:
        return
    preview = json.dumps(data, ensure_ascii=True, indent=2)   # ASCII-safe for Windows terminal
    preview = preview[:4000] + ("\n...[TRUNCATED]" if len(preview) > 4000 else "")
    sep = "=" * 60
    print(f"\n{sep}\n[DEBUG] {label}\n{sep}\n{preview}\n{sep}\n", flush=True)


def _request(params: dict) -> dict | None:
    """HTTP GET atar, hata durumunda None döner."""
    try:
        resp = requests.get(SERPAPI_BASE_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.Timeout:
        print("[SERPAPI ERROR] Timeout (15s)", flush=True)
        return None
    except Exception as exc:
        print(f"[SERPAPI ERROR] {exc}", flush=True)
        return None

    if "error" in data:
        print(f"[SERPAPI ERROR] API: {data['error']}", flush=True)
        return None
    if data.get("search_metadata", {}).get("status") == "Error":
        print(f"[SERPAPI ERROR] Metadata: {data.get('search_metadata')}", flush=True)
        return None
    return data


def _parse_maps(data: dict) -> list:
    """
    google_maps yanitindan otel listesi uretir.

    SerpAPI plan farkliliklari:
    - Ucretli plan  : local_results / places  (liste, çoklu sonuç)
    - Ucretsiz plan : place_results            (tek sonuç, dict)
    """
    raw = data.get("local_results") or data.get("places") or []

    # Free Plan fallback: place_results tek bir dict olarak gelir
    if not raw:
        pr = data.get("place_results") or {}
        if pr.get("title"):
            raw = [pr]
            print("[SERPAPI] place_results (Free Plan tek sonuc) kullanildi", flush=True)

    print(
        f"[SERPAPI] local_results:{len(data.get('local_results') or []):>3}  "
        f"places:{len(data.get('places') or []):>3}  "
        f"place_results:{1 if data.get('place_results', {}).get('title') else 0:>3}  "
        f"secilen:{len(raw):>3}",
        flush=True,
    )
    results = []
    for item in raw:
        if not item.get("title"):
            continue
        gps = item.get("gps_coordinates") or {}
        results.append({
            "title":     item["title"],
            "place_id":  item.get("place_id"),
            "data_id":   item.get("data_id"),
            "rating":    item.get("rating"),
            "reviews":   item.get("reviews"),
            "address":   item.get("address"),
            "latitude":  gps.get("latitude"),
            "longitude": gps.get("longitude"),
        })
    return results


# Otel tipini belirten yaygın kelimeler — brand aramasında bunlar kaldırılır
_HOTEL_TYPE_RE = re.compile(
    r'\b(bay|resort|otel|inn|palace|spa|beach|suites|villa|boutique|thermal|club|'
    r'lodge|hotel|hotels|motel|hostel|riad|ryokan)\b',
    re.IGNORECASE,
)


def _brand_query(q: str) -> str:
    """
    'D Maris Bay'    -> 'D Maris'
    'Rixos Premium Belek' -> 'Rixos Premium Belek'  (tip kelimesi yok)
    'Hillside Beach Club' -> 'Hillside Club'
    """
    stripped = _HOTEL_TYPE_RE.sub("", q).strip()
    stripped = re.sub(r"\s{2,}", " ", stripped).strip()
    return stripped if len(stripped) >= 3 else q


def _parse_organic(data: dict) -> list:
    """
    google organik sonuçlardan otel benzeri girdileri filtreler.
    ⚠ data_id=None → bu sonuçlar için yorum çekilemez.
    """
    organic = data.get("organic_results", [])
    print(f"[SERPAPI] organic_results: {len(organic)}", flush=True)
    kw = {"hotel", "resort", "otel", "bay", "palace", "spa", "beach",
          "inn", "suites", "villa", "boutique", "thermal"}
    results = []
    for item in organic[:8]:
        combined = (item.get("title", "") + " " + item.get("snippet", "")).lower()
        if any(k in combined for k in kw):
            results.append({
                "title":    item.get("title"),
                "place_id": None,
                "data_id":  None,
                "rating":   None,
                "reviews":  None,
                "address":  item.get("snippet", "")[:120],
                "_organic": True,
            })
    return results


# ═════════════════════════════════════════════════════════════════════════════
# ANA ARAMA — 3 kademeli strateji
# ═════════════════════════════════════════════════════════════════════════════

def search_google_maps_hotels(query: str) -> list:
    """
    S1: google_maps + temizlenmiş query + konum farkındalıklı ll koordinatı
    S2: google_maps + temizlenmiş query + "Türkiye" eki (koordinatsız)
    S3: google organik fallback (data_id yok, yalnızca listeleme)

    v5 değişikliği: Frontend'in eklediği 'Turkey' suffix'i Maps araması için
    temizlenir — google_maps engine gl=tr ve ll koordinatıyla Türkiye'yi zaten bilir.
    """
    print(f"\n{'='*55}", flush=True)
    print(f"[SERPAPI] Ham sorgu    : {query!r}", flush=True)

    # Frontend'den gelen "Turkey" / "Türkiye" suffix'ini temizle
    maps_q = _clean_for_maps(query)
    print(f"[SERPAPI] Maps sorgusu: {maps_q!r}", flush=True)

    ll = _coords_for(maps_q)
    print(f"{'='*55}", flush=True)

    # ── S1: google_maps + konum koordinatı ───────────────────────────────────
    print(f"[SERPAPI] S1: google_maps + ll={ll}", flush=True)
    data = _request({
        "engine":  "google_maps",
        "q":       maps_q,
        "type":    "search",
        "ll":      ll,
        "hl":      "tr",
        "gl":      "tr",
        "api_key": SERPAPI_KEY,
    })
    if data:
        _dump("S1 -- google_maps + ll", data)
        results = _parse_maps(data)
        if results:
            print(f"[SERPAPI] OK S1: {len(results)} otel", flush=True)

            # ── S1b: Free Plan tek sonuc verdiyse brand aramasiyla more results dene ─
            if len(results) == 1:
                brand_q = _brand_query(maps_q)
                if brand_q != maps_q:
                    print(f"[SERPAPI] S1b: brand arama -> {brand_q!r}", flush=True)
                    b_data = _request({
                        "engine":  "google_maps",
                        "q":       brand_q,
                        "type":    "search",
                        "ll":      ll,
                        "hl":      "tr",
                        "gl":      "tr",
                        "api_key": SERPAPI_KEY,
                    })
                    if b_data:
                        b_results = _parse_maps(b_data)
                        existing_ids = {r["data_id"] for r in results if r.get("data_id")}
                        for r in b_results:
                            if r.get("data_id") and r["data_id"] not in existing_ids:
                                results.append(r)
                                existing_ids.add(r["data_id"])
                        if len(results) > 1:
                            print(f"[SERPAPI] S1b: {len(results)-1} ek otel eklendi", flush=True)
            # ──────────────────────────────────────────────────────────────────────

            print(f"[SERPAPI] Toplam S1: {len(results)} otel\n", flush=True)
            return results
        print("[SERPAPI] FAIL S1: bos", flush=True)

    # ── S2: google_maps koordinatsız + "Türkiye" eki ──────────────────────────
    eq = f"{maps_q} Turkiye"
    print(f"[SERPAPI] S2: google_maps koordinatsiz -> {eq!r}", flush=True)
    data = _request({
        "engine":  "google_maps",
        "q":       eq,
        "type":    "search",
        "hl":      "tr",
        "gl":      "tr",
        "api_key": SERPAPI_KEY,
    })
    if data:
        _dump("S2 -- google_maps koordinatsiz", data)
        results = _parse_maps(data)
        if results:
            print(f"[SERPAPI] OK S2: {len(results)} otel\n", flush=True)
            return results
        print("[SERPAPI] FAIL S2: bos", flush=True)

    # ── S3: Google organik fallback (data_id=None, yorum çekilemez) ──────────
    oq = f"{maps_q} hotel Turkey"
    print(f"[SERPAPI] S3: organik -> {oq!r}  (data_id olmaz)", flush=True)
    data = _request({
        "engine":  "google",
        "q":       oq,
        "hl":      "tr",
        "gl":      "tr",
        "num":     "10",
        "api_key": SERPAPI_KEY,
    })
    if data:
        _dump("S3 -- google organik", data)
        results = _parse_organic(data)
        if results:
            print(f"[SERPAPI] OK S3: {len(results)} organik sonuc (yorum cekilemez)\n", flush=True)
            return results

    print(f"[SERPAPI] FAIL: 3 strateji de basarisiz\n", flush=True)
    return []


# ═════════════════════════════════════════════════════════════════════════════
# DIS PLATFORM PUANLARI
# ═════════════════════════════════════════════════════════════════════════════

# Tanınan platform domain → (platform_key, default_max_rating)
_PLATFORM_DOMAINS: dict[str, tuple[str, float]] = {
    "tripadvisor.com":   ("tripadvisor", 5.0),
    "tripadvisor.com.tr":("tripadvisor", 5.0),
    "booking.com":       ("booking",    10.0),
    "hotels.com":        ("hotels_com", 10.0),
    "expedia.com":       ("expedia",    10.0),
    "agoda.com":         ("agoda",      10.0),
    "zenhotels.com":     ("zenhotels",  10.0),
}


def get_platform_ratings(hotel_name: str) -> dict:
    """
    Google organik arama → rich_snippet.detected_extensions ile platform puanlarini ceker.

    Doner: {
        "tripadvisor": {"rating": 4.7, "max_rating": 5.0, "review_count": 1550, "url": "..."},
        "booking":     {"rating": 9.4, "max_rating": 10.0, "review_count": 165,  "url": "..."},
        ...
    }
    """
    print(f"\n[SERPAPI] Platform puanlari aranıyor: {hotel_name!r}", flush=True)

    data = _request({
        "engine":  "google",
        "q":       f"{hotel_name} reviews booking tripadvisor",
        "hl":      "en",
        "gl":      "tr",
        "num":     "10",
        "api_key": SERPAPI_KEY,
    })
    if not data:
        print("[SERPAPI] Platform puani: API yaniti yok", flush=True)
        return {}

    results: dict = {}

    for item in data.get("organic_results", []):
        link = (item.get("link") or "").lower()

        for domain, (platform, default_max) in _PLATFORM_DOMAINS.items():
            if domain not in link:
                continue
            if platform in results:     # zaten bulduk, atla
                continue

            # rich_snippet.top veya .bottom altındaki detected_extensions
            rs  = item.get("rich_snippet") or {}
            ext = (
                (rs.get("top")    or {}).get("detected_extensions")
                or (rs.get("bottom") or {}).get("detected_extensions")
                or {}
            )

            raw_rating = ext.get("rating")
            raw_count  = ext.get("reviews")

            # Snippet'ten yedek rating çekme (regex)
            if raw_rating is None:
                snippet = (item.get("snippet") or "") + " " + (item.get("title") or "")
                m = re.search(r'\b(\d+[.,]\d+)\s*/\s*(5|10)\b', snippet)
                if m:
                    raw_rating   = float(m.group(1).replace(",", "."))
                    default_max  = float(m.group(2))
                else:
                    m2 = re.search(r'average\s+rating\s+of\s+(\d+[.,]\d+)', snippet, re.IGNORECASE)
                    if m2:
                        raw_rating = float(m2.group(1).replace(",", "."))

            if raw_rating is None:
                continue

            # Mantık kontrolü: TripAdvisor 0-5, diğerleri 0-10
            max_r = default_max
            if platform == "tripadvisor" and raw_rating > 5:
                continue    # yanlış parse, atla
            if platform != "tripadvisor" and raw_rating <= 5:
                continue    # muhtemelen 5 üzerinden, 10'luk değil

            results[platform] = {
                "rating":       round(float(raw_rating), 1),
                "max_rating":   max_r,
                "review_count": int(raw_count) if raw_count else None,
                "url":          item.get("link"),
            }
            print(
                f"[SERPAPI] Platform bulundu: {platform} = "
                f"{raw_rating}/{max_r} ({raw_count} yorum)",
                flush=True,
            )

    print(f"[SERPAPI] Toplam {len(results)} platform bulundu: {list(results.keys())}\n", flush=True)
    return results


# ═════════════════════════════════════════════════════════════════════════════
# YORUM ÇEKME
# ═════════════════════════════════════════════════════════════════════════════

def get_google_maps_reviews(data_id: str, max_reviews: int = 100) -> list:
    """
    Google Maps yorumlarını data_id ile çeker.

    Önemli değişiklikler (v4):
    - hl parametresi kaldırıldı → İngilizce/Türkçe/diğer tüm yorumlar gelir
    - sort_by=qualityScore → metin içeren yorumlar önce sıralanır
    - _extract_text() ile snippet/extracted_snippet/text fallback zinciri
    """
    # Geçersiz data_id kontrolü
    invalid = {None, "", "null", "None", "undefined"}
    if data_id in invalid:
        print(f"[SERPAPI ERROR] data_id gecersiz: {data_id!r} -- yorum cekme iptal", flush=True)
        return []

    all_reviews     = []
    next_page_token = None
    page_num        = 0

    print(f"\n[SERPAPI] Yorum cekme -> data_id={data_id!r}", flush=True)

    while len(all_reviews) < max_reviews:
        page_num += 1
        params = {
            "engine":   "google_maps_reviews",
            "data_id":  data_id,
            "sort_by":  "qualityScore",   # metin içeren yorumlar önce
            "api_key":  SERPAPI_KEY,
            # hl YOK → tüm dillerdeki yorumlar döner (kritik düzeltme)
        }
        if next_page_token:
            params["next_page_token"] = next_page_token

        print(f"[SERPAPI] Sayfa {page_num} isteniyor...", flush=True)
        data = _request(params)

        if data is None:
            print(f"[SERPAPI] FAIL Sayfa {page_num}", flush=True)
            break

        if SERPAPI_DEBUG and page_num == 1:
            _dump("Yorum yaniti (sayfa 1)", data)

        reviews = data.get("reviews", [])
        print(f"[SERPAPI] Sayfa {page_num}: {len(reviews)} yorum geldi", flush=True)

        if not reviews:
            print(f"[SERPAPI] Sayfa {page_num} bos -- bitti", flush=True)
            break

        skipped = 0
        for item in reviews:
            text = _extract_text(item)
            if not text:
                skipped += 1
                continue
            all_reviews.append({
                "reviewer_name": (item.get("user") or {}).get("name"),
                "rating":        item.get("rating"),
                "comment":       text,
                "date":          item.get("date"),
            })
            if len(all_reviews) >= max_reviews:
                break

        if skipped:
            print(f"[SERPAPI] Sayfa {page_num}: {skipped} yorum metin icermiyor (atlandi)", flush=True)

        pagination      = data.get("serpapi_pagination", {})
        next_page_token = (
            pagination.get("next_page_token")
            or pagination.get("next_page")
            or pagination.get("next")
        )
        if not next_page_token:
            break

    print(f"[SERPAPI] OK Toplam {len(all_reviews)} yorum\n", flush=True)
    return all_reviews
