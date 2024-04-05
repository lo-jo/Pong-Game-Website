# Django imports
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.response import Response
# Channels
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# Own imports
from .models import Match, Tournament, Participant
from .serializers import MatchSerializer, TournamentSerializer, ParticipantSerializer
from django.db import transaction
from itertools import combinations

class PongDashboardView(APIView):
    permission_classes = [IsAuthenticated]

class AllMatchesView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

class MatchDetailView(RetrieveAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        id = self.kwargs['pk']
        try:
            return Match.objects.get(pk=id)
        except Match.DoesNotExist:
            raise NotFound("Match not found")

# class JoinMatchView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             # Try to get the last match available
#             latest_match = Match.objects.latest('created_at')
#             # Condition to not join same the game with the same user in CLI
#             if latest_match.user_1 != request.user:
#                 print("You are going to join the last match created")
#                 latest_match.user_2 = request.user
#                 latest_match.save()
#                 serializer = MatchSerializer(latest_match)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             else:
#                 print("Created new match because you are the other user")
#                 new_match = Match.objects.create(status='pending')
#                 new_match.user_1 = request.user
#                 new_match.save()
#                 serializer = MatchSerializer(new_match)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except Match.DoesNotExist:
#             print("Created new match!")
#             new_match = Match.objects.create(status='pending')
#             new_match.user_1 = request.user
#             new_match.save()
#             serializer = MatchSerializer(new_match)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)

# Message
# create_join -> Create and join match
# join_play -> Join and start the game

class JoinMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def join_user_to_match_lobby(self, action, match_id):
        # Send message using the WebSocket when the match is update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'matches_group',
            {
                'type': 'send_match_notification',
                'action': action,
                'match_id': match_id,
            }
        )

    def post(self, request):
        try:
            # Getting latest match posted
            print("////////////////In POST////////////////////")
            latest_match = Match.objects.latest('created_at')

            if latest_match.status == 'completed':
                new_match = Match.objects.create(status='pending')
                new_match.user_1 = request.user
                new_match.save()
                serializer = MatchSerializer(new_match)
                # Sends a message via WebSocket when a new match is created.
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'matches_group',
                    {
                        'type': 'send_match_notification',
                        'action': 'create_join',
                        'match_id': new_match.id,
                    }
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            if latest_match.user_1 != request.user:
                print("You are going to join the last match created")
                latest_match.user_2 = request.user
                latest_match.save()
                serializer = MatchSerializer(latest_match)
                self.join_user_to_match_lobby('join_play', latest_match.id)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                print("Created new match because you are the other user")
                new_match = Match.objects.create(status='pending')
                new_match.user_1 = request.user
                new_match.save()
                serializer = MatchSerializer(new_match)
                # Sends a message via WebSocket when a new match is created.
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'matches_group',
                    {
                        'type': 'send_match_notification',
                        'action': 'create_join',
                        'match_id': new_match.id,
                    }
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Match.DoesNotExist:
            print("Match does not exists, so creating another")
            new_match = Match.objects.create(status='pending')
            new_match.user_1 = request.user
            new_match.save()

            serializer = MatchSerializer(new_match)
            # Sends a message via WebSocket when a new match is created.
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'matches_group',
                {
                    'type': 'send_match_notification',
                    'action': 'create_join',
                    'match_id': new_match.id,
                }
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

# TOURNAMENT STUFF
class OpenTournamentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        open_tournaments = Tournament.objects.all()
        # open_tournaments = Tournament.objects.annotate(num_participants=Count('participants')).filter(num_participants__lt=4)
        serializer = TournamentSerializer(open_tournaments, many=True)
        return Response(serializer.data)

class TournamentView(APIView):
    def get(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            serializer = TournamentSerializer(tournament)
            matches = Match.objects.filter(tournament=tournament)
            match_serializer = MatchSerializer(matches, many=True)
            tournament_data = serializer.data
            tournament_data['matches'] = match_serializer.data
            return Response(tournament_data)
        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("=> Creating new tournament")
            tournament_name = request.data.get('tournamentName')

            # Create tournament
            tournament = Tournament.objects.create(name=tournament_name, creator_id=request.user, status='pending')

            # Add creator of the tournament to the actual tournament DUH
            participant = Participant.objects.create(tournament_id=tournament, user_id=request.user)

            serializer = TournamentSerializer(tournament)

            return Response({
                'id': serializer.data['id'],
                'creator_id': serializer.data['creator_id'],
                'name': serializer.data['name'],
                'created_at': serializer.data['created_at'],
                'status': serializer.data['status'],
                'participants': ParticipantSerializer(participant).data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JoinTournamentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tournament_id):
        try:
            user = request.user
            tournament = Tournament.objects.get(id=tournament_id)

            # Check if the user is already a participant in the tournament
            if tournament.participants.filter(user_id=user).exists():
                return Response({'error': 'You are already a participant in this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the tournament is full (has 4 participants)
            if tournament.participants.count() >= 4:
                return Response({'error': 'This tournament is already full.'}, status=status.HTTP_400_BAD_REQUEST)

            # Create participant entry for the user in the tournament
            with transaction.atomic():
                Participant.objects.create(tournament_id=tournament, user_id=user)
                
                # Check if the tournament is complete
                if tournament.participants.count() == 4:
                    tournament.status = 'full'
                    tournament.save()
                    self.create_matches_for_tournament(tournament)

            serializer = TournamentSerializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create_matches_for_tournament(self, tournament):
        participants = tournament.participants.all()

        if participants.count() == 4:
            for p1, p2 in combinations(participants, 2):
                Match.objects.create(
                    user_1=p1.user_id,
                    user_2=p2.user_id,
                    tournament=tournament
                )

class DeleteAllMatches(APIView):
    def post(self, request, format=None):
        Match.objects.all().delete()
        return Response({'message': 'All items have been deleted'}, status=status.HTTP_204_NO_CONTENT)

