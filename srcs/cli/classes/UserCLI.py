# Standard modules
import subprocess
import requests
import json
import curses
import time

class UserCLI:
    def __init__(self, username, password, host="http://127.0.0.1:8000"):
        self.username = username
        self.password = password
        self.host = host
        self.token = None

    def __str__(self):
        return f"Username: {self.username}\nPassword: {self.password}\nHost: {self.host}\nToken: {self.token}"

    def authenticate(self):
        url = f"{self.host}/users/token/"
        data = {"username": self.username, "password": self.password}
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            self.token = response.json()["access"]
            print("Authentication succesfully!")
            return True
        else:
            print("Failed to get the token for authentication, are you admin?")
            print(f"Log : {response.text}")
            return False

    def send_curl_request(self, endpoint, http_method):
        # print(endpoint)
        # print(http_method)
        
        if http_method == 'EXIT':
            return False
        endpoint.handle_request(http_method, self.token, self.host)
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
            
        #     time.sleep(5)
        # except subprocess.CalledProcessError as e:
        #     print(f"Error to execute request: {e}")
        #     return False

        input("Press any to continue ...")
        return True