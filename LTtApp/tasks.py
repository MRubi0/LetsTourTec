from celery import shared_task

@shared_task
def test_task():
    print("Esto es una prueba de una tarea de fondo.")
    return "Tarea completada!"
