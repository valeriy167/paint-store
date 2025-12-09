from rest_framework import serializers
from .models import Product, Manufacturer

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
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'image_url', 'category', 'created_at', 'manufacturer', 'manufacturer_id']
        read_only_fields = ['id', 'created_at']
