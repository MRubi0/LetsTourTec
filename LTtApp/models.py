from django.db import models
from django.contrib.gis.db.models import PointField

class User(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email




class Guide(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    # Otros campos relevantes

class AudioFile(models.Model):
    guide = models.ForeignKey(Guide, on_delete=models.CASCADE)
    audio_file = models.FileField(upload_to='audio/')
    # Otros campos relevantes

class ImageFile(models.Model):
    guide = models.ForeignKey(Guide, on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to='images/')
    # Otros campos relevantes

class Location(models.Model):
    guide = models.ForeignKey(Guide, on_delete=models.CASCADE)
    location = PointField()
    # Otros campos relevantes