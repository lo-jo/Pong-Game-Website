import json, os, jwt
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from notification.models import PublicRoom
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    #called when a Websocket connecttion is established
    async def connect(self):
        query_string = self.scope["query_string"]
        token_params = parse_qs(query_string.decode("utf-8")).get("token", [""])[0]
        # token validation and find user from token
        user = await self.get_user_from_token(token_params)
        print("PRINTING USER AT CONNECTION", user)
        # Set the user in the connection scope
        self.scope['user'] = user
        #all clients connected to this consumer will be part of the public room
        self.group_name = 'public_room'
        await self.handle_user_connection(user)
        #Accepts the websocket connection and completes the handshake process
        await self.accept()

    #RECEIVE MSG FROM WEBSOCKET
    async def receive(self, text_data):
            data = json.loads(text_data)
            token = data.get('token', None)
            if token:
                # Decode and verify the JWT token
                user = await self.get_user_from_token(token)
                if user:
                    message = {'message': 'YOURE SENDIN A MESSAGE! @'}
                    json_data = json.dumps({'message': message['message'] + user.username})
                    await self.send(text_data=json_data)
                    # await sync_to_async(self.handle_user_connection)(user)
                else:
                    await self.send(text_data=json.dumps({'message': 'Authentication failed'}))
                    self.close()
            else:
                await self.send(text_data=json.dumps({'message': 'Token not provided'}))
                self.close()

    async def disconnect(self, close_code):
        user = self.scope.get("user")
        print("disconnect function, calling user#", user)
        if user :
            print("CLOSING WEBSOCKET FROM USER ", user.username)
            #On closing of a websockt, remove user from public channel 
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            # remove user from database
            await sync_to_async(self.handle_user_disconnection)(user)

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

    @database_sync_to_async
    def handle_user_connection(self, user):
        if not PublicRoom.objects.filter(user=user).exists():
            PublicRoom.objects.create(user=user)
            print("WELCOME @", user)
            self.channel_layer.group_add(
                f"user_{user.id}",
                self.channel_name
            )
            message = {'message': 'Welcome to the lobby! @'}
            json_data = json.dumps({'message': message['message'] + user.username})
            self.send(text_data=json_data)

    def handle_user_disconnection(self, user):
        # Remove the user from the PublicRoom model
        print("DELETING ", user.username)
        PublicRoom.objects.filter(user=user).delete()
        self.close()