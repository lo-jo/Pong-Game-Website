import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    #called when a Websocket connecttion is established
    async def connect(self):
        #all clients connected to this consumer will be part of the public room
        self.group_name = 'public_room'
        #adds the consumer to the specified group using the channel layer
        # A channel layer is responsible for managing communication between different instances of the same appliations
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        #Accepts the websocket connection and completes the handshake process
        await self.accept()

    async def disconnect(self, close_code):
        #Called when a WebSocket connection is closed, removes the consumer from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({ 'message': event['message'] }))