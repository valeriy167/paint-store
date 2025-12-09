from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Product, Manufacturer
from .serializers import ProductSerializer, ManufacturerSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsModerator

class ProductViewSet(viewsets.ModelViewSet):
    """Публичный список товаров"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Публично: только чтение
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]  
        # Редактирование: только модераторы
        return [IsModerator()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Получаем ID производителя из параметров запроса
        manufacturer_id = self.request.query_params.get('manufacturer_id', None)
        if manufacturer_id is not None:
            queryset = queryset.filter(manufacturer_id=manufacturer_id)
        return queryset
    
class ManufacturerViewSet(viewsets.ModelViewSet):
    """ViewSet для управления Производителями (требует прав модератора)"""
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

    # Требуем права модератора для всех действий
    def get_permissions(self):
        return [IsModerator()]
