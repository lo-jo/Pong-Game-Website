from django.urls import path
from .views import AllMatchesView, MatchDetailView, JoinMatchView

urlpatterns = [
    path('', AllMatchesView.as_view()),
    path('<int:pk>/', MatchDetailView.as_view()),
    path('join_match/', JoinMatchView.as_view())
]