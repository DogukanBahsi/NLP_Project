# NLP Project - Claude Code Guide

## Proje Tanımı
Bu proje, otel ve restoran yorumlarını NLP (Doğal Dil İşleme) yöntemleriyle analiz eden, Python tabanlı bir akıllı analiz arayüzüdür. Proje `backend`, `frontend` ve `Data` olmak üzere modüler bir yapıya sahiptir.

## Komutlar (Build & Run Commands)
Claude, projeyi test etmek veya çalıştırmak istediğinde aşağıdaki komutları kullanmalıdır:

- **Backend Çalıştırma:** `python Main.py` veya `python backend/app.py` (Projenin ana giriş noktasına göre revize et)
- **Toplu Başlatma scripti:** `baslat.bat`
- **Gereksinimleri Yükleme:** `pip install -r requirements.txt`

## Kodlama Prensipleri (Code Style & Guidelines)
- **Dil:** Python kodları PEP 8 standartlarına uygun olmalı, temiz ve açıklayıcı yorum satırları içermelidir.
- **Hata Yönetimi:** Tüm NLP veri işleme ve model yükleme adımlarında `try-except` blokları kullanılarak loglama yapılmalıdır.
- **Git Commit Kuralları:** Değişiklik yaptıktan sonra commit mesajları net olmalıdır (Örn: `feat(backend): sentiment analizi modeli entegre edildi`).