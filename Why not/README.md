# Почему Нет? — кофейня (дипломный проект)

Django REST API + статический фронтенд. Всё работает **с одного сервера** на порту 8000.

## Требования

- **Windows 10/11**
- **Python 3.10 или новее** — [python.org](https://www.python.org/downloads/)
  - При установке включите **«Add Python to PATH»**

## Перенос на другой компьютер

1. Скопируйте **всю папку проекта** на флешку / в облако.
2. **Не копируйте** папку `venv` (она привязана к старому ПК) — на новом ПК создастся заново.
3. На новом компьютере запустите **`setup.bat`** (один раз).
4. Для работы запускайте **`start.bat`**.

## Быстрый старт

```
setup.bat    ← первый запуск (установка)
start.bat    ← каждый раз (сайт + API)
```

Откройте в браузере: **http://127.0.0.1:8000/**

| Раздел | Адрес |
|--------|-------|
| Главная | http://127.0.0.1:8000/ |
| Меню и бронь | http://127.0.0.1:8000/menu.html |
| Новости | http://127.0.0.1:8000/news.html |
| Вход | http://127.0.0.1:8000/auth.html |
| Панель админа | http://127.0.0.1:8000/admin.html |
| Django Admin | http://127.0.0.1:8000/admin/ |

**Администратор:** `admin` / `admin123`

## Ручной запуск (если bat не работает)

```cmd
cd путь\к\проекту
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
python seed_data.py
python manage.py runserver
```

## Структура

| Папка / файл | Назначение |
|--------------|------------|
| `api/` | Модели, API, валидация |
| `coffee_backend/` | Настройки Django |
| `js/`, `css/`, `*.html` | Фронтенд |
| `seed_data.py` | Меню и тестовый админ |
| `db.sqlite3` | База (создаётся при migrate) |
| `requirements.txt` | Зависимости Python |

## Важно

- **Не открывайте** HTML через `file://` — авторизация и корзина не будут работать.
- Используйте только **`start.bat`** или `runserver` — сайт и API на одном адресе.
- Часовой пояс бронирования: **Europe/Samara** (Ульяновск).

## Тесты

```cmd
venv\Scripts\activate.bat
python manage.py test api
```