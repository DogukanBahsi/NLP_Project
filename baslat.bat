@echo off
title HotelReviewAI - Proje Baslatici
color 0A
echo ===================================================
echo HotelReviewAI Otomatik Baslatma Sistemi
echo ===================================================
echo.
echo Lutfen acik olan tum siyah terminal (PowerShell/CMD) ekranlarini kapatin.
echo Bu script her seyi sifirdan ve otomatik olarak baslatacaktir.
echo.
pause

echo.
echo [1/2] Backend (FastAPI) sunucusu baslatiliyor...
start "HotelReviewAI - BACKEND" cmd /k "cd backend && echo Gerekli kutuphaneler kontrol ediliyor... && pip install -r requirements.txt && echo. && echo Backend baslatiliyor... && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 5 >nul

echo.
echo [2/2] Frontend (React) sunucusu baslatiliyor...
start "HotelReviewAI - FRONTEND" cmd /k "cd frontend && echo Frontend paketleri kontrol ediliyor... && npm install && echo. && echo Frontend baslatiliyor... && npm run dev"

echo.
echo ===================================================
echo Islem Tamamlandi!
echo 2 adet yeni siyah pencere acildi. 
echo - Biri Backend'i, digeri Frontend'i calistiriyor.
echo - Lutfen o iki pencereyi kapatmayin.
echo - Tarayicinizda http://localhost:5173/ adresine gidebilirsiniz.
echo ===================================================
pause
