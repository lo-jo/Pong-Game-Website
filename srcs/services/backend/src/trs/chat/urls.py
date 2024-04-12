from django.urls import path
from .views import BlockUserView

urlpatterns = [
    path('block-user/<int:pk>', BlockUserView.as_view(), name='block-user'),
]