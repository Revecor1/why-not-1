@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Почему Нет? — установка проекта
echo ========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    where py >nul 2>&1
    if errorlevel 1 (
        echo [ОШИБКА] Python не найден. Установите Python 3.10+ с https://www.python.org/
        echo При установке отметьте "Add Python to PATH".
        pause
        exit /b 1
    )
    set PYTHON=py -3
) else (
    set PYTHON=python
)

echo [1/5] Создание виртуального окружения...
if not exist "venv\Scripts\python.exe" (
    %PYTHON% -m venv venv
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось создать venv
        pause
        exit /b 1
    )
)

echo [2/5] Установка зависимостей...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo [ОШИБКА] Не удалось установить зависимости
    pause
    exit /b 1
)

echo [3/5] Миграции базы данных...
python manage.py migrate --noinput
if errorlevel 1 (
    echo [ОШИБКА] Миграции не выполнены
    pause
    exit /b 1
)

echo [4/5] Заполнение меню и админа...
python seed_data.py
if errorlevel 1 (
    echo [ОШИБКА] seed_data.py завершился с ошибкой
    pause
    exit /b 1
)

echo [5/5] Проверка проекта...
python manage.py check
python manage.py test api --verbosity 0
if errorlevel 1 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Тесты не прошли — проверьте вывод выше
)

echo.
echo ========================================
echo   Установка завершена!
echo   Запуск: start.bat
echo   Сайт:   http://127.0.0.1:8000/
echo   Админ:  admin / admin123
echo ========================================
pause