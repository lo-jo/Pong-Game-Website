
json = {
    "type": "send.message",
    "content": "Hello, world!"
}

import json
import random
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))


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
