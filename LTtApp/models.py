from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, User
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from PIL import Image
from io import BytesIO
import requests
import boto3



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
        ('naturaleza', 'Naturaleza'),
        ('cultural', 'Cultural'),
        ('ocio', 'Ocio'),
    ]
    tipo_de_tour = models.CharField(max_length=10, choices=TIPO_DE_TOUR_CHOICES, default=None, blank=True, null=True)
    

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Obtén la URL de la imagen en S3
        image_url = self.imagen.url

        # Abre la imagen a través de la URL
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content))

        if img.height > 150 or img.width > 150:
            output_size = (150, 150)
            img.thumbnail(output_size)
            

        # Guardar la imagen de nuevo en S3
        # Esto implica el uso de boto3 (o cualquier otra librería) para subir el archivo modificado a S3
        
        # Convertir la imagen a bytes
        buffer = BytesIO()
        img.save(buffer, format="JPEG")
        buffer.seek(0)
        # Construye el path de la imagen en S3
        key = f'tours/{self.id}/images/{self.imagen.name}'
        # Aquí necesitas configurar boto3 con tus credenciales de AWS y especificar el bucket y key adecuados
        s3 = boto3.client('s3', aws_access_key_id='AKIA2W3PNRO7VOZUX2PC', aws_secret_access_key='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'))
        s3.upload_fileobj(buffer, 'letstourtec-heroku2',  key)




        if self.imagen:
            img = Image.open(self.imagen.path)

            
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
    imagen = models.ImageField(upload_to='pasos/', null=True, blank=True)
    audio = models.FileField(upload_to='paso_audio/', null=True, blank=True)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo