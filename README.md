# 🏨 HotelReviewAI
### Yapay Zekâ Destekli Otel Yorum Analiz Platformu

<p align="center">
  <img src="https://github.com/DogukanBahsi/NLP_Project/blob/main/Logo.png" width="220"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite"/>
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite"/>
  <img src="https://img.shields.io/badge/NLP-AI%20Powered-8B5CF6?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/SerpAPI-Google%20Maps-4285F4?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

---

## 📌 Proje Hakkında

**HotelReviewAI**, otel müşteri yorumlarını Doğal Dil İşleme (NLP) teknikleri kullanarak otomatik olarak analiz eden, tam yığın (full-stack) bir yapay zekâ platformudur.  
Yüzlerce yorumu manuel okumak yerine otel yönetimleri; müşteri memnuniyet trendlerini, risk skorlarını, platform puanlarını ve aksiyon planlarını anlık olarak görüntüleyebilir.

> **Akademik proje** — İstanbul Gedik Üniversitesi, Doğal Dil İşleme Dersi, Bahar Dönemi

---

## 🎯 Temel Özellikler

| Özellik | Açıklama |
|---|---|
| 🧠 **Duygu Analizi** | TF-IDF + Logistic Regression ile pozitif / negatif / nötr sınıflandırma |
| 🤖 **BERT Destekli Analiz** | HuggingFace Transformers ile derin anlam çıkarımı (arka planda çalışır) |
| 📊 **Çok Sekmeli Dashboard** | Genel Özet · Otel Karşılaştırma · Derinlemesine Analiz |
| 🔍 **Kaynak Çokluluğu** | Google Maps (SerpAPI), CSV yükle, manuel giriş |
| 📈 **Trend Grafiği** | Aylık / haftalık / günlük pozitif-negatif-nötr + ortalama skor |
| ⚠️ **Risk Skoru** | Yorum başına hesaplanan itibar riski ve öncelikli aksiyon önerileri |
| 📄 **PDF Raporu** | Tek tıkla tam analiz raporu dışa aktarma |
| 🗂️ **Kategori Analizi** | Temizlik · Oda · Yemek · Resepsiyon · Wi-Fi · Fiyat kategorileri |
| 💡 **NLP AI Özeti** | Harici API gerektirmeyen istatistiksel özetleyici (3 maddelik analiz) |
| 🔄 **Otel Karşılaştırma** | İki oteli yan yana puan ve duygu dağılımıyla karşılaştır |
| 🌐 **Dış Platform Puanları** | TripAdvisor · Booking.com · Expedia · Agoda · Hotels.com · ZenHotels otomatik çekilir |
| 🗺️ **Harita Widget** | Otelin konumunu API anahtarı gerektirmeyen Google Maps iframe ile gösterir |
| 🏷️ **Çok Otel Sonucu** | Marka adı fallback aramasıyla aynı zincire ait birden fazla otel listelenir |

---

## 🖼️ Ekran Görüntüleri

### Ana Dashboard
![Dashboard](https://github.com/DogukanBahsi/NLP_Project/blob/main/Dashboard.png)

### Model Doğruluğu
![Model Accuracy](https://github.com/DogukanBahsi/NLP_Project/blob/main/Do%C4%9Fruluk.png)

### En Riskli Yorumlar
![High Risk Reviews](https://github.com/DogukanBahsi/NLP_Project/blob/main/En%20Riskli%20Yorumlar.png)

### Tüm Yorumlar Tablosu
![All Reviews](https://github.com/DogukanBahsi/NLP_Project/blob/main/T%C3%BCm%20Yorumlar.png)

### Veri Kaynağı Analizi
![Source Analysis](https://github.com/DogukanBahsi/NLP_Project/blob/main/Veri%20Kayna%C4%9F%C4%B1%20ve%20Yorumlar.png)

---

## 🛠️ Kullanılan Teknolojiler

### Backend
| Teknoloji | Versiyon | Açıklama |
|---|---|---|
| **FastAPI** | 0.136 | Ana REST API çerçevesi |
| **SQLAlchemy** | 2.0 | ORM + veritabanı sorguları |
| **SQLite** | — | Hafif yerel veritabanı |
| **PyTorch** | 2.11 | BERT model çalıştırma |
| **HuggingFace Transformers** | 5.7 | BERT sentiment pipeline |
| **Scikit-learn** | 1.8 | TF-IDF + Logistic Regression |
| **ReportLab** | — | PDF rapor üretimi |
| **SerpAPI** | — | Google Maps yorum çekimi + platform puanları |
| **deep-translator** | — | Çok dilli yorum desteği |
| **dateparser** | — | Çok formatlı tarih ayrıştırma |
| **Uvicorn** | — | ASGI sunucu |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|---|---|---|
| **React** | 18 | UI kütüphanesi |
| **Vite** | 5 | Geliştirme ve build aracı |
| **Recharts** | — | ComposedChart, BarChart, RadarChart |
| **Axios** | — | HTTP istemcisi |
| **Inline CSS** | — | CSS custom properties + glassmorphism tema |

---

## 📂 Proje Yapısı

```plaintext
HotelReviewAI/
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI uygulama giriş noktası
│   │   ├── database.py                # SQLAlchemy oturum & engine
│   │   ├── models.py                  # Hotel, Review, ExternalRating ORM modelleri
│   │   ├── schemas.py                 # Pydantic şemaları
│   │   │
│   │   ├── nlp/
│   │   │   ├── analyzer.py            # Ana NLP analiz pipeline
│   │   │   ├── bert_analyzer.py       # BERT Singleton (HuggingFace)
│   │   │   ├── category_detector.py   # Kural tabanlı kategori tespiti
│   │   │   ├── action_planner.py      # Aksiyon planı üreticisi
│   │   │   ├── summarizer.py          # Extractive NLP özetleyici
│   │   │   └── train_model.py         # Model eğitim scripti
│   │   │
│   │   ├── ml_models/
│   │   │   ├── sentiment_model.pkl    # Eğitilmiş Logistic Regression
│   │   │   ├── tfidf_vectorizer.pkl   # TF-IDF vektörizer
│   │   │   └── metrics.json           # Model performans metrikleri
│   │   │
│   │   ├── routers/
│   │   │   ├── dashboard_routes.py        # Dashboard ve analiz endpointleri
│   │   │   ├── review_routes.py           # Yorum CRUD + CSV yükleme
│   │   │   ├── hotel_routes.py            # Otel CRUD
│   │   │   ├── analysis_routes.py         # Tekil yorum analizi
│   │   │   ├── external_sources_routes.py # SerpAPI entegrasyonu (yorum çekme)
│   │   │   ├── external_ratings_routes.py # Platform puanları CRUD + otomatik çekme
│   │   │   └── report_routes.py           # PDF rapor üretimi
│   │   │
│   │   └── services/
│   │       ├── serpapi_service.py     # SerpAPI veri çekme servisi (v5)
│   │       └── source_selector.py     # Kaynak normalizasyon + meta
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   # React giriş noktası
│   │   ├── App.jsx                    # Kök bileşen
│   │   ├── Dashboard.jsx              # Ana dashboard
│   │   ├── api.js                     # API istemci fonksiyonları
│   │   └── index.css                  # Global CSS + animasyonlar
│   │
│   ├── index.html
│   └── package.json
│
├── Dashboard.png
├── Doğruluk.png
├── En Riskli Yorumlar.png
├── Tüm Yorumlar.png
├── Veri Kaynağı ve Yorumlar.png
├── Logo.png
├── baslat.bat                         # Tek tıkla başlatma scripti
├── main.py                            # Alternatif giriş noktası
└── README.md
```

---

## ⚙️ Kurulum ve Çalıştırma

### Ön Gereksinimler

- Python 3.11+
- Node.js 18+
- pip

---

### Yöntem 1 — Tek Tıkla Başlatma (Önerilen)

Proje kök dizinindeki `baslat.bat` dosyasına çift tıklayın.

Bu script otomatik olarak:
1. `backend/` klasöründe `uvicorn app.main:app --reload --port 8000` başlatır
2. `frontend/` klasöründe `npm run dev` başlatır
3. Tarayıcıda `http://localhost:5173` adresini açar

---

### Yöntem 2 — Manuel Kurulum

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

| Servis | Adres |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## 🔌 API Endpoint Tablosu

### Dashboard
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/dashboard/summary` | KPI özeti, duygu dağılımı, risk yorumları |
| GET | `/dashboard/summary?hotel_id={id}` | Belirli otel özeti (GPS dahil) |
| GET | `/dashboard/trend` | Zaman serisi trend verisi |
| GET | `/dashboard/reviews` | Sayfalanmış yorum tablosu |
| GET | `/dashboard/nlp-summary` | AI destekli 3 maddelik extractive özet |
| GET | `/dashboard/model-metrics` | Model doğruluk ve F1 metrikleri |
| GET | `/dashboard/sources` | Kayıtlı veri kaynakları listesi |
| DELETE | `/dashboard/hotel/{id}` | Otel ve tüm yorumlarını sil |

### Yorumlar
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/reviews/` | Tüm yorumları listele |
| POST | `/reviews/` | Manuel yorum ekle + otomatik NLP analizi |
| POST | `/reviews/upload-csv?hotel_id={id}` | Standart CSV yükleme |
| POST | `/reviews/upload-multi-source-csv?hotel_id={id}` | Çok kaynaklı CSV (source sütunlu) |

### Oteller
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/hotels/` | Tüm otelleri listele |
| POST | `/hotels/` | Yeni otel oluştur |

### Dış Platform Puanları
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/hotels/{id}/external-ratings` | Otelin platform puanlarını listele |
| POST | `/hotels/{id}/external-ratings` | Platform puanı ekle veya güncelle (upsert) |
| DELETE | `/hotels/{id}/external-ratings/{platform}` | Belirli platform puanını sil |
| POST | `/hotels/{id}/fetch-platform-ratings` | Google'dan platform puanlarını otomatik çek ve kaydet |
| GET | `/hotels/external-ratings/platforms` | Desteklenen platform listesini ve meta bilgilerini al |

### Harici Kaynaklar (SerpAPI)
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/external/serpapi/search-hotels?query={q}` | Google Maps'te otel arama |
| POST | `/external/serpapi/import-reviews` | Google yorumlarını içe aktar + platform puanlarını otomatik kaydet |

### Raporlar
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/reports/pdf` | PDF raporu oluştur ve indir |

### Sistem
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/health` | BERT model hazırlık durumu |

---

## 🌐 Dış Platform Puanları

Otel yorumları içe aktarıldığında veya "Otomatik Getir" butonuna tıklandığında sistem aşağıdaki platformlardaki puanları Google arama sonuçlarından otomatik olarak tespit edip veritabanına kaydeder:

| Platform | Puan Ölçeği | Renk |
|---|---|---|
| TripAdvisor | 0 – 5 | Yeşil (#00AA6C) |
| Booking.com | 0 – 10 | Lacivert (#003580) |
| Expedia | 0 – 10 | Koyu mavi (#00355F) |
| Hotels.com | 0 – 10 | Kırmızı (#D4001C) |
| Agoda | 0 – 10 | Mor (#5B2D8E) |
| ZenHotels | 0 – 10 | Kırmızı (#E31A2D) |
| Google Maps | 0 – 5 | Mavi (#4285F4) |

Puanlar `rich_snippet.top.detected_extensions` alanından okunur; bulunamazsa snippet metninden regex ile çıkarılır.  
Manuel ekleme / düzenleme / silme de desteklenmektedir.

---

## 🗺️ Harita Widget

Her otelin detay ekranında, konum verisi mevcutsa API anahtarı gerektirmeyen bir Google Maps iframe gösterilir:

```
https://maps.google.com/maps?q={lat},{lng}&z=15&output=embed
```

- GPS koordinatları yorum içe aktarımı sırasında otomatik kaydedilir
- "Google Maps'te Aç" bağlantısıyla tam haritaya geçiş yapılabilir
- Adres bilgisi haritanın altında metin olarak görüntülenir

---

## 🔎 SerpAPI Akıllı Arama (v5)

`serpapi_service.py` üç kademeli arama stratejisi uygular:

### Kademe 1 — Google Maps Araması
- Frontend'den gelen "Turkey" / "Türkiye" suffix'i temizlenir, temiz isimle Maps'e sorgu gönderilir
- `local_results` (Paid/Pro Plan) **ve** `place_results` (Free Plan tek sonuç) her ikisi de ayrıştırılır
- GPS koordinatları (`gps_coordinates.latitude/longitude`) kaydedilir

### Kademe 1b — Marka Fallback Araması
- Yalnızca 1 sonuç gelirse otel tipi kelimeleri (`Bay`, `Resort`, `Palace`, `Hotel` vb.) soygadan temizlenir
- Marka adıyla ikinci Maps araması yapılır; yeni `data_id`'ler ana listeye eklenir
- Örnek: `"D Maris Bay"` → `"D Maris"` ile tekrar aranır, zincirin diğer otelleri listelenir

### Kademe 2 — Organik Google Araması
- Maps'te hiç sonuç bulunamazsa normal Google aramasına düşülür
- Bu sonuçlarda `data_id` olmadığından yorum çekimi yapılamaz; kullanıcıya uyarı mesajı gösterilir

### Konum Farkındalığı
30'dan fazla Türk şehri, tatil bölgesi ve otel markası için koordinat tablosu:

```
İstanbul, Ankara, İzmir, Antalya, Muğla, Trabzon, Bursa
Marmaris, Bodrum, Fethiye, Alanya, Side, Kemer, Belek, Kuşadası, Çeşme
D Maris (Hisarönü), Rixos (Antalya), Maxx Royal (Belek), Hillside (Fethiye),
Kempinski (Bodrum), Swissotel (İstanbul) ve daha fazlası
```

---

## 🤖 Model Metrikleri

> Model: **TF-IDF Vektörizasyon + Logistic Regression**  
> Eğitim verisi: Türkçe/İngilizce otel yorumları

| Metrik | Değer |
|---|---|
| **Accuracy** | **0.667** |
| **F1 Score (Weighted)** | **0.656** |
| Sınıflar | pozitif · negatif · nötr |
| Vektörizasyon | TF-IDF (n-gram: 1-2) |
| Model dosyası | `sentiment_model.pkl` |

### NLP Pipeline Akışı

```text
Ham Yorum Metni
      |
Metin Temizleme (lowercase, noktalama kaldırma)
      |
TF-IDF Vektörizasyon (tfidf_vectorizer.pkl)
      |
Logistic Regression Siniflandirma (sentiment_model.pkl)
      |
Duygu Etiketi: pozitif / negatif / nötr
      |
Risk Skoru Hesaplama (negatif yogunlugu x agirlik)
      |
Kategori Tespiti (kural tabanli: temizlik, oda, yemek...)
      |
Aksiyon Plani Üretimi
      |
Veritabanina Kayit (SQLite)
```

---

## 📊 Dashboard Sekmeleri

### 🗂️ Genel Özet
- KPI kartları (toplam yorum, ortalama skor, pozitif/negatif oran, risk sayısı)
- Duygu dağılımı pasta grafiği + kategori çubuk grafiği
- Zaman serisi trend (ComposedChart: çubuk + çizgi, çift Y ekseni)
  - Günlük modda son 30 güne otomatik zoom + eksik günler sıfır değeriyle doldurulur
- Kaynak analizi (Google Maps / CSV / Manual karşılaştırması)
- En riskli 5 yorum listesi
- Haftalık aksiyon planı ve öncelikli iyileştirme önerileri
- Tüm yorumlar tablosu (arama, filtre, sayfalama + Drawer detay paneli)
- **Dış Platform Puanları** bölümü:
  - Platform kartları (renkli dolgu çubuğu, puan rengi yeşil/sarı/kırmızı)
  - "Otomatik Getir" butonu (Google rich snippet'tan çeker, yükleniyor animasyonu gösterir)
  - "Manuel Ekle" ve düzenleme/silme modalı
- **Konum Haritası**: Otel seçildiğinde GPS koordinatlarından oluşturulan Google Maps iframe

### 🔄 Otel Karşılaştırma
- İki otel seçimi ile yan yana performans analizi
- Ortalama skor, duygu dağılımı, kategori karşılaştırması
- Kazanan oteli belirleyen otomatik karar

### 🔬 Derinlemesine Analiz
- AI destekli NLP özet (3 maddelik extractive analiz)
- Top şikayet & top övgü kategorisi
- Yüksek riskli yorum detay kartları

---

## 🚀 Kullanım Kılavuzu

1. **Uygulamayı başlatın** — `baslat.bat` veya manuel kurulum
2. **Otel aratın** — Üst arama çubuğunda otel adı yazın; sistem Google Maps'ten otomatik çeker
3. **Yorumları içe aktarın** — "İçe Aktar" butonuyla Google yorumlarını yükleyin **veya** CSV dosyası yükleyin
   - GPS koordinatları ve Google puanı otomatik kaydedilir
   - Platform puanları (TripAdvisor, Booking vb.) arka planda otomatik çekilir
4. **Konum haritasını görüntüleyin** — Otel sayfasında GPS verisi varsa harita otomatik yüklenir
5. **Dashboard'u inceleyin** — KPI, trend, kaynak analizi ve risk yorumlarını görüntüleyin
6. **Platform puanlarını güncelleyin** — "Otomatik Getir" ile yenileyin veya "Manuel Ekle" ile düzenleyin
7. **Derinlemesine analiz** — "Derinlemesine Analiz" sekmesinde AI özeti alın
8. **Raporlayın** — PDF butonu ile tam raporu dışa aktarın

---

## 🎨 Teknik Mimari Özellikleri

- **SQL Aggregate Optimizasyonu** — Python döngüsü yerine tek sorguda `func.count/avg/sum + case()`
- **N+1 Sorgu Düzeltmesi** — `joinedload(Review.hotel)` ile ilişkisel veri tek sorguda
- **UUID PDF Dosyaları** — Race condition önleme + `BackgroundTasks` ile otomatik temizlik
- **COALESCE Zaman Filtresi** — `review_date` yoksa `created_at` devreye girer
- **asyncio Python 3.12** — `get_running_loop()` ile uyumlu başlatma
- **ErrorBoundary** — React bileşen çökmelerini yakalayan sınıf bileşeni
- **Click-Outside Dropdown** — `useRef` + `document.mousedown` ile kapanma
- **Glassmorphism UI** — `#0f172a / #1e293b` koyu tema + neon glow efektleri
- **Free Plan Uyumluluğu** — SerpAPI Free Plan'dan gelen `place_results` (tek sonuç dict) ayrıştırılır
- **Marka Fallback Araması** — Tek sonuçlarda otel tipi kelimeler çıkarılarak zincire ait tüm oteller bulunur
- **GPS Konum Saklama** — `place_id`, `latitude`, `longitude`, `address` Hotel modelinde tutulur
- **API Anahtarsız Harita** — `maps.google.com/maps?output=embed` ile iframe harita
- **Upsert Tasarımı** — Dış platform puanları `platform + hotel_id` bileşiğine göre eklenir veya güncellenir
- **Türkçe karakter güvenli terminal** — Tüm backend print ifadeleri ASCII uyumlu yazıldı (Windows CP1254)

---

## 📋 requirements.txt (Özet)

```text
fastapi==0.136.1
uvicorn
sqlalchemy==2.0.49
torch==2.11.0
transformers==5.7.0
scikit-learn==1.8.0
reportlab
serpapi
pandas
python-multipart
deep-translator
dateparser
```

---

## 🧪 Test

```bash
# Backend birim testleri
cd backend
python test_nlp.py
python test_import.py

# Swagger UI üzerinden manuel test
# http://localhost:8000/docs
```

---

## 🗃️ Veritabanı Modelleri

### Hotel
| Sütun | Tip | Açıklama |
|---|---|---|
| `id` | Integer PK | Birincil anahtar |
| `name` | String | Otel adı |
| `city` / `country` | String | Konum |
| `google_rating` | Float | Google Maps yıldız puanı |
| `place_id` | String | Google Maps place_id |
| `latitude` / `longitude` | Float | GPS koordinatları |
| `address` | String | Tam adres |

### ExternalRating
| Sütun | Tip | Açıklama |
|---|---|---|
| `hotel_id` | FK | Hotel.id |
| `platform` | String | `tripadvisor`, `booking`, `expedia` … |
| `rating` | Float | Platform puanı |
| `max_rating` | Float | Maksimum puan (5.0 veya 10.0) |
| `review_count` | Integer | Platformdaki yorum sayısı |
| `url` | String | Platform profil bağlantısı |

### Review
| Sütun | Tip | Açıklama |
|---|---|---|
| `hotel_id` | FK | Hotel.id |
| `source` | String | `serpapi`, `csv`, `manual` |
| `comment` | Text | Yorum metni |
| `sentiment` | String | `pozitif` / `negatif` / `nötr` |
| `satisfaction_score` | Float | 0–100 memnuniyet skoru |
| `risk_score` | Float | 0–100 itibar riski skoru |
| `issue_category` | String | `temizlik`, `oda`, `yemek` … |
| `review_date` | DateTime | Yorumun yazıldığı tarih |

---

## 🎓 Akademik Bilgiler

| Alan | Bilgi |
|---|---|
| **Ders** | Doğal Dil İşleme (NLP) |
| **Üniversite** | İstanbul Gedik Üniversitesi |
| **Proje Türü** | Dönem Projesi |
| **Dönem** | 2025–2026 Bahar Dönemi |
| **Danışman** | Başak Buluz Kömeçoğlu |

---

## 👨‍💻 Katkıda Bulunanlar

| İsim | Rol |
|---|---|
| **Ramazan Doğukan Bahşi** | Full Stack Geliştirme · NLP Pipeline · Backend Mimarisi |
| **Yasin Almaz** | Veri Mühendisliği · Backend |
| **Berat Demirbaş** | Frontend · Dashboard Tasarımı |

---

## 📬 İletişim

**Ramazan Doğukan Bahşi**  
- GitHub: [github.com/DogukanBahsi](https://github.com/DogukanBahsi)
- LinkedIn: [linkedin.com/in/dogukanbhs](https://www.linkedin.com/in/dogukanbhs/)
- E-posta: dgkn.bhsi@gmail.com

---

<p align="center">
  <b>HotelReviewAI — Otel Yorumlarını Akıllı Veriye Dönüştürür 🚀</b>
</p>
