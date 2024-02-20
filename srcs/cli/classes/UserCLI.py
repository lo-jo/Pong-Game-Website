# Standard modules
import subprocess
import requests
import json

class UserCLI:
    def __init__(self, username, password, host="http://127.0.0.1:8000"):
        self.username = username
        self.password = password
        self.host = host
        self.token = None

    def __str__(self):
        return f"Username: {self.username}\nPassword: {self.password}\nHost: {self.host}\nToken: {self.token}"

    def get_jwt_token(self):
        url = f"{self.host}/users/token/"
        data = {"username": self.username, "password": self.password}
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            self.token = response.json()["access"]
            print("Authentication succesfully!")
        else:
            print("Error to get the token, are you admin?\n", response.text)

    def send_curl_request(self, endpoint, http_method):

        print("here")
        print(endpoint)
        print(http_method)

        # if not self.token:
        #     print("The UserCLI doesn't have been authenticated.")
        #     return False
        
        # if endpoint == 'exit':
        #     return False
        
        # command = ['curl', '-X', 'GET', '-H', f'Authorization: Bearer {self.token}', f'{self.host}{endpoint}']
        
        # print(command)
        # try:
        #     output = subprocess.check_output(command)
        #     json_response = output.decode()
        #     usuarios = json.loads(json_response)
        #     for usuario in usuarios:
        #         print("Username:", usuario["username"])
        #         print("Email:", usuario["email"])
        #         print("ID:", usuario["id"])
        #         print("Bio:", usuario["bio"])
        #         print("Profile Pic:", usuario["profile_pic"])
        #         print()
        # except subprocess.CalledProcessError as e:
        #     print(f"Error to execute request: {e}")
        #     return False
        # return True