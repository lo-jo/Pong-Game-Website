from .models import User, Friendship
from django.shortcuts import get_object_or_404
from users.serializers import UserSerializer, UpdateUserSerializer, FriendSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny

class AllUsersView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserView(APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = [JSONParser, MultiPartParser]

    def get(self, request):
        serializer = UserSerializer(request.user, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RegisterUserView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    def post(self, request):
        # if email is already in use
        if User.objects.filter(email=request.data['email']).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=request.data['username']).exists():
            return Response({'error': 'Username already registered'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UpdateUserSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    def perform_update(self, serializer):
        # Associate the updated image with the user
        profile_pic = self.request.data.get('profile_pic')
        if profile_pic:
            serializer.instance.profile_pic = profile_pic
        serializer.save()

class FriendshipView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_queryset(self, username):
        user = get_object_or_404(User, username=username)
        return Friendship.objects.filter(sender=user) | Friendship.objects.filter(recipient=user)

    def get(self, request, username, *args, **kwargs):
        #print(self.request.data)
        serializer = FriendSerializer(request.user, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, username, *args, **kwargs):
        print("SELF:", get_object_or_404(User, username=username))
        sender = request.data.get('sender')
        print("SENDER:", sender)
        recipient = request.data.get('recipient')
        print("RECIPIENT", sender)

        if sender == recipient:
            return Response({"error": "Cannot add yourself as a friend."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new friendship using the serializer
        serializer = FriendSerializer(data={'sender': sender, 'recipient': recipient})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)