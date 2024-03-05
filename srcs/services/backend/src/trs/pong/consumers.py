import asyncio
json = {
    "type": "send.message",
    "content": "Hello!"
}

import json
import random
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
# from management.models import Match
# from asgiref.sync import sync_to_async

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
