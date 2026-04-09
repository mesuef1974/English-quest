from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Child

Parent = get_user_model()


class ParentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Parent
        fields = ["username", "email", "password", "password_confirm", "first_name", "last_name", "phone", "country"]

    def validate(self, data):
        if data["password"] != data.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "كلمتا المرور غير متطابقتين"})
        return data

    def create(self, validated_data):
        return Parent.objects.create_user(**validated_data)


class ParentProfileSerializer(serializers.ModelSerializer):
    children_count = serializers.ReadOnlyField()

    class Meta:
        model = Parent
        fields = ["id", "username", "email", "first_name", "last_name", "phone",
                  "country", "language", "daily_limit_minutes", "children_count", "date_joined"]
        read_only_fields = ["id", "username", "date_joined"]


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ["id", "name", "age", "avatar_emoji", "current_level", "total_stars",
                  "total_xp", "current_streak", "longest_streak", "last_played",
                  "total_play_minutes", "words_learned", "is_active", "created_at"]
        read_only_fields = ["id", "total_stars", "total_xp", "current_streak",
                           "longest_streak", "last_played", "total_play_minutes",
                           "words_learned", "created_at"]

    def validate(self, data):
        request = self.context.get("request")
        if request and not self.instance:  # Creating new child
            parent = request.user
            if not parent.can_add_child():
                raise serializers.ValidationError(f"الحد الأقصى {parent.children.count()}/4 أطفال")
        return data


class ChildDashboardSerializer(serializers.ModelSerializer):
    """Lightweight serializer for parent dashboard"""
    level_display = serializers.CharField(source="get_current_level_display", read_only=True)

    class Meta:
        model = Child
        fields = ["id", "name", "avatar_emoji", "current_level", "level_display",
                  "total_stars", "current_streak", "last_played", "words_learned"]
