# import os

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from notification.routing import websocket_urlpatterns

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trs.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(
#             URLRouter(
#                 websocket_urlpatterns
#             )
#         ),
# })

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from notification.routing import websocket_urlpatterns
# Initialize Daphne with SSL support
from daphne.server import Server
# from daphne.endpoints import build_ssl_options
from django.urls import path


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trs.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})

private_key_path = '/etc/ssl/private/selfsigned.key'
certificate_path = '/etc/ssl/private/selfsigned.crt'

# ssl_options = build_ssl_options({
#     "privateKey": private_key_path,
#     "certChain": certificate_path,
# })

# Server(application, endpoint_description=ssl_options).run()