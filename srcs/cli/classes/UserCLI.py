# Standard modules
import subprocess
import requests
import json
import curses
import time
import os


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

    def send_curl_request(self, endpoint_class, endpoint_uri, http_method):        
        if http_method == 'EXIT':
            return False

        uri = endpoint_class.set_uri(endpoint_uri)
        endpoint_class.handle_request(uri, http_method, self.token, self.host)
        print("A JSON file has been created with the response from the API")
        input("Press any to continue ...")
        os.system('clear')
        return True