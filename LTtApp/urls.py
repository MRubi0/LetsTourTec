from django.urls import path
from . import views

urlpatterns = [
    path('app/login/', views.login_view, name='login'),
    path('app/register/', views.register_view, name='register'),
    path('app/', views.index, name='index'),
    # Agrega aquí otras rutas específicas de la aplicación
]