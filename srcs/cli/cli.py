import curses
import signal
# Own classes and modules
from classes.UserCLI import UserCLI
from classes.Endpoints import UsersEndpoint

# Endpoints container dict
endpoints = {
    '/users': UsersEndpoint(),
    '/matches': UsersEndpoint(),
    '/tournaments': UsersEndpoint(),
    # 'matches': MatchesEndpoint()
}

# Http methods
http_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

def prompt(stdscr, collection_list, prompt_message):
    # Clear and refresh the screen
    curses.curs_set(0)
    stdscr.clear()
    stdscr.refresh()

    # Initialize the current selected option to 0
    current_option = 0
    
    # Loop indefinitely until a selection is made
    while True:
        # Clear the screen
        stdscr.clear()
        
        # Display the prompt message at the top of the screen
        stdscr.addstr(prompt_message)
        
        # Iterate over each item in the collection_list
        for idx, item in enumerate(collection_list):
            # Highlight the currently selected option
            if idx == current_option:
                stdscr.addstr(f"> {item}\n", curses.A_BOLD)
            else:
                stdscr.addstr(f"  {item}\n")
        
        # Refresh the screen to display changes
        stdscr.refresh()
        
        # Get the user's input (key press)
        key = stdscr.getch()

        # Handle navigation keys (up and down arrow keys)
        if key == curses.KEY_UP:
            current_option = (current_option - 1) % len(collection_list)
        elif key == curses.KEY_DOWN:
            current_option = (current_option + 1) % len(collection_list)
        # Handle selection (Enter key)
        elif key == 10:  # 'Enter' key
            # Return the selected option
            return collection_list[current_option]


def main():
    username = input("Username: ")
    password = input("Password: ")
    user_cli = UserCLI(username, password)
    if user_cli.authenticate() == False:
        return
    endpoint = curses.wrapper(lambda stdscr: prompt(stdscr, list(endpoints.keys()), "Choose the endpoint:\n"))
    print(endpoint)
    print(user_cli)
    while True:
        http_method = curses.wrapper(lambda stdscr: prompt(stdscr, http_methods, "Choosee the HTTP Method for your request and type 'Enter':\n"))
        if not user_cli.send_curl_request(endpoint, http_method):
            break

if __name__ == "__main__":
    # signal.signal(signal.SIGINT, handler)
    main()
