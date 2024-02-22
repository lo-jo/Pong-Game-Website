from django.urls import path
from .views import AllMatchesView

urlpatterns = [
    path('', AllMatchesView.as_view())
]