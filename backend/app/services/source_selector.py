"""
source_selector.py — SourceSelector Mimarisi
=============================================
Farklı veri kaynaklarını (SerpAPI, Booking, CSV, Manual) merkezi olarak
yöneten servis katmanı.

Yeni kaynak eklemek için SOURCE_REGISTRY'e yeni bir giriş yeterlidir;
başka hiçbir dosyaya dokunulmasına gerek yoktur.

Katman: Service
Bağımlılar: dashboard_routes.py, review_routes.py, external_sources_routes.py
"""

from typing import Optional, List, Dict, Any


# ─── Kaynak Tanımları ─────────────────────────────────────────────────────────

SOURCE_REGISTRY: Dict[str, Dict[str, Any]] = {
    "serpapi": {
        "label":       "Google Maps",
        "color":       "#8B5CF6",
        "icon":        "🌐",
        "description": "Google Maps yorumlarını SerpAPI aracılığıyla çeker",
        "enabled":     True,
    },
    "booking": {
        "label":       "Booking.com",
        "color":       "#003580",
        "icon":        "🏨",
        "description": "Booking.com yorum akışı (booking_reviews entegrasyonu)",
        "enabled":     False,   # Entegrasyon hazır, API anahtarı gerekiyor
    },
    "csv": {
        "label":       "CSV Yükle",
        "color":       "#06B6D4",
        "icon":        "📄",
        "description": "Kullanıcı tarafından yüklenen çok kaynaklı CSV dosyası",
        "enabled":     True,
    },
    "manual": {
        "label":       "Manuel Giriş",
        "color":       "#64748B",
        "icon":        "✏️",
        "description": "API veya form üzerinden doğrudan girilen yorumlar",
        "enabled":     True,
    },
}

# Aliaslar → standart kaynak kimliğine normalleştirme tablosu
_ALIAS_MAP: Dict[str, str] = {
    "google":        "serpapi",
    "google_maps":   "serpapi",
    "googlemaps":    "serpapi",
    "serpapi":       "serpapi",
    "booking":       "booking",
    "booking.com":   "booking",
    "bookingcom":    "booking",
    "csv":           "csv",
    "upload":        "csv",
    "file":          "csv",
    "manual":        "manual",
    "form":          "manual",
    "api":           "manual",
}


# ─── SourceSelector ───────────────────────────────────────────────────────────

class SourceSelector:
    """
    Merkezi kaynak seçici.

    Kullanım Örnekleri
    ------------------
    >>> SourceSelector.get_available_sources()
    [{"id": "serpapi", "label": "Google Maps", ...}, ...]

    >>> SourceSelector.normalize("google_maps")
    "serpapi"

    >>> SourceSelector.meta("csv")
    {"label": "CSV Yükle", "color": "#06B6D4", ...}
    """

    @staticmethod
    def get_available_sources() -> List[Dict[str, Any]]:
        """Etkin (enabled=True) kaynak listesini döndürür."""
        return [
            {"id": k, **v}
            for k, v in SOURCE_REGISTRY.items()
            if v.get("enabled", True)
        ]

    @staticmethod
    def get_all_sources() -> List[Dict[str, Any]]:
        """Devre dışı kaynaklar dahil tüm kaynakları döndürür."""
        return [{"id": k, **v} for k, v in SOURCE_REGISTRY.items()]

    @staticmethod
    def meta(source_id: str) -> Optional[Dict[str, Any]]:
        """Tek bir kaynağın meta bilgisini döndürür."""
        return SOURCE_REGISTRY.get(source_id)

    @staticmethod
    def normalize(raw_source: Optional[str]) -> str:
        """
        Ham kaynak etiketini standart kimliğe normalleştirir.

        Örnekler
        --------
        "google_maps" → "serpapi"
        None          → "manual"
        "Booking.COM" → "booking"
        """
        if not raw_source:
            return "manual"
        key = raw_source.strip().lower()
        return _ALIAS_MAP.get(key, key)

    @staticmethod
    def display_label(raw_source: Optional[str]) -> str:
        """Frontend'de gösterilecek insan dostu etiketi döndürür."""
        normalized = SourceSelector.normalize(raw_source)
        info = SOURCE_REGISTRY.get(normalized)
        return info["label"] if info else normalized.capitalize()
