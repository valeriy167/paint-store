from django.urls import path
from . import views

urlpatterns = [
    path('my/', views.ReviewViewSet.as_view({'get': 'my'}), name='review-my'),
]