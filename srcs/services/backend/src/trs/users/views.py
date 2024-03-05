from .models import User, Friendship
from django.shortcuts import get_object_or_404
from users.serializers import UserSerializer, UpdateUserSerializer, FriendSerializer, FriendUsernameSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
#TEST CHECK_AUTHENTICATION
from rest_framework_simplejwt.authentication import JWTAuthentication


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
    # Anybody can get this
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
        print("QUERY SET USERNAME:", user.username)
        # List all the friendship objects where the target user was either a sender or a recipient (=all friends)
        return Friendship.objects.filter(sender=user) | Friendship.objects.filter(recipient=user)
    #Show friend list of the target user 
    def get(self, request, username, *args, **kwargs):
        user = get_object_or_404(User, username=username)
        usernombre = user.username
        friendships = self.get_queryset(username=user.username)
        serializer = FriendUsernameSerializer(friendships, many=True)  # Use many=True since it's a queryset

        modified_data = []
        for entry in serializer.data:
            print("is it looping thru : ", list(entry.values()))
            if usernombre in entry.values():
                if (entry['sender_username'] == usernombre):
                    del entry['sender_username']
                elif (entry['recipient_username'] == usernombre):
                    del entry['recipient_username']
            modified_data.append(entry)
        return Response(modified_data, status=status.HTTP_200_OK)

    def post(self, request, username, *args, **kwargs):
            #user sending the friend request (the sender)
            current_user = request.user
            print("SENDER id:", current_user)
            print("USERNAME IN THE POST METHOD: (should be the target)", username)
            # Get the target user (User 2)

            # target_user = username
            # print("TARGET username:", target_user)
            target_user = get_object_or_404(User, username=username)
            print("TARGET username:", target_user.username)

            # Check if the users are the same
            if current_user == target_user:
                return Response({"error": "Cannot add yourself as a friend."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the friendship already exists
            if Friendship.objects.filter(sender=current_user, recipient=target_user).exists():
                return Response({"error": "Friendship already exists."}, status=status.HTTP_400_BAD_REQUEST)
            if Friendship.objects.filter(sender=target_user, recipient=current_user).exists():
                return Response({"error": "Friendship already exists."}, status=status.HTTP_400_BAD_REQUEST)
            # Create a new friendship using the serializer
            serializer = FriendSerializer(data={'sender': current_user.pk, 'recipient': target_user.pk})
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    # Defines the field to be used to search for the user by user ID
    lookup_field = 'pk'

class UserProfileView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        id = self.kwargs['pk']
        try:
            return User.objects.get(pk=id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
class CheckAuthentication(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response({'authenticated': True})