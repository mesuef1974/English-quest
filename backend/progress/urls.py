from django.urls import path
from . import views

urlpatterns = [
    path("submit/", views.submit_score, name="submit_score"),
    path("<int:child_id>/", views.child_progress, name="child_progress"),
    path("<int:child_id>/leaderboard/", views.leaderboard, name="leaderboard"),
]
