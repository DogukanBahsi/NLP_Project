# 🏨 HotelReviewAI
### Yapay Zekâ Destekli Otel Yorum Analiz Platformu

<p align="center">
  <img src="https://github.com/DogukanBahsi/NLP_Project/blob/main/Logo.png" width="200"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Railway-336791?style=for-the-badge&logo=postgresql"/>
  <img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway"/>
</p>

---

## 📌 Proje Hakkında

**HotelReviewAI**, otel müşteri yorumlarını NLP (Doğal Dil İşleme) ile otomatik analiz eden tam yığın bir yapay zekâ platformudur. Yüzlerce yorumu manuel okumak yerine; duygu analizi, şikayet kategorisi, risk skoru ve aksiyon önerileri sunar.

> **Akademik Proje** — İstanbul Gedik Üniversitesi, Doğal Dil İşleme Dersi, 2025–2026 Bahar Dönemi

---

## 🌐 Canlı Demo

| Servis | URL |
|---|---|
| **Uygulama** | https://impartial-emotion-production-6360.up.railway.app |
| **API Docs** | https://nlpproject-production-e84c.up.railway.app/docs |

---

## ✨ Temel Özellikler

| Özellik | Açıklama |
|---|---|
| 🔐 **Auth Sistemi** | Kayıt, giriş, e-posta doğrulama kodu (JWT + bcrypt + Resend) |
| 🧠 **Duygu Analizi** | TF-IDF + Logistic Regression — pozitif / negatif / nötr |
| 🤖 **BERT Desteği** | HuggingFace Transformers ile derin anlam çıkarımı |
| 📊 **Dashboard** | KPI, trend grafiği, kaynak analizi, en riskli yorumlar |
| 🔍 **Veri Kaynakları** | Google Maps (SerpAPI), CSV yükleme, manuel giriş |
| 🌍 **Platform Puanları** | TripAdvisor, Booking.com, Expedia vb. otomatik çekilir |
| 📄 **PDF Raporu** | Tek tıkla yönetici raporu oluşturma |
| 🗺️ **Konum Haritası** | GPS koordinatlarından Google Maps iframe |

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|---|---|
| **Frontend** | React 19, Vite, React Router, Recharts |
| **Backend** | FastAPI, SQLAlchemy, PostgreSQL |
| **NLP / ML** | BERT (HuggingFace), Scikit-learn, TF-IDF |
| **Auth** | JWT, bcrypt, Resend (e-posta doğrulama) |
| **Deploy** | Railway (backend + frontend + PostgreSQL) |

---

## 🚀 Yerel Kurulum

**Gereksinimler:** Python 3.11+, Node.js 20+

```bash
# Repoyu klonla
git clone https://github.com/DogukanBahsi/NLP_Project.git
cd NLP_Project
```

**Yöntem 1 — Tek tıkla (Windows):**
```
baslat.bat dosyasına çift tıkla
```

**Yöntem 2 — Manuel:**
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

| Servis | Adres |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/docs |

---

## ⚙️ Ortam Değişkenleri

`.env.example` dosyasını kopyalayıp `.env` oluşturun:

| Değişken | Açıklama |
|---|---|
| `JWT_SECRET_KEY` | JWT imzalama anahtarı |
| `DATABASE_URL` | PostgreSQL URL (opsiyonel, varsayılan SQLite) |
| `RESEND_API_KEY` | E-posta doğrulama için Resend anahtarı |
| `SERPAPI_API_KEY` | Google Maps otel arama için SerpAPI anahtarı |
| `DISABLE_BERT` | `true` → BERT kapalı, hafif mod |

---

## 📂 Proje Yapısı

```
NLP_Project/
├── backend/
│   ├── app/
│   │   ├── core/         # JWT, bcrypt, e-posta (Resend)
│   │   ├── routers/      # Auth, hotel, review, dashboard, report...
│   │   ├── nlp/          # BERT, ML model, kategori tespiti
│   │   ├── models.py     # Veritabanı modelleri
│   │   └── main.py       # FastAPI uygulaması
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/        # Login, Register, VerifyEmail
│       ├── context/      # Auth context
│       ├── components/   # Toast bildirimleri
│       ├── Dashboard.jsx # Ana dashboard
│       └── api.js        # Backend istemcisi
├── .env.example
└── baslat.bat            # Windows başlatma scripti
```

---

## 🎓 Akademik Bilgiler

| Alan | Bilgi |
|---|---|
| **Ders** | Doğal Dil İşleme (NLP) |
| **Üniversite** | İstanbul Gedik Üniversitesi |
| **Dönem** | 2025–2026 Bahar |
| **Dersi Veren** | Başak Buluz Kömeçoğlu |

---

## 👨‍💻 Geliştirici Ekibi

| İsim | Rol |
|---|---|
| **Ramazan Doğukan Bahşi** | Full Stack, NLP Pipeline, Backend Mimarisi |
| **Yasin Almaz** | Veri Mühendisliği, Backend |
| **Berat Demirbaş** | Frontend, Dashboard Tasarımı |

📧 dgkn.bhsi@gmail.com · [GitHub](https://github.com/DogukanBahsi) · [LinkedIn](https://www.linkedin.com/in/dogukanbhs/)

---

<p align="center"><b>HotelReviewAI — Otel Yorumlarını Akıllı Veriye Dönüştürür 🚀</b></p>
