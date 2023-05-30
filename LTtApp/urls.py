from django.urls import path
from . import views

#app_name = 'LTtApp'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('', views.index, name='index'),
    path('index', views.index, name='index'),
    # Agrega aquí otras rutas específicas de la aplicación
]

