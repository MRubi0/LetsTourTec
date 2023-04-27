from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from LTtApp.views import vista_registro

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', vista_registro.as_view(), name='signup'),
    path('', include('LTtApp.urls')),
]
