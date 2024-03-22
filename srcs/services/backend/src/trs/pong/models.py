# Django imports
from django.db import models
from django.utils import timezone
# Own imports
from users.models import User

class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    creator_id = models.ForeignKey(
        User, related_name='creator_id', on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default='pending')
    # participants = models.ForeignKey(Participant)

class Participant(models.Model):
    id = models.AutoField(primary_key=True)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='participants')
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    # Created_at: when the participant was added to the tournament or the same info as created at in tournament?
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.tournament_id} - {self.user_id}"

class Match(models.Model):
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('joined', 'Joined'),
        ('playing','Playing'),
        ('completed', 'Completed'),
    ]

    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='pending')
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='matches_as_player_1')
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='matches_as_player_2')
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='matches_won')
    loser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='matches_lost')
    score_user_1 = models.IntegerField(default=0)
    score_user_2 = models.IntegerField(default=0)
    tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, null=True, related_name='matches')
    created_at = models.DateTimeField(default=timezone.now)
    timer_started = models.BooleanField(default=False)
    time_elapsed = models.IntegerField(default=0)

