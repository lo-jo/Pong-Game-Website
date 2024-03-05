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
from .models import Match
from .serializers import MatchSerializer

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


class JoinMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            latest_match = Match.objects.latest('created_at')
            if latest_match.user_1 != request.user:
                print("You are going to join the last match created")
                latest_match.user_2 = request.user
                latest_match.save()
                serializer = MatchSerializer(latest_match)
                # Send message using the WebSocket when the match is update
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'match_group',
                    {
                        'type': 'send_match_notification',
                        'message': 'An existing match has been updated',
                        'match_id': latest_match.id,
                    }
                )
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
                    'match_group',
                    {
                        'type': 'send_match_notification',
                        'message': 'A new match has been created',
                        'match_id': new_match.id,
                    }
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Match.DoesNotExist:
            print("Created new match!")
            new_match = Match.objects.create(status='pending')
            new_match.user_1 = request.user
            new_match.save()
            serializer = MatchSerializer(new_match)
            # Sends a message via WebSocket when a new match is created.
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'match_group',
                {
                    'type': 'send_match_notification',
                    'message': 'A new match has been created',
                    'match_id': new_match.id,
                }
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)


       
