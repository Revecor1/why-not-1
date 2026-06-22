from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CSRFView, AuthView, MenuViewSet, OrderViewSet, ReservationViewSet, ChatViewSet, NewsViewSet

router = DefaultRouter()
router.register(r'menu', MenuViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'chats', ChatViewSet, basename='chat')
router.register(r'news', NewsViewSet, basename='news')

urlpatterns = [
    path('', include(router.urls)),
    path('csrf/', CSRFView.as_view(), name='csrf'),
    path('auth/<str:action>/', AuthView.as_view(), name='auth'),
]
