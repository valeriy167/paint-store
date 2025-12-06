from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.current_user_view, name='current-user'),
]