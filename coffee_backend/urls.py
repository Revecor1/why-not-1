from django.contrib import admin
from django.urls import path, include, re_path

from .frontend import serve_frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^(?P<path>.*)$', serve_frontend),
]