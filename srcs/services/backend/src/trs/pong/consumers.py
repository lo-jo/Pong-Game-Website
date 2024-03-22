import os, json, jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match
from .serializers import MatchSerializer
from users.models import User
from users.serializers import UserSerializer
from .pong_game import get_game_state
from asgiref.sync import sync_to_async
import asyncio

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
        self.db_user_1 = None
        self.db_user_2 = None
        self.game_user_1 = None
        self.game_user_2 = None
        self.who_i_am_id = None
        self.debug_in_playing = False
        self.time_remaining = 20
        self.game_finish = False

        self.ws_handshake = False
        # Accepting the connection
        await self.accept()
        # Checking if match exists en BDD
        match_info = await self.match_in_db()
        if match_info == None:
            await self.send_to_connection({'type_message' : 'ws_handshake', 'ws_handshake' : 'match_do_not_exist'})
            await self.close()
            return
        # Saving match info in consumer
        self.match_info = match_info

        # Requesting ws handshaking to client
        await self.send_to_connection({'type_message' : 'ws_handshake', 'ws_handshake' : 'tell_me_who_you_are'})

        # Adding a the current connection to the group
        # print("Adding connection consumer to channels group")
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.send_initial_data()

        # asyncio.create_task(self.game_loop())

    async def wait_ws_handshake(self):
        while self.ws_handshake == False:
            print(f'self_ws_handshake ${self.ws_handshake}')
            await asyncio.sleep(1)


    async def disconnect(self, close_code):
        print(f"DISCONNECT  {close_code}")
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def websocket_disconnect(self, close_code):
        await self.send_to_group('game_state', 'someone_left')
        print(f"WEBSOCKET DISCONNECTTTTTTTTTTTT   {close_code}")


    # Receivers
    async def receive(self, text_data):
        data = json.loads(text_data)
        type_message = data.get('type_message')

        print(f"IN RECEIVE: {type_message}")
        match type_message:
            case 'ws_handshake':
                # print('ws_handshake case')
                ws_handshake_message = data.get('ws_handshake')
                # print(f'ws_handshake_message : {ws_handshake_message}')
                await self.receive_ws_handshake(ws_handshake_message, data)
            case 'init_user_data':
                print("/////// CHECKING IF THERE IS THE GOOD USERS")
                user_jwt_token = data.get('token')
                decoded_token = jwt.decode(user_jwt_token, os.getenv("SECRET_KEY"), algorithms=['HS256'])
                user_id = decoded_token['user_id']
                # Checking if the user id in JWT token match with the match info database 
                if user_id == self.match_info["user_1"]:
                    if self.game_user_1 == None:
                        self.game_user_1 = data.get('screen_info')
                        self.game_user_1["user_id"] = user_id
                elif user_id == self.match_info["user_2"]:
                    if self.game_user_2 == None:
                        self.game_user_2 = data.get('screen_info')
                        self.game_user_2["user_id"] = user_id

                print(self.game_user_1 == None)
                print(self.game_user_2 == None)
                print(self.game_user_1)
                print(self.game_user_2)


                # DEBUG
                if self.game_user_1 != None and self.game_user_2 != None:
                    return

                # This connection is user_2 in the match
                if self.game_user_1 == None:
                    self.who_i_am_id = self.game_user_2["user_id"]
                    print("I am the game_user 2, I send my info")
                    print(self.game_user_2)
                    await self.send_to_group('other_user', json.dumps(self.game_user_2))
                # This connection is user_1 in the match 
                if self.game_user_2 == None:
                    print(f'?? {self.game_user_1 == None}')
                    self.who_i_am_id = self.game_user_1["user_id"]
                    print("I am the game_user 1, I send my info")
                    print(self.game_user_1)
                    await self.send_to_group('other_user', json.dumps(self.game_user_1))


                print(f'Here user_1: {self.game_user_1}')
                print(f'Here user_2: {self.game_user_2}')

            case 'other_user':
                print("-------------------------- Receiving other user -------------------- ")
                other_user = data.get('other_user')
                # print(other_user)
                other_user_data = json.loads(other_user)
                # print(other_user_data)
                if self.game_user_1 == None:
                    print(f"I'am the user connection with the id {self.who_i_am_id} and I wanted to receive user 1")
                    if other_user_data["user_id"] == 1: 
                        self.game_user_1 = other_user
                if self.game_user_2 == None:
                    print(f"I'am the user connection with the id {self.who_i_am_id} and I wanted to receive user 2")
                    self.debug_in_playing = True
                    if other_user_data["user_id"] == 2:
                        self.game_user_2 = other_user


        # data = json.loads(text_data)
        # message = data.get('message')
        # if message == 'confirm':
        #     match = await sync_to_async(Match.objects.get)(id=self.match_id)
        #     match_json = MatchSerializer(match)
        #     print(match_json.data)
        #     if match_json.data['status'] == 'pending':
        #         match.status = 'joined'
        #         await sync_to_async(match.save)()
        #     elif match_json.data['status'] == 'joined':
        #         match.status = 'playing'
        #         await sync_to_async(match.save)()
        # elif message == 'score':
        #     print("Someone wants to know the score")
            
    async def receive_ws_handshake(self, ws_handshake_message, data):
        print('receive_ws_handshake () ////////////////////////******************')
        if ws_handshake_message == 'authorization':
            user_jwt_token = data.get('authorization')
            decoded_token = jwt.decode(user_jwt_token, os.getenv("SECRET_KEY"), algorithms=['HS256'])
            user_id = decoded_token['user_id']
            if user_id != self.match_info["user_1"] and user_id != self.match_info["user_2"]:
                await self.send_to_connection({'type_message' : 'ws_handshake', 'ws_handshake' : 'failed_authorization'})
            else:
                self.ws_handshake = True
        elif ws_handshake_message == 'confirmation':
            match = await sync_to_async(Match.objects.get)(id=self.match_id)
            print(f'Match statusssssssss {match.status}')
            if match.status == 'pending':
                match.status = 'joined'
                await sync_to_async(match.save)()
            elif match.status == 'joined':
                match.status = 'playing'
                await sync_to_async(match.save)()
                print("//////////////////// SENDING WELCOME MESSAGE HEREEEEE //////////////////////////////")
                await self.send_to_group('game_state', 'welcome')
                asyncio.create_task(self.game_loop())
                # await self.main_logic()
            elif match.status == 'playing':
                print("//////////////////// SENDING WELCOME MESSAGE ICIIIII //////////////////////////////")
                await self.send_to_group('game_state', 'welcome')
                # print("//////////////////// Creating thread for game //////////////////////////////")
                print("HEREEE WE LAUCH THE GAME")
                print(self.debug_in_playing)
                if self.debug_in_playing == True:
                    asyncio.create_task(self.game_loop())



    # Methods for calling to database
    async def match_in_db(self):
        try:
            match = await sync_to_async(Match.objects.get)(id=self.match_id)
            match_json = MatchSerializer(match)
            return match_json.data
        except Match.DoesNotExist:
            return None

    async def user_in_db(self, user_id):
        try:
            user = await sync_to_async(User.objects.get)(id=user_id)
            user_json = UserSerializer(user)
            return user_json.data
        except User.DoesNotExist:
            return None
    
    # Senders
    async def send_initial_data(self):
        print('send_initial_data()')
        self.db_user_1 = await self.user_in_db(self.match_info["user_1"])
        self.db_user_2 = await self.user_in_db(self.match_info["user_2"])
        users_data = {
            'type_message' : 'ws_handshake',
            'ws_handshake' : 'initial_data',
            'user_1_info' : self.db_user_1,
            'user_2_info' : self.db_user_2
        }
        await self.send_to_connection(users_data)

    async def send_to_group(self, type_message, message):
        await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_game_state',
                    'type_message' : f'{type_message}',
                    f'{type_message}': f'{message}',
                    'sender_to' : self.group_name
                }
            )


    async def send_to_connection(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_game_state(self, event):
        await self.send(text_data=json.dumps(event))


    # async def check_user_in_match_db(self, user_id)
    #     try:
    #         match = await sync_to_async(Match.objects.get)(id=self.match_id)
    #         match_json = MatchSerializer(match)
    #         return match_json.data
    #     except Match.DoesNotExist:
    #         return None

    async def main_logic(self):
        await asyncio.gather(
            self.game_timer(),
            self.game_loop()
        )
    
    async def game_timer(self):
        while self.time_remaining >= 0:
            print(f"In timer {self.time_remaining}")
            await self.send_to_group('timer', self.time_remaining)
            print("In timer after sending")
            await asyncio.sleep(1)
            print("In timer after sleeping")
            self.time_remaining = self.time_remaining - 1
            print(self.time_remaining)


        print("**********&&&&&&&&&&&&&&& hereeeeeee &&&&&&&&&&&&&&&&&&& /////////////////")
        self.game_finish = True

    async def game_loop(self):
        while self.game_user_1 == None or self.game_user_2 == None:
            print("Waiting for the info...")
            await asyncio.sleep(1)

        
        print("/////////////////// We are ready to start the game ////////////////////")
        print(f'Info user_1 {self.game_user_1}')
        print(f'Info user_2 {self.game_user_2}')

        await self.send_to_group('game_state', 'init_pong_game')

        self.board = {
            'x' : 1.0,
            'y' : 0.5,
        }

        # # self.ball = {
        # #     'elem' : 'ball',
        # #     'size_x' : 30,
        # #     'size_y' : 30,
        # #     'top' : round(get_pourcentage(500, ((500 / 2) - (30/2)), 100), 2),
        # #     'left' : round(get_pourcentage(500, ((500 / 2) - (30/2)), 100), 2)
        # # }

        self.ball = {
            'elem' : 'ball',
            'size_x' : 30,
            'size_y' : 30,
            'top' : 0.5,
            'left' : 0.5,
            'speed' : 0.05,
        }


        asyncio.create_task(self.game_timer())

        while self.game_finish == False:
            self.ball['left'] += self.ball['speed']
    
            if self.ball['left'] >= 0.9 or self.ball['left'] <= 0.1:
                self.ball['speed'] *= -1

            # # Comprueba si la pelota alcanza los límites verticales y cambia su dirección
            # if self.ball['top'] >= 1 or self.ball['top'] <= 0:
            #     self.ball['velocity_y'] *= -1

            # Actualiza la posición de la pelota en el cliente
            await self.send_to_group('game_element', json.dumps(self.ball))

            await asyncio.sleep(0.1)  # Espera corta para no bloquear el hilo

        print("MATCH FINISHHHHH")
        match = await sync_to_async(Match.objects.get)(id=self.match_id)
        match.status = 'completed'
        await sync_to_async(match.save)()
    
    async def check_tournament(self):
        


        # await self.send_to_group('init_pong_game')
        # game_started = False
        # game_duration = 10
        
        
        # match = await sync_to_async(Match.objects.get)(id=self.match_id)

        # if match and match.timer_started:
        #     game_started = True
        #     time_elapsed = match.time_elapsed
        #     await self.send_to_group('start_game')

        # if not game_started:
        #     await self.send_to_group('start_game')
        #     game_started = True
        #     time_elapsed = 0

        # while time_elapsed < game_duration:
            # Tu lógica de juego aquí

            # Verificar si algún jugador se ha desconectado
            # disconnected_players = set()
            # for channel_name in self.channel_layer.group_channels(self.group_name):
            #     if not await self.channel_layer.send(channel_name, {'type': 'ping'}):
            #         disconnected_players.add(channel_name)

            # # Si algún jugador se ha desconectado, pausa el juego y espera su regreso
            # if disconnected_players:
            #     await self.send_to_group('pause_game')

            # # Actualizar el tiempo transcurrido
            # time_elapsed += 1
            # print(time_elapsed)
            # match.time_elapsed = time_elapsed
            # await sync_to_async(match.save)()

            # # # Verificar si ha pasado 5 segundos y enviar actualización del tiempo
            # # if time_elapsed % 5 == 0:
            # time_remaining = game_duration - time_elapsed
            # await self.send_to_connection({'game_state' : 'timer' , 'timer' : time_remaining})

            # await asyncio.sleep(1)

        # El juego ha terminado
        # await self.send_to_group('end_game')

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

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting to TournamentConsumer")
        self.room_name = 'tournament'
        self.room_group_name = 'tournament_group'

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
        # You can handle incoming messages if needed
        pass

    async def send_tournament_notification(self, event):
        # Send tournament-related notifications to the WebSocket
        message = event['message']
        tournament_id = event['tournament_id']

        await self.send(text_data=json.dumps({
            'type': 'tournament_notification',
            'message': message,
            'tournament_id': tournament_id,
        }))


def get_pourcentage(op_div, op_mul_1, op_mul_2):
    x = (op_mul_1 * op_mul_2) / op_div
    return x