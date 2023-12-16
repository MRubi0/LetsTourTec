from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, User
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from PIL import Image
from io import BytesIO
import requests
import boto3
import os
from django.core.files.base import ContentFile


#from django.contrib.gis.db.models import PointField



class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        related_query_name="customuser",
        related_name="customuser_set",
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        related_query_name="customuser",
        related_name="customuser_set",
        help_text=_('Specific permissions for this user.'),
    )


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
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

class Tour(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=255)
    imagen = models.ImageField(upload_to='tours/')
    descripcion = models.TextField()
    audio = models.FileField(upload_to='tour_audio/', null=True, blank=True)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    duracion = models.PositiveIntegerField("Duración en minutos", null=True, blank=True)
    recorrido = models.FloatField(null=True, blank=True)   # Recorrido en kilómetros
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    TIPO_DE_TOUR_CHOICES = [
        ('nature', 'Naturaleza'),
        ('cultural', 'Cultural'),
        ('leisure', 'Ocio'),
    ]
    tipo_de_tour = models.CharField(max_length=10, choices=TIPO_DE_TOUR_CHOICES, default=None, blank=True, null=True)
    

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        # Guarda el objeto Tour como de costumbre
        super().save(*args, **kwargs)

        if self.imagen:
            # Obtén la URL de la imagen almacenada en S3
            image_url = self.imagen.url

            # Descarga la imagen usando requests y ábrela con PIL
            response = requests.get(image_url)
            img = Image.open(BytesIO(response.content))

            # Convierte la imagen a modo RGB si no lo está
            if img.mode in ['P', 'RGBA']:
                img = img.convert('RGB')
        # Construye el path de la imagen en S3
        key = f'tours/{self.id}/images/{self.imagen.name}'
        # Aquí necesitas configurar boto3 con tus credenciales de AWS y especificar el bucket y key adecuados
        s3 = boto3.client(
                            's3',
                            aws_access_key_id='AKIAYTBLLQA7BS6GPBHU',
                            aws_secret_access_key='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',
                            region_name='eu-north-1'  # Asegúrate de que la región coincida con la del bucket
                        )





        #if self.imagen:
            #img = Image.open(self.imagen.path)

            
    def as_dict(self):
        return {
            "user": self.user.username if self.user else None,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "tipo_de_tour": self.tipo_de_tour,
            "recorrido": self.recorrido,
            "duracion": self.duracion,
            "imagen": self.imagen.url if self.imagen else None,
            "audio": self.audio.url if self.audio else None,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }

class Paso(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    step_number = models.IntegerField(default=None)
    image = models.ImageField(upload_to='pasos/', null=True, blank=True)
    audio = models.FileField(upload_to='paso_audio/', null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    tittle = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        if self.image:
            # Descarga la imagen desde S3 y ábrela con PIL
            response = requests.get(self.image.url)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))

                # Convierte la imagen a modo RGB si no lo está
                if img.mode in ['P', 'RGBA']:
                    img = img.convert('RGB')

                # Redimensionamiento si es necesario
                if img.height > 150 or img.width > 150:
                    output_size = (150, 150)
                    img.thumbnail(output_size)

                # Guardar la imagen convertida en un objeto BytesIO
                buffer = BytesIO()
                img.save(buffer, format='JPEG')
                buffer.seek(0)

                # Reemplazar la imagen original por la convertida
                file_name = self.image.name
                self.image.delete(save=False)  # Elimina la imagen antigua
                self.image.save(file_name, ContentFile(buffer.getvalue()), save=False)
            else:
                # Manejar el caso donde la respuesta no es exitosa
                # Por ejemplo, podrías registrar un error o lanzar una excepción
                pass

        if not self.step_number:
            existing_steps_count = Paso.objects.filter(tour=self.tour).count()
            self.step_number = existing_steps_count + 1

        super().save(*args, **kwargs)
    class Meta:
        ordering = ['step_number']
    def as_dict(self):
        return {
            "image": self.image.url if self.image else None,
            "audio": self.audio.url if self.audio else None,
            "latitude": self.latitude if self.latitude else None,
            "longitude": self.longitude if self.longitude else None,
            "step_number": self.step_number if self.step_number else None,
            "description": self.description if self.description else None,
        }
    def __str__(self):
        return str(self.step_number)  


class TourRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    def as_dict(self):
        return {
            "id": self.id,
            "tour_id": self.tour.id,
            "tour_title": self.tour.titulo,
            "date": self.date.strftime("%Y-%m-%d %H:%M:%S"),
            # Puedes añadir más campos si es necesario
        }
    def __str__(self):
        return f"{self.user.username} - {self.tour.titulo} - {self.date}"
