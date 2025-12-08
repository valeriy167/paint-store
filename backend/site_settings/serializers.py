from rest_framework import serializers
from .models import BackgroundImage

class BackgroundImageSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(use_url=True) # Это нужно
    
    class Meta:
        model = BackgroundImage
        fields = ['id', 'image', 'is_active', 'created_at', 'blur_amount', 'scale_factor']
        # 'image' будет полем для загрузки
        # 'is_active' можно использовать для включения/отключения фона
        # 'id' и 'created_at' - для отображения в админке, если нужно