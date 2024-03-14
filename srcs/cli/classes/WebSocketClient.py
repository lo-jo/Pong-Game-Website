import websocket
import curses
import json
import time # to delete
from modules.prompt import prompt
from websocket import create_connection

class WebSocketClient:
    def __init__(self, ws_uri):
        self.ws_uri = ws_uri
        self.request = {
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

    def connect(self):
        # Connection to ws endpoint
        self.websocket = create_connection(self.ws_uri)
        print("Web Socket connected!")
        time.sleep(2)
        request_message = curses.wrapper(lambda stdscr: prompt(stdscr, list(self.request), "Choose the message to send to WebSocket:\n", True))
        print(f'Request message {request_message}')
        time.sleep(2)
        self.websocket.send(json.dumps({"message": request_message}))
        time.sleep(2)
        self.websocket.close()


    def on_message(self, ws, message):
        print("Received:", message)

    def on_error(self, ws, error):
        print("Error:", error)

    def on_close(self, ws):
        print("Connection closed")

    def on_open(self, ws):
        print("Connection opened")
        self.websocket.send(json.dumps({"message": "Hola desde el cliente"}))

    def request_score(self):
        return 'score'
    def request_movement_up(self):
        return 'move_up'

# if __name__ == "__main__":
#     # URL de la ruta WebSocket en tu servidor Django Channels
#     ws_url = "ws://tu-servidor.com/tu-ruta-websocket/"

#     # Crea una instancia del cliente WebSocket
#     ws = websocket.WebSocketApp(ws_url,
#                                 on_message=on_message,
#                                 on_error=on_error,
#                                 on_close=on_close)
#     ws.on_open = on_open

#     # Inicia la conexión WebSocket
#     ws.run_forever()
