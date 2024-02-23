from django.db import models
from users.models import User

# Create your models here.
class Notification(models.Model):
    message = models.CharField(max_length=100)

    def __str__(self):
        return self.message

class PublicRoom(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username