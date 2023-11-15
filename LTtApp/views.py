from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from PIL import Image
from django.db.models import F, Func, Q
from django.db.models import ExpressionWrapper, FloatField
import json
from django.urls import reverse_lazy
from django.views import generic
from django.http import JsonResponse
import sqlite3
import math
from math import radians, sin, cos, sqrt, atan2
from .forms import GuideForm, AudioFileForm, ImageFileForm, LocationForm, CustomUserCreationForm
from .models import Guide, AudioFile, ImageFile, Location, CustomUser, Tour
#from .models import LTtApp_paso

from django.contrib import messages

from .forms import EditProfileForm
import random

from django import forms
from django.contrib.auth.decorators import login_required

from .forms import TourForm
from .models import Tour, Paso

from django.db.models.expressions import RawSQL
from django.db import connection

from django.core.paginator import Paginator
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
import folium
from django.views.decorators.csrf import csrf_exempt
from django.utils.crypto import get_random_string
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_auth(request):
    # Esta vista es solo para propósitos de testeo.
    return Response({'message': 'El token es válido y el usuario está autenticado'}, status=status.HTTP_200_OK)
@csrf_exempt
def csrf_token_view(request):
    """Obtiene el token CSRF de Django."""
    csrf_token = get_token(request)
    print('csrf_token ->', csrf_token);
    return JsonResponse({'csrf_token': csrf_token})
'''
def csrf_token_view(request):
    """Genera un token CSRF."""

    csrf_token = request.META.get('HTTP_X_CSRFTOKEN')
    if not csrf_token:
        #csrf_token = get_random_string(32)
        csrf_token = "sorry, here is the error"
    return JsonResponse({'csrf_token': csrf_token})
'''
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

# @csrf_exempt
# def login_view(request):
#     ###print('im here')
#     if request.method == 'POST':
#         form = AuthenticationForm(request, data=request.POST)
#         print(form)
#         if form.is_valid():
#             print(form)
#             user = form.get_user()
#             print(f"User: {user}")
#             login(request, user)
#             return redirect('index')
#         else:
#             print("Form is not valid")
#             print(form.errors)
#     else:
        
#         form = AuthenticationForm()
#         print(form)
#     return render(request, 'registration/login.html', {'form': form})

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        # Assuming you send 'username' and 'password' in the request body
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            # Return a JSON response indicating success
            return JsonResponse({'success': True})
        else:
            # Return a JSON response indicating failure
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    # If it's a GET request, you may want to handle it differently
    # This part depends on your application's logic
    return JsonResponse({'error': 'GET request not supported'}, status=405)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_tour(request):
    print("Solicitud recibida con los siguientes datos: %s", request.FILES)
    error_message = None
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    if auth_header:
        token = auth_header.split(' ')[1]
        print(f"Token recibido: {token}")
    else:
        print("No se encontró el header de autorización")
    
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Usuario no autenticado'}, status=401)
        print(request.POST)  
        print(request.FILES)  
        
        form = TourForm(request.POST, request.FILES)       
        if form.is_valid():
            tour = form.save(commit=False)
            tour.user = request.user
            tour.image = request.FILES['imagen'] if 'imagen' in request.FILES else None

            tour.save()
            print(tour)
            # Procesar pasos adicionales
            for i in range(100):
                extra_audio_key = f'extra_step_audio_{i}'
                
                if extra_audio_key in request.FILES:
                    extra_audio = request.FILES[extra_audio_key]
                    
                    extra_image = None
                    extra_latitude = None
                    extra_longitude = None
                    
                    extra_description_key = f'description_{i}'
                    if extra_description_key in request.POST:
                        extra_description = request.POST.get(extra_description_key, '')

                    paso = Paso(tour=tour, audio=extra_audio, description=extra_description)

                    extra_image_key = f'extra_step_image_{i}'
                    if extra_image_key in request.FILES:
                        extra_image = request.FILES[extra_image_key]
                        paso.image = extra_image

                    extra_latitude_key = f'extra_step_latitude_{i}'
                    if extra_latitude_key in request.POST and request.POST[extra_latitude_key]:
                        extra_latitude = float(request.POST[extra_latitude_key])

                    extra_longitude_key = f'extra_step_longitude_{i}'
                    if extra_longitude_key in request.POST and request.POST[extra_longitude_key]:
                        extra_longitude = float(request.POST[extra_longitude_key])

                    
                    print(paso)
                    #if extra_image:
                        #.image = extra_image
                    if extra_latitude:
                        paso.latitude = extra_latitude
                    if extra_longitude:
                        paso.longitude = extra_longitude

                    paso.save()
                else:
                    print
                    print(i)
                    print(request.POST)  
                    print(request.FILES)  
                    print("aviso a navegantes")
                    break
                    

            return redirect('index')
        else:
            

            error_message = 'Hubo un error al subir el tour. Asegúrate de haber seleccionado una imagen y un archivo de audio válidos.'
            print(form.errors)
            return Response({'errors': form.errors}, status=400)
    else:
        return Response({'error': 'Invalid request method'}, status=405)
    return render(request, 'user/upload_tour.html', {'form': form, 'error_message': error_message})


@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        # Cargamos el cuerpo de la solicitud (que es un JSON) en un diccionario de Python
        data = json.loads(request.body.decode('utf-8'))
        print(data)
        # En lugar de usar request.POST, usamos el diccionario data que acabamos de crear
        form = CustomUserCreationForm(data)
        
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({"success": True, "message": "Registration successful!"})
        else:
            errors = {}
            for field, error_list in form.errors.as_data().items():
                errors[field] = [str(error) for error in error_list]
            print(errors)
            messages.error(request, "Ha ocurrido un error en el registro. Por favor, verifica tus datos e inténtalo de nuevo.")

            return JsonResponse({
                "success": False,
                "message": "Error in registration. Please verify your data and try again.",
                "errors": errors
            })            
    else:
        form = CustomUserCreationForm()

    return JsonResponse({"success": False, "message": "Invalid request method."})

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

    result = []

    for category in tour_categories:
        # Ordenar por distancia y filtrar por categoría
        filtered_tours = sorted(
            filter(lambda x: x['tour'].tipo_de_tour == category, tours_with_distances),
            key=lambda x: x['distance']
        )
    # Tomar el primer tour de la lista, que es el más cercano
        if filtered_tours:
            tour = filtered_tours[0]['tour']
            tour_object = {
                'id': tour.id,
                'titulo': tour.titulo,
                'descripcion': tour.descripcion,
                'tipo_de_tour': tour.tipo_de_tour,
                'imagen': {'url': tour.imagen.url},
                'distance': filtered_tours[0]['distance'],
                'duracion': tour.duracion,
                'recorrido': tour.recorrido,
            }
        result.append(tour_object)

    return JsonResponse(result, safe=False)


def tour_detail(request, tour_id):
    # Obtener el tour
    tour = get_object_or_404(Tour, pk=tour_id)

    # Imprimir latitud y longitud
    print("Tour Lat: ", tour.latitude)
    print("Tour Lng: ", tour.longitude)
    
    if tour.imagen:
        print("Image URL: ", tour.imagen.url)
    if tour.audio:
        print("Audio URL: ", tour.audio.url)
    context = {
        'tour': tour, 
        'user': request.user,
    }
    return render(request, 'tour_detail.html', context)



def get_latest_tours(request):
    # Lista de tipos de tours
    tour_types = ['ocio', 'naturaleza', 'cultural']

    # Consulta el último tour de cada tipo
    tour_data = {}

    result = []

    for t in tour_types:
        try:
            latest_tour = Tour.objects.filter(tipo_de_tour=t).latest('created_at')
            tour_data = {
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
            result.append(tour_data)
        except Tour.DoesNotExist:
            # No hay tours para este tipo
            pass

    return JsonResponse(result, safe=False)


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
    result=[]
    for key, tour in random_tours.items():

        if tour:

            random_tours_json= tour.as_dict()
            random_tours_json['id'] = tour.id
            
            random_tours_json['imagen']={
                'url': random_tours_json['imagen']
            }                       
            result.append(random_tours_json)
                
            
    print(result)
    return JsonResponse(result,safe=False)


def get_tour_distance(request):
    tour_id = request.GET.get('tourId')
    latitud_usuario = request.GET.get('latitude', None)
    longitud_usuario = request.GET.get('longitude', None)

    if latitud_usuario is None or longitud_usuario is None:
        return JsonResponse({"error": "Faltan parámetros: latitude y/o longitude"}, status=400)

    if latitud_usuario != 'None':
        latitud_usuario = float(latitud_usuario)
    else:
        latitud_usuario = None

    if longitud_usuario != 'None':
        longitud_usuario = float(longitud_usuario)
    else:
        longitud_usuario = None

    tour = Tour.objects.get(id=tour_id)

    

    distance = haversine(latitud_usuario, longitud_usuario, tour.latitude, tour.longitude)
    
    tour_data = serializers.serialize('python', [tour])

    tour_data[0]['fields']['distance']=distance
    return JsonResponse(
         tour_data, safe=False
    )

def get_nearest_tours_all(request):
    latitud_usuario = request.GET.get('latitude', None)
    longitud_usuario = request.GET.get('longitude', None)

    if latitud_usuario is None or longitud_usuario is None:
        return JsonResponse({"error": "Faltan parámetros: latitude y/o longitude"}, status=400)

    if latitud_usuario != 'None':
        latitud_usuario = float(latitud_usuario)
    else:
        latitud_usuario = None

    if longitud_usuario != 'None':
        longitud_usuario = float(longitud_usuario)
    else:
        longitud_usuario = None


    # Obtener todos los tours
    tours = Tour.objects.all()
    tours_with_distances = []
    if latitud_usuario != None or longitud_usuario != None:
        for tour in tours:
            distance = haversine(latitud_usuario, longitud_usuario, tour.latitude, tour.longitude)
            tours_with_distances.append({'tour': tour, 'distance': distance})
        sorted_tours = sorted(tours_with_distances, key=lambda x: x['distance'])
    else:
        for tour in tours:
            tours_with_distances.append({'tour': tour, 'id': tour.id, 'distance': None})
        sorted_tours = sorted(tours_with_distances, key=lambda x: x['id'])

    # Ordenar todos los tours por distancia
    

    per_page = 15  # Establece la cantidad de tours por página
    page = request.GET.get('page', 1)  # Obtiene el número de página de los parámetros GET
    # Paginar los resultados
    paginator = Paginator(sorted_tours, per_page)
    current_page_tours = paginator.get_page(page)

    # Serializar solo los objetos de tour en la página actual
    serialized_tours = [{
        'id': tour['tour'].id,
        'titulo': tour['tour'].titulo,
        'descripcion': tour['tour'].descripcion,
        'tipo_de_tour': tour['tour'].tipo_de_tour,
        'imagen': {'url': tour['tour'].imagen.url},
        'distance': tour['distance'],
        'recorrido': tour['tour'].recorrido,
        'duracion': tour['tour'].duracion,
    } for tour in current_page_tours]

    response_data = {
        'tours': serialized_tours,
        'total_pages': paginator.num_pages  # Devuelve el número total de páginas
    }

    # Devolver los tours más cercanos como respuesta JSON
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


def directions(request, tour_id):
    tour = Tour.objects.get(pk=tour_id)
    print(f"Latitud del tour: {tour.latitude}")
    print(f"Longitud del tour: {tour.longitude}")
     # Obtiene el primer paso del tour
    try:
        first_step = tour.paso_set.order_by('id').first()
        if first_step:
            step_id = first_step.id
        else:
            step_id = None
            # Aquí podrías manejar el caso en el que un tour no tenga pasos
    except Paso.DoesNotExist:
        step_id = None
        # Aquí podrías manejar el caso en el que un tour no tenga pasos

    # Pasa el tour y el step_id al contexto de la plantilla
    return render(request, 'directions.html', {'tour': tour, 'step_id': step_id})

@api_view(['GET'])
##@permission_classes([IsAuthenticated])
def get_tour_with_steps(request, tour_id):
    try:
        tour = get_object_or_404(Tour, pk=tour_id)
        steps = Paso.objects.filter(tour=tour)

        tour_data = {
            "id": tour.id,
            "latitude": tour.latitude,
            "longitude": tour.longitude,
            "titulo": tour.titulo,
            "image": tour.imagen.url,
            "audio": tour.audio.url,
            "steps": []
        }

        for step in steps:
            tour_data["steps"].append({
                "id": step.id,
                "image":step.image.url if step.image else None,                
                "audio": step.audio.url if step.audio else None,
                "latitude":step.latitude,
                "longitude":step.longitude,
                "description": step.description,
            })

        return Response(tour_data)
    except Tour.DoesNotExist:
        return Response({"error": "Tour no encontrado"}, status=status.HTTP_404_NOT_FOUND)




def get_tour_data(tour_id):
    print('init')
    tour_objects = Tour.objects.get(id=tour_id)  # Esto obtiene todos los objetos de Tour en la base de datos
    tour_data = []
    for tour in tour_objects:
        tour_data.append({
            "latitude": tour.latitude,
            "longitude": tour.longitude,
            "titulo": tour.titulo
        })
    return tour_data


def create_map(tour_data):
    m = folium.Map(location=[20, 0], zoom_start=2.5)

    for data in tour_data:
        folium.Marker(
            location=[data["latitude"], data["longitude"]],
            popup=data["titulo"],
            icon=folium.Icon(icon="cloud"),
        ).add_to(m)

    m.save('LTtApp/templates/LTtApp/map.html')


def map_view(request):
    tour_data = get_tour_data()
    create_map(tour_data)
    return render(request, 'LTtApp/map.html')

def debug_tour(request, tour_id):
    # asumimos que obtenes tu tour de esta manera
    tour = Tour.objects.get(id=tour_id)
    
    # imprimimos todos los atributos y valores del tour
    print(vars(tour))


def next_step(request, tour_id, step_id=None):
    print(f"Handling next_step request for tour_id={tour_id}, step_id={step_id}")

    try:
        # Encuentra el tour por su ID
        tour = Tour.objects.get(pk=tour_id)
        print(f"Found tour: {tour}")
        # Encuentra el paso actual
        current_step = Paso.objects.get(pk=step_id)
        print(f"Found current step: {current_step}")

        # Intenta encontrar el siguiente paso
        try:
            #next_step = Paso.objects.filter(tour_id=tour_id, id__gt=current_step.id).order_by('id').first()
            next_step = Paso.objects.filter(tour_id=tour_id, id__gte=current_step.id).order_by('id').first()

            print(f"Found next step: {next_step}")
        except Paso.DoesNotExist:
            print(f"No more steps found for tour_id={tour_id}")
            return JsonResponse({'error': 'No more steps'}, status=404)


        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Retornar los datos del próximo paso
            if next_step is not None:
                response = {
                    'latitude': next_step.latitude,
                    'longitude': next_step.longitude
                    # Incluye cualquier otra información que necesites para el siguiente paso
                }
                print(f"Returning response: {response}")  # Imprime la respuesta antes de devolverla
                return JsonResponse(response)
            else:
                return JsonResponse({'message': 'End of tour'}, status=200)

        # Si no es una solicitud AJAX, renderiza una plantilla
        else:
            return render(request, 'step.html', {'tour': tour, 'step': next_step})

    except Tour.DoesNotExist:
        print(f"No tour found with tour_id={tour_id}")
        return JsonResponse({'error': 'Tour not found'}, status=404)
    except Paso.DoesNotExist:
        print(f"No step found with step_id={step_id}")
        return JsonResponse({'error': 'Step not found'}, status=404)

def step_detail(request, tour_id, step_id):
    try:
        # Encuentra el tour por su ID
        tour = Tour.objects.get(pk=tour_id)

        # Encuentra el paso por su ID
        step = Paso.objects.get(pk=step_id)

        # Verifica que el paso pertenezca al tour
        if step.tour != tour:
            raise Paso.DoesNotExist()
        
        # Intenta encontrar el siguiente paso
        try:
            next_step = Paso.objects.filter(tour_id=tour_id, id__gt=step_id).order_by('id').first()
        except Paso.DoesNotExist:
            next_step = None


        # Pasa el tour y el paso al contexto de la plantilla
        return render(request, 'step.html', {'tour': tour, 'step': step, 'next_step': next_step})

    except Tour.DoesNotExist:
        # Manejo del error cuando no se encuentra el tour
        return HttpResponseNotFound('Tour not found')

    except Paso.DoesNotExist:
        # Manejo del error cuando no se encuentra el paso o el paso no pertenece al tour
        return HttpResponseNotFound('Step not found or does not belong to this tour')
    
def get_tour_locations(request, tour_id):
    try:
        
        tour = Tour.objects.get(id=tour_id)
        
        pasos = Paso.objects.filter(tour=tour)

        
        locations = [{'lat': paso.latitude, 'long': paso.longitude} for paso in pasos if paso.latitude and paso.longitude]

        return JsonResponse({'locations': locations})

    except Tour.DoesNotExist:
        return JsonResponse({'error': 'Tour no encontrado'}, status=404)
