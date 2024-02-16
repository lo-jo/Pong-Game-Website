from django.urls import path
from . import views
from .views import UserView, RegisterUserView, AllUsersView, UpdateProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', AllUsersView.as_view()),
    path('profile/', UserView.as_view()),
    path('register/', RegisterUserView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update_profile/<int:pk>/', UpdateProfileView.as_view(), name='update_profile'),
]