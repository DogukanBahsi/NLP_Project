@echo off
chcp 65001 > nul
echo.
echo ================================================
echo  HotelReviewAI v2 - Frontend Kurulum
echo ================================================
echo.
echo [1/2] Paketler yukleniyor...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo HATA: npm install basarisiz!
    pause
    exit /b 1
)
echo.
echo [2/2] Gelistirme sunucusu baslatiliyor...
echo.
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:8000 (ayri terminalde calistirin)
echo.
call npm run dev
pause
