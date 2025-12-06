from django.urls import path
from . import views

urlpatterns = [
    path('', views.contact_info_view, name='contact-info'),
]