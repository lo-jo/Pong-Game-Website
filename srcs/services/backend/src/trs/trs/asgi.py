import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path
from django.core.asgi import get_asgi_application

# Import WebSocket URL patterns from different modules
from notification.routing import websocket_urlpatterns as notification_ws_urlpatterns
from chat.routing import websocket_urlpatterns as chat_ws_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trs.settings')
django_asgi_app = get_asgi_application()
# Pong server - chelo
from pong.routing import websocket_urlpatterns as pong_websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                notification_ws_urlpatterns +
                chat_ws_urlpatterns + pong_websocket_urlpatterns
            )
        )
    ),
})
