from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from LTtApp.views import register_view, upload_tour
from LTtApp import views
from django.conf import settings
from django.conf.urls.static import static


#app_name = 'LTtApp'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    #path('signup/', vista_registro.as_view(), name='signup'),
    path('register/', register_view, name='register'),
    path('', include('LTtApp.urls')),
    path('create_guide/', views.create_guide, name='create_guide'),
    path('edit_guide/<int:guide_id>/', views.edit_guide, name='edit_guide'),
    path('upload_audio/<int:guide_id>/', views.upload_audio, name='upload_audio'),
    path('upload_image/<int:guide_id>/', views.upload_image, name='upload_image'),
    path('add_location/<int:guide_id>/', views.add_location, name='add_location'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('registration_success/', views.registration_success, name='registration_success'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('profile/upload_tour/', upload_tour, name='upload_tour'),
    path('get_nearest_tours/', views.get_nearest_tours, name='get_nearest_tours'),
    path('tour/<int:tour_id>/', views.tour_detail, name='tour_detail'),
    path('get_latest_tours/', views.get_latest_tours, name='get_latest_tours'),
    path('get_random_tours/', views.get_random_tours, name='get_random_tours'),
    path('get_nearest_tours_all/', views.get_nearest_tours_all, name='get_nearest_tours_all'),
    path('all_tours/', views.all_tours, name='all_tours'),
    path('custom_tours_page/', views.custom_tours_page, name='custom_tours_page'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)