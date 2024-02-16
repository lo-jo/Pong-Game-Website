from rest_framework import serializers
from .models import User
from rest_framework.permissions import AllowAny

# A user serializer will translate python data to JSON data and vice versa

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'id', 'bio', 'profile_pic')
        extra_kwargs = {'password': {'write_only': True}}
    # method to create a new row in the database
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UpdateUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    bio = serializers.CharField(required=False)
    profile_pic = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'bio', 'profile_pic')


    def validate_username(self, value):
        print("value:", value)
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError({"username": "This username is already in use."})
        return value

    def validate_email(self, value):
        print("vVALIDATE EMAIL:")
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        return value

    def validate_bio(self, value):
        print("value:", value)
        user = self.context['request'].user
        return value

    def validate_profile_pic(self, value):
        print("value:", value)
        user = self.context['request'].user
        return value

    def update(self, instance, validated_data):
        print("Validated Data:", validated_data)
        print("Instance:", instance)
        user = self.context['request'].user
        if user.pk != instance.pk:
            raise serializers.ValidationError({"authorize": "You dont have permission for this user."})
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.bio = validated_data.get('bio', instance.bio)
        profile_pic = validated_data.get('profile_pic')
        if profile_pic:
            instance.profile_pic = profile_pic
        instance.save()

        return instance

# class UpdateUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'bio']
#         extra_kwargs = {
#             'username' : {'required' : False},
#             'email' : {'required' : False},
#             'bio' : {'required' : False}
#         }