from rest_framework import serializers
from .models import Product, Manufacturer, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'created_at'] # Включаем id и created_at для отображения/удаления
        read_only_fields = ['id', 'created_at'] # id и created_at не нужно отправлять при создании

# Сериализатор для Производителя
class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'description', 'logo']

# Сериализатор для Товара
class ProductSerializer(serializers.ModelSerializer):
    # Поле для чтения данных производителя
    manufacturer = ManufacturerSerializer(read_only=True)
    # Поле для записи ID производителя
    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufacturer.objects.all(),
        source='manufacturer',  # Указывает, какое поле модели обновлять
        write_only=True,
        required=False,
        allow_null=True,
        help_text="ID Производителя (может быть null)"
    ),
    images = ProductImageSerializer(many=True, read_only=True) # Для отображения списка изображений
    new_images = serializers.ListField(
        child=serializers.ImageField(), # Поле для загрузки новых изображений
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'category', 'created_at', 'manufacturer', 'manufacturer_id', 'images', 'new_images']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Извлекаем new_images из validated_data
        new_images_data = validated_data.pop('new_images', [])
        # Создаём продукт
        product = Product.objects.create(**validated_data)

        # Создаём ProductImage для каждого файла из new_images_data
        for image_data in new_images_data:
            ProductImage.objects.create(product=product, image=image_data)

        return product

    def update(self, instance, validated_data):
        # Извлекаем new_images из validated_data
        new_images_data = validated_data.pop('new_images', [])

        # Обновляем основные поля продукта
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Создаём ProductImage для новых файлов
        for image_data in new_images_data:
            ProductImage.objects.create(product=instance, image=image_data)

        return instance