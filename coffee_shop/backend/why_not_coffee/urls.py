"""
URL маршруты проекта «Почему нет?»
Глава 1.3.4 курсовой: API-эндпоинты (маршруты приложения)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Админ-панель Django
    path('admin/', admin.site.urls),
    
    # Маршруты приложений
    path('', include('menu.urls')),        # Главная + Меню
    path('', include('users.urls')),       # Регистрация, вход, профиль
    path('', include('orders.urls')),      # Корзина, заказы
    path('support/', include('support.urls')), # Техподдержка (Глава 3.5)
    path('book/', include('reservations.urls')), # Бронирование (Глава 1.3/4.1)
]

# Раздача медиа-файлов в режиме отладки (Глава 3)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
