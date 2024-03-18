import os
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from PIL import Image
from django.db.models import F, Func, Q
from django.db.models import ExpressionWrapper, FloatField
import json
import requests
from django.urls import reverse_lazy
from django.views import generic
from django.http import JsonResponse
from django.http import JsonResponse
import base64
import boto3
from botocore.exceptions import ClientError
from django.http import JsonResponse

import sqlite3
import math
from math import radians, sin, cos, sqrt, atan2
from .forms import GuideForm, AudioFileForm, ImageFileForm, LocationForm, CustomUserCreationForm, EncuestaForm
from .models import Guide, AudioFile, ImageFile, Location, CustomUser, Tour, Encuesta 
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
from django.shortcuts import get_object_or_404


from .models import TourRecord
from django.views.decorators.http import require_POST

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

def search_user_by_id(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')

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
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)

""" 
def get_user_tours(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')

        if user_id:
            tours = Tour.objects.filter(user_id=user_id)
            tours_data = [tour.as_dict() for tour in tours]
            return JsonResponse({'tours': tours_data})
        else:
            return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405) 
        
"""

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
                tours_data.append(tour_data)
            return JsonResponse({'tours': tours_data})
        else:
            return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)


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
def upload_tours(request):
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

            if tour.tipo_de_tour=='leisure':
                tour.tipo_de_tour='ocio'
            elif tour.tipo_de_tour=='nature':
                tour.tipo_de_tour='naturaleza'

            tour.save()
            print(tour)
            # Procesar pasos adicionales
            for i in range(100):
                extra_audio_key = f'extra_step_audio_{i}'
                
                if extra_audio_key in request.FILES:
                    extra_audio = request.FILES[extra_audio_key]
                    
                    extra_description= None
                    extra_image = None
                    extra_latitude = None
                    extra_longitude = None
                    extra_tittle = None
                    
                    extra_description_key = f'description_{i}'
                    if extra_description_key in request.POST:
                        extra_description = request.POST.get(extra_description_key, '')

                    extra_tittle_key = f'tittle_{i}'  
                    if extra_tittle_key in request.POST:
                        extra_tittle = request.POST.get(extra_tittle_key, '')

                    paso = Paso(tour=tour, audio=extra_audio, description=extra_description, tittle = extra_tittle)

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

""" 
@api_view(['POST'])
def upload_tours(request):
    if request.method == 'POST':
        print("Intentando decodificar el cuerpo de la petición...")
        try:
            print("Mostrando los primeros 200 bytes del cuerpo de la petición:")
            print(request.body[:200])
            data = json.loads(request.body) 
        except Exception as e:
            print(f"Error al decodificar el cuerpo de la petición: {e}")
            return JsonResponse({'error': 'Error al decodificar el cuerpo de la petición'}, status=400)

        try:
            print("Datos de la petición decodificados correctamente.")
            tipo_de_tour = data['tipo_de_tour']
            titulo = data['titulo']
            descripcion = data['descripcion']
            imagen_base64 = data['imagen']
            audio_base64 = data['audio']
            latitude = data['latitude']
            longitude = data['longitude']
            duracion = data['duracion']
            recorrido = data['recorrido']
            extra_steps = data.get('extraSteps', [])

            print(f"Procesando tour: {titulo}")

            temp_image_path = f'temp_{titulo}_imagen.png'
            print(f"Guardando imagen temporal: {temp_image_path}")
            save_base64_as_file(imagen_base64, temp_image_path)

            print(f"Subiendo imagen a S3: {temp_image_path}")
            upload_file_to_s3(temp_image_path, AWS_STORAGE_BUCKET_NAME, 'tours/', f'{titulo}/imagen_principal.png')

            print(f"Eliminando imagen temporal: {temp_image_path}")
            os.remove(temp_image_path)

            temp_audio_path = f'temp_{titulo}_audio.mp3'
            print(f"Guardando audio temporal: {temp_audio_path}")
            save_base64_as_file(audio_base64, temp_audio_path)

            print(f"Subiendo audio a S3: {temp_audio_path}")
            upload_file_to_s3(temp_audio_path, AWS_STORAGE_BUCKET_NAME, 'tour_audio/', f'{titulo}/audio_principal.mp3')

            print(f"Eliminando audio temporal: {temp_audio_path}")
            os.remove(temp_audio_path)

            for step in extra_steps:
                print(f"Procesando paso extra: {step['tittle']}")
                step_image_base64 = step['image']
                step_audio_base64 = step['audio']
                step_latitude = step['latitude']
                step_longitude = step['longitude']
                step_description = step['description']
                step_title = step['tittle']

                temp_step_image_path = f'temp_{titulo}_{step_title}_imagen.png'
                save_base64_as_file(step_image_base64, temp_step_image_path)
                upload_file_to_s3(temp_step_image_path, settings.AWS_STORAGE_BUCKET_NAME, 'tours', f'{titulo}/extra_steps/{step_title}/imagen.png')
                os.remove(temp_step_image_path)
                temp_step_audio_path = f'temp_{titulo}_{step_title}_audio.mp3'
                save_base64_as_file(step_audio_base64, temp_step_audio_path)
                upload_file_to_s3(temp_step_audio_path, settings.AWS_STORAGE_BUCKET_NAME, 'tours', f'{titulo}/extra_steps/{step_title}/audio.mp3')
                os.remove(temp_step_audio_path)
                print(f"Paso extra {step['tittle']} procesado y subido con éxito.")

            return JsonResponse({'message': 'Datos subidos correctamente a S3'})
        except Exception as e:
            print(f"Error al procesar la petición: {e}")
            return JsonResponse({'error': str(e)}, status=400)
    else:
        print("Método no permitido")
        return JsonResponse({'error': 'Método no permitido'}, status=405) 
"""

# @api_view(['POST'])
# def upload_encuesta(request):
#     if request.method == 'POST':
#         form = EncuestaForm(request.POST)
#         if form.is_valid():
#             # Crea una instancia de tu modelo a partir de los datos del formulario
#             # Esto requiere que manualmente asignes los datos del formulario a los campos del modelo.
#             encuesta_data = form.cleaned_data
#             encuesta = Encuesta()  # Crea una nueva instancia de tu modelo Encuesta
            
#             # Asigna los campos del formulario a los atributos del modelo
#             for field, value in encuesta_data.items():
#                 setattr(encuesta, field, value)
            
#             # Guarda la instancia del modelo en la base de datos
#             encuesta.save()
            
#             # Puedes redireccionar o responder con un mensaje de éxito
#             return Response({'success': 'Encuesta guardada correctamente'}, status=200)
#         else:
#             # Manejo de errores de validación del formulario
#             return Response({'errors': form.errors}, status=400)
#     else:
#         # Método HTTP no permitido
#         return Response({'error': 'Invalid request method'}, status=405)

@api_view(['POST'])
def upload_encuesta(request):
    if request.method == 'POST':
        # Mapeo de los nombres de campos del formulario a los nombres de campos del modelo
        mapeo_campos = {
            'pregunta1': 'edad',
            'pregunta2': 'genero',
            'pregunta3': 'nacionalidad',
            'pregunta4': 'viajes_al_anio',
            'pregunta5': 'tours_al_anio',
            'pregunta6': 'valoracion_tour',
            'pregunta7': 'valoracion_contenido',
            'subpregunta7': 'otro_contenido',
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
            'pregunta20': 'precio_dispuesto_a_pagar',
            'pregunta21': 'formato_red_social',
            'pregunta22': 'correo',
        }

        # Crear la instancia del modelo Encuesta sin guardarla aún
        encuesta = Encuesta()

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

""" def get_user_tour_records(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')

        if user_id:
            tour_records = TourRecord.objects.filter(user_id=user_id)
            tours_data = [record.tour.as_dict() for record in tour_records]
            print(tours_data)  # Imprimir para depuración
            return JsonResponse({'tours': tours_data})
        else:
            return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)
 """

def get_user_tour_records(request):
    if request.method == 'GET':
        user_id = request.GET.get('id')

        if user_id:
            tour_records = TourRecord.objects.filter(user_id=user_id)
            tours_data = []
            for record in tour_records:
                tour_data = record.tour.as_dict()
                # Modificar imagen y audio para incluir una clave intermedia 'url'
                if tour_data.get('imagen'):
                    tour_data['imagen'] = {'url': tour_data['imagen']}
                if tour_data.get('audio'):
                    tour_data['audio'] = {'url': tour_data['audio']}
                tours_data.append(tour_data)
            return JsonResponse({'tours': tours_data})
        else:
            return JsonResponse({'error': 'Se necesita proporcionar un ID de usuario'}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)

# @csrf_exempt
# @require_POST
# def get_routes(request):
#     if request.method == 'POST':
#         request_body = request.body
#         try:
#             data = json.loads(request_body)
#             if not isinstance(data, list):
#                 data = [data]  
#         except json.JSONDecodeError:
#             return JsonResponse({'error': 'Formato JSON inválido'}, status=400)

#         api_keys = [
#             '69604395-613a-4fc0-b3af-1d841ac5d565',
            
#             '74f72b76-bb28-4bb8-b862-a756103cb2b1'
#         ]
#         #'d56a81fe-a24e-4ace-ab47-b9aa06ed0874',
        
#         key_index = random.randint(0, len(api_keys) - 1)
        
#         consolidated_response = []
#         for i in range(0, len(data[0]['points']), 5):
#             try:
#                 key = api_keys[key_index]
#                 print(key)
#                 url = f'https://graphhopper.com/api/1/route?key={key}'
#                 chunk = data[0]['points'][i:i+5]
#                 print(chunk)
#                 response = requests.post(url, json={'points': chunk, "points_encoded": False, "profile": "foot"})
#                 consolidated_response.append(response.json())  
#             except requests.exceptions.RequestException as e:
#                 error_message = f"Error al hacer la solicitud con la clave {key}: {str(e)}"
#                 consolidated_response.append({'error': error_message})
#             finally:
                
#                 key_index = (key_index + 1) % len(api_keys)
            
#         return JsonResponse(consolidated_response, safe=False)

#     return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@require_POST
def get_routes(request):
    if request.method == 'POST':
        request_body = request.body
        try:
            data = json.loads(request_body)
            if not isinstance(data, list):
                data = [data]  
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON inválido'}, status=400)

        #key = '74f72b76-bb28-4bb8-b862-a756103cb2b1'
        key = '69604395-613a-4fc0-b3af-1d841ac5d565'
        
        url = f'https://graphhopper.com/api/1/route?key={key}'
        
        consolidated_response = []
        for i in range(0, len(data[0]['points']), 5):
            chunk = data[0]['points'][i:i+5]             
            response = requests.post(url, json={'points': chunk, "points_encoded": False, 
                                                "profile": "foot", "instructions": True,
                                                "calc_points": True,})            
            consolidated_response.append(response.json())        
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