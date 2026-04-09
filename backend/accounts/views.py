from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Child
from .serializers import (
    ParentRegisterSerializer, ParentProfileSerializer,
    ChildSerializer, ChildDashboardSerializer,
)

Parent = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — تسجيل والد جديد"""
    queryset = Parent.objects.all()
    serializer_class = ParentRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parent = serializer.save()
        return Response({
            "message": "تم إنشاء الحساب بنجاح!",
            "user": ParentProfileSerializer(parent).data,
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — الملف الشخصي"""
    serializer_class = ParentProfileSerializer

    def get_object(self):
        return self.request.user


class ChildListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/children/ — قائمة/إضافة الأطفال"""
    serializer_class = ChildSerializer

    def get_queryset(self):
        return Child.objects.filter(parent=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


class ChildDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/children/<id>/ — تفاصيل الطفل"""
    serializer_class = ChildSerializer

    def get_queryset(self):
        return Child.objects.filter(parent=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False  # Soft delete — PDPPL compliance
        instance.save()


@api_view(["GET"])
def parent_dashboard(request):
    """GET /api/dashboard/ — لوحة تحكم الوالد"""
    children = Child.objects.filter(parent=request.user, is_active=True)
    return Response({
        "parent": ParentProfileSerializer(request.user).data,
        "children": ChildDashboardSerializer(children, many=True).data,
        "total_stars": sum(c.total_stars for c in children),
        "total_words_learned": sum(c.words_learned for c in children),
    })
