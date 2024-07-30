from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from LTtApp.views import RegisterView, edit_tour,  test_auth
from LTtApp.views import upload_tours, crear_valoracion
#from LTtApp.views import upload_tour
from LTtApp import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

#app_name = 'LTtApp'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    #path('signup/', vista_registro.as_view(), name='signup'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('', include('LTtApp.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('registration_success/', views.registration_success, name='registration_success'),
    path('profile/', views.profile, name='profile'),
    path('profile/get', views.search_user_by_id, name='search_user_by_email'),
    path('ruta-para-actualizar-perfil', views.update_profile, name='update_profile'),
    path('ruta-para-actualizar-imagen', views.upload_profile_image, name='upload_profile_image'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('profile/upload_tour/', upload_tours, name='upload_tour'),
    path('get_nearest_tours/', views.get_nearest_tours, name='get_nearest_tours'),
    path('tour/<int:tour_id>/', views.tour_detail, name='tour_detail'),
    path('get_latest_tours/', views.get_latest_tours, name='get_latest_tours'),
    path('get_random_tours/', views.get_random_tours, name='get_random_tours'),
    path('get_nearest_tours_all/', views.get_nearest_tours_all, name='get_nearest_tours_all'),
    path('all_tours/', views.all_tours, name='all_tours'),
    path('custom_tours_page/', views.custom_tours_page, name='custom_tours_page'),
    path('get_tour_distance/', views.get_tour_distance, name='get_tour_distance'),
    path('directions/<int:tour_id>/', views.directions, name='directions'),
    path('step/<int:tour_id>/<int:step_id>/', views.next_step, name='next_step'),
    #path('step/<int:tour_id>/<int:step_id>/', views.step_detail, name='step_detail'),
    path('api/tour/<int:tour_id>/step/<int:step_id>/', views.next_step, name='next_step'),
    path('csrf-token/', views.csrf_token_view, name='csrf_token'),
    path('encuesta/', views.upload_encuesta, name='encuesta'),
    #path('token-auth/', obtain_jwt_token),
    # JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/test_auth/', test_auth, name='test_auth'),
    path('tour-locations/<int:tour_id>/', views.get_tour_locations, name='tour-locations'),
    path('api/get_user_tours', views.get_user_tours, name='get_user_tours'),
    path('api/create-tour-record/', views.create_tour_record, name='create_tour_record'),
    path('api/get_user_tour_records', views.get_user_tour_records, name='get_user_tour_records'),
    path('api/get_routes', views.get_routes, name='get_routes'),
    path('crear_valoracion', crear_valoracion, name='crear_valoracion'),
    path('tour/<int:tour_id>/media-valoracion/', views.media_valoracion_tour, name='media-valoracion-tour'),
    path('api/get_tour_with_steps/<int:tour_id>/<str:languaje>/', views.get_tour_with_steps, name='get_tour_with_steps'),
    path('api/translate_and_save_tour/<int:tour_id>/', views.translate_and_save_tour, name='translate_and_save_tour'),
    path('api/edit_tour/<int:tour_id>/<int:size>/', views.edit_tour, name='edit_tour'),
    ##path('start_transcription_job/<int:tour_id>/', views.start_transcription_job, name='start_transcription_job'),
    ##path('translate_transcription/<int:tour_id>/', views.translate_transcription, name='translate_transcription'), 
    ##path('convert_text_to_audio/<int:tour_id>/', views.convert_text_to_audio, name='convert_text_to_audio'),
    ##path('copy-audios/', views.copy_audios_view, name='copy-audios'),
    ##path('copy-images/', views.copy_images_view, name='copy-images'),

    
    ]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#else:
    #urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)