from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/profile/", views.ProfileView.as_view(), name="profile"),
    # Children
    path("children/", views.ChildListCreateView.as_view(), name="children_list"),
    path("children/<int:pk>/", views.ChildDetailView.as_view(), name="child_detail"),
    # Dashboard
    path("dashboard/", views.parent_dashboard, name="dashboard"),
]
