from rest_framework import serializers
from .models import Category, LearningItem


class LearningItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningItem
        fields = ["id", "level", "text_en", "text_ar", "emoji", "audio_en_url", "audio_ar_url"]


class CategoryListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "slug", "name_ar", "name_en", "emoji", "color", "order", "is_free", "items_count"]

    def get_items_count(self, obj):
        return {"L1": obj.items.filter(level="L1").count(),
                "L2": obj.items.filter(level="L2").count(),
                "L3": obj.items.filter(level="L3").count()}


class CategoryDetailSerializer(serializers.ModelSerializer):
    L1 = serializers.SerializerMethodField()
    L2 = serializers.SerializerMethodField()
    L3 = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "slug", "name_ar", "name_en", "emoji", "color", "L1", "L2", "L3"]

    def get_L1(self, obj):
        return LearningItemSerializer(obj.items.filter(level="L1", is_active=True), many=True).data

    def get_L2(self, obj):
        return LearningItemSerializer(obj.items.filter(level="L2", is_active=True), many=True).data

    def get_L3(self, obj):
        return LearningItemSerializer(obj.items.filter(level="L3", is_active=True), many=True).data
