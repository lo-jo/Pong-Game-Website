from django.urls import path
from .views import NotifyUserView

urlpatterns = [
    path('<str:username>/', NotifyUserView.as_view(), name='notify_user'),
]