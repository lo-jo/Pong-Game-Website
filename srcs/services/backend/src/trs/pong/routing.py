from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/pong/match', consumers.MatchConsumer.as_asgi()),
    re_path(r'ws/pong/tournament', consumers.TournamentConsumer.as_asgi()),
]