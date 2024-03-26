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
        self.db_user_1 = None
        self.db_user_2 = None
        self.game_user_1 = None
        self.game_user_2 = None
        self.who_i_am_id = None
        self.debug_in_playing = False
        self.time_remaining = 50
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
        # await self.send_to_group('game_state', 'someone_left')
        await self.send_to_group('game_state', json.dumps({'event' : 'someone_left'}))
        # print(f"WEBSOCKET DISCONNECTTTTTTTTTTTT   {close_code}")


    # Receivers
    async def receive(self, text_data):
        data = json.loads(text_data)
        type_message = data.get('type_message')

        # print(f"IN RECEIVE: {type_message}")
        match type_message:
            case 'ws_handshake':
                # print('ws_handshake case')
                ws_handshake_message = data.get('ws_handshake')
                # print(f'ws_handshake_message : {ws_handshake_message}')
                await self.receive_ws_handshake(ws_handshake_message, data)
            case 'init_user_data':
                # print("/////// CHECKING IF THERE IS THE GOOD USERS")
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


                # print(f'Here user_1: {self.game_user_1}')
                # print(f'Here user_2: {self.game_user_2}')

            case 'other_user':
                print("-------------------------- Receiving other user -------------------- ")
                other_user = data.get('other_user')
                # print(other_user)
                other_user_data = json.loads(other_user)
                # print(other_user_data)
                if self.game_user_1 == None:
                    # print(f"I'am the user connection with the id {self.who_i_am_id} and I wanted to receive user 1")
                    if other_user_data["user_id"] == 1: 
                        self.game_user_1 = other_user
                if self.game_user_2 == None:
                    # print(f"I'am the user connection with the id {self.who_i_am_id} and I wanted to receive user 2")
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
        # print('receive_ws_handshake () ////////////////////////******************')
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
            # print(f'Match statusssssssss {match.status}')
            if match.status == 'pending':
                match.status = 'joined'
                await sync_to_async(match.save)()
            elif match.status == 'joined':
                match.status = 'playing'
                await sync_to_async(match.save)()
                # print("//////////////////// SENDING WELCOME MESSAGE HEREEEEE //////////////////////////////")
                # await self.send_to_group('game_state', 'welcome')
                await self.send_to_group('game_state', json.dumps({'event' : 'welcome'}))
                asyncio.create_task(self.game_loop())
                # await self.main_logic()
            elif match.status == 'playing':
                # print("//////////////////// SENDING WELCOME MESSAGE ICIIIII //////////////////////////////")
                # await self.send_to_group('game_state', 'welcome')
                await self.send_to_group('game_state', json.dumps({'event' : 'welcome'}))
                # print("//////////////////// Creating thread for game //////////////////////////////")
                # print("HEREEE WE LAUCH THE GAME")
                # print(self.debug_in_playing)
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
        # print('send_initial_data()')
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
            # print(f"In timer {self.time_remaining}")
            await self.send_to_group('timer', self.time_remaining)
            # print("In timer after sending")
            await asyncio.sleep(1)
            # print("In timer after sleeping")
            self.time_remaining = self.time_remaining - 1
            # print(self.time_remaining)


        print("**********&&&&&&&&&&&&&&& hereeeeeee &&&&&&&&&&&&&&&&&&& /////////////////")
        self.game_finish = True

    async def game_loop(self):
        while self.game_user_1 == None or self.game_user_2 == None:
            print("Waiting for the info...")
            await asyncio.sleep(1)

        
        print("/////////////////// We are ready to start the game ////////////////////")
        print(f'Info user_1 {self.game_user_1}')
        print(f'Info user_2 {self.game_user_2}')

        self.usuario_1 = {
            'elem' : 'user',
            'which' : 1,
            'size_x' : 0.05,
            'size_y' : 0.18,
            'top' : 0.02,
            'bottom' : 0.22,
            'left' : 0.02,
            'right' : 0.023
        }

        # self.ball = {
        #     'elem' : 'ball',
        #     'size_x' : 0.03,
        #     'size_y' : 0.05,
        #     'top' : 0.5,
        #     'bottom' : 0.55,
        #     'left' : 0.5,
        #     'right' : 0.53,
        #     'speed_x': get_random_speed(),
        #     'speed_y': get_random_speed()
        # }

        self.ball = {
            'elem' : 'ball',
            'size_x' : 0.03,
            'size_y' : 0.05,
            'top' : 0.5,
            'left' : 0.5,
            'speed_x': get_random_speed(),
            'speed_y': get_random_speed()
        }



        init_pong_game_data = {
            'event' : 'init_pong_game',
            'ball_game' : self.ball,
            'usuario_1' : self.usuario_1,
        }

        await self.send_to_group('game_state', json.dumps(init_pong_game_data))


        # await self.send_to_group('game_state', 'init_pong_game')

        self.board = {
            'x' : 1.0,
            'y' : 0.5,
        }

        asyncio.create_task(self.game_timer())

        # print(f'self.ball speed_x {self.ball["speed_x"]}')
        # print(f'self.ball speed_y {self.ball["speed_y"]}')
        # await asyncio.sleep(5)
        
        while self.game_finish == False:
            self.ball['top'] += self.ball['speed_y']
            if self.ball['top'] <= 0.03 or self.ball['top'] >= 0.95:
                self.ball['speed_y'] *= -1
            
            self.ball['left'] += self.ball['speed_x']
            if self.ball['left'] <= 0.03 or self.ball['left'] >= 0.95:
                self.ball['speed_x'] *= -1

            if self.ball['left'] <= (self.usuario_1["left"] + self.usuario_1["size_x"]):
                print(self.ball)
                print(self.usuario_1)
                if check_hit(self.ball['top'], self.ball['size_y'], self.usuario_1['top'], self.usuario_1['size_y']):
                    print("Hit paddle!")
                else:
                    print("No hit!")
                await asyncio.sleep(10)
            
            # Sending ball info
            await self.send_to_group('game_element', json.dumps(self.ball))
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
