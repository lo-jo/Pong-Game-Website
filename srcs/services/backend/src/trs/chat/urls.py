from django.urls import path
from .views import BlockUserView, UnblockUserView

urlpatterns = [
    path('/block-user/<int:pk>', BlockUserView.as_view(), name='block-user'),
    path('/unblock-user/<int:pk>', UnblockUserView.as_view(), name='unblock-user'),

]