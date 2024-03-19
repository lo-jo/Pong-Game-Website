from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

class UserProfileManager(UserManager):
    def create_user(self, email, username, password=None):
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password):
        user = self.create_user(email, username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)

# adding extra database fields to user 
class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True)
    bio = models.TextField(max_length=100, blank=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    profile_pic = models.ImageField(upload_to='users/profile_pic/', blank=True, null=True, default="users/profile_pic/default.png")
    otp_enabled = models.BooleanField(default=False, null=True)
    otp_key = models.CharField(max_length=100, blank=True, null=True)
    otp_verified = models.BooleanField(default=False, null=True)  
    objects = UserProfileManager()

    def __str__(self):
        return self.username

#FriendShip model that holds a friendship betweenh two user objects
class Friendship(models.Model):
    sender = models.ForeignKey(
        User, related_name='sender', on_delete=models.CASCADE, null=True)
    recipient = models.ForeignKey(
        User, related_name='recipient', on_delete=models.CASCADE, null=True)
    def __str__(self):
        return f"{self.sender.username} - {self.recipient.username}"
