class BaseEndpoint:
    def __init__(self, endpoint):
        self.endpoint = endpoint

    def handle_request(self):
        pass

    def display_info(self):
        pass

    def __str__(self):
        return f"Endpoint in class: {self.endpoint}"

class UsersEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/users/')

    def handle_request(self):
        pass

    def display_info(self):
        pass

class MatchesEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/matches/')

    def handle_request(self):
        pass

    def display_info(self):
        pass

