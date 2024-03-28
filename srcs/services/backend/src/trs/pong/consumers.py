import os, json, jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Match
from .serializers import MatchSerializer
from users.models import User
from users.serializers import UserSerializer
from .pong_game import get_game_state
from asgiref.sync import sync_to_async
import asyncio
import random

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
        # Database match data
        self.match_info = None
        # Database user data
        self.db_user_1 = None
        self.db_user_2 = None

        self.game_user_1 = {}
        self.game_user_2 = {}

        self.who_i_am_id = None

        self.ball = {
            'elem' : 'ball',
            'size_x' : 0.03,
            'size_y' : 0.05,
            'top' : 0.1,
            'left' : 0.5,
            'speed_x': get_random_speed(),
            'speed_y': get_random_speed()
        }

        self.game_user_1_paddle = {
            'id' : 1,
            'elem' : 'user',
            'size_x' : 0.05,
            'size_y' : 0.20,
            'top' : 0,
            'bottom' : 0.22,
            'left' : 0.02,
            'right' : 0.07
        }

        self.game_user_2_paddle = {
            'id' : 2,
            'elem' : 'user',
            'size_x' : 0.05,
            'size_y' : 0.20,
            'top' : 0,
            'bottom' : 0.22,
            'left' : 0.93,
            'right' : 0.95
        }

        self.time_remaining = 30
        self.game_finish = False
        self.ws_handshake = False

        # Accepting the connection
        await self.accept()
        # Checking if match exists in DB
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
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.send_initial_data()


    async def disconnect(self, close_code):
        print(f"DISCONNECT  {close_code}")
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def websocket_disconnect(self, close_code):
        print("Someone left")
        print(f"I am {self.who_i_am_id}")
        await self.send_to_group('game_state', json.dumps({'event' : 'someone_left'}))


    # Receivers
    async def receive(self, text_data):
        data = json.loads(text_data)
        type_message = data.get('type_message')

        # print("Receive!")
        # print(type_message)
        match type_message:
            case 'ws_handshake':
                ws_handshake_message = data.get('ws_handshake')
                await self.receive_ws_handshake(ws_handshake_message, data)
            case 'other_user':
                # print("-------------------------- Receiving other user -------------------- ")
                other_user = data.get('other_user')
                other_user_data = json.loads(other_user)

                if not self.game_user_2 and other_user_data["user_id"] != self.who_i_am_id:
                    self.game_user_2 = other_user_data
                    # print(f"I am the {self.who_i_am_id}, the connection of game_user_1, I have my other user")
                
                if not self.game_user_1 and other_user_data["user_id"] != self.who_i_am_id:
                    self.game_user_1 = other_user_data
                    # print(f"I am the {self.who_i_am_id}, the connection of game_user_2, I have my other user")
            case 'game_event':
                print("-------------------------- Receiving game event -------------------- ")
                game_event = data.get('game_event')
                user_id = get_user_id_by_jwt_token(data, 'token')
                if user_id == self.game_user_1["user_id"]:
                    if game_event == 'move_up':
                        await self.send_to_group('game_state', json.dumps({'event' : 'broadcasted_game_event', 'broadcasted_game_event' : 'move_up_paddle_1'}))
                    elif game_event == 'move_down':
                        await self.send_to_group('game_state', json.dumps({'event' : 'broadcasted_game_event', 'broadcasted_game_event' : 'move_down_paddle_1'}))
                elif user_id == self.game_user_2["user_id"]:
                    if game_event == 'move_up':
                        await self.send_to_group('game_state', json.dumps({'event' : 'broadcasted_game_event', 'broadcasted_game_event' : 'move_up_paddle_2'}))
                    elif game_event == 'move_down':
                        await self.send_to_group('game_state', json.dumps({'event' : 'broadcasted_game_event', 'broadcasted_game_event' : 'move_down_paddle_2'}))

            case 'broadcasted_game_event':
                print('///////////////////// BROADCAST EVENT ////////////////////')
                broadcast_game_event = data.get('broadcasted_game_event')
                await self.receive_broadcast_event(broadcast_game_event)




    # This function handle the messages received from the client in the `ws_handshake`    
    async def receive_ws_handshake(self, ws_handshake_message, data):
        # print(f'///////////////////// in receive ws handshake {ws_handshake_message}! /////////////////')
        if ws_handshake_message == 'authorization':
            user_id = get_user_id_by_jwt_token(data, ws_handshake_message)
            # Checking if the user_id match with any user in db
            if user_id != self.match_info["user_1"] and user_id != self.match_info["user_2"]:
                await self.send_to_connection({'type_message' : 'ws_handshake', 'ws_handshake' : 'failed_authorization'})
            else:
                self.ws_handshake = True
                # print("-------------------------- Authorized! -------------------- ")
                if user_id == self.match_info['user_1']:
                    if not self.game_user_1:
                        # self.game_user_1 = data.get('screen_info')
                        self.game_user_1['user_id'] = user_id
                        self.game_user_1['paddle'] = self.game_user_1_paddle
                        # await self.send_to_group('other_user', json.dumps(self.game_user_1))
                elif user_id == self.match_info['user_2']:
                    if not self.game_user_2:
                        # self.game_user_2 = data.get('screen_info')
                        self.game_user_2['user_id'] = user_id
                        self.game_user_2['paddle'] = self.game_user_2_paddle
                        # await self.send_to_group('other_user', json.dumps(self.game_user_2))
    
                # This is the player 2
                if not self.game_user_1:
                    self.who_i_am_id = self.game_user_2["user_id"]
                    game_user_2_str = json.dumps(self.game_user_2)
                    await self.send_to_group('other_user', game_user_2_str)

                # This is the player 1
                if not self.game_user_2:
                    self.who_i_am_id = self.game_user_1["user_id"]
                    game_user_1_str = json.dumps(self.game_user_1)
                    await self.send_to_group('other_user', game_user_1_str)


        elif ws_handshake_message == 'confirmation':
            # print("////////////////////////One confirmation!/////////////////////")
            match = await sync_to_async(Match.objects.get)(id=self.match_id)
            if self.who_i_am_id == self.game_user_1["user_id"]:
                # print("game_user_1 will change a joined") 
                if match.status == 'pending':
                    match.status = 'joined'
                    print('joined')
                    await sync_to_async(match.save)()
            
            elif self.who_i_am_id == self.game_user_2["user_id"]:
                # print("game_user_2 will change a playing") 
                if match.status == 'pending':
                    while match.status == 'pending':
                        # print('waiting in pending')
                        await asyncio.sleep(0.1)
                        match = await sync_to_async(Match.objects.get)(id=self.match_id)
                    match.status = 'playing'
                    # print("playing!")
                    await sync_to_async(match.save)()
                    # await self.send_to_group('game_state', json.dumps({'event' : 'welcome'}))
                    asyncio.create_task(self.game_loop())
                elif match.status == 'joined':
                    match.status = 'playing'
                    await sync_to_async(match.save)()
                    asyncio.create_task(self.game_loop())

    async def receive_broadcast_event(self, broadcast_game_event_message):
        match broadcast_game_event_message:
            case 'move_up_paddle_1':
                print('///////////////////// MOVE_UP_PADDLE_1 ////////////////////')
                self.game_user_1["paddle"]["top"] -= 0.1
                if self.game_user_1["paddle"]["top"] <= 0:
                    self.game_user_1["paddle"]["top"] = 0
                self.game_user_1["paddle"]["top"] = round(self.game_user_1["paddle"]["top"], 4)
            case 'move_up_paddle_2':
                print('///////////////////// MOVE_DOWN_PADDLE_2 ////////////////////')
                self.game_user_2["paddle"]["top"] -= 0.1
                if self.game_user_2["paddle"]["top"] <= 0:
                    self.game_user_2["paddle"]["top"] = 0
                self.game_user_2["paddle"]["top"] = round(self.game_user_2["paddle"]["top"], 4)
            case 'move_down_paddle_1':
                print('///////////////////// MOVE_DOWN_PADDLE_1 ////////////////////')
                self.game_user_1["paddle"]["top"] += 0.1
                if self.game_user_1["paddle"]["top"] >= 0.8:
                    self.game_user_1["paddle"]["top"] = 0.8
                self.game_user_1["paddle"]["top"] = round(self.game_user_1["paddle"]["top"], 4)
            case 'move_down_paddle_2':
                print('///////////////////// MOVE_DOWN_PADDLE_2 ////////////////////')
                self.game_user_2["paddle"]["top"] += 0.1
                if self.game_user_2["paddle"]["top"] >= 0.8:
                    self.game_user_2["paddle"]["top"] = 0.8
                self.game_user_2["paddle"]["top"] = round(self.game_user_2["paddle"]["top"], 4)


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

    async def game_timer(self):
        while self.time_remaining >= 0:
            # await self.send_to_group('timer', self.time_remaining)
            print(f'time remaining {self.time_remaining}')
            await asyncio.sleep(1)
            self.time_remaining = self.time_remaining - 1

        print("**********&&&&&&&&&&&&&&& hereeeeeee &&&&&&&&&&&&&&&&&&& /////////////////")
        self.game_finish = True

    async def game_loop(self):
        while not self.game_user_1 or not self.game_user_2:
            print("Waiting for the info...")
            await asyncio.sleep(1)

        print("/////////////////// We are ready to start the game ////////////////////")
        print(f'Info user_1 {self.game_user_1}')
        print(f'Info user_2 {self.game_user_2}')

        init_pong_game_data = {
            'event' : 'init_pong_game',
            'ball_game' : self.ball,
            'user_paddle_1' : self.game_user_1["paddle"],
            'user_paddle_2' : self.game_user_2["paddle"]
        }

        await self.send_to_group('game_state', json.dumps(init_pong_game_data))
        # Start timer
        asyncio.create_task(self.game_timer())

        while self.game_finish == False:
            # if self.ball['top'] <= 0.03 or self.ball['top'] >= 0.95:
            #     self.ball['speed_y'] *= -1
            
            if self.ball['left'] <= 0.015 or (self.ball['left'] + self.ball['size_x']) >= 0.985:
                self.ball['speed_x'] *= -1

            # if self.ball['left'] <= 0.1:
            #     if check_hit(self.ball['top'], self.ball['size_y'], self.usuario_1['top'], self.usuario_1['size_y']):
            #         self.ball['speed_x'] *= -1

            self.ball['left'] += self.ball['speed_x']
            self.ball['left'] = round(self.ball['left'], 5)
            
            game_elements = {
                'event' : 'game_elements',
                'ball_game' : self.ball,
                'user_paddle_1' : self.game_user_1["paddle"],
                'user_paddle_2' : self.game_user_2["paddle"]
            }

            # print("/////////////  HEREEEEEEEE////////////////////")
            # print(self.game_user_2["paddle"]["top"])
            # print("//////////////////////////////////////////////")
            # Sending elements info
            await self.send_to_group('game_state', json.dumps(game_elements))
            # # Sending ball info
            # await self.send_to_group('game_element', json.dumps(self.ball))
            # Sleeping one miliseconds for thread 
            await asyncio.sleep(0.1)

        print("MATCH FINISHHHHH")
        match = await sync_to_async(Match.objects.get)(id=self.match_id)
        match.status = 'completed'
        await sync_to_async(match.save)()


class MatchConsumer(AsyncWebsocketConsumer):
    # groups = ["broadcast"]
    async def connect(self):
        # All the users (ws) that we are going to play a match will be stored in this group
        self.room_group_name = 'matches_group'
    
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
        pass

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


# Utils

def get_user_id_by_jwt_token(data, key_in_message):
    user_jwt_token = data.get(key_in_message)
    decoded_token = jwt.decode(user_jwt_token, os.getenv("SECRET_KEY"), algorithms=['HS256'])
    user_id = decoded_token['user_id']
    return user_id

def get_pourcentage(op_div, op_mul_1, op_mul_2):
    x = (op_mul_1 * op_mul_2) / op_div
    return x

def get_random_speed():
    random_speed = random.choice([0.03, 0.04, 0.05])
    if random.random() < 0.5:
        random_speed *= -1
    return random_speed

def check_hit(ball_top, ball_size_y, paddle_top, paddle_size_y):
    ball_bottom = ball_top + ball_size_y
    paddle_bottom = paddle_top + paddle_size_y

    if ball_bottom >= paddle_top and ball_top <= paddle_bottom:
        return True
    else:
        return False



# 'elem': 'ball', 'size_x': 0.03, 'size_y': 0.05, 'top': 0.9400000000000004, 'left': 0.06000000000000009, 'speed_x': -0.04, 'speed_y': 0.04}
# backend   | {'elem': 'user', 'which': 1, 'size_x': 0.05, 'size_y': 0.18, 'top': 0.02, 'bottom': 0.22, 'left': 0.02, 'right': 0.023}
