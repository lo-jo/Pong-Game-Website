# Django imports
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.response import Response
# Own imports
from .models import Match
from .serializers import MatchSerializer

class AllMatchesView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

class JoinMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        latest_match = Match.objects.latest('created_at')
        print(latest)
        serializer = MatchSerializer(latest_match)
        return Response(serializer.data, status=status.HTTP_200_OK)
