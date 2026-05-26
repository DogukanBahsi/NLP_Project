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
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge"/>
</p>

---

## 📌 Proje Hakkında

**HotelReviewAI**, otel müşteri yorumlarını Doğal Dil İşleme (NLP) teknikleri kullanarak otomatik olarak analiz eden, tam yığın (full-stack) bir yapay zekâ platformudur.  
Yüzlerce yorumu manuel okumak yerine otel yönetimleri, müşteri memnuniyet trendlerini, risk skorlarını ve aksiyon planlarını anlık olarak görüntüleyebilir.

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
| **SerpAPI** | — | Google Maps yorum çekimi |
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
│   │   ├── models.py                  # Hotel, Review ORM modelleri
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
│   │   │   ├── dashboard_routes.py    # Dashboard ve analiz endpointleri
│   │   │   ├── review_routes.py       # Yorum CRUD + CSV yükleme
│   │   │   ├── hotel_routes.py        # Otel CRUD
│   │   │   ├── analysis_routes.py     # Tekil yorum analizi
│   │   │   ├── external_sources_routes.py  # SerpAPI entegrasyonu
│   │   │   └── report_routes.py       # PDF rapor üretimi
│   │   │
│   │   └── services/
│   │       └── serpapi_service.py     # SerpAPI veri çekme servisi
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   # React giriş noktası
│   │   ├── App.jsx                    # Kök bileşen
│   │   ├── Dashboard.jsx              # Ana dashboard (~1100 satır)
│   │   ├── api.js                     # API istemci fonksiyonları
│   │   └── index.css                  # Global CSS + animasyonlar
│   │
│   ├── index.html
│   └── package.json
│
├── Dashboard.png                      # Ekran görüntüsü
├── Doğruluk.png                       # Model metrik ekranı
├── En Riskli Yorumlar.png             # Risk tablosu ekranı
├── Tüm Yorumlar.png                   # Yorumlar tablosu ekranı
├── Veri Kaynağı ve Yorumlar.png       # Kaynak analizi ekranı
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
uvicorn app.main:app --reload --port 8000
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
| GET | `/dashboard/summary?hotel_id={id}` | Belirli otel özeti |
| GET | `/dashboard/trend` | Zaman serisi trend verisi |
| GET | `/dashboard/reviews` | Sayfalanmış yorum tablosu |
| GET | `/dashboard/nlp-summary` | AI destekli 3 maddelik extractive özet |
| GET | `/dashboard/model-metrics` | Model doğruluk ve F1 metrikleri |
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

### Harici Kaynaklar (SerpAPI)
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/external/serpapi/search-hotels?query={q}` | Google Maps'te otel arama |
| POST | `/external/serpapi/import-reviews` | Google yorumlarını içe aktar |

### Raporlar
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/reports/pdf` | PDF raporu oluştur ve indir |

### Sistem
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/health` | BERT model hazırlık durumu |

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
      ↓
Metin Temizleme (lowercase, noktalama kaldırma)
      ↓
TF-IDF Vektörizasyon (tfidf_vectorizer.pkl)
      ↓
Logistic Regression Sınıflandırma (sentiment_model.pkl)
      ↓
Duygu Etiketi: pozitif / negatif / nötr
      ↓
Risk Skoru Hesaplama (negatif yoğunluğu × ağırlık)
      ↓
Kategori Tespiti (kural tabanlı: temizlik, oda, yemek...)
      ↓
Aksiyon Planı Üretimi
      ↓
Veritabanına Kayıt (SQLite)
```

---

## 📊 Dashboard Sekmeleri

### 🗂️ Genel Özet
- KPI kartları (toplam yorum, ortalama skor, pozitif/negatif oran, risk sayısı)
- Duygu dağılımı pasta grafiği + kategori çubuk grafiği
- Zaman serisi trend (ComposedChart: çubuk + çizgi, çift Y ekseni)
- Kaynak analizi (Google Maps / CSV / Manual karşılaştırması)
- En riskli 5 yorum listesi
- Haftalık aksiyon planı ve öncelikli iyileştirme önerileri
- Tüm yorumlar tablosu (arama, filtre, sayfalama + Drawer detay paneli)

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
2. **Otel aratın** — Üst arama çubuğunda otel adı yazın (Google Maps'ten otomatik çekilir)
3. **Yorumları içe aktarın** — "İçe Aktar" butonuyla Google yorumlarını yükleyin **veya** CSV dosyası yükleyin
4. **Dashboard'u inceleyin** — KPI, trend, kaynak analizi ve risk yorumlarını görüntüleyin
5. **Derinlemesine analiz** — "Derinlemesine Analiz" sekmesinde AI özeti alın
6. **Raporlayın** — PDF butonu ile tam raporu dışa aktarın

---

## 🎨 Teknik Mimari Özellikleri (Golden Master)

- **SQL Aggregate Optimizasyonu** — Python döngüsü yerine tek sorguda `func.count/avg/sum + case()`
- **N+1 Sorgu Düzeltmesi** — `joinedload(Review.hotel)` ile ilişkisel veri tek sorguda
- **UUID PDF Dosyaları** — Race condition önleme + `BackgroundTasks` ile otomatik temizlik
- **COALESCE Zaman Filtresi** — `review_date` yoksa `created_at` devreye girer
- **asyncio Python 3.12** — `get_running_loop()` ile uyumlu başlatma
- **ErrorBoundary** — React bileşen çökmelerini yakalayan sınıf bileşeni
- **Click-Outside Dropdown** — `useRef` + `document.mousedown` ile kapanma
- **Glassmorphism UI** — `#0f172a / #1e293b` koyu tema + neon glow efektleri

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

## 🎓 Akademik Bilgiler

| Alan | Bilgi |
|---|---|
| **Ders** | Doğal Dil İşleme (NLP) |
| **Üniversite** | İstanbul Gedik Üniversitesi |
| **Proje Türü** | Akademik Bitirme Projesi |
| **Dönem** | 2024–2025 Bahar Dönemi |
| **Danışman** | Başak Buluz Kömeçoğlu |

---

## 👨‍💻 Katkıda Bulunanlar

| İsim | Rol |
|---|---|
| **Ramazan Doğukan Bahşi** | Full Stack Geliştirme · NLP Pipeline · Backend Mimarisi |
| **Yasin Almaz** | Veri Mühendisliği · Model Eğitimi · Backend |
| **Berat Demirbaş** | Frontend · UI/UX · Dashboard Tasarımı |

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
