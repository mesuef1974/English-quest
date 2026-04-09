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
        "version": "1.1.0",
        "company": "Azkia Software — Qatar",
        "endpoints": {
            "auth": "/api/auth/",
            "children": "/api/children/",
            "categories": "/api/categories/",
            "progress": "/api/progress/",
            "payments": "/api/payments/",
            "dashboard": "/api/dashboard/",
        }
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api_root"),
    path("api/", include("accounts.urls")),
    path("api/", include("learning.urls")),
    path("api/progress/", include("progress.urls")),
    path("api/payments/", include("payments.urls")),
]
