from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone', 'telegram', 'is_moderator']
        # read_only_fields = ['is_moderator']  # админ не меняет это через API

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    telegram = serializers.CharField(max_length=50, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone', 'telegram']
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Пользователь с таким логином уже существует")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return data

    def create(self, validated_data):
        # Убираем лишнее
        validated_data.pop('password_confirm')
        phone = validated_data.pop('phone', '')
        telegram = validated_data.pop('telegram', '')

        # Создаём пользователя
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        # Обновляем Profile (он создаётся автоматически через сигнал)
        if phone or telegram:
            user.profile.phone = phone
            user.profile.telegram = telegram
            user.profile.save()

        return user