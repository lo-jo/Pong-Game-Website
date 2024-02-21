import curses
import signal
import getpass
import os
# Own classes and modules
from classes.UserCLI import UserCLI
from classes.Endpoints import UsersEndpoint, MatchesEndpoint
from modules.prompt import prompt

# Endpoints container dict
endpoints = {
    '/users/': UsersEndpoint(),
    '/matches/': MatchesEndpoint(),
    # '/tournaments/': UsersEndpoint(),
}

# Http methods
http_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']


def main():
    # Authentification
    username = input("Username: ")
    password = getpass.getpass("Password: ")
    user_cli = UserCLI(username, password)
    if user_cli.authenticate() == False:
        return
    os.system('clear')
    
    # CLI main loop
    # The main endpoint, the uri and the http method are choosed for send the request
    while True:
        endpoint_choice = curses.wrapper(lambda stdscr: prompt(stdscr, list(endpoints.keys()), "Choose the main endpoint:\n", False))
        if endpoint_choice == 'EXIT':
            break
        endpoint_class = endpoints.get(endpoint_choice)
        endpoint_uri = curses.wrapper(lambda stdscr: prompt(stdscr, endpoint_class.uri_lst_endpoint, "Choose uri for entrypoint:\n", True))
        if endpoint_uri == 'GO BACK':
            continue
        elif endpoint_uri == 'EXIT':
            break
        else:
            http_method = curses.wrapper(lambda stdscr: prompt(stdscr, http_methods, "Choosee the HTTP Method for your request and type 'Enter':\n", True))
            if http_method == 'GO BACK':
                continue
            elif http_method == 'EXIT':
                break
            if not user_cli.send_curl_request(endpoint_class, endpoint_uri, http_method):
                break

if __name__ == "__main__":
    # signal.signal(signal.SIGINT, handler)
    main()
