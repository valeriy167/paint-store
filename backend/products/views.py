from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsModerator

class ProductViewSet(viewsets.ModelViewSet):
    """Публичный список товаров"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Публично: только чтение
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  # или AllowAny(), но лучше авторизованным
        # Редактирование: только модераторы
        return [IsModerator()]