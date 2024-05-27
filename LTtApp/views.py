import base64
import json
import math
import os
import random
import requests
import sqlite3
import time
from datetime import datetime
from math import atan2, cos, radians, sin, sqrt
from django.db import transaction
from botocore.exceptions import ClientError
import boto3
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core import serializers
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.paginator import Paginator
from django.db import OperationalError, connection
from django.db.models import Avg, ExpressionWrapper, F, FloatField, Func, Q
from django.db.models.expressions import RawSQL
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.views import generic
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_POST
from PIL import Image
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .forms import (
    AudioFileForm, CustomUserCreationForm, EditProfileForm, EncuestaForm,
    GuideForm, ImageFileForm, LocationForm, TourForm, ValoracionForm)
from .models import (
    AudioFile, CustomUser, Encuesta, Guide, ImageFile, Location, Paso,
    Tour, TourRecord, Valoracion)



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



@permission_classes([IsAuthenticated])
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




def get_user_tours(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')
        if user_id:
            tours = Tour.objects.filter(user_id=user_id)
            tours_data = []
            for tour in tours:
                tour_data = tour.as_dict()
                # Modificar imagen y audio para incluir una clave intermedia 'url'
                if tour_data.get('imagen'):
                    tour_data['imagen'] = {'url': tour_data['imagen']}
                if tour_data.get('audio'):
                    tour_data['audio'] = {'url': tour_data['audio']}
                    
                # Agregar la información del usuario que creó el tour
                tour_data['user'] = {
                    'id': tour.user.id,
                    'email': tour.user.email,
                    'first_name': tour.user.first_name, 
                    'last_name': tour.user.last_name,
                    'avatar': tour.user.avatar.url,
                    'bio': tour.user.bio,                   
                }
                
                tours_data.append(tour_data)
            return JsonResponse({'tours': tours_data})
        else:
            return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)

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

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_tours(request):
    error_message = None
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    if auth_header:
        token = auth_header.split(' ')[1]
    else:
        print("No se encontró el header de autorización")
    
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Usuario no autenticado'}, status=401)     
        form = TourForm(request.POST, request.FILES)       
        if form.is_valid():        
            tour_es = form.save(commit=False)
            tour_es.user = request.user
            if 'imagen' in request.FILES:
                image_file = request.FILES['imagen']
                timestamp = int(time.time() * 1000)
                image_name = f"{timestamp}.jpg"
                tour_es.imagen.save(image_name, image_file)

            if 'audio' in request.FILES:
                audio_file = request.FILES['audio']
                timestamp = int(time.time() * 1000)
                audio_name = f"aud_{timestamp}.mp3"
                tour_es.audio.save(audio_name, audio_file)    

            if tour_es.tipo_de_tour == 'leisure':
                tour_es.tipo_de_tour = 'ocio'
            elif tour_es.tipo_de_tour == 'nature':
                tour_es.tipo_de_tour = 'naturaleza'
            tour_es.idioma = 'es'
            tour_es.validado = False
            tour_es.save()

            tour_en = Tour()
            tour_en.user = request.user
            tour_en.imagen = tour_es.imagen
            tour_en.audio = tour_es.audio
            tour_en.tipo_de_tour = tour_es.tipo_de_tour
            tour_en.idioma = 'en'
            tour_en.validado = False
            tour_en.descripcion = translate_text(tour_es.descripcion)
            tour_en.titulo = translate_text(tour_es.titulo)
            tour_en.save()
            return Response({'message': 'Gracias por tu esfuerzo, el tour sera validado por nuestro equipo antes de aparecer en la web'}, status=status.HTTP_200_OK)
        else:
            error_message = 'Hubo un error al subir el tour. Asegúrate de haber seleccionado una imagen y un archivo de audio válidos.'
            print(form.errors)
            return Response({'errors': form.errors}, status=400)
    else:
        return Response({'error': 'Invalid request method'}, status=405)
    return render(request, 'user/upload_tour.html', {'form': form, 'error_message': error_message})
def upload_to_func(instance, filename):
    timestamp = int(time.time() * 1000)
    return f'{timestamp}_{filename}'


@csrf_exempt
@api_view(['POST'])
def upload_encuesta(request):
    print("im here")
    if request.method == 'POST':
        # Mapeo de los nombres de campos del formulario a los nombres de campos del modelo
        mapeo_campos = {
            'pregunta1': 'edad',
            'pregunta2': 'genero',
            'pregunta3': 'nacionalidad',
            'subpregunta3_1': 'otro_nacionalidad',
            'pregunta4': 'viajes_al_anio',
            'pregunta5': 'tours_al_anio',
            'pregunta6': 'valoracion_tour',
            'pregunta7': 'valoracion_contenido',
            'subpregunta7_1': 'otro_contenido',
            'pregunta8': 'valoracion_formato',
            'subpregunta8_1': 'gusta_formato',
            'subpregunta8_2': 'menos_gusta_formato',
            'pregunta9': 'valoracion_duracion',
            'pregunta10': 'duracion_optima',
            'pregunta11': 'ayuda_a_lograr_objetivos',
            'pregunta12': 'caracteristicas_valiosas',
            'pregunta13': 'caracteristicas_menos_valiosas',
            'pregunta14': 'puntos_friccion',
            'pregunta15': 'usar_producto_en_proximas_vacaciones',
            'pregunta16': 'recomendar_producto',
            'pregunta17': 'probabilidad_de_volver_a_realizar_tour',
            'pregunta18': 'flexibilidad_de_horarios_idioma',
            'pregunta19': 'acceso_a_tours',
            'subpregunta19_1': 'otro_acceso',
            'pregunta20': 'precio_dispuesto_a_pagar',
            'pregunta21': 'formato_red_social',
            'pregunta22': 'correo',
            'id': 'id_tour',
        }

        # Crear la instancia del modelo Encuesta sin guardarla aún
        encuesta = Encuesta()
        print(encuesta)

        for clave_form, clave_modelo in mapeo_campos.items():
            valor = request.data.get(clave_form)
            if valor is not None:  # Esto manejará el caso de campos vacíos o no enviados
                setattr(encuesta, clave_modelo, valor)

        encuesta.save()  # Guardar la instancia en la base de datos
        return Response({'success': 'Encuesta guardada correctamente'})

    return Response({'error': 'Método no permitido'}, status=405)

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

    tour_categories = ['cultural', 'naturaleza', 'ocio']
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
                'user': {
                    'id': tour.user.id,
                    'email': tour.user.email,
                    'first_name': tour.user.first_name, 
                    'last_name': tour.user.last_name,
                    'avatar': tour.user.avatar.url,
                    'bio': tour.user.bio,                   
                }
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
    tour_types = ['cultural', 'naturaleza','ocio']

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
                'user': {
                    'id': latest_tour.user.id,
                    'email': latest_tour.user.email,
                    'first_name': latest_tour.user.first_name, 
                    'last_name': latest_tour.user.last_name,
                    'avatar': latest_tour.user.avatar.url,
                    'bio': latest_tour.user.bio               
                }
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
        "cultural": random.choice(cultural_tours) if cultural_tours else None,
        "naturaleza": random.choice(naturaleza_tours) if naturaleza_tours else None,
        "ocio": random.choice(ocio_tours) if ocio_tours else None,        
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
            random_tours_json['user']={
                    'id': tour.user.id,
                    'email': tour.user.email,
                    'first_name': tour.user.first_name, 
                    'last_name': tour.user.last_name,
                    'avatar': tour.user.avatar.url,
                    'bio': tour.user.bio,                   
                }                       
            result.append(random_tours_json)      
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
    

    per_page = len(sorted_tours)
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
        'user': {
                    'id': tour['tour'].user.id,
                    'email': tour['tour'].user.email,
                    'first_name': tour['tour'].user.first_name, 
                    'last_name': tour['tour'].user.last_name,
                    'avatar': tour['tour'].user.avatar.url,
                    'bio': tour['tour'].user.bio,
                }
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
    except Paso.DoesNotExist:
        step_id = None

    return render(request, 'directions.html', {'tour': tour, 'step_id': step_id})

@api_view(['GET'])
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
            "description": tour.descripcion,
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
                "tittle": step.tittle
            })

        return Response(tour_data)
    except Tour.DoesNotExist:
        return Response({"error": "Tour no encontrado"}, status=status.HTTP_404_NOT_FOUND)




def get_tour_data(tour_id):
    print('init')
    tour_objects = Tour.objects.get(id=tour_id)  
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

        try:
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

                }
                print(f"Returning response: {response}")  
                return JsonResponse(response)
            else:
                return JsonResponse({'message': 'End of tour'}, status=200)

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
        tour = Tour.objects.get(pk=tour_id)

        step = Paso.objects.get(pk=step_id)

        if step.tour != tour:
            raise Paso.DoesNotExist()

        try:
            next_step = Paso.objects.filter(tour_id=tour_id, id__gt=step_id).order_by('id').first()
        except Paso.DoesNotExist:
            next_step = None

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



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tour_record(request):
    
    tour_id = request.data.get('tour_id')
    if not tour_id:
        print("Error: Falta el ID del tour")
        return JsonResponse({'error': 'Falta el ID del tour'}, status=400)

    # Verifica si el tour existe
    tour = get_object_or_404(Tour, pk=tour_id)

    # Verificar si ya existe un registro para este tour y usuario
    if TourRecord.objects.filter(user=request.user, tour=tour).exists():
        print("El usuario ya ha registrado este tour.")
        return JsonResponse({'error': 'Este tour ya ha sido registrado por el usuario'}, status=400)

    try:
        tour_record = TourRecord(user=request.user, tour=tour)
        tour_record.save()
        print("Tour registrado con éxito para el usuario:", request.user.username)
        return JsonResponse({'message': 'Tour registrado con éxito'})
    except Exception as e:
        print("Error al registrar el tour:", str(e))
        return JsonResponse({'error': 'Error al registrar el tour'}, status=500)



def get_user_tour_records(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')
        if user_id:

            tours = Tour.objects.filter(user_id=user_id)
            # Inicializar la lista de datos de los tours
            tours_data = []
            # Recorrer cada tour
            for tour in tours:
                # Obtener todas las valoraciones del tour actual
                valoraciones = Valoracion.objects.filter(tour_id=tour.id)
                # Inicializar la lista de datos de las valoraciones del tour
                valoraciones_data = []

                for valoracion in valoraciones:
                    valoracion_data = {
                        "puntuacion": valoracion.puntuacion,
                        "comentario": valoracion.comentario,
                        "fecha": valoracion.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                    }
                    valoraciones_data.append(valoracion_data)
       
                tour_data = {
                    "id": tour.id,
                    "titulo": tour.titulo,
                    "descripcion": tour.descripcion,
                    "imagen": {'url': tour.imagen.url} if tour.imagen else None,
                    "audio": {'url': tour.audio.url} if tour.audio else None,
                    "latitude": tour.latitude,
                    "longitude": tour.longitude,
                    "tipo_de_tour": tour.tipo_de_tour,
                    "recorrido": tour.recorrido,
                    "duracion": tour.duracion,
                    "user": {
                        'id': tour.user.id,
                        'email': tour.user.email,
                        'first_name': tour.user.first_name, 
                        'last_name': tour.user.last_name,
                        'avatar': tour.user.avatar.url,
                        'bio': tour.user.bio,
                    },
                    "valoraciones": valoraciones_data
                }
                tours_data.append(tour_data)
            return JsonResponse({'tours': tours_data})
        else:
            return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)
current_key_index = 0

@csrf_exempt
@require_POST
def get_routes(request):
    global current_key_index
    
    if request.method == 'POST':
        request_body = request.body
        try:
            data = json.loads(request_body)
            if not isinstance(data, list):
                data = [data]
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON inválido'}, status=400)

        api_keys = [
            '69604395-613a-4fc0-b3af-1d841ac5d565',
            'd56a81fe-a24e-4ace-ab47-b9aa06ed0874',
            '74f72b76-bb28-4bb8-b862-a756103cb2b1', 
            'b3bca5f8-0181-44f8-9d90-a8819d20bb71',
            'a0d7b1fe-9ebe-4975-a389-be62b705d15d',
            '8ad22295-91d0-40f7-9033-1ca16a877881'
        ]
        
        current_minute = datetime.now().minute
        key_index = current_minute % len(api_keys)
        
        consolidated_response = []
        for i in range(0, len(data[0]['points']), 5):
            attempts = 0  # Contador de intentos para cada chunk
            while attempts < len(api_keys):
                try:
                    key = api_keys[key_index]
                    print(f"Intentando con la clave {key}")
                    url = f'https://graphhopper.com/api/1/route?key={key}'
                    chunk = data[0]['points'][i:i+5]
                    print(f"Puntos actuales: {chunk}")
                    response = requests.post(url, json={'points': chunk, "points_encoded": False, "profile": "foot"})
                    
                    if len(chunk)==1:
                        response.status_code = 200
                    # Simplificar la verificación de éxito al estado HTTP 200 solamente
                    if response.status_code == 200:
                        json_response = response.json()
                        consolidated_response.append(json_response)
                        print("Respuesta exitosa.")
                        break  # Sale del loop de reintento y continúa con el siguiente chunk
                    else:
                        # Imprime información adicional para diagnosticar el fallo
                        print(f"Fallo con clave {key}. Código de estado: {response.status_code}")
                        print("Parte de la respuesta:", response.text[:150])  # Imprime los primeros 150 caracteres de la respuesta
                    

                except requests.exceptions.RequestException as e:
                    print(f"Excepción al hacer la solicitud con clave {key}: {str(e)}")
                finally:
                    key_index = (key_index + 1) % len(api_keys)  # Siguiente clave
                    attempts += 1  # Incrementa el contador de intentos
            
            if attempts == len(api_keys):
                error_message = "Todos los intentos con las claves API han fallado"
                consolidated_response.append({'error': error_message})
            
        return JsonResponse(consolidated_response, safe=False)

    return JsonResponse({'error': 'Método no permitido'}, status=405)


def save_base64_as_file(base64_data, file_path):
    try:
        decoded_data = base64.b64decode(base64_data)
        with open(file_path, 'wb') as f:
            f.write(decoded_data)
        return True
    except Exception as e:
        print(f"Error saving base64 data as file: {e}")
        return False

def upload_file_to_s3(file_path, bucket_name, folder_path, file_name):
    try:
        s3 = boto3.client('s3')
        with open(file_path, 'rb') as f:
            s3.put_object(Body=f, Bucket=bucket_name, Key=f'{folder_path}/{file_name}')
        return True
    except ClientError as e:
        print(f"Error uploading file to S3: {e}")
        return False
    


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Cambia según tus requerimientos de autenticación
def crear_valoracion(request):
    data = request.data

    # Asegúrate de que el 'tour_id' y la 'puntuacion' están presentes
    if 'tour_id' not in data or 'puntuacion' not in data:
        return JsonResponse({'error': 'Faltan datos necesarios'}, status=400)

    # Intenta obtener el tour
    tour = get_object_or_404(Tour, pk=data['tour_id'])

    # Crea una instancia de ValoracionForm para validar los datos
    valoracion_data = {
        'puntuacion': data['puntuacion'],
        'comentario': data.get('comentario', '')  # El comentario es opcional
    }
    if request.user.is_authenticated:
        valoracion_existente = Valoracion.objects.filter(tour=tour, user=request.user).first()

        if valoracion_existente:
            # Actualiza la valoración existente
            for key, value in valoracion_data.items():
                setattr(valoracion_existente, key, value)
            valoracion_existente.fecha = timezone.now()  # Actualiza la fecha
            valoracion_existente.save()
            return JsonResponse({'mensaje': 'Valoración actualizada correctamente'}, status=200)



    form = ValoracionForm(valoracion_data)

    if form.is_valid():
        valoracion = form.save(commit=False)
        valoracion.tour = tour

        # Asocia el usuario solo si está autenticado
        if request.user.is_authenticated:
            valoracion.user = request.user

        try:
            valoracion.save()
            return JsonResponse({'mensaje': 'Valoración creada correctamente'}, status=201)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Datos inválidos', 'detalles': form.errors}, status=400)
    


def media_valoracion_tour(request, tour_id):
    # La clave en la caché para este valor específico
    cache_key = f"media_valoracion_{tour_id}"
    # Intenta obtener el valor de la caché
    media_puntuacion = cache.get(cache_key)

    if media_puntuacion is None:
        # Si no está en la caché, calcula la media de las valoraciones
        tour = get_object_or_404(Tour, pk=tour_id)
        resultado = Valoracion.objects.filter(tour=tour).aggregate(media_puntuacion=Avg('puntuacion'))
        media_puntuacion = resultado.get('media_puntuacion', 5.0)
        if media_puntuacion is None:
            media_puntuacion = 5.0
        # Guarda el valor calculado en la caché para futuras solicitudes
        cache.set(cache_key, media_puntuacion, timeout=3600*25)  # Lo guarda en caché por 25 hora

    # Devuelve la media como respuesta JSON
    return JsonResponse({'media_puntuacion': media_puntuacion})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    print(f"Usuario autenticado: {request.user.is_authenticated}")
    if request.method == 'POST':
        user = request.user  # Asume que ya has manejado la autenticación

        # Actualizar campos basados en la presencia en el request.POST o request.FILES
        first_name = request.POST.get('firstName')
        if first_name is not None:
            user.first_name = first_name

        last_name = request.POST.get('lastName')
        if last_name is not None:
            user.last_name = last_name

        email = request.POST.get('email')
        if email is not None:
            user.email = email

        bio = request.POST.get('bio')
        if bio is not None:
            user.bio = bio

        avatar = request.FILES.get('profileImage')
        if avatar is not None:
            user.avatar.save(avatar.name, avatar)

        user.save()

        return JsonResponse({'message': 'Perfil actualizado correctamente'})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    

@csrf_exempt
def upload_profile_image(request):
    if request.method == 'POST':
        user = request.user  # Asegúrate de obtener el usuario correctamente, esto es solo un ejemplo
        file = request.FILES.get('avatar')
        if file:
            # Aquí deberías guardar el archivo en el lugar deseado y actualizar la referencia en el usuario
            user.avatar.save(file.name, file)
            user.save()
            return JsonResponse({'message': 'Imagen cargada con éxito.'})
        else:
            return JsonResponse({'error': 'No se proporcionó archivo.'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido.'}, status=405)


def search_user_by_id(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')
        try:
            if user_id:
                User = get_user_model()
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'El usuario con el ID proporcionado no existe'}, status=404)

                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'bio': user.bio,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'avatar': user.avatar.url if user.avatar else None,
                }
        
                return JsonResponse({'user': user_data})
            else:
                return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
        
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            # Log general para cualquier otro tipo de error
            print(e)

    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)




def translate_text(text):
    url = "https://deep-translate1.p.rapidapi.com/language/translate/v2"
    headers = {
        'X-RapidAPI-Key': "75c294e6a8msh19ef7b3ebb91873p16517ejsn5f6bff2b1abd",
        'X-RapidAPI-Host': "deep-translate1.p.rapidapi.com"
    }
    payload = {
        "q": text,
        "source": "es",
        "target": "en"
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    translated_text = response.json().get('data', {}).get('translations', {}).get('translatedText', '')
    return translated_text
    url = "https://deep-translate1.p.rapidapi.com/language/translate/v2"
    headers = {
        'X-RapidAPI-Key': "75c294e6a8msh19ef7b3ebb91873p16517ejsn5f6bff2b1abd",
        'X-RapidAPI-Host': "deep-translate1.p.rapidapi.com"
    }
    payload = {
        "q": text,
        "source": "es",
        "target": "en"
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    translated_text = response.json().get('data', {}).get('translations', [])[0].get('translatedText', '')
    return translated_text