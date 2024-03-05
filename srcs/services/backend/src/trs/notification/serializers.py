from rest_framework import serializers
from .models import PublicRoom


class PublicRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicRoom
        fields = ['user']