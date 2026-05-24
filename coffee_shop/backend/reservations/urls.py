from django.urls import path
from .views import book_view

urlpatterns = [
    path('book/', book_view, name='book'),
]
