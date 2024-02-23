import subprocess
import requests
import json
import curses
import time # to delete

from modules.prompt import prompt

class BaseEndpoint:
    def __init__(self, endpoint):
        # Main endpoint
        self.endpoint = endpoint

    def __str__(self):
        return self.endpoint

    # Methods
    def handle_request(self, endpoint_uri, http_method, token_user, host):
        if endpoint_uri in self.switch_request:
            endpoint_methods = self.switch_request[endpoint_uri]
            if http_method in endpoint_methods:
                func = endpoint_methods[http_method]
            else:
                print(f"HTTP method {http_method} not supported for endpoint {endpoint_uri}")
                return False
        else:
            print(f"Endpoint {endpoint_uri} not found in switch_request")
            return False

        command = func(endpoint_uri, http_method, token_user, host)

        print(command)
        # try:
        #     output = subprocess.check_output(command, stderr=subprocess.DEVNULL)
        #     json_response = output.decode()
        #     self.create_temp_file(json_response)
        # except subprocess.CalledProcessError as e:
        #     print(f"Error to execute request: {e}")
        #     return False

    # Http request
    def request_get(self, endpoint_uri, http_method, token_user, host):
        command = ['curl', '-X', http_method, '-H', f'Authorization: Bearer {token_user}', f'{host}{endpoint_uri}']
        return command

    def request_post(self, endpoint_uri, http_method, token_user, host):
        pass


    def execute_request(self, option_http_method):
        func = self.switch.get(option_http_method)
        func()

    def create_temp_file(self, json_response):
        with open('json_response.json', 'w') as file:
            file.write(json_response)
    
    # Input functions
    def request_id(self, message):
        while True:
            id = input(message).strip()
            if id == '':
                return None
            elif id.isdigit():
                return id
            else:
                print("Please enter a valid positive integer for ID.")


    def set_id(self, endpoint_uri, question):
        if '<id>' in endpoint_uri:
            id = self.request_id(question)
            endpoint_uri = endpoint_uri.replace('<id>', id)
        return endpoint_uri


# class UsersEndpoint(BaseEndpoint):
#     def __init__(self):
#         super().__init__('/users/')
#         self.uri_lst_endpoint = ['/users/', '/users/<id>/', '/users/<id>/profile/', '/users/<id>/update_profile/']
#         self.uri_id_question = "Enter the user ID: "

#     # HTTP functions
#     def request_post(self):
#         pass


class MatchesEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/matches/')
        
        self.switch_request = {
            '/matches/': {
                'GET': self.request_get_collection,
                'POST': self.request_post_collection,
                # 'PUT': self.request_put_collection,
                # 'PATCH': self.request_patch_collection,
                # 'DELETE': self.request_delete_collection,
            },
            '/matches/<id>/' : {
                'GET' : self.request_get_single_element
            }
        }

        self.uri_id_question = "Enter the match ID: "

    # HTTP request functions for `/matches/`
    def request_get_collection(self, endpoint_uri, http_method, token_user, host):
        command = ['curl', '-X', http_method, '-H', f'Authorization: Bearer {token_user}', f'{host}{endpoint_uri}']
        return command
    
    def request_post_collection(self, endpoint_uri, http_method, token_user, host):
        
        match_data = self.get_data_for_post()
        match_data_json = json.dumps(match_data)
        command = [
            'curl', '-X', 'POST',
            '-H', f'Authorization: Bearer {token_user}',
            '-H', 'Content-Type: application/json',
            '-d', match_data_json,
            f'{host}{endpoint_uri}'
        ]
        return command
    
    def get_data_for_post(self):
        print("This CLI only supports match initializations as pending, users to play and tournament id are optional.")
        
        match_data = {
            'status': 'pending',
        }

        user_1_id = self.request_id("Enter the ID for user_1: (leave blank if none): ")
        if user_1_id:
            match_data['user_1'] = user_1_id

        user_2_id = self.request_id("Enter the ID for user_2: (leave blank if none): ")
        if user_2_id:
            match_data['user_2'] = user_2_id

        tournament_id = self.request_id("Enter the ID of tournament: (leave blank if none): ")
        if tournament_id:
            match_data['tournament'] = tournament_id

        return match_data


    def request_get_single_element:
        id = set_id()

    # def join_match(match_id, user_id):
    #     url = f'http://tu_api.com/matches/{match_id}/join'
    #     headers = {'Authorization': 'Bearer tu_token_de_autenticacion'}
    #     data = {'user_id': user_id}
    #     response = requests.post(url, headers=headers, json=data)
    #     if response.status_code == 200:
    #         print('Usuario agregado al partido con éxito.')
    #     else:
    #         print('Error al intentar unirse al partido.')

