from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from PIL import Image
from django.db.models import F, Func, Q
from django.db.models import ExpressionWrapper, FloatField

from django.urls import reverse_lazy
from django.views import generic
from django.http import JsonResponse, HttpResponseBadRequest
import sqlite3
import math
from math import radians, sin, cos, sqrt, atan2
from .forms import GuideForm, AudioFileForm, ImageFileForm, LocationForm, CustomUserCreationForm
from .models import Guide, AudioFile, ImageFile, Location, CustomUser, Tour

from django.contrib import messages

from .forms import EditProfileForm
import random

from django import forms
from django.contrib.auth.decorators import login_required

from .forms import TourForm
from .models import Tour

from django.db.models.expressions import RawSQL
from django.db import connection

from django.core.paginator import Paginator
from django.core import serializers



def haversine(lat1, lon1, lat2, lon2):
    # Radio de la Tierra en km
    R = 6371.0

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c



@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = EditProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Tu perfil ha sido actualizado correctamente.')
            return redirect('profile')
    else:
        form = EditProfileForm(instance=request.user)
    return render(request, 'user/edit_profile.html', {'form': form})

@login_required
def profile(request):
    return render(request, 'user/profile.html', {'user': request.user})

'''
class vista_registro(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'


def login(request):
    return render(request, 'login.html')

def register(request):
    return render(request, 'register.html')
'''


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            print(f"User: {user}")
            login(request, user)
            return redirect('index')
        else:
            print("Form is not valid")
            print(form.errors)
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('registration_success')  # Redirige a la página de éxito
        else:
            messages.error(request, "Ha ocurrido un error en el registro. Por favor, verifica tus datos e inténtalo de nuevo.")
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

def registration_success(request):
    return render(request, 'registration/success.html')


def index(request):
    last_naturaleza = Tour.objects.filter(tipo_de_tour="naturaleza").order_by('-created_at').first()
    last_cultural = Tour.objects.filter(tipo_de_tour="cultural").order_by('-created_at').first()
    last_ocio = Tour.objects.filter(tipo_de_tour="ocio").order_by('-created_at').first()



    # Crear una lista con los tours obtenidos
    latest_tours = [last_ocio, last_naturaleza, last_cultural]

    # Eliminar posibles valores None en caso de que no haya tours de algún tipo
    latest_tours = [tour for tour in latest_tours if tour is not None]

    context = {'tours': latest_tours}
    return render(request, 'index.html', context)




def create_guide(request):
    # Lógica para crear una guía
    # ...
    return render(request, 'under_construction.html')

def edit_guide(request, guide_id):
    # Lógica para editar una guía
    # ...
    return render(request, 'under_construction.html')

def upload_audio(request, guide_id):
    # Lógica para subir archivos de audio
    # ...
    return render(request, 'under_construction.html')

def upload_image(request, guide_id):
    # Lógica para subir imágenes
    # ...
    return render(request, 'under_construction.html')

def add_location(request, guide_id):
    # Lógica para agregar ubicaciones
    # ...
    return render(request, 'under_construction.html')


@login_required
def upload_tour(request):
    error_message = None
    if request.method == 'POST':
        form = TourForm(request.POST, request.FILES)
        if form.is_valid():
            tour = form.save(commit=False)
            tour.user = request.user
            tour.image = request.FILES['imagen'] if 'imagen' in request.FILES else None

            tour.save()

            # Procesar pasos adicionales
            for i in range(100):
                extra_audio_key = f'extra_step_audio_{i}'
                
                if extra_audio_key in request.FILES:
                    extra_audio = request.FILES[extra_audio_key]
                    
                    extra_image = None
                    extra_latitude = None
                    extra_longitude = None

                    extra_image_key = f'extra_step_image_{i}'
                    if extra_image_key in request.FILES:
                        extra_image = request.FILES[extra_image_key]

                    extra_latitude_key = f'extra_step_latitude_{i}'
                    if extra_latitude_key in request.POST and request.POST[extra_latitude_key]:
                        extra_latitude = float(request.POST[extra_latitude_key])

                    extra_longitude_key = f'extra_step_longitude_{i}'
                    if extra_longitude_key in request.POST and request.POST[extra_longitude_key]:
                        extra_longitude = float(request.POST[extra_longitude_key])

                    paso = Paso(tour=tour, audio=extra_audio)
                    
                    if extra_image:
                        paso.image = extra_image
                    if extra_latitude:
                        paso.latitude = extra_latitude
                    if extra_longitude:
                        paso.longitude = extra_longitude

                    paso.save()
                else:
                    break

            return redirect('index')
        else:
            error_message = 'Hubo un error al subir el tour. Asegúrate de haber seleccionado una imagen y un archivo de audio válidos.'
    else:
        form = TourForm()
    return render(request, 'user/upload_tour.html', {'form': form, 'error_message': error_message})


def sqlite_haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c



def get_nearest_tours(request):
    latitud_usuario = float(request.GET.get('latitude', None))
    longitud_usuario = float(request.GET.get('longitude', None))

    if latitud_usuario is None or longitud_usuario is None:
        return JsonResponse({"error": "Faltan parámetros: latitude y/o longitude"}, status=400)

    # Aquí iría la lógica para buscar los tours más cercanos
    tours = Tour.objects.all()
    tours_with_distances = []
    for tour in tours:
        distance = haversine(latitud_usuario, longitud_usuario, tour.latitude, tour.longitude)
        tours_with_distances.append({'tour': tour, 'distance': distance})

    tour_categories = ['ocio', 'naturaleza', 'cultural']
    nearest_tours = {}

    for category in tour_categories:
        # Ordenar por distancia y filtrar por categoría
        filtered_tours = sorted(
            filter(lambda x: x['tour'].tipo_de_tour == category, tours_with_distances),
            key=lambda x: x['distance']
        )
        # Tomar el primer tour de la lista, que es el más cercano
        if filtered_tours:
            tour = filtered_tours[0]['tour']
            nearest_tours[category] = {
                'id': tour.id,
                'titulo': tour.titulo,
                'descripcion': tour.descripcion,
                'tipo_de_tour': tour.tipo_de_tour,
                'imagen': {'url': tour.imagen.url},
                'distance': filtered_tours[0]['distance'],
                'duracion': tour.duracion,
                'recorrido': tour.recorrido,
            }

    # Devolver los tours más cercanos como respuesta JSON
    return JsonResponse(nearest_tours)


'''

def get_nearest_tours(request):

    #connection.ensure_connection()
    #connection.connection.create_function("haversine", 4, sqlite_haversine)



 
    latitud_usuario = float(request.GET.get('latitude', None))
    longitud_usuario = float(request.GET.get('longitude', None))

    if latitud_usuario is None or longitud_usuario is None:
        return JsonResponse({"error": "Faltan parámetros: latitude y/o longitude"}, status=400)

    
    '''
    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except ValueError:
        return JsonResponse({"error": "Los parámetros latitude y longitude deben ser números"}, status=400)
    '''
    # Aquí iría la lógica para buscar los tours más cercanos

    tours = Tour.objects.all()
    tours_with_distances = []
    for tour in tours:
            distance = haversine(latitud_usuario, longitud_usuario, tour.latitude, tour.longitude)
            tours_with_distances.append({'tour': tour, 'distance': distance})    

    tour_categories = ['ocio', 'naturaleza', 'cultural']
    nearest_tours = {}
    tours_with_distances.sort(key=lambda x: x['distance'])
    nearest_tours = tours_with_distances[:5]

        # Construye una respuesta JSON con la información de los tours
    response_data = [{'tour_id': t['tour'].id, 'distance': t['distance']} for t in nearest_tours]

    for category in tour_categories:
        tour = Tour.objects.annotate(
    distance=RawSQL("haversine(%s, %s, latitude, longitude)", (latitude, longitude,))
).filter(tipo_de_tour=category).order_by('distance').first()


        if tour:
            nearest_tours[category] = {
                'id': tour.id,
                'titulo': tour.titulo,
                'descripcion': tour.descripcion,
                'tipo_de_tour': tour.tipo_de_tour,
                'imagen': {
                    'url': tour.imagen.url
                },
                'distance': tour.distance,
                'duracion': tour.duracion,
                'recorrido': tour.recorrido, 
            }

    # Devolver los tours más cercanos como respuesta JSON
    response_data = {
        'tour_ocio': nearest_tours.get('ocio', None),
        'tour_naturaleza': nearest_tours.get('naturaleza', None),
        'tour_cultural': nearest_tours.get('cultural', None),
    }
    return JsonResponse(response_data)

#return HttpResponseBadRequest()
'''



def tour_detail(request, tour_id):
    tour = get_object_or_404(Tour, pk=tour_id)
    context = {'tour': tour}
    return render(request, 'tour_detail.html', context)



def get_latest_tours(request):
    # Lista de tipos de tours
    tour_types = ['ocio', 'naturaleza', 'cultural']

    # Consulta el último tour de cada tipo
    tour_data = {}
    for t in tour_types:
        try:
            latest_tour = Tour.objects.filter(tipo_de_tour=t).latest('created_at')
            tour_data[t] = {
                'id': latest_tour.id,
                'titulo': latest_tour.titulo,
                'descripcion': latest_tour.descripcion,
                'tipo_de_tour': latest_tour.tipo_de_tour,
                'imagen': {
                    'url': latest_tour.imagen.url,
                },
                'recorrido': latest_tour.recorrido,
                'duracion': latest_tour.duracion,
            }
        except Tour.DoesNotExist:
            # No hay tours para este tipo
            pass

    return JsonResponse(tour_data)


def get_random_tours(request):
    # Obtén todos los tours de las categorías
    ocio_tours = Tour.objects.filter(tipo_de_tour="ocio")
    naturaleza_tours = Tour.objects.filter(tipo_de_tour="naturaleza")
    cultural_tours = Tour.objects.filter(tipo_de_tour="cultural")

    # Elige un tour aleatorio de cada categoría
    random_tours = {
        "ocio": random.choice(ocio_tours) if ocio_tours else None,
        "naturaleza": random.choice(naturaleza_tours) if naturaleza_tours else None,
        "cultural": random.choice(cultural_tours) if cultural_tours else None,
    }

    # Convierte los objetos de los tours en diccionarios para que puedan ser serializados a JSON
    random_tours_json = {}
    for key, tour in random_tours.items():
        if tour:
            random_tours_json[key] = tour.as_dict()

    return JsonResponse(random_tours_json)


def get_nearest_tours_all(request):
    connection.ensure_connection()
    connection.connection.create_function("haversine", 4, sqlite_haversine)

    latitude_str = request.GET.get('latitude', None)
    longitude_str = request.GET.get('longitude', None)

    if latitude_str is not None and latitude_str != 'None':
        latitude = float(latitude_str)
    else:
        latitude = None

    if longitude_str is not None and longitude_str != 'None':
        longitude = float(longitude_str)
    else:
        longitude = None

    page = request.GET.get('page', 1)  # Obtiene el número de página de los parámetros GET
    per_page = 15  # Establece la cantidad de tours por página

    if latitude is None or longitude is None:
        # Devuelve todos los tours sin ordenar por distancia
        tours = Tour.objects.all()
    else:
        # Ordena los tours por distancia
        tours = list(Tour.objects.annotate(
            distance=RawSQL("haversine(%s, %s, latitude, longitude)", (latitude, longitude,))
        ).order_by('distance'))

    paginator = Paginator(tours, per_page)  # Divide la lista de tours en páginas
    current_page_tours = paginator.get_page(page)  # Obtiene la página actual

    # Serializa solo los objetos de tour en la página actual
    serialized_tours = [{
        'id': tour.id,
        'titulo': tour.titulo,
        'descripcion': tour.descripcion,
        'tipo_de_tour': tour.tipo_de_tour,
        'imagen': {
            'url': tour.imagen.url
        },
        'distance': getattr(tour, 'distance', None),
        'recorrido': tour.recorrido,
        'duracion': tour.duracion,} for tour in current_page_tours]

    response_data = {
        'tours': serialized_tours,
        'total_pages': paginator.num_pages  # Devuelve el número total de páginas
    }

    return JsonResponse(response_data)


def all_tours(request):
    # Obtenemos todos los tours disponibles
    tours = Tour.objects.all()

    # Pasamos los tours al contexto de la plantilla
    context = {'tours': tours}
    return render(request, 'all_tours.html', context)

def custom_tours_page(request):
    latitude = request.GET.get('latitude', None)
    longitude = request.GET.get('longitude', None)
    location = request.GET.get('location', 'la ubicación buscada')
    context = {'latitude': latitude, 'longitude': longitude, 'location': location}
    return render(request, 'custom_tours_page.html', context)
