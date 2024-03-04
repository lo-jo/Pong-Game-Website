import json, os, jwt

from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
# from notification.models import PublicRoom
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
from users.models import User
from chat.models import Message
from chat.serializers import CustomSerializer

# User = get_user_model()

# class ChatConsumer(AsyncWebsocketConsumer):
#     #called when a Websocket connecttion is established
#     async def connect(self):
#         query_string = self.scope["query_string"]
#         token_params = parse_qs(query_string.decode("utf-8")).get("token", [""])[0]
#         # token validation and find user from token
#         user = await self.get_user_from_token(token_params)
#         print("PRINTING USER AT CONNECTION", user)
#         # Set the user in the connection scope
#         self.scope['user'] = user
#         #all clients connected to this consumer will be part of the public room
#         self.group_name = 'chat_room'
#         await self.handle_user_connection(user)
#         #Accepts the websocket connection and completes the handshake process
#         await self.accept()

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         token = data.get('token', None)

#         if token:
#             user = await self.get_user_from_token(token)
#             if user:
#                 # Get the message from the data
#                 message = data.get('message', '')
#                 print("PRINTING MESSAGE", message)

#                 if message.strip():  # Check if the message is not empty after stripping whitespaces
#                     json_data = json.dumps({'message': f"@{user.username}: {message}"})
#                     await self.send(text_data=json_data)
#                 # else:
#                 #     await self.send(text_data=json.dumps({'message': 'Empty message'}))
#             else:
#                 await self.send(text_data=json.dumps({'message': 'Authentication failed'}))
#                 self.close()
#         else:
#             await self.send(text_data=json.dumps({'message': 'Token not provided'}))
#             self.close()

#     async def disconnect(self, close_code):
#         user = self.scope.get("user")
#         print("disconnect function, calling user#", user)
#         if user :
#             print("CLOSING WEBSOCKET FROM USER ", user.username)
#             #On closing of a websockt, remove user from public channel 
#             await self.channel_layer.group_discard(
#                 self.group_name,
#                 self.channel_name
#             )
#             # remove user from database
#             await sync_to_async(self.handle_user_disconnection)(user)

#     #Sends a notification to the client by converting the event data (a dictionary) 
#     # to a JSON string and sending it as text data through the WebSocket connection.
#     async def chat_message(self, event):
#         message = event["message"]
#         username = message.split(':')[0]  # Extract username from the message
#         await self.send(text_data=json.dumps({"message": f"{username}: {message}"}))

#     @database_sync_to_async
#     def get_user_from_token(self, token):
#         try:
#             payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=['HS256'])
#             user_id = payload['user_id']
#             return User.objects.get(pk=user_id)
#         except jwt.ExpiredSignatureError:
#             return None  # Token has expired
#         except (jwt.InvalidTokenError, User.DoesNotExist):
#             return None  # Invalid token or user not found

#     @database_sync_to_async
#     def handle_user_connection(self, user):
#         # if not PublicRoom.objects.filter(user=user).exists():
#         #     PublicRoom.objects.create(user=user)
#             print("WELCOME @", user)
#             self.channel_layer.group_add(
#                 f"user_{user.id}",
#                 self.channel_name
#             )
#             message = {'message': 'Welcome to the lobby! @'}
#             json_data = json.dumps({'message': message['message'] + user.username})
#             self.send(text_data=json_data)

#     def handle_user_disconnection(self, user):
#         # Remove the user from the PublicRoom model
#         print("DELETING ", user.username)
#         self.close()

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope["query_string"]
        token_params = parse_qs(query_string.decode("utf-8")).get("token", [""])[0]
        # token validation and find user from token

        current_user = await self.get_user_from_token(token_params)
        if current_user:
            current_user_id = current_user.pk
            print("THIS IS THE CURRENT USER ID", current_user_id)
            target = self.scope['url_route']['kwargs']['id']
            print("SENDING TO", target)
            self.room_name = (
                f'{current_user_id}_{target}'
                if int(current_user_id) > int(target)
                else f'{target}_{current_user_id}'
            )
            self.room_group_name = f'chat_{self.room_name}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.disconnect(close_code)

    async def receive(self, text_data):
        data = json.loads(text_data)
        data = json.loads(text_data)
        token = data.get('token', None)

        if token:
            user = await self.get_user_from_token(token)
            if user:
                print("RECEIVING", data)
                message = data['message']
                sender_username = user.username
                sender = await self.get_user(sender_username.replace('"', ''))
                await self.save_message(sender=sender, message=message, thread_name=self.room_group_name)
                messages = await self.get_messages()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'senderUsername': sender_username,
                        'messages': messages,
                    },
                )

    async def chat_message(self, event):
            message = event['message']
            username = event['senderUsername']
            messages = event['messages']

            await self.send(
                text_data=json.dumps(
                    {
                        'message': message,
                        'senderUsername': username,
                        'messages': messages,
                    }
                )
            )

    @database_sync_to_async
    def get_user(self, username):
        return get_user_model().objects.filter(username=username).first()

    @database_sync_to_async
    def get_messages(self):
        custom_serializers = CustomSerializer()
        messages = custom_serializers.serialize(
            Message.objects.select_related().filter(thread_name=self.room_group_name),
            fields=(
                'sender__pk',
                'sender__username',
                'message',
                'thread_name',
                'timestamp',
            ),
        )
        return messages

    @database_sync_to_async
    def save_message(self, sender, message, thread_name):
        Message.objects.create(sender=sender, message=message, thread_name=thread_name)

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