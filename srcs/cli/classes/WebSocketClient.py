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
        print("Connection closed")

    def on_open(self, ws):
        print("Connection opened")

    def on_message(self, ws, message):
        # print("Received:", message)
        message_json = json.loads(message)
        type_message = message_json["type_message"]

        match type_message:
            case "ws_handshake":
                ws_handshake_message = message_json["ws_handshake"]
                if self.receive_ws_handshake(ws_handshake_message) == False:
                    print("Must close the connection!")


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

        return continue_flag
    
    def cli_client(self):
        while True:
            requested_action = curses.wrapper(lambda stdscr: prompt(stdscr, list(self.request_endpoint_actions), "Choose the action for WebSocket connection:\n", False))
            if requested_action == 'EXIT':
                break
            if requested_action in self.request_endpoint_actions:
                requested_action_messages = self.request_endpoint_actions[requested_action]
                message = curses.wrapper(lambda stdscr: prompt(stdscr, list(requested_action_messages.keys()), "Choose the message to send to WebSocket connection:\n", False))

                print(message)
                func = requested_action_messages[message]
                print(f'func() {func()}')
                # if http_method in endpoint_methods:
                #     func = endpoint_methods[http_method]
                # else:
                #     print(f"HTTP method {http_method} not supported for endpoint {endpoint_uri}")
                #     return False
                # if requested_message in self.request_message:
                #     func = self.request_message[requested_message]
                #     print(func)
                #     message_to_send = func()
                    # print(f'Message to send {message_to_send}')
            else:
                print("No supported requested message")
            time.sleep(5)

        print("Closing connection...")
        time.sleep(5)
        self.websocket.close()
    
    def request_score(self):
        return 'score'
    def request_movement_up(self):
        return 'move_up'


# welcome_message = self.websocket.recv()
        # if self.parse_message(welcome_message) == False:
        #     print("Closing connection")
        #     self.websocket.close()
        #     time.sleep(2)
        #     return

        # for i in range(10):
        #     print(self.authorized)
        #     time.sleep(1)

        # while True:
        #     requested_action = curses.wrapper(lambda stdscr: prompt(stdscr, list(self.request_endpoint_actions), "Choose the action for WebSocket connection:\n", False))
        #     if requested_action == 'EXIT':
        #         break
        #     if requested_action in self.request_endpoint_actions:
        #         requested_action_messages = self.request_endpoint_actions[requested_action]
        #         message = curses.wrapper(lambda stdscr: prompt(stdscr, list(requested_action_messages.keys()), "Choose the message to send to WebSocket connection:\n", False))

        #         print(message)
        #         func = requested_action_messages[message]
        #         print(f'func() {func()}')
        #     # if http_method in endpoint_methods:
        #     #     func = endpoint_methods[http_method]
        #     # else:
        #     #     print(f"HTTP method {http_method} not supported for endpoint {endpoint_uri}")
        #     #     return False
        #     # if requested_message in self.request_message:
        #     #     func = self.request_message[requested_message]
        #     #     print(func)
        #     #     message_to_send = func()
        #         # print(f'Message to send {message_to_send}')
        #     else:
        #         print("No supported requested message")
        #     time.sleep(5)
        # # print(f'Request message {request_message}')
        # # time.sleep(2)
        # # self.websocket.send(json.dumps({"message": request_message}))
        # print("Closing connection")
        # self.websocket.close()
