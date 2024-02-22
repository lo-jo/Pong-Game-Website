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
        self.uri = None # ?
        self.switch_http = {
            'GET': self.request_get,
            'POST': self.request_post,
        }

    def __str__(self):
        return self.endpoint

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

    def display_info_collection(self):
        pass

    def request_get(self, endpoint_uri, http_method, token_user, host):
        command = ['curl', '-X', http_method, '-H', f'Authorization: Bearer {token_user}', f'{host}{endpoint_uri}']
        return command

    def request_post(self):
        pass

    def execute_request(self, option_http_method):
        func = self.switch.get(option_http_method)
        func()

    def create_temp_file(self, json_response):
        with open('json_response.json', 'w') as file:
            file.write(json_response)
    
    def request_id(self, message):
        while True:
            id = input(message).strip()
            if id.isdigit():
                return id
            else:
                print("Please enter a valid positive integer for ID.")

     # Input function
    def set_id(self, endpoint_uri, question):
        if '<id>' in endpoint_uri:
            id = self.request_id(question)
            endpoint_uri = endpoint_uri.replace('<id>', id)
        return endpoint_uri


class UsersEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/users/')
        self.uri_lst_endpoint = ['/users/', '/users/<id>/', '/users/<id>/profile/', '/users/<id>/update_profile/']
        self.uri_id_question = "Enter the user ID: "

    def display_info_collection(self):
        pass


    # HTTP functions
    def request_post(self):
        pass


class MatchesEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/matches/')
        self.uri_lst_endpoint = ['/matches/', '/matches/<id>/', '/create/']
        self.uri_id_question = "Enter the match ID: "


    def display_info_collection(self):
        pass

    def request_post(self):
        match_data = {
            'status': self.get_status(),
            'loser': self.set_id("loser"),
            'user_1': self.set_id("user_1"),
            'user_2': self.set_id("user_2"),
            'winner': self.set_id("winner"),
            'tournament': self.set_id("tournament"),
        }

    def get_status(self):
        while True:
            status = input("Enter match status (pending/completed): ").strip().lower()
            if status in ['pending', 'completed']:
                return status
            else:
                print("Please enter either 'pending' or 'completed'.")

    # HTTP functions
    def request_post(self):
        pass
