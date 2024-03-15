from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.generics import RetrieveAPIView
from .models import PublicRoom



from django.db import models
from users.models import User

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PublicRoom
from .serializers import PublicRoomSerializer


class NotifyUserView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            public_room = PublicRoom.objects.get(user=user)
            serializer = PublicRoomSerializer(public_room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # except User.DoesNotExist:
        #     return Response({'error': f'{username} does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        except PublicRoom.DoesNotExist:
            return Response({'error': f'{username} is not in the PublicRoom.'})
            # , status=status.HTTP_404_NOT_FOUND)