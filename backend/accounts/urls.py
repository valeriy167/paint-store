from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.current_user_view, name='current-user'),
    path('register/', views.register_view, name='register'),
    path('me/update/', views.update_user_view, name='update-user'),
]