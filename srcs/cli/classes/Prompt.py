import curses

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

def select_endpoint(stdscr):
    curses.curs_set(0)
    stdscr.clear()
    stdscr.refresh()

    current_option = 0
    # Creating list from endpoints dictonary for iterate
    endpoint_keys = list(endpoints.keys())

    while True:
        stdscr.clear()
        stdscr.addstr("Choose the endpoint:\n")
        for idx, endpoint in enumerate(endpoint_keys):
            if idx == current_option:
                stdscr.addstr(f"> {endpoint}\n", curses.A_BOLD)
            else:
                stdscr.addstr(f"  {endpoint}\n")
        
        stdscr.refresh()
        key = stdscr.getch()

        if key == curses.KEY_UP:
            current_option = (current_option - 1) % len(endpoint_keys)
        elif key == curses.KEY_DOWN:
            current_option = (current_option + 1) % len(endpoint_keys)
        elif key == 10:  # 'Enter' is the 10 in ascii (:
            return endpoints[endpoint_keys[current_option]]