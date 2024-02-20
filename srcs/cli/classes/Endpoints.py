import subprocess
import requests
import json

class BaseEndpoint:
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.switch_http = {
            'GET': self.request_get,
            'POST': self.request_post,
        }

    def handle_request(self):
        pass

    def display_info_collection(self):
        pass

    def __str__(self):
        return self.endpoint

    # Methods 
    def request_get(self):
        pass

    def request_post(self):
        pass

    def execute_request(self, option_http_method):
        func = self.switch.get(option_http_method)
        func()



class UsersEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/users/')

    def handle_request(self, http_method, token_user, host):
        print("Method in UserEndPoint:", http_method)
        func = self.switch_http.get(http_method)
        command = func(http_method, token_user, host)

        print(command)
        try:
    #         output = subprocess.check_output(command, shell=True)
    # print(output)  # Esta línea no mostrará la salida de curl, ya que está redirigida a /dev/null
            output = subprocess.check_output(command)
            json_response = output.decode()
            usuarios = json.loads(json_response)
            for usuario in usuarios:
                print("Username:", usuario["username"])
                print("Email:", usuario["email"])
                print("ID:", usuario["id"])
                print("Bio:", usuario["bio"])
                print("Profile Pic:", usuario["profile_pic"])
        except subprocess.CalledProcessError as e:
            print(f"Error to execute request: {e}")
            return False


    def display_info_collection(self):
        pass

     # Methods 
    def request_get(self, http_method, token_user, host):
        command = ['curl', '-X', http_method, '-H', f'Authorization: Bearer {token_user}', f'{host}{self.endpoint}']
        return command


    def request_post(self):
        pass
    

class MatchesEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/matches/')

    def handle_request(self):
        pass

    def display_info_collection(self):
        pass

