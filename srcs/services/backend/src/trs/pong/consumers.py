import json
import random
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match
from .serializers import MatchSerializer
from .pong_game import get_game_state
from asgiref.sync import sync_to_async

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
        # Getting id from url (ws)
        self.match_id = self.scope['url_route']['kwargs']['id']
        # Setting group (channels) for sending data to ws
        self.group_name = f'match_{self.match_id}'
        self.ball = {
            'x': '0',
            'y': '0',
        }

        # Adding a the current connection to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # # await self.get_channels_in_group(self.group_name)
        # # Sending the same 
        # print('init_pong_game')
        # await self.send_to_connection({'game_state' : 'init_pong_game'})
        
        # match = await sync_to_async(Match.objects.get)(id=self.match_id)
        # match_json = MatchSerializer(match)
        # print(match_json.data)
        # if match_json.data['status'] == 'pending':
        #     match.status = 'joined'
        #     await sync_to_async(match.save)()
        # elif match_json.data['status'] == 'joined':
        #     match.status = 'playing'
        #     await sync_to_async(match.save)()


        # # Accepting connection
        # await self.accept()

        # # Obtener el partido desde la base de datos
        # match = await sync_to_async(Match.objects.get)(id=self.match_id)

        # # Verificar si el partido está pendiente
        # if match.status == 'pending':
        #     # Si está pendiente, intentar cambiar el estado a "joined"
        #     match.status = 'joined'
        #     await sync_to_async(match.save)()

        #     # Si la conexión actual cambió el estado a "joined", esperar 1 segundo antes de verificar el estado nuevamente
        #     await asyncio.sleep(1)

        #     # Obtener el estado actualizado del partido desde la base de datos
        #     match = await sync_to_async(Match.objects.get)(id=self.match_id)

        # # Verificar si el partido ya está "joined" (o fue cambiado por la conexión anterior)
        # if match.status == 'joined':
        #     # Si ya está "joined", cambiar el estado a "playing"
        #     match.status = 'playing'
        #     await sync_to_async(match.save)()



        # match = await sync_to_async(Match.objects.get)(id=self.match_id)
        # match_json = MatchSerializer(match)
        # print(match_json.data['status'])
        
        
        # Accepting connection
        await self.accept()
        await self.send_to_connection({'game_state' : 'welcome'})
        # if not match.timer_started:
        #     print("if not match.timer_started")
        #     match.timer_started = True
        #     await sync_to_async(match.save)()
        # else:
        #     print('el otro')
        #     await self.send_to_connection({'game_state' : 'init_pong_game'})
        #     # await self.send_to_connection({'game_state' : 'timer' , 'timer' : match.time_elapsed})
        #     # await self.send_to_group(f'time_elapsed: {match.time_elapsed} seconds')
        # asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        print(f"DISCONNECT  {close_code}")
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def websocket_disconnect(self, close_code):
        await self.send_to_group('someone_left')
        print(f"WEBSOCKET DISCONNECTTTTTTTTTTTT   {close_code}")


    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        if message == 'confirm':
            match = await sync_to_async(Match.objects.get)(id=self.match_id)
            match_json = MatchSerializer(match)
            print(match_json.data)
            if match_json.data['status'] == 'pending':
                match.status = 'joined'
                await sync_to_async(match.save)()
            elif match_json.data['status'] == 'joined':
                match.status = 'playing'
                await sync_to_async(match.save)()
        elif message == 'score':
            print("Someone wants to know the score")
            

    async def send_to_group(self, param):
        print(f"send to group {param}")
        await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_game_state',
                    'game_state': f'{param}',
                    'sender_to' : self.group_name
                }
            )

    async def send_to_connection(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_game_state(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_loop(self):
        # await self.send_to_group('init_pong_game')
        game_started = False
        game_duration = 10
        
        
        match = await sync_to_async(Match.objects.get)(id=self.match_id)

        if match and match.timer_started:
            game_started = True
            time_elapsed = match.time_elapsed
            await self.send_to_group('start_game')

        if not game_started:
            await self.send_to_group('start_game')
            game_started = True
            time_elapsed = 0

        while time_elapsed < game_duration:
            # Tu lógica de juego aquí

            # Verificar si algún jugador se ha desconectado
            # disconnected_players = set()
            # for channel_name in self.channel_layer.group_channels(self.group_name):
            #     if not await self.channel_layer.send(channel_name, {'type': 'ping'}):
            #         disconnected_players.add(channel_name)

            # # Si algún jugador se ha desconectado, pausa el juego y espera su regreso
            # if disconnected_players:
            #     await self.send_to_group('pause_game')

            # Actualizar el tiempo transcurrido
            time_elapsed += 1
            print(time_elapsed)
            match.time_elapsed = time_elapsed
            await sync_to_async(match.save)()

            # # Verificar si ha pasado 5 segundos y enviar actualización del tiempo
            # if time_elapsed % 5 == 0:
            time_remaining = game_duration - time_elapsed
            await self.send_to_connection({'game_state' : 'timer' , 'timer' : time_remaining})

            await asyncio.sleep(1)

        # El juego ha terminado
        await self.send_to_group('end_game')

        # # Guardar el estado del temporizador en la base de datos
        # with transaction.atomic():
        #     match = Match.objects.select_for_update().get(match_id=self.match_id)
        #     match.timer_started = False
        #     match.time_elapsed = 0
        #     match.save()
        
        
        # await self.send_to_connection({'game_state' : 'init_pong_game'})
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

    # async def get_channels_in_group(self, group_name):
    #     channels = await self.channel_layer.group_channels(self.group_name)
    #     # channels = channel_layer.group_channels(group_name)
    #     channels_list = list(channels)
    #     print(channels_list)



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

    async def receive(self, text_data):
        message = json.loads(text_data)
        print(message)

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
