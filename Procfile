web: gunicorn LetsTourTec.wsgi:application --log-file - --bind 0.0.0.0:$PORT
worker: celery -A LetsTourTec worker --loglevel=info
