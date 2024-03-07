import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match

class MatchConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Someone is connecting to MatchConsumer")
        self.room_name = 'match'
        self.room_group_name = 'match_group'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def send_match_notification(self, event):
        await self.send(text_data=json.dumps(event))

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting to TournamentConsumer")
        self.room_name = 'tournament'
        self.room_group_name = 'tournament_group'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # You can handle incoming messages if needed
        pass

    async def send_tournament_notification(self, event):
        # Send tournament-related notifications to the WebSocket
        message = event['message']
        tournament_id = event['tournament_id']

        await self.send(text_data=json.dumps({
            'type': 'tournament_notification',
            'message': message,
            'tournament_id': tournament_id,
        }))