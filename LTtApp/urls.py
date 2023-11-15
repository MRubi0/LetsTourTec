from django.urls import path
from . import views

#app_name = 'LTtApp'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('', views.index, name='index'),
    path('index', views.index, name='index'),
    path('api/get_tour_with_steps/<int:tour_id>/', views.get_tour_with_steps, name='get_tour_with_steps')
    # Agrega aquí otras rutas específicas de la aplicación
]

