from django import forms
from .models import Guide, AudioFile, ImageFile, Location, CustomUser, Tour, Paso
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import UserChangeForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

class GuideForm(forms.ModelForm):
    class Meta:
        model = Guide
        fields = ('title', 'description',) # y otros campos relevantes

class AudioFileForm(forms.ModelForm):
    class Meta:
        model = AudioFile
        fields = ('audio_file',)

class ImageFileForm(forms.ModelForm):
    class Meta:
        model = ImageFile
        fields = ('image_file',)

class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = ['name', 'latitude', 'longitude']

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    avatar = forms.ImageField(required=False)
    bio = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = CustomUser
        fields = ("first_name", "last_name", "email", "password1", "password2", "avatar", "bio")

    def save(self, commit=True):
        user = super().save(commit=False) 
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.avatar = self.cleaned_data["avatar"]
        user.bio = self.cleaned_data["bio"]
        if commit:
            user.save()
        return user

class EditProfileForm(UserChangeForm):
    password = None

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'avatar', 'bio')

class TourForm(forms.ModelForm):
    class Meta:
        model = Tour
        fields = ['titulo', 'imagen', 'descripcion', 'audio', 'latitude', 'longitude', 'tipo_de_tour', 'duracion', 'recorrido']

class PasoForm(forms.ModelForm):
    class Meta:
        model = Paso
        fields = ['image', 'audio', 'latitude', 'longitude', 'description']