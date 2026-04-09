"""
progress/models.py — Stars, streaks, session tracking
"""
from django.db import models
from django.utils import timezone
from accounts.models import Child
from learning.models import Category


class CategoryProgress(models.Model):
    """تقدم الطفل في فئة + مستوى معين"""
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="progress", verbose_name="الطفل")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="الفئة")
    level = models.CharField("المستوى", max_length=2, choices=[("L1","مبتدئ"),("L2","متوسط"),("L3","متقدم")])
    stars = models.PositiveIntegerField("النجوم", default=0, help_text="0-3")
    best_score = models.PositiveIntegerField("أفضل نتيجة", default=0)
    total_questions = models.PositiveIntegerField("إجمالي الأسئلة", default=0)
    attempts = models.PositiveIntegerField("عدد المحاولات", default=0)
    completed_at = models.DateTimeField("تاريخ أول إكمال", null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "تقدم فئة"
        verbose_name_plural = "تقدم الفئات"
        unique_together = ["child", "category", "level"]

    def __str__(self):
        return f"{self.child.name} | {self.category.emoji} {self.category.name_ar} [{self.level}] ⭐{self.stars}"


class GameSession(models.Model):
    """جلسة لعب واحدة"""
    MODE_CHOICES = [("quiz","اختبار"),("match","توصيل"),("spell","تهجئة"),("listen","استمع")]

    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="sessions", verbose_name="الطفل")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="الفئة")
    level = models.CharField("المستوى", max_length=2)
    game_mode = models.CharField("نمط اللعب", max_length=10, choices=MODE_CHOICES)
    score = models.PositiveIntegerField("النتيجة", default=0)
    total_questions = models.PositiveIntegerField("عدد الأسئلة", default=0)
    stars_earned = models.PositiveIntegerField("النجوم المكتسبة", default=0)
    duration_seconds = models.PositiveIntegerField("المدة (ثوانٍ)", default=0)
    played_at = models.DateTimeField("وقت اللعب", auto_now_add=True)

    class Meta:
        verbose_name = "جلسة لعب"
        verbose_name_plural = "جلسات اللعب"
        ordering = ["-played_at"]

    def __str__(self):
        return f"{self.child.name} | {self.category.emoji} [{self.level}] {self.score}/{self.total_questions}"


class DailyStreak(models.Model):
    """سجل يومي للسلسلة"""
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="streaks")
    date = models.DateField("التاريخ")
    minutes_played = models.PositiveIntegerField("الدقائق", default=0)
    sessions_count = models.PositiveIntegerField("عدد الجلسات", default=0)
    stars_earned = models.PositiveIntegerField("النجوم", default=0)

    class Meta:
        unique_together = ["child", "date"]
        ordering = ["-date"]
