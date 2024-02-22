from .models import Match
from .serializers import MatchSerializer
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

class AllMatchesView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        matches = Match.objects.all()
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
