import websocket
import curses
import json
import time # to delete
from modules.prompt import prompt
from websocket import create_connection
import ssl
import _thread
import time


class WebSocketClient:
    def __init__(self, ws_uri, token_user):
        self.ws_uri = ws_uri
        self.token_user = token_user
        self.request_endpoint_actions = {
            'game_states': {
                'score' : self.request_score
            },
            'player_controls' : {
                'move_up' : self.request_movement_up
            },
        }
        self.websocket = None
        self.authorized = False
        self.flag = False

    def __str__(self):
        return self.ws_uri

    def run_client(self):
        self.websocket = websocket.WebSocketApp(self.ws_uri,
                                    on_open=self.on_open,
                                    on_message=self.on_message,
                                    on_error=self.on_error,
                                    on_close=self.on_close)

        self.websocket.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})

    def on_error(self, ws, error):
        print("Error:", error)

    def on_close(self, ws):
        pass

    def on_open(self, ws):
        pass

    def on_message(self, ws, message):
        message_json = json.loads(message)
        type_message = message_json["type_message"]
        

        match type_message:
            case "ws_handshake":
                ws_handshake_message = message_json["ws_handshake"]
                if self.receive_ws_handshake(ws_handshake_message) == False:
                    print("Must close the connection!")
            case "game_state":
                game_state = json.loads(message_json["game_state"])
                event = game_state.get('event')
                if event == 'score':
                    score_user_1 = game_state.get('user_1')
                    score_user_2 = game_state.get('user_2')
                    print(f"Current score\nUser 1 : {score_user_1}\nUser 2 : {score_user_2}")


    def receive_ws_handshake(self, message):
        match message:
            case "match_do_not_exist":
                print("You have tried to join a non-existent match, try with a valid ID")
                self.websocket.close()
            case "match_already_completed":
                print("Match is already finish")
                self.websocket.close()
            case "tell_me_who_you_are":
                self.websocket.send(json.dumps({'type_message' : 'ws_handshake', 'ws_handshake' : 'authorization' , 'authorization' : f'{self.token_user}'}))
            case 'failed_authorization':
                print("You are not authorized")
                self.websocket.close()
            case "authorization_succesfully":
                self.cli_client()
    
    def cli_client(self):
        requested_action = curses.wrapper(lambda stdscr: prompt(stdscr, list(self.request_endpoint_actions), "Choose the action for WebSocket connection:\n", False))
        if requested_action == 'EXIT':
            return
        if requested_action in self.request_endpoint_actions:
            requested_action_messages = self.request_endpoint_actions[requested_action]
            message = curses.wrapper(lambda stdscr: prompt(stdscr, list(requested_action_messages.keys()), "Choose the message to send to WebSocket connection:\n", False))
            func = requested_action_messages[message]
            func()
        else:
            print("No supported requested message")
    
    def request_score(self):
        self.websocket.send(json.dumps({'type_message' : 'game_event', 'game_event' : 'score' , 'token' : f'{self.token_user}'}))
    def request_movement_up(self):
        return 'move_up'
