import json, os, jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
from users.models import User
from chat.models import Message
from chat.serializers import CustomSerializer
from chat.models import BlackList

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("connect chat")
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
            # store the last connection time to the group in database
    )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await super().disconnect(close_code)
        # store the disconnection time to the group in database

    async def receive(self, text_data):
        data = json.loads(text_data)
        token = data.get('token', None)

        if token:
            user = await self.get_user_from_token(token)
            if user:
                print("RECEIVING", data)
                message = data['message']
                receiver_id = user.username
                sender = await self.get_user(receiver_id.replace('"', ''))
                print(self.room_group_name)
                if self.is_blocked(sender, self.room_group_name):
                    message = "You have blocked this user"
                    receiver_id = "ERROR"
                    await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message',
                        'message': message,
                        'senderUsername': receiver_id,
                       
                    },
                    )
                    print("YOU HAVE BLOCKED THIS USER")
                    return
                await self.save_message(sender=sender, message=message, thread_name=self.room_group_name)
                # find the queued messages in the db
                messages = await self.get_messages()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message',
                        'message': message,
                        'senderUsername': receiver_id,
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

    # @database_sync_to_async
    async def is_blocked(self, user_id, receiver_id):
        if BlackList.objects.filter(blocking_user_id=blocking_user_id, blocked_user_id=blocked_user_id).exists():
            print("BLOCKED RELATIONSHIP WAS FOUND")
            return True
        else:
            print("HELL NO")
            return False
        # blocked_users = await database_sync_to_async(BlackList.objects.filter)(
        #     blocked_user=user_id
        # )

        # # receiver_blocked = any(user.blocking_user.id == receiver_id for user in blocked_users)
        # # sender_blocked = any(user.blocked_user.id == receiver_id for user in blocked_users)
        # receiver_blocked = blocked_users.filter(blocking_user_id=receiver_id).exists()
        # sender_blocked = blocked_users.filter(blocked_user_id=receiver_id).exists()

        # return sender_blocked or receiver_blocked
    # def is_blocked(self, user, thread_name):
    #     print("THREAD NAME", thread_name)
    #     receiver_id = self.scope['url_route']['kwargs']['id']
    #     print("RECEIVER USERNAME", receiver_id)
    #     print("SENDER USERNAME", user)
    #     user = user.id
    #     print("SENDER userid", user)

        # blocked_users = BlackList.objects.filter(blocked_user=user)

        # receiver_blocked = any(user.blocking_user.username == receiver_id for user in blocked_users)
        
        # sender_blocked = any(user.blocked_user.username == receiver_id for user in blocked_users)

        # return sender_blocked or receiver_blocked

    # @database_sync_to_async
    # def is_blocked(self, user, thread_name):
    #     print("THREAD NAME", thread_name)
    #     receiver_id = self.scope['url_route']['kwargs']['id']
    #     print("SENDER USERNAME", receiver_id)
    #     print("TARGET", user)
    #     user_id = user.id
    #     print("current userid", user)

    #     blocked_users = BlackList.objects.filter(blocked_user=user_id)

    #     receiver_blocked = any(user.blocking_user.username == receiver_id for user_id in blocked_users)
        
    #     sender_blocked = any(user.blocked_user.username == sender_id for user_id in blocked_users)

    #     return sender_blocked or receiver_blocked