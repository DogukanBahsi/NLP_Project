# 🏨 HotelReviewAI  
### Yapay Zekâ Destekli Otel Yorum Analiz Platformu

<p align="center">
  <img src="https://github.com/DogukanBahsi/NLP_Project/blob/main/Logo.png" width="250"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi"/>
  <img src="https://img.shields.io/badge/NLP-AI%20Powered-purple?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

# 📌 Proje Hakkında

**HotelReviewAI**, otel müşteri yorumlarını Doğal Dil İşleme (NLP) teknikleri kullanarak analiz eden yapay zekâ destekli bir analiz platformudur.  
Sistem, müşteri yorumlarını otomatik olarak analiz eder, müşteri memnuniyetini ölçer ve otel yönetimleri için veriye dayalı içgörüler sunar.

Yüzlerce yorumu manuel olarak okumak yerine işletmeler:
- müşteri memnuniyet trendlerini,
- hizmet kalitesini,
- güçlü ve zayıf yönlerini

anlık olarak analiz edebilir.

---

# 🎯 Proje Amacı

- Otel yorum analiz süreçlerini otomatikleştirmek
- Manuel yorum inceleme yükünü azaltmak
- Müşteri memnuniyet trendlerini tespit etmek
- Hizmet kalitesini veriye dayalı olarak geliştirmek
- Gerçek zamanlı duygu analizi sağlamak

---

# 👥 Hedef Kitle

- Otel Yöneticileri
- Müşteri Hizmetleri Departmanları
- Turizm Sektörü Analistleri
- Konaklama İşletmeleri
- NLP / Yapay Zekâ Araştırmacıları

---

# ✨ Özellikler

## 🧠 NLP Duygu Analizi
- Yorumların otomatik olumlu/olumsuz sınıflandırılması
- Yapay zekâ destekli yorum analizi
- Türkçe ve İngilizce dil desteği optimizasyonu

## 📊 Kategori Bazlı Analiz
Yorumları aşağıdaki kategorilere göre analiz eder:
- Temizlik
- Yemek Kalitesi
- Personel Hizmeti
- Oda Konforu
- Lokasyon

## 📈 İnteraktif Dashboard
- Gerçek zamanlı grafikler
- Genel otel performans analizi
- Duygu dağılım grafikleri
- Trend görselleştirmeleri

## 📄 Raporlama Sistemi
Analiz sonuçlarını:
- PDF
- Excel
- CSV

formatlarında dışa aktarabilir.

## 🔌 REST API Desteği
- Özel geliştirilmiş RESTful API mimarisi
- Swagger/OpenAPI dokümantasyonu
- Kolay frontend-backend entegrasyonu

---

# 🛠️ Kullanılan Teknolojiler

## Frontend
- React.js / Next.js
- TailwindCSS [KULLANILIYORSA]
- Axios
- Chart.js / Plotly

## Backend
- FastAPI / Flask
- Python 3.11+

## Veritabanı
- SQLite / PostgreSQL

## Yapay Zekâ & NLP
- PyTorch
- HuggingFace Transformers
- SpaCy
- Scikit-learn

## Veri İşleme
- Pandas
- NumPy

## Görselleştirme
- Matplotlib
- Plotly

---

# 🧩 Sistem Mimarisi

```text
Ham Yorumlar
      ↓
Ön İşleme & Temizleme
      ↓
NLP Duygu Analizi Modeli
      ↓
Sınıflandırma & Skorlama
      ↓
Veritabanı Kaydı
      ↓
Dashboard Görselleştirme
```

---

# 📂 Proje Yapısı

```plaintext
HotelReviewAI/
├── backend/                 # Backend API ve NLP Pipeline
│   ├── app/                 # Ana uygulama kaynak kodları
│   ├── data/                # Dataset ve ham veriler
│   ├── models/              # Eğitilmiş AI/NLP modelleri
│   ├── routes/              # API endpointleri
│   ├── services/            # İş mantığı servisleri
│   └── requirements.txt
│
├── frontend/                # React / Next.js arayüzü
│   ├── components/
│   ├── pages/
│   ├── public/
│   └── package.json
│
├── docs/                    # UML diyagramları ve raporlar
├── screenshots/             # Proje ekran görüntüleri
├── README.md
└── .gitignore
```

---

# ⚙️ Kurulum

## 1️⃣ Repoyu Klonlayın

```bash
git clone https://github.com/DogukanBahsi/NLP_Project.git
cd HotelReviewAI
```

---

## 2️⃣ Backend Kurulumu

```bash
cd backend

pip install -r requirements.txt

# .env dosyası oluşturun
touch .env

# FastAPI sunucusunu başlatın
uvicorn app.main:app --reload
```

Backend adresi:

```txt
http://localhost:8000
```

Swagger API Dokümantasyonu:

```txt
http://localhost:8000/docs
```

---

## 3️⃣ Frontend Kurulumu

```bash
cd frontend

npm install

npm run dev
```

Frontend adresi:

```txt
http://localhost:3000
```

---

# 🚀 Kullanım

## Adım 1 — Uygulamayı Başlatın
Backend ve frontend sunucularını çalıştırın.

## Adım 2 — Veri Seti Yükleyin
Otel yorumlarını:
- CSV
- Excel (.xlsx)

formatında sisteme yükleyin.

## Adım 3 — Otomatik NLP İşleme
Sistem otomatik olarak:
- metni temizler,
- yorumları işler,
- duygu analizi yapar,
- kategori skorlarını üretir.

## Adım 4 — Görsel Analizleri İnceleyin
Dashboard üzerinden:
- duygu grafikleri,
- müşteri memnuniyet skorları,
- trend analizleri,
- özet raporlar

görüntülenebilir.

---

# 📊 Örnek Analiz Çıktıları

- Olumlu / Olumsuz Yorum Oranı
- Müşteri Memnuniyet Skoru
- En Çok Şikâyet Edilen Konular
- Hizmet Kalitesi Isı Haritası
- Kategori Bazlı Skorlar

---

# 🧪 API Dokümantasyonu

Swagger dokümantasyonuna aşağıdaki adresten erişebilirsiniz:

```txt
http://localhost:8000/docs
```

Örnek API Endpointleri:

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/analyze` | Yüklenen yorumları analiz eder |
| GET | `/reports` | Oluşturulan raporları getirir |
| GET | `/dashboard` | Dashboard istatistiklerini döndürür |

---

# 🖼️ Ekran Görüntüleri

## Dashboard
![Dashboard Screenshot](https://github.com/DogukanBahsi/NLP_Project/blob/main/Dashboard.png)


## Analitik Sayfası
![Analytics Screenshot]([ANALYTICS_SCREENSHOT])

---

# 🔒 Kısıtlamalar

- NLP modeli temel olarak:
  - Türkçe
  - İngilizce

yorumlar için optimize edilmiştir.

Aşağıdaki durumlarda performans düşebilir:
- Argo ağırlıklı yorumlar
- Karışık dil kullanımı
- İronik / alaycı ifadeler

---

# 🔮 Gelecek Geliştirmeler

- Booking.com API Entegrasyonu
- TripAdvisor Veri Entegrasyonu
- Gerçek Zamanlı Veri Akışı
- Çoklu Dil Desteği
- Yapay Zekâ Destekli Chat Asistanı
- Gelişmiş Öneri Sistemi
- Docker & Kubernetes Desteği
- Rol Bazlı Yetkilendirme Sistemi

---

# 🎓 Akademik Bilgiler

| Alan | Bilgi |
|---|---|
| Ders | Doğal Dil İşleme |
| Üniversite | İstanbul Gedik Üniversitesi |
| Proje Türü | Akademik AI/NLP Projesi |
| Dönem | [BURAYI_DOLDUR] |
| Danışman / Hoca | [BURAYI_DOLDUR] |

---

# 👨‍💻 Katkıda Bulunanlar

| İsim | Rol |
|---|---|
| Doğukan Bahşi | Full Stack & NLP Geliştirme |
| [TAKIM_ARKADAŞI] | [ROL] |

---

# 📈 Model & NLP Detayları

## NLP Pipeline İçeriği
- Metin Temizleme
- Tokenization
- Stopword Removal
- Lemmatization
- Embedding Üretimi
- Duygu Sınıflandırması

## Model Bilgileri

| Bileşen | Teknoloji |
|---|---|
| Transformer Modeli | [MODEL_ADI] |
| Embedding Yöntemi | [EMBEDDING_YÖNTEMİ] |
| Sınıflandırma Algoritması | [CLASSIFIER_ADI] |

---

# 🧠 Yapay Zekâ İş Akışı

```text
Kullanıcı Yorumları Yükler
        ↓
Metin Ön İşleme
        ↓
Transformer Tabanlı NLP Modeli
        ↓
Duygu Tahmini
        ↓
Veri Toplama & Analiz
        ↓
Dashboard Görselleştirme
```

---

# 📋 Gereksinimler

## Backend
- Python 3.11+
- pip

## Frontend
- Node.js v18+
- npm / yarn

---

# 🔐 Ortam Değişkenleri (.env)

Örnek `.env` dosyası:

```env
DATABASE_URL=[DATABASE_URL]
SECRET_KEY=[SECRET_KEY]
MODEL_PATH=[MODEL_PATH]
API_KEY=[OPSİYONEL]
```

---

# 📦 Deployment

## Production Build

### Frontend
```bash
npm run build
```

### Backend
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

# 📚 Genişletilebilir Araştırma Alanları

- Emotion Detection
- Fake Review Detection
- Aspect-Based Sentiment Analysis
- Recommendation Systems
- Customer Retention Prediction

---

# 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

[LISANS_DOSYASI_VARSA]

---

# ⭐ Teşekkürler

Özel teşekkürler:
- HuggingFace
- SpaCy
- FastAPI
- React Community
- Açık Kaynak NLP Ekosistemi

---

# 📬 İletişim

## Geliştirici
**Doğukan Bahşi**

- GitHub: [GITHUB_PROFILIN]
- LinkedIn: [LINKEDIN]
- E-posta: [EMAIL]

---

<p align="center">
  <b>HotelReviewAI — Otel Yorumlarını Akıllı Veriye Dönüştürür 🚀</b>
</p>
