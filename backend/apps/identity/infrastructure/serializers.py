from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.identity.application.use_cases import RegisterUserInput, RegisterUserUseCase
from apps.identity.infrastructure.models import User


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'date_joined']
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data.setdefault('phone', '')
        return RegisterUserUseCase().execute(RegisterUserInput(**validated_data))
