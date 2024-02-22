import json, os, jwt
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    #called when a Websocket connecttion is established
    async def connect(self):
        user = self.scope["user"]
        print(user)
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

#RECEIVE MSG FROM WEBSOCKET
    async def receive(self, text_data):
            data = json.loads(text_data)
            token = data.get('token', None)
            print(data)

            if token:
                # Decode and verify the JWT token
                user = await self.get_user_from_token(token)

                if user:
                    print("WELCOME @", user)
                    await self.channel_layer.group_add(
                        f"user_{user.id}",
                        self.channel_name
                    )
                    message =  {'message': 'Welcome to the lobby! @'}
                    json_data = json.dumps({'message': message['message'] + user.username})
                    await self.send(text_data=json_data)
                else:
                    await self.send(text_data=json.dumps({'message': 'Authentication failed'}))
            else:
                await self.send(text_data=json.dumps({'message': 'Token not provided'}))

    async def disconnect(self, close_code):
        #Called when a WebSocket connection is closed, removes the consumer from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    #Sends a notification to the client by converting the event data (a dictionary) 
    # to a JSON string and sending it as text data through the WebSocket connection.
    async def chat_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=['HS256'])
            user_id = payload['user_id']
            return User.objects.get(pk=user_id)
        except jwt.ExpiredSignatureError:
            return None  # Token has expired
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return None  # Invalid token or user not found