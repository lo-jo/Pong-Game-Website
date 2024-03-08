from rest_framework import serializers
from .models import Match, Tournament, Participant

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ('id', 'status', 'user_1', 'user_2', 'winner', 'loser', 'tournament', 'created_at')

    def validate(self, data):
        if 'status' not in data or not data['status']:
            raise serializers.ValidationError("The 'status' field is mandatory to create a match.")
        return data
    
    def create(self, validated_data):
        new_match_created = Match.objects.create(**validated_data)
        return new_match_created

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ['id', 'tournament_id', 'user_id', 'created_at']

class TournamentSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'creator_id', 'name', 'created_at', 'participants']

    def validate(self, data):
        if 'name' not in data or not data['name']:
            raise serializers.ValidationError("The 'name' field is mandatory to create a tournament.")
        return data

    def create(self, validated_data):
        new_tournament_created = Tournament.objects.create(**validated_data)
        return new_tournament_created
