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
            latest_match = Match.objects.latest('created_at')
            print("//////////")
            print(latest_match.user_1)
            print("//////////")
            if latest_match.user_1 != request.user:
                print("You are going to join the last match created")
                latest_match.user_2 = request.user
                latest_match.save()
                serializer = MatchSerializer(latest_match)
                # Send message using the WebSocket when the match is update
                # channel_layer = get_channel_layer()
                # async_to_sync(channel_layer.group_send)(
                #     'matches_group',
                #     {
                #         'type': 'send_match_notification',
                #         'action': 'join_play',
                #         'match_id': latest_match.id,
                #     }
                # )
                self.join_user_to_match_lobby('join_play', latest_match.id)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                print("Maybe this will be a match to more")
                # return Response({}, status=status.HTTP_200_OK)
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
            print("Created new match!")
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


       
