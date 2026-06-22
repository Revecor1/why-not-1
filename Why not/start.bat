@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
    echo Виртуальное окружение не найдено. Запускаю установку...
    call setup.bat
    if errorlevel 1 exit /b 1
)

call venv\Scripts\activate.bat

echo ========================================
echo   Почему Нет? — сервер запущен
echo   Сайт:  http://127.0.0.1:8000/
echo   Админ: http://127.0.0.1:8000/admin.html
echo   Логин: admin / admin123
echo   Остановка: Ctrl+C
echo ========================================
echo.

start "" "http://127.0.0.1:8000/"
python manage.py runserver 127.0.0.1:8000