from django.urls import path
from .views import PongDashboardView, AllMatchesView, MatchDetailView, JoinMatchView, DeleteAllMatches, CreateTournamentView, OpenTournamentsView, TournamentView, JoinTournamentView

urlpatterns = [
    path('', PongDashboardView.as_view()),
    path('matches/', AllMatchesView.as_view()),
    path('matches/<int:pk>/', MatchDetailView.as_view()),
    path('join_match/', JoinMatchView.as_view()),
    path('delete-all-items/', DeleteAllMatches.as_view()),
    path('create_tournament/', CreateTournamentView.as_view()),
    path('tournaments/', OpenTournamentsView.as_view()),
    path('tournaments/<int:tournament_id>/', TournamentView.as_view(), name='tournament-detail'),
    path('join_tournament/<int:tournament_id>/', JoinTournamentView.as_view())
]
# une vue qui cree 6 matchs POST qui est appelle quand on arrive a 4 
# nouvelle vue qui renvoie tous les matchs qui font partie dun tournoi a partir de leur id
# 