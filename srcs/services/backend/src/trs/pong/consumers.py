import json
import random
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match
from .pong_game import get_game_state

# class PongConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()

#     async def disconnect(self, close_code):
#         pass

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         await self.send(text_data=json.dumps({
#             'message': message
#         }))

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['id']
        self.group_name = f'match_{self.match_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        # asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        message = json.loads(text_data)
        print(message)

    async def send_to_group(self, param):
        print("send to group")
        await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_game_state',
                    'game_state': param
                }
            )

    async def send_to_connection(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_game_state(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_loop(self):
        await self.send_to_connection({'game_state' : 'init_pong_game'})
        # while True:
        #     game_state = get_game_state(param)
        #     param = 2
        #     print(game_state)
        #     await self.channel_layer.group_send(
        #         self.group_name,
        #         {
        #             'type': 'send_game_state',
        #             'game_state': game_state
        #         }
        #     )
        #     await asyncio.sleep(0.1)

class MatchConsumer(AsyncWebsocketConsumer):
    # groups = ["broadcast"]
    async def connect(self):
        # All the users (ws) that we are going to play a match will be stored in this group
        self.room_group_name = 'matches_group'
        
        print(f"Someone is connecting to ${self.room_group_name}")
    
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

    async def websocket_disconnect(self, close_code):
        # Manejar el cierre de la conexión WebSocket
        print(f"Conexión cerrada con código de cierre:   {close_code}")

    async def receive(self, text_data):
        pass
        # message = json.loads(text_data)

        # action = message.get("action")

        # if action == "add_me_to_match":
        #     match_id = message.get("match_id")
        #     match_group = 'match_' + str(match_id)

        #     print(f'Creating match with id ${match_group} in channels')
        #     # Adding user to the unique match
        #     await self.channel_layer.group_add(
        #         match_group,
        #         self.channel_name
        #     )

    async def send_match_notification(self, event):
        await self.send(text_data=json.dumps(event))
