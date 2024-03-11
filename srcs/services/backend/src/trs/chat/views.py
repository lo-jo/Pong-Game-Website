from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import BlackList
from .serializers import BlackListSerializer

class BlockUserView(generics.CreateAPIView):
    queryset = BlackList.objects.all()
    serializer_class = BlackListSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer, pk):
        blocked_user = get_object_or_404(User, pk=pk)
        serializer.save(blocking_user=self.request.user, blocked_user=blocked_user)


class UnblockUserView(generics.DestroyAPIView):
    queryset = BlackList.objects.all()
    serializer_class = BlackListSerializer
    permission_classes = [IsAuthenticated]