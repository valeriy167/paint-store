# site_settings/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import BackgroundImage
from .serializers import BackgroundImageSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.permissions import IsModerator 


class BackgroundImageViewSet(viewsets.ModelViewSet):
    queryset = BackgroundImage.objects.all()
    serializer_class = BackgroundImageSerializer

        # --- Установим разрешения для действий ---
    def get_permissions(self):
        # Разрешаем получение активного фона всем
        if self.action == 'active_background':
            permission_classes = [AllowAny]
        # Остальные действия (create, update, partial_update, destroy) требуют аутентификации/модератора
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsModerator]
        else:
            # Для list, retrieve - можешь решить, нужно ли
            permission_classes = [AllowAny] # Или другое разрешение
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        # Отключаем старое активное
        old_active = BackgroundImage.objects.filter(is_active=True).first()
        if old_active:
            old_active.is_active = False
            old_active.save()

        # Создаём новое
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        # Обработка PATCH запроса
        instance = self.get_object()
        is_active = request.data.get('is_active')

        if is_active is not None and is_active == True:
            # Если отправлено is_active=true, снимаем флаг с других и ставим на этот
            BackgroundImage.objects.filter(is_active=True).update(is_active=False)
            instance.is_active = True
            instance.save()
            # Возвращаем обновлённый объект
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        # Если is_active не передан или не true, вызываем стандартный partial_update
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='active')
    def active_background(self, request):
        """Получить данные активного фонового изображения (включая параметры)."""
        bg_image = BackgroundImage.get_active_image()
        if bg_image:
            serializer = self.get_serializer(bg_image)
            return Response(serializer.data)
        else:
            return Response({'image': None, 'blur_amount': None, 'scale_factor': None})