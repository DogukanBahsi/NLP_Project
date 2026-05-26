"""
Şikayet kategorisi + yoğunluğa göre kurumsal aksiyon önerileri üretir.
dashboard_routes.py ve report_routes.py tarafından ortak kullanılır.
"""

_CATALOG = {
    "temizlik": {
        "title": "Temizlik ve Hijyen Standartları Güçlendirilmeli",
        "description": "Kat hizmetleri protokolü yeniden değerlendirilmeli; oda teslim öncesi kontrol listesi uygulamaya alınmalı.",
        "steps": [
            "Tüm oda temizlik süreçleri için günlük süpervizör denetim formu oluşturulmalı.",
            "Kat hizmetleri ekibine hijyen standartları güncelleme eğitimi verilmeli.",
            "Şikayet alınan odalar anlık olarak birim yöneticisine bildirilmeli.",
        ],
        "department": "Kat Hizmetleri Müdürlüğü",
        "timeframe_high": "7 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "resepsiyon": {
        "title": "Resepsiyon Hizmet Kalitesi İyileştirilmeli",
        "description": "Check-in/check-out süreçleri optimize edilmeli; misafir karşılama protokolü yeniden yapılandırılmalı.",
        "steps": [
            "Resepsiyon personeli için misafir iletişimi ve çatışma yönetimi eğitimi planlanmalı.",
            "Giriş/çıkış sürelerini kısaltacak operasyonel revizyon yapılmalı.",
            "Şikayet yönetimi prosedürü ekiple birlikte gözden geçirilmeli.",
        ],
        "department": "Ön Büro Müdürlüğü",
        "timeframe_high": "7 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "oda": {
        "title": "Oda Konforu ve Teknik Altyapı Denetlenmeli",
        "description": "Oda ekipmanları, klima sistemleri ve ses yalıtımı teknik ekip tarafından kapsamlı biçimde denetlenmeli.",
        "steps": [
            "Tüm odaların teknik ekipman envanteri çıkarılmalı; arızalı cihazlar öncelikli yenilenmeli.",
            "Ses yalıtımı yetersiz odalar için kısa vadeli çözümler uygulanmalı.",
            "Klima, banyo ve aydınlatma sistemleri için periyodik bakım takvimi oluşturulmalı.",
        ],
        "department": "Teknik Servis ve Oda Müdürlüğü",
        "timeframe_high": "14 gün içinde",
        "timeframe_normal": "45 gün içinde",
    },
    "yemek": {
        "title": "Yiyecek & İçecek Hizmetleri Kalitesi Artırılmalı",
        "description": "Kahvaltı ve restoran menüsü gözden geçirilmeli; servis standartları ve mutfak kalitesi iyileştirilmeli.",
        "steps": [
            "Menü çeşitliliği ve malzeme kalitesi için tedarikçi sözleşmeleri incelenmeli.",
            "Kahvaltı ve restoran hizmet süreleri ölçülerek optimize edilmeli.",
            "Restoran ekibine misafir odaklı servis eğitimi verilmeli.",
        ],
        "department": "Yiyecek & İçecek Müdürlüğü",
        "timeframe_high": "14 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "wifi": {
        "title": "İnternet Altyapısı ve Bağlantı Kalitesi İyileştirilmeli",
        "description": "Oda bazlı Wi-Fi kapsama alanı ve bağlantı hızları test edilmeli; altyapı güncelleme planı hazırlanmalı.",
        "steps": [
            "Tüm kat ve odalarda Wi-Fi sinyal gücü ve hız ölçümü yapılmalı.",
            "Zayıf sinyal bölgeleri için ek erişim noktası (access point) kurulmalı.",
            "İnternet altyapısı servis sözleşmesi gözden geçirilerek SLA güncellenmeli.",
        ],
        "department": "Bilgi İşlem ve Teknik Servis",
        "timeframe_high": "7 gün içinde",
        "timeframe_normal": "21 gün içinde",
    },
    "fiyat": {
        "title": "Fiyat-Performans Dengesi Yeniden Konumlandırılmalı",
        "description": "Rakip analizi yapılmalı; oda kategorisi bazlı fiyatlandırma stratejisi ve kampanya seçenekleri değerlendirilmeli.",
        "steps": [
            "Bölgedeki rakip otellerin fiyat ve hizmet karşılaştırması çıkarılmalı.",
            "Mevsimsel indirim ve erken rezervasyon kampanyaları planlanmalı.",
            "Ek değer paketleri (kahvaltı dahil, spa paketi) gözden geçirilmeli.",
        ],
        "department": "Satış ve Pazarlama Müdürlüğü",
        "timeframe_high": "14 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "personel": {
        "title": "Personel Performansı ve Hizmet Eğitimi Güçlendirilmeli",
        "description": "Misafir memnuniyeti düşük birimler tespit edilmeli; hedefli eğitim ve motivasyon programı başlatılmalı.",
        "steps": [
            "Birim bazlı misafir memnuniyet skoru değerlendirme sistemi oluşturulmalı.",
            "Şikayete konu olan personel/birim için hedefli koçluk seansları planlanmalı.",
            "Motivasyon ve teşvik mekanizması gözden geçirilerek güncellenmeli.",
        ],
        "department": "İnsan Kaynakları ve Genel Müdürlük",
        "timeframe_high": "14 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "konum": {
        "title": "Ulaşım Bilgilendirmesi ve Transfer Hizmetleri Geliştirilmeli",
        "description": "Misafirlere sunulan ulaşım rehberi güncellenmeli; transfer seçenekleri genişletilmeli.",
        "steps": [
            "Otel web sitesi ve oda materyalleri için güncel ulaşım kılavuzu hazırlanmalı.",
            "Havalimanı ve şehir merkezi transfer hizmeti seçenekleri artırılmalı.",
            "Resepsiyon personeli yerel ulaşım ve çevre rehberliği konusunda bilgilendirilmeli.",
        ],
        "department": "Ön Büro ve Satış Müdürlüğü",
        "timeframe_high": "21 gün içinde",
        "timeframe_normal": "45 gün içinde",
    },
    "gürültü": {
        "title": "Gürültü Kontrolü ve Sessizlik Politikası Uygulanmalı",
        "description": "Şikayet yoğun olan katlarda ses yalıtımı denetimi yapılmalı; gece saati protokolü oluşturulmalı.",
        "steps": [
            "Gürültü kaynakları tespit edilerek kısa vadeli önlemler alınmalı.",
            "22:00–08:00 sessizlik politikası tüm misafirlere bildirilmeli.",
            "Ses yalıtımı yetersiz odalar öncelikli iyileştirme listesine alınmalı.",
        ],
        "department": "Teknik Servis ve Güvenlik Müdürlüğü",
        "timeframe_high": "7 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "havuz": {
        "title": "Havuz ve Ortak Alan Hizmet Standartları Gözden Geçirilmeli",
        "description": "Havuz temizlik ve bakım protokolü güncellenmeli; personel takviyesi planlanmalı.",
        "steps": [
            "Günlük havuz su kalitesi ölçüm ve kayıt protokolü oluşturulmalı.",
            "Havuz başı personel sayısı ve vardiya düzeni optimize edilmeli.",
            "Güvenlik ekipmanları ve uyarı levhaları kontrol edilmeli.",
        ],
        "department": "Tesis Yönetimi",
        "timeframe_high": "7 gün içinde",
        "timeframe_normal": "21 gün içinde",
    },
    "spa": {
        "title": "Spa ve Wellness Hizmetleri Kalitesi Artırılmalı",
        "description": "Spa menüsü ve personel yetkinliği değerlendirilmeli; randevu ve bekleme süreci iyileştirilmeli.",
        "steps": [
            "Spa personelinin sertifikasyon ve yeterlilik durumu güncellenmeli.",
            "Randevu sistemi revize edilerek bekleme süreleri azaltılmalı.",
            "Spa hizmetlerine özel misafir geri bildirim mekanizması kurulmalı.",
        ],
        "department": "Spa ve Wellness Müdürlüğü",
        "timeframe_high": "14 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
    "plaj": {
        "title": "Plaj ve Deniz Kenarı Hizmetleri İyileştirilmeli",
        "description": "Plaj temizliği ve misafir hizmetleri kalitesi artırılmalı; güvenlik protokolü gözden geçirilmeli.",
        "steps": [
            "Plaj temizlik takvimi sıkılaştırılmalı; günlük denetim kaydı tutulmalı.",
            "Plaj şezlong ve gölgelik düzeni misafir yoğunluğuna göre optimize edilmeli.",
            "Deniz güvenliği ekipmanları ve can kurtarma protokolü kontrol edilmeli.",
        ],
        "department": "Tesis Yönetimi ve Güvenlik",
        "timeframe_high": "7 gün içinde",
        "timeframe_normal": "21 gün içinde",
    },
    "genel": {
        "title": "Genel Misafir Deneyimi Kapsamlı Biçimde İncelenmeli",
        "description": "Tüm temas noktaları değerlendirilmeli; düşük memnuniyet skorlu birimlerde yönetici aksiyon toplantısı yapılmalı.",
        "steps": [
            "Genel misafir memnuniyeti anketi düzenlenmeli; sonuçlar ekiple paylaşılmalı.",
            "En çok şikayet alan birimlerin yöneticileriyle öncelikli aksiyon toplantısı yapılmalı.",
            "Misafir odaklılık eğitimi tüm ekipler için takvime alınmalı.",
        ],
        "department": "Genel Müdürlük",
        "timeframe_high": "14 gün içinde",
        "timeframe_normal": "30 gün içinde",
    },
}

_PRIORITY_ORDER = {"acil": 0, "yüksek": 1, "normal": 2}


def _calc_priority(rank: int, count: int, total_negative: int) -> str:
    ratio = count / total_negative if total_negative > 0 else 0
    if rank == 0 and (ratio >= 0.35 or count >= 10):
        return "acil"
    if rank <= 1 or count >= 5:
        return "yüksek"
    return "normal"


def generate_action_plan(top_issue_categories: list, total_negative: int) -> list:
    """
    Parametre:
      top_issue_categories: [{"category": "temizlik", "count": 12}, ...]
      total_negative: toplam negatif yorum sayısı (öncelik hesabı için)
    Döndürür:
      Öncelik sıralı kurumsal aksiyon öğeleri listesi (en fazla 5 madde).
    """
    items = []
    for rank, cat_info in enumerate(top_issue_categories[:5]):
        raw_cat = (cat_info.get("category") or "genel").lower()
        key = raw_cat if raw_cat in _CATALOG else "genel"
        entry = _CATALOG[key]
        priority = _calc_priority(rank, cat_info["count"], total_negative)
        timeframe = (
            entry["timeframe_high"] if priority in ("acil", "yüksek") else entry["timeframe_normal"]
        )
        items.append({
            "priority": priority,
            "category": raw_cat,
            "title": entry["title"],
            "description": entry["description"],
            "steps": entry["steps"],
            "department": entry["department"],
            "timeframe": timeframe,
            "complaint_count": cat_info["count"],
        })

    items.sort(key=lambda x: _PRIORITY_ORDER.get(x["priority"], 3))
    return items
