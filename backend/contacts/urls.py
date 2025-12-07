from django.urls import path
from . import views

urlpatterns = [
    path('', views.contact_info_view, name='contact-info'),
    path('update/', views.contact_info_update, name='contact-update'),
]