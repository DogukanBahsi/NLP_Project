# NLP Tabanlı Otel & Restoran Yorum Analizi

Bu proje, otel ve restoran müşteri yorumlarını analiz ederek:
- Duygu analizi yapar
- Şikayet konularını otomatik tespit eder
- Yöneticiye karar destek özeti sunar

---

# Proje Amacı

Binlerce müşteri yorumunu manuel incelemek yerine, bu yorumlardan:
- Genel memnuniyet durumu
- Tekrarlayan problemler
- Aksiyon alınabilir içgörüler

otomatik olarak çıkarılmaktadır.

---

# Kullanılan Yöntemler

- Metin ön işleme (lowercase, regex temizleme)
- TF-IDF (özellik çıkarımı)
- Logistic Regression (sınıflandırma)
- Kural tabanlı şikayet analizi
- Basit karar destek sistemi

---

# Model Performansı

- Accuracy: %90
- Macro F1-score: 0.87

Model, özellikle pozitif yorumları yüksek doğrulukla tespit etmektedir.

---

# Özellikler

-Duygu analizi (pozitif / negatif)  
-Şikayet tespiti (temizlik, personel, fiyat vb.)  
-Yönetici özeti oluşturma  
-Hata analizi  

---

# Sistem Akışı

Veri (CSV)  
→ Metin Temizleme  
→ TF-IDF  
→ Model (Logistic Regression)  
→ Şikayet Analizi  
→ Yönetici Özeti  

---

# Örnek Çıktı

**Şikayetler:**
- temizlik
- gürültü
- oda

**Yönetici Özeti:**
- Temizlik ekipleri denetlenmeli
- Personel eğitimi artırılmalı

---

# Kullanılan Teknolojiler

- Python
- Pandas
- Scikit-learn
- Regex

---

# Geliştiriciler

- Ramazan Doğukan Bahşi
- Yasin Almaz
- Berat Demirbaş


---

## 📌 Not

Bu proje bir Doğal Dil İşleme (NLP) ders projesi kapsamında geliştirilmiştir.
