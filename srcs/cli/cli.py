import curses
import subprocess
import requests
import json

class UserCLI:
    def __init__(self, username, password, http_method, host="http://127.0.0.1:8000"):
        self.username = username
        self.password = password
        self.http_method = http_method
        self.host = host
        self.token = None

    def __str__(self):
        return f"Username: {self.username}\nPassword: {self.password}\nHTTP Method: {self.http_method}\nHost: {self.host}\nToken: {self.token}"

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

    def send_curl_request(self, request):

        print(request)

        if not self.token:
            print("The UserCLI doesn't have been authenticated.")
            return False
        
        if request == 'exit':
            return False
        
        command = ['curl', '-X', self.http_method, '-H', f'Authorization: Bearer {self.token}', f'{self.host}/users/']
        
        print(command)
        try:
            output = subprocess.check_output(command)
            json_response = output.decode()
            usuarios = json.loads(json_response)
            for usuario in usuarios:
                print("Username:", usuario["username"])
                print("Email:", usuario["email"])
                print("ID:", usuario["id"])
                print("Bio:", usuario["bio"])
                print("Profile Pic:", usuario["profile_pic"])
                print()
        except subprocess.CalledProcessError as e:
            print(f"Error to execute request: {e}")
            return False
        return True


def main():
    username = input("Username: ")
    password = input("Password: ")
    http_method = curses.wrapper(select_http_method)
    user_cli = UserCLI(username, password, http_method)
    user_cli.get_jwt_token()

    print(user_cli)
    while True:
        request = input("Type your request: ")
        if not user_cli.send_curl_request(request):
            break


def select_http_method(stdscr):
    curses.curs_set(0)
    stdscr.clear()
    stdscr.refresh()

    options = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    current_option = 0

    while True:
        stdscr.clear()
        stdscr.addstr("Choosee the HTTP Method for your request and type 'Enter':\n")
        for idx, option in enumerate(options):
            if idx == current_option:
                stdscr.addstr(f"> {option}\n", curses.A_BOLD)
            else:
                stdscr.addstr(f"  {option}\n")
        stdscr.refresh()

        key = stdscr.getch()

        if key == curses.KEY_UP:
            current_option = (current_option - 1) % len(options)
        elif key == curses.KEY_DOWN:
            current_option = (current_option + 1) % len(options)
        elif key == 10:  # 'Enter' is the 10 in ascii (:
            return options[current_option]

if __name__ == "__main__":
    main()
