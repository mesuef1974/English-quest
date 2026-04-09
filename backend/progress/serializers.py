from rest_framework import serializers
from .models import CategoryProgress, GameSession, DailyStreak


class CategoryProgressSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name_ar", read_only=True)
    category_emoji = serializers.CharField(source="category.emoji", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)

    class Meta:
        model = CategoryProgress
        fields = ["id", "category_slug", "category_name", "category_emoji",
                  "level", "stars", "best_score", "total_questions", "attempts", "completed_at"]


class SubmitScoreSerializer(serializers.Serializer):
    """API input for submitting a game result"""
    child_id = serializers.IntegerField()
    category_slug = serializers.SlugField()
    level = serializers.ChoiceField(choices=["L1", "L2", "L3"])
    game_mode = serializers.ChoiceField(choices=["quiz", "match", "spell", "listen"])
    score = serializers.IntegerField(min_value=0)
    total_questions = serializers.IntegerField(min_value=1)
    duration_seconds = serializers.IntegerField(min_value=0, default=0)


class GameSessionSerializer(serializers.ModelSerializer):
    category_emoji = serializers.CharField(source="category.emoji", read_only=True)

    class Meta:
        model = GameSession
        fields = ["id", "category_emoji", "level", "game_mode", "score",
                  "total_questions", "stars_earned", "duration_seconds", "played_at"]


class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = ["date", "minutes_played", "sessions_count", "stars_earned"]
