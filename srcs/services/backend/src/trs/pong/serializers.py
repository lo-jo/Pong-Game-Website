from rest_framework import serializers
from .models import Match

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ('status', 'user_1', 'user_2', 'winner', 'loser', 'tournament')

    def create(self, validated_data):
        new_match_created = Match.objects.create(**validated_data)
        return new_match_created