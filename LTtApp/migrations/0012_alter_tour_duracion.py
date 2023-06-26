from django.db import migrations, models, connections

# Función para copiar datos de la columna 'duracion' a 'duracion_temp'
def copy_duracion_data(apps, schema_editor):
    Tour = apps.get_model('LTtApp', 'Tour')
    for tour in Tour.objects.all():
        # Aquí puedes agregar la lógica para transformar los datos
        # como sea necesario antes de asignarlos a duracion_temp.
        tour.duracion_temp = tour.duracion
        tour.save()

class Migration(migrations.Migration):

    dependencies = [
        ('LTtApp', '0011_tour_duracion_tour_recorrido'),
    ]

    operations = [
        # Paso 1: Agrega una nueva columna temporal
        migrations.AddField(
            model_name='tour',
            name='duracion_temp',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        # Paso 2: Copia los datos
        migrations.RunPython(copy_duracion_data),
        # Paso 3: Elimina la columna original
        migrations.RemoveField(
            model_name='tour',
            name='duracion',
        ),
        # Paso 4: Renombra la columna temporal
        migrations.RenameField(
            model_name='tour',
            old_name='duracion_temp',
            new_name='duracion',
        ),
    ]
