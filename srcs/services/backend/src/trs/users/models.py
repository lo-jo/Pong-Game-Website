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
    #Many to Many field in the db to store all the users' friends
    #friends = models.ManyToManyField("User", blank=True)
    objects = UserProfileManager()
    # USERNAME_FIELD = 'username'

    def __str__(self):
        return self.username

class Friendship(models.Model):
    from_user = models.ForeignKey(
        User, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(
        User, related_name='to_user', on_delete=models.CASCADE)
