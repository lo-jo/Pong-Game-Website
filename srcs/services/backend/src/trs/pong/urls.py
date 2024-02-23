from django.urls import path
from .views import AllMatchesView, JoinMatchView

urlpatterns = [
    path('', AllMatchesView.as_view()),
    path('<int:pk>/join/', JoinMatchView.as_view())
]