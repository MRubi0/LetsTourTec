from django import forms
from .models import Guide, AudioFile, ImageFile, Location

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
        fields = ('location',)
