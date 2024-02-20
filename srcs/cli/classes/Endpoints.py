class BaseEndpoint:
    def __init__(self, endpoint):
        self.endpoint = endpoint

    def handle_request(self):
        # Lógica para manejar la solicitud al endpoint
        pass

    def display_info(self):
        # Lógica para mostrar la información del endpoint
        pass

class UsersEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/users/')

    def handle_request(self):
        # Lógica específica para manejar la solicitud al endpoint de usuarios
        pass

    def display_info(self):
        # Lógica específica pardef __str__(self):
        pass

    def __str__(self):
        return f"Endpoint in class: {self.endpoint}"

class MatchesEndpoint(BaseEndpoint):
    def __init__(self):
        super().__init__('/matches/')

    def handle_request(self):
        # Lógica específica para manejar la solicitud al endpoint de matches
        pass

    def display_info(self):
        # Lógica específica para mostrar la información del endpoint de matches
        pass

