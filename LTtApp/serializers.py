from django.forms import ValidationError
from rest_framework import serializers
from .models import CustomUser, Tour, Paso

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'is_active', 'date_joined', 'last_login', 'avatar', 'bio']

    def validate_password(self, value):
        try:
            from django.contrib.auth.password_validation import validate_password
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class TourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = '__all__'

class PasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paso
        fields = '__all__'
