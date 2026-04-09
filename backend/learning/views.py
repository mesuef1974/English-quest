from rest_framework import generics, permissions
from .models import Category
from .serializers import CategoryListSerializer, CategoryDetailSerializer


class CategoryListView(generics.ListAPIView):
    """GET /api/categories/ — كل الفئات"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategoryListSerializer
    permission_classes = [permissions.AllowAny]  # Public — for free tier


class CategoryDetailView(generics.RetrieveAPIView):
    """GET /api/categories/<slug>/ — فئة مع كل عناصرها"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategoryDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
