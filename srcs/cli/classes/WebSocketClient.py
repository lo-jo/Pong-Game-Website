import websocket
import curses
import json
import time # to delete
from modules.prompt import prompt
from websocket import create_connection

class WebSocketClient:
    def __init__(self, ws_uri):

        print(ws_uri)
        time.sleep(10)
        self.ws_uri = ws_uri
        self.request_endpoint_actions = {
            'game_states': {
                'score' : self.request_score
            },
            'player_controls' : {
                'move_up' : self.request_movement_up
            },
        }
        self.websocket = None


    def __str__(self):
        return self.ws_uri

    def run_client(self):
        self.connect()
        welcome_message =  self.websocket.recv()
        if self.parse_message(welcome_message) == False:
            print("Closing connection")
            self.websocket.close()
            time.sleep(2)
            return

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


    def connect(self):
        # Connection to ws endpoint
        self.websocket = create_connection(self.ws_uri)
        print("Web Socket connected!")
        time.sleep(2)

    def on_message(self, ws, message):
        print("Received:", message)

    def on_error(self, ws, error):
        print("Error:", error)

    def on_close(self, ws):
        print("Connection closed")

    def on_open(self, ws):
        print("Connection opened")
        self.websocket.send(json.dumps({"message": "Hello from the WebSocketClientCLI"}))

    def parse_message(self, message):
        message_json = json.loads(message)
        instruction = message_json["ws_handshake"]
        continue_flag = True
        match instruction:
            case "match_do_not_exist":
                print("You have tried to join a non-existent match, try with a valid ID")
                continue_flag = False
            case "match_already_completed":
                print("The match is already completed!")
                continue_flag = False
            case "tell_me_who_you_are":
                print("Send socket here!")
                #this.socket.send(JSON.stringify({'type_message' : 'ws_handshake', 'ws_handshake' : 'authorization' , 'authorization' : `${jwtToken}`}));
        return continue_flag
        
    def request_score(self):
        return 'score'
    def request_movement_up(self):
        return 'move_up'
