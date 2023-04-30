from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from LTtApp.views import vista_registro
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', vista_registro.as_view(), name='signup'),
    path('', include('LTtApp.urls')),
    path('create_guide/', views.create_guide, name='create_guide'),
    path('edit_guide/<int:guide_id>/', views.edit_guide, name='edit_guide'),
    path('upload_audio/<int:guide_id>/', views.upload_audio, name='upload_audio'),
    path('upload_image/<int:guide_id>/', views.upload_image, name='upload_image'),
    path('add_location/<int:guide_id>/', views.add_location, name='add_location'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)