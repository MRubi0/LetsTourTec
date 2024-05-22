# LetsTourTec/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# establece la configuración predeterminada de Django para el módulo 'celery'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LetsTourTec.settings')

app = Celery('LetsTourTec')

# Usa Redis como broker
app.conf.broker_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# Carga configuraciones de Celery desde el archivo settings de Django, usando el prefijo 'CELERY'
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-descubre tareas de las aplicaciones de Django
app.autodiscover_tasks()
