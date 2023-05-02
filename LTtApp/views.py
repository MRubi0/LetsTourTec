from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from django.urls import reverse_lazy
from django.views import generic

from .forms import GuideForm, AudioFileForm, ImageFileForm, LocationForm, CustomUserCreationForm
from .models import Guide, AudioFile, ImageFile, Location, CustomUser, Tour

from django.contrib import messages

from .forms import EditProfileForm

from django import forms
from django.contrib.auth.decorators import login_required

from .forms import TourForm


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
    return render(request, 'index.html')
# Create your views here.



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
    if request.method == 'POST':
        form = TourForm(request.POST, request.FILES)
        if form.is_valid():
            tour = form.save(commit=False)
            tour.user = request.user
            tour.save()

            # Procesar pasos adicionales
            for i in range(100):
                extra_image_key = f'extra_step_image_{i}'
                extra_audio_key = f'extra_step_audio_{i}'
                if extra_image_key in request.FILES and extra_audio_key in request.FILES:
                    extra_image = request.FILES[extra_image_key]
                    extra_audio = request.FILES[extra_audio_key]
                    paso = Paso(tour=tour, image=extra_image, audio=extra_audio)
                    paso.save()
                else:
                    break

            return redirect('index')
    else:
        form = TourForm()
    return render(request, 'user/upload_tour.html', {'form': form})


