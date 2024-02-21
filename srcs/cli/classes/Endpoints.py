import subprocess
import requests
import json
import curses

from modules.prompt import prompt

class BaseEndpoint:
    def __init__(self, endpoint):
        # Main endpoint
        self.endpoint = endpoint
        self.uri = None # ?
        self.switch_http = {
            'GET': self.request_get,
            'POST': self.request_post,
        }

    def __str__(self):
        return self.endpoint

    # Methods
    def handle_request(self):
        pass

    def display_info_collection(self):
        pass

    def request_get(self):
        pass

    def request_post(self):
        pass

    def execute_request(self, option_http_method):
        func = self.switch.get(option_http_method)
        func()

    def create_temp_file(self, json_response):
        with open('json_response.json', 'w') as file:
            file.write(json_response)
    
    def request_id(self):
        while True:
            id = input("Type the id: ")
            if id.isdigit():
                break
            else:
                print("Please type only positive digits.")
        return id

    


class UsersEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/users/')
        self.uri_lst_endpoint = ['/users/', '/users/<id>/', '/users/<id>/profile/', '/users/<id>/update_profile/']

    # Methods
    def handle_request(self, endpoint_uri, http_method, token_user, host):
        func = self.switch_http.get(http_method)
        command = func(endpoint_uri, http_method, token_user, host)

        try:
            output = subprocess.check_output(command, stderr=subprocess.DEVNULL)
            json_response = output.decode()
            self.create_temp_file(json_response)
        except subprocess.CalledProcessError as e:
            print(f"Error to execute request: {e}")
            return False

    def set_uri(self, endpoint_uri):
        if '<id>' in endpoint_uri:
            id = self.request_id()
            print(id)
            endpoint_uri = endpoint_uri.replace('<id>', id)
        return endpoint_uri

    def display_info_collection(self):
        pass


    def request_get(self, endpoint_uri, http_method, token_user, host):
        command = ['curl', '-X', http_method, '-H', f'Authorization: Bearer {token_user}', f'{host}{endpoint_uri}']
        return command


    def request_post(self):
        pass


class MatchesEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/matches/')
        self.uri_lst_endpoint = ['/<id>/', '/create/']

    def handle_request(self):
        pass

    def display_info_collection(self):
        pass

