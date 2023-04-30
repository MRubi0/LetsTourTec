from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from django.urls import reverse_lazy
from django.views import generic

from django.shortcuts import render, redirect
from .forms import GuideForm, AudioFileForm, ImageFileForm, LocationForm


class vista_registro(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'

'''
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
            login(request, user)
            return redirect('index')
    else:
        form = AuthenticationForm()
    return render(request, 'LTtApp/login.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})


def index(request):
    return render(request, 'index.html')
# Create your views here.



def create_guide(request):
    # Lógica para crear una guía
    # ...

def edit_guide(request, guide_id):
    # Lógica para editar una guía
    # ...

def upload_audio(request, guide_id):
    # Lógica para subir archivos de audio
    # ...

def upload_image(request, guide_id):
    # Lógica para subir imágenes
    # ...

def add_location(request, guide_id):
    # Lógica para agregar ubicaciones
    # ...
