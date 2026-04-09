from django.contrib import admin
from .models import CategoryProgress, GameSession, DailyStreak

@admin.register(CategoryProgress)
class CategoryProgressAdmin(admin.ModelAdmin):
    list_display = ["child", "category", "level", "stars", "best_score", "attempts", "completed_at"]
    list_filter = ["level", "stars", "category"]

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ["child", "category", "level", "game_mode", "score", "total_questions", "stars_earned", "played_at"]
    list_filter = ["game_mode", "level"]

@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ["child", "date", "minutes_played", "sessions_count", "stars_earned"]
