import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack

# Initialize Daphne with SSL support
from daphne.server import Server
# from daphne.endpoints import build_ssl_options
from django.urls import path


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trs.settings')
django_asgi_app = get_asgi_application()

from django.conf import settings
from notification.routing import websocket_urlpatterns

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
