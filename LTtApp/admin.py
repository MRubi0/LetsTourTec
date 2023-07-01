from django.contrib import admin
from .models import CustomUser, Guide, AudioFile, ImageFile, Location, Tour, Paso

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Guide)
admin.site.register(AudioFile)
admin.site.register(ImageFile)
admin.site.register(Location)
admin.site.register(Tour)
admin.site.register(Paso)
