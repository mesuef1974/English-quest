"""
English Quest API — URL Configuration
Base: /api/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "app": "English Quest API",
        "version": "1.0.0",
        "company": "Azkia Software — Qatar",
        "endpoints": {
            "auth": {
                "register": "/api/auth/register/",
                "login": "/api/auth/login/",
                "refresh": "/api/auth/refresh/",
                "profile": "/api/auth/profile/",
            },
            "children": {
                "list_create": "/api/children/",
                "detail": "/api/children/<id>/",
            },
            "learning": {
                "categories": "/api/categories/",
                "category_detail": "/api/categories/<slug>/",
            },
            "progress": {
                "submit_score": "/api/progress/submit/",
                "child_progress": "/api/progress/<child_id>/",
                "leaderboard": "/api/progress/<child_id>/leaderboard/",
            },
            "dashboard": "/api/dashboard/",
        }
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api_root"),
    path("api/", include("accounts.urls")),
    path("api/", include("learning.urls")),
    path("api/progress/", include("progress.urls")),
]
