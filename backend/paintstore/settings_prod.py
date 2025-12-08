from .settings import *

# Безопасность
DEBUG = False
ALLOWED_HOSTS = ['ваш-домен.onrender.com', 'localhost', '127.0.0.1']

# База данных — из переменной окружения (Render/Railway зададут её автоматически)
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}

# CORS (для Vercel frontend)
CORS_ALLOWED_ORIGINS = [
    "https://paint-store-frontend.vercel.app",  # ← будет ваш URL
    "http://localhost:5173",  # для локальной разработки
]