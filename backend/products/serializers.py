from rest_framework import serializers
from .models import Product, Manufacturer, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image(self, obj):
        # request доступен через self.context
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url if hasattr(obj.image, 'url') else None
        return None

class ManufacturerSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'description', 'logo']
        
    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        elif obj.logo:
            return obj.logo.url
        return None

class ProductSerializer(serializers.ModelSerializer):
    manufacturer = ManufacturerSerializer(read_only=True) # Для чтения
    # Используем PrimaryKeyRelatedField для записи manufacturer_id
    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufacturer.objects.all(),
        source='manufacturer', # Указывает, какое поле модели обновлять
        write_only=True,      # Поле только для записи
        required=False,       # Поле необязательное
        allow_null=True       # Поле может быть null
    )
    images = ProductImageSerializer(many=True, read_only=True)
    new_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'category', 'created_at', 'manufacturer', 'manufacturer_id', 'images', 'new_images']

    def create(self, validated_data):
        new_images_data = validated_data.pop('new_images', [])
        product = Product.objects.create(**validated_data)

        for image_data in new_images_data:
            ProductImage.objects.create(product=product, image=image_data)

        return product

    def update(self, instance, validated_data):
        new_images_data = validated_data.pop('new_images', [])

        # Обновляем основные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Создаём новые изображения
        for image_data in new_images_data:
            ProductImage.objects.create(product=instance, image=image_data)

        return instance
