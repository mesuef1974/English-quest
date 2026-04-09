from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from accounts.models import Child
from learning.models import Category
from .models import CategoryProgress, GameSession, DailyStreak
from .serializers import (
    CategoryProgressSerializer, SubmitScoreSerializer,
    GameSessionSerializer, DailyStreakSerializer,
)


@api_view(["POST"])
def submit_score(request):
    """
    POST /api/progress/submit/ — إرسال نتيجة جلسة لعب
    
    This is the CORE endpoint — called after every game round.
    Updates: CategoryProgress, GameSession, DailyStreak, Child stats.
    """
    serializer = SubmitScoreSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # Verify child belongs to parent
    child = get_object_or_404(Child, id=data["child_id"], parent=request.user, is_active=True)
    category = get_object_or_404(Category, slug=data["category_slug"])

    score = data["score"]
    total = data["total_questions"]
    pct = score / total if total > 0 else 0
    stars = 3 if pct >= 0.9 else 2 if pct >= 0.6 else 1 if pct >= 0.3 else 0

    # 1. Update CategoryProgress
    cp, created = CategoryProgress.objects.get_or_create(
        child=child, category=category, level=data["level"],
        defaults={"stars": stars, "best_score": score, "total_questions": total, "attempts": 1}
    )
    if not created:
        cp.attempts += 1
        if score > cp.best_score:
            cp.best_score = score
        if stars > cp.stars:
            cp.stars = stars
        if not cp.completed_at and pct >= 0.6:
            cp.completed_at = timezone.now()
        cp.save()
    elif pct >= 0.6:
        cp.completed_at = timezone.now()
        cp.save()

    # 2. Create GameSession
    session = GameSession.objects.create(
        child=child, category=category, level=data["level"],
        game_mode=data["game_mode"], score=score, total_questions=total,
        stars_earned=stars, duration_seconds=data.get("duration_seconds", 0),
    )

    # 3. Update DailyStreak
    today = timezone.localdate()
    streak, _ = DailyStreak.objects.get_or_create(child=child, date=today)
    streak.sessions_count += 1
    streak.stars_earned += stars
    streak.minutes_played += data.get("duration_seconds", 0) // 60
    streak.save()

    # 4. Update Child stats
    child.total_stars = CategoryProgress.objects.filter(child=child).aggregate(
        total=models.Sum("stars"))["total"] or 0
    child.total_xp += score * 10
    child.last_played = timezone.now()
    child.total_play_minutes += data.get("duration_seconds", 0) // 60

    # Update streak
    yesterday = today - timezone.timedelta(days=1)
    if DailyStreak.objects.filter(child=child, date=yesterday).exists():
        child.current_streak += 1
    elif not DailyStreak.objects.filter(child=child, date=today, sessions_count__gt=1).exists():
        child.current_streak = 1
    child.longest_streak = max(child.longest_streak, child.current_streak)

    # Count words learned (unique categories × levels completed)
    child.words_learned = CategoryProgress.objects.filter(child=child, stars__gte=1).count() * 6
    child.save()

    return Response({
        "message": "تم حفظ النتيجة!",
        "stars_earned": stars,
        "total_stars": child.total_stars,
        "current_streak": child.current_streak,
        "is_new_best": score >= cp.best_score,
        "session_id": session.id,
    }, status=status.HTTP_201_CREATED)


from django.db import models as db_models

@api_view(["GET"])
def child_progress(request, child_id):
    """GET /api/progress/<child_id>/ — تقدم الطفل الكامل"""
    child = get_object_or_404(Child, id=child_id, parent=request.user)
    progress = CategoryProgress.objects.filter(child=child).select_related("category")

    return Response({
        "child": {"id": child.id, "name": child.name, "avatar": child.avatar_emoji,
                  "total_stars": child.total_stars, "current_streak": child.current_streak,
                  "words_learned": child.words_learned, "total_xp": child.total_xp},
        "progress": CategoryProgressSerializer(progress, many=True).data,
        "recent_sessions": GameSessionSerializer(
            GameSession.objects.filter(child=child)[:10], many=True).data,
        "streak_history": DailyStreakSerializer(
            DailyStreak.objects.filter(child=child)[:30], many=True).data,
    })


@api_view(["GET"])
def leaderboard(request, child_id):
    """GET /api/progress/<child_id>/leaderboard/ — لوحة المتصدرين"""
    child = get_object_or_404(Child, id=child_id, parent=request.user)
    # For now: children under same parent
    siblings = Child.objects.filter(parent=request.user, is_active=True).order_by("-total_stars")
    return Response([{
        "id": c.id, "name": c.name, "avatar": c.avatar_emoji,
        "total_stars": c.total_stars, "current_streak": c.current_streak,
        "is_current": c.id == child.id,
    } for c in siblings])
