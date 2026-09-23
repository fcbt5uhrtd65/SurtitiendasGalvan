from rest_framework import serializers

from apps.customers.infrastructure.models import Customer, CustomerAddress


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ['id', 'label', 'city', 'address_line', 'is_default']


class CustomerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    addresses = CustomerAddressSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone',
            'document_type', 'document_number', 'is_active', 'addresses', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
