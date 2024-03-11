import json, os, jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
from users.models import User
from chat.models import Message
from chat.serializers import CustomSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope["query_string"]
        token_params = parse_qs(query_string.decode("utf-8")).get("token", [""])[0]
        current_user = await self.get_user_from_token(token_params)
        if current_user:
            current_user_id = current_user.pk
            target = self.scope['url_route']['kwargs']['id']
            self.room_name = (
                f'{current_user_id}_{target}'
                if int(current_user_id) > int(target)
                else f'{target}_{current_user_id}'
            )
            self.room_group_name = f'chat_{self.room_name}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            welcome_message = f"{current_user.username} just joined the chat."
            bot = f"Server"
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message',
                    'message': welcome_message,
                    'senderUsername': bot,
                }
    )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await super().disconnect(close_code)

    async def receive(self, text_data):
        data = json.loads(text_data)
        token = data.get('token', None)

        if token:
            user = await self.get_user_from_token(token)
            if user:
                print("RECEIVING", data)
                message = data['message']
                sender_username = user.username
                sender = await self.get_user(sender_username.replace('"', ''))
                if self.is_blocked(sender, self.room_group_name):
                # Handle the situation where users are blocked (e.g., ignore the message)
                    return
                await self.save_message(sender=sender, message=message, thread_name=self.room_group_name)
                messages = await self.get_messages()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message',
                        'message': message,
                        'senderUsername': sender_username,
                        'messages': messages,
                    },
                )

    async def message(self, event):
            message = event['message']
            username = event['senderUsername']

            # Send the message to the connected client
            await self.send(
                text_data=json.dumps(
                    {
                        'message': message,
                        'senderUsername': username,
                    }
                )
            )

    async def chat_message(self, event):
            message = event['message']
            username = event['senderUsername']
            # messages = event['messages']

            await self.send(
                text_data=json.dumps(
                    {
                        'message': message,
                        'senderUsername': username,
                        # 'messages': messages,
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

    @database_sync_to_async
    def is_blocked(self, user, thread_name):
        sender_blocked = BlackList.objects.filter(
            blocked_user=user,
            # Double underscore is used to traverse the relationship
            # between Blacklist model and the User model.
            blocking_user__username=self.scope['url_route']['kwargs']['id']
        ).exists()

        receiver_blocked = BlackList.objects.filter(
            blocked_user__username=self.scope['url_route']['kwargs']['id'],
            blocking_user=user
        ).exists()

        return sender_blocked or receiver_blocked