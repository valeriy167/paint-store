from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Review
from products.serializers import ProductSerializer
from products.models import Product

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # при чтении — данные автора
    product = ProductSerializer(read_only=True)  # при чтении — данные товара
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source='product'
    )
    rating = serializers.ChoiceField(choices=[1, 2, 3, 4, 5])

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'product', 'product_id', 'text', 'rating',
            'created_at', 'is_approved'
        ]
        read_only_fields = ['user', 'created_at', 'is_approved']

    def create(self, validated_data):
        # Привязываем отзыв к текущему пользователю
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)