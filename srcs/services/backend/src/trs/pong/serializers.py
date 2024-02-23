from rest_framework import serializers
from .models import Match

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ('status', 'user_1', 'user_2', 'winner', 'loser', 'tournament', 'created_at')

    def validate(self, data):
        if 'status' not in data or not data['status']:
            raise serializers.ValidationError("The 'status' field is mandatory to create a match.")
        return data
    
    def create(self, validated_data):
        new_match_created = Match.objects.create(**validated_data)
        return new_match_created
