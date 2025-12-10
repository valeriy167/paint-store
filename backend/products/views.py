from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
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

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        # Для действий, связанных с чтением (list, retrieve), разрешаем всем
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        # Для остальных действий (create, update, partial_update, destroy) - только модераторы
        else:
            permission_classes = [IsModerator]

        # Возвращаем экземпляр класса разрешения
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny]) 
    def info(self, request, pk=None):
        """Возвращает информацию о производителе по его ID (pk)."""
        try:
            manufacturer = self.get_object() # Получаем производителя по pk
            serializer = self.get_serializer(manufacturer)
            return Response(serializer.data)
        except Manufacturer.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)