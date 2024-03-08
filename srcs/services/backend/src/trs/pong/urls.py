from django.urls import path
from .views import PongDashboardView, AllMatchesView, MatchDetailView, JoinMatchView, CreateTournamentView, OpenTournamentsView, JoinTournamentView

urlpatterns = [
    path('', PongDashboardView.as_view()),
    path('matches/', AllMatchesView.as_view()),
    path('matches/<int:pk>/', MatchDetailView.as_view()),
    path('join_match/', JoinMatchView.as_view()),
    path('create_tournament/', CreateTournamentView.as_view()),
    path('tournaments/', OpenTournamentsView.as_view()),
    path('join_tournament/<int:tournament_id>/', JoinTournamentView.as_view())
]